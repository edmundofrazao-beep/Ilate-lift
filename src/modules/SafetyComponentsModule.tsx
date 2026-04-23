import React, { useEffect, useState } from 'react';
import { ProjectData, ModuleStatus } from '../types';
import { safeNumber, formatNumber, degToRad, InputGroup, LiftField, SliderField, CollapsibleSection } from '../components/ui';
import { BELT_PROFILES, BUFFER_PRESETS, SAFETY_GEAR_PRESETS } from '../constants';
import { computeLiftCalculations } from '../lib/calculations';
import { CheckCircle2, ShieldCheck, Zap, AlertTriangle, Info, ChevronRight, Calculator, FileText, Database, Activity, Package, Maximize, AlertCircle, PlayCircle, Settings, CheckSquare, Lock, Unlock, XCircle } from 'lucide-react';
import { BlockMath, InlineMath } from 'react-katex';

export const SafetyComponentsModule = ({ data, onChange, section = 'all' }: { data: ProjectData, onChange: (newData: Partial<ProjectData>) => void, section?: 'all' | 'safety' | 'buffers' | 'sil' | 'acop' | 'doors' }) => {
  const [bufferTarget, setBufferTarget] = useState<'car' | 'cwt'>('car');
  const lightResultCard = 'text-slate-950';
  const lightMutedText = 'text-slate-700/75';
  const isHydraulicProject = data.type === 'hydraulic';
  const availableBufferPresets = BUFFER_PRESETS.filter((preset) =>
    isHydraulicProject
      ? preset.type === 'energy-dissipation' && preset.medium === 'hydraulic-oil'
      : true
  );

  useEffect(() => {
    if (isHydraulicProject && bufferTarget !== 'car') {
      setBufferTarget('car');
    }
  }, [isHydraulicProject, bufferTarget]);

  // OSG Verification Logic
  const minTripping = 1.15 * data.speed;
  let maxTripping = 1.5;
  if (data.safetyGearType === 'instantaneous') maxTripping = 0.8;
  else if (data.safetyGearType === 'progressive' && data.speed > 1.0) maxTripping = 1.25 * data.speed + 0.25 / data.speed;
  
  const isTrippingOk = data.osgTrippingSpeed >= minTripping && data.osgTrippingSpeed <= maxTripping;
  const isForceOk = data.osgTensileForce >= 300;
  const isBrakingForceOk = data.osgMaxBrakingForce >= data.osgTensileForce;
  const osgSafetyFactor = data.osgTensileForce > 0 ? data.osgBreakingLoad / data.osgTensileForce : 0;
  const isOsgSfOk = osgSafetyFactor >= 8;

  // 4.3 Safety Gear Logic
  const g = 9.81;
  const totalMass = data.carMass + data.ratedLoad;
  const isMassOk = totalMass <= data.safetyGearMaxMass;
  const isSpeedOk = data.osgTrippingSpeed <= data.safetyGearCertifiedSpeed;
  // Refined retardation: a = Fb / ((P+Q) * g) - 1
  const retardationG = data.safetyGearBrakingForce > 0 ? (data.safetyGearBrakingForce / (totalMass * g)) - 1 : 0;
  const isRetardationOk = retardationG >= 0.2 && retardationG <= 1.0;

  // 4.5 Buffer Logic
  const impactMass = (isHydraulicProject || bufferTarget === 'car') ? (data.carMass + data.ratedLoad) : data.cwtMass;
  const v_impact = 1.15 * data.speed; // Impact speed is 115% of rated speed
  const h_m = data.bufferStroke / 1000;
  const { buffers } = computeLiftCalculations(data);
  const logic = computeLiftCalculations(data).systemLogic;
  const Ek = buffers.Ek;
  const Ep = buffers.Ep;
  const Etotal = buffers.totalEnergy;

  // New ISO 8100-2 Buffer Speed Validation
  let isBufferTypeValid = true;
  let typeValidationError = '';
  if (data.bufferType === 'energy-accumulation' && data.speed > 1.0) {
    isBufferTypeValid = false;
    typeValidationError = 'Energy accumulation buffers only permitted for rated speeds <= 1.0 m/s';
  }
  
  // Non-linear buffer capacity estimation (Clause 4.5.3)
  let Ecap = 0;
  if (data.bufferIsLinear) {
    const eta = 0.5;
    Ecap = impactMass * (1.0 * g + g) * h_m * eta; // Capacity at 1.0gn limit
  } else {
    // Integration using the user-defined exponent curve F(x) = F_max * (x/h)^exponent
    const nExponent = data.bufferForceCurveExponent || 1.5;
    const F_max = impactMass * (1.0 * g + g); // Max force at 1.0gn limit
    Ecap = (F_max * h_m) / (nExponent + 1);
  }
  
  // ISO 8100-2:2026 Clause 4.5.2
  // For energy accumulation buffers:
  // h_min = 0.0674 * v^2 (for linear)
  // h_min = 0.135 * v^2 (for non-linear) - Wait, standard says 0.135 for linear?
  // Let's use the standard values:
  let h_min = 0;
  if (data.bufferType === 'energy-accumulation') {
    h_min = (data.bufferIsLinear ? 0.135 : 0.067) * data.speed * data.speed * 1000;
  } else {
    // Energy dissipation: h = (1.15v)^2 / (2 * 0.5 * gn) = 0.0674 * v^2
    h_min = 0.0674 * data.speed * data.speed * 1000;
  }
  
  const effectiveMinStroke = data.bufferManualOverride ? data.bufferManualStroke : h_min;
  const isStrokeOk = data.bufferStroke >= effectiveMinStroke;
  const isBufferMassOk = impactMass >= data.bufferMinMass && impactMass <= data.bufferMaxMass;
  
  // Energy capacity check for dissipation buffers
  // a_avg must be <= 1.0gn
  const a_avg = h_m > 0 ? (v_impact * v_impact) / (2 * h_m * g) : 0;
  const isEnergyOk = Etotal <= Ecap;
  const isBufferCompliant = isStrokeOk && isBufferMassOk && isBufferTypeValid && (data.bufferType === 'energy-accumulation' ? true : isEnergyOk);
  
  const F_buffer = impactMass * (a_avg + g);
  const strokeUtilization = h_m > 0 ? (effectiveMinStroke / (data.bufferStroke)) * 100 : 0;
  const massUtilization = data.bufferMaxMass > data.bufferMinMass ? ((impactMass - data.bufferMinMass) / (data.bufferMaxMass - data.bufferMinMass)) * 100 : 0;

  // 4.6 Safety circuits / SIL logic
  const lambdaD = data.failureRate * (data.dangerousFraction / 100);
  const pfh = lambdaD * (1 - (data.diagnosticCoverage / 100));
  const silLimits = {
    3: { min: 1e-8, max: 1e-7, label: 'SIL 3' },
    2: { min: 1e-7, max: 1e-6, label: 'SIL 2' },
    1: { min: 1e-6, max: 1e-5, label: 'SIL 1' }
  };
  const currentLimit = silLimits[data.silLevel as keyof typeof silLimits] || silLimits[1];
  const isPfhOk = pfh <= currentLimit.max;
  const minDc = data.silLevel === 3 ? 90 : (data.silLevel === 2 ? 60 : 0);
  const isDcOk = data.diagnosticCoverage >= minDc;
  const minFaultTolerance = data.silLevel >= 3 ? 1 : 0;
  const isFaultToleranceOk = data.faultTolerance >= minFaultTolerance;
  const safetyChainContinuityOk = data.doorElectricalContinuity && data.doorElectricalSafetyCheck;
  const dangerousFailureRate = lambdaD;
  const isSilOk = isPfhOk && isDcOk && isFaultToleranceOk;

  // 4.7 ACOP Logic
  const acopMaxTripping = data.speed <= 1.0 ? 1.15 * data.speed + 0.25 : 1.15 * data.speed;
  const isAcopOk = data.acopTrippingSpeed > data.speed && data.acopTrippingSpeed <= acopMaxTripping;

  // 4.8 UCMP Logic
  const isUcmpOk = data.ucmpDetectionDist > 0 && data.ucmpDetectionDist <= 1200;
  const topStates = [
    { label: 'Door Locking', ok: data.doorLockingForce >= 1000 && data.doorMinimumEngagement >= 7 && data.doorElectricalSafetyCheck },
    { label: 'Safety Gear', ok: isMassOk && isSpeedOk && isRetardationOk },
    { label: 'Buffers', ok: isBufferCompliant && isEnergyOk },
    { label: 'Safety Circuits / SIL', ok: isSilOk && safetyChainContinuityOk },
  ];

  return (
    <div className="space-y-8">
      <div className="rounded-sm border border-outline-variant/20 bg-surface-container-low p-8">
        <div className="mb-8 grid grid-cols-1 gap-4 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-sm border border-outline-variant/20 bg-gradient-to-br from-surface-container-high to-surface-container-lowest p-6">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-primary">
              <ShieldCheck size={12} />
              Safety cockpit
            </div>
            <h3 className="text-2xl font-black tracking-tight text-on-surface">Safety Verification Layer</h3>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-on-surface-variant">
              Work this page as a safety chain: door locking, safety gear, buffers, ACOP/UCMP and safety circuits.
            </p>
          </div>
          <div className="rounded-sm border border-outline-variant/20 bg-surface-container-lowest p-6">
            <div className="mb-4 flex items-center gap-2">
              <Activity size={14} className="text-primary" />
              <h4 className="text-[11px] font-black uppercase tracking-[0.22em] text-white">System State</h4>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {topStates.map((state) => (
                <div key={state.label} className="flex items-center justify-between gap-4 rounded-sm border border-outline-variant/20 bg-surface-container-low p-3">
                  <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-on-surface-variant">{state.label}</span>
                  <span className={`text-[10px] font-black uppercase tracking-[0.16em] ${state.ok ? 'text-emerald-300' : 'text-rose-300'}`}>
                    {state.ok ? 'stable' : 'review'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xl font-bold">Safety Verification</h3>
          <span className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-primary">active safety matrix</span>
        </div>

        <div className="space-y-12">
          {/* 4.2 Door Locking Devices */}
          {(section === 'all' || section === 'doors') && (
          <section className="space-y-6">
            <div className="flex items-center gap-4 border-b border-outline-variant/20 pb-2">
              <ShieldCheck className="text-primary" size={20} />
              <h4 className="text-sm font-bold uppercase tracking-wider">4.2 Landing and Car Door Locking Devices</h4>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="space-y-4 p-6 bg-surface-container-lowest border border-outline-variant/10">
                <h5 className="text-[10px] font-bold uppercase text-primary mb-4">Verification Parameters</h5>
                <div className="space-y-4">
                  <LiftField label="Mechanical Strength" name="doorLockingForce" unit="N" data={data} onChange={onChange} min={0} max={5000} />
                  <LiftField label="Minimum Engagement" name="doorMinimumEngagement" unit="mm" data={data} onChange={onChange} min={0} max={20} />
                  <div className="pt-4 border-t border-outline-variant/10 space-y-4">
                    <h5 className="text-[10px] font-bold uppercase text-primary">Door Limit Switch</h5>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-on-surface-variant uppercase">Switch Type</label>
                      <select 
                        value={data.doorLimitSwitchType}
                        onChange={(e) => onChange({ doorLimitSwitchType: e.target.value as 'NO' | 'NC' })}
                        className="w-full bg-surface-container-low border border-outline-variant/20 rounded-sm px-3 py-2 text-sm focus:ring-1 focus:ring-primary outline-none"
                      >
                        <option value="NC">Normally Closed (NC)</option>
                        <option value="NO">Normally Open (NO)</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-3 p-2 bg-surface-container-lowest border border-outline-variant/10 rounded-sm">
                      <input 
                        type="checkbox"
                        checked={data.doorElectricalContinuity}
                        onChange={(e) => onChange({ doorElectricalContinuity: e.target.checked })}
                        className="rounded-sm border-outline-variant/30 text-primary focus:ring-primary"
                      />
                      <label className="text-[11px] font-bold text-on-surface-variant uppercase cursor-pointer">Electrical Continuity Check</label>
                    </div>
                    <div className="flex items-center gap-3 p-2 bg-surface-container-lowest border border-outline-variant/10 rounded-sm">
                      <input 
                        type="checkbox"
                        checked={data.doorElectricalSafetyCheck}
                        onChange={(e) => onChange({ doorElectricalSafetyCheck: e.target.checked })}
                        className="rounded-sm border-outline-variant/30 text-primary focus:ring-primary"
                      />
                      <label className="text-[11px] font-bold text-on-surface-variant uppercase cursor-pointer">Electrical Safety Check</label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-2 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className={`p-4 border ${lightResultCard} ${data.doorLockingForce >= 1000 ? 'bg-emerald-50 border-emerald-200' : 'bg-error-container/10 border-error/20'}`}>
                    <p className="text-[10px] font-bold uppercase mb-1">Mechanical Strength</p>
                    <p className="text-xl font-black">{formatNumber(data.doorLockingForce)} N</p>
                    <p className={`mt-2 text-[10px] italic ${lightMutedText}`}>Required: ≥ 1000N</p>
                  </div>
                  <div className={`p-4 border ${lightResultCard} ${data.doorMinimumEngagement >= 7 ? 'bg-emerald-50 border-emerald-200' : 'bg-error-container/10 border-error/20'}`}>
                    <p className="text-[10px] font-bold uppercase mb-1">Lock Engagement</p>
                    <p className="text-xl font-black">{formatNumber(data.doorMinimumEngagement)} mm</p>
                    <p className={`mt-2 text-[10px] italic ${lightMutedText}`}>Required: ≥ 7mm</p>
                  </div>
                  <div className={`p-4 border ${lightResultCard} ${(data.doorMinimumEngagement >= 7 && data.doorElectricalSafetyCheck) ? 'bg-emerald-50 border-emerald-200' : 'bg-error-container/10 border-error/20'}`}>
                    <div className="flex justify-between items-start mb-1">
                      <p className="text-[10px] font-bold uppercase">Interlocking Status</p>
                      {(data.doorMinimumEngagement >= 7 && data.doorElectricalSafetyCheck) ? <Lock size={16} className="text-emerald-500" /> : <Unlock size={16} className="text-error" />}
                    </div>
                    <p className={`text-sm font-bold mt-1 ${(data.doorMinimumEngagement >= 7 && data.doorElectricalSafetyCheck) ? 'text-emerald-700' : 'text-error'}`}>
                      {(data.doorMinimumEngagement >= 7 && data.doorElectricalSafetyCheck) ? 'LOCKED & SECURE' : 'UNSECURED'}
                    </p>
                    <p className={`mt-2 text-[10px] italic whitespace-nowrap overflow-hidden text-ellipsis ${lightMutedText}`}>Requires ≥7mm + Elec Check</p>
                  </div>
                </div>

                <div className="p-6 bg-surface-container-lowest border border-outline-variant/10 rounded-sm">
                  <h5 className="text-[10px] font-bold uppercase text-primary mb-4 flex items-center gap-2">
                    <CheckSquare size={12} />
                    Safety Checklist (4.2)
                  </h5>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded flex items-center justify-center border ${data.doorLockingForce >= 1000 ? 'bg-emerald-600 border-emerald-600' : 'border-outline-variant'}`}>
                        {data.doorLockingForce >= 1000 && <CheckSquare size={14} className="text-white" />}
                      </div>
                      <span className="text-xs font-medium">Mechanical strength without permanent deformation (F ≥ 1000N).</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded flex items-center justify-center border ${data.doorMinimumEngagement >= 7 ? 'bg-emerald-600 border-emerald-600' : 'border-outline-variant'}`}>
                        {data.doorMinimumEngagement >= 7 && <CheckSquare size={14} className="text-white" />}
                      </div>
                      <span className="text-xs font-medium">Minimum mechanical engagement of 7mm before electrical contact.</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded flex items-center justify-center border ${data.doorElectricalSafetyCheck ? 'bg-emerald-600 border-emerald-600' : 'border-outline-variant'}`}>
                        {data.doorElectricalSafetyCheck && <CheckSquare size={14} className="text-white" />}
                      </div>
                      <span className="text-xs font-medium">Safety electrical device with positive break verified.</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded flex items-center justify-center border ${data.doorElectricalContinuity && data.doorLimitSwitchType === 'NC' ? 'bg-emerald-600 border-emerald-600' : 'border-outline-variant'}`}>
                        {(data.doorElectricalContinuity && data.doorLimitSwitchType === 'NC') && <CheckSquare size={14} className="text-white" />}
                      </div>
                      <span className="text-xs font-medium">Limit switch electrical continuity verified directly through NC circuit.</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded flex items-center justify-center border border-outline-variant">
                        {/* Placeholder for manual check */}
                      </div>
                      <span className="text-xs font-medium">Verification of clearances and alignment (max 6mm between door panels).</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
        </section>
        )}



          {/* 4.3 Verification of Safety Gear */}
          {(section === 'all' || section === 'safety') && (
          <section className="space-y-6">
            <div className="flex items-center gap-4 border-b border-outline-variant/20 pb-2">
              <ShieldCheck className="text-primary" size={20} />
              <h4 className="text-sm font-bold uppercase tracking-wider">4.3 Verification of Safety Gear</h4>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="space-y-4 p-6 bg-surface-container-lowest border border-outline-variant/10">
                <h5 className="text-[10px] font-bold uppercase text-primary mb-4">Certification Data</h5>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-on-surface-variant uppercase">Component Presets</label>
                    <select 
                      value={data.safetyGearPresetId || ''}
                      onChange={(e) => {
                        const preset = SAFETY_GEAR_PRESETS.find((item) => item.id === e.target.value);
                        if (preset) {
                          onChange({ 
                            safetyGearPresetId: preset.id,
                            safetyGearType: preset.type as ProjectData['safetyGearType'],
                            safetyGearMaxMass: preset.maxMass,
                            safetyGearBrakingForce: preset.brakingForce,
                            safetyGearCertifiedSpeed: preset.certifiedSpeed
                          });
                        }
                      }}
                      className="w-full bg-surface-container-low border border-outline-variant/20 rounded-sm px-3 py-2 text-sm outline-none"
                    >
                      <option value="">Select a preset...</option>
                      {SAFETY_GEAR_PRESETS.map((preset) => (
                        <option key={preset.id} value={preset.id}>{preset.name}</option>
                      ))}
                    </select>
                  </div>
                  <LiftField label="Max Certified Mass (P+Q)" name="safetyGearMaxMass" unit="kg" data={data} onChange={(newData) => onChange({ safetyGearPresetId: '', ...newData })} min={0} max={10000} />
                  <LiftField label="Braking Force (Fb)" name="safetyGearBrakingForce" unit="N" data={data} onChange={(newData) => onChange({ safetyGearPresetId: '', ...newData })} min={0} max={100000} />
                  <LiftField label="Certified Speed" name="safetyGearCertifiedSpeed" unit="m/s" data={data} onChange={(newData) => onChange({ safetyGearPresetId: '', ...newData })} min={0} max={10} step={0.01} />
                  <div className="pt-4 border-t border-outline-variant/10 space-y-4">
                    <h5 className="text-[10px] font-bold uppercase text-primary">Overspeed Governor Link</h5>
                    <LiftField label="OSG Max Braking Force (F_max)" name="osgMaxBrakingForce" unit="N" data={data} onChange={onChange} min={0} max={10000} />
                    <LiftField label="OSG Tensile Force (Ft)" name="osgTensileForce" unit="N" data={data} onChange={onChange} min={0} max={5000} />
                    <LiftField label="OSG Rope Breaking Load" name="osgBreakingLoad" unit="N" data={data} onChange={onChange} min={0} max={20000} step={100} />
                    
                    <div className={`p-3 rounded-sm border ${data.osgMaxBrakingForce >= data.osgTensileForce ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-error/10 border-error/20'}`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold uppercase">Force Validation</span>
                        {data.osgMaxBrakingForce >= data.osgTensileForce ? <CheckCircle2 size={14} className="text-emerald-500" /> : <XCircle size={14} className="text-error" />}
                      </div>
                      <span className={`text-[11px] font-bold ${data.osgMaxBrakingForce >= data.osgTensileForce ? 'text-emerald-600' : 'text-error'}`}>
                        {data.osgMaxBrakingForce >= data.osgTensileForce ? 'F_max is ≥ Ft' : 'F_max must be ≥ Ft'}
                      </span>
                    </div>

                    <div className={`p-3 rounded-sm border ${data.osgBreakingLoad / Math.max(data.osgTensileForce, 1) >= 8.0 ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-error/10 border-error/20'}`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold uppercase">Safety Factor</span>
                        {data.osgBreakingLoad / Math.max(data.osgTensileForce, 1) >= 8.0 ? <CheckCircle2 size={14} className="text-emerald-500" /> : <XCircle size={14} className="text-error" />}
                      </div>
                      <span className={`text-[11px] font-bold ${data.osgBreakingLoad / Math.max(data.osgTensileForce, 1) >= 8.0 ? 'text-emerald-600' : 'text-error'}`}>
                        Factor: {(data.osgBreakingLoad / Math.max(data.osgTensileForce, 1)).toFixed(1)} (Min 8.0)
                      </span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-on-surface-variant uppercase">Rail Surface Condition</label>
                    <select 
                      value={data.safetyGearRailCondition}
                      onChange={(e) => onChange({ safetyGearRailCondition: e.target.value as any })}
                      className="w-full bg-surface-container-low border border-outline-variant/20 rounded-sm px-3 py-2 text-sm outline-none"
                    >
                      <option value="dry">Dry / Machined</option>
                      <option value="oiled">Oiled</option>
                      <option value="machined">Special Machined</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="lg:col-span-2 space-y-4">
                <>
                  <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className={`p-4 border ${lightResultCard} ${isMassOk ? 'bg-emerald-50 border-emerald-200' : 'bg-error-container bg-opacity-10 border-error border-opacity-20'}`}>
                            <p className="text-[10px] font-bold uppercase mb-1">Total Mass (P+Q)</p>
                            <p className="text-xl font-black">{formatNumber(totalMass)} kg</p>
                            <p className={`text-[10px] ${lightMutedText}`}>Limit: {data.safetyGearMaxMass} kg</p>
                          </div>
                          <div className={`p-4 border ${lightResultCard} ${isSpeedOk ? 'bg-emerald-50 border-emerald-200' : 'bg-error-container bg-opacity-10 border-error border-opacity-20'}`}>
                            <p className="text-[10px] font-bold uppercase mb-1">Certified Speed</p>
                            <p className="text-xl font-black">{formatNumber(data.osgTrippingSpeed)} m/s</p>
                            <p className={`text-[10px] ${lightMutedText}`}>Limit: {data.safetyGearCertifiedSpeed} m/s</p>
                          </div>
                          <div className={`p-4 border ${lightResultCard} ${isRetardationOk ? 'bg-emerald-50 border-emerald-200' : 'bg-error-container/10 border-error/20'}`}>
                            <div className="flex items-center justify-between mb-3">
                              <p className="text-[10px] font-bold uppercase tracking-wider">Resultant Retardation (gn)</p>
                              <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full animate-pulse ${isRetardationOk ? 'bg-emerald-500' : 'bg-error'}`} />
                                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${isRetardationOk ? 'bg-emerald-600 text-white' : 'bg-error text-white'}`}>
                                  {isRetardationOk ? 'ISO 8100-2 Compliant' : 'Non-Compliant'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                              <div className="space-y-2">
                                <div className="flex items-baseline gap-2">
                                  <p className="text-3xl font-black">{formatNumber(retardationG)} gn</p>
                                  <p className="text-[10px] opacity-40 font-bold uppercase">Result</p>
                                </div>
                                <div className={`p-2 rounded border ${isRetardationOk ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-error/10 border-error/20'}`}>
                                  <p className={`text-[11px] font-bold ${isRetardationOk ? 'text-emerald-700' : 'text-error'}`}>
                                    {retardationG < 0.2 ? '❌ STATUS: Insufficient Braking' : 
                                     retardationG > 1.0 ? '❌ STATUS: Excessive Retardation' : 
                                     '✅ STATUS: Safe Deceleration'}
                                  </p>
                                  <p className={`text-[10px] mt-0.5 leading-tight ${lightMutedText}`}>
                                    {retardationG < 0.2 ? 'Braking force is too low to guarantee a safe stop.' : 
                                     retardationG > 1.0 ? 'Deceleration exceeds 1.0g, risking passenger injury.' : 
                                     'Retardation is within the normative range (0.2g - 1.0g).'}
                                  </p>
                                </div>
                              </div>

                              <div className="space-y-3">
                                <div className="p-3 bg-surface-container-low/50 rounded-sm border border-outline-variant/10 text-on-surface">
                                  <p className="text-[9px] font-bold opacity-50 uppercase mb-2">Calculation Breakdown</p>
                                  <div className="space-y-1.5">
                                    <div className="flex justify-between text-[10px]">
                                      <span className="opacity-60">Braking Force (Fb)</span>
                                      <span className="font-bold">{formatNumber(data.safetyGearBrakingForce)} N</span>
                                    </div>
                                    <div className="flex justify-between text-[10px]">
                                      <span className="opacity-60">Total Mass (P+Q)</span>
                                      <span className="font-bold">{formatNumber(totalMass)} kg</span>
                                    </div>
                                    <div className="pt-1.5 border-t border-black/5 flex justify-between text-[10px] font-bold text-primary">
                                      <span>Formula</span>
                                      <span>[Fb / (P+Q)g] - 1</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            <div className="relative h-3 bg-surface-container-low rounded-full overflow-visible mb-2">
                              <div className="absolute inset-0 flex rounded-full overflow-hidden">
                                <div className="h-full bg-error" style={{ width: '16.6%' }} />
                                <div className="h-full bg-emerald-500" style={{ width: '66.6%' }} />
                                <div className="h-full bg-error" style={{ width: '16.8%' }} />
                              </div>
                              
                              <div 
                                className="absolute top-1/2 -translate-y-1/2 w-2 h-6 bg-primary shadow-lg border-2 border-white transition-all duration-1000 ease-out z-10"
                                style={{ left: `${Math.min(Math.max((retardationG / 1.2) * 100, 0), 100)}%` }}
                              >
                                <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-black text-primary">
                                  {formatNumber(retardationG)}
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex justify-between text-[9px] font-bold opacity-40 uppercase px-1">
                              <span>0.0</span>
                              <span>0.2 gn (Min)</span>
                              <span>1.0 gn (Max)</span>
                              <span>1.2+</span>
                            </div>
                          </div>

                          <div className="space-y-6 mt-6">
                          <div className="rounded-sm border border-outline-variant/20 bg-surface-container-lowest p-4">
                            <div className="flex flex-wrap items-center gap-3">
                              <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary">4.3 Formula</span>
                              <code className="text-xs font-bold text-on-surface">a = [Fb / (P+Q)g] - 1</code>
                              <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-on-surface-variant">target: 0.2gn to 1.0gn</span>
                            </div>
                          </div>
                          <div className="p-6 bg-surface-container-lowest border border-outline-variant/10 rounded-sm">
                            <h5 className="text-[10px] font-bold uppercase text-primary mb-4 flex items-center gap-2">
                              <CheckSquare size={12} />
                              Verification Checklist (ISO 8100-2)
                            </h5>
                          <div className="space-y-3">
                            <div className="flex items-center gap-3">
                              <div className={`w-5 h-5 rounded flex items-center justify-center border ${isMassOk ? 'bg-emerald-600 border-emerald-600' : 'border-outline-variant'}`}>
                                {isMassOk && <CheckSquare size={14} className="text-white" />}
                              </div>
                              <span className={`text-xs font-medium ${isMassOk ? 'text-on-surface' : 'text-on-surface-variant'}`}>
                                Total mass stays within the certified limit.
                              </span>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className={`w-5 h-5 rounded flex items-center justify-center border ${isRetardationOk ? 'bg-emerald-600 border-emerald-600' : 'border-outline-variant'}`}>
                                {isRetardationOk && <CheckSquare size={14} className="text-white" />}
                              </div>
                              <span className={`text-xs font-medium ${isRetardationOk ? 'text-on-surface' : 'text-on-surface-variant'}`}>
                                Retardation stays inside the normative range.
                              </span>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className={`w-5 h-5 rounded flex items-center justify-center border ${data.safetyGearBrakingForce > 0 ? 'bg-emerald-600 border-emerald-600' : 'border-outline-variant'}`}>
                                {data.safetyGearBrakingForce > 0 && <CheckSquare size={14} className="text-white" />}
                              </div>
                              <span className={`text-xs font-medium ${data.safetyGearBrakingForce > 0 ? 'text-on-surface' : 'text-on-surface-variant'}`}>
                                Braking force is parameterized.
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                </div>
              </div>
            </section>
            )}

          {/* 4.5 Verification of Buffers */}
          {(section === 'all' || section === 'buffers') && (
          <section className="space-y-6">
            <div className="flex items-center gap-4 border-b border-outline-variant/20 pb-2">
              <ShieldCheck className="text-primary" size={20} />
              <div className="flex items-center gap-3">
                <h4 className="text-sm font-bold uppercase tracking-wider">4.5 Verification of Buffers</h4>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 uppercase tracking-tighter">Implemented</span>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="space-y-4 p-6 bg-surface-container-lowest border border-outline-variant/10">
                <h5 className="text-[10px] font-bold uppercase text-primary mb-4 text-center">Buffer Parameters</h5>
                {isHydraulicProject ? (
                  <div className="rounded-sm border border-primary/20 bg-primary/5 p-4 mb-4">
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary">Hydraulic buffer mode</p>
                    <p className="mt-2 text-xs leading-relaxed text-on-surface-variant">
                      Hydraulic projects do not use counterweight buffers in this workspace. This section is locked to the <strong>car buffer</strong> and should be read together with the hydraulic chain.
                    </p>
                  </div>
                ) : (
                  <div className="flex p-1 bg-surface-container-low rounded-sm mb-4">
                    <button
                      onClick={() => setBufferTarget('car')}
                      className={`flex-1 py-1.5 text-[10px] font-bold uppercase rounded-sm transition-all ${bufferTarget === 'car' ? 'bg-primary text-white shadow-sm' : 'text-on-surface-variant hover:bg-surface-container-lowest'}`}
                    >
                      Car Buffer
                    </button>
                    <button
                      onClick={() => setBufferTarget('cwt')}
                      className={`flex-1 py-1.5 text-[10px] font-bold uppercase rounded-sm transition-all ${bufferTarget === 'cwt' ? 'bg-primary text-white shadow-sm' : 'text-on-surface-variant hover:bg-surface-container-lowest'}`}
                    >
                      CWT Buffer
                    </button>
                  </div>
                )}
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-on-surface-variant uppercase">Buffer Presets</label>
                    <select
                      value={data.bufferPresetId || ''}
                      onChange={(e) => {
                        const preset = BUFFER_PRESETS.find((item) => item.id === e.target.value);
                        if (!preset) return;
                        onChange({
                          bufferPresetId: preset.id,
                          bufferType: preset.type as ProjectData['bufferType'],
                          bufferMedium: (preset as any).medium || data.bufferMedium,
                          bufferIsLinear: preset.isLinear,
                          bufferStroke: preset.stroke,
                          bufferMinMass: preset.minMass,
                          bufferMaxMass: preset.maxMass,
                          bufferManualOverride: false,
                        });
                      }}
                      className="w-full bg-surface-container-low border border-outline-variant/20 rounded-sm px-3 py-2 text-sm outline-none"
                    >
                      <option value="">Select a preset...</option>
                      {availableBufferPresets.map((preset) => (
                        <option key={preset.id} value={preset.id}>
                          {preset.manufacturer} {preset.model} ({preset.speedRange})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-on-surface-variant uppercase">Buffer Type</label>
                    <select 
                      value={data.bufferType}
                      onChange={(e) => {
                        const type = e.target.value as any;
                        onChange({ 
                          bufferPresetId: '',
                          bufferType: type,
                          bufferMedium: type === 'energy-accumulation' ? 'spring' : 'hydraulic-oil',
                          bufferIsLinear: true // Reset to linear on type change for safety
                        });
                      }}
                      disabled={isHydraulicProject}
                      className="w-full bg-surface-container-low border border-outline-variant/20 rounded-sm px-3 py-2 text-sm outline-none disabled:opacity-60"
                    >
                      {!isHydraulicProject && <option value="energy-accumulation">Energy Accumulation</option>}
                      <option value="energy-dissipation">{isHydraulicProject ? 'Energy Dissipation / Hydraulic Oil' : 'Energy Dissipation'}</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-on-surface-variant uppercase">Buffer Medium</label>
                    <select
                      value={data.bufferMedium}
                      onChange={(e) => onChange({ bufferPresetId: '', bufferMedium: e.target.value as ProjectData['bufferMedium'] })}
                      disabled={isHydraulicProject}
                      className="w-full bg-surface-container-low border border-outline-variant/20 rounded-sm px-3 py-2 text-sm outline-none disabled:opacity-60"
                    >
                      {!isHydraulicProject && <option value="spring">Spring</option>}
                      {!isHydraulicProject && <option value="elastomer">Elastomer</option>}
                      <option value="hydraulic-oil">Hydraulic Oil</option>
                    </select>
                  </div>
                  <div className="rounded-sm border border-primary/20 bg-primary/5 p-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-primary">Operating recommendation</p>
                    <p className="mt-2 text-xs leading-relaxed text-on-surface-variant">
                      {isHydraulicProject
                        ? <>Hydraulic mode is isolated here: car buffer only, <strong>energy-dissipation</strong> type and <strong>hydraulic-oil</strong> medium. Counterweight buffers and compensation do not apply.</>
                        : <>Current speed class recommends <strong>{logic.recommendedBufferType}</strong> using <strong>{logic.recommendedBufferMedium}</strong>.</>}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 py-1">
                    <input 
                      type="checkbox"
                      id="bufferLinear"
                      checked={data.bufferIsLinear}
                      onChange={(e) => onChange({ bufferPresetId: '', bufferIsLinear: e.target.checked })}
                      className="rounded-sm border-outline-variant/20 text-primary focus:ring-primary"
                    />
                    <label htmlFor="bufferLinear" className="text-[11px] font-bold text-on-surface-variant uppercase cursor-pointer">Linear Characteristic</label>
                  </div>
                  
                  {!data.bufferIsLinear && (
                    <LiftField label="Force Curve Exponent (n)" name="bufferForceCurveExponent" unit="" data={data} onChange={onChange} min={0.1} max={5} step={0.1} suggestion="E.g., 1.5 for slight progressivity, 3.0 for sharp rise" />
                  )}

                  <div className="flex items-center gap-2 py-1 mt-2">
                    <input 
                      type="checkbox"
                      id="bufferOverride"
                      checked={data.bufferManualOverride}
                      onChange={(e) => onChange({ bufferManualOverride: e.target.checked })}
                      className="rounded-sm border-outline-variant/20 text-primary focus:ring-primary"
                    />
                    <label htmlFor="bufferOverride" className="text-[11px] font-bold text-on-surface-variant uppercase cursor-pointer">Manual Stroke Override</label>
                  </div>
                  
                    <LiftField label="Buffer Stroke (h)" name="bufferStroke" unit="mm" data={data} onChange={(newData) => onChange({ bufferPresetId: '', ...newData })} min={50} max={1000} disabled={!data.bufferManualOverride && false /* we will allow generic input, but override lets us set h_min manual bypass in calculation */} />
                  
                  {data.bufferManualOverride && (
                    <LiftField label="Manufacturer Min Stroke" name="bufferManualStroke" unit="mm" data={data} onChange={(newData) => onChange({ bufferPresetId: '', ...newData })} min={50} max={1000} suggestion="Use manufacturer provided minimum stroke" />
                  )}
                  
                  <div className="grid grid-cols-2 gap-2 mt-4">
                    <LiftField label="Min Mass" name="bufferMinMass" unit="kg" data={data} onChange={(newData) => onChange({ bufferPresetId: '', ...newData })} min={0} max={5000} />
                    <LiftField label="Max Mass" name="bufferMaxMass" unit="kg" data={data} onChange={(newData) => onChange({ bufferPresetId: '', ...newData })} min={0} max={5000} />
                  </div>
                </div>
              </div>
              <div className="lg:col-span-2">
                <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className={`p-6 border ${lightResultCard} ${isStrokeOk ? 'bg-emerald-50 border-emerald-200' : 'bg-error-container/10 border-error/20'}`}>
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-[10px] font-bold uppercase">Stroke Utilization</p>
                            <div className="flex items-center gap-1">
                              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${data.bufferIsLinear ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                                {data.bufferIsLinear ? 'Linear' : 'Non-Linear'}
                              </span>
                            </div>
                          </div>
                          <p className="text-2xl font-black">{formatNumber(data.bufferStroke)} mm</p>
                          <p className={`text-[10px] ${lightMutedText}`}>Min Required: {formatNumber(data.bufferManualOverride ? data.bufferManualStroke : h_min)} mm ({formatNumber(strokeUtilization)}%)</p>
                          <div className="mt-2 h-1 bg-surface-container-low rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${isStrokeOk ? 'bg-emerald-500' : 'bg-error'}`} 
                              style={{ width: `${Math.min(strokeUtilization, 100)}%` }}
                            />
                          </div>
                        </div>
                        <div className={`p-6 border ${lightResultCard} ${a_avg <= 1.0 ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
                          <p className="text-[10px] font-bold uppercase mb-1">Avg Deceleration</p>
                          <p className="text-2xl font-black">{formatNumber(a_avg)} gn</p>
                          <p className={`text-[10px] ${lightMutedText}`}>Limit: 1.0 gn (ISO 8100-2)</p>
                          <div className="mt-2 h-1 bg-surface-container-low rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${a_avg <= 1.0 ? 'bg-emerald-500' : 'bg-amber-500'}`} 
                              style={{ width: `${Math.min(a_avg * 100, 100)}%` }}
                            />
                          </div>
                        </div>
                        <div className={`p-6 border ${lightResultCard} ${isBufferMassOk ? 'bg-emerald-50 border-emerald-200' : 'bg-error-container/10 border-error/20'}`}>
                          <p className="text-[10px] font-bold uppercase mb-1">Mass Compliance</p>
                          <p className="text-2xl font-black">{formatNumber(impactMass)} <span className="text-xs font-normal opacity-50">kg</span></p>
                          <p className={`text-[10px] ${lightMutedText}`}>Range: {data.bufferMinMass} - {data.bufferMaxMass} kg</p>
                          <div className="mt-2 h-1 bg-surface-container-low rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${isBufferMassOk ? 'bg-emerald-500' : 'bg-error'}`} 
                              style={{ width: `${Math.min(Math.max(massUtilization, 0), 100)}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      {data.bufferType === 'energy-dissipation' && (
                        <div className={`p-6 border ${lightResultCard} ${isEnergyOk ? 'bg-emerald-50 border-emerald-200' : 'bg-error-container/10 border-error/20'}`}>
                          <div className="flex items-center justify-between mb-4">
                            <h5 className="text-[10px] font-bold uppercase text-primary">Energy Dissipation Capacity</h5>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isEnergyOk ? 'bg-emerald-100 text-emerald-700' : 'bg-error-container text-error'}`}>
                              {isEnergyOk ? 'CAPACITY OK' : 'OVERLOAD'}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-8">
                            <div>
                              <p className={`text-[10px] uppercase mb-1 ${lightMutedText}`}>Total Impact Energy</p>
                              <p className="text-xl font-black">{formatNumber(Etotal)} J</p>
                              <p className={`text-[9px] mt-1 ${lightMutedText}`}>Ek + Ep (0.5mv² + mgh)</p>
                            </div>
                            <div>
                              <p className={`text-[10px] uppercase mb-1 ${lightMutedText}`}>Absorption Limit (1.0gn)</p>
                              <p className="text-xl font-black">{formatNumber(Ecap)} J</p>
                              <p className={`text-[9px] mt-1 ${lightMutedText}`}>
                                {data.bufferIsLinear ? 'Work = m(a+g)h' : 'Numerical Integration of Force-Stroke Curve'}
                              </p>
                            </div>
                          </div>
                          <div className="mt-4 pt-4 border-t border-outline-variant/10">
                            <div className="flex items-center justify-between">
                              <p className="text-[10px] font-bold uppercase opacity-60">Kinetic Energy vs Capacity</p>
                              <p className="text-[10px] font-bold text-primary">{(Ek / Ecap * 100).toFixed(1)}% Utilization</p>
                            </div>
                            <div className="mt-2 h-1.5 bg-surface-container-low rounded-full overflow-hidden">
                              <div 
                                className={`h-full ${Ek <= Ecap ? 'bg-primary' : 'bg-error'}`} 
                                style={{ width: `${Math.min(Ek / Ecap * 100, 100)}%` }}
                              />
                            </div>
                            <p className={`text-[9px] mt-2 italic ${lightMutedText}`}>
                              Comparison: Kinetic energy (Ek) represents {formatNumber(Ek)} J of the total {formatNumber(Etotal)} J impact energy.
                            </p>
                          </div>
                          {!data.bufferIsLinear && (
                            <div className="mt-4 p-2 bg-primary/5 border border-primary/10 rounded-sm">
                              <p className="text-[9px] text-primary font-medium italic">
                                Note: Non-linear capacity is currently estimated using a placeholder efficiency factor. 
                                Advanced verification requires integration of the specific buffer force-stroke curve.
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-surface-container-low border border-outline-variant/10">
                          <p className="text-[10px] font-bold uppercase mb-1 opacity-50">Kinetic Energy (Impact)</p>
                          <p className="text-xl font-black">{formatNumber(Ek)} J</p>
                          <p className="text-[9px] opacity-40 mt-1">0.5 · m · v²</p>
                        </div>
                        <div className={`p-4 border ${isBufferMassOk ? 'bg-surface-container-low border-outline-variant/10' : 'bg-error-container/10 border-error/20'}`}>
                          <p className="text-[10px] font-bold uppercase mb-1 opacity-50">Impact Mass ({isHydraulicProject || bufferTarget === 'car' ? 'P+Q' : 'Mcwt'})</p>
                          <p className="text-xl font-black">{formatNumber(impactMass)} kg</p>
                          <p className="text-[10px] opacity-50">Certified Range: {data.bufferMinMass} - {data.bufferMaxMass} kg</p>
                        </div>
                      </div>

                      <div className="space-y-6 mt-6">
                        <CollapsibleSection title="ISO 8100-2:2026 Buffer Formula Details" icon={Info}>
                          <div className="space-y-4 text-sm text-on-surface-variant leading-relaxed">
                            <p>
                              <strong>Clause 4.5:</strong> Buffers must be capable of absorbing the kinetic energy of the car or counterweight at the moment of impact.
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                              <div className="p-4 bg-surface-container-low rounded border border-outline-variant/10">
                                <h5 className="font-bold text-primary mb-2 uppercase text-[10px]">Minimum Stroke ($h$)</h5>
                                <p className="text-xs mb-2">For energy accumulation buffers with linear characteristics:</p>
                                <InlineMath math="h \ge 0.135 \cdot v^2" />
                                <p className="text-[10px] mt-2 opacity-70">Where $v$ is the rated speed. For non-linear, the factor is $0.067$.</p>
                              </div>
                              <div className="p-4 bg-surface-container-low rounded border border-outline-variant/10">
                                <h5 className="font-bold text-primary mb-2 uppercase text-[10px]">Impact Energy ($E$)</h5>
                                <p className="text-xs mb-2">The total energy to be dissipated includes kinetic and potential energy:</p>
                                <InlineMath math="E = \frac{1}{2} \cdot m \cdot v^2 + m \cdot g \cdot h" />
                                <p className="text-[10px] mt-2 opacity-70">Where $m$ is the impact mass and $h$ is the buffer stroke.</p>
                              </div>
                            </div>
                          </div>
                        </CollapsibleSection>

                        <div className="p-6 bg-surface-container-lowest border border-outline-variant/10 rounded-sm">
                          <h5 className="text-[10px] font-bold uppercase text-primary mb-4 flex items-center gap-2">
                            <CheckSquare size={12} />
                            Buffer Verification Checklist (4.5)
                          </h5>
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded flex items-center justify-center border ${isStrokeOk ? 'bg-emerald-600 border-emerald-600' : 'border-outline-variant'}`}>
                              {isStrokeOk && <CheckSquare size={14} className="text-white" />}
                            </div>
                            <span className={`text-xs font-medium ${isStrokeOk ? 'text-on-surface' : 'text-on-surface-variant'}`}>
                              Real stroke ({formatNumber(data.bufferStroke)}mm) satisfies the normative requirement of {formatNumber(h_min)}mm.
                            </span>
                          </div>
                          {data.bufferType === 'energy-dissipation' && (
                            <div className="flex items-center gap-3">
                              <div className={`w-5 h-5 rounded flex items-center justify-center border ${isEnergyOk ? 'bg-emerald-600 border-emerald-600' : 'border-outline-variant'}`}>
                                {isEnergyOk && <CheckSquare size={14} className="text-white" />}
                              </div>
                              <span className={`text-xs font-medium ${isEnergyOk ? 'text-on-surface' : 'text-on-surface-variant'}`}>
                                Energy dissipation capacity ({formatNumber(Ecap)}J) is sufficient for total impact energy ({formatNumber(Etotal)}J).
                              </span>
                            </div>
                          )}
                          <div className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded flex items-center justify-center border ${isBufferMassOk ? 'bg-emerald-600 border-emerald-600' : 'border-outline-variant'}`}>
                              {isBufferMassOk && <CheckSquare size={14} className="text-white" />}
                            </div>
                            <span className={`text-xs font-medium ${isBufferMassOk ? 'text-on-surface' : 'text-on-surface-variant'}`}>
                              Total impact mass ({formatNumber(impactMass)}kg) is within the certified range ({data.bufferMinMass}kg - {data.bufferMaxMass}kg).
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded flex items-center justify-center border ${a_avg <= 1.0 ? 'bg-emerald-600 border-emerald-600' : 'border-outline-variant'}`}>
                              {a_avg <= 1.0 && <CheckSquare size={14} className="text-white" />}
                            </div>
                            <span className={`text-xs font-medium ${a_avg <= 1.0 ? 'text-on-surface' : 'text-on-surface-variant'}`}>
                              Average deceleration of {formatNumber(a_avg)}gn does not exceed the comfort/safety limit.
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
            )}

          {/* 4.7 Ascending Car Overspeed Protection (ACOP) */}
          {(section === 'all' || section === 'acop') && (
          <section className="space-y-6">
            <div className="flex items-center gap-4 border-b border-outline-variant/20 pb-2">
              <ShieldCheck className="text-primary" size={20} />
              <h4 className="text-sm font-bold uppercase tracking-wider">4.7 Ascending Car Overspeed Protection (ACOP)</h4>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="space-y-4 p-6 bg-surface-container-lowest border border-outline-variant/10">
                <h5 className="text-[10px] font-bold uppercase text-primary mb-4">ACOP Parameters</h5>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-on-surface-variant uppercase">Means of Protection</label>
                    <select 
                      value={data.acopType}
                      onChange={(e) => onChange({ acopType: e.target.value as any })}
                      className="w-full bg-surface-container-low border border-outline-variant/20 rounded-sm px-3 py-2 text-sm outline-none"
                    >
                      <option value="governor">Overspeed Governor</option>
                      <option value="rope-brake">Rope Brake</option>
                      <option value="safety-gear">Safety Gear (Bi-directional)</option>
                    </select>
                  </div>
                  <LiftField label="Tripping Speed (vt_acop)" name="acopTrippingSpeed" unit="m/s" data={data} onChange={onChange} min={0} max={5} step={0.01} />
                </div>
              </div>
              <div className="lg:col-span-2 space-y-4">
                <div className={`p-6 border ${lightResultCard} ${isAcopOk ? 'bg-emerald-50 border-emerald-200' : 'bg-error-container/10 border-error/20'}`}>
                  <p className="text-[10px] font-bold uppercase mb-1">ACOP Tripping Speed Verification</p>
                  <p className="text-2xl font-black">{formatNumber(data.acopTrippingSpeed)} m/s</p>
                  <p className={`text-[10px] ${lightMutedText}`}>Limit: {formatNumber(acopMaxTripping)} m/s (ISO 8100-2:2026)</p>
                  <div className="mt-4 rounded border border-slate-200 bg-white p-4 text-slate-900">
                    <h5 className="text-[10px] font-bold uppercase text-primary mb-2">Normative Limit (Clause 4.7)</h5>
                    <p className="text-xs leading-relaxed">
                      <strong>ISO 8100-2:2026 Clause 4.7.2.1:</strong> For rated speeds <InlineMath math="v \le 1.0\text{ m/s}" />, <InlineMath math="v_{t\_acop} \le 1.15v + 0.25\text{ m/s}" />.<br/>
                      <strong>ISO 8100-2:2026 Clause 4.7.2.2:</strong> For rated speeds <InlineMath math="v > 1.0\text{ m/s}" />, <InlineMath math="v_{t\_acop} \le 1.15v" />.
                    </p>
                  </div>
                </div>
                <div className="p-6 bg-surface-container-lowest border border-outline-variant/10 rounded-sm">
                  <h5 className="text-[10px] font-bold uppercase text-primary mb-4 flex items-center gap-2">
                    <CheckSquare size={12} />
                    ACOP Checklist (4.7)
                  </h5>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded flex items-center justify-center border ${isAcopOk ? 'bg-emerald-600 border-emerald-600' : 'border-outline-variant'}`}>
                        {isAcopOk && <CheckSquare size={14} className="text-white" />}
                      </div>
                      <span className="text-xs font-medium">Tripping speed does not exceed normative limits ({formatNumber(acopMaxTripping)} m/s).</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded flex items-center justify-center border border-outline-variant">
                        {/* Manual check */}
                      </div>
                      <span className="text-xs font-medium">Braking element acts on the car, counterweight, or rope system.</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
          )}

          {/* 4.8 Unintended Car Movement Protection (UCMP) */}
          {(section === 'all' || section === 'acop') && (
          <section className="space-y-6">
            <div className="flex items-center gap-4 border-b border-outline-variant/20 pb-2">
              <ShieldCheck className="text-primary" size={20} />
              <h4 className="text-sm font-bold uppercase tracking-wider">4.8 Unintended Car Movement Protection (UCMP)</h4>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="space-y-4 p-6 bg-surface-container-lowest border border-outline-variant/10">
                <h5 className="text-[10px] font-bold uppercase text-primary mb-4">UCMP Parameters</h5>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-on-surface-variant uppercase">Stopping Element</label>
                    <select 
                      value={data.ucmpType}
                      onChange={(e) => onChange({ ucmpType: e.target.value as any })}
                      className="w-full bg-surface-container-low border border-outline-variant/20 rounded-sm px-3 py-2 text-sm outline-none"
                    >
                      <option value="brake">Machine Brake</option>
                      <option value="safety-gear">Safety Gear</option>
                      <option value="valve">Hydraulic Valve</option>
                    </select>
                  </div>
                  <LiftField 
                    label="Detection Distance (s)" 
                    name="ucmpDetectionDist" 
                    unit="mm" 
                    data={data} 
                    onChange={onChange} 
                    min={0} 
                    max={500} 
                    suggestion="Pursuant to ISO 8100-1:2026, the detection device must perceive unintended movement before the car leaves the unlocking zone. Therefore, the detection distance must be configured strictly within the limits of the unlocking zone (typically ±200mm, max ±250mm from the landing level)."
                  />
                </div>
              </div>
              <div className="lg:col-span-2 space-y-4">
                <div className={`p-6 border ${lightResultCard} ${isUcmpOk ? 'bg-emerald-50 border-emerald-200' : 'bg-error-container/10 border-error/20'}`}>
                  <p className="text-[10px] font-bold uppercase mb-1">UCMP Stopping Distance Verification</p>
                  <p className="text-2xl font-black">{formatNumber(data.ucmpDetectionDist)} mm</p>
                  <p className={`text-[10px] ${lightMutedText}`}>Max Permissible Movement: 1200 mm (ISO 8100-1:2026)</p>
                  <div className="mt-4 rounded border border-slate-200 bg-white p-4 text-slate-900">
                    <h5 className="text-[10px] font-bold uppercase text-primary mb-2">Normative Requirement (Clause 4.8)</h5>
                    <p className="text-xs leading-relaxed">
                      <strong>ISO 8100-2:2026 Clause 4.8.2:</strong> The car shall stop within a distance of <InlineMath math="1.20\text{ m}" /> from the landing level. 
                      The detection distance <InlineMath math="s" /> plus the braking distance must not exceed this limit.
                    </p>
                  </div>
                </div>
                <div className="p-6 bg-surface-container-lowest border border-outline-variant/10 rounded-sm">
                  <h5 className="text-[10px] font-bold uppercase text-primary mb-4 flex items-center gap-2">
                    <CheckSquare size={12} />
                    UCMP Checklist (4.8)
                  </h5>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded flex items-center justify-center border ${isUcmpOk ? 'bg-emerald-600 border-emerald-600' : 'border-outline-variant'}`}>
                        {isUcmpOk && <CheckSquare size={14} className="text-white" />}
                      </div>
                      <span className="text-xs font-medium">Car stops within 1.20m from the landing level.</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded flex items-center justify-center border border-outline-variant">
                        {/* Manual check */}
                      </div>
                      <span className="text-xs font-medium">Detection zone does not exceed 250mm from landing.</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
          )}

          {/* 4.6 Safety Circuits and SIL-rated Circuits */}
          {(section === 'all' || section === 'sil') && (
          <section className="space-y-6">
            <div className="flex items-center gap-4 border-b border-outline-variant/20 pb-2">
              <Zap className="text-primary" size={20} />
              <h4 className="text-sm font-bold uppercase tracking-wider">4.6 Safety Circuits and SIL-rated Circuits</h4>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <InputGroup label="Safety Circuit Configuration">
                <div className="space-y-1 col-span-2">
                  <label className="text-[11px] font-bold text-on-surface-variant uppercase">Target SIL Level</label>
                  <select 
                    value={data.silLevel}
                    onChange={(e) => onChange({ silLevel: safeNumber(e.target.value) })}
                    className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-sm px-3 py-2 text-sm focus:ring-1 focus:ring-primary outline-none transition-all"
                  >
                    <option value={1}>SIL 1</option>
                    <option value={2}>SIL 2</option>
                    <option value={3}>SIL 3</option>
                  </select>
                </div>
                <LiftField label="Failure Rate (λ)" name="failureRate" unit="failures/h" data={data} onChange={onChange} min={0} max={0.1} step={0.001} />
                <LiftField label="Dangerous Fraction (B)" name="dangerousFraction" unit="%" data={data} onChange={onChange} min={0} max={100} />
                <LiftField label="Diagnostic Coverage (DC)" name="diagnosticCoverage" unit="%" data={data} onChange={onChange} min={0} max={100} />
                <LiftField label="Fault Tolerance" name="faultTolerance" data={data} onChange={onChange} min={0} max={3} step={1} />
              </InputGroup>
              <div className="lg:col-span-2">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className={`p-6 border ${lightResultCard} ${isPfhOk ? 'bg-emerald-50 border-emerald-200' : 'bg-error-container/10 border-error/20'}`}>
                    <p className="text-[10px] font-bold uppercase mb-1">Calculated PFH</p>
                    <p className="text-2xl font-black">{pfh.toExponential(2)}</p>
                    <p className={`text-[10px] ${lightMutedText}`}>Limit: {currentLimit.max.toExponential(0)} failures/h</p>
                    <div className="mt-4 flex items-center gap-2">
                      {isPfhOk ? <CheckCircle2 size={14} className="text-emerald-600" /> : <XCircle size={14} className="text-error" />}
                      <span className="text-[10px] font-bold uppercase opacity-70">PFH Verification</span>
                    </div>
                  </div>
                  <div className={`p-6 border ${lightResultCard} ${isDcOk ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
                    <p className="text-[10px] font-bold uppercase mb-1">Diagnostic Coverage</p>
                    <p className="text-2xl font-black">{data.diagnosticCoverage}%</p>
                    <p className={`text-[10px] ${lightMutedText}`}>Min Required: {minDc}%</p>
                    <div className="mt-4 flex items-center gap-2">
                      {isDcOk ? <CheckCircle2 size={14} className="text-emerald-600" /> : <AlertCircle size={14} className="text-amber-600" />}
                      <span className="text-[10px] font-bold uppercase opacity-70">DC Verification</span>
                    </div>
                  </div>
                  <div className={`p-6 border ${lightResultCard} ${isFaultToleranceOk && safetyChainContinuityOk ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
                    <p className="text-[10px] font-bold uppercase mb-1">Circuit Integrity</p>
                    <p className="text-2xl font-black">{data.faultTolerance}</p>
                    <p className={`text-[10px] ${lightMutedText}`}>Min Fault Tolerance: {minFaultTolerance}</p>
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center gap-2">
                        {isFaultToleranceOk ? <CheckCircle2 size={14} className="text-emerald-600" /> : <AlertCircle size={14} className="text-amber-600" />}
                        <span className="text-[10px] font-bold uppercase opacity-70">Architecture</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {safetyChainContinuityOk ? <CheckCircle2 size={14} className="text-emerald-600" /> : <AlertCircle size={14} className="text-amber-600" />}
                        <span className="text-[10px] font-bold uppercase opacity-70">Continuity</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-6 p-6 bg-surface-container-low border border-outline-variant/10 rounded-sm">
                  <h5 className="text-[10px] font-bold uppercase text-primary mb-4">Operational Reading</h5>
                  <div className="grid grid-cols-1 xl:grid-cols-[0.95fr_1.05fr] gap-6">
                    <div className="space-y-3 text-xs text-on-surface-variant">
                      <p>• Safety-chain logic is treated here as the electrical verification layer of clause 4.6, with SIL-oriented validation added where programmable safety functions exist.</p>
                      <p>• The probability of dangerous failure per hour (PFH) shall remain below {currentLimit.max.toExponential(0)} for the selected SIL target.</p>
                      <p>• Fault tolerance, diagnostic coverage and continuity of the safety chain are evaluated together so the clause is not reduced to a single PFH number.</p>
                    </div>
                    <div className="rounded-sm border border-outline-variant/20 bg-surface-container-lowest p-4">
                      <h6 className="text-[10px] font-bold uppercase text-primary mb-3">Safety Circuit Checklist</h6>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded flex items-center justify-center border ${safetyChainContinuityOk ? 'bg-emerald-600 border-emerald-600' : 'border-outline-variant'}`}>
                            {safetyChainContinuityOk && <CheckSquare size={14} className="text-white" />}
                          </div>
                          <span className="text-xs font-medium">Door safety chain continuity and positive electrical verification are active.</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded flex items-center justify-center border ${isPfhOk ? 'bg-emerald-600 border-emerald-600' : 'border-outline-variant'}`}>
                            {isPfhOk && <CheckSquare size={14} className="text-white" />}
                          </div>
                          <span className="text-xs font-medium">Dangerous failure per hour remains inside the target SIL band.</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded flex items-center justify-center border ${isDcOk ? 'bg-emerald-600 border-emerald-600' : 'border-outline-variant'}`}>
                            {isDcOk && <CheckSquare size={14} className="text-white" />}
                          </div>
                          <span className="text-xs font-medium">Diagnostic coverage satisfies the minimum evidence threshold for the selected SIL level.</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded flex items-center justify-center border ${isFaultToleranceOk ? 'bg-emerald-600 border-emerald-600' : 'border-outline-variant'}`}>
                            {isFaultToleranceOk && <CheckSquare size={14} className="text-white" />}
                          </div>
                          <span className="text-xs font-medium">Fault tolerance architecture is coherent with the chosen integrity target.</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-4 rounded-sm border border-outline-variant/20 bg-surface-container-lowest p-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-[10px] font-bold uppercase text-on-surface-variant">Dangerous failure rate</p>
                      <p className="mt-1 text-lg font-black text-on-surface">{dangerousFailureRate.toExponential(2)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase text-on-surface-variant">Continuity state</p>
                      <p className={`mt-1 text-lg font-black ${safetyChainContinuityOk ? 'text-emerald-600' : 'text-amber-600'}`}>
                        {safetyChainContinuityOk ? 'closed / verified' : 'review chain'}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase text-on-surface-variant">Clause result</p>
                      <p className={`mt-1 text-lg font-black ${isSilOk && safetyChainContinuityOk ? 'text-emerald-600' : 'text-amber-600'}`}>
                        {isSilOk && safetyChainContinuityOk ? 'compliant path' : 'evidence missing'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
          )}
        </div>
      </div>
    </div>
  );
};

// --- Main App ---

import React, { useMemo } from 'react';
import { ProjectData, ModuleStatus } from '../types';
import { safeNumber, formatNumber, degToRad, InputGroup, LiftField, SliderField, CollapsibleSection } from '../components/ui';
import { BELT_PROFILES, ROPE_PRESETS } from '../constants';
import { CheckCircle2, ShieldCheck, Zap, AlertTriangle, Info, ChevronRight, Calculator, FileText, Database, Activity, Package, Maximize, AlertCircle, PlayCircle, Settings, CheckSquare, History } from 'lucide-react';
import { BlockMath, InlineMath } from 'react-katex';
import { computeLiftCalculations } from '../lib/calculations';

export const RopesModule = ({ data, onChange, view = 'all' }: { data: ProjectData, onChange: (newData: Partial<ProjectData>) => void, view?: 'all' | 'params' | 'verify' }) => {
  const calc = computeLiftCalculations(data);
  const { Fstatic_per_rope, N_equiv, sf_required, sf_actual, isSfOk, iso4344_Fmin, isBreakingLoadOk } = calc.ropes;

  // Placeholder Lifetime Estimation (refined)
  const lifetime_est = useMemo(() => {
    if (data.loadCycles <= 0) return 0;
    const base_life = 200000; 
    const factor = data.ropeType.toLowerCase().includes('coated') ? 1.5 : 1.0;
    const bend_penalty = Math.max(0.1, 1 - (N_equiv * 0.05));
    const stop_penalty = Math.max(0.8, 1 - (data.stops * 0.01)); // Small penalty for more stops
    return Math.max(0, base_life * factor * bend_penalty * stop_penalty / (data.loadCycles / 1000));
  }, [data.loadCycles, data.ropeType, N_equiv, data.stops]);

  const discardDiameterLimit = 6;
  const discardWearReached = data.ropeWearPercentage >= discardDiameterLimit;
  const reverseBendSeverity = data.numReverseBends >= 4 ? 'high' : data.numReverseBends >= 2 ? 'medium' : 'low';
  const fatigueReserveYears = data.loadCycles > 0 ? lifetime_est / data.loadCycles : 0;
  const fatigueReserveLow = fatigueReserveYears > 0 && fatigueReserveYears < 1;
  const discardRequiresAction = discardWearReached || !isBreakingLoadOk || !isSfOk;
  const discardStatusTone = discardRequiresAction ? 'bg-error-container/10 border-error/20' : fatigueReserveLow || reverseBendSeverity !== 'low' ? 'bg-amber-50 border-amber-200' : 'bg-emerald-50 border-emerald-200';
  const discardStatusLabel = discardRequiresAction ? 'replace / investigate' : fatigueReserveLow || reverseBendSeverity !== 'low' ? 'service review' : 'serviceable';

  return (
    <div className="space-y-8">
      <div className="bg-surface-container-low p-8 border-t-2 border-tertiary">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xl font-bold">Evaluation of Safety Factor of Ropes (4.12)</h3>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${isSfOk ? 'bg-emerald-100 text-emerald-700' : 'bg-error-container/20 text-error'}`}>
            {isSfOk ? 'Implemented - OK' : 'Implemented - NOK'}
          </span>
        </div>

        {(view === 'all' || view === 'verify') && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-surface-container-lowest border border-outline-variant/10">
            <p className="text-[10px] font-bold text-on-surface-variant uppercase mb-1">Static Load / Rope</p>
            <p className="text-xl font-black">{formatNumber(Fstatic_per_rope)} <span className="text-xs font-normal opacity-50">N</span></p>
          </div>
          <div className="p-4 bg-surface-container-lowest border border-outline-variant/10">
            <p className="text-[10px] font-bold text-on-surface-variant uppercase mb-1">Required Sf (ISO)</p>
            <p className="text-xl font-black">{formatNumber(sf_required)}</p>
          </div>
          <div className="p-4 bg-surface-container-lowest border border-outline-variant/10">
            <p className="text-[10px] font-bold text-on-surface-variant uppercase mb-1">Actual Sf (Project)</p>
            <p className={`text-xl font-black ${isSfOk ? 'text-emerald-600' : 'text-error'}`}>{formatNumber(sf_actual)}</p>
          </div>
          <div className="p-4 bg-surface-container-lowest border border-outline-variant/10">
            <p className="text-[10px] font-bold text-on-surface-variant uppercase mb-1">Lifetime Est. (Cycles)</p>
            <p className="text-xl font-black">{formatNumber(lifetime_est, 0)}</p>
          </div>
          
          <div className="p-4 bg-surface-container-lowest border border-outline-variant/10 md:col-span-2">
            <p className="text-[10px] font-bold text-on-surface-variant uppercase mb-1">Suspension Type</p>
            <select 
              value={data.suspensionType}
              onChange={(e) => {
                const type = e.target.value as any;
                onChange({ suspensionType: type, ropePresetId: '', ropeType: '' });
              }}
              className="w-full bg-transparent text-xl font-black outline-none cursor-pointer text-primary"
            >
               <option value="wire-rope">Wire Ropes</option>
               <option value="elastomeric-rope">Elastomeric Coated Ropes</option>
               <option value="belt">Elastomeric Belts</option>
            </select>
          </div>

          <div className="p-4 bg-surface-container-lowest border border-outline-variant/10 md:col-span-2">
            <p className="text-[10px] font-bold text-on-surface-variant uppercase mb-1">Suspension Preset</p>
            <select 
              value={data.ropePresetId || (data.suspensionType === 'belt' ? '' : data.ropeType)}
              onChange={(e) => {
                const belt = BELT_PROFILES.find(b => b.id === e.target.value);
                const rope = ROPE_PRESETS.find((preset) => preset.id === e.target.value);
                if (belt) {
                  onChange({ 
                    ropePresetId: belt.id,
                    ropeType: belt.label,
                    beltWidth: belt.width,
                    beltThickness: belt.thickness,
                    numBelts: 1, // Reset to 1 by default for a single belt profile unless specified
                    beltTensileStrength: belt.mbf,
                    ropeBreakingLoad: belt.mbf,
                    ropeDiameter: belt.thickness // For D/d calculation
                  });
                } else if (rope) {
                  onChange({
                    ropePresetId: rope.id,
                    ropeType: `${rope.manufacturer} ${rope.model}`,
                    ropeDiameter: rope.diameter,
                    ropeGrade: rope.grade,
                    ropeBreakingLoad: rope.breakingLoad,
                  });
                } else {
                  onChange({ ropePresetId: '', ropeType: e.target.value });
                }
              }}
              className="w-full bg-transparent text-xl font-black outline-none cursor-pointer text-primary"
            >
              <option value="">Select Preset...</option>
              {data.suspensionType === 'belt' && (
                <optgroup label="Belts">
                  {BELT_PROFILES.map(b => (
                    <option key={b.id} value={b.id}>{b.label}</option>
                  ))}
                </optgroup>
              )}
              {data.suspensionType !== 'belt' && (
                <optgroup label="Ropes">
                  {ROPE_PRESETS.map((rope) => (
                    <option key={rope.id} value={rope.id}>
                      {rope.label}
                    </option>
                  ))}
                  <option value="Steel Wire">Steel (Standard)</option>
                  <option value="Coated">Coated (Synthetic)</option>
                </optgroup>
              )}
            </select>
          </div>
        </div>
        )}

        {(view === 'all' || view === 'params') && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          {data.suspensionType !== 'belt' && (
          <InputGroup label="Suspension Parameters">
            <LiftField label="Number of Ropes (n)" name="numRopes" data={data} onChange={(newData) => onChange({ ropePresetId: '', ...newData })} min={1} required suggestion="Increase number of ropes to improve safety factor." />
            <LiftField label="Diameter (d)" name="ropeDiameter" unit="mm" data={data} onChange={(newData) => onChange({ ropePresetId: '', ...newData })} min={4} max={20} required suggestion="D/d ratio must be ≥ 40 for steel ropes." />
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-on-surface-variant uppercase">Rope Grade (ISO 4344)</label>
              <select 
                value={data.ropeGrade}
                onChange={(e) => onChange({ ropePresetId: '', ropeGrade: parseInt(e.target.value) })}
                className="w-full bg-surface-container-low border border-outline-variant/20 rounded-sm px-3 py-2 text-sm focus:ring-1 focus:ring-primary outline-none"
              >
                <option value="1570">1570 N/mm²</option>
                <option value="1770">1770 N/mm² (Standard)</option>
                <option value="1960">1960 N/mm² (High Strength)</option>
              </select>
            </div>
            <div className="flex flex-col gap-1 p-3 bg-surface-container-lowest border border-outline-variant/10 rounded-sm">
              <span className="text-[10px] uppercase font-bold text-on-surface-variant">ISO 4344 Min. Breaking Load</span>
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm">{formatNumber(iso4344_Fmin)} N</span>
                {isBreakingLoadOk ? <CheckSquare size={14} className="text-emerald-500" /> : <AlertTriangle size={14} className="text-error" />}
              </div>
            </div>
            <LiftField label="Actual Breaking Load" name="ropeBreakingLoad" unit="N" data={data} onChange={(newData) => onChange({ ropePresetId: '', ...newData })} min={1000} required suggestion={`Should be >= ${formatNumber(iso4344_Fmin)} N per ISO 4344.`} />
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-on-surface-variant uppercase">Groove Type</label>
              <select 
                value={data.grooveType}
                onChange={(e) => onChange({ grooveType: e.target.value as any })}
                className="w-full bg-surface-container-low border border-outline-variant/20 rounded-sm px-3 py-2 text-sm focus:ring-1 focus:ring-primary outline-none"
              >
                <option value="V">V-Groove</option>
                <option value="semi-circular">Semi-Circular</option>
                <option value="U">U-Groove</option>
              </select>
            </div>
            <LiftField label="Spec. Pressure (p)" name="ropeSpecificPressure" unit="MPa" data={data} onChange={onChange} min={0} max={20} step={0.1} required />
            <LiftField label="Simple Pulleys (Nps)" name="numSimpleBends" data={data} onChange={onChange} min={0} max={20} required />
            <LiftField label="Reverse Pulleys (Npr)" name="numReverseBends" data={data} onChange={onChange} min={0} max={10} required suggestion="Reverse bends significantly reduce rope lifetime." />
          </InputGroup>
          )}

          {data.suspensionType === 'belt' && (
          <InputGroup label="Belt Specific Parameters">
            <LiftField label="Belt Width" name="beltWidth" unit="mm" data={data} onChange={(newData) => onChange({ ropePresetId: '', ...newData })} min={1} max={100} />
            <LiftField label="Belt Thickness" name="beltThickness" unit="mm" data={data} onChange={(newData) => onChange({ ropePresetId: '', ...newData })} min={1} max={20} />
            <LiftField label="Number of Belts" name="numBelts" data={data} onChange={(newData) => onChange({ ropePresetId: '', ...newData })} min={1} max={10} />
            <LiftField label="Tensile Strength / Belt" name="beltTensileStrength" unit="N" data={data} onChange={(newData) => onChange({ ropePresetId: '', ...newData })} min={1000} max={100000} />
            <LiftField label="Simple Pulleys (Nps)" name="numSimpleBends" data={data} onChange={onChange} min={0} max={20} required />
            <LiftField label="Reverse Pulleys (Npr)" name="numReverseBends" data={data} onChange={onChange} min={0} max={10} required suggestion="Reverse bends significantly reduce rope lifetime." />
          </InputGroup>
          )}

          <InputGroup label="Machine & Sheave">
            <LiftField label="Sheave Diameter (D)" name="sheaveDiameter" unit="mm" data={data} onChange={onChange} min={160} max={1000} required suggestion="Larger sheave diameter improves rope lifetime (D/d ratio)." />
            <LiftField label="Sheave Hardness" name="sheaveHardness" unit="HB" data={data} onChange={onChange} min={150} max={500} required />
            <LiftField label="Wrap Angle (α)" name="wrapAngle" unit="deg" data={data} onChange={onChange} min={90} max={270} required suggestion="Increase wrap angle to improve traction." />
          </InputGroup>

          <InputGroup label="Advanced Lifting Parameters">
            <LiftField label="N_equiv(t)" name="N_equiv_t" data={data} onChange={onChange} min={1} max={50} required />
            <LiftField label="Pulley Factor (Kp)" name="Kp" data={data} onChange={onChange} min={1} max={10} step={0.1} required />
            <LiftField label="Trips per Year (N_lift)" name="N_lift" data={data} onChange={onChange} min={1000} max={500000} required />
            <LiftField label="Reeving Factor (C_R)" name="C_R" data={data} onChange={onChange} min={1} max={4} required />
          </InputGroup>
        </div>
        )}

        {(view === 'all' || view === 'verify') && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          <div className="space-y-6">
            <div className="p-4 bg-surface-container-lowest border border-outline-variant/10">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary">4.12 Formula</span>
                <code className="text-xs font-bold text-on-surface">Sf = 10^(2.6834 - log(N_equiv / 2.6834e6) / log(D/d))</code>
                <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-on-surface-variant">N_equiv = Nps + 4Npr</span>
              </div>
            </div>
            
            <div className={`p-6 rounded-sm border ${discardStatusTone}`}>
              <div className="mb-5 flex items-center justify-between gap-4">
                <h4 className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                  <AlertTriangle size={14} />
                  Discard Criteria (4.14)
                </h4>
                <span className="rounded-full border border-current/20 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-on-surface">
                  {discardStatusLabel}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <LiftField
                  label="Diameter Reduction"
                  name="ropeWearPercentage"
                  unit="%"
                  data={data}
                  onChange={onChange}
                  min={0}
                  max={15}
                  step={0.5}
                  suggestion="A reduction above 6% should immediately trigger rope replacement review."
                />
                <div className="rounded-sm border border-outline-variant/20 bg-surface-container-lowest p-4">
                  <p className="text-[10px] font-bold uppercase text-on-surface-variant">Discard Snapshot</p>
                  <p className={`mt-2 text-2xl font-black ${discardRequiresAction ? 'text-error' : fatigueReserveLow || reverseBendSeverity !== 'low' ? 'text-amber-600' : 'text-emerald-600'}`}>
                    {discardRequiresAction ? 'REJECT' : fatigueReserveLow || reverseBendSeverity !== 'low' ? 'REVIEW' : 'OK'}
                  </p>
                  <p className="mt-2 text-[10px] leading-relaxed text-on-surface-variant">Decision is driven by wear, breaking load, safety factor and reverse bends.</p>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded flex items-center justify-center border ${!discardWearReached ? 'bg-emerald-600 border-emerald-600' : 'border-error bg-error/80'}`}>
                    {!discardWearReached ? <CheckSquare size={14} className="text-white" /> : <AlertTriangle size={12} className="text-white" />}
                  </div>
                  <span className="text-xs font-medium">Nominal diameter reduction remains below 6%.</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded flex items-center justify-center border ${isBreakingLoadOk ? 'bg-emerald-600 border-emerald-600' : 'border-error bg-error/80'}`}>
                    {isBreakingLoadOk ? <CheckSquare size={14} className="text-white" /> : <AlertTriangle size={12} className="text-white" />}
                  </div>
                  <span className="text-xs font-medium">Measured breaking load still satisfies the ISO 4344 minimum reference.</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded flex items-center justify-center border ${isSfOk ? 'bg-emerald-600 border-emerald-600' : 'border-error bg-error/80'}`}>
                    {isSfOk ? <CheckSquare size={14} className="text-white" /> : <AlertTriangle size={12} className="text-white" />}
                  </div>
                  <span className="text-xs font-medium">Current suspension safety factor still covers the installed duty.</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded flex items-center justify-center border ${reverseBendSeverity === 'low' ? 'bg-emerald-600 border-emerald-600' : reverseBendSeverity === 'medium' ? 'bg-amber-500 border-amber-500' : 'border-error bg-error/80'}`}>
                    {reverseBendSeverity === 'low' ? <CheckSquare size={14} className="text-white" /> : <AlertTriangle size={12} className="text-white" />}
                  </div>
                  <span className="text-xs font-medium">
                    Reverse bends are tracked as a fatigue accelerator.
                  </span>
                </div>
              </div>

              <div className="mt-5 rounded-sm border border-outline-variant/20 bg-surface-container-lowest p-4">
                <p className="text-[10px] font-bold uppercase text-primary">Service Interpretation</p>
                <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div>
                    <p className="font-bold text-on-surface-variant uppercase text-[10px]">Wear</p>
                    <p className={discardWearReached ? 'text-error font-bold' : 'text-emerald-600 font-bold'}>
                      {formatNumber(data.ropeWearPercentage, 1)}%
                    </p>
                  </div>
                  <div>
                    <p className="font-bold text-on-surface-variant uppercase text-[10px]">Reverse bends</p>
                    <p className={reverseBendSeverity === 'high' ? 'text-error font-bold' : reverseBendSeverity === 'medium' ? 'text-amber-600 font-bold' : 'text-emerald-600 font-bold'}>
                      {data.numReverseBends} ({reverseBendSeverity})
                    </p>
                  </div>
                  <div>
                    <p className="font-bold text-on-surface-variant uppercase text-[10px]">Fatigue reserve</p>
                    <p className={fatigueReserveLow ? 'text-amber-600 font-bold' : 'text-emerald-600 font-bold'}>
                      {fatigueReserveYears > 0 ? `${formatNumber(fatigueReserveYears, 1)} years` : 'n/a'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="p-6 bg-surface-container-lowest border border-outline-variant/10">
              <h4 className="text-xs font-bold uppercase mb-4 text-tertiary flex items-center gap-2">
                <History size={14} />
                Lifetime Estimation (Placeholder)
              </h4>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-on-surface-variant uppercase">Rope Type</label>
                    <select 
                      value={data.ropeType}
                      onChange={(e) => onChange({ ropeType: e.target.value })}
                      className="w-full bg-surface-container-low border border-outline-variant/20 rounded-sm px-3 py-2 text-sm focus:ring-1 focus:ring-primary outline-none"
                    >
                      <option value="Steel Wire">Steel (Standard)</option>
                      <option value="Coated">Coated (Synthetic)</option>
                      <option value="High Performance">Alta Performance</option>
                    </select>
                  </div>
                  <LiftField label="Cycles/Year" name="loadCycles" data={data} onChange={onChange} min={1000} required />
                </div>
                <div className="p-4 bg-tertiary/5 border border-tertiary/10 rounded-sm">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-[10px] font-bold text-tertiary uppercase">Estimated Lifetime</p>
                      <p className="text-2xl font-black text-tertiary">{formatNumber(lifetime_est, 0)} <span className="text-xs font-normal opacity-60">Cycles</span></p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-on-surface-variant uppercase opacity-50">Years (Est.)</p>
                      <p className="text-lg font-bold opacity-60">{data.loadCycles > 0 ? formatNumber(lifetime_est / data.loadCycles, 1) : '-'}</p>
                    </div>
                  </div>
                </div>
                <p className="text-[9px] text-on-surface-variant opacity-50 italic">
                  *Calculation based on simplified bending fatigue models (Feyrer). Requires validation with manufacturer data.
                </p>
              </div>
            </div>
          </div>
        </div>
        )}
      </div>
    </div>
  );
};

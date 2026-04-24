import React from 'react';
import { ProjectData, ModuleStatus } from '../types';
import { safeNumber, formatNumber, degToRad, InputGroup, LiftField, SliderField, CollapsibleSection } from '../components/ui';
import { GUIDE_RAIL_PRESETS, GUIDE_ROLLER_PRESETS, BELT_PROFILES } from '../constants';
import { CheckCircle2, ShieldCheck, Zap, AlertTriangle, Info, ChevronRight, Calculator, FileText, Database, Activity, Package, Maximize, AlertCircle, PlayCircle, Settings, CheckSquare, XCircle, Settings2 } from 'lucide-react';
import { BlockMath, InlineMath } from 'react-katex';
import { computeLiftCalculations } from '../lib/calculations';

export const GuideRailsModule = ({ data, onChange, view = 'all' }: { data: ProjectData, onChange: (newData: Partial<ProjectData>) => void, view?: 'all' | 'params' | 'forces' | 'verify' }) => {
  const g = 9.81;
  const E = data.materialE;
  const l = data.bracketDist;
  
  const { guideRails } = computeLiftCalculations(data);
  const logic = computeLiftCalculations(data).systemLogic;
  
  // 1. Bending Stress (Combined X and Y)
  const Fh = (data.ratedLoad + data.carMass) * g * 0.1;
  const Mm = (3 * Fh * l) / 16;
  
  // Stress in Y (using Wy)
  const sigma_my = data.railWy > 0 ? Mm / data.railWy : 0;
  // Stress in X (using Wx) - Assuming 50% horizontal load distribution for pre-dimensioning
  const sigma_mx = data.railWx > 0 ? (Mm * 0.5) / data.railWx : 0; 
  
  const sigma_m = Math.sqrt(Math.pow(sigma_my, 2) + Math.pow(sigma_mx, 2));

  // 2. Buckling (Omega Method - ISO 8100-2 Annex B)
  // Slenderness ratio (lambda) = l / i
  const lambda_y = data.railIyRadius > 0 ? l / data.railIyRadius : 0;
  const lambda_x = data.railIxRadius > 0 ? l / data.railIxRadius : 0;
  const lambda = Math.max(lambda_y, lambda_x);
  
  // Full Omega factor calculation for S235 (ISO 8100-2:2026)
  let omega = 1;
  if (lambda <= 20) {
    omega = 1.0;
  } else if (lambda <= 115) {
    // Polynomial fit for S235 omega curve
    omega = 1 + 0.0001 * Math.pow(lambda, 2);
  } else {
    // Euler buckling region
    omega = 0.00007 * Math.pow(lambda, 2);
  }

  // Fv (Vertical force on rail)
  const F_safety_gear = (data.ratedLoad + data.carMass) * g * 0.6;
  const F_rail_weight = data.railWeight * data.travel * g;
  const Fv = F_safety_gear + F_rail_weight;
  
  const sigma_k = data.railArea > 0 ? (Fv * omega) / data.railArea : 0;

  // 3. Combined Stresses (Clause 4.10.4)
  // Case: Safety Gear Operation
  const sigma_combined = sigma_k + 0.9 * sigma_m;

  // 4. Deflection (Formula 20/21)
  // delta = (Fh * l^3) / (48 * E * I)
  const delta_y = (data.railIy > 0 && E > 0) ? (Fh * Math.pow(l, 3)) / (48 * E * data.railIy) : 0;
  const delta_x = (data.railIx > 0 && E > 0) ? ((Fh * 0.5) * Math.pow(l, 3)) / (48 * E * data.railIx) : 0;
  const delta = Math.sqrt(Math.pow(delta_y, 2) + Math.pow(delta_x, 2));

  // ISO 8100-2:2026 Clause 4.10.6 Deflection Limits
  // For car rails: 5mm
  // For CWT rails with safety gear: 10mm
  // For CWT rails without safety gear: no limit specified but 10mm is common practice
  const deflectionLimit = 5; 
  const isDeflectionOk = delta < deflectionLimit;

  const isBendingOk = sigma_m < data.materialYield;
  const isBucklingOk = sigma_k < data.materialYield;
  const isCombinedOk = sigma_combined < data.materialYield;

  const bendingUtilization = (sigma_m / data.materialYield) * 100;
  const bucklingUtilization = (sigma_k / data.materialYield) * 100;
  const combinedUtilization = (sigma_combined / data.materialYield) * 100;
  const deflectionUtilization = (delta / deflectionLimit) * 100;
  const isSetupView = view === 'all' || view === 'params';
  const cockpitMetrics = [
    { label: 'Profile', value: data.railProfile || data.guideType || 'Custom' },
    { label: 'Combined Stress', value: `${formatNumber(sigma_combined)} N/mm²` },
    { label: 'Deflection', value: `${formatNumber(delta)} mm` },
    { label: 'Bracket Span', value: `${data.bracketDist} mm` },
  ];

  return (
    <div className="space-y-8">
      <div className="rounded-sm border border-outline-variant/20 bg-surface-container-low p-8">
        <div className="mb-8 grid grid-cols-1 gap-4 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-sm border border-outline-variant/20 bg-gradient-to-br from-surface-container-high to-surface-container-lowest p-6">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-primary">
              <Activity size={12} />
              Rail cockpit
            </div>
            <h3 className="text-2xl font-black tracking-tight text-on-surface">Guide Rails Calculation (4.10)</h3>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-on-surface-variant">
              Work this page to size the rail, check the span and confirm stress plus deflection.
            </p>
          </div>
          <div className="rounded-sm border border-outline-variant/20 bg-surface-container-lowest p-6">
            <div className="mb-4 flex items-center gap-2">
              <Settings2 size={14} className="text-primary" />
              <h4 className="text-[11px] font-black uppercase tracking-[0.22em] text-white">Live Rail State</h4>
            </div>
            <div className="space-y-3">
              {cockpitMetrics.map((metric) => (
                <div key={metric.label} className="flex items-center justify-between gap-4 rounded-sm border border-outline-variant/20 bg-surface-container-low p-3">
                  <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-on-surface-variant">{metric.label}</span>
                  <span className="text-sm font-black text-on-surface">{metric.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xl font-bold">Guide Rails Calculation (4.10)</h3>
          <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-300">Implemented (ISO 8100-2)</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="p-4 bg-surface-container-low border border-outline-variant/10 rounded-sm">
            <p className="text-[10px] font-bold uppercase opacity-50 mb-1">Bracket Distance (l)</p>
            <p className="text-xl font-black">{data.bracketDist} mm</p>
          </div>
          <div className="p-4 bg-surface-container-low border border-outline-variant/10 rounded-sm">
            <p className="text-[10px] font-bold uppercase opacity-50 mb-1">Elastic Modulus (E)</p>
            <p className="text-xl font-black">{formatNumber(data.materialE / 1000, 0)} <span className="text-xs font-normal">GPa</span></p>
          </div>
          <div className="p-4 bg-surface-container-low border border-outline-variant/10 rounded-sm">
            <p className="text-[10px] font-bold uppercase opacity-50 mb-1">Yield Strength (Rp0.2)</p>
            <p className="text-xl font-black">{data.materialYield} <span className="text-xs font-normal">N/mm²</span></p>
          </div>
          <div className="p-4 bg-surface-container-low border border-outline-variant/10 rounded-sm">
            <p className="text-[10px] font-bold uppercase opacity-50 mb-1">Rail Preset Selection</p>
            <select 
              value={data.railPresetId || (data.railProfile === 'Custom' ? 'Custom' : '')}
              disabled={!isSetupView}
              onChange={(e) => {
                const profile = GUIDE_RAIL_PRESETS.find((preset) => preset.id === e.target.value);
                if (profile) {
                  onChange({ 
                    railPresetId: profile.id,
                    railProfile: profile.profile,
                    railArea: profile.A,
                    railIy: profile.Iy,
                    railIx: profile.Ix,
                    railWy: profile.Wy,
                    railWx: profile.Wx,
                    railIyRadius: profile.iy,
                    railIxRadius: profile.ix,
                    railWeight: profile.q,
                    guideType: `${profile.manufacturer} ${profile.model}`
                  });
                } else {
                  onChange({
                    railPresetId: '',
                    railProfile: e.target.value === 'Custom' ? 'Custom' : data.railProfile,
                    guideType: e.target.value === 'Custom' ? 'Custom' : data.guideType
                  });
                }
              }}
              className={`w-full bg-transparent text-xl font-black outline-none text-primary ${isSetupView ? 'cursor-pointer' : 'cursor-not-allowed opacity-70'}`}
            >
              <option value="">Select Profile...</option>
              {GUIDE_RAIL_PRESETS.map((preset) => (
                <option key={preset.id} value={preset.id}>
                  {preset.manufacturer} {preset.model} ({preset.profile})
                </option>
              ))}
              <option value="Custom">Custom Profile</option>
            </select>
          </div>
        </div>

        {!isSetupView && (
          <div className="mb-8 rounded-sm border border-primary/20 bg-primary/5 p-4">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-primary">Single source of truth</p>
            <p className="mt-2 text-xs leading-relaxed text-on-surface-variant">
              Rail profile selection is locked in this view. Change presets and section properties only in <strong>Guide Rail Setup</strong>; this tab is read-only for interpretation and verification.
            </p>
          </div>
        )}

        {(view === 'all' || view === 'params') && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <InputGroup label="Rail Geometric Properties">
            <LiftField disabled={data.railProfile !== 'Custom'} label="Section Area (A)" name="railArea" unit="mm²" data={data} onChange={onChange} min={100} required suggestion="Increase section area to reduce combined stress." />
            <LiftField disabled={data.railProfile !== 'Custom'} label="Inertia Moment (Iy)" name="railIy" unit="mm⁴" data={data} onChange={onChange} min={1000} required suggestion="Higher Iy reduces deflection in the Y axis." />
            <LiftField disabled={data.railProfile !== 'Custom'} label="Inertia Moment (Ix)" name="railIx" unit="mm⁴" data={data} onChange={onChange} min={1000} required suggestion="Higher Ix reduces deflection in the X axis." />
            <LiftField disabled={data.railProfile !== 'Custom'} label="Section Modulus (Wy)" name="railWy" unit="mm³" data={data} onChange={onChange} min={100} required suggestion="Wy directly affects bending stress capacity." />
            <LiftField disabled={data.railProfile !== 'Custom'} label="Section Modulus (Wx)" name="railWx" unit="mm³" data={data} onChange={onChange} min={100} required />
            <LiftField disabled={data.railProfile !== 'Custom'} label="Gyration Radius (iy)" name="railIyRadius" unit="mm" data={data} onChange={onChange} min={1} required suggestion="Radius of gyration affects buckling stability." />
            <LiftField disabled={data.railProfile !== 'Custom'} label="Gyration Radius (ix)" name="railIxRadius" unit="mm" data={data} onChange={onChange} min={1} required />
            <LiftField disabled={data.railProfile !== 'Custom'} label="Rail Weight (q1)" name="railWeight" unit="kg/m" data={data} onChange={onChange} min={1} max={100} required />
          </InputGroup>

          <InputGroup label="Material & Installation">
            <LiftField label="Elastic Modulus (E)" name="materialE" unit="N/mm²" data={data} onChange={onChange} min={100000} max={300000} required />
            <LiftField label="Yield Strength (Rp0.2)" name="materialYield" unit="N/mm²" data={data} onChange={onChange} min={100} max={600} required suggestion="Use higher grade steel (e.g. S355) if stresses are too high." />
            <LiftField label="Bracket Distance (l)" name="bracketDist" unit="mm" data={data} onChange={onChange} min={500} max={6000} required suggestion="Reduce bracket distance to significantly lower bending stress and deflection." />
            <LiftField label="Joint Bolts per side" name="railNumBoltsPerJoint" unit="" data={data} onChange={onChange} min={4} max={16} step={2} suggestion="Typical fishplate connection" />
            <LiftField label="Bolt Diameter" name="railBoltDiameter" unit="mm" data={data} onChange={onChange} min={8} max={24} step={2} />
            <div className="space-y-1 mt-4">
              <label className="text-[10px] font-bold uppercase opacity-60">Rail Lubrication Condition</label>
              <select 
                value={data.railLubrication}
                onChange={(e) => onChange({ railLubrication: e.target.value as any })}
                className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded px-3 py-2 text-sm outline-none focus:border-primary transition-colors"
              >
                <option value="dry">Dry (No lubrication)</option>
                <option value="oiled">Oiled</option>
                <option value="machined">Special Machined (Greased)</option>
              </select>
            </div>
            <div className="md:col-span-2 mt-4 rounded-sm border border-primary/20 bg-primary/5 p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-primary">Guide interface logic</p>
              <p className="mt-2 text-xs leading-relaxed text-on-surface-variant">
                Current operating envelope recommends <strong>{logic.recommendedGuideInterfaceType}</strong>.
                {logic.requiresGuideRollers ? ' Rollers are expected for seismic/high-speed duty.' : ' Sliding guides remain acceptable in this envelope.'}
              </p>
            </div>
            <div className="space-y-1 md:col-span-2">
              <label className="text-[11px] font-bold text-on-surface-variant uppercase">Guide Interface</label>
              <select
                value={data.guideInterfaceType}
                onChange={(e) => onChange({ guideInterfaceType: e.target.value as ProjectData['guideInterfaceType'] })}
                className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-sm px-3 py-2 text-sm outline-none"
              >
                <option value="sliding">Sliding Guide Shoes</option>
                <option value="roller">Guide Rollers / Rodadeiras</option>
              </select>
            </div>
            {data.guideInterfaceType === 'roller' && (
              <>
                <div className="space-y-1 md:col-span-2">
                  <label className="text-[11px] font-bold text-on-surface-variant uppercase">Guide Roller Preset</label>
                  <select
                    value={data.guideRollerPresetId || ''}
                    onChange={(e) => {
                      const preset = GUIDE_ROLLER_PRESETS.find((item) => item.id === e.target.value);
                      if (!preset) return;
                      onChange({
                        guideRollerPresetId: preset.id,
                        guideRollerWheelMaterial: preset.wheelMaterial as ProjectData['guideRollerWheelMaterial'],
                        guideRollerIndependentAxes: preset.independentAxes,
                        guideRollerClearanceX: preset.clearanceX,
                        guideRollerClearanceY: preset.clearanceY,
                        guideRollerClearanceZ: preset.clearanceZ,
                        guideRollerSpringStiffness: preset.springStiffness,
                      });
                    }}
                    className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-sm px-3 py-2 text-sm outline-none"
                  >
                    <option value="">Select guide roller...</option>
                    {GUIDE_ROLLER_PRESETS.map((preset) => (
                      <option key={preset.id} value={preset.id}>
                        {preset.manufacturer} {preset.model}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-on-surface-variant uppercase">Wheel Material</label>
                  <select
                    value={data.guideRollerWheelMaterial}
                    onChange={(e) => onChange({ guideRollerPresetId: '', guideRollerWheelMaterial: e.target.value as ProjectData['guideRollerWheelMaterial'] })}
                    className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-sm px-3 py-2 text-sm outline-none"
                  >
                    <option value="nylon">Nylon</option>
                    <option value="polyurethane">Polyurethane</option>
                    <option value="steel">Steel</option>
                  </select>
                </div>
                <div className="flex items-center gap-3 rounded-sm border border-outline-variant/20 bg-surface-container-lowest p-3">
                  <input
                    type="checkbox"
                    checked={data.guideRollerIndependentAxes}
                    onChange={(e) => onChange({ guideRollerPresetId: '', guideRollerIndependentAxes: e.target.checked })}
                    className="rounded-sm border-outline-variant/30 text-primary focus:ring-primary"
                  />
                  <label className="text-[11px] font-bold text-on-surface-variant uppercase">Independent 3-Axis Suspension</label>
                </div>
                <LiftField label="Roller Clearance X" name="guideRollerClearanceX" unit="mm" data={data} onChange={(newData) => onChange({ guideRollerPresetId: '', ...newData })} min={0.2} max={5} step={0.1} />
                <LiftField label="Roller Clearance Y" name="guideRollerClearanceY" unit="mm" data={data} onChange={(newData) => onChange({ guideRollerPresetId: '', ...newData })} min={0.2} max={5} step={0.1} />
                <LiftField label="Roller Clearance Z" name="guideRollerClearanceZ" unit="mm" data={data} onChange={(newData) => onChange({ guideRollerPresetId: '', ...newData })} min={0.2} max={5} step={0.1} />
                <LiftField label="Spring Stiffness" name="guideRollerSpringStiffness" unit="N/mm" data={data} onChange={(newData) => onChange({ guideRollerPresetId: '', ...newData })} min={50} max={1000} step={10} />
              </>
            )}
          </InputGroup>
        </div>
        )}

        {(view === 'all' || view === 'forces') && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <InputGroup label="Forces & Displacements">
            <LiftField label="Auxiliary Force (Faux)" name="Faux" unit="N" data={data} onChange={onChange} min={0} max={10000} suggestion="Force exerted by auxiliary equipment." />
            <LiftField label="Structural Disp. X" name="delta_str_x" unit="mm" data={data} onChange={onChange} min={0} max={50} step={0.1} suggestion="Displacement of building structure in X." />
            <LiftField label="Structural Disp. Y" name="delta_str_y" unit="mm" data={data} onChange={onChange} min={0} max={50} step={0.1} suggestion="Displacement of building structure in Y." />
          </InputGroup>
        </div>
        )}

        {(view === 'all' || view === 'verify') && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className={`p-6 border ${isBendingOk ? 'bg-surface-container-lowest border-outline-variant/10' : 'bg-error-container/10 border-error/20'}`}>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-xs font-bold uppercase text-primary">Bending Stress (σm)</h4>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${isBendingOk ? 'bg-emerald-100 text-emerald-700' : 'bg-error-container text-error'}`}>
                {formatNumber(bendingUtilization, 1)}%
              </span>
            </div>
            <p className="text-2xl font-black">{formatNumber(sigma_m)} <span className="text-xs font-normal opacity-50">N/mm²</span></p>
            <div className="mt-2 h-1 bg-surface-container-low rounded-full overflow-hidden">
              <div 
                className={`h-full ${isBendingOk ? 'bg-emerald-500' : 'bg-error'}`} 
                style={{ width: `${Math.min(bendingUtilization, 100)}%` }}
              />
            </div>
            <div className="mt-4 flex items-center gap-2">
              {isBendingOk ? <CheckCircle2 size={14} className="text-emerald-600" /> : <XCircle size={14} className="text-error" />}
              <span className="text-[10px] font-bold uppercase opacity-70">Limit (Rp0.2): {data.materialYield}</span>
            </div>
            <div className="mt-3 pt-3 border-t border-outline-variant/10 grid grid-cols-2 gap-2 text-[10px] opacity-60 font-mono">
              <div>σmx: {formatNumber(sigma_mx)}</div>
              <div>σmy: {formatNumber(sigma_my)}</div>
            </div>
          </div>

          <div className={`p-6 border ${isBucklingOk ? 'bg-surface-container-lowest border-outline-variant/10' : 'bg-error-container/10 border-error/20'}`}>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-xs font-bold uppercase text-primary">Buckling Stress (σk)</h4>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${isBucklingOk ? 'bg-emerald-100 text-emerald-700' : 'bg-error-container text-error'}`}>
                {formatNumber(bucklingUtilization, 1)}%
              </span>
            </div>
            <p className="text-2xl font-black">{formatNumber(sigma_k)} <span className="text-xs font-normal opacity-50">N/mm²</span></p>
            <div className="mt-2 h-1 bg-surface-container-low rounded-full overflow-hidden">
              <div 
                className={`h-full ${isBucklingOk ? 'bg-emerald-500' : 'bg-error'}`} 
                style={{ width: `${Math.min(bucklingUtilization, 100)}%` }}
              />
            </div>
            <div className="mt-4 flex items-center gap-2">
              {isBucklingOk ? <CheckCircle2 size={14} className="text-emerald-600" /> : <XCircle size={14} className="text-error" />}
              <span className="text-[10px] font-bold uppercase opacity-70">Limit (Rp0.2): {data.materialYield}</span>
            </div>
            <div className="mt-3 pt-3 border-t border-outline-variant/10 grid grid-cols-2 gap-2 text-[10px] opacity-60 font-mono">
              <div>λ: {formatNumber(lambda, 1)}</div>
              <div>ω: {formatNumber(omega, 2)}</div>
            </div>
          </div>

          <div className={`p-6 border ${isCombinedOk ? 'bg-surface-container-lowest border-outline-variant/10' : 'bg-error-container/10 border-error/20'}`}>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-xs font-bold uppercase text-primary">Combined Stress (σ)</h4>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${isCombinedOk ? 'bg-emerald-100 text-emerald-700' : 'bg-error-container text-error'}`}>
                {formatNumber(combinedUtilization, 1)}%
              </span>
            </div>
            <p className="text-2xl font-black">{formatNumber(sigma_combined)} <span className="text-xs font-normal opacity-50">N/mm²</span></p>
            <div className="mt-2 h-1 bg-surface-container-low rounded-full overflow-hidden">
              <div 
                className={`h-full ${isCombinedOk ? 'bg-emerald-500' : 'bg-error'}`} 
                style={{ width: `${Math.min(combinedUtilization, 100)}%` }}
              />
            </div>
            <div className="mt-4 flex items-center gap-2">
              {isCombinedOk ? <CheckCircle2 size={14} className="text-emerald-600" /> : <XCircle size={14} className="text-error" />}
              <span className="text-[10px] font-bold uppercase opacity-70">Limit (Rp0.2): {data.materialYield}</span>
            </div>
            <div className="mt-3 pt-3 border-t border-outline-variant/10 text-[10px] opacity-60 font-mono">
              σ = σk + 0.9σm (Clause 4.10.4)
            </div>
          </div>

          <div className={`p-6 border ${isDeflectionOk ? 'bg-surface-container-lowest border-outline-variant/10' : 'bg-error-container/10 border-error/20'}`}>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-xs font-bold uppercase text-primary">Deflection (δ)</h4>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${isDeflectionOk ? 'bg-emerald-100 text-emerald-700' : 'bg-error-container text-error'}`}>
                {formatNumber(deflectionUtilization, 1)}%
              </span>
            </div>
            <p className="text-2xl font-black">{formatNumber(delta)} <span className="text-xs font-normal opacity-50">mm</span></p>
            <div className="mt-2 h-1 bg-surface-container-low rounded-full overflow-hidden">
              <div 
                className={`h-full ${isDeflectionOk ? 'bg-emerald-500' : 'bg-error'}`} 
                style={{ width: `${Math.min(deflectionUtilization, 100)}%` }}
              />
            </div>
            <div className="mt-4 flex items-center gap-2">
              {isDeflectionOk ? <CheckCircle2 size={14} className="text-emerald-600" /> : <XCircle size={14} className="text-error" />}
              <span className="text-[10px] font-bold uppercase opacity-70">Limit: {deflectionLimit} mm</span>
            </div>
            <div className="mt-3 pt-3 border-t border-outline-variant/10 grid grid-cols-2 gap-2 text-[10px] opacity-60 font-mono">
              <div>δx: {formatNumber(delta_x)}</div>
              <div>δy: {formatNumber(delta_y)}</div>
            </div>
          </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div className={`p-6 border ${guideRails.railConnectionStress < data.materialYield / 2 ? 'bg-surface-container-lowest border-outline-variant/10' : 'bg-error-container/10 border-error/20'}`}>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-xs font-bold uppercase text-primary">Rail Fastening (Bolt Stress)</h4>
              </div>
              <p className="text-2xl font-black">{formatNumber(guideRails.railConnectionStress)} <span className="text-xs font-normal opacity-50">N/mm²</span></p>
              <div className="mt-4 flex items-center gap-2">
                {guideRails.railConnectionStress < data.materialYield / 2 ? <CheckCircle2 size={14} className="text-emerald-600" /> : <AlertTriangle size={14} className="text-amber-500" />}
                <span className="text-[10px] font-bold uppercase opacity-70">Safety Limit (50% yield): {formatNumber(data.materialYield / 2)}</span>
              </div>
            </div>

            <div className="p-6 border bg-surface-container-lowest border-outline-variant/10">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-xs font-bold uppercase text-primary">Fatigue Life Estimate</h4>
              </div>
              <p className="text-2xl font-black">{formatNumber(guideRails.estimatedFatigueLife / 1000000, 1)} <span className="text-xs font-normal opacity-50">Million Cycles</span></p>
              <div className="mt-4 flex items-center gap-2">
                <CheckCircle2 size={14} className="text-emerald-600" />
                <span className="text-[10px] font-bold uppercase opacity-70">Factor scaled by lubrication: {data.railLubrication}</span>
              </div>
            </div>
          </div>

        <div className="mt-8 space-y-6">
          <CollapsibleSection title="ISO 8100-2:2026 Guide Rail Formula Details" icon={Info}>
            <div className="space-y-4 text-sm text-on-surface-variant leading-relaxed">
              <p>
                <strong>Clause 4.10:</strong> Guide rails must be verified for bending, buckling, and deflection under various load cases (safety gear operation, normal travel, loading).
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <div className="p-4 bg-surface-container-low rounded border border-outline-variant/10">
                  <h5 className="font-bold text-primary mb-2 uppercase text-[10px]">Bending Stress ($\sigma_m$)</h5>
                  <p className="text-xs mb-2">Calculated based on the horizontal force $F_h$ and bracket distance $l$:</p>
                  <InlineMath math="\sigma_m = \frac{M_m}{W} = \frac{3 \cdot F_h \cdot l}{16 \cdot W}" />
                  <p className="text-[10px] mt-2 opacity-70">Where $M_m$ is the bending moment and $W$ is the section modulus.</p>
                </div>
                <div className="p-4 bg-surface-container-low rounded border border-outline-variant/10">
                  <h5 className="font-bold text-primary mb-2 uppercase text-[10px]">Buckling Stress ($\sigma_k$)</h5>
                  <p className="text-xs mb-2">Verified using the Omega method ($\omega$) for the vertical force $F_v$:</p>
                  <InlineMath math="\sigma_k = \frac{F_v \cdot \omega}{A}" />
                  <p className="text-[10px] mt-2 opacity-70">Where $A$ is the cross-sectional area and $\omega$ is the buckling factor.</p>
                </div>
              </div>
            </div>
          </CollapsibleSection>

          <div className="p-6 bg-surface-container-lowest border border-outline-variant/10">
            <h4 className="text-xs font-bold uppercase mb-4 text-primary flex items-center gap-2">
              <Settings2 size={14} />
              Profile Properties ({data.guideType})
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <LiftField disabled={!isSetupView || data.railProfile !== 'Custom'} label="Area (A)" name="railArea" unit="mm²" data={data} onChange={onChange} min={0} max={10000} />
              <LiftField disabled={!isSetupView || data.railProfile !== 'Custom'} label="Inertia (Iy)" name="railIy" unit="mm⁴" data={data} onChange={onChange} min={0} max={10000000} />
              <LiftField disabled={!isSetupView || data.railProfile !== 'Custom'} label="Inertia (Ix)" name="railIx" unit="mm⁴" data={data} onChange={onChange} min={0} max={10000000} />
              <LiftField disabled={!isSetupView || data.railProfile !== 'Custom'} label="Radius (iy)" name="railIyRadius" unit="mm" data={data} onChange={onChange} min={0} max={100} />
              <LiftField disabled={!isSetupView || data.railProfile !== 'Custom'} label="Radius (ix)" name="railIxRadius" unit="mm" data={data} onChange={onChange} min={0} max={100} />
              <LiftField disabled={!isSetupView || data.railProfile !== 'Custom'} label="Modulus (Wy)" name="railWy" unit="mm³" data={data} onChange={onChange} min={0} max={100000} />
              <LiftField disabled={!isSetupView || data.railProfile !== 'Custom'} label="Modulus (Wx)" name="railWx" unit="mm³" data={data} onChange={onChange} min={0} max={100000} />
              <LiftField disabled={!isSetupView || data.railProfile !== 'Custom'} label="Weight (q1)" name="railWeight" unit="kg/m" data={data} onChange={onChange} min={0} max={100} />
              <LiftField disabled={!isSetupView} label="Bracket Dist. (l)" name="bracketDist" unit="mm" data={data} onChange={onChange} min={0} max={5000} />
            </div>
          </div>

          <div className="p-6 bg-primary/5 border border-primary/10 rounded-sm">
            <h4 className="text-xs font-bold uppercase mb-4 flex items-center gap-2">
              <Info size={14} className="text-primary" />
              Calculation Notes (ISO 8100-2:2026)
            </h4>
            <div className="font-mono text-[10px] space-y-2 opacity-70">
              <p>• Bending: Combined stress σm = √(σmx² + σmy²) ≤ Rp0.2</p>
              <p>• Buckling: Omega method (σk = (Fv · ω) / A ≤ Rp0.2)</p>
              <p>• Fv includes safety gear force and rail self-weight (q1 · H)</p>
              <p>• Deflection: Resultant δ = √(δx² + δy²) ≤ 5.0mm</p>
            </div>
          </div>
        </div>
        </div>
        )}
      </div>
    </div>
  );
};

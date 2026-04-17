import React, { useMemo } from 'react';
import { ProjectData, ModuleStatus } from '../types';
import { safeNumber, formatNumber, degToRad, InputGroup, LiftField, SliderField, CollapsibleSection } from '../components/ui';
import { ISO_RAIL_PROFILES, BELT_PROFILES } from '../constants';
import { CheckCircle2, ShieldCheck, Zap, AlertTriangle, Info, ChevronRight, Calculator, FileText, Database, Activity, Package, Maximize, AlertCircle, PlayCircle, Settings, CheckSquare, History } from 'lucide-react';
import { BlockMath, InlineMath } from 'react-katex';
import { computeLiftCalculations } from '../lib/calculations';

export const RopesModule = ({ data, onChange }: { data: ProjectData, onChange: (newData: Partial<ProjectData>) => void }) => {
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

  return (
    <div className="space-y-8">
      <div className="bg-surface-container-low p-8 border-t-2 border-tertiary">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xl font-bold">Evaluation of Safety Factor of Ropes (4.12)</h3>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${isSfOk ? 'bg-emerald-100 text-emerald-700' : 'bg-error-container/20 text-error'}`}>
            {isSfOk ? 'Implemented - OK' : 'Implemented - NOK'}
          </span>
        </div>

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
                onChange({ suspensionType: type, ropeType: '' });
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
              value={data.ropeType}
              onChange={(e) => {
                const belt = BELT_PROFILES.find(b => b.id === e.target.value);
                if (belt) {
                  onChange({ 
                    ropeType: belt.label,
                    beltWidth: belt.width,
                    beltThickness: belt.thickness,
                    numBelts: 1, // Reset to 1 by default for a single belt profile unless specified
                    beltTensileStrength: belt.mbf,
                    ropeBreakingLoad: belt.mbf,
                    ropeDiameter: belt.thickness // For D/d calculation
                  });
                } else {
                  onChange({ ropeType: e.target.value });
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
                  <option value="Steel Wire">Steel (Standard)</option>
                  <option value="Coated">Coated (Synthetic)</option>
                </optgroup>
              )}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          {data.suspensionType !== 'belt' && (
          <InputGroup label="Suspension Parameters">
            <LiftField label="Number of Ropes (n)" name="numRopes" data={data} onChange={onChange} min={1} required suggestion="Increase number of ropes to improve safety factor." />
            <LiftField label="Diameter (d)" name="ropeDiameter" unit="mm" data={data} onChange={onChange} min={4} max={20} required suggestion="D/d ratio must be ≥ 40 for steel ropes." />
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-on-surface-variant uppercase">Rope Grade (ISO 4344)</label>
              <select 
                value={data.ropeGrade}
                onChange={(e) => onChange({ ropeGrade: parseInt(e.target.value) })}
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
            <LiftField label="Actual Breaking Load" name="ropeBreakingLoad" unit="N" data={data} onChange={onChange} min={1000} required suggestion={`Should be >= ${formatNumber(iso4344_Fmin)} N per ISO 4344.`} />
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
            <LiftField label="Belt Width" name="beltWidth" unit="mm" data={data} onChange={onChange} min={1} max={100} />
            <LiftField label="Belt Thickness" name="beltThickness" unit="mm" data={data} onChange={onChange} min={1} max={20} />
            <LiftField label="Number of Belts" name="numBelts" data={data} onChange={onChange} min={1} max={10} />
            <LiftField label="Tensile Strength / Belt" name="beltTensileStrength" unit="N" data={data} onChange={onChange} min={1000} max={100000} />
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="p-4 bg-surface-container-lowest border border-outline-variant/10">
              <h4 className="text-xs font-bold uppercase mb-2">Formulas (ISO 8100-2:2026)</h4>
              <div className="font-mono text-[10px] space-y-1 opacity-70">
                <p>• Sf = 10^(2.6834 - log(N_equiv / 2.6834e6) / log(D/d)) [Formula 36]</p>
                <p>• N_equiv = N_ps + 4 · N_pr</p>
              </div>
            </div>
            
            <div className="p-6 bg-slate-900 text-white rounded-sm">
              <h4 className="text-xs font-bold uppercase tracking-widest text-indigo-300 mb-4 flex items-center gap-2">
                <AlertTriangle size={14} />
                Discard Criteria (4.14)
              </h4>
              <ul className="text-[10px] space-y-2 opacity-80">
                <li>• Reduction of nominal diameter &gt; 6%</li>
                <li>• Severe corrosion or visible deformation</li>
                <li>• Number of broken wires exceeds ISO 4344 limit</li>
                <li className="pt-2 border-t border-white/10 text-indigo-200 font-bold italic">
                  Ready for integration with IoT monitoring sensors.
                </li>
              </ul>
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
      </div>
    </div>
  );
};

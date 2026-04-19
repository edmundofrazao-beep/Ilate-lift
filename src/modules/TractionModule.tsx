import React from 'react';
import { ProjectData, ModuleStatus } from '../types';
import { safeNumber, formatNumber, degToRad, InputGroup, LiftField, SliderField, CollapsibleSection } from '../components/ui';
import { ISO_RAIL_PROFILES, BELT_PROFILES } from '../constants';
import { CheckCircle2, ShieldCheck, Zap, AlertTriangle, Info, ChevronRight, Calculator, FileText, Database, Activity, Package, Maximize, AlertCircle, PlayCircle, Settings, CheckSquare, Settings2 } from 'lucide-react';
import { BlockMath, InlineMath } from 'react-katex';
import { computeLiftCalculations } from '../lib/calculations';

export const TractionModule = ({ data, onChange, view = 'all' }: { data: ProjectData, onChange: (newData: Partial<ProjectData>) => void, view?: 'all' | 'params' | 'verify' }) => {
  const calc = computeLiftCalculations(data);
  const { T1_static, ratio_static, ratio_dynamic, isOk, DdRatio, p_groove, p_allow, expMuAlpha } = calc.traction;
  
  return (
    <div className="space-y-8">
      <div className={`grid grid-cols-1 ${view === 'all' ? 'lg:grid-cols-3' : ''} gap-6`}>
        
        {(view === 'all' || view === 'verify') && (
          <div className={`${view === 'all' ? 'lg:col-span-2' : ''} space-y-6`}>
            <div className="bg-surface-container-low p-6 border-t-2 border-primary">
              <h3 className="text-lg font-bold mb-6 flex items-center justify-between">
                Traction Verification (ISO 8100-2:2026)
                <span className={`text-xs px-3 py-1 rounded-full font-bold uppercase ${isOk ? 'bg-emerald-100 text-emerald-700' : 'bg-error-container/20 text-error'}`}>
                  {isOk ? 'Compliant' : 'Non-Compliant'}
                </span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="p-4 bg-surface-container-lowest border border-outline-variant/10">
                    <p className="text-[10px] font-bold text-on-surface-variant uppercase mb-1">Static Ratio (T1/T2)</p>
                    <p className="text-xl font-black">{formatNumber(ratio_static)}</p>
                    <div className="mt-2 h-1 bg-surface-container-high rounded-full overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: `${Math.min(100, (ratio_static/expMuAlpha)*100)}%` }} />
                    </div>
                  </div>
                  <div className="p-4 bg-surface-container-lowest border border-outline-variant/10">
                    <p className="text-[10px] font-bold text-on-surface-variant uppercase mb-1">Dynamic Ratio (T1/T2)</p>
                    <p className="text-xl font-black">{formatNumber(ratio_dynamic)}</p>
                    <div className="mt-2 h-1 bg-surface-container-high rounded-full overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: `${Math.min(100, (ratio_dynamic/expMuAlpha)*100)}%` }} />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="p-4 bg-surface-container-lowest border border-outline-variant/10">
                    <p className="text-[10px] font-bold text-on-surface-variant uppercase mb-1">Traction Limit (e^fα)</p>
                    <p className="text-xl font-black">{formatNumber(expMuAlpha)}</p>
                  </div>
                  <div className="p-4 bg-surface-container-lowest border border-outline-variant/10">
                    <p className="text-[10px] font-bold text-on-surface-variant uppercase mb-1">Specific Pressure</p>
                    <p className={`text-xl font-black ${p_groove > p_allow ? 'text-error' : ''}`}>{formatNumber(p_groove)} <span className="text-xs font-normal opacity-50">MPa</span></p>
                    <p className="text-[9px] opacity-50 mt-1">Allowed: {formatNumber(p_allow)} MPa</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 rounded-sm border border-outline-variant/20 bg-surface-container-lowest p-4">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary">4.11 Core Checks</span>
                  <code className="text-xs font-bold text-on-surface">T1/T2 ≤ e^(f·α)</code>
                  <code className="text-xs font-bold text-on-surface">p = (T1 + T2) / (n·d·D·sin(γ/2))</code>
                </div>
              </div>
            </div>
          </div>
        )}

        {(view === 'all' || view === 'params') && (
          <div className="space-y-6">
            <div className="bg-surface-container-low p-6 border border-outline-variant/10">
              <h4 className="text-xs font-bold uppercase tracking-widest mb-6 flex items-center gap-2">
                <Settings2 size={14} />
                Traction Parameters (4.11)
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.suspensionType !== 'belt' && (
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase opacity-60">Groove Type</label>
                    <select 
                      value={data.grooveType}
                      onChange={(e) => onChange({ grooveType: e.target.value as any })}
                      className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded px-3 py-2 text-sm outline-none focus:border-primary transition-colors"
                    >
                      <option value="V">V-Groove</option>
                      <option value="semi-circular">Semi-Circular Undercut</option>
                      <option value="U">U-Groove</option>
                    </select>
                  </div>
                )}
                <LiftField label="Rated Speed (v)" name="speed" unit="m/s" data={data} onChange={onChange} min={0.1} max={10} required suggestion="Speed affects dynamic friction coefficient (mu)." />
                <LiftField label="Friction Coeff. (μ)" name="frictionCoeff" data={data} onChange={onChange} min={0.01} max={0.5} required suggestion="Typically around 0.1, calculated from formula." />
                <LiftField label="Acceleration (a)" name="acceleration" unit="m/s²" data={data} onChange={onChange} min={0.1} max={2.0} required suggestion="Higher acceleration increases T1/T2 ratio during start." />
                <LiftField label="Deceleration (d)" name="deceleration" unit="m/s²" data={data} onChange={onChange} min={0.1} max={2.0} required suggestion="Higher deceleration increases T1/T2 ratio during emergency stop." />
                <LiftField label="Wrap Angle (α)" name="wrapAngle" unit="deg" data={data} onChange={onChange} min={90} max={270} required suggestion="Increase wrap angle to improve traction capacity (e^fα)." />
                {data.suspensionType !== 'belt' && (
                  <>
                    <LiftField label="Groove Angle (γ)" name="grooveAngle" unit="deg" data={data} onChange={onChange} min={30} max={60} required suggestion="Smaller groove angle increases friction but also rope wear." />
                    <LiftField label="Undercut Angle (β)" name="undercutAngle" unit="deg" data={data} onChange={onChange} min={0} max={105} required />
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-6">
        <div className="bg-surface-container-low p-8 border border-outline-variant/10 rounded-sm">
        <h3 className="text-sm font-bold uppercase tracking-widest text-primary mb-6 flex items-center gap-3">
          <FileText size={18} className="text-primary" />
          Engineering Notes
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
            <textarea 
              value={data.tractionNotes}
              onChange={(e) => onChange({ tractionNotes: e.target.value })}
              placeholder="Record project observations, sheave choices, wear notes or exceptions."
              className="w-full h-48 bg-surface-container-lowest border border-outline-variant/20 rounded-sm p-4 text-sm focus:ring-1 focus:ring-primary outline-none resize-none font-sans leading-relaxed shadow-inner"
            />
          </div>
          <div className="space-y-4">
            <div className="p-4 bg-primary/5 border border-primary/10 rounded-sm">
              <h4 className="text-[10px] font-bold uppercase text-primary mb-2">Use Notes For</h4>
              <ul className="text-[10px] space-y-2 opacity-70 list-disc pl-4">
                <li>Groove details (V-groove, U-groove)</li>
                <li>Sheave heat treatment</li>
                <li>Rope lubrication type</li>
                <li>Special environmental conditions</li>
              </ul>
            </div>
            <p className="text-[10px] text-on-surface-variant opacity-50 italic leading-relaxed">
              These notes carry into the final report.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
);
};

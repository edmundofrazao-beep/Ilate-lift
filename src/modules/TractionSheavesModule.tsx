import React from 'react';
import { ProjectData } from '../types';
import { LiftField, formatNumber } from '../components/ui';
import { Settings, ShieldCheck, CheckSquare, Info } from 'lucide-react';
import { BlockMath, InlineMath } from 'react-katex';
import { computeLiftCalculations } from '../lib/calculations';

export const TractionSheavesModule = ({ data, onChange }: { data: ProjectData, onChange: (newData: Partial<ProjectData>) => void }) => {
  const calc = computeLiftCalculations(data);
  const { p_groove, p_allow } = calc.traction;

  const isHardnessOk = data.sheaveHardness >= 200;
  const isPressureOk = p_groove <= p_allow;

  const handleRatioChange = (val: number) => {
    // If user changes D/d ratio, we adjust sheave Diameter
    onChange({ sheaveDiameter: val * data.ropeDiameter });
  };

  return (
    <div className="space-y-8">
      <div className="bg-surface-container-low p-6 border-t-2 border-primary">
        <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
          <Settings className="text-primary" />
          Traction Sheave Verification
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-4">
              Geometrical Parameters
            </h4>
            <div className="p-6 bg-surface-container-lowest border border-outline-variant/10 space-y-4">
              <LiftField label="Sheave Diameter (D)" name="sheaveDiameter" unit="mm" data={data} onChange={onChange} min={200} max={1000} step={10} />
              <LiftField label="Rope Diameter (d)" name="ropeDiameter" unit="mm" data={data} onChange={onChange} min={4} max={20} step={0.5} />
              <LiftField label="Rope Wear Reduction" name="ropeWearPercentage" unit="%" data={data} onChange={onChange} min={0} max={15} step={1} suggestion="Simulate rope reduction over time" />
              
              <div className="space-y-1 group">
                <div className="flex justify-between items-center text-[11px] font-bold text-on-surface-variant uppercase">
                  <label>D/d Ratio (Nominal)</label>
                  {data.sheaveDiameter / data.ropeDiameter < 40 && <span className="text-[9px] text-error font-bold animate-pulse">Required: ≥ 40</span>}
                </div>
                <input 
                  type="number"
                  min={40}
                  max={60}
                  step={1}
                  value={isNaN(data.sheaveDiameter / data.ropeDiameter) ? '' : formatNumber(data.sheaveDiameter / data.ropeDiameter, 0)}
                  onChange={(e) => handleRatioChange(parseFloat(e.target.value) || 40)}
                  className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-sm px-3 py-2 text-sm focus:ring-1 focus:ring-primary outline-none transition-all"
                />
                <div className="mt-1">
                  <input 
                    type="range"
                    min={40}
                    max={60}
                    step={1}
                    value={isNaN(data.sheaveDiameter / data.ropeDiameter) ? 40 : data.sheaveDiameter / data.ropeDiameter}
                    onChange={(e) => handleRatioChange(parseFloat(e.target.value))}
                    className="w-full h-1 bg-surface-container-low rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                </div>
                <p className="text-[9px] text-error/80 italic font-medium mt-1 leading-tight">
                  Suggestion: Must be &ge; 40 by standard.
                </p>
              </div>
            </div>

            <h4 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-4">
              Material & Stresses
            </h4>
            <div className="p-6 bg-surface-container-lowest border border-outline-variant/10 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase opacity-60">Sheave Material</label>
                <select 
                  value={data.sheaveMaterial}
                  onChange={(e) => onChange({ sheaveMaterial: e.target.value })}
                  className="w-full bg-surface-container border border-outline-variant/20 rounded px-3 py-2 text-sm outline-none focus:border-primary"
                >
                   <option value="Cast Iron">Cast Iron (e.g., EN-GJL-250)</option>
                   <option value="Ductile Iron">Ductile Iron (e.g., EN-GJS-500-7)</option>
                   <option value="Steel">Steel</option>
                </select>
              </div>
              <LiftField label="Allowable Stress Limit" name="sheaveAllowableStress" unit="MPa" data={data} onChange={onChange} min={50} max={500} step={5} suggestion="Typical Cast Iron is 80-120 MPa" />
              <LiftField label="Sheave Hardness" name="sheaveHardness" unit="HB" data={data} onChange={onChange} min={150} max={350} step={10} />
              {data.suspensionType !== 'belt' && (
                <>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase opacity-60">Groove Type</label>
                    <select 
                      value={data.grooveType}
                      onChange={(e) => onChange({ grooveType: e.target.value as any })}
                      className="w-full bg-surface-container border border-outline-variant/20 rounded px-3 py-2 text-sm outline-none focus:border-primary"
                    >
                       <option value="V">V-Groove</option>
                       <option value="semi-circular">Semi-Circular Undercut</option>
                       <option value="U">U-Groove</option>
                    </select>
                  </div>
                  <LiftField label="Groove Angle (γ)" name="grooveAngle" unit="°" data={data} onChange={onChange} min={20} max={60} step={1} />
                  <LiftField label="Undercut Angle (β)" name="undercutAngle" unit="°" data={data} onChange={onChange} min={40} max={105} step={1} />
                </>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant flex items-center gap-2 mb-4">
              <CheckSquare size={14} />
              Compliance Checks
            </h4>
            
            <div className={`p-4 border ${calc.traction.DdRatio >= 40 ? 'bg-emerald-50 border-emerald-200' : 'bg-error-container/10 border-error/20'}`}>
              <p className="text-[10px] font-bold uppercase mb-1">Effective D/d Ratio</p>
              <p className="text-xl font-black">{formatNumber(calc.traction.DdRatio, 1)}</p>
              <p className="mt-2 text-[10px] opacity-70">
                Required: ≥ 40 (Nominal D/d is {formatNumber(data.sheaveDiameter/data.ropeDiameter, 1)})
              </p>
            </div>

            <div className={`p-4 border ${isPressureOk ? 'bg-emerald-50 border-emerald-200' : 'bg-error-container/10 border-error/20'}`}>
              <p className="text-[10px] font-bold uppercase mb-1">Specific Pressure</p>
              <p className="text-xl font-black">{formatNumber(p_groove)} MPa</p>
              <p className="mt-2 text-[10px] opacity-70">
                Allowed: ≤ {formatNumber(p_allow)} MPa
              </p>
            </div>

            <div className={`p-4 border ${isHardnessOk ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
              <p className="text-[10px] font-bold uppercase mb-1">Sheave Hardness</p>
              <p className="text-xl font-black">{formatNumber(data.sheaveHardness)} HB</p>
              <p className="mt-2 text-[10px] opacity-70">
                Recommended: ≥ 200 HB
              </p>
            </div>

            <div className="p-4 bg-primary/5 border border-primary/20 rounded-sm">
              <h5 className="font-bold text-primary mb-2 uppercase text-[10px] flex items-center gap-1">
                <Info size={12} />
                Methodology
              </h5>
              <div className="text-xs space-y-2 opacity-80">
                <p>Verify groove pressure according to:</p>
                {data.grooveType === 'V' ? (
                  <InlineMath math="p = \frac{T_1 + T_2}{n \cdot d \cdot D \cdot \sin(\gamma/2)}" />
                ) : data.grooveType === 'semi-circular' ? (
                  <InlineMath math="p = \frac{8 \cdot (T_1 + T_2) \cdot \cos(\beta/2)}{n \cdot d \cdot D \cdot (\pi - \beta - \sin(\beta))}" />
                ) : (
                  <InlineMath math="p = \frac{8 \cdot (T_1 + T_2)}{n \cdot d \cdot D \cdot \pi}" />
                )}
                <p className="mt-2 text-[10px] italic">p_allow varies by material ({data.sheaveMaterial}) and rope speed v.</p>
                <p className="mt-4">Ensure minimum bending radius:</p>
                <InlineMath math="\frac{D}{d} \ge 40" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

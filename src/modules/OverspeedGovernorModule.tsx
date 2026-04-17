import React from 'react';
import { ProjectData } from '../types';
import { LiftField, formatNumber } from '../components/ui';
import { Settings, ShieldCheck, CheckSquare, Info } from 'lucide-react';
import { BlockMath, InlineMath } from 'react-katex';

export const OverspeedGovernorModule = ({ data, onChange }: { data: ProjectData, onChange: (newData: Partial<ProjectData>) => void }) => {
  const v = data.speed;
  const vt = data.osgTrippingSpeed;
  const Ft = data.osgTensileForce;
  const F_max = data.osgMaxBrakingForce;

  const minTripping = 1.15 * v;
  let maxTripping = 1.15 * v + 0.25;
  if (data.safetyGearType === 'progressive') maxTripping = 1.5;
  
  const isTrippingOk = vt >= minTripping && vt <= maxTripping;
  const isForceOk = Ft >= 300;
  const osgSafetyFactor = data.osgBreakingLoad / Ft;
  const isOsgSfOk = osgSafetyFactor >= 8.0;
  const isBrakingForceOk = F_max >= Ft;

  return (
    <div className="space-y-8">
      <div className="bg-surface-container-low p-6 border-t-2 border-primary">
        <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
          <ShieldCheck className="text-primary" />
          Overspeed Governor Analysis (Clause 4.4)
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant flex items-center gap-2">
              <Settings size={14} />
              OSG Parameters
            </h4>
            <div className="p-6 bg-surface-container-lowest border border-outline-variant/10 space-y-4">
              <LiftField label="Rated Speed (v)" name="speed" unit="m/s" data={data} onChange={onChange} />
              <LiftField label="Tripping Speed (vt)" name="osgTrippingSpeed" unit="m/s" data={data} onChange={onChange} min={0} max={5} step={0.01} />
              <LiftField label="Tensile Force (Ft)" name="osgTensileForce" unit="N" data={data} onChange={onChange} min={0} max={3000} step={10} />
              <LiftField label="Max Braking Force (F_max)" name="osgMaxBrakingForce" unit="N" data={data} onChange={onChange} min={0} max={5000} step={10} />
              <LiftField label="Rope Breaking Load" name="osgBreakingLoad" unit="N" data={data} onChange={onChange} min={0} max={20000} step={100} />
            </div>

            <div className="p-6 bg-surface-container-lowest border border-outline-variant/10 space-y-4">
               <h4 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-4">
                Component Database
               </h4>
               <div className="space-y-3">
                 <div className="space-y-1">
                   <label className="text-[10px] font-bold text-on-surface-variant uppercase">Manufacturer</label>
                   <input 
                     type="text" 
                     value={data.osgManufacturer || ''} 
                     onChange={e => onChange({ osgManufacturer: e.target.value })}
                     className="w-full bg-surface-container border border-outline-variant/20 rounded-sm px-3 py-2 text-sm outline-none"
                     placeholder="e.g. Wittur, PFB"
                   />
                 </div>
                 <div className="grid grid-cols-2 gap-3">
                   <div className="space-y-1">
                     <label className="text-[10px] font-bold text-on-surface-variant uppercase">Model</label>
                     <input 
                       type="text" 
                       value={data.osgModel || ''} 
                       onChange={e => onChange({ osgModel: e.target.value })}
                       className="w-full bg-surface-container border border-outline-variant/20 rounded-sm px-3 py-2 text-sm outline-none"
                     />
                   </div>
                   <div className="space-y-1">
                     <label className="text-[10px] font-bold text-on-surface-variant uppercase">Serial Number</label>
                     <input 
                       type="text" 
                       value={data.osgSerialNumber || ''} 
                       onChange={e => onChange({ osgSerialNumber: e.target.value })}
                       className="w-full bg-surface-container border border-outline-variant/20 rounded-sm px-3 py-2 text-sm outline-none"
                     />
                   </div>
                 </div>
               </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant flex items-center gap-2">
              <CheckSquare size={14} />
              Compliance Checks
            </h4>
            
            <div className={`p-4 border ${isTrippingOk ? 'bg-emerald-50 border-emerald-200' : 'bg-error-container/10 border-error/20'}`}>
              <p className="text-[10px] font-bold uppercase mb-1">Tripping Speed Verification</p>
              <p className="text-xl font-black">{formatNumber(vt)} m/s</p>
              <p className="mt-2 text-[10px] opacity-70">
                Range: {formatNumber(minTripping)} - {formatNumber(maxTripping)} m/s
              </p>
            </div>

            <div className={`p-4 border ${isForceOk ? 'bg-emerald-50 border-emerald-200' : 'bg-error-container/10 border-error/20'}`}>
              <p className="text-[10px] font-bold uppercase mb-1">Tensile Force (Ft)</p>
              <p className="text-xl font-black">{formatNumber(Ft)} N</p>
              <p className="mt-2 text-[10px] opacity-70">Required: ≥ 300N</p>
            </div>

            <div className={`p-4 border ${isBrakingForceOk ? 'bg-emerald-50 border-emerald-200' : 'bg-error-container/10 border-error/20'}`}>
              <p className="text-[10px] font-bold uppercase mb-1">Max Braking vs Tensile</p>
              <p className="text-xl font-black">{formatNumber(F_max)} N</p>
              <p className="mt-2 text-[10px] opacity-70">Required F_max ≥ Ft</p>
            </div>

            <div className={`p-4 border ${isOsgSfOk ? 'bg-emerald-50 border-emerald-200' : 'bg-error-container/10 border-error/20'}`}>
              <p className="text-[10px] font-bold uppercase mb-1">System Safety Factor</p>
              <p className="text-xl font-black">{formatNumber(osgSafetyFactor)}</p>
              <p className="mt-2 text-[10px] opacity-70">Required: ≥ 8.0</p>
            </div>
            
            <div className="p-4 bg-surface-container-low border border-outline-variant/20 rounded-sm">
              <h5 className="font-bold text-primary mb-3 uppercase text-[10px] flex items-center gap-1">
                OSG Certificate Information
              </h5>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-[10px] text-on-surface-variant uppercase font-bold">Manufacturer</span>
                  <span className="text-[10px] font-mono">{data.osgManufacturer || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[10px] text-on-surface-variant uppercase font-bold">Model</span>
                  <span className="text-[10px] font-mono">{data.osgModel || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[10px] text-on-surface-variant uppercase font-bold">Serial Number</span>
                  <span className="text-[10px] font-mono">{data.osgSerialNumber || 'N/A'}</span>
                </div>
                <div className="flex justify-between pt-2 mt-2 border-t border-outline-variant/10">
                  <span className="text-[10px] text-on-surface-variant uppercase font-bold">Rope Break Load</span>
                  <span className="text-[10px] font-mono">{formatNumber(data.osgBreakingLoad)} N</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-primary/5 border border-primary/20 rounded-sm">
              <h5 className="font-bold text-primary mb-2 uppercase text-[10px] flex items-center gap-1">
                <Info size={12} />
                Calculations
              </h5>
              <div className="text-xs space-y-2 opacity-80">
                <InlineMath math="v_t \ge 1.15 \cdot v" />
                <br />
                <InlineMath math="F_t \ge 300\text{ N}" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

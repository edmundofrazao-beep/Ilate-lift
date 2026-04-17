import React from 'react';
import { ProjectData } from '../types';
import { LiftField, formatNumber } from '../components/ui';
import { Database, CheckSquare, Info } from 'lucide-react';

export const CounterweightModule = ({ data, onChange }: { data: ProjectData, onChange: (newData: Partial<ProjectData>) => void }) => {
  const balanceRatio = data.cwtMass > 0 && data.ratedLoad > 0 
    ? (data.cwtMass - data.carMass) / data.ratedLoad
    : data.balanceRatio || 0.5;

  return (
    <div className="space-y-8">
      <div className="bg-surface-container-low p-6 border-t-2 border-primary">
        <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
          <Database className="text-primary" />
          Counterweight Definition
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-4">
              Mass & Balance
            </h4>
            <div className="p-6 bg-surface-container-lowest border border-outline-variant/10 space-y-4">
              <LiftField label="Rated Load (Q)" name="ratedLoad" unit="kg" data={data} onChange={onChange} min={100} max={10000} required />
              <LiftField label="Car Mass (P)" name="carMass" unit="kg" data={data} onChange={onChange} min={100} max={10000} required />
              <LiftField 
                label="Target Balance Ratio" 
                name="balanceRatio" 
                unit="%" 
                data={{ balanceRatio: data.balanceRatio * 100 }} 
                onChange={(newData: any) => onChange({ balanceRatio: newData.balanceRatio / 100 })} 
                min={10} max={90} step={1} 
                suggestion="Typical is 50% for traction. For hydraulic balance it differs."
              />
              <LiftField 
                label="Counterweight Mass (CWT)" 
                name="cwtMass" 
                unit="kg" 
                data={data} 
                onChange={onChange} 
                min={0} max={20000} 
                suggestion="Setting CWT directly might override automatic balance ratio calculation." 
              />
            </div>
            <div className="p-4 bg-primary/5 border border-primary/20 rounded-sm mt-4">
              <h5 className="font-bold text-primary mb-2 uppercase text-[10px] flex items-center gap-1">
                <Info size={12} />
                Formula
              </h5>
              <p className="text-xs font-mono opacity-80">
                P_cwt = P + (Q × Balance Ratio)
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant flex items-center gap-2 mb-4">
              <CheckSquare size={14} />
              Balance Result
            </h4>
            
            <div className={`p-4 border bg-surface-container-lowest border-outline-variant/10`}>
              <p className="text-[10px] font-bold uppercase mb-1">Theoretical CWT (based on ratio)</p>
              <p className="text-xl font-black">{formatNumber(data.carMass + (data.ratedLoad * data.balanceRatio))} kg</p>
            </div>

            <div className={`p-4 border ${Math.abs(balanceRatio - data.balanceRatio) < 0.05 ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
              <p className="text-[10px] font-bold uppercase mb-1">Effective Balance Ratio (Computed from weights)</p>
              <p className="text-xl font-black">{formatNumber(balanceRatio * 100, 1)}%</p>
              <p className="mt-2 text-[10px] opacity-70">
                {Math.abs(balanceRatio - data.balanceRatio) >= 0.05 ? 'Warning: Explicit CWT mass differs from target ratio.' : 'Matches target ratio.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

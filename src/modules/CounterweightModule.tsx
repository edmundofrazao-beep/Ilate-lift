import React from 'react';
import { ProjectData } from '../types';
import { LiftField, formatNumber } from '../components/ui';
import { CheckSquare, Info } from 'lucide-react';

export const CounterweightModule = ({ data, onChange }: { data: ProjectData, onChange: (newData: Partial<ProjectData>) => void }) => {
  const balanceRatio = data.cwtMass > 0 && data.ratedLoad > 0 
    ? (data.cwtMass - data.carMass) / data.ratedLoad
    : data.balanceRatio || 0.5;
  const theoreticalMass = data.carMass + (data.ratedLoad * data.balanceRatio);
  const ratioAligned = Math.abs(balanceRatio - data.balanceRatio) < 0.05;

  return (
    <div className="space-y-8">
      <div className="bg-surface-container-low p-6 border-t-2 border-primary">
        <div className="mb-8 grid grid-cols-1 gap-4 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-sm border border-outline-variant/20 bg-gradient-to-br from-surface-container-high to-surface-container-lowest p-6">
            <h3 className="text-2xl font-black tracking-tight text-on-surface">Counterweight</h3>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-on-surface-variant">
              Define the balance strategy here. This is the only place where counterweight mass and target balance ratio should be tuned.
            </p>
          </div>
          <div className="rounded-sm border border-outline-variant/20 bg-surface-container-lowest p-6">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white">Balance State</p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-sm border border-outline-variant/20 bg-surface-container-low p-3">
                <p className="text-[10px] font-bold uppercase text-on-surface-variant">Target</p>
                <p className="mt-1 text-lg font-black text-on-surface">{formatNumber(data.balanceRatio * 100, 1)}%</p>
              </div>
              <div className={`rounded-sm border p-3 ${ratioAligned ? 'border-emerald-200 bg-emerald-50' : 'border-amber-200 bg-amber-50'}`}>
                <p className="text-[10px] font-bold uppercase text-on-surface-variant">Effective</p>
                <p className="mt-1 text-lg font-black text-on-surface">{formatNumber(balanceRatio * 100, 1)}%</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-4">
              Mass & Balance
            </h4>
            <div className="p-6 bg-surface-container-lowest border border-outline-variant/10 space-y-4">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-on-surface-variant uppercase">Target Balance Ratio</label>
                <div className="relative">
                  <input
                    type="number"
                    min={10}
                    max={90}
                    step={1}
                    value={data.balanceRatio * 100}
                    onChange={(e) => onChange({ balanceRatio: Number(e.target.value) / 100 })}
                    className="w-full rounded-sm border border-outline-variant/20 bg-surface-container-lowest px-3 py-2 text-sm outline-none transition-all focus:ring-1 focus:ring-primary"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-on-surface-variant opacity-50">%</span>
                </div>
                <p className="text-[9px] italic leading-tight text-on-surface-variant">
                  Typical is 50% for traction. For hydraulic configurations the balance strategy can differ.
                </p>
              </div>
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
              <p className="mt-2 text-[10px] text-on-surface-variant">
                Base masses come from <strong>Project Parameters</strong>. Tune only the balance logic here.
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
              <p className="text-xl font-black">{formatNumber(theoreticalMass)} kg</p>
            </div>

            <div className={`p-4 border ${ratioAligned ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
              <p className="text-[10px] font-bold uppercase mb-1">Effective Balance Ratio (Computed from weights)</p>
              <p className="text-xl font-black">{formatNumber(balanceRatio * 100, 1)}%</p>
              <p className="mt-2 text-[10px] opacity-70">
                {ratioAligned ? 'Matches target ratio.' : 'Explicit CWT mass differs from target ratio.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

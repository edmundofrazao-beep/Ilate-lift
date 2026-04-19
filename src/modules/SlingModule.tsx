import React from 'react';
import { ProjectData } from '../types';
import { formatNumber, LiftField } from '../components/ui';
import { computeLiftCalculations } from '../lib/calculations';

export const SlingModule = ({ data, onChange }: { data: ProjectData, onChange?: (newData: Partial<ProjectData>) => void }) => {
  const { sling } = computeLiftCalculations(data);
  const isSlingOk = sling.uprightStress < data.materialYield;

  return (
    <div className="space-y-8">
      <div className="bg-surface-container-low p-8 border-t-2 border-primary">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xl font-bold">Car Frame / Sling Verification</h3>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${isSlingOk ? 'bg-emerald-100 text-emerald-700' : 'bg-error-container/20 text-error'}`}>
            {isSlingOk ? 'Implemented - OK' : 'Implemented - NOK'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-4">
              Geometrical Properties
            </h4>
            <div className="p-6 bg-surface-container-lowest border border-outline-variant/10 space-y-4">
              <LiftField label="Sling Width" name="slingWidth" unit="mm" data={data} onChange={onChange!} min={500} max={4000} step={10} suggestion="Distance between guide rails" />
              <LiftField label="Sling Depth" name="slingDepth" unit="mm" data={data} onChange={onChange!} min={500} max={4000} step={10} />
              <LiftField label="Sling Height" name="slingHeight" unit="mm" data={data} onChange={onChange!} min={2000} max={6000} step={50} />
              <LiftField label="Upright Section Area" name="uprightArea" unit="mm²" data={data} onChange={onChange!} min={500} max={10000} step={10} suggestion="Area of a single upright beam" />
              <LiftField label="Upright Section Modulus (Wy)" name="uprightWy" unit="mm³" data={data} onChange={onChange!} min={10000} max={500000} step={1000} suggestion="Modulus for bending around main axis" />
            </div>
          </div>

          <div className="space-y-6">
            <div className={`p-6 border ${isSlingOk ? 'bg-surface-container-lowest border-outline-variant/10' : 'bg-error-container/10 border-error/20'}`}>
              <h4 className="text-xs font-bold uppercase mb-4 text-primary">Combined Upright Stress</h4>
              <p className="text-2xl font-black">{formatNumber(sling.uprightStress)} <span className="text-xs font-normal opacity-50">N/mm²</span></p>
              <div className="mt-4 bg-black/5 p-3 rounded text-[10px] space-y-1 font-mono">
                <p>Pure Compression: {formatNumber(sling.F_safety_gear_total / sling.slingTotalArea)}</p>
                <p>Bending Stress  : {formatNumber((sling.slingBendingMoment * 1000) / sling.slingWy)}</p>
              </div>
              <p className="text-[10px] mt-4 opacity-70 italic font-bold">Limit (Yield): {data.materialYield} N/mm²</p>
            </div>
            
            <div className="p-6 bg-surface-container-lowest border border-outline-variant/10">
              <h4 className="text-xs font-bold uppercase mb-4 text-primary">Critical Safety Gear Force (F_total)</h4>
              <p className="text-2xl font-black">{formatNumber(sling.F_safety_gear_total / 1000, 1)} <span className="text-xs font-normal opacity-50">kN</span></p>
              <p className="text-[10px] mt-2 opacity-50 italic">Accounts for mass + actual safety gear retardation</p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-primary/5 border border-primary/10 rounded-sm">
          <h4 className="text-xs font-bold uppercase mb-2">Design Criteria</h4>
          <p className="text-[10px] opacity-70 leading-relaxed">
            The car frame must be dimensioned to withstand the forces resulting from the safety gear operation and the impact on the buffers. 
            Calculations include dynamic forces from progressive safety gear braking, combined with eccentric load moment derived from the sling width.
          </p>
        </div>
      </div>
    </div>
  );
};

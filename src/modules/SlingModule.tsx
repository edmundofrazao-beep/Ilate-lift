import React from 'react';
import { ProjectData, ModuleStatus } from '../types';
import { safeNumber, formatNumber, degToRad, InputGroup, LiftField, SliderField, CollapsibleSection } from '../components/ui';
import { ISO_RAIL_PROFILES, BELT_PROFILES } from '../constants';
import { CheckCircle2, ShieldCheck, Zap, AlertTriangle, Info, ChevronRight, Calculator, FileText, Database, Activity, Package, Maximize, AlertCircle, PlayCircle, Settings, CheckSquare } from 'lucide-react';
import { BlockMath, InlineMath } from 'react-katex';

export const SlingModule = ({ data }: { data: ProjectData }) => {
  const g = 9.81;
  const totalMass = data.carMass + data.ratedLoad;
  
  // Force during safety gear operation (ISO 8100-2:2026)
  // Fs = 2 * (P + Q) * g (Simplified impact factor)
  const Fs = 2 * totalMass * g;
  
  // Stress on uprights (assuming 2 uprights)
  const sigma_upright = data.uprightArea > 0 ? (Fs / 2) / data.uprightArea : 0;
  const isSlingOk = sigma_upright < data.materialYield;

  return (
    <div className="space-y-8">
      <div className="bg-surface-container-low p-8 border-t-2 border-primary">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xl font-bold">Car Frame / Sling Verification (4.6)</h3>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${isSlingOk ? 'bg-emerald-100 text-emerald-700' : 'bg-error-container/20 text-error'}`}>
            {isSlingOk ? 'Implemented - OK' : 'Implemented - NOK'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className={`p-6 border ${isSlingOk ? 'bg-surface-container-lowest border-outline-variant/10' : 'bg-error-container/10 border-error/20'}`}>
            <h4 className="text-xs font-bold uppercase mb-4 text-primary">Upright Stress</h4>
            <p className="text-2xl font-black">{formatNumber(sigma_upright)} <span className="text-xs font-normal opacity-50">N/mm²</span></p>
            <p className="text-[10px] mt-2 opacity-50 italic">Limit: {data.materialYield} N/mm²</p>
          </div>
          
          <div className="p-6 bg-surface-container-lowest border border-outline-variant/10">
            <h4 className="text-xs font-bold uppercase mb-4 text-primary">Impact Force (Fs)</h4>
            <p className="text-2xl font-black">{formatNumber(Fs / 1000, 1)} <span className="text-xs font-normal opacity-50">kN</span></p>
            <p className="text-[10px] mt-2 opacity-50 italic">Safety Gear Operation</p>
          </div>
        </div>

        <div className="mt-8 p-4 bg-primary/5 border border-primary/10 rounded-sm">
          <h4 className="text-xs font-bold uppercase mb-2">Design Criteria (4.6.2)</h4>
          <p className="text-[10px] opacity-70 leading-relaxed">
            The car frame must be dimensioned to withstand the forces resulting from the safety gear operation and the impact on the buffers. 
            The calculation considers a symmetrical load distribution on the uprights.
          </p>
        </div>
      </div>
    </div>
  );
};

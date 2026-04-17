import React from 'react';
import { ProjectData, ModuleStatus } from '../types';
import { safeNumber, formatNumber, degToRad, InputGroup, LiftField, SliderField, CollapsibleSection } from '../components/ui';
import { ISO_RAIL_PROFILES, BELT_PROFILES } from '../constants';
import { CheckCircle2, ShieldCheck, Zap, AlertTriangle, Info, ChevronRight, Calculator, FileText, Database, Activity, Package, Maximize, AlertCircle, PlayCircle, Settings, CheckSquare, Droplets } from 'lucide-react';
import { BlockMath, InlineMath } from 'react-katex';

export const RuptureValveModule = ({ data, onChange }: { data: ProjectData, onChange: (newData: Partial<ProjectData>) => void }) => {
  const isFlowOk = data.ruptureValveFlow > 0;
  const isPressureOk = data.ruptureValvePressure >= data.maxPressure * 1.5;

  return (
    <div className="space-y-6 p-6 bg-surface-container-low border border-outline-variant/10 rounded-sm mt-8">
      <h4 className="text-xs font-bold uppercase tracking-widest text-primary mb-4 flex items-center gap-2">
        <Droplets size={14} />
        4.9 Rupture Valves / Restrictors
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <LiftField label="Tripping Flow" name="ruptureValveFlow" unit="L/min" data={data} onChange={onChange} min={0} max={500} />
        <LiftField label="Max Operating Pressure" name="ruptureValvePressure" unit="MPa" data={data} onChange={onChange} min={0} max={20} />
      </div>
      <div className="mt-4 p-4 bg-primary/5 border border-primary/10 rounded-sm">
        <p className="text-[10px] opacity-70 italic">
          Verification: The rupture valve must be capable of stopping the car with a deceleration between 0.2gn and 1.0gn. 
          The tripping flow should be set at 1.3 to 1.5 times the nominal flow.
        </p>
      </div>
    </div>
  );
};
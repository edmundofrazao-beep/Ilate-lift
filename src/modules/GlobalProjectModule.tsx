import React from 'react';
import { ProjectData, ModuleStatus } from '../types';
import { safeNumber, formatNumber, degToRad, InputGroup, LiftField, SliderField, CollapsibleSection } from '../components/ui';
import { ISO_RAIL_PROFILES, BELT_PROFILES } from '../constants';
import { CheckCircle2, ShieldCheck, Zap, AlertTriangle, Info, ChevronRight, Calculator, FileText, Database, Activity, Package, Maximize, AlertCircle, PlayCircle, Settings, CheckSquare } from 'lucide-react';
import { BlockMath, InlineMath } from 'react-katex';

export const GlobalProjectModule = ({ data, onChange }: { data: ProjectData, onChange: (newData: Partial<ProjectData>) => void }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <InputGroup label="General Configuration (Clause 4.1)">
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-on-surface-variant uppercase">Elevator Type</label>
            <select 
              value={data.type}
              onChange={(e) => onChange({ type: e.target.value as any })}
              className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-sm px-3 py-2 text-sm focus:ring-1 focus:ring-primary outline-none"
            >
              <option value="electric">Electric (Traction)</option>
              <option value="hydraulic">Hydraulic</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-on-surface-variant uppercase">Suspension Ratio</label>
            <select 
              value={data.suspension}
              onChange={(e) => onChange({ suspension: e.target.value as any })}
              className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-sm px-3 py-2 text-sm focus:ring-1 focus:ring-primary outline-none"
            >
              <option value="1:1">1:1</option>
              <option value="2:1">2:1</option>
              <option value="4:1">4:1</option>
            </select>
          </div>
          <LiftField label="Rated Load (Q)" name="ratedLoad" unit="kg" data={data} onChange={onChange} min={50} max={5000} required suggestion="Rated load defines the minimum car area and safety gear capacity." />
          <LiftField label="Car Mass (P)" name="carMass" unit="kg" data={data} onChange={onChange} min={100} max={8000} required suggestion="Car mass includes sling, cabin, and accessories." />
          <LiftField label="Counterweight Mass (Mcwt)" name="cwtMass" unit="kg" data={data} onChange={onChange} min={100} max={10000} required suggestion="Standard balancing is usually P + 0.5Q." />
          <LiftField label="Rated Speed (v)" name="speed" unit="m/s" data={data} onChange={onChange} min={0.1} max={10} step={0.1} required suggestion="Speed determines buffer type and safety gear requirements." />
        </InputGroup>

        <InputGroup label="Shaft & Travel">
          <LiftField label="Travel (H)" name="travel" unit="m" data={data} onChange={onChange} min={1} max={500} required />
          <LiftField label="Number of Stops" name="stops" data={data} onChange={onChange} min={2} max={128} required />
          <LiftField label="Floor to Floor Height" name="floorHeight" unit="m" data={data} onChange={onChange} min={2} max={15} step={0.1} required />
          
          <div className="col-span-1 md:col-span-2 pt-4 border-t border-outline-variant/10">
            <h4 className="text-[10px] font-bold text-on-surface-variant uppercase mb-3">Shaft Dimensions</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <LiftField label="Width (Ww)" name="shaftWidth" unit="mm" data={data} onChange={onChange} min={1000} max={5000} required />
              <LiftField label="Depth (Dw)" name="shaftDepth" unit="mm" data={data} onChange={onChange} min={1000} max={5000} required />
              <LiftField label="Pit Depth" name="pitDepth" unit="mm" data={data} onChange={onChange} min={500} max={4000} required />
              <LiftField label="Headroom Height" name="headroomHeight" unit="mm" data={data} onChange={onChange} min={2500} max={6000} required />
            </div>
          </div>
          
          <div className="col-span-1 md:col-span-2 pt-4 border-t border-outline-variant/10">
            <h4 className="text-[10px] font-bold text-on-surface-variant uppercase mb-3">Cabin Dimensions</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <LiftField label="Width (Wc)" name="carWidth" unit="mm" data={data} onChange={onChange} min={600} max={data.shaftWidth - 200} required />
              <LiftField label="Depth (Dc)" name="carDepth" unit="mm" data={data} onChange={onChange} min={600} max={data.shaftDepth - 200} required />
              <LiftField label="Height (Hc)" name="carHeight" unit="mm" data={data} onChange={onChange} min={2000} max={4000} required />
            </div>
            {(data.carWidth >= data.shaftWidth || data.carDepth >= data.shaftDepth) && (
              <div className="mt-3 p-3 bg-error-container/20 border border-error/50 rounded-sm flex items-start gap-2">
                <AlertCircle size={14} className="text-error mt-0.5" />
                <p className="text-[11px] text-error">
                  <strong>Critical Error:</strong> Cabin dimensions exceed shaft dimensions! 
                  Ensure appropriate clearances are maintained (typically at least 100mm on each side).
                </p>
              </div>
            )}
          </div>
        </InputGroup>
      </div>
    </div>
  );
};

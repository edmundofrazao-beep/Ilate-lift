import React from 'react';
import { ProjectData } from '../types';
import { InputGroup, LiftField } from '../components/ui';
import { AlertCircle } from 'lucide-react';

export const GlobalProjectModule = ({ data, onChange }: { data: ProjectData, onChange: (newData: Partial<ProjectData>) => void }) => {
  return (
    <div className="space-y-6">
      <div className="rounded-sm border border-outline-variant/20 bg-surface-container-low p-6">
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-sm border border-outline-variant/20 bg-gradient-to-br from-surface-container-high to-surface-container-lowest p-6">
            <h3 className="text-2xl font-black tracking-tight text-on-surface">Project Parameters (4.1)</h3>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-on-surface-variant">
              Close the lift type, speed, travel and base geometry here. Leave specialist tuning to the dedicated sections.
            </p>
          </div>
          <div className="rounded-sm border border-outline-variant/20 bg-surface-container-lowest p-6">
            <h4 className="text-[11px] font-black uppercase tracking-[0.22em] text-white">Editing Rule</h4>
            <div className="mt-4 space-y-3 text-sm text-on-surface-variant">
              <p>Use this page for project assumptions and main geometry only.</p>
              <p>Counterweight strategy, traction tuning and clearance proof stay in their own sections.</p>
            </div>
          </div>
        </div>
      </div>

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
          <LiftField label="Rated Speed (v)" name="speed" unit="m/s" data={data} onChange={onChange} min={0.1} max={10} step={0.1} required suggestion="Speed determines buffer type and safety gear requirements." />
          <div className="rounded-sm border border-primary/20 bg-primary/5 p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary">Counterweight Guidance</p>
            <p className="mt-2 text-xs leading-relaxed text-on-surface-variant">
              Counterweight mass is managed in the dedicated <strong>Counterweight</strong> section so balance strategy stays in one place.
            </p>
          </div>
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
            <div className="mt-4 rounded-sm border border-primary/20 bg-primary/5 p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary">Next Step</p>
              <p className="mt-2 text-xs leading-relaxed text-on-surface-variant">
                Once the main geometry is stable, move to <strong>Clearances</strong> to validate shaft and refuge distances instead of tuning them here.
              </p>
            </div>
          </div>
        </InputGroup>
      </div>
    </div>
  );
};

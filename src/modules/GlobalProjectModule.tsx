import React from 'react';
import { ProjectData } from '../types';
import { InputGroup, LiftField } from '../components/ui';
import { AlertCircle } from 'lucide-react';
import { computeLiftCalculations } from '../lib/calculations';
import { SHAFT_LUMINAIRE_PRESETS } from '../constants';

export const GlobalProjectModule = ({ data, onChange }: { data: ProjectData, onChange: (newData: Partial<ProjectData>) => void }) => {
  const isHydraulic = data.type === 'hydraulic';
  const logic = computeLiftCalculations(data).systemLogic;
  const canUseMachineRoom = data.driveArrangement === 'machine-room';
  const hydraulicCabinetOptions = canUseMachineRoom
    ? [{ value: 'machine-room', label: 'Machine room' }]
    : [
        { value: 'top-landing', label: 'Top landing' },
        { value: 'lowest-landing', label: 'Lowest landing' },
        { value: 'jamb', label: 'Door jamb / recess' },
      ];
  const electricCabinetOptions = [
    { value: 'machine-room', label: 'Machine room' },
    { value: 'top-landing', label: 'Top landing' },
    { value: 'lowest-landing', label: 'Lowest landing' },
    { value: 'jamb', label: 'Door jamb / recess' },
  ];
  const cabinetOptions = isHydraulic ? hydraulicCabinetOptions : electricCabinetOptions;
  const drivePackageOptions = isHydraulic
    ? (canUseMachineRoom
        ? [{ value: 'machine-room', label: 'Machine room' }]
        : [
            { value: 'landing-cabinet', label: 'Landing cabinet' },
            { value: 'pit-unit', label: 'Pit hydraulic unit' },
          ])
    : [
        { value: 'shaft-head', label: 'Shaft head' },
        { value: 'machine-room', label: 'Machine room' },
        { value: 'landing-cabinet', label: 'Landing cabinet' },
      ];
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
              <p>
                {isHydraulic
                  ? 'Hydraulic power-unit layout, rupture valve closure and shaft proof stay in their own dedicated sections.'
                  : 'Counterweight strategy, traction tuning and clearance proof stay in their own sections.'}
              </p>
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
              disabled={isHydraulic}
              className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-sm px-3 py-2 text-sm focus:ring-1 focus:ring-primary outline-none"
            >
              <option value="1:1">1:1</option>
              <option value="2:1">2:1</option>
              <option value="4:1">4:1</option>
            </select>
          </div>
          <LiftField label="Rated Load (Q)" name="ratedLoad" unit="kg" data={data} onChange={onChange} min={50} max={5000} required suggestion="Rated load defines the minimum car area and safety gear capacity." />
          <LiftField label="Car Mass (P)" name="carMass" unit="kg" data={data} onChange={onChange} min={100} max={8000} required suggestion="Car mass includes sling, cabin, and accessories." />
          <LiftField label="Rated Speed (v)" name="speed" unit="m/s" data={data} onChange={onChange} min={0.1} max={isHydraulic ? 1.0 : 10} step={0.1} required suggestion={isHydraulic ? 'Hydraulic flow is capped at 1.0 m/s in this workspace.' : 'Speed determines buffer type and safety gear requirements.'} />
          <div className="rounded-sm border border-primary/20 bg-primary/5 p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary">{isHydraulic ? 'Hydraulic Rule' : 'Counterweight Guidance'}</p>
            <p className="mt-2 text-xs leading-relaxed text-on-surface-variant">
              {isHydraulic
                ? <>Hydraulic projects in this workspace do not use compensation means and are capped at <strong>1.0 m/s</strong>. Keep the project base aligned with that envelope.</>
                : <>Counterweight mass is managed in the dedicated <strong>Counterweight</strong> section so balance strategy stays in one place.</>}
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <InputGroup label="Installation & Control">
          <div className="space-y-1" data-field="driveArrangement">
            <label className="text-[11px] font-bold text-on-surface-variant uppercase">Drive Arrangement</label>
            <select
              value={data.driveArrangement}
              onChange={(e) => onChange({ driveArrangement: e.target.value as ProjectData['driveArrangement'] })}
              className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-sm px-3 py-2 text-sm focus:ring-1 focus:ring-primary outline-none"
            >
              <option value="mrl">{isHydraulic ? 'Hydraulic without machine room / landing cabinet' : 'MRL / integrated shaft layout'}</option>
              <option value="machine-room">{isHydraulic ? 'Hydraulic machine room' : 'Machine room'}</option>
            </select>
          </div>
          <div className="space-y-1" data-field="machineRoomPosition">
            <label className="text-[11px] font-bold text-on-surface-variant uppercase">Machine Room Position</label>
            <select
              value={data.machineRoomPosition}
              onChange={(e) => onChange({ machineRoomPosition: e.target.value as ProjectData['machineRoomPosition'] })}
              disabled={data.driveArrangement === 'mrl'}
              className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-sm px-3 py-2 text-sm focus:ring-1 focus:ring-primary outline-none disabled:opacity-50"
            >
              <option value="none">None</option>
              <option value="overhead">Overhead</option>
              <option value="adjacent">Adjacent room</option>
              <option value="basement">Basement / lower room</option>
            </select>
          </div>
          <div className="space-y-1" data-field="controlCabinetLocation">
            <label className="text-[11px] font-bold text-on-surface-variant uppercase">Control Cabinet</label>
            <select
              value={data.controlCabinetLocation}
              onChange={(e) => onChange({ controlCabinetLocation: e.target.value as ProjectData['controlCabinetLocation'] })}
              className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-sm px-3 py-2 text-sm focus:ring-1 focus:ring-primary outline-none"
            >
              {cabinetOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1" data-field="drivePackageLocation">
            <label className="text-[11px] font-bold text-on-surface-variant uppercase">Drive / Power Unit</label>
            <select
              value={data.drivePackageLocation}
              onChange={(e) => onChange({ drivePackageLocation: e.target.value as ProjectData['drivePackageLocation'] })}
              className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-sm px-3 py-2 text-sm focus:ring-1 focus:ring-primary outline-none"
            >
              {drivePackageOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1" data-field="controllerArchitecture">
            <label className="text-[11px] font-bold text-on-surface-variant uppercase">Controller Architecture</label>
            <select
              value={data.controllerArchitecture}
              onChange={(e) => onChange({ controllerArchitecture: e.target.value as ProjectData['controllerArchitecture'] })}
              className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-sm px-3 py-2 text-sm focus:ring-1 focus:ring-primary outline-none"
            >
              {!isHydraulic && <option value="vvvf">VVVF / traction inverter</option>}
              {isHydraulic && <option value="hydraulic-valve">Hydraulic valve controller</option>}
              <option value="relay-hybrid">{isHydraulic ? 'Hydraulic relay / valve hybrid' : 'Relay hybrid'}</option>
            </select>
          </div>
          <div className="space-y-1" data-field="travellingCableType">
            <label className="text-[11px] font-bold text-on-surface-variant uppercase">Travelling Cable</label>
            <select
              value={data.travellingCableType}
              onChange={(e) => onChange({ travellingCableType: e.target.value as ProjectData['travellingCableType'] })}
              className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-sm px-3 py-2 text-sm focus:ring-1 focus:ring-primary outline-none"
            >
              <option value="flat">Flat travelling cable</option>
              <option value="round">Round travelling cable</option>
              <option value="bus">Bus / hybrid loom</option>
            </select>
          </div>
          <div className="space-y-1" data-field="travellingCableRouting">
            <label className="text-[11px] font-bold text-on-surface-variant uppercase">Cable Routing</label>
            <select
              value={data.travellingCableRouting}
              onChange={(e) => onChange({ travellingCableRouting: e.target.value as ProjectData['travellingCableRouting'] })}
              className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-sm px-3 py-2 text-sm focus:ring-1 focus:ring-primary outline-none"
            >
              <option value="rear-wall">Rear wall</option>
              <option value="side-wall">Side wall</option>
            </select>
          </div>
          <div className="col-span-1 md:col-span-2 rounded-sm border border-primary/20 bg-primary/5 p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary">Operating Intent</p>
            <div className="mt-2 grid grid-cols-1 gap-2 text-xs text-on-surface-variant md:grid-cols-2">
              <p>Recommended drive package: <strong>{logic.recommendedDrivePackageLocation}</strong></p>
              <p>Recommended cabinet zone: <strong>{logic.recommendedControlCabinetLocation}</strong></p>
              <p>Machine room state: <strong>{logic.machineRoomAligned ? 'aligned' : 'review'}</strong></p>
              <p>Inspection chain: <strong>{logic.inspectionChainComplete ? 'closed' : 'incomplete'}</strong></p>
            </div>
            {isHydraulic && (
              <p className="mt-3 text-xs leading-relaxed text-on-surface-variant">
                Hydraulic installation is treated as its own architecture: power unit, valve control, rupture valve, car buffer and pit/service zones are closed in the hydraulic flow, not through traction compensation.
              </p>
            )}
          </div>
        </InputGroup>

        <InputGroup label="Inspection & Shaft Lighting">
          <div className="space-y-1" data-field="roofInspectionStation">
            <label className="text-[11px] font-bold text-on-surface-variant uppercase flex items-center gap-2">
              <input
                type="checkbox"
                checked={data.roofInspectionStation}
                onChange={(e) => onChange({ roofInspectionStation: e.target.checked })}
                className="accent-primary"
              />
              Car Roof Inspection
            </label>
          </div>
          <div className="space-y-1" data-field="pitInspectionStation">
            <label className="text-[11px] font-bold text-on-surface-variant uppercase flex items-center gap-2">
              <input
                type="checkbox"
                checked={data.pitInspectionStation}
                onChange={(e) => onChange({ pitInspectionStation: e.target.checked })}
                className="accent-primary"
              />
              Pit Inspection
            </label>
          </div>
          <div className="space-y-1" data-field="cabinetInspectionEnabled">
            <label className="text-[11px] font-bold text-on-surface-variant uppercase flex items-center gap-2">
              <input
                type="checkbox"
                checked={data.cabinetInspectionEnabled}
                onChange={(e) => onChange({ cabinetInspectionEnabled: e.target.checked })}
                className="accent-primary"
              />
              Cabinet Inspection Enable
            </label>
          </div>
          <div className="space-y-1" data-field="shaftLuminairePresetId">
            <label className="text-[11px] font-bold text-on-surface-variant uppercase">Luminaire Preset</label>
            <select
              value={data.shaftLuminairePresetId}
              onChange={(e) => onChange({ shaftLuminairePresetId: e.target.value })}
              className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-sm px-3 py-2 text-sm focus:ring-1 focus:ring-primary outline-none"
            >
              {SHAFT_LUMINAIRE_PRESETS.map((preset) => (
                <option key={preset.id} value={preset.id}>
                  {preset.label}
                </option>
              ))}
            </select>
          </div>
          <LiftField label="Shaft Lighting" name="shaftLightingLux" unit="lx" data={data} onChange={onChange} min={50} max={500} required suggestion="Keep shaft lighting at or above 200 lux for maintenance readability." />
          <LiftField label="Luminaire Spacing" name="shaftLuminaireSpacing" unit="m" data={data} onChange={onChange} min={1.5} max={4.0} step={0.1} required />
          <LiftField label="Luminaire Count" name="shaftLuminaireCount" data={data} onChange={onChange} min={2} max={64} required />
          <div className="col-span-1 md:col-span-2 rounded-sm border border-primary/20 bg-primary/5 p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary">Lighting Rule</p>
            <div className="mt-2 grid grid-cols-1 gap-2 text-xs text-on-surface-variant md:grid-cols-2">
              <p>Target illuminance: <strong>{logic.shaftLightingTargetLux} lx minimum</strong></p>
              <p>Current state: <strong>{logic.shaftLightingCompliant ? 'compliant' : 'review'}</strong></p>
              <p>Recommended spacing: <strong>{logic.recommendedLuminaireSpacing.toFixed(1)} m</strong></p>
              <p>Recommended count: <strong>{logic.recommendedLuminaireCount}</strong></p>
            </div>
          </div>
        </InputGroup>
      </div>
    </div>
  );
};

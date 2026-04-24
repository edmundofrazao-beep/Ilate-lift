import React from 'react';
import { ProjectData, ModuleStatus } from '../types';
import { safeNumber, formatNumber, degToRad, InputGroup, LiftField, SliderField, CollapsibleSection } from '../components/ui';
import { ISO_RAIL_PROFILES, BELT_PROFILES, SEISMIC_CATEGORIES } from '../constants';
import { CheckCircle2, ShieldCheck, Zap, AlertTriangle, Info, ChevronRight, Calculator, FileText, Database, Activity, Package, Maximize, AlertCircle, PlayCircle, Settings, CheckSquare } from 'lucide-react';
import { BlockMath, InlineMath } from 'react-katex';
import { computeLiftCalculations } from '../lib/calculations';

export const SeismicModule = ({ data, onChange }: { data: ProjectData, onChange: (newData: Partial<ProjectData>) => void }) => {
  const logic = computeLiftCalculations(data).systemLogic;
  return (
    <div className="space-y-8">
      <div className="bg-surface-container-low p-8 border-t-2 border-primary">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xl font-bold">Seismic Conditions (EN 81-77)</h3>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 uppercase tracking-widest">Verification Status active</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <InputGroup label="Seismic Parameters (ad)">
            <LiftField label="Design Acceleration (ad)" name="designAcceleration" unit="m/s²" data={data} onChange={(v) => {
              const ad = v.designAcceleration || 0;
              let cat = 0;
              if (ad > 1 && ad <= 2.5) cat = 1;
              else if (ad > 2.5 && ad <= 4) cat = 2;
              else if (ad > 4) cat = 3;
              onChange({ designAcceleration: ad, seismicCategory: cat as any });
            }} min={0} max={10} step={0.1} required />
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-on-surface-variant uppercase flex items-center gap-1.5">Seismic Category</label>
              <div className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-sm px-3 py-2 text-sm text-on-surface opacity-70">
                {SEISMIC_CATEGORIES.find(c => c.id === data.seismicCategory)?.label || 'Category 0'}
              </div>
            </div>
            <div className="flex items-center gap-3 p-2 bg-surface-container-lowest border border-outline-variant/10 rounded-sm">
              <input type="checkbox" checked={data.primaryWaveDetection} onChange={e => onChange({ primaryWaveDetection: e.target.checked })} className="rounded-sm border-outline-variant/30 text-primary focus:ring-primary" />
              <label className="text-[11px] font-bold text-on-surface-variant uppercase cursor-pointer">Primary Wave Detection</label>
            </div>
            <div className="flex items-center gap-3 p-2 bg-surface-container-lowest border border-outline-variant/10 rounded-sm">
              <input type="checkbox" checked={data.seismicRetainerEnabled} onChange={e => onChange({ seismicRetainerEnabled: e.target.checked })} className="rounded-sm border-outline-variant/30 text-primary focus:ring-primary" />
              <label className="text-[11px] font-bold text-on-surface-variant uppercase cursor-pointer">Seismic Retainers Installed</label>
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-on-surface-variant uppercase flex items-center gap-1.5">Retainer Scope</label>
              <select
                value={data.seismicRetainerType}
                onChange={(e) => onChange({ seismicRetainerType: e.target.value as ProjectData['seismicRetainerType'] })}
                className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-sm px-3 py-2 text-sm outline-none"
              >
                <option value="none">None</option>
                <option value="car">Car only</option>
                <option value="car-and-cwt">Car and counterweight</option>
                <option value="full-3-axis">Full 3-axis retention</option>
              </select>
            </div>
          </InputGroup>
          <div className="p-6 bg-surface-container-lowest border border-outline-variant/10 rounded-sm">
            <h4 className="text-xs font-bold uppercase tracking-widest text-primary mb-4 flex items-center gap-2">
              <ShieldCheck size={14} />
              EN 81-77 Requirements
            </h4>
            <div className="space-y-3">
               <div className="flex items-center gap-3">
                 <div className={`w-5 h-5 rounded flex items-center justify-center border ${data.seismicCategory >= 1 ? 'bg-emerald-600 border-emerald-600' : 'border-outline-variant opacity-50'}`}>
                   {data.seismicCategory >= 1 && <CheckSquare size={14} className="text-white" />}
                 </div>
                 <span className={`text-xs font-medium ${data.seismicCategory >= 1 ? 'text-on-surface' : 'text-on-surface-variant line-through'}`}>Prevention of snag points (Cat 1-3)</span>
               </div>
               <div className="flex items-center gap-3">
                 <div className={`w-5 h-5 rounded flex items-center justify-center border ${data.seismicCategory >= 2 ? 'bg-emerald-600 border-emerald-600' : 'border-outline-variant opacity-50'}`}>
                   {data.seismicCategory >= 2 && <CheckSquare size={14} className="text-white" />}
                 </div>
                 <span className={`text-xs font-medium ${data.seismicCategory >= 2 ? 'text-on-surface' : 'text-on-surface-variant line-through'}`}>Car & Cwt Retaining devices (Cat 2-3)</span>
               </div>
               <div className="flex items-center gap-3">
                 <div className={`w-5 h-5 rounded flex items-center justify-center border ${data.seismicCategory === 3 ? 'bg-emerald-600 border-emerald-600' : 'border-outline-variant opacity-50'}`}>
                   {data.seismicCategory === 3 && <CheckSquare size={14} className="text-white" />}
                 </div>
                 <span className={`text-xs font-medium ${data.seismicCategory === 3 ? 'text-on-surface' : 'text-on-surface-variant line-through'}`}>Seismic Detection System (Cat 3)</span>
               </div>
               <div className="flex items-center gap-3">
                 <div className={`w-5 h-5 rounded flex items-center justify-center border ${logic.requiresGuideRollers ? 'bg-emerald-600 border-emerald-600' : 'border-outline-variant opacity-50'}`}>
                   {logic.requiresGuideRollers && <CheckSquare size={14} className="text-white" />}
                 </div>
                 <span className={`text-xs font-medium ${logic.requiresGuideRollers ? 'text-on-surface' : 'text-on-surface-variant line-through'}`}>Guide rollers / rodadeiras required for this seismic-speed envelope</span>
               </div>
               <div className="flex items-center gap-3">
                 <div className={`w-5 h-5 rounded flex items-center justify-center border ${logic.requiresIndependentGuideAxes ? 'bg-emerald-600 border-emerald-600' : 'border-outline-variant opacity-50'}`}>
                   {logic.requiresIndependentGuideAxes && <CheckSquare size={14} className="text-white" />}
                 </div>
                 <span className={`text-xs font-medium ${logic.requiresIndependentGuideAxes ? 'text-on-surface' : 'text-on-surface-variant line-through'}`}>Independent suspension on 3 guide axes</span>
               </div>
               <div className="flex items-center gap-3">
                 <div className={`w-5 h-5 rounded flex items-center justify-center border ${logic.seismicRetainerAligned ? 'bg-emerald-600 border-emerald-600' : 'border-outline-variant'}`}>
                   {logic.seismicRetainerAligned && <CheckSquare size={14} className="text-white" />}
                 </div>
                 <span className={`text-xs font-medium ${logic.seismicRetainerAligned ? 'text-on-surface' : 'text-on-surface-variant'}`}>Retaining devices aligned with current category</span>
               </div>
            </div>
            <div className="mt-4 rounded-sm border border-primary/20 bg-primary/5 p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-primary">Implementation note</p>
              <p className="mt-2 text-xs leading-relaxed text-on-surface-variant">
                Edit actual roller/rodadeira data in <strong>Guide Rail Setup</strong>. This page tells you when EN 81-77 pushes the project into roller guidance, retainers and independent 3-axis suspension.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

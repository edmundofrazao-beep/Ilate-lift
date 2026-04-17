import React from 'react';
import { ProjectData, ModuleStatus } from '../types';
import { safeNumber, formatNumber, degToRad, InputGroup, LiftField, SliderField, CollapsibleSection } from '../components/ui';
import { ISO_RAIL_PROFILES, BELT_PROFILES } from '../constants';
import { CheckCircle2, ShieldCheck, Zap, AlertTriangle, Info, ChevronRight, Calculator, FileText, Database, Activity, Package, Maximize, AlertCircle, PlayCircle, Settings, CheckSquare } from 'lucide-react';
import { BlockMath, InlineMath } from 'react-katex';

export const EN8128Module = ({ data, onChange }: { data: ProjectData, onChange: (newData: Partial<ProjectData>) => void }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 border-b border-outline-variant/20 pb-2 mb-6">
        <ShieldCheck className="text-primary" size={20} />
        <h4 className="text-sm font-bold uppercase tracking-wider">EN 81-28 Remote Alarms on Lifts</h4>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="space-y-4 p-6 bg-surface-container-lowest border border-outline-variant/10">
          <h5 className="text-[10px] font-bold uppercase text-primary mb-4">Alarm System Parameters</h5>
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-on-surface-variant uppercase">Alarm Button Type</label>
              <select 
                value={data.alarmButtonType}
                onChange={(e) => onChange({ alarmButtonType: e.target.value as any })}
                className="w-full bg-surface-container-low border border-outline-variant/20 rounded-sm px-3 py-2 text-sm outline-none"
              >
                <option value="NO">Normally Open (NO)</option>
                <option value="NC">Normally Closed (NC)</option>
              </select>
            </div>
            <LiftField label="Backup Battery Autonomy" name="alarmBackupBatteryTime" unit="hours" data={data} onChange={onChange} min={1} max={72} required suggestion="EN 81-28 requires minimum 1 hour of autonomy." />
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-on-surface-variant uppercase">Communication Interface</label>
              <select 
                value={data.alarmCommunicationType}
                onChange={(e) => onChange({ alarmCommunicationType: e.target.value as any })}
                className="w-full bg-surface-container-low border border-outline-variant/20 rounded-sm px-3 py-2 text-sm outline-none"
              >
                <option value="PSTN">PSTN (Analog Line)</option>
                <option value="GSM">GSM / Cellular</option>
                <option value="VoIP">VoIP (SIP)</option>
              </select>
            </div>
            <div className="flex items-center gap-3 p-2 bg-surface-container-lowest border border-outline-variant/10 rounded-sm">
              <input 
                type="checkbox"
                checked={data.alarmFilteringImplemented}
                onChange={(e) => onChange({ alarmFilteringImplemented: e.target.checked })}
                className="rounded-sm border-outline-variant/30 text-primary focus:ring-primary"
              />
              <label className="text-[11px] font-bold text-on-surface-variant uppercase cursor-pointer">Alarm Filtering logic</label>
            </div>
          </div>
        </div>
        <div className="lg:col-span-2 space-y-4">
            <div className="p-6 bg-surface-container-lowest border border-outline-variant/10 rounded-sm">
            <h5 className="text-[10px] font-bold uppercase text-primary mb-4 flex items-center gap-2">
              <CheckSquare size={12} />
              EN 81-28 Compliance Verification
            </h5>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded flex items-center justify-center border ${data.alarmBackupBatteryTime >= 1 ? 'bg-emerald-600 border-emerald-600' : 'border-outline-variant'}`}>
                  {data.alarmBackupBatteryTime >= 1 && <CheckSquare size={14} className="text-white" />}
                </div>
                <span className={`text-xs font-medium ${data.alarmBackupBatteryTime >= 1 ? 'text-on-surface' : 'text-on-surface-variant'}`}>
                  Backup battery time ({data.alarmBackupBatteryTime}h) meets minimum 1hr requirement.
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded flex items-center justify-center border ${data.alarmFilteringImplemented ? 'bg-emerald-600 border-emerald-600' : 'border-outline-variant'}`}>
                  {data.alarmFilteringImplemented && <CheckSquare size={14} className="text-white" />}
                </div>
                <span className={`text-xs font-medium ${data.alarmFilteringImplemented ? 'text-on-surface' : 'text-on-surface-variant'}`}>
                  Alarm filtering is implemented to reduce false alarms.
                </span>
              </div>
                <div className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded flex items-center justify-center border ${data.alarmCommunicationType === 'PSTN' ? 'bg-amber-500 border-amber-500' : 'bg-emerald-600 border-emerald-600'}`}>
                  {(data.alarmCommunicationType === 'PSTN') ? <AlertCircle size={14} className="text-white" /> : <CheckSquare size={14} className="text-white" />}
                </div>
                <span className={`text-xs font-medium ${data.alarmCommunicationType === 'PSTN' ? 'text-amber-700' : 'text-on-surface'}`}>
                  Communication type: {data.alarmCommunicationType}. {data.alarmCommunicationType === 'PSTN' && "Warning: PSTN lines are being phased out globally."}
                </span>
              </div>
            </div>
            </div>
        </div>
      </div>
    </div>
  );
};

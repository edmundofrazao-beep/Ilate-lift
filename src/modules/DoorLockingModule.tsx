import React from 'react';
import { ProjectData, ModuleStatus } from '../types';
import { safeNumber, formatNumber, degToRad, InputGroup, LiftField, SliderField, CollapsibleSection } from '../components/ui';
import { ISO_RAIL_PROFILES, BELT_PROFILES } from '../constants';
import { CheckCircle2, ShieldCheck, Zap, AlertTriangle, Info, ChevronRight, Calculator, FileText, Database, Activity, Package, Maximize, AlertCircle, PlayCircle, Settings, CheckSquare } from 'lucide-react';
import { BlockMath, InlineMath } from 'react-katex';

export const DoorLockingModule = () => {
  const checks = [
    { id: '4.2.1', label: 'Mechanical strength of locks (F > 1000N)', info: 'Verification of permanent deformation' },
    { id: '4.2.2', label: 'Minimum lock engagement (7mm)', info: 'Guarantee of secure electrical contact' },
    { id: '4.2.3', label: 'Safety electrical device', info: 'Verification of positive break' },
    { id: '4.2.4', label: 'Protection against accidental manipulation', info: 'Prevent opening from outside without key' },
    { id: '4.2.5', label: 'Verification of clearances and alignment', info: 'Maximum 6mm between panels' },
  ];

  return (
    <div className="space-y-8">
      <div className="bg-surface-container-low p-8 border-t-2 border-primary">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xl font-bold">Landing and Car Door Locking (4.2)</h3>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 uppercase">Technical Checklist</span>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {checks.map(c => (
            <div key={c.id} className="flex items-start gap-4 p-4 bg-surface-container-lowest border border-outline-variant/10 hover:border-primary/30 transition-all">
              <input type="checkbox" className="mt-1 rounded-sm border-outline-variant/30 text-primary focus:ring-primary" />
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-[10px] font-mono font-bold text-primary bg-primary/5 px-1.5 py-0.5 rounded">{c.id}</span>
                  <h4 className="text-sm font-bold">{c.label}</h4>
                </div>
                <p className="text-[11px] text-on-surface-variant opacity-70 italic">{c.info}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

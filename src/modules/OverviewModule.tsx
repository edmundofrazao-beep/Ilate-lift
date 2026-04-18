import React from 'react';
import { ProjectData, ModuleStatus } from '../types';
import { safeNumber, formatNumber, degToRad, InputGroup, LiftField, SliderField, CollapsibleSection } from '../components/ui';
import { ISO_RAIL_PROFILES, BELT_PROFILES } from '../constants';
import { CheckCircle2, ShieldCheck, Zap, AlertTriangle, Info, ChevronRight, Calculator, FileText, Database, Activity, Package, Maximize, AlertCircle, PlayCircle, Settings, CheckSquare } from 'lucide-react';
import { BlockMath, InlineMath } from 'react-katex';

export const OverviewModule = ({ modules, onSelect }: { modules: ModuleStatus[], onSelect: (id: string) => void }) => {
  const categories = Array.from(new Set(modules.map(m => m.category || 'Other')));
  
  return (
    <div className="space-y-8">
      <div className="bg-surface-container-low p-8 rounded-sm border border-outline-variant/10">
        <h2 className="text-2xl font-black text-on-surface mb-4">LiftCalc - Engineering & Calculation Tool</h2>
        <p className="text-on-surface-variant mb-6 leading-relaxed">
          Modular technical tool for elevator design based on <strong>ISO 8100-2:2026</strong>. 
          This application focuses on design, planning, pre-dimensioning, and technical verification.
        </p>
        
        <div className="bg-error-container/10 border-l-4 border-error p-4 flex items-start gap-4 mb-8">
          <AlertTriangle className="text-error shrink-0 mt-0.5" size={20} />
          <div>
            <p className="text-on-error-container text-sm font-semibold">Engineering Note</p>
            <p className="text-on-error-container/80 text-sm leading-relaxed">
              Pre-dimensioning and project support tool. Does not replace confirmation against the exact text of ISO 8100-2.
            </p>
          </div>
        </div>

        <div className="space-y-8">
          {categories.map(category => {
            const categoryModules = modules.filter(m => (m.category || 'Other') === category);
            // Don't show the overview inside the generic Project group if there's an 'overview' ID
            const renderModules = categoryModules.filter(m => m.id !== 'overview');
            if (renderModules.length === 0) return null;

            return (
              <div key={category} className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-primary border-b border-outline-variant/20 pb-2">{category}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {renderModules.map(m => (
                    <button 
                      key={m.id} 
                      onClick={() => onSelect(m.id)}
                      className="p-4 bg-surface-container-lowest border border-outline-variant/10 flex items-center justify-between hover:border-primary/40 hover:shadow-md transition-all group text-left"
                    >
                      <div className="flex items-center gap-3">
                        <m.icon size={18} className="text-primary group-hover:scale-110 transition-transform" />
                        <span className="text-sm font-bold">{m.label}</span>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 uppercase border ${
                        m.status === 'implemented' ? 'bg-emerald-900/30 text-emerald-500 border-emerald-500/30' :
                        m.status === 'partial' ? 'bg-amber-900/30 text-amber-500 border-amber-500/30' : 'bg-surface-container-high text-on-surface-variant border-outline-variant'
                      }`}>
                        {m.status}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
  
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-surface-container-low p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Info size={18} className="text-primary" />
            ISO 8100-2 Clauses Covered
          </h3>
          <ul className="space-y-2 text-sm text-on-surface-variant">
            <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-emerald-500" /> 4.1 General Configuration (Implemented)</li>
            <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-emerald-500" /> 4.2 Door Locking (Implemented)</li>
            <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-emerald-500" /> 4.3 Safety Gear (Implemented)</li>
            <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-emerald-500" /> 4.5 Buffers (Implemented)</li>
            <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-emerald-500" /> 4.7/4.8 ACOP & UCMP (Implemented)</li>
            <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-emerald-500" /> 4.10 Guide Rails (Implemented)</li>
            <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-emerald-500" /> 4.11 Traction (Implemented)</li>
            <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-emerald-500" /> 4.12 Suspension (Implemented)</li>
            <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-emerald-500" /> 4.15 Hydraulics (Implemented)</li>
            <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-emerald-500" /> 4.18 SIL / PESSAL (Implemented)</li>
          </ul>
        </div>
        
        <div className="bg-surface-container-low p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <CheckSquare size={18} className="text-primary" />
            Validation & Suggestions
          </h3>
          <div className="space-y-4 text-sm text-on-surface-variant">
            <p>• Visual indicators for each parameter validation.</p>
            <p>• Recommended actions for non-compliant values.</p>
            <p>• Organized structure following ISO 8100-2 clauses.</p>
            <p>• Common presets for guide rails and belts.</p>
          </div>
        </div>
      </div>
    </div>
  );
};



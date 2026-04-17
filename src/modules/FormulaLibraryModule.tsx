import React from 'react';
import { ProjectData, ModuleStatus } from '../types';
import { safeNumber, formatNumber, degToRad, InputGroup, LiftField, SliderField, CollapsibleSection } from '../components/ui';
import { ISO_RAIL_PROFILES, BELT_PROFILES } from '../constants';
import { CheckCircle2, ShieldCheck, Zap, AlertTriangle, Info, ChevronRight, Calculator, FileText, Database, Activity, Package, Maximize, AlertCircle, PlayCircle, Settings, CheckSquare } from 'lucide-react';
import { BlockMath, InlineMath } from 'react-katex';

export const FormulaLibraryModule = () => {
  const formulas = [
    { key: "guide_bending_9", section: "4.10.2", latex: "\\sigma_m = \\frac{M_m}{W}" },
    { key: "guide_buckling_11", section: "4.10.3", latex: "\\sigma_k = \\frac{(F_v + F_{aux}) \\cdot \\omega}{A}" },
    { key: "guide_combined_15", section: "4.10.4", latex: "\\sigma = \\sigma_x + \\sigma_y \\le \\sigma_{perm}" },
    { key: "guide_combined_16", section: "4.10.4", latex: "\\sigma = \\sigma_m + \\frac{F_v + F_{aux}}{A} \\le \\sigma_{perm}" },
    { key: "guide_combined_17", section: "4.10.4", latex: "\\sigma = \\sigma_k + 0.9\\sigma_m \\le \\sigma_{perm}" },
    { key: "guide_deflection_20", section: "4.10.6", latex: "\\delta_x = 0.7 \\cdot \\frac{F_x l^3}{48 E I_y} + \\delta_{str-x}" },
    { key: "guide_deflection_21", section: "4.10.6", latex: "\\delta_y = 0.7 \\cdot \\frac{F_y l^3}{48 E I_x} + \\delta_{str-y}" },
    { key: "traction_22", section: "4.11.2.1", latex: "\\frac{T_1}{T_2} \\le e^{f_{load}\\alpha}" },
    { key: "traction_23", section: "4.11.2.2", latex: "\\frac{T_1}{T_2} \\le e^{f_{brake}\\alpha}" },
    { key: "traction_24", section: "4.11.2.3", latex: "\\frac{T_1}{T_2} \\ge e^{f_{stall}\\alpha}" },
    { key: "nequiv_33", section: "4.12.2", latex: "N_{equiv} = N_{equiv(t)} + N_{equiv(p)}" },
    { key: "nequiv_34", section: "4.12.2", latex: "N_{equiv(p)} = K_p \\cdot (N_{ps} + 4N_{pr})" },
    { key: "safety_37", section: "4.12.3", latex: "S_T = N_{lift} \\cdot C_R \\cdot H \\cdot r" },
    { key: "friction_28", section: "4.13.6", latex: "\\mu = \\frac{0.1}{1 + v/10}" },
    { key: "hydraulic_38", section: "4.15.1", latex: "e_{wall} \\ge \\frac{2.3\\cdot1.7\\cdot p}{R_{p0.2}}\\cdot\\frac{D_i}{2} + e_0" },
    { key: "jack_54", section: "4.15.2", latex: "F_s \\le \\frac{\\pi^2 E J}{2l^2}" }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-surface-container-low p-8 border-t-2 border-primary">
        <h3 className="text-xl font-bold mb-8">ISO 8100-2 Formula Library</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {formulas.map(f => (
            <div key={f.key} className="p-6 bg-slate-900 text-white rounded-xl border border-white/5 flex flex-col items-center justify-center gap-4">
              <span className="text-[10px] font-bold uppercase text-primary self-start">{f.section}</span>
              <div className="py-4">
                <BlockMath math={f.latex} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

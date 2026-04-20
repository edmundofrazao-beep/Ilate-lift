import React from 'react';
import { ProjectData, ModuleStatus } from '../types';
import { safeNumber, formatNumber, degToRad, InputGroup, LiftField, SliderField, CollapsibleSection } from '../components/ui';
import { ISO_RAIL_PROFILES, BELT_PROFILES } from '../constants';
import { CheckCircle2, ShieldCheck, Zap, AlertTriangle, Info, ChevronRight, Calculator, FileText, Database, Activity, Package, Maximize, AlertCircle, PlayCircle, Settings, CheckSquare } from 'lucide-react';
import { BlockMath, InlineMath } from 'react-katex';
import { RuptureValveModule } from './RuptureValveModule';

export const HydraulicModule = ({ data, onChange }: { data: ProjectData, onChange: (newData: Partial<ProjectData>) => void }) => {
  // Wall thickness (Formula 38)
  // e_wall >= (2.3 * 1.7 * p / Rp0.2) * (Di / 2) + e0
  const Di = data.ramDiameter + 10; // Simplified assumption
  const e0 = 0.5;
  const e_calc = ((2.3 * 1.7 * data.maxPressure) / data.materialYield) * (Di / 2) + e0;
  const isWallOk = data.cylinderWallThickness >= e_calc;

  // Buckling of Ram (Euler/Tetmajer - Simplified)
  const E = data.materialE;
  const I = (Math.PI * Math.pow(data.ramDiameter, 4)) / 64;
  const A = (Math.PI * Math.pow(data.ramDiameter, 2)) / 4;
  const i = data.ramDiameter / 4;
  const lambda = data.ramLength / i;
  
  const F_buckling_euler = (Math.PI * Math.PI * E * I) / Math.pow(data.ramLength, 2);
  const totalForce = (data.carMass + data.ratedLoad) * 9.81 * 1.4; // 1.4 factor for full pressure
  const isBucklingOk = totalForce < F_buckling_euler / 2; // Safety factor 2

  return (
    <div className="space-y-8">
      <div className="bg-surface-container-low p-8 border-t-2 border-primary">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xl font-bold">Hydraulic Systems (4.15)</h3>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${isWallOk && isBucklingOk ? 'bg-emerald-100 text-emerald-700' : 'bg-error-container/20 text-error'}`}>
            {isWallOk && isBucklingOk ? 'Implemented - OK' : 'Implemented - NOK'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className={`p-6 border ${isWallOk ? 'bg-surface-container-lowest border-outline-variant/10' : 'bg-error-container/10 border-error/20'}`}>
            <h4 className="text-xs font-bold uppercase mb-4 text-primary">Wall Thickness (e)</h4>
            <p className="text-2xl font-black">{formatNumber(data.cylinderWallThickness)} <span className="text-xs font-normal opacity-50">mm</span></p>
            <p className="text-[10px] mt-2 opacity-50 italic">Required: {formatNumber(e_calc)} mm</p>
          </div>
          
          <div className={`p-6 border ${isBucklingOk ? 'bg-surface-container-lowest border-outline-variant/10' : 'bg-error-container/10 border-error/20'}`}>
            <h4 className="text-xs font-bold uppercase mb-4 text-primary">Ram Buckling</h4>
            <p className="text-2xl font-black">{formatNumber(F_buckling_euler / 1000, 1)} <span className="text-xs font-normal opacity-50">kN</span></p>
            <p className="text-[10px] mt-2 opacity-50 italic">Critical Load (Euler)</p>
          </div>

          <div className="p-6 bg-surface-container-lowest border border-outline-variant/10">
            <h4 className="text-xs font-bold uppercase mb-4 text-primary">Maximum Pressure (p)</h4>
            <p className="text-2xl font-black">{formatNumber(data.maxPressure)} <span className="text-xs font-normal opacity-50">MPa</span></p>
          </div>
        </div>

        <div className="space-y-6 mt-8">
          <CollapsibleSection title="ISO 8100-2:2026 Hydraulic Formula Details" icon={Info}>
            <div className="space-y-4 text-sm text-on-surface-variant leading-relaxed">
              <p>
                <strong>Clause 4.15:</strong> Hydraulic components must be verified for internal pressure and buckling stability.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <div className="p-4 bg-surface-container-low rounded border border-outline-variant/10">
                  <h5 className="font-bold text-primary mb-2 uppercase text-[10px]">Cylinder Wall Thickness (e)</h5>
                  <p className="text-xs mb-2">The minimum wall thickness $e$ must withstand the maximum pressure $p$:</p>
                  <InlineMath math="e \ge \left(\frac{2.3 \cdot 1.7 \cdot p}{R_{p0.2}}\right) \cdot \frac{D_i}{2} + e_0" />
                  <p className="text-[10px] mt-2 opacity-70">Where $D_i$ is the internal diameter and $e_0$ is the corrosion allowance.</p>
                </div>
                <div className="p-4 bg-surface-container-low rounded border border-outline-variant/10">
                  <h5 className="font-bold text-primary mb-2 uppercase text-[10px]">Ram Buckling (Euler)</h5>
                  <p className="text-xs mb-2">The critical buckling load $F_k$ is calculated using Euler's formula:</p>
                  <InlineMath math="F_k = \frac{\pi^2 \cdot E \cdot I}{l^2}" />
                  <p className="text-[10px] mt-2 opacity-70">Where $l$ is the buckling length and $I$ is the second moment of area.</p>
                </div>
              </div>
            </div>
          </CollapsibleSection>

          <div className="bg-primary/5 border border-primary/10 rounded-sm p-4">
            <h4 className="text-xs font-bold uppercase mb-2">Applied Formulas (ISO 8100-2)</h4>
            <div className="font-mono text-[10px] space-y-1 opacity-70">
              <p>• Cylinder Thickness: e ≥ (2.3 · 1.7 · p / Rp0.2) · (Di / 2) + e0 [Formula 38]</p>
              <p>• Buckling: Euler Verification (λ = {formatNumber(lambda, 1)})</p>
            </div>
          </div>
        </div>
        {data.type === 'hydraulic' && <RuptureValveModule data={data} onChange={onChange} />}
      </div>
    </div>
  );
};

// Removed ACOP_UCMP_Module since it is already natively implemented inside SafetyComponentsModule

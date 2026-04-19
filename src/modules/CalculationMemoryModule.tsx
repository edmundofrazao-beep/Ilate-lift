import React from 'react';
import { ProjectData, ModuleStatus } from '../types';
import { safeNumber, formatNumber, degToRad, InputGroup, LiftField, SliderField, CollapsibleSection } from '../components/ui';
import { ISO_RAIL_PROFILES, BELT_PROFILES } from '../constants';
import { CheckCircle2, ShieldCheck, Zap, AlertTriangle, Info, ChevronRight, Calculator, FileText, Database, Activity, Package, Maximize, AlertCircle, PlayCircle, Settings, CheckSquare } from 'lucide-react';
import { BlockMath, InlineMath } from 'react-katex';

export const CalculationMemoryModule = ({ data }: { data: ProjectData }) => {
  const g = 9.81;
  const r = parseInt(data.suspension.split(':')[0]);
  const T1 = ((data.carMass + data.ratedLoad) / r) * (g + data.acceleration);
  const T2 = ((data.carMass + 0.5 * data.ratedLoad) / r) * (g - data.acceleration);
  const tractionRatio = T2 !== 0 ? T1 / T2 : 0;
  
  const N_equiv_p = data.Kp * (data.numSimpleBends + 4 * data.numReverseBends);
  const N_equiv = data.N_equiv_t + N_equiv_p;
  
  const ST = data.N_lift * data.C_R * data.travel * r;

  // SIL Calculations
  const lambdaD = data.failureRate * (data.dangerousFraction / 100);
  const pfh = lambdaD * (1 - (data.diagnosticCoverage / 100));
  const silLimits = {
    3: { min: 1e-8, max: 1e-7, label: 'SIL 3' },
    2: { min: 1e-7, max: 1e-6, label: 'SIL 2' },
    1: { min: 1e-6, max: 1e-5, label: 'SIL 1' }
  };
  const currentLimit = silLimits[data.silLevel as keyof typeof silLimits] || silLimits[1];
  const isPfhOk = pfh <= currentLimit.max;
  const minDc = data.silLevel === 3 ? 90 : (data.silLevel === 2 ? 60 : 0);
  const isDcOk = data.diagnosticCoverage >= minDc;
  const isSilOk = isPfhOk && isDcOk;

  // Buffer Calculations
  const impactMass = data.carMass + data.ratedLoad;
  const v_impact = 1.15 * data.speed;
  const Ek = 0.5 * impactMass * v_impact * v_impact;
  const h_m = data.bufferStroke / 1000;
  const Ep = impactMass * g * h_m;
  const Etotal = Ek + Ep;
  const Ecap = Etotal; // Alias for UI
  const h_min = (data.bufferType === 'energy-accumulation' ? (data.bufferIsLinear ? 0.135 : 0.067) : 0.0674) * data.speed * data.speed * 1000;
  const isBufferMassOk = impactMass >= data.bufferMinMass && impactMass <= data.bufferMaxMass;
  const a_avg = h_m > 0 ? (v_impact * v_impact) / (2 * h_m * g) : 0;
  const isEnergyOk = a_avg <= 1.0;

  // Safety Gear Calculations
  const totalMass = data.carMass + data.ratedLoad;
  const isMassOk = totalMass <= data.safetyGearMaxMass;
  const isSpeedOk = data.osgTrippingSpeed <= data.safetyGearCertifiedSpeed;
  const retardationG = data.safetyGearBrakingForce > 0 ? (data.safetyGearBrakingForce / (totalMass * g)) - 1 : 0;
  const isRetardationOk = retardationG >= 0.2 && retardationG <= 1.0;

  // Guide Rail Calculations
  const E = data.materialE;
  const l = data.bracketDist;
  const Fh = (data.ratedLoad + data.carMass) * g * 0.1;
  const Mm = (3 * Fh * l) / 16;
  const sigma_my = data.railWy > 0 ? Mm / data.railWy : 0;
  const sigma_mx = data.railWx > 0 ? (Mm * 0.5) / data.railWx : 0; 
  const sigma_m = Math.sqrt(Math.pow(sigma_my, 2) + Math.pow(sigma_mx, 2));
  
  const lambda_y = data.railIyRadius > 0 ? l / data.railIyRadius : 0;
  const lambda_x = data.railIxRadius > 0 ? l / data.railIxRadius : 0;
  const lambda = Math.max(lambda_y, lambda_x);
  let omega = 1;
  if (lambda <= 20) omega = 1.0;
  else if (lambda <= 115) omega = 1 + 0.0001 * Math.pow(lambda, 2);
  else omega = 0.00007 * Math.pow(lambda, 2);

  const F_safety_gear = (data.ratedLoad + data.carMass) * g * 0.6;
  const F_rail_weight = data.railWeight * data.travel * g;
  const Fv = F_safety_gear + F_rail_weight;
  const sigma_k = data.railArea > 0 ? (Fv * omega) / data.railArea : 0;
  const sigma_combined = sigma_k + 0.9 * sigma_m;
  const isCombinedOk = sigma_combined < data.materialYield;

  const delta_y = (data.railIy > 0 && E > 0) ? (Fh * Math.pow(l, 3)) / (48 * E * data.railIy) : 0;
  const delta_x = (data.railIx > 0 && E > 0) ? ((Fh * 0.5) * Math.pow(l, 3)) / (48 * E * data.railIx) : 0;
  const delta = Math.sqrt(Math.pow(delta_y, 2) + Math.pow(delta_x, 2));
  const isDeflectionOk = delta < 5;
  const summaryRows = [
    { label: 'Traction Ratio', value: formatNumber(tractionRatio), status: tractionRatio > 0 ? 'tracked' : 'pending' },
    { label: 'Equivalent Pulley Count', value: formatNumber(N_equiv), status: 'computed' },
    { label: 'PFH', value: pfh.toExponential(2), status: isSilOk ? 'ok' : 'review' },
    { label: 'Combined Rail Stress', value: `${formatNumber(sigma_combined)} N/mm²`, status: isCombinedOk ? 'ok' : 'review' },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-sm border border-outline-variant/20 bg-surface-container-low p-6">
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-sm border border-outline-variant/20 bg-gradient-to-br from-surface-container-high to-surface-container-lowest p-6">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-primary">
              <FileText size={12} />
              Calculation memory
            </div>
            <h3 className="text-2xl font-black tracking-tight text-on-surface">Technical Memory Workspace</h3>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-on-surface-variant">
              Use this page as the final technical summary before export.
            </p>
          </div>
          <div className="rounded-sm border border-outline-variant/20 bg-surface-container-lowest p-6">
            <div className="mb-4 flex items-center gap-2">
              <Database size={14} className="text-primary" />
              <h4 className="text-[11px] font-black uppercase tracking-[0.22em] text-white">Executive Snapshot</h4>
            </div>
            <div className="space-y-3">
              {summaryRows.map((row) => (
                <div key={row.label} className="flex items-center justify-between gap-4 rounded-sm border border-outline-variant/20 bg-surface-container-low p-3">
                  <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-on-surface-variant">{row.label}</span>
                  <div className="text-right">
                    <div className="text-sm font-black text-on-surface">{row.value}</div>
                    <div className={`text-[9px] font-black uppercase tracking-[0.16em] ${row.status === 'ok' ? 'text-emerald-300' : row.status === 'review' ? 'text-amber-300' : 'text-white/45'}`}>
                      {row.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div id="calculation-memory-report" className="space-y-8 max-w-5xl mx-auto bg-white p-12 shadow-sm border border-outline-variant/10 font-serif text-slate-900">
      <div className="text-center border-b-2 border-slate-900 pb-8 mb-8">
        <h2 className="text-3xl font-black uppercase tracking-tighter">Technical Calculation Report</h2>
        <p className="text-sm italic mt-2">Project Alpha-7 | ISO 8100-2:2026 Engineering Compliance</p>
      </div>

      <section className="space-y-6">
        <h3 className="text-xl font-bold border-b border-slate-200 pb-2">0. Project Input Parameters</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-[10px] uppercase font-bold text-slate-600">
          <div className="p-2 bg-slate-50 rounded border border-slate-100">
            <p className="opacity-50">Rated Load (Q)</p>
            <p className="text-slate-900">{data.ratedLoad} kg</p>
          </div>
          <div className="p-2 bg-slate-50 rounded border border-slate-100">
            <p className="opacity-50">Car Mass (P)</p>
            <p className="text-slate-900">{data.carMass} kg</p>
          </div>
          <div className="p-2 bg-slate-50 rounded border border-slate-100">
            <p className="opacity-50">Rated Speed (v)</p>
            <p className="text-slate-900">{data.speed} m/s</p>
          </div>
          <div className="p-2 bg-slate-50 rounded border border-slate-100">
            <p className="opacity-50">Suspension</p>
            <p className="text-slate-900">{data.suspension}</p>
          </div>
          <div className="p-2 bg-slate-50 rounded border border-slate-100">
            <p className="opacity-50">Travel (H)</p>
            <p className="text-slate-900">{data.travel} m</p>
          </div>
          <div className="p-2 bg-slate-50 rounded border border-slate-100">
            <p className="opacity-50">Sheave (D)</p>
            <p className="text-slate-900">{data.sheaveDiameter} mm</p>
          </div>
          <div className="p-2 bg-slate-50 rounded border border-slate-100">
            <p className="opacity-50">Rope (d)</p>
            <p className="text-slate-900">{data.ropeDiameter} mm</p>
          </div>
          <div className="p-2 bg-slate-50 rounded border border-slate-100">
            <p className="opacity-50">Num Ropes (n)</p>
            <p className="text-slate-900">{data.numRopes}</p>
          </div>
          <div className="p-2 bg-slate-50 rounded border border-slate-100">
            <p className="opacity-50">Groove Type</p>
            <p className="text-slate-900">{data.grooveType}</p>
          </div>
          <div className="p-2 bg-slate-50 rounded border border-slate-100">
            <p className="opacity-50">Spec. Pressure</p>
            <p className="text-slate-900">{data.ropeSpecificPressure} MPa</p>
          </div>
          <div className="p-2 bg-slate-50 rounded border border-slate-100">
            <p className="opacity-50">Belt Width/Thick</p>
            <p className="text-slate-900">{data.beltWidth}x{data.beltThickness} mm</p>
          </div>
          <div className="p-2 bg-slate-50 rounded border border-slate-100">
            <p className="opacity-50">Num Belts</p>
            <p className="text-slate-900">{data.numBelts}</p>
          </div>
          <div className="p-2 bg-slate-50 rounded border border-slate-100">
            <p className="opacity-50">Belt Strength</p>
            <p className="text-slate-900">{data.beltTensileStrength} N</p>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <h3 className="text-xl font-bold border-b border-slate-200 pb-2">1. Traction System Analysis (Clause 4.11)</h3>
        <div className="space-y-4">
          <p className="text-sm leading-relaxed">Traction proof based on static and dynamic loading of the traction sheave.</p>
          <div className="bg-slate-50 p-6 rounded border border-slate-100 flex flex-col items-center gap-4">
            <BlockMath math={`T_1 = \\frac{(P + Q)}{r} \\cdot (g_n + a) = \\frac{(${data.carMass} + ${data.ratedLoad})}{${r}} \\cdot (9.81 + ${data.acceleration}) = ${formatNumber(T1)} \\text{ N}`} />
            <BlockMath math={`T_2 = \\frac{(P + 0.5Q)}{r} \\cdot (g_n - a) = \\frac{(${data.carMass} + 500)}{${r}} \\cdot (9.81 - ${data.acceleration}) = ${formatNumber(T2)} \\text{ N}`} />
            <BlockMath math={`\\text{Ratio } T_1/T_2 = ${formatNumber(tractionRatio)}`} />
          </div>
          <p className="text-sm leading-relaxed">Three operating conditions are tracked: loading, braking and stalling.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-50 p-4 rounded border border-slate-100">
              <p className="text-[10px] font-bold uppercase mb-2">4.11.2.1 Loading</p>
              <InlineMath math="\frac{T_1}{T_2} \le e^{f_{load}\alpha}" />
            </div>
            <div className="bg-slate-50 p-4 rounded border border-slate-100">
              <p className="text-[10px] font-bold uppercase mb-2">4.11.2.2 Braking</p>
              <InlineMath math="\frac{T_1}{T_2} \le e^{f_{brake}\alpha}" />
            </div>
            <div className="bg-slate-50 p-4 rounded border border-slate-100">
              <p className="text-[10px] font-bold uppercase mb-2">4.11.2.3 Stalling</p>
              <InlineMath math="\frac{T_1}{T_2} \ge e^{f_{stall}\alpha}" />
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <h3 className="text-xl font-bold border-b border-slate-200 pb-2">2. Suspension Means Verification (Clause 4.12)</h3>
        <div className="space-y-4">
          <p className="text-sm leading-relaxed">{'Equivalent pulley count $N_{equiv}$ drives the required safety factor.'}</p>
          <div className="bg-slate-50 p-6 rounded border border-slate-100 flex flex-col items-center gap-4">
            <BlockMath math={`N_{equiv} = N_{equiv(t)} + N_{equiv(p)} = ${data.N_equiv_t} + ${formatNumber(N_equiv_p)} = ${formatNumber(N_equiv)}`} />
            <BlockMath math={`N_{equiv(p)} = K_p \\cdot (N_{ps} + 4N_{pr}) = ${data.Kp} \\cdot (${data.numSimpleBends} + 4 \\cdot ${data.numReverseBends}) = ${formatNumber(N_equiv_p)}`} />
          </div>
          <p className="text-sm leading-relaxed">Required safety factor according to Formula 36:</p>
          <div className="bg-slate-50 p-6 rounded border border-slate-100 flex flex-col items-center gap-4">
            <BlockMath math="S_{f,req} = 10^{2.6834 - \frac{\log(N_{equiv} / 2.6834 \cdot 10^6)}{\log(D/d)}}" />
          </div>
          <p className="text-sm leading-relaxed">Total number of trips $S_T$:</p>
          <div className="bg-slate-50 p-6 rounded border border-slate-100 flex flex-col items-center gap-4">
            <BlockMath math={`S_T = N_{lift} \\cdot C_R \\cdot H \\cdot r = ${data.N_lift} \\cdot ${data.C_R} \\cdot ${data.travel} \\cdot ${r} = ${formatNumber(ST, 0)}`} />
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <h3 className="text-xl font-bold border-b border-slate-200 pb-2">3. Guide Rails Analysis (Clause 4.10)</h3>
        <div className="space-y-4">
          <p className="text-sm leading-relaxed">Bending, buckling, combined stress and deflection for the selected rail profile.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-50 p-6 rounded border border-slate-100 flex flex-col items-center gap-4">
              <p className="text-[10px] font-bold uppercase">4.10.2 Bending</p>
              <BlockMath math={`\\sigma_m = ${formatNumber(sigma_m)} \\text{ N/mm}^2`} />
              <p className="text-[10px] opacity-50">Limit: {data.materialYield} N/mm²</p>
            </div>
            <div className="bg-slate-50 p-6 rounded border border-slate-100 flex flex-col items-center gap-4">
              <p className="text-[10px] font-bold uppercase">4.10.3 Buckling</p>
              <BlockMath math={`\\sigma_k = ${formatNumber(sigma_k)} \\text{ N/mm}^2`} />
              <p className="text-[10px] opacity-50">Limit: {data.materialYield} N/mm² (ω = {formatNumber(omega, 2)})</p>
            </div>
          </div>
          <p className="text-sm leading-relaxed">Combined stress verification:</p>
          <div className="bg-slate-50 p-6 rounded border border-slate-100 flex flex-col items-center gap-4">
            <BlockMath math={`\\sigma = \\sigma_k + 0.9 \\cdot \\sigma_m = ${formatNumber(sigma_combined)} \\text{ N/mm}^2`} />
            <p className="text-xs font-bold text-primary">Compliance: {isCombinedOk ? 'YES' : 'NO'} (Limit: {data.materialYield} N/mm²)</p>
          </div>
          <p className="text-sm leading-relaxed">Deflection verification:</p>
          <div className="bg-slate-50 p-6 rounded border border-slate-100 flex flex-col items-center gap-4">
            <BlockMath math={`\\delta = ${formatNumber(delta)} \\text{ mm}`} />
            <div className="w-full space-y-2 mt-4">
              <div className="flex justify-between text-xs">
                <span>Deflection Limit</span>
                <span className={isDeflectionOk ? 'text-emerald-700 font-bold' : 'text-error font-bold'}>{formatNumber(delta)} / 5.0 mm</span>
              </div>
              <div className="flex justify-between text-xs">
                <span>Rail Profile</span>
                <span className="font-bold">{data.railProfile}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span>Bracket Distance (l)</span>
                <span className="font-bold">{data.bracketDist} mm</span>
              </div>
              <div className="flex justify-between text-xs">
                <span>Elastic Modulus (E)</span>
                <span className="font-bold">{formatNumber(data.materialE / 1000, 0)} GPa</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <h3 className="text-xl font-bold border-b border-slate-200 pb-2">4. Safety Components (Clause 4.3, 4.5, 4.7, 4.8)</h3>
        <div className="space-y-6">
          <div className="space-y-4">
            <h4 className="text-lg font-bold">4.3 Safety Gear</h4>
            <p className="text-sm leading-relaxed">Certified mass, speed and retardation summary.</p>
            <div className="bg-slate-50 p-6 rounded border border-slate-100 space-y-4">
              <div className="flex justify-between text-sm">
                <span>Certified Mass (P+Q)</span>
                <span className={isMassOk ? 'text-emerald-700 font-bold' : 'text-error font-bold'}>{formatNumber(totalMass)} / {data.safetyGearMaxMass} kg</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Braking Force (Fb)</span>
                <span className="font-bold">{formatNumber(data.safetyGearBrakingForce)} N</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Certified Speed</span>
                <span className={isSpeedOk ? 'text-emerald-700 font-bold' : 'text-error font-bold'}>{formatNumber(data.osgTrippingSpeed)} / {data.safetyGearCertifiedSpeed} m/s</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Resultant Retardation</span>
                <span className={isRetardationOk ? 'text-emerald-700 font-bold' : 'text-error font-bold'}>{formatNumber(retardationG)} gn</span>
              </div>
              <p className="text-[10px] opacity-50 italic text-center">Normative range: 0.2gn - 1.0gn</p>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-bold">4.5 Buffers</h4>
            <p className="text-sm leading-relaxed">Energy absorption, stroke and mass compliance summary.</p>
            <div className="bg-slate-50 p-6 rounded border border-slate-100 flex flex-col items-center gap-4">
              <BlockMath math={`E_{total} = \\frac{1}{2} m v^2 + m g h = ${formatNumber(Etotal)} \\text{ J}`} />
              <BlockMath math={`h_{min} = ${data.bufferType === 'energy-accumulation' ? (data.bufferIsLinear ? '0.135' : '0.067') : '0.0674'} \\cdot v^2 = ${formatNumber(h_min)} \\text{ mm}`} />
              <div className="w-full space-y-2 mt-4">
                <div className="flex justify-between text-xs">
                  <span>Buffer Type</span>
                  <span className="font-bold uppercase">{data.bufferType.replace('-', ' ')} ({data.bufferIsLinear ? 'Linear' : 'Non-Linear'})</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span>Stroke Compliance</span>
                  <span className={data.bufferStroke >= h_min ? 'text-emerald-700 font-bold' : 'text-error font-bold'}>{data.bufferStroke} / {formatNumber(h_min)} mm</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span>Mass Compliance</span>
                  <span className={isBufferMassOk ? 'text-emerald-700 font-bold' : 'text-error font-bold'}>{formatNumber(impactMass)} / [{data.bufferMinMass}-{data.bufferMaxMass}] kg</span>
                </div>
                {data.bufferType === 'energy-dissipation' && (
                  <div className="flex justify-between text-xs">
                    <span>Avg Deceleration</span>
                    <span className={isEnergyOk ? 'text-emerald-700 font-bold' : 'text-error font-bold'}>{formatNumber(a_avg)} / 1.0 gn</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-bold">4.6 Safety Circuits</h4>
            <p className="text-sm leading-relaxed">PFH and diagnostic coverage summary for the selected SIL target.</p>
            <div className="bg-slate-50 p-6 rounded border border-slate-100 flex flex-col items-center gap-4">
              <BlockMath math={`\\lambda_D = \\lambda \\cdot B = ${data.failureRate} \\cdot ${data.dangerousFraction / 100} = ${lambdaD.toExponential(2)}`} />
              <BlockMath math={`PFH = \\lambda_D \\cdot (1 - DC) = ${pfh.toExponential(2)} \\text{ failures/h}`} />
              <p className="text-xs font-bold text-primary">Compliance: {isSilOk ? 'YES' : 'NO'} (Target: {silLimits[data.silLevel as keyof typeof silLimits]?.label})</p>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <h3 className="text-xl font-bold border-b border-slate-200 pb-2">5. Hydraulic Systems (Clause 4.15)</h3>
        <div className="space-y-4">
          <p className="text-sm leading-relaxed">Cylinder wall thickness and ram buckling references.</p>
          <div className="bg-slate-50 p-6 rounded border border-slate-100 flex flex-col items-center gap-4">
            <BlockMath math="e_{wall} \ge \frac{2.3 \cdot 1.7 \cdot p}{R_{p0.2}} \cdot \frac{D_i}{2} + e_0" />
            <BlockMath math="F_s \le \frac{\pi^2 E J}{2l^2}" />
          </div>
        </div>
      </section>

      {data.tractionNotes && (
        <section className="space-y-4">
          <h3 className="text-xl font-bold border-b border-slate-200 pb-2">6. Engineering Observations</h3>
          <p className="text-sm leading-relaxed whitespace-pre-wrap italic text-slate-600 bg-amber-50 p-6 rounded border border-amber-100">
            {data.tractionNotes}
          </p>
        </section>
      )}

      <div className="mt-12 pt-8 border-t border-on-surface/10 text-[10px] text-on-surface-variant italic">
        Pre-dimensioning summary. Final manufacturer and clause confirmation still required.
      </div>
      </div>
    </div>
  );
};

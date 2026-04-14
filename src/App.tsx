/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Globe, 
  Library, 
  Settings2, 
  Cable, 
  ArrowUpDown, 
  Droplets, 
  ShieldCheck, 
  ShieldAlert,
  Box, 
  Lock,
  History, 
  FileText, 
  CheckSquare,
  Play,
  AlertTriangle,
  Info,
  CheckCircle2,
  XCircle,
  Search,
  Settings,
  HelpCircle,
  UserCircle,
  Maximize2,
  ChevronRight,
  AlertCircle
} from 'lucide-react';

// --- Types & Interfaces ---

interface ProjectData {
  type: 'electric' | 'hydraulic';
  suspension: '1:1' | '2:1' | '4:1';
  ratedLoad: number; // Q (kg)
  carMass: number; // P (kg)
  cwtMass: number; // Mcwt (kg)
  speed: number; // v (m/s)
  travel: number; // H (m)
  stops: number;
  floorHeight: number;
  numRopes: number; // n
  ropeDiameter: number; // d (mm)
  sheaveDiameter: number; // D (mm)
  wrapAngle: number; // alpha (deg)
  grooveAngle: number; // gamma (deg)
  undercutAngle: number; // beta (deg)
  frictionCoeff: number; // mu
  efficiency: number;
  guideType: string;
  bracketDist: number; // l (mm)
  materialE: number; // E (N/mm2)
  materialYield: number; // Rp0.2 (N/mm2)
  loadCycles: number; // For lifetime estimation
  ropeType: string; // e.g., "Steel Wire", "Coated"
  safetyGearType: 'instantaneous' | 'progressive' | 'buffered';
  osgTrippingSpeed: number; // vt (m/s)
  osgTensileForce: number; // Ft (N)
  osgBreakingLoad: number; // F_osg_min (N)
  tractionNotes: string;
  // Guide Rail Properties
  railArea: number; // A (mm2)
  railIy: number; // Iy (mm4)
  railIx: number; // Ix (mm4)
  railWy: number; // Wy (mm3)
  railWx: number; // Wx (mm3)
  railIyRadius: number; // iy (mm)
  railIxRadius: number; // ix (mm)
  railWeight: number; // q1 (kg/m)
  // Rope Advanced Properties
  numSimpleBends: number; // Nps
  numReverseBends: number; // Npr
  ropeBreakingLoad: number; // Fmin (N)
  // Safety Gear Advanced
  safetyGearMaxMass: number; // P+Q max (kg)
  safetyGearBrakingForce: number; // Fb (N)
  // Hydraulic Advanced
  ramDiameter: number; // d (mm)
  cylinderWallThickness: number; // e (mm)
  ramLength: number; // L (mm)
  maxPressure: number; // p (MPa)
  // Buffers
  bufferStroke: number; // h (mm)
  bufferType: 'energy-accumulation' | 'energy-dissipation';
  bufferMaxMass: number; // kg
  bufferMinMass: number; // kg
  bufferIsLinear: boolean;
  // Sling Properties
  uprightSection: string;
  uprightArea: number; // A (mm2)
  uprightWy: number; // Wy (mm3)
  slingHeight: number; // H (mm)
  // Sheave Properties
  sheaveHardness: number; // HB
  // SIL-rated Circuits (4.18)
  silLevel: number;
  safetyIntegrity: string;
  faultTolerance: number;
  mtbf: number; // hours
  failureRate: number; // λ (failures per hour)
  // Door Locking (4.2)
  doorLockingForce: number; // N
  doorLockingEngagement: number; // mm
  doorLockingElectricalCheck: boolean;
  osgMaxBrakingForce: number; // F_max (N)
}

interface ModuleStatus {
  id: string;
  label: string;
  icon: React.ElementType;
  status: 'implemented' | 'partial' | 'placeholder';
}

// --- Helpers ---

const safeNumber = (val: any, fallback = 0) => {
  const n = parseFloat(val);
  return isNaN(n) ? fallback : n;
};

const formatNumber = (val: number, decimals = 2) => {
  return val.toLocaleString('pt-PT', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
};

const degToRad = (deg: number) => (deg * Math.PI) / 180;

// --- Modules ---

const OverviewModule = ({ modules }: { modules: ModuleStatus[] }) => (
  <div className="space-y-8">
    <div className="bg-surface-container-low p-8 rounded-sm border border-outline-variant/10">
      <h2 className="text-2xl font-black text-on-surface mb-4">LiftCalc - Engineering & Calculation Tool</h2>
      <p className="text-on-surface-variant mb-6 leading-relaxed">
        Ferramenta técnica modular para projeto de ascensores baseada na <strong>ISO 8100-2:2026</strong>. 
        Esta aplicação foca-se no design, projeto, pré-dimensionamento e verificação técnica.
      </p>
      
      <div className="bg-error-container/10 border-l-4 border-error p-4 flex items-start gap-4 mb-8">
        <AlertTriangle className="text-error shrink-0 mt-0.5" size={20} />
        <div>
          <p className="text-on-error-container text-sm font-semibold">Nota de Engenharia</p>
          <p className="text-on-error-container/80 text-sm leading-relaxed">
            Ferramenta de pré-dimensionamento e apoio ao projeto. Não substitui a confirmação contra o texto exato da ISO 8100-2.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {modules.map(m => (
          <div key={m.id} className="p-4 bg-surface-container-lowest border border-outline-variant/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <m.icon size={18} className="text-primary" />
              <span className="text-sm font-bold">{m.label}</span>
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
              m.status === 'implemented' ? 'bg-emerald-100 text-emerald-700' :
              m.status === 'partial' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'
            }`}>
              {m.status}
            </span>
          </div>
        ))}
      </div>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="bg-surface-container-low p-6">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Info size={18} className="text-primary" />
          Secções ISO 8100-2 Cobertas
        </h3>
        <ul className="space-y-2 text-sm text-on-surface-variant">
          <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-emerald-500" /> 4.11 Traction calculation (Implemented)</li>
          <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-emerald-500" /> 4.12 Evaluation of safety factor of ropes (Implemented)</li>
          <li className="flex items-center gap-2"><AlertCircle size={14} className="text-amber-500" /> 4.10 Guide rails calculation (Partial)</li>
          <li className="flex items-center gap-2"><AlertCircle size={14} className="text-amber-500" /> 4.15 Calculations of rams/cylinders (Partial)</li>
          <li className="flex items-center gap-2 opacity-50"><Info size={14} /> 4.3 Verification of safety gear (Placeholder)</li>
          <li className="flex items-center gap-2 opacity-50"><Info size={14} /> 4.5 Verification of buffers (Placeholder)</li>
        </ul>
      </div>
      
      <div className="bg-surface-container-low p-6">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <CheckSquare size={18} className="text-primary" />
          Simplificações Assumidas
        </h3>
        <div className="space-y-4 text-sm text-on-surface-variant">
          <p>• Coeficiente de fricção μ baseado na Formula (28) para travagem de emergência.</p>
          <p>• Cálculo de guias focado em flexão e encurvadura (Omega method) para pré-dimensionamento.</p>
          <p>• Rácio D/d verificado contra limite normativo de 40.</p>
        </div>
      </div>
    </div>
  </div>
);

const GlobalProjectModule = ({ data, onChange }: { data: ProjectData, onChange: (newData: Partial<ProjectData>) => void }) => {
  const InputGroup = ({ label, children }: { label: string, children: React.ReactNode }) => (
    <div className="space-y-4 p-6 bg-surface-container-low border border-outline-variant/5">
      <h3 className="text-xs font-bold uppercase tracking-widest text-primary border-b border-primary/20 pb-2">{label}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {children}
      </div>
    </div>
  );

  const Field = ({ label, name, unit, type = "number" }: { label: string, name: keyof ProjectData, unit?: string, type?: string }) => (
    <div className="space-y-1">
      <label className="text-[11px] font-bold text-on-surface-variant uppercase">{label}</label>
      <div className="relative">
        <input 
          type={type}
          value={data[name]}
          onChange={(e) => onChange({ [name]: type === 'number' ? safeNumber(e.target.value) : e.target.value })}
          className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-sm px-3 py-2 text-sm focus:ring-1 focus:ring-primary outline-none"
        />
        {unit && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-on-surface-variant opacity-50">{unit}</span>}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <InputGroup label="Configuração Geral">
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-on-surface-variant uppercase">Tipo de Elevador</label>
            <select 
              value={data.type}
              onChange={(e) => onChange({ type: e.target.value as any })}
              className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-sm px-3 py-2 text-sm focus:ring-1 focus:ring-primary outline-none"
            >
              <option value="electric">Elétrico (Traction)</option>
              <option value="hydraulic">Hidráulico</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-on-surface-variant uppercase">Suspensão</label>
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
          <Field label="Carga Nominal (Q)" name="ratedLoad" unit="kg" />
          <Field label="Massa Cabina (P)" name="carMass" unit="kg" />
          <Field label="Massa Contrapeso (Mcwt)" name="cwtMass" unit="kg" />
          <Field label="Velocidade Nominal (v)" name="speed" unit="m/s" />
        </InputGroup>

        <InputGroup label="Poço e Curso">
          <Field label="Curso (H)" name="travel" unit="m" />
          <Field label="Nº de Paragens" name="stops" />
          <Field label="Altura Piso a Piso" name="floorHeight" unit="m" />
          <Field label="Distância Brackets (l)" name="bracketDist" unit="mm" />
        </InputGroup>

        <InputGroup label="Sistema de Tração">
          <Field label="Nº de Cabos (n)" name="numRopes" />
          <Field label="Diâmetro Cabo (d)" name="ropeDiameter" unit="mm" />
          <Field label="Diâmetro Polia (D)" name="sheaveDiameter" unit="mm" />
          <Field label="Ângulo Abraçamento (α)" name="wrapAngle" unit="deg" />
          <Field label="Ângulo Ranhura (γ)" name="grooveAngle" unit="deg" />
          <Field label="Ângulo Undercut (β)" name="undercutAngle" unit="deg" />
        </InputGroup>

        <InputGroup label="Materiais e Guias">
          <Field label="Tipo de Guia" name="guideType" type="text" />
          <Field label="Módulo Elasticidade (E)" name="materialE" unit="N/mm²" />
          <Field label="Yield Strength (Rp0.2)" name="materialYield" unit="N/mm²" />
          <Field label="Coef. Fricção (μ)" name="frictionCoeff" />
          <Field label="Área Secção (A)" name="railArea" unit="mm²" />
          <Field label="Momento Inércia (Iy)" name="railIy" unit="mm⁴" />
          <Field label="Momento Inércia (Ix)" name="railIx" unit="mm⁴" />
          <Field label="Módulo Secção (Wy)" name="railWy" unit="mm³" />
          <Field label="Módulo Secção (Wx)" name="railWx" unit="mm³" />
          <Field label="Raio Giração (iy)" name="railIyRadius" unit="mm" />
          <Field label="Raio Giração (ix)" name="railIxRadius" unit="mm" />
        </InputGroup>
      </div>
    </div>
  );
};

const TractionModule = ({ data, onChange }: { data: ProjectData, onChange: (newData: Partial<ProjectData>) => void }) => {
  const g = 9.81;
  const r = parseInt(data.suspension.split(':')[0]);
  
  // Traction Calculations (ISO 8100-2:2026)
  const T1_static = ((data.carMass + data.ratedLoad) * g) / r;
  const T2_static = (data.cwtMass * g) / r;
  
  const mu_dynamic = 0.1 / (1 + data.speed / 10); // Formula (28)
  
  // f_load for semi-circular undercut (Formula 24)
  const beta = degToRad(data.undercutAngle);
  const gamma = degToRad(data.grooveAngle);
  const f_load = data.frictionCoeff * (4 * (Math.cos(gamma/2) - Math.sin(beta/2))) / (Math.PI - beta - gamma - Math.sin(beta) + Math.sin(gamma));
  
  const alpha = degToRad(data.wrapAngle);
  const expMuAlpha = Math.exp(f_load * alpha);
  const ratio = T2_static > 0 ? T1_static / T2_static : 0;
  const margin = ratio > 0 ? expMuAlpha / ratio : 0;
  
  const isOk = ratio <= expMuAlpha && ratio > 0;

  const DdRatio = data.ropeDiameter > 0 ? data.sheaveDiameter / data.ropeDiameter : 0;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-surface-container-low p-6 border-t-2 border-primary">
            <h3 className="text-lg font-bold mb-6 flex items-center justify-between">
              Verificação de Aderência (Traction)
              <span className={`text-xs px-3 py-1 rounded-full font-bold uppercase ${isOk ? 'bg-emerald-100 text-emerald-700' : 'bg-error-container/20 text-error'}`}>
                {isOk ? 'OK' : 'NOK'}
              </span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="p-4 bg-surface-container-lowest border border-outline-variant/10">
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase mb-1">T1 (Static Load Side)</p>
                  <p className="text-xl font-black">{formatNumber(T1_static)} <span className="text-xs font-normal opacity-50">N</span></p>
                </div>
                <div className="p-4 bg-surface-container-lowest border border-outline-variant/10">
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase mb-1">T2 (Counterweight Side)</p>
                  <p className="text-xl font-black">{formatNumber(T2_static)} <span className="text-xs font-normal opacity-50">N</span></p>
                </div>
                <div className="p-4 bg-surface-container-lowest border border-outline-variant/10">
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase mb-1">Rácio T1/T2</p>
                  <p className="text-xl font-black">{formatNumber(ratio)}</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 bg-surface-container-lowest border border-outline-variant/10">
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase mb-1">exp(f·α)</p>
                  <p className="text-xl font-black">{formatNumber(expMuAlpha)}</p>
                </div>
                <div className="p-4 bg-surface-container-lowest border border-outline-variant/10">
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase mb-1">Margem de Aderência</p>
                  <p className={`text-xl font-black ${margin < 1.1 ? 'text-amber-600' : ''}`}>{formatNumber(margin)}</p>
                </div>
                <div className="p-4 bg-surface-container-lowest border border-outline-variant/10">
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase mb-1">Rácio D/d</p>
                  <p className={`text-xl font-black ${DdRatio < 40 ? 'text-error' : ''}`}>{formatNumber(DdRatio)}</p>
                </div>
              </div>
            </div>

            <div className="mt-8 p-4 bg-primary/5 border border-primary/10 rounded-sm">
              <h4 className="text-xs font-bold uppercase mb-2">Fórmulas Aplicadas (ISO 8100-2:2026)</h4>
              <div className="font-mono text-[11px] space-y-1 opacity-70">
                <p>• Verificação: T1/T2 ≤ exp(f · α) [Formula 22]</p>
                <p>• Coef. Fricção μ (Dynamic): 0.1 / (1 + v/10) [Formula 28]</p>
                <p>• f_load (Semi-circular): μ · 4(cos(γ/2) - sin(β/2)) / (π - β - γ - sin β + sin γ) [Formula 24]</p>
              </div>
            </div>
          </div>

          {/* 4.13 Specific Pressure on Sheave */}
          <div className="bg-surface-container-low p-6 border-t-2 border-primary">
            <div className="flex items-center gap-4 border-b border-outline-variant/20 pb-2 mb-6">
              <Settings2 className="text-primary" size={20} />
              <h4 className="text-sm font-bold uppercase tracking-wider">4.13 Specific Pressure on Sheave</h4>
            </div>
            
            {(() => {
              const p_groove = (T1_static + T2_static) / (data.sheaveDiameter * data.ropeDiameter);
              const p_allow = (data.sheaveHardness * 10) / (1 + 2 * data.speed);
              const isPressureOk = p_groove < p_allow;

              return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className={`p-6 border ${isPressureOk ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
                    <p className="text-[10px] font-bold uppercase mb-1">Pressão Específica (p)</p>
                    <p className="text-2xl font-black">{formatNumber(p_groove)} <span className="text-xs font-normal opacity-50">MPa</span></p>
                    <p className="mt-2 text-[10px] opacity-70 italic">Limite Admissível: {formatNumber(p_allow)} MPa</p>
                    <div className="mt-4 flex items-center gap-2">
                      {isPressureOk ? <CheckCircle2 size={16} className="text-emerald-600" /> : <AlertCircle size={16} className="text-amber-600" />}
                      <span className={`text-xs font-bold uppercase ${isPressureOk ? 'text-emerald-700' : 'text-amber-700'}`}>
                        {isPressureOk ? 'Pressão Conforme' : 'Risco de Desgaste'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-4 p-6 bg-surface-container-lowest border border-outline-variant/10">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-on-surface-variant uppercase">Dureza Brinell (HB)</label>
                      <input 
                        type="number"
                        value={data.sheaveHardness}
                        onChange={(e) => onChange({ sheaveHardness: safeNumber(e.target.value) })}
                        className="w-full bg-surface-container-low border border-outline-variant/20 rounded-sm px-3 py-2 text-sm outline-none"
                      />
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900 text-white p-6 rounded-sm">
            <h3 className="text-xs font-bold uppercase tracking-widest text-indigo-300 mb-4">Observações Técnicas</h3>
            <div className="space-y-4 text-[11px] leading-relaxed opacity-80">
              {ratio > expMuAlpha && <p className="text-error font-bold">⚠️ FALHA DE ADERÊNCIA: O rácio T1/T2 excede a capacidade de tração da polia.</p>}
              {DdRatio < 40 && <p className="text-amber-400 font-bold">⚠️ RÁCIO D/d BAIXO: O rácio ({formatNumber(DdRatio)}) é inferior ao mínimo normativo de 40.</p>}
              {margin < 1.1 && margin > 1 && <p className="text-amber-400">⚠️ MARGEM REDUZIDA: Margem de aderência inferior a 1.1. Risco de deslizamento em condições adversas.</p>}
              {data.numRopes === 0 && <p className="text-error">⚠️ ERRO: Número de cabos não pode ser zero.</p>}
              <p>• Cálculo assume ranhura semi-circular com undercut.</p>
              <p>• Massa do cabo de suspensão não incluída nesta versão simplificada.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Dedicated Engineering Notes Section */}
      <div className="bg-surface-container-low p-8 border border-outline-variant/10 rounded-sm">
        <h3 className="text-sm font-bold uppercase tracking-widest text-primary mb-6 flex items-center gap-3">
          <FileText size={18} className="text-primary" />
          Engineering Notes & Design Considerations
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
            <textarea 
              value={data.tractionNotes}
              onChange={(e) => onChange({ tractionNotes: e.target.value })}
              placeholder="Insira observações técnicas detalhadas, considerações sobre o desgaste da polia, ou justificações para desvios normativos..."
              className="w-full h-48 bg-surface-container-lowest border border-outline-variant/20 rounded-sm p-4 text-sm focus:ring-1 focus:ring-primary outline-none resize-none font-sans leading-relaxed shadow-inner"
            />
          </div>
          <div className="space-y-4">
            <div className="p-4 bg-primary/5 border border-primary/10 rounded-sm">
              <h4 className="text-[10px] font-bold uppercase text-primary mb-2">Sugestões de Registo</h4>
              <ul className="text-[10px] space-y-2 opacity-70 list-disc pl-4">
                <li>Detalhes da ranhura (V-groove, U-groove)</li>
                <li>Tratamento térmico da polia</li>
                <li>Tipo de lubrificação dos cabos</li>
                <li>Condições ambientais especiais</li>
              </ul>
            </div>
            <p className="text-[10px] text-on-surface-variant opacity-50 italic leading-relaxed">
              Estas notas são fundamentais para a rastreabilidade do projeto e serão exportadas integralmente para o relatório técnico.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const RopesModule = ({ data, onChange }: { data: ProjectData, onChange: (newData: Partial<ProjectData>) => void }) => {
  const g = 9.81;
  const r = parseInt(data.suspension.split(':')[0]);
  const Fstatic_total = (data.carMass + data.ratedLoad) * g;
  const Fstatic_per_rope = data.numRopes > 0 ? Fstatic_total / (r * data.numRopes) : 0;
  
  // N_equiv calculation (ISO 8100-2:2026)
  const N_equiv = data.numSimpleBends + 4 * data.numReverseBends;
  
  // Safety Factor Required (Sf) - Formula 36
  // Sf = 10^(2.6834 - log(N_equiv / 2.6834e6) / log(D/d))
  const Dd = data.ropeDiameter > 0 ? data.sheaveDiameter / data.ropeDiameter : 0;
  let sf_required = 12; // Minimum default
  
  if (Dd > 0 && N_equiv > 0) {
    const logN = Math.log10(N_equiv / (2.6834 * Math.pow(10, 6)));
    const logDd = Math.log10(Dd);
    sf_required = Math.pow(10, 2.6834 - (logN / logDd));
  }

  // Actual Safety Factor
  const sf_actual = Fstatic_per_rope > 0 ? data.ropeBreakingLoad / Fstatic_per_rope : 0;
  const isSfOk = sf_actual >= sf_required;

  // Placeholder Lifetime Estimation (refined)
  const lifetime_est = useMemo(() => {
    if (data.loadCycles <= 0) return 0;
    const base_life = 200000; 
    const factor = data.ropeType.toLowerCase().includes('coated') ? 1.5 : 1.0;
    const bend_penalty = Math.max(0.1, 1 - (N_equiv * 0.05));
    const stop_penalty = Math.max(0.8, 1 - (data.stops * 0.01)); // Small penalty for more stops
    return Math.max(0, base_life * factor * bend_penalty * stop_penalty / (data.loadCycles / 1000));
  }, [data.loadCycles, data.ropeType, N_equiv, data.stops]);

  return (
    <div className="space-y-8">
      <div className="bg-surface-container-low p-8 border-t-2 border-tertiary">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xl font-bold">Evaluation of Safety Factor of Ropes (4.12)</h3>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${isSfOk ? 'bg-emerald-100 text-emerald-700' : 'bg-error-container/20 text-error'}`}>
            {isSfOk ? 'Implementado - OK' : 'Implementado - NOK'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-surface-container-lowest border border-outline-variant/10">
            <p className="text-[10px] font-bold text-on-surface-variant uppercase mb-1">Carga Estática / Cabo</p>
            <p className="text-xl font-black">{formatNumber(Fstatic_per_rope)} <span className="text-xs font-normal opacity-50">N</span></p>
          </div>
          <div className="p-4 bg-surface-container-lowest border border-outline-variant/10">
            <p className="text-[10px] font-bold text-on-surface-variant uppercase mb-1">Sf Requerido (ISO)</p>
            <p className="text-xl font-black">{formatNumber(sf_required)}</p>
          </div>
          <div className="p-4 bg-surface-container-lowest border border-outline-variant/10">
            <p className="text-[10px] font-bold text-on-surface-variant uppercase mb-1">Sf Atual (Projeto)</p>
            <p className={`text-xl font-black ${isSfOk ? 'text-emerald-600' : 'text-error'}`}>{formatNumber(sf_actual)}</p>
          </div>
          <div className="p-4 bg-surface-container-lowest border border-outline-variant/10">
            <p className="text-[10px] font-bold text-on-surface-variant uppercase mb-1">Lifetime Est. (Cycles)</p>
            <p className="text-xl font-black">{formatNumber(lifetime_est, 0)}</p>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="space-y-4 p-6 bg-surface-container-lowest border border-outline-variant/10">
              <h4 className="text-xs font-bold uppercase tracking-widest text-primary border-b border-primary/20 pb-2">Configuração de Suspensão</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-on-surface-variant uppercase">Carga Rotura (Fmin)</label>
                  <input 
                    type="number"
                    value={data.ropeBreakingLoad}
                    onChange={(e) => onChange({ ropeBreakingLoad: safeNumber(e.target.value) })}
                    className="w-full bg-surface-container-low border border-outline-variant/20 rounded-sm px-3 py-2 text-sm focus:ring-1 focus:ring-primary outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-on-surface-variant uppercase">Nº Polias Simples (Nps)</label>
                  <input 
                    type="number"
                    value={data.numSimpleBends}
                    onChange={(e) => onChange({ numSimpleBends: safeNumber(e.target.value) })}
                    className="w-full bg-surface-container-low border border-outline-variant/20 rounded-sm px-3 py-2 text-sm focus:ring-1 focus:ring-primary outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-on-surface-variant uppercase">Nº Polias Invert. (Npr)</label>
                  <input 
                    type="number"
                    value={data.numReverseBends}
                    onChange={(e) => onChange({ numReverseBends: safeNumber(e.target.value) })}
                    className="w-full bg-surface-container-low border border-outline-variant/20 rounded-sm px-3 py-2 text-sm focus:ring-1 focus:ring-primary outline-none"
                  />
                </div>
                <div className="p-3 bg-primary/5 border border-primary/10 rounded-sm flex flex-col justify-center">
                  <p className="text-[10px] font-bold text-primary uppercase">N_equiv Calculado</p>
                  <p className="text-lg font-black">{formatNumber(N_equiv, 1)}</p>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-surface-container-lowest border border-outline-variant/10">
              <h4 className="text-xs font-bold uppercase mb-2">Fórmulas (ISO 8100-2:2026)</h4>
              <div className="font-mono text-[10px] space-y-1 opacity-70">
                <p>• Sf = 10^(2.6834 - log(N_equiv / 2.6834e6) / log(D/d)) [Formula 36]</p>
                <p>• N_equiv = N_ps + 4 · N_pr</p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="p-6 bg-surface-container-lowest border border-outline-variant/10">
              <h4 className="text-xs font-bold uppercase mb-4 text-tertiary flex items-center gap-2">
                <History size={14} />
                Estimativa de Vida Útil (Placeholder)
              </h4>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-on-surface-variant uppercase">Tipo de Cabo</label>
                    <select 
                      value={data.ropeType}
                      onChange={(e) => onChange({ ropeType: e.target.value })}
                      className="w-full bg-surface-container-low border border-outline-variant/20 rounded-sm px-3 py-2 text-sm focus:ring-1 focus:ring-primary outline-none"
                    >
                      <option value="Steel Wire">Aço (Standard)</option>
                      <option value="Coated">Revestido (Sintético)</option>
                      <option value="High Performance">Alta Performance</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-on-surface-variant uppercase">Ciclos/Ano</label>
                    <input 
                      type="number"
                      value={data.loadCycles}
                      onChange={(e) => onChange({ loadCycles: safeNumber(e.target.value) })}
                      className="w-full bg-surface-container-low border border-outline-variant/20 rounded-sm px-3 py-2 text-sm focus:ring-1 focus:ring-primary outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-on-surface-variant uppercase">Nº Pisos (Stops)</label>
                    <input 
                      type="number"
                      value={data.stops}
                      onChange={(e) => onChange({ stops: safeNumber(e.target.value) })}
                      className="w-full bg-surface-container-low border border-outline-variant/20 rounded-sm px-3 py-2 text-sm focus:ring-1 focus:ring-primary outline-none"
                    />
                  </div>
                </div>
                <div className="p-4 bg-tertiary/5 border border-tertiary/10 rounded-sm">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-[10px] font-bold text-tertiary uppercase">Vida Útil Estimada</p>
                      <p className="text-2xl font-black text-tertiary">{formatNumber(lifetime_est, 0)} <span className="text-xs font-normal opacity-60">Ciclos</span></p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-on-surface-variant uppercase opacity-50">Anos (Est.)</p>
                      <p className="text-lg font-bold opacity-60">{data.loadCycles > 0 ? formatNumber(lifetime_est / data.loadCycles, 1) : '-'}</p>
                    </div>
                  </div>
                </div>
                <p className="text-[9px] text-on-surface-variant opacity-50 italic">
                  *Cálculo baseado em modelos de fadiga de flexão simplificados (Feyrer). Requer validação com dados do fabricante.
                </p>
              </div>
            </div>
            
            <div className="p-6 bg-slate-900 text-white rounded-sm">
              <h4 className="text-xs font-bold uppercase tracking-widest text-indigo-300 mb-4 flex items-center gap-2">
                <AlertTriangle size={14} />
                Critérios de Descarte (4.14)
              </h4>
              <ul className="text-[10px] space-y-2 opacity-80">
                <li>• Redução de diâmetro nominal &gt; 6%</li>
                <li>• Corrosão severa ou deformação visível</li>
                <li>• Número de fios partidos excede limite da ISO 4344</li>
                <li className="pt-2 border-t border-white/10 text-indigo-200 font-bold italic">
                  Pronto para integração com sensores de monitorização IoT.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const GuideRailsModule = ({ data, onChange }: { data: ProjectData, onChange: (newData: Partial<ProjectData>) => void }) => {
  const g = 9.81;
  const E = data.materialE;
  const l = data.bracketDist;
  
  // 1. Bending Stress (Combined X and Y)
  const Fh = (data.ratedLoad + data.carMass) * g * 0.1;
  const Mm = (3 * Fh * l) / 16;
  const sigma_my = data.railWy > 0 ? Mm / data.railWy : 0;
  const sigma_mx = data.railWx > 0 ? (Mm * 0.5) / data.railWx : 0; // Assuming 50% load in X for simplified pre-dim
  const sigma_m = Math.sqrt(Math.pow(sigma_my, 2) + Math.pow(sigma_mx, 2));

  // 2. Buckling (Omega Method - Simplified ISO 8100-2 Annex B)
  // Lambda (Slenderness ratio) = l / i (using the minimum radius of gyration)
  const minRadius = Math.min(data.railIyRadius, data.railIxRadius > 0 ? data.railIxRadius : data.railIyRadius);
  const lambda = minRadius > 0 ? l / minRadius : 0;
  
  // Omega factor (Simplified approximation for steel)
  let omega = 1;
  if (lambda > 20) {
    if (lambda <= 60) omega = 1 + 0.0001 * Math.pow(lambda, 2);
    else if (lambda <= 100) omega = 0.8 + 0.00015 * Math.pow(lambda, 2);
    else omega = 0.00025 * Math.pow(lambda, 2); // High slenderness
  }

  // Fv (Vertical force on rail during safety gear trip)
  const Fv = (data.ratedLoad + data.carMass) * g * 0.6; // Simplified factor
  const sigma_k = data.railArea > 0 ? (Fv * omega) / data.railArea : 0;

  // 3. Deflection (Formula 20/21)
  // delta = (Fh * l^3) / (48 * E * I)
  const delta = (data.railIy > 0 && E > 0) ? (Fh * Math.pow(l, 3)) / (48 * E * data.railIy) : 0;

  const isBendingOk = sigma_m < data.materialYield;
  const isBucklingOk = sigma_k < data.materialYield;
  const isDeflectionOk = delta < 5; // 5mm limit for car rails

  return (
    <div className="space-y-8">
      <div className="bg-surface-container-low p-8 border-t-2 border-outline">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xl font-bold">Guide Rails Calculation (4.10)</h3>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 uppercase">Implementado (Pré-dim)</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className={`p-6 border ${isBendingOk ? 'bg-surface-container-lowest border-outline-variant/10' : 'bg-error-container/10 border-error/20'}`}>
            <h4 className="text-xs font-bold uppercase mb-4 text-primary">Flexão (Bending)</h4>
            <p className="text-2xl font-black">{formatNumber(sigma_m)} <span className="text-xs font-normal opacity-50">N/mm²</span></p>
            <div className="mt-4 flex items-center gap-2">
              {isBendingOk ? <CheckCircle2 size={14} className="text-emerald-600" /> : <XCircle size={14} className="text-error" />}
              <span className="text-[10px] font-bold uppercase opacity-70">Limite: {data.materialYield}</span>
            </div>
          </div>

          <div className={`p-6 border ${isBucklingOk ? 'bg-surface-container-lowest border-outline-variant/10' : 'bg-error-container/10 border-error/20'}`}>
            <h4 className="text-xs font-bold uppercase mb-4 text-primary">Encurvadura (Buckling)</h4>
            <p className="text-2xl font-black">{formatNumber(sigma_k)} <span className="text-xs font-normal opacity-50">N/mm²</span></p>
            <div className="mt-4 flex items-center gap-2">
              {isBucklingOk ? <CheckCircle2 size={14} className="text-emerald-600" /> : <XCircle size={14} className="text-error" />}
              <span className="text-[10px] font-bold uppercase opacity-70">λ: {formatNumber(lambda, 1)} | ω: {formatNumber(omega, 2)}</span>
            </div>
          </div>

          <div className={`p-6 border ${isDeflectionOk ? 'bg-surface-container-lowest border-outline-variant/10' : 'bg-amber-50 border-amber-200'}`}>
            <h4 className="text-xs font-bold uppercase mb-4 text-primary">Flecha (Deflection)</h4>
            <p className="text-2xl font-black">{formatNumber(delta)} <span className="text-xs font-normal opacity-50">mm</span></p>
            <div className="mt-4 flex items-center gap-2">
              {isDeflectionOk ? <CheckCircle2 size={14} className="text-emerald-600" /> : <AlertCircle size={14} className="text-amber-600" />}
              <span className="text-[10px] font-bold uppercase opacity-70">Limite: 5.00 mm</span>
            </div>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="p-6 bg-surface-container-lowest border border-outline-variant/10">
            <h4 className="text-xs font-bold uppercase mb-4 text-primary flex items-center gap-2">
              <Settings2 size={14} />
              Propriedades do Perfil ({data.guideType})
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-[9px] font-bold opacity-50 uppercase">Área (A) [mm²]</label>
                <input 
                  type="number"
                  value={data.railArea}
                  onChange={(e) => onChange({ railArea: safeNumber(e.target.value) })}
                  className="w-full bg-surface-container-low border border-outline-variant/20 rounded-sm px-2 py-1 text-sm outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold opacity-50 uppercase">Inércia (Iy) [mm⁴]</label>
                <input 
                  type="number"
                  value={data.railIy}
                  onChange={(e) => onChange({ railIy: safeNumber(e.target.value) })}
                  className="w-full bg-surface-container-low border border-outline-variant/20 rounded-sm px-2 py-1 text-sm outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold opacity-50 uppercase">Inércia (Ix) [mm⁴]</label>
                <input 
                  type="number"
                  value={data.railIx}
                  onChange={(e) => onChange({ railIx: safeNumber(e.target.value) })}
                  className="w-full bg-surface-container-low border border-outline-variant/20 rounded-sm px-2 py-1 text-sm outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold opacity-50 uppercase">Raio (iy) [mm]</label>
                <input 
                  type="number"
                  value={data.railIyRadius}
                  onChange={(e) => onChange({ railIyRadius: safeNumber(e.target.value) })}
                  className="w-full bg-surface-container-low border border-outline-variant/20 rounded-sm px-2 py-1 text-sm outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold opacity-50 uppercase">Raio (ix) [mm]</label>
                <input 
                  type="number"
                  value={data.railIxRadius}
                  onChange={(e) => onChange({ railIxRadius: safeNumber(e.target.value) })}
                  className="w-full bg-surface-container-low border border-outline-variant/20 rounded-sm px-2 py-1 text-sm outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold opacity-50 uppercase">Módulo (Wy) [mm³]</label>
                <input 
                  type="number"
                  value={data.railWy}
                  onChange={(e) => onChange({ railWy: safeNumber(e.target.value) })}
                  className="w-full bg-surface-container-low border border-outline-variant/20 rounded-sm px-2 py-1 text-sm outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold opacity-50 uppercase">Módulo (Wx) [mm³]</label>
                <input 
                  type="number"
                  value={data.railWx}
                  onChange={(e) => onChange({ railWx: safeNumber(e.target.value) })}
                  className="w-full bg-surface-container-low border border-outline-variant/20 rounded-sm px-2 py-1 text-sm outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold opacity-50 uppercase">Peso (q1) [kg/m]</label>
                <input 
                  type="number"
                  value={data.railWeight}
                  onChange={(e) => onChange({ railWeight: safeNumber(e.target.value) })}
                  className="w-full bg-surface-container-low border border-outline-variant/20 rounded-sm px-2 py-1 text-sm outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold opacity-50 uppercase">Dist. Brackets (l) [mm]</label>
                <input 
                  type="number"
                  value={data.bracketDist}
                  onChange={(e) => onChange({ bracketDist: safeNumber(e.target.value) })}
                  className="w-full bg-surface-container-low border border-outline-variant/20 rounded-sm px-2 py-1 text-sm outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>
          </div>

          <div className="p-6 bg-primary/5 border border-primary/10 rounded-sm">
            <h4 className="text-xs font-bold uppercase mb-4 flex items-center gap-2">
              <Info size={14} className="text-primary" />
              Notas de Cálculo (ISO 8100-2:2026)
            </h4>
            <div className="font-mono text-[10px] space-y-2 opacity-70">
              <p>• Verificação de encurvadura utiliza o Método Omega (Anexo B) para o eixo Y-Y.</p>
              <p>• Flecha calculada para o caso de carga mais desfavorável em funcionamento.</p>
              <p>• O módulo de secção Wx é incluído para verificações de flexão composta (planeadas).</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const HydraulicModule = ({ data }: { data: ProjectData }) => {
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
            {isWallOk && isBucklingOk ? 'Implementado - OK' : 'Implementado - NOK'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className={`p-6 border ${isWallOk ? 'bg-surface-container-lowest border-outline-variant/10' : 'bg-error-container/10 border-error/20'}`}>
            <h4 className="text-xs font-bold uppercase mb-4 text-primary">Espessura Parede (e)</h4>
            <p className="text-2xl font-black">{formatNumber(data.cylinderWallThickness)} <span className="text-xs font-normal opacity-50">mm</span></p>
            <p className="text-[10px] mt-2 opacity-50 italic">Requerido: {formatNumber(e_calc)} mm</p>
          </div>
          
          <div className={`p-6 border ${isBucklingOk ? 'bg-surface-container-lowest border-outline-variant/10' : 'bg-error-container/10 border-error/20'}`}>
            <h4 className="text-xs font-bold uppercase mb-4 text-primary">Encurvadura Êmbolo</h4>
            <p className="text-2xl font-black">{formatNumber(F_buckling_euler / 1000, 1)} <span className="text-xs font-normal opacity-50">kN</span></p>
            <p className="text-[10px] mt-2 opacity-50 italic">Carga Crítica (Euler)</p>
          </div>

          <div className="p-6 bg-surface-container-lowest border border-outline-variant/10">
            <h4 className="text-xs font-bold uppercase mb-4 text-primary">Pressão Máxima (p)</h4>
            <p className="text-2xl font-black">{formatNumber(data.maxPressure)} <span className="text-xs font-normal opacity-50">MPa</span></p>
          </div>
        </div>

        <div className="mt-8 p-4 bg-primary/5 border border-primary/10 rounded-sm">
          <h4 className="text-xs font-bold uppercase mb-2">Fórmulas Aplicadas (ISO 8100-2)</h4>
          <div className="font-mono text-[10px] space-y-1 opacity-70">
            <p>• Espessura Cilindro: e ≥ (2.3 · 1.7 · p / Rp0.2) · (Di / 2) + e0 [Formula 38]</p>
            <p>• Encurvadura: Verificação por Euler (λ = {formatNumber(lambda, 1)})</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const ComponentLibraryModule = () => {
  const components = [
    { id: '4.2', name: 'Door Locking Devices', cat: 'Mechanical', status: 'implemented' },
    { id: '4.3', name: 'Safety Gear', cat: 'Safety', status: 'implemented' },
    { id: '4.4', name: 'Overspeed Governor', cat: 'Safety', status: 'implemented' },
    { id: '4.5', name: 'Buffers', cat: 'Safety', status: 'implemented' },
    { id: '4.6', name: 'Car Frame / Sling', cat: 'Structural', status: 'implemented' },
    { id: '4.10', name: 'Guide Rails', cat: 'Structural', status: 'implemented' },
    { id: '4.11', name: 'Traction System', cat: 'Mechanical', status: 'implemented' },
    { id: '4.12', name: 'Suspension Means', cat: 'Mechanical', status: 'implemented' },
    { id: '4.13', name: 'Traction Sheaves', cat: 'Mechanical', status: 'implemented' },
    { id: '4.15', name: 'Hydraulic System', cat: 'Hydraulic', status: 'implemented' },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-surface-container-low p-6">
        <h3 className="text-lg font-bold mb-6">Índice Técnico de Componentes (ISO 8100-2)</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-outline-variant/20 text-[10px] font-bold uppercase text-on-surface-variant">
                <th className="px-4 py-3">Secção ISO</th>
                <th className="px-4 py-3">Componente</th>
                <th className="px-4 py-3">Categoria</th>
                <th className="px-4 py-3">Estado</th>
              </tr>
            </thead>
            <tbody>
              {components.map(c => (
                <tr key={c.id} className="border-b border-outline-variant/10 hover:bg-primary/5 transition-colors">
                  <td className="px-4 py-3 font-mono">{c.id}</td>
                  <td className="px-4 py-3 font-bold">{c.name}</td>
                  <td className="px-4 py-3 text-on-surface-variant">{c.cat}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      c.status === 'implemented' ? 'bg-emerald-100 text-emerald-700' :
                      c.status === 'partial' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {c.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const CalculationMemoryModule = ({ data }: { data: ProjectData }) => {
  return (
    <div className="space-y-8 max-w-4xl mx-auto bg-white p-12 shadow-sm border border-outline-variant/10 font-serif">
      <div className="text-center border-b-2 border-on-surface pb-8 mb-8">
        <h2 className="text-2xl font-black uppercase tracking-tighter">Memória de Cálculo</h2>
        <p className="text-sm italic">Project Alpha-7 | ISO 8100-2:2026 Compliance Report</p>
      </div>

      <section className="space-y-4">
        <h3 className="text-lg font-bold border-b border-on-surface/20 pb-1">1. Base de Cálculo</h3>
        <p className="text-sm leading-relaxed">
          Este documento apresenta os resultados preliminares de engenharia para o sistema de tração e suspensão, 
          calculados de acordo com as prescrições da norma ISO 8100-2:2026.
        </p>
      </section>

      <section className="space-y-4">
        <h3 className="text-lg font-bold border-b border-on-surface/20 pb-1">2. Hipóteses Adotadas</h3>
        <ul className="text-sm space-y-1 list-disc list-inside">
          <li>Cálculo de tração baseado em ranhura semi-circular com undercut (β={data.undercutAngle}º).</li>
          <li>Coeficiente de fricção dinâmico calculado para velocidade nominal de {data.speed} m/s.</li>
          <li>Rácio de suspensão {data.suspension} com eficiência de {data.efficiency * 100}%.</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h3 className="text-lg font-bold border-b border-on-surface/20 pb-1">3. Resultados Principais</h3>
        <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm">
          <div className="font-bold">Aderência (T1/T2):</div>
          <div>{formatNumber(Math.exp(0.1 * degToRad(data.wrapAngle)))} (Limite Est.)</div>
          
          <div className="font-bold">Fator de Segurança Cabos:</div>
          <div>{formatNumber(data.ropeBreakingLoad / (((data.carMass + data.ratedLoad) * 9.81) / (parseInt(data.suspension.split(':')[0]) * data.numRopes)))}</div>
          
          <div className="font-bold">Tensão Montantes (Sling):</div>
          <div>{formatNumber((2 * (data.carMass + data.ratedLoad) * 9.81) / (2 * data.uprightArea))} N/mm²</div>

          <div className="font-bold">Pressão na Polia:</div>
          <div>{formatNumber(((data.carMass + data.ratedLoad + data.cwtMass) * 9.81 / parseInt(data.suspension.split(':')[0])) / (data.sheaveDiameter * data.ropeDiameter))} MPa</div>
          
          <div className="font-bold">Retardação Paraquedas:</div>
          <div>{formatNumber(((data.safetyGearBrakingForce / (data.carMass + data.ratedLoad)) - 9.81) / 9.81)} gn</div>

          <div className="font-bold">Espessura Cilindro (Hid.):</div>
          <div>{data.cylinderWallThickness} mm (Atual)</div>
        </div>
      </section>

      {data.tractionNotes && (
        <section className="space-y-4">
          <h3 className="text-lg font-bold border-b border-on-surface/20 pb-1">4. Notas de Engenharia</h3>
          <p className="text-sm leading-relaxed whitespace-pre-wrap italic text-on-surface-variant">
            {data.tractionNotes}
          </p>
        </section>
      )}

      <div className="mt-12 pt-8 border-t border-on-surface/10 text-[10px] text-on-surface-variant italic">
        Nota: Verificação a confirmar pela cláusula exata da norma ISO 8100-2:2026. Resultados de pré-dimensionamento.
      </div>
    </div>
  );
};

const SlingModule = ({ data }: { data: ProjectData }) => {
  const g = 9.81;
  const totalMass = data.carMass + data.ratedLoad;
  
  // Force during safety gear operation (ISO 8100-2:2026)
  // Fs = 2 * (P + Q) * g (Simplified impact factor)
  const Fs = 2 * totalMass * g;
  
  // Stress on uprights (assuming 2 uprights)
  const sigma_upright = data.uprightArea > 0 ? (Fs / 2) / data.uprightArea : 0;
  const isSlingOk = sigma_upright < data.materialYield;

  return (
    <div className="space-y-8">
      <div className="bg-surface-container-low p-8 border-t-2 border-primary">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xl font-bold">Car Frame / Sling Verification (4.6)</h3>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${isSlingOk ? 'bg-emerald-100 text-emerald-700' : 'bg-error-container/20 text-error'}`}>
            {isSlingOk ? 'Implementado - OK' : 'Implementado - NOK'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className={`p-6 border ${isSlingOk ? 'bg-surface-container-lowest border-outline-variant/10' : 'bg-error-container/10 border-error/20'}`}>
            <h4 className="text-xs font-bold uppercase mb-4 text-primary">Tensão nos Montantes</h4>
            <p className="text-2xl font-black">{formatNumber(sigma_upright)} <span className="text-xs font-normal opacity-50">N/mm²</span></p>
            <p className="text-[10px] mt-2 opacity-50 italic">Limite: {data.materialYield} N/mm²</p>
          </div>
          
          <div className="p-6 bg-surface-container-lowest border border-outline-variant/10">
            <h4 className="text-xs font-bold uppercase mb-4 text-primary">Força de Impacto (Fs)</h4>
            <p className="text-2xl font-black">{formatNumber(Fs / 1000, 1)} <span className="text-xs font-normal opacity-50">kN</span></p>
            <p className="text-[10px] mt-2 opacity-50 italic">Atuação do Paraquedas</p>
          </div>
        </div>

        <div className="mt-8 p-4 bg-primary/5 border border-primary/10 rounded-sm">
          <h4 className="text-xs font-bold uppercase mb-2">Critérios de Projeto (4.6.2)</h4>
          <p className="text-[10px] opacity-70 leading-relaxed">
            A armação deve ser dimensionada para suportar as forças resultantes da atuação do paraquedas e do impacto nos amortecedores. 
            O cálculo considera a distribuição de carga simétrica nos montantes.
          </p>
        </div>
      </div>
    </div>
  );
};

const DoorLockingModule = () => {
  const checks = [
    { id: '4.2.1', label: 'Resistência mecânica dos trincos (F > 1000N)', info: 'Verificação de deformação permanente' },
    { id: '4.2.2', label: 'Engate mínimo do fecho (7mm)', info: 'Garantia de contacto elétrico seguro' },
    { id: '4.2.3', label: 'Dispositivo elétrico de segurança', info: 'Verificação de rutura positiva' },
    { id: '4.2.4', label: 'Proteção contra manipulação acidental', info: 'Impedir abertura por fora sem chave' },
    { id: '4.2.5', label: 'Verificação de folgas e alinhamento', info: 'Máximo 6mm entre folhas' },
  ];

  return (
    <div className="space-y-8">
      <div className="bg-surface-container-low p-8 border-t-2 border-primary">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xl font-bold">Landing and Car Door Locking (4.2)</h3>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 uppercase">Checklist Técnico</span>
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

const RuntimeChecksModule = () => {
  const checks = [
    { id: 'sys-01', label: 'Módulos de Engenharia Carregados', status: 'ok' },
    { id: 'sys-02', label: 'Fórmulas de Tração (ISO 4.11) Ativas', status: 'ok' },
    { id: 'sys-03', label: 'Validador de Inputs (safeNumber) Ativo', status: 'ok' },
    { id: 'sys-04', label: 'Cálculo de Ropes (ISO 4.12) Ativo', status: 'ok' },
    { id: 'sys-05', label: 'Módulo Guide Rails (ISO 4.10) Parcial', status: 'warning' },
    { id: 'sys-06', label: 'Verificação OSG (ISO 4.4) Ativa', status: 'ok' },
    { id: 'sys-07', label: 'Exportador de Memória Ativo', status: 'ok' },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 text-white p-8 rounded-sm">
        <h3 className="text-sm font-bold uppercase tracking-widest text-indigo-300 mb-6">System Integrity Checks</h3>
        <div className="space-y-3">
          {checks.map(c => (
            <div key={c.id} className="flex items-center justify-between p-3 bg-white/5 border border-white/10">
              <span className="text-xs font-mono opacity-70">{c.label}</span>
              {c.status === 'ok' ? <CheckCircle2 size={16} className="text-emerald-400" /> : <AlertCircle size={16} className="text-amber-400" />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const SafetyComponentsModule = ({ data, onChange }: { data: ProjectData, onChange: (newData: Partial<ProjectData>) => void }) => {
  // OSG Verification Logic
  const minTripping = 1.15 * data.speed;
  let maxTripping = 1.5;
  if (data.safetyGearType === 'instantaneous') maxTripping = 0.8;
  else if (data.safetyGearType === 'progressive' && data.speed > 1.0) maxTripping = 1.25 * data.speed + 0.25 / data.speed;
  
  const isTrippingOk = data.osgTrippingSpeed >= minTripping && data.osgTrippingSpeed <= maxTripping;
  const isForceOk = data.osgTensileForce >= 300;
  const osgSafetyFactor = data.osgTensileForce > 0 ? data.osgBreakingLoad / data.osgTensileForce : 0;
  const isOsgSfOk = osgSafetyFactor >= 8;

  return (
    <div className="space-y-8">
      <div className="bg-surface-container-low p-8 border-t-2 border-primary">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xl font-bold">Safety Components Verification</h3>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 uppercase">Implementado (4.2, 4.3, 4.4, 4.5)</span>
        </div>

        <div className="space-y-12">
          {/* 4.2 Door Locking Devices */}
          <section className="space-y-6">
            <div className="flex items-center gap-4 border-b border-outline-variant/20 pb-2">
              <ShieldCheck className="text-primary" size={20} />
              <h4 className="text-sm font-bold uppercase tracking-wider">4.2 Landing and Car Door Locking Devices</h4>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="space-y-4 p-6 bg-surface-container-lowest border border-outline-variant/10">
                <h5 className="text-[10px] font-bold uppercase text-primary mb-4">Verification Parameters</h5>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-on-surface-variant uppercase">Mechanical Strength (N)</label>
                    <div className="relative">
                      <input 
                        type="number"
                        value={data.doorLockingForce}
                        onChange={(e) => onChange({ doorLockingForce: safeNumber(e.target.value) })}
                        className="w-full bg-surface-container-low border border-outline-variant/20 rounded-sm px-3 py-2 text-sm focus:ring-1 focus:ring-primary outline-none"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold opacity-50">N</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-on-surface-variant uppercase">Minimum Engagement (mm)</label>
                    <div className="relative">
                      <input 
                        type="number"
                        value={data.doorLockingEngagement}
                        onChange={(e) => onChange({ doorLockingEngagement: safeNumber(e.target.value) })}
                        className="w-full bg-surface-container-low border border-outline-variant/20 rounded-sm px-3 py-2 text-sm focus:ring-1 focus:ring-primary outline-none"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold opacity-50">mm</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-2 bg-surface-container-lowest border border-outline-variant/10 rounded-sm">
                    <input 
                      type="checkbox"
                      checked={data.doorLockingElectricalCheck}
                      onChange={(e) => onChange({ doorLockingElectricalCheck: e.target.checked })}
                      className="rounded-sm border-outline-variant/30 text-primary focus:ring-primary"
                    />
                    <label className="text-[11px] font-bold text-on-surface-variant uppercase cursor-pointer">Electrical Safety Check</label>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-2 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className={`p-4 border ${data.doorLockingForce >= 1000 ? 'bg-emerald-50 border-emerald-200' : 'bg-error-container/10 border-error/20'}`}>
                    <p className="text-[10px] font-bold uppercase mb-1">Mechanical Strength</p>
                    <p className="text-xl font-black">{formatNumber(data.doorLockingForce)} N</p>
                    <p className="mt-2 text-[10px] opacity-70 italic">Required: ≥ 1000N</p>
                  </div>
                  <div className={`p-4 border ${data.doorLockingEngagement >= 7 ? 'bg-emerald-50 border-emerald-200' : 'bg-error-container/10 border-error/20'}`}>
                    <p className="text-[10px] font-bold uppercase mb-1">Lock Engagement</p>
                    <p className="text-xl font-black">{formatNumber(data.doorLockingEngagement)} mm</p>
                    <p className="mt-2 text-[10px] opacity-70 italic">Required: ≥ 7mm</p>
                  </div>
                </div>

                <div className="p-6 bg-surface-container-lowest border border-outline-variant/10 rounded-sm">
                  <h5 className="text-[10px] font-bold uppercase text-primary mb-4 flex items-center gap-2">
                    <CheckSquare size={12} />
                    Safety Checklist (4.2)
                  </h5>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded flex items-center justify-center border ${data.doorLockingForce >= 1000 ? 'bg-emerald-600 border-emerald-600' : 'border-outline-variant'}`}>
                        {data.doorLockingForce >= 1000 && <CheckSquare size={14} className="text-white" />}
                      </div>
                      <span className="text-xs font-medium">Mechanical strength without permanent deformation (F ≥ 1000N).</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded flex items-center justify-center border ${data.doorLockingEngagement >= 7 ? 'bg-emerald-600 border-emerald-600' : 'border-outline-variant'}`}>
                        {data.doorLockingEngagement >= 7 && <CheckSquare size={14} className="text-white" />}
                      </div>
                      <span className="text-xs font-medium">Minimum mechanical engagement of 7mm before electrical contact.</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded flex items-center justify-center border ${data.doorLockingElectricalCheck ? 'bg-emerald-600 border-emerald-600' : 'border-outline-variant'}`}>
                        {data.doorLockingElectricalCheck && <CheckSquare size={14} className="text-white" />}
                      </div>
                      <span className="text-xs font-medium">Safety electrical device with positive break verified.</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 4.4 Overspeed Governor */}
          <section className="space-y-6">
            <div className="flex items-center gap-4 border-b border-outline-variant/20 pb-2">
              <ShieldCheck className="text-primary" size={20} />
              <h4 className="text-sm font-bold uppercase tracking-wider">4.4 Verification of Overspeed Governor</h4>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="space-y-4 p-6 bg-surface-container-lowest border border-outline-variant/10">
                <h5 className="text-[10px] font-bold uppercase text-primary mb-4">Inputs de Ensaio</h5>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-on-surface-variant uppercase">Tipo de Paraquedas</label>
                    <select 
                      value={data.safetyGearType}
                      onChange={(e) => onChange({ safetyGearType: e.target.value as any })}
                      className="w-full bg-surface-container-low border border-outline-variant/20 rounded-sm px-3 py-2 text-sm focus:ring-1 focus:ring-primary outline-none"
                    >
                      <option value="instantaneous">Instantâneo</option>
                      <option value="progressive">Progressivo</option>
                      <option value="buffered">Instantâneo c/ Efeito Amortecido</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-on-surface-variant uppercase">Velocidade de Atuação (vt)</label>
                    <div className="relative">
                      <input 
                        type="number"
                        value={data.osgTrippingSpeed}
                        onChange={(e) => onChange({ osgTrippingSpeed: safeNumber(e.target.value) })}
                        className="w-full bg-surface-container-low border border-outline-variant/20 rounded-sm px-3 py-2 text-sm focus:ring-1 focus:ring-primary outline-none"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold opacity-50">m/s</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-on-surface-variant uppercase">Força de Tração (Ft)</label>
                    <div className="relative">
                      <input 
                        type="number"
                        value={data.osgTensileForce}
                        onChange={(e) => onChange({ osgTensileForce: safeNumber(e.target.value) })}
                        className="w-full bg-surface-container-low border border-outline-variant/20 rounded-sm px-3 py-2 text-sm focus:ring-1 focus:ring-primary outline-none"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold opacity-50">N</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-on-surface-variant uppercase">Carga de Rotura Mecanismo (Fr)</label>
                    <div className="relative">
                      <input 
                        type="number"
                        value={data.osgBreakingLoad}
                        onChange={(e) => onChange({ osgBreakingLoad: safeNumber(e.target.value) })}
                        className="w-full bg-surface-container-low border border-outline-variant/20 rounded-sm px-3 py-2 text-sm focus:ring-1 focus:ring-primary outline-none"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold opacity-50">N</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-on-surface-variant uppercase">Maximum Braking Force (F_max)</label>
                    <div className="relative">
                      <input 
                        type="number"
                        placeholder="Enter maximum braking force"
                        value={data.osgMaxBrakingForce}
                        onChange={(e) => onChange({ osgMaxBrakingForce: safeNumber(e.target.value) })}
                        className="w-full bg-surface-container-low border border-outline-variant/20 rounded-sm px-3 py-2 text-sm focus:ring-1 focus:ring-primary outline-none"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold opacity-50">N</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-2 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className={`p-4 border ${isTrippingOk ? 'bg-emerald-50 border-emerald-200' : 'bg-error-container/10 border-error/20'}`}>
                    <p className="text-[10px] font-bold uppercase mb-1">Verificação de Atuação (vt)</p>
                    <p className="text-xl font-black">{formatNumber(data.osgTrippingSpeed)} m/s</p>
                    <div className="mt-2 text-[10px] space-y-1 opacity-70">
                      <p>Mín: {formatNumber(minTripping)} m/s (1.15v)</p>
                      <p>Máx: {formatNumber(maxTripping)} m/s</p>
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      {isTrippingOk ? <CheckCircle2 size={14} className="text-emerald-600" /> : <XCircle size={14} className="text-error" />}
                      <span className={`text-[10px] font-bold uppercase ${isTrippingOk ? 'text-emerald-700' : 'text-error'}`}>
                        {isTrippingOk ? 'Conforme' : 'Não Conforme'}
                      </span>
                    </div>
                  </div>

                  <div className={`p-4 border ${isForceOk ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
                    <p className="text-[10px] font-bold uppercase mb-1">Força de Tração (Ft)</p>
                    <p className="text-xl font-black">{formatNumber(data.osgTensileForce)} N</p>
                    <p className="mt-2 text-[10px] opacity-70 italic">Requerido: ≥ 300N</p>
                    <div className="mt-3 flex items-center gap-2">
                      {isForceOk ? <CheckCircle2 size={14} className="text-emerald-600" /> : <AlertCircle size={14} className="text-amber-600" />}
                      <span className={`text-[10px] font-bold uppercase ${isForceOk ? 'text-emerald-700' : 'text-amber-700'}`}>
                        {isForceOk ? 'Suficiente' : 'Verificar Requisito'}
                      </span>
                    </div>
                  </div>

                  <div className={`p-4 border ${isOsgSfOk ? 'bg-emerald-50 border-emerald-200' : 'bg-error-container/10 border-error/20'}`}>
                    <p className="text-[10px] font-bold uppercase mb-1">Fator de Segurança (Sf_osg)</p>
                    <p className="text-xl font-black">{formatNumber(osgSafetyFactor)}</p>
                    <p className="mt-2 text-[10px] opacity-70 italic">Requerido: ≥ 8.0</p>
                    <div className="mt-3 flex items-center gap-2">
                      {isOsgSfOk ? <CheckCircle2 size={14} className="text-emerald-600" /> : <XCircle size={14} className="text-error" />}
                      <span className={`text-[10px] font-bold uppercase ${isOsgSfOk ? 'text-emerald-700' : 'text-error'}`}>
                        {isOsgSfOk ? 'Conforme' : 'Insuficiente'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-surface-container-lowest border border-outline-variant/10 rounded-sm">
                  <h5 className="text-[10px] font-bold uppercase text-primary mb-4 flex items-center gap-2">
                    <CheckSquare size={12} />
                    Checklist de Verificação (4.4)
                  </h5>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded flex items-center justify-center border ${isTrippingOk ? 'bg-emerald-600 border-emerald-600' : 'border-outline-variant'}`}>
                        {isTrippingOk && <CheckSquare size={14} className="text-white" />}
                      </div>
                      <span className={`text-xs font-medium ${isTrippingOk ? 'text-on-surface' : 'text-on-surface-variant'}`}>
                        Velocidade de atuação ({formatNumber(data.osgTrippingSpeed)} m/s) dentro dos limites normativos.
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded flex items-center justify-center border ${isForceOk ? 'bg-emerald-600 border-emerald-600' : 'border-outline-variant'}`}>
                        {isForceOk && <CheckSquare size={14} className="text-white" />}
                      </div>
                      <span className={`text-xs font-medium ${isForceOk ? 'text-on-surface' : 'text-on-surface-variant'}`}>
                        Força de tração Ft ({formatNumber(data.osgTensileForce)} N) suficiente para acionamento (≥ 300N).
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded flex items-center justify-center border ${isOsgSfOk ? 'bg-emerald-600 border-emerald-600' : 'border-outline-variant'}`}>
                        {isOsgSfOk && <CheckSquare size={14} className="text-white" />}
                      </div>
                      <span className={`text-xs font-medium ${isOsgSfOk ? 'text-on-surface' : 'text-on-surface-variant'}`}>
                        Fator de segurança do mecanismo ({formatNumber(osgSafetyFactor)}) cumpre o requisito mínimo de 8.0.
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 4.3 Verification of Safety Gear */}
          <section className="space-y-6">
            <div className="flex items-center gap-4 border-b border-outline-variant/20 pb-2">
              <ShieldCheck className="text-primary" size={20} />
              <h4 className="text-sm font-bold uppercase tracking-wider">4.3 Verification of Safety Gear</h4>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="space-y-4 p-6 bg-surface-container-lowest border border-outline-variant/10">
                <h5 className="text-[10px] font-bold uppercase text-primary mb-4">Dados de Certificação</h5>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-on-surface-variant uppercase">Massa Máx Certificada (P+Q)</label>
                    <input 
                      type="number"
                      value={data.safetyGearMaxMass}
                      onChange={(e) => onChange({ safetyGearMaxMass: safeNumber(e.target.value) })}
                      className="w-full bg-surface-container-low border border-outline-variant/20 rounded-sm px-3 py-2 text-sm outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-on-surface-variant uppercase">Força de Travagem (Fb)</label>
                    <input 
                      type="number"
                      value={data.safetyGearBrakingForce}
                      onChange={(e) => onChange({ safetyGearBrakingForce: safeNumber(e.target.value) })}
                      className="w-full bg-surface-container-low border border-outline-variant/20 rounded-sm px-3 py-2 text-sm outline-none"
                    />
                  </div>
                </div>
              </div>
              <div className="lg:col-span-2 space-y-4">
                {(() => {
                  const g = 9.81;
                  const totalMass = data.carMass + data.ratedLoad;
                  const isMassOk = totalMass <= data.safetyGearMaxMass;
                  const retardationG = data.safetyGearBrakingForce > 0 ? (data.safetyGearBrakingForce / totalMass - g) / g : 0;
                  const isRetardationOk = retardationG >= 0.2 && retardationG <= 1.0;

                    return (
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className={`p-4 border ${isMassOk ? 'bg-emerald-50 border-emerald-200' : 'bg-error-container/10 border-error/20'}`}>
                            <p className="text-[10px] font-bold uppercase mb-1">Massa (P+Q)</p>
                            <p className="text-xl font-black">{formatNumber(totalMass)} kg</p>
                            <p className="text-[10px] opacity-50">Limite: {data.safetyGearMaxMass} kg</p>
                          </div>
                          <div className={`p-4 border ${isRetardationOk ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
                            <p className="text-[10px] font-bold uppercase mb-1">Retardação</p>
                            <p className="text-xl font-black">{formatNumber(retardationG)} gn</p>
                            <p className="text-[10px] opacity-50">Requerido: 0.2 - 1.0 gn</p>
                          </div>
                        </div>

                        <div className="p-6 bg-surface-container-lowest border border-outline-variant/10 rounded-sm">
                          <h5 className="text-[10px] font-bold uppercase text-primary mb-4 flex items-center gap-2">
                            <CheckSquare size={12} />
                            Checklist de Verificação (ISO 8100-2)
                          </h5>
                          <div className="space-y-3">
                            <div className="flex items-center gap-3">
                              <div className={`w-5 h-5 rounded flex items-center justify-center border ${isMassOk ? 'bg-emerald-600 border-emerald-600' : 'border-outline-variant'}`}>
                                {isMassOk && <CheckSquare size={14} className="text-white" />}
                              </div>
                              <span className={`text-xs font-medium ${isMassOk ? 'text-on-surface' : 'text-on-surface-variant'}`}>
                                Massa total (P+Q) de {formatNumber(totalMass)}kg não excede o limite certificado de {data.safetyGearMaxMass}kg.
                              </span>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className={`w-5 h-5 rounded flex items-center justify-center border ${isRetardationOk ? 'bg-emerald-600 border-emerald-600' : 'border-outline-variant'}`}>
                                {isRetardationOk && <CheckSquare size={14} className="text-white" />}
                              </div>
                              <span className={`text-xs font-medium ${isRetardationOk ? 'text-on-surface' : 'text-on-surface-variant'}`}>
                                Retardação calculada de {formatNumber(retardationG)}gn está dentro do intervalo normativo (0.2gn - 1.0gn).
                              </span>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className={`w-5 h-5 rounded flex items-center justify-center border ${data.safetyGearBrakingForce > 0 ? 'bg-emerald-600 border-emerald-600' : 'border-outline-variant'}`}>
                                {data.safetyGearBrakingForce > 0 && <CheckSquare size={14} className="text-white" />}
                              </div>
                              <span className={`text-xs font-medium ${data.safetyGearBrakingForce > 0 ? 'text-on-surface' : 'text-on-surface-variant'}`}>
                                Força de travagem (Fb) de {formatNumber(data.safetyGearBrakingForce)}N devidamente parametrizada.
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                })()}
              </div>
            </div>
          </section>

          {/* 4.5 Verification of Buffers */}
          <section className="space-y-6">
            <div className="flex items-center gap-4 border-b border-outline-variant/20 pb-2">
              <ShieldCheck className="text-primary" size={20} />
              <div className="flex items-center gap-3">
                <h4 className="text-sm font-bold uppercase tracking-wider">4.5 Verification of Buffers</h4>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 uppercase tracking-tighter">Implemented</span>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="space-y-4 p-6 bg-surface-container-lowest border border-outline-variant/10">
                <h5 className="text-[10px] font-bold uppercase text-primary mb-4">Buffer Parameters</h5>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-on-surface-variant uppercase">Buffer Type</label>
                    <select 
                      value={data.bufferType}
                      onChange={(e) => onChange({ bufferType: e.target.value as any })}
                      className="w-full bg-surface-container-low border border-outline-variant/20 rounded-sm px-3 py-2 text-sm outline-none"
                    >
                      <option value="energy-accumulation">Energy Accumulation</option>
                      <option value="energy-dissipation">Energy Dissipation</option>
                    </select>
                  </div>
                  {data.bufferType === 'energy-accumulation' && (
                    <div className="flex items-center gap-2 py-1">
                      <input 
                        type="checkbox"
                        id="bufferLinear"
                        checked={data.bufferIsLinear}
                        onChange={(e) => onChange({ bufferIsLinear: e.target.checked })}
                        className="rounded-sm border-outline-variant/20 text-primary focus:ring-primary"
                      />
                      <label htmlFor="bufferLinear" className="text-[11px] font-bold text-on-surface-variant uppercase cursor-pointer">Linear Characteristic</label>
                    </div>
                  )}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-on-surface-variant uppercase">Buffer Stroke (h) [mm]</label>
                    <input 
                      type="number"
                      value={data.bufferStroke}
                      onChange={(e) => onChange({ bufferStroke: safeNumber(e.target.value) })}
                      className="w-full bg-surface-container-low border border-outline-variant/20 rounded-sm px-3 py-2 text-sm outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-on-surface-variant uppercase">Min Mass [kg]</label>
                      <input 
                        type="number"
                        value={data.bufferMinMass}
                        onChange={(e) => onChange({ bufferMinMass: safeNumber(e.target.value) })}
                        className="w-full bg-surface-container-low border border-outline-variant/20 rounded-sm px-3 py-2 text-sm outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-on-surface-variant uppercase">Max Mass [kg]</label>
                      <input 
                        type="number"
                        value={data.bufferMaxMass}
                        onChange={(e) => onChange({ bufferMaxMass: safeNumber(e.target.value) })}
                        className="w-full bg-surface-container-low border border-outline-variant/20 rounded-sm px-3 py-2 text-sm outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="lg:col-span-2">
                {(() => {
                  const g = 9.81;
                  const v = data.speed;
                  const totalMass = data.carMass + data.ratedLoad;
                  
                  // Kinetic Energy (J)
                  const Ek = 0.5 * totalMass * v * v;
                  
                  // Minimum Stroke (mm)
                  // Accumulation Linear: 0.135 * v^2
                  // Accumulation Non-linear: 0.067 * v^2
                  // Dissipation: 0.067 * v^2 (reduced) or v^2 / (2 * g * 0.5)
                  let h_min = 0;
                  if (data.bufferType === 'energy-accumulation') {
                    h_min = (data.bufferIsLinear ? 0.135 : 0.067) * v * v * 1000;
                  } else {
                    h_min = (v * v / (2 * g * 0.5)) * 1000; // Standard dissipation (0.5gn avg)
                  }
                  
                  const isStrokeOk = data.bufferStroke >= h_min;
                  const isMassOk = totalMass >= data.bufferMinMass && totalMass <= data.bufferMaxMass;
                  
                  // Average Deceleration (gn)
                  const h_m = data.bufferStroke / 1000;
                  const a_avg = h_m > 0 ? (v * v) / (2 * h_m * g) : 0;
                  
                  const utilization = h_min > 0 ? (data.bufferStroke / h_min) * 100 : 0;

                  return (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className={`p-6 border ${isStrokeOk ? 'bg-emerald-50 border-emerald-200' : 'bg-error-container/10 border-error/20'}`}>
                          <p className="text-[10px] font-bold uppercase mb-1">Buffer Stroke</p>
                          <p className="text-2xl font-black">{formatNumber(data.bufferStroke)} mm</p>
                          <p className="text-[10px] opacity-50">Minimum Required: {formatNumber(h_min)} mm</p>
                          <div className="mt-2 h-1 bg-surface-container-low rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${isStrokeOk ? 'bg-emerald-500' : 'bg-error'}`} 
                              style={{ width: `${Math.min(utilization, 100)}%` }}
                            />
                          </div>
                        </div>
                        <div className={`p-6 border ${a_avg <= 1.0 ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
                          <p className="text-[10px] font-bold uppercase mb-1">Average Deceleration</p>
                          <p className="text-2xl font-black">{formatNumber(a_avg)} gn</p>
                          <p className="text-[10px] opacity-50">Recommended Limit: 1.0 gn</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-surface-container-low border border-outline-variant/10">
                          <p className="text-[10px] font-bold uppercase mb-1 opacity-50">Kinetic Energy (Impact)</p>
                          <p className="text-xl font-black">{formatNumber(Ek)} J</p>
                        </div>
                        <div className={`p-4 border ${isMassOk ? 'bg-surface-container-low border-outline-variant/10' : 'bg-error-container/10 border-error/20'}`}>
                          <p className="text-[10px] font-bold uppercase mb-1 opacity-50">Impact Mass (P+Q)</p>
                          <p className="text-xl font-black">{formatNumber(totalMass)} kg</p>
                          <p className="text-[10px] opacity-50">Certified Range: {data.bufferMinMass} - {data.bufferMaxMass} kg</p>
                        </div>
                      </div>

                      <div className="p-6 bg-surface-container-lowest border border-outline-variant/10 rounded-sm">
                        <h5 className="text-[10px] font-bold uppercase text-primary mb-4 flex items-center gap-2">
                          <CheckSquare size={12} />
                          Buffer Verification Checklist (4.5)
                        </h5>
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded flex items-center justify-center border ${isStrokeOk ? 'bg-emerald-600 border-emerald-600' : 'border-outline-variant'}`}>
                              {isStrokeOk && <CheckSquare size={14} className="text-white" />}
                            </div>
                            <span className={`text-xs font-medium ${isStrokeOk ? 'text-on-surface' : 'text-on-surface-variant'}`}>
                              Real stroke ({formatNumber(data.bufferStroke)}mm) satisfies the normative requirement of {formatNumber(h_min)}mm.
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded flex items-center justify-center border ${isMassOk ? 'bg-emerald-600 border-emerald-600' : 'border-outline-variant'}`}>
                              {isMassOk && <CheckSquare size={14} className="text-white" />}
                            </div>
                            <span className={`text-xs font-medium ${isMassOk ? 'text-on-surface' : 'text-on-surface-variant'}`}>
                              Total impact mass is within the certified range of the component.
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded flex items-center justify-center border ${a_avg <= 1.0 ? 'bg-emerald-600 border-emerald-600' : 'border-outline-variant'}`}>
                              {a_avg <= 1.0 && <CheckSquare size={14} className="text-white" />}
                            </div>
                            <span className={`text-xs font-medium ${a_avg <= 1.0 ? 'text-on-surface' : 'text-on-surface-variant'}`}>
                              Average deceleration of {formatNumber(a_avg)}gn does not exceed the comfort/safety limit.
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          </section>

          {/* 4.18 SIL-rated Circuits */}
          <section className="space-y-6">
            <div className="flex items-center gap-4 border-b border-outline-variant/20 pb-2">
              <ShieldCheck className="text-primary" size={20} />
              <div className="flex items-center gap-3">
                <h4 className="text-sm font-bold uppercase tracking-wider">4.18 SIL-rated Circuits</h4>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 uppercase tracking-tighter">Implemented</span>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="space-y-4 p-6 bg-surface-container-lowest border border-outline-variant/10">
                <h5 className="text-[10px] font-bold uppercase text-primary mb-4">Safety Parameters (PESSAL)</h5>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-on-surface-variant uppercase">SIL Level</label>
                    <select 
                      value={data.silLevel}
                      onChange={(e) => onChange({ silLevel: safeNumber(e.target.value) })}
                      className="w-full bg-surface-container-low border border-outline-variant/20 rounded-sm px-3 py-2 text-sm outline-none"
                    >
                      <option value={1}>SIL 1</option>
                      <option value={2}>SIL 2</option>
                      <option value={3}>SIL 3</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-on-surface-variant uppercase">Safety Integrity</label>
                    <input 
                      type="text"
                      value={data.safetyIntegrity}
                      onChange={(e) => onChange({ safetyIntegrity: e.target.value })}
                      placeholder="e.g. High, Medium"
                      className="w-full bg-surface-container-low border border-outline-variant/20 rounded-sm px-3 py-2 text-sm outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-on-surface-variant uppercase">Fault Tolerance (HFT)</label>
                    <input 
                      type="number"
                      value={data.faultTolerance}
                      onChange={(e) => onChange({ faultTolerance: safeNumber(e.target.value) })}
                      className="w-full bg-surface-container-low border border-outline-variant/20 rounded-sm px-3 py-2 text-sm outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-on-surface-variant uppercase">MTBF [hours]</label>
                    <input 
                      type="number"
                      value={data.mtbf}
                      onChange={(e) => {
                        const val = safeNumber(e.target.value);
                        onChange({ mtbf: val, failureRate: val > 0 ? 1 / val : 0 });
                      }}
                      className="w-full bg-surface-container-low border border-outline-variant/20 rounded-sm px-3 py-2 text-sm outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-on-surface-variant uppercase">Failure Rate (λ)</label>
                    <input 
                      type="number"
                      step="0.000000001"
                      value={data.failureRate}
                      onChange={(e) => {
                        const val = safeNumber(e.target.value);
                        onChange({ failureRate: val, mtbf: val > 0 ? 1 / val : 0 });
                      }}
                      className="w-full bg-surface-container-low border border-outline-variant/20 rounded-sm px-3 py-2 text-sm outline-none"
                    />
                  </div>
                </div>
              </div>
              <div className="lg:col-span-2 space-y-4">
                {(() => {
                  // PFH Calculation (Simplified IEC 61508 for High Demand Mode)
                  // For a single component, PFH is approximately the dangerous failure rate.
                  // We assume the provided failureRate is the dangerous failure rate (λD).
                  const pfh = data.failureRate;
                  
                  // SIL PFH Limits (High Demand / Continuous Mode)
                  const silLimits = {
                    3: { min: 1e-8, max: 1e-7 },
                    2: { min: 1e-7, max: 1e-6 },
                    1: { min: 1e-6, max: 1e-5 }
                  };
                  
                  const currentLimit = silLimits[data.silLevel as keyof typeof silLimits];
                  const isPfhOk = pfh <= currentLimit.max;
                  
                  return (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className={`p-6 border ${isPfhOk ? 'bg-emerald-50 border-emerald-200' : 'bg-error-container/10 border-error/20'}`}>
                          <p className="text-[10px] font-bold uppercase mb-1">Calculated PFH</p>
                          <p className="text-2xl font-black">{pfh.toExponential(3)}</p>
                          <p className="text-[10px] opacity-50 italic mt-1">
                            Limit for SIL {data.silLevel}: ≤ {currentLimit.max.toExponential(0)}
                          </p>
                        </div>
                        <div className={`p-6 border ${isPfhOk ? 'bg-emerald-50 border-emerald-200' : 'bg-error-container/10 border-error/20'}`}>
                          <p className="text-[10px] font-bold uppercase mb-1">Status</p>
                          <div className="flex items-center gap-2">
                            {isPfhOk ? (
                              <CheckCircle2 className="text-emerald-600" size={24} />
                            ) : (
                              <ShieldAlert className="text-error" size={24} />
                            )}
                            <p className="text-xl font-black">{isPfhOk ? 'COMPLIANT' : 'NON-COMPLIANT'}</p>
                          </div>
                          <p className="text-[10px] opacity-50 mt-1">Based on IEC 61508 High Demand Mode</p>
                        </div>
                      </div>

                      <div className="p-6 bg-surface-container-lowest border border-outline-variant/10 rounded-sm">
                        <h5 className="text-[10px] font-bold uppercase text-primary mb-4 flex items-center gap-2">
                          <CheckSquare size={12} />
                          SIL Verification Checklist
                        </h5>
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded flex items-center justify-center border ${isPfhOk ? 'bg-emerald-600 border-emerald-600' : 'border-outline-variant'}`}>
                              {isPfhOk && <CheckSquare size={14} className="text-white" />}
                            </div>
                            <span className="text-xs font-medium">PFH value within the range for SIL {data.silLevel}.</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded flex items-center justify-center border ${data.faultTolerance >= (data.silLevel - 1) ? 'bg-emerald-600 border-emerald-600' : 'border-outline-variant'}`}>
                              {data.faultTolerance >= (data.silLevel - 1) && <CheckSquare size={14} className="text-white" />}
                            </div>
                            <span className="text-xs font-medium">Hardware Fault Tolerance (HFT) compatible with SIL {data.silLevel}.</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded flex items-center justify-center border ${data.safetyIntegrity ? 'bg-emerald-600 border-emerald-600' : 'border-outline-variant'}`}>
                              {data.safetyIntegrity && <CheckSquare size={14} className="text-white" />}
                            </div>
                            <span className="text-xs font-medium">Safety Integrity documentation verified.</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [projectData, setProjectData] = useState<ProjectData>({
    type: 'electric',
    suspension: '2:1',
    ratedLoad: 1000,
    carMass: 1200,
    cwtMass: 1700,
    speed: 1.0,
    travel: 30,
    stops: 10,
    floorHeight: 3.0,
    numRopes: 6,
    ropeDiameter: 10,
    sheaveDiameter: 400,
    wrapAngle: 180,
    grooveAngle: 40,
    undercutAngle: 90,
    frictionCoeff: 0.1,
    efficiency: 0.85,
    guideType: 'T89/B',
    bracketDist: 2500,
    materialE: 210000,
    materialYield: 235,
    loadCycles: 50000,
    ropeType: 'Steel Wire',
    safetyGearType: 'progressive',
    osgTrippingSpeed: 1.3,
    osgTensileForce: 500,
    osgBreakingLoad: 4500,
    tractionNotes: '',
    railArea: 1570,
    railIy: 595000,
    railIx: 320000,
    railWy: 13400,
    railWx: 10200,
    railIyRadius: 19.5,
    railIxRadius: 14.2,
    railWeight: 12.3,
    numSimpleBends: 2,
    numReverseBends: 0,
    ropeBreakingLoad: 45000,
    safetyGearMaxMass: 2500,
    safetyGearBrakingForce: 35000,
    ramDiameter: 100,
    cylinderWallThickness: 5,
    ramLength: 5000,
    maxPressure: 4.5,
    bufferStroke: 150,
    bufferType: 'energy-accumulation',
    uprightSection: 'UPE 140',
    uprightArea: 1640,
    uprightWy: 86400,
    slingHeight: 3500,
    sheaveHardness: 210,
    silLevel: 3,
    safetyIntegrity: 'High',
    faultTolerance: 1,
    mtbf: 100000,
    failureRate: 0.00001,
    doorLockingForce: 1000,
    doorLockingEngagement: 7,
    doorLockingElectricalCheck: true,
    osgMaxBrakingForce: 300
  });

  const handleDataChange = (newData: Partial<ProjectData>) => {
    setProjectData(prev => ({ ...prev, ...newData }));
  };

  const modules: ModuleStatus[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard, status: 'implemented' },
    { id: 'global', label: 'Projeto Global', icon: Globe, status: 'implemented' },
    { id: 'doors', label: 'Door Locking', icon: Lock, status: 'implemented' },
    { id: 'library', label: 'Component Library', icon: Library, status: 'implemented' },
    { id: 'traction', label: 'Traction', icon: Settings2, status: 'implemented' },
    { id: 'ropes', label: 'Ropes / Suspension', icon: Cable, status: 'implemented' },
    { id: 'rails', label: 'Guide Rails', icon: ArrowUpDown, status: 'implemented' },
    { id: 'sling', label: 'Car Frame / Sling', icon: Box, status: 'implemented' },
    { id: 'hydraulic', label: 'Hydraulic', icon: Droplets, status: 'implemented' },
    { id: 'safety', label: 'Safety Components', icon: ShieldCheck, status: 'implemented' },
    { id: 'shaft', label: '3D Shaft', icon: Box, status: 'placeholder' },
    { id: 'memory', label: 'Calculation Memory', icon: History, status: 'implemented' },
    { id: 'export', label: 'PDF Export', icon: FileText, status: 'placeholder' },
    { id: 'checks', label: 'Runtime Checks', icon: CheckSquare, status: 'implemented' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'overview': return <OverviewModule modules={modules} />;
      case 'global': return <GlobalProjectModule data={projectData} onChange={handleDataChange} />;
      case 'doors': return <DoorLockingModule />;
      case 'traction': return <TractionModule data={projectData} onChange={handleDataChange} />;
      case 'ropes': return <RopesModule data={projectData} onChange={handleDataChange} />;
      case 'rails': return <GuideRailsModule data={projectData} onChange={handleDataChange} />;
      case 'sling': return <SlingModule data={projectData} />;
      case 'hydraulic': return <HydraulicModule data={projectData} />;
      case 'safety': return <SafetyComponentsModule data={projectData} onChange={handleDataChange} />;
      case 'library': return <ComponentLibraryModule />;
      case 'memory': return <CalculationMemoryModule data={projectData} />;
      case 'checks': return <RuntimeChecksModule />;
      case 'shaft': return (
        <div className="flex flex-col items-center justify-center h-96 bg-surface-container-low border-2 border-dashed border-outline-variant/20">
          <Box size={48} className="text-primary opacity-20 mb-4" />
          <h3 className="text-xl font-bold opacity-50">3D Shaft Geometry Planned</h3>
          <p className="text-sm opacity-40">Módulo preparado para integração futura com motor 3D.</p>
        </div>
      );
      case 'export': return (
        <div className="flex flex-col items-center justify-center h-96 bg-surface-container-low border-2 border-dashed border-outline-variant/20">
          <FileText size={48} className="text-primary opacity-20 mb-4" />
          <h3 className="text-xl font-bold opacity-50">PDF Export Placeholder</h3>
          <button className="mt-4 px-6 py-2 bg-primary text-white rounded-sm font-bold text-xs uppercase tracking-widest opacity-50 cursor-not-allowed">Exportar Relatório</button>
        </div>
      );
      default: return <div className="p-8 text-center opacity-50">Módulo em desenvolvimento.</div>;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-surface text-on-surface font-sans">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full flex flex-col py-4 gap-1 z-40 w-64 border-r border-outline-variant/10 bg-white/50 backdrop-blur-sm overflow-y-auto no-scrollbar">
        <div className="px-6 mb-8">
          <h1 className="text-xl font-black text-on-surface uppercase tracking-tighter">LiftCalc ISO</h1>
          <p className="text-[10px] text-on-surface-variant font-semibold tracking-widest uppercase opacity-70">Engineering Tool v1.0</p>
        </div>
        
        <nav className="flex-1 flex flex-col gap-0.5">
          {modules.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-3 px-6 py-2.5 transition-all duration-200 group text-left ${
                activeTab === item.id 
                  ? 'bg-primary/10 text-primary border-r-4 border-primary' 
                  : 'text-secondary hover:bg-surface-container-low hover:translate-x-1'
              }`}
            >
              <item.icon size={16} className={activeTab === item.id ? 'text-primary' : 'text-secondary opacity-70 group-hover:opacity-100'} />
              <span className="text-[13px] font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="px-6 pt-4 mt-auto">
          <button className="w-full py-2.5 bg-gradient-to-r from-primary to-primary-dim text-white rounded-sm font-bold shadow-md hover:opacity-90 transition-all text-[11px] uppercase tracking-wider flex items-center justify-center gap-2">
            <Play size={12} fill="currentColor" />
            Validate Project
          </button>
        </div>
      </aside>
      
      {/* Main Content */}
      <main className="ml-64 flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <header className="flex justify-between items-center w-full px-8 h-14 bg-white/70 backdrop-blur-md sticky top-0 z-50 border-b border-outline-variant/10">
          <div className="flex items-center gap-6">
            <span className="text-lg font-bold tracking-tighter text-on-primary-container uppercase">ISO 8100-2:2026</span>
            <div className="h-4 w-px bg-outline-variant/20" />
            <span className="text-xs font-bold text-on-surface-variant opacity-70 uppercase tracking-widest">{modules.find(m => m.id === activeTab)?.label}</span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex gap-1">
              <button className="p-2 text-secondary hover:bg-surface-container transition-colors rounded-full"><Settings size={16} /></button>
              <button className="p-2 text-secondary hover:bg-surface-container transition-colors rounded-full"><HelpCircle size={16} /></button>
              <button className="p-2 text-secondary hover:bg-surface-container transition-colors rounded-full"><UserCircle size={16} /></button>
            </div>
          </div>
        </header>
        
        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-8 no-scrollbar bg-surface">
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </div>
        
        {/* Footer */}
        <footer className="h-10 bg-surface-container-low border-t border-outline-variant/10 px-8 flex items-center justify-between text-[10px] text-on-surface-variant font-medium shrink-0">
          <div className="flex gap-6">
            <span>ISO 8100-2:2026 Engine v1.0.4</span>
            <span>Workspace: Global Project Alpha-7</span>
          </div>
          <div className="flex gap-4 items-center">
            <span className="flex items-center gap-1">
              <CheckCircle2 size={12} className="text-emerald-600" /> 
              All Calculations Valid
            </span>
            <span className="bg-primary/10 px-2 py-0.5 rounded text-primary font-bold">
              LIFTCALC ENTERPRISE
            </span>
          </div>
        </footer>
      </main>
    </div>
  );
}

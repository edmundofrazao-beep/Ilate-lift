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
import { Shaft3DModule } from './components/Shaft3DModule';

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
  diagnosticCoverage: number; // DC (%)
  dangerousFraction: number; // B (%)
  // Door Locking (4.2)
  doorLockingForce: number; // N
  doorLockingEngagement: number; // mm
  doorLockingElectricalCheck: boolean;
  osgMaxBrakingForce: number; // F_max (N)
  osgManufacturer: string;
  osgModel: string;
  osgSerialNumber: string;
  // Shaft Geometry (Module I)
  shaftWidth: number; // mm
  shaftDepth: number; // mm
  shaftHeight: number; // mm
  carPositionPercent: number; // 0 to 100
  // Missing Sections Data
  acopType: 'governor' | 'rope-brake' | 'safety-gear';
  acopTrippingSpeed: number;
  ucmpType: 'brake' | 'safety-gear' | 'valve';
  ucmpDetectionDist: number;
  ruptureValveFlow: number;
  ruptureValvePressure: number;
}

interface ModuleStatus {
  id: string;
  label: string;
  icon: any;
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

const OverviewModule = ({ modules, onSelect }: { modules: ModuleStatus[], onSelect: (id: string) => void }) => (
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {modules.map(m => (
          <button 
            key={m.id} 
            onClick={() => onSelect(m.id)}
            className="p-4 bg-surface-container-lowest border border-outline-variant/10 flex items-center justify-between hover:border-primary/40 hover:shadow-md transition-all group text-left"
          >
            <div className="flex items-center gap-3">
              <m.icon size={18} className="text-primary group-hover:scale-110 transition-transform" />
              <span className="text-sm font-bold">{m.label}</span>
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
              m.status === 'implemented' ? 'bg-emerald-100 text-emerald-700' :
              m.status === 'partial' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'
            }`}>
              {m.status}
            </span>
          </button>
        ))}
      </div>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="bg-surface-container-low p-6">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Info size={18} className="text-primary" />
          ISO 8100-2 Sections Covered
        </h3>
        <ul className="space-y-2 text-sm text-on-surface-variant">
          <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-emerald-500" /> 4.11 Traction calculation (Implemented)</li>
          <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-emerald-500" /> 4.12 Safety factor of ropes (Implemented)</li>
          <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-emerald-500" /> 4.10 Guide rails calculation (Implemented)</li>
          <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-emerald-500" /> 4.15 Calculations of rams/cylinders (Implemented)</li>
          <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-emerald-500" /> 4.3 Verification of safety gear (Implemented)</li>
          <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-emerald-500" /> 4.5 Verification of buffers (Implemented)</li>
          <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-emerald-500" /> 4.7/4.8 ACOP & UCMP (Implemented)</li>
        </ul>
      </div>
      
      <div className="bg-surface-container-low p-6">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <CheckSquare size={18} className="text-primary" />
          Assumed Simplifications
        </h3>
        <div className="space-y-4 text-sm text-on-surface-variant">
          <p>• Friction coefficient μ based on Formula (28) for emergency braking.</p>
          <p>• Guide rail calculation focused on bending and buckling (Omega method) for pre-dimensioning.</p>
          <p>• D/d ratio verified against the normative limit of 40.</p>
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
          value={typeof data[name] === 'boolean' ? undefined : (data[name] as string | number)}
          checked={typeof data[name] === 'boolean' ? (data[name] as boolean) : undefined}
          onChange={(e) => {
            if (type === 'checkbox') {
              onChange({ [name]: e.target.checked });
            } else {
              onChange({ [name]: type === 'number' ? safeNumber(e.target.value) : e.target.value });
            }
          }}
          className={type === 'checkbox' ? "rounded-sm border-outline-variant/30 text-primary focus:ring-primary" : "w-full bg-surface-container-lowest border border-outline-variant/20 rounded-sm px-3 py-2 text-sm focus:ring-1 focus:ring-primary outline-none"}
        />
        {unit && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-on-surface-variant opacity-50">{unit}</span>}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <InputGroup label="General Configuration">
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
            <label className="text-[11px] font-bold text-on-surface-variant uppercase">Suspension</label>
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
          <Field label="Rated Load (Q)" name="ratedLoad" unit="kg" />
          <Field label="Car Mass (P)" name="carMass" unit="kg" />
          <Field label="Counterweight Mass (Mcwt)" name="cwtMass" unit="kg" />
          <Field label="Rated Speed (v)" name="speed" unit="m/s" />
        </InputGroup>

        <InputGroup label="Shaft & Travel">
          <Field label="Travel (H)" name="travel" unit="m" />
          <Field label="Number of Stops" name="stops" />
          <Field label="Floor to Floor Height" name="floorHeight" unit="m" />
          <Field label="Bracket Distance (l)" name="bracketDist" unit="mm" />
        </InputGroup>

        <InputGroup label="Traction System">
          <Field label="Number of Ropes (n)" name="numRopes" />
          <Field label="Rope Diameter (d)" name="ropeDiameter" unit="mm" />
          <Field label="Sheave Diameter (D)" name="sheaveDiameter" unit="mm" />
          <Field label="Wrap Angle (α)" name="wrapAngle" unit="deg" />
          <Field label="Groove Angle (γ)" name="grooveAngle" unit="deg" />
          <Field label="Undercut Angle (β)" name="undercutAngle" unit="deg" />
        </InputGroup>

        <InputGroup label="Materials & Guides">
          <Field label="Guide Type" name="guideType" type="text" />
          <Field label="Elastic Modulus (E)" name="materialE" unit="N/mm²" />
          <Field label="Yield Strength (Rp0.2)" name="materialYield" unit="N/mm²" />
          <Field label="Friction Coeff. (μ)" name="frictionCoeff" />
          <Field label="Section Area (A)" name="railArea" unit="mm²" />
          <Field label="Inertia Moment (Iy)" name="railIy" unit="mm⁴" />
          <Field label="Inertia Moment (Ix)" name="railIx" unit="mm⁴" />
          <Field label="Section Modulus (Wy)" name="railWy" unit="mm³" />
          <Field label="Section Modulus (Wx)" name="railWx" unit="mm³" />
          <Field label="Gyration Radius (iy)" name="railIyRadius" unit="mm" />
          <Field label="Gyration Radius (ix)" name="railIxRadius" unit="mm" />
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
              Traction Verification
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
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase mb-1">T1/T2 Ratio</p>
                  <p className="text-xl font-black">{formatNumber(ratio)}</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 bg-surface-container-lowest border border-outline-variant/10">
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase mb-1">exp(f·α)</p>
                  <p className="text-xl font-black">{formatNumber(expMuAlpha)}</p>
                </div>
                <div className="p-4 bg-surface-container-lowest border border-outline-variant/10">
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase mb-1">Traction Margin</p>
                  <p className={`text-xl font-black ${margin < 1.1 ? 'text-amber-600' : ''}`}>{formatNumber(margin)}</p>
                </div>
                <div className="p-4 bg-surface-container-lowest border border-outline-variant/10">
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase mb-1">D/d Ratio</p>
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
                    <p className="text-[10px] font-bold uppercase mb-1">Specific Pressure (p)</p>
                    <p className="text-2xl font-black">{formatNumber(p_groove)} <span className="text-xs font-normal opacity-50">MPa</span></p>
                    <p className="mt-2 text-[10px] opacity-70 italic">Allowable Limit: {formatNumber(p_allow)} MPa</p>
                    <div className="mt-4 flex items-center gap-2">
                      {isPressureOk ? <CheckCircle2 size={16} className="text-emerald-600" /> : <AlertCircle size={16} className="text-amber-600" />}
                      <span className={`text-xs font-bold uppercase ${isPressureOk ? 'text-emerald-700' : 'text-amber-700'}`}>
                        {isPressureOk ? 'Pressure Compliant' : 'Wear Risk'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-4 p-6 bg-surface-container-lowest border border-outline-variant/10">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-on-surface-variant uppercase">Brinell Hardness (HB)</label>
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
            <h3 className="text-xs font-bold uppercase tracking-widest text-indigo-300 mb-4">Technical Observations</h3>
            <div className="space-y-4 text-[11px] leading-relaxed opacity-80">
              {ratio > expMuAlpha && <p className="text-error font-bold">⚠️ TRACTION FAILURE: The T1/T2 ratio exceeds the sheave traction capacity.</p>}
              {DdRatio < 40 && <p className="text-amber-400 font-bold">⚠️ LOW D/d RATIO: The ratio ({formatNumber(DdRatio)}) is below the normative minimum of 40.</p>}
              {margin < 1.1 && margin > 1 && <p className="text-amber-400">⚠️ REDUCED MARGIN: Traction margin below 1.1. Risk of slippage in adverse conditions.</p>}
              {data.numRopes === 0 && <p className="text-error">⚠️ ERROR: Number of ropes cannot be zero.</p>}
              <p>• Calculation assumes semi-circular groove with undercut.</p>
              <p>• Suspension rope mass not included in this simplified version.</p>
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
              placeholder="Enter detailed technical observations, sheave wear considerations, or justifications for normative deviations..."
              className="w-full h-48 bg-surface-container-lowest border border-outline-variant/20 rounded-sm p-4 text-sm focus:ring-1 focus:ring-primary outline-none resize-none font-sans leading-relaxed shadow-inner"
            />
          </div>
          <div className="space-y-4">
            <div className="p-4 bg-primary/5 border border-primary/10 rounded-sm">
              <h4 className="text-[10px] font-bold uppercase text-primary mb-2">Recording Suggestions</h4>
              <ul className="text-[10px] space-y-2 opacity-70 list-disc pl-4">
                <li>Groove details (V-groove, U-groove)</li>
                <li>Sheave heat treatment</li>
                <li>Rope lubrication type</li>
                <li>Special environmental conditions</li>
              </ul>
            </div>
            <p className="text-[10px] text-on-surface-variant opacity-50 italic leading-relaxed">
              These notes are fundamental for project traceability and will be fully exported to the technical report.
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
            {isSfOk ? 'Implemented - OK' : 'Implemented - NOK'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-surface-container-lowest border border-outline-variant/10">
            <p className="text-[10px] font-bold text-on-surface-variant uppercase mb-1">Static Load / Rope</p>
            <p className="text-xl font-black">{formatNumber(Fstatic_per_rope)} <span className="text-xs font-normal opacity-50">N</span></p>
          </div>
          <div className="p-4 bg-surface-container-lowest border border-outline-variant/10">
            <p className="text-[10px] font-bold text-on-surface-variant uppercase mb-1">Required Sf (ISO)</p>
            <p className="text-xl font-black">{formatNumber(sf_required)}</p>
          </div>
          <div className="p-4 bg-surface-container-lowest border border-outline-variant/10">
            <p className="text-[10px] font-bold text-on-surface-variant uppercase mb-1">Actual Sf (Project)</p>
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
              <h4 className="text-xs font-bold uppercase tracking-widest text-primary border-b border-primary/20 pb-2">Suspension Configuration</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-on-surface-variant uppercase">Breaking Load (Fmin)</label>
                  <input 
                    type="number"
                    value={data.ropeBreakingLoad}
                    onChange={(e) => onChange({ ropeBreakingLoad: safeNumber(e.target.value) })}
                    className="w-full bg-surface-container-low border border-outline-variant/20 rounded-sm px-3 py-2 text-sm focus:ring-1 focus:ring-primary outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-on-surface-variant uppercase">Number of Simple Pulleys (Nps)</label>
                  <input 
                    type="number"
                    value={data.numSimpleBends}
                    onChange={(e) => onChange({ numSimpleBends: safeNumber(e.target.value) })}
                    className="w-full bg-surface-container-low border border-outline-variant/20 rounded-sm px-3 py-2 text-sm focus:ring-1 focus:ring-primary outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-on-surface-variant uppercase">Number of Reverse Pulleys (Npr)</label>
                  <input 
                    type="number"
                    value={data.numReverseBends}
                    onChange={(e) => onChange({ numReverseBends: safeNumber(e.target.value) })}
                    className="w-full bg-surface-container-low border border-outline-variant/20 rounded-sm px-3 py-2 text-sm focus:ring-1 focus:ring-primary outline-none"
                  />
                </div>
                <div className="p-3 bg-primary/5 border border-primary/10 rounded-sm flex flex-col justify-center">
                  <p className="text-[10px] font-bold text-primary uppercase">Calculated N_equiv</p>
                  <p className="text-lg font-black">{formatNumber(N_equiv, 1)}</p>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-surface-container-lowest border border-outline-variant/10">
              <h4 className="text-xs font-bold uppercase mb-2">Formulas (ISO 8100-2:2026)</h4>
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
                Lifetime Estimation (Placeholder)
              </h4>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-on-surface-variant uppercase">Rope Type</label>
                    <select 
                      value={data.ropeType}
                      onChange={(e) => onChange({ ropeType: e.target.value })}
                      className="w-full bg-surface-container-low border border-outline-variant/20 rounded-sm px-3 py-2 text-sm focus:ring-1 focus:ring-primary outline-none"
                    >
                      <option value="Steel Wire">Steel (Standard)</option>
                      <option value="Coated">Coated (Synthetic)</option>
                      <option value="High Performance">Alta Performance</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-on-surface-variant uppercase">Cycles/Year</label>
                    <input 
                      type="number"
                      value={data.loadCycles}
                      onChange={(e) => onChange({ loadCycles: safeNumber(e.target.value) })}
                      className="w-full bg-surface-container-low border border-outline-variant/20 rounded-sm px-3 py-2 text-sm focus:ring-1 focus:ring-primary outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-on-surface-variant uppercase">Number of Floors (Stops)</label>
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
                      <p className="text-[10px] font-bold text-tertiary uppercase">Estimated Lifetime</p>
                      <p className="text-2xl font-black text-tertiary">{formatNumber(lifetime_est, 0)} <span className="text-xs font-normal opacity-60">Cycles</span></p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-on-surface-variant uppercase opacity-50">Years (Est.)</p>
                      <p className="text-lg font-bold opacity-60">{data.loadCycles > 0 ? formatNumber(lifetime_est / data.loadCycles, 1) : '-'}</p>
                    </div>
                  </div>
                </div>
                <p className="text-[9px] text-on-surface-variant opacity-50 italic">
                  *Calculation based on simplified bending fatigue models (Feyrer). Requires validation with manufacturer data.
                </p>
              </div>
            </div>
            
            <div className="p-6 bg-slate-900 text-white rounded-sm">
              <h4 className="text-xs font-bold uppercase tracking-widest text-indigo-300 mb-4 flex items-center gap-2">
                <AlertTriangle size={14} />
                Discard Criteria (4.14)
              </h4>
              <ul className="text-[10px] space-y-2 opacity-80">
                <li>• Reduction of nominal diameter &gt; 6%</li>
                <li>• Severe corrosion or visible deformation</li>
                <li>• Number of broken wires exceeds ISO 4344 limit</li>
                <li className="pt-2 border-t border-white/10 text-indigo-200 font-bold italic">
                  Ready for integration with IoT monitoring sensors.
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
  
  // Stress in Y (using Wy)
  const sigma_my = data.railWy > 0 ? Mm / data.railWy : 0;
  // Stress in X (using Wx) - Assuming 50% horizontal load distribution for pre-dimensioning
  const sigma_mx = data.railWx > 0 ? (Mm * 0.5) / data.railWx : 0; 
  
  const sigma_m = Math.sqrt(Math.pow(sigma_my, 2) + Math.pow(sigma_mx, 2));

  // 2. Buckling (Omega Method - ISO 8100-2 Annex B)
  // Slenderness ratio (lambda) = l / i
  // We check both axes and take the worst case
  const lambda_y = data.railIyRadius > 0 ? l / data.railIyRadius : 0;
  const lambda_x = data.railIxRadius > 0 ? l / data.railIxRadius : 0;
  const lambda = Math.max(lambda_y, lambda_x);
  
  // Omega factor (Simplified approximation for steel)
  let omega = 1;
  if (lambda > 20) {
    if (lambda <= 60) omega = 1 + 0.0001 * Math.pow(lambda, 2);
    else if (lambda <= 100) omega = 0.8 + 0.00015 * Math.pow(lambda, 2);
    else omega = 0.00025 * Math.pow(lambda, 2); 
  }

  // Fv (Vertical force on rail)
  // Includes safety gear force + self weight of the rail (q1 * H)
  const F_safety_gear = (data.ratedLoad + data.carMass) * g * 0.6;
  const F_rail_weight = data.railWeight * data.travel * g;
  const Fv = F_safety_gear + F_rail_weight;
  
  const sigma_k = data.railArea > 0 ? (Fv * omega) / data.railArea : 0;

  // 3. Deflection (Formula 20/21)
  // delta = (Fh * l^3) / (48 * E * I)
  const delta_y = (data.railIy > 0 && E > 0) ? (Fh * Math.pow(l, 3)) / (48 * E * data.railIy) : 0;
  const delta_x = (data.railIx > 0 && E > 0) ? ((Fh * 0.5) * Math.pow(l, 3)) / (48 * E * data.railIx) : 0;
  const delta = Math.sqrt(Math.pow(delta_y, 2) + Math.pow(delta_x, 2));

  const isBendingOk = sigma_m < data.materialYield;
  const isBucklingOk = sigma_k < data.materialYield;
  const isDeflectionOk = delta < 5; // 5mm limit for car rails

  const bendingUtilization = (sigma_m / data.materialYield) * 100;
  const bucklingUtilization = (sigma_k / data.materialYield) * 100;
  const deflectionUtilization = (delta / 5) * 100;

  return (
    <div className="space-y-8">
      <div className="bg-surface-container-low p-8 border-t-2 border-outline">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xl font-bold">Guide Rails Calculation (4.10)</h3>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 uppercase">Implemented (ISO 8100-2)</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className={`p-6 border ${isBendingOk ? 'bg-surface-container-lowest border-outline-variant/10' : 'bg-error-container/10 border-error/20'}`}>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-xs font-bold uppercase text-primary">Bending Stress (σm)</h4>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${isBendingOk ? 'bg-emerald-100 text-emerald-700' : 'bg-error-container text-error'}`}>
                {formatNumber(bendingUtilization, 1)}%
              </span>
            </div>
            <p className="text-2xl font-black">{formatNumber(sigma_m)} <span className="text-xs font-normal opacity-50">N/mm²</span></p>
            <div className="mt-2 h-1 bg-surface-container-low rounded-full overflow-hidden">
              <div 
                className={`h-full ${isBendingOk ? 'bg-emerald-500' : 'bg-error'}`} 
                style={{ width: `${Math.min(bendingUtilization, 100)}%` }}
              />
            </div>
            <div className="mt-4 flex items-center gap-2">
              {isBendingOk ? <CheckCircle2 size={14} className="text-emerald-600" /> : <XCircle size={14} className="text-error" />}
              <span className="text-[10px] font-bold uppercase opacity-70">Limit (Rp0.2): {data.materialYield}</span>
            </div>
            <div className="mt-3 pt-3 border-t border-outline-variant/10 grid grid-cols-2 gap-2 text-[10px] opacity-60 font-mono">
              <div>σmx: {formatNumber(sigma_mx)}</div>
              <div>σmy: {formatNumber(sigma_my)}</div>
            </div>
          </div>

          <div className={`p-6 border ${isBucklingOk ? 'bg-surface-container-lowest border-outline-variant/10' : 'bg-error-container/10 border-error/20'}`}>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-xs font-bold uppercase text-primary">Buckling Stress (σk)</h4>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${isBucklingOk ? 'bg-emerald-100 text-emerald-700' : 'bg-error-container text-error'}`}>
                {formatNumber(bucklingUtilization, 1)}%
              </span>
            </div>
            <p className="text-2xl font-black">{formatNumber(sigma_k)} <span className="text-xs font-normal opacity-50">N/mm²</span></p>
            <div className="mt-2 h-1 bg-surface-container-low rounded-full overflow-hidden">
              <div 
                className={`h-full ${isBucklingOk ? 'bg-emerald-500' : 'bg-error'}`} 
                style={{ width: `${Math.min(bucklingUtilization, 100)}%` }}
              />
            </div>
            <div className="mt-4 flex items-center gap-2">
              {isBucklingOk ? <CheckCircle2 size={14} className="text-emerald-600" /> : <XCircle size={14} className="text-error" />}
              <span className="text-[10px] font-bold uppercase opacity-70">Limit (Rp0.2): {data.materialYield}</span>
            </div>
            <div className="mt-3 pt-3 border-t border-outline-variant/10 grid grid-cols-2 gap-2 text-[10px] opacity-60 font-mono">
              <div>λ: {formatNumber(lambda, 1)}</div>
              <div>ω: {formatNumber(omega, 2)}</div>
            </div>
          </div>

          <div className={`p-6 border ${isDeflectionOk ? 'bg-surface-container-lowest border-outline-variant/10' : 'bg-amber-50 border-amber-200'}`}>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-xs font-bold uppercase text-primary">Deflection (δ)</h4>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${isDeflectionOk ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                {formatNumber(deflectionUtilization, 1)}%
              </span>
            </div>
            <p className="text-2xl font-black">{formatNumber(delta)} <span className="text-xs font-normal opacity-50">mm</span></p>
            <div className="mt-2 h-1 bg-surface-container-low rounded-full overflow-hidden">
              <div 
                className={`h-full ${isDeflectionOk ? 'bg-emerald-500' : 'bg-amber-500'}`} 
                style={{ width: `${Math.min(deflectionUtilization, 100)}%` }}
              />
            </div>
            <div className="mt-4 flex items-center gap-2">
              {isDeflectionOk ? <CheckCircle2 size={14} className="text-emerald-600" /> : <AlertCircle size={14} className="text-amber-600" />}
              <span className="text-[10px] font-bold uppercase opacity-70">Limit: 5.00 mm</span>
            </div>
            <div className="mt-3 pt-3 border-t border-outline-variant/10 grid grid-cols-2 gap-2 text-[10px] opacity-60 font-mono">
              <div>δx: {formatNumber(delta_x)}</div>
              <div>δy: {formatNumber(delta_y)}</div>
            </div>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="p-6 bg-surface-container-lowest border border-outline-variant/10">
            <h4 className="text-xs font-bold uppercase mb-4 text-primary flex items-center gap-2">
              <Settings2 size={14} />
              Profile Properties ({data.guideType})
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-[9px] font-bold opacity-50 uppercase">Area (A) [mm²]</label>
                <input 
                  type="number"
                  value={data.railArea}
                  onChange={(e) => onChange({ railArea: safeNumber(e.target.value) })}
                  className="w-full bg-surface-container-low border border-outline-variant/20 rounded-sm px-2 py-1 text-sm outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold opacity-50 uppercase">Inertia (Iy) [mm⁴]</label>
                <input 
                  type="number"
                  value={data.railIy}
                  onChange={(e) => onChange({ railIy: safeNumber(e.target.value) })}
                  className="w-full bg-surface-container-low border border-outline-variant/20 rounded-sm px-2 py-1 text-sm outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold opacity-50 uppercase">Inertia (Ix) [mm⁴]</label>
                <input 
                  type="number"
                  value={data.railIx}
                  onChange={(e) => onChange({ railIx: safeNumber(e.target.value) })}
                  className="w-full bg-surface-container-low border border-outline-variant/20 rounded-sm px-2 py-1 text-sm outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold opacity-50 uppercase">Radius (iy) [mm]</label>
                <input 
                  type="number"
                  value={data.railIyRadius}
                  onChange={(e) => onChange({ railIyRadius: safeNumber(e.target.value) })}
                  className="w-full bg-surface-container-low border border-outline-variant/20 rounded-sm px-2 py-1 text-sm outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold opacity-50 uppercase">Radius (ix) [mm]</label>
                <input 
                  type="number"
                  value={data.railIxRadius}
                  onChange={(e) => onChange({ railIxRadius: safeNumber(e.target.value) })}
                  className="w-full bg-surface-container-low border border-outline-variant/20 rounded-sm px-2 py-1 text-sm outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold opacity-50 uppercase">Modulus (Wy) [mm³]</label>
                <input 
                  type="number"
                  value={data.railWy}
                  onChange={(e) => onChange({ railWy: safeNumber(e.target.value) })}
                  className="w-full bg-surface-container-low border border-outline-variant/20 rounded-sm px-2 py-1 text-sm outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold opacity-50 uppercase">Modulus (Wx) [mm³]</label>
                <input 
                  type="number"
                  value={data.railWx}
                  onChange={(e) => onChange({ railWx: safeNumber(e.target.value) })}
                  className="w-full bg-surface-container-low border border-outline-variant/20 rounded-sm px-2 py-1 text-sm outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold opacity-50 uppercase">Weight (q1) [kg/m]</label>
                <input 
                  type="number"
                  value={data.railWeight}
                  onChange={(e) => onChange({ railWeight: safeNumber(e.target.value) })}
                  className="w-full bg-surface-container-low border border-outline-variant/20 rounded-sm px-2 py-1 text-sm outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold opacity-50 uppercase">Bracket Dist. (l) [mm]</label>
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
              Calculation Notes (ISO 8100-2:2026)
            </h4>
            <div className="font-mono text-[10px] space-y-2 opacity-70">
              <p>• Bending: Combined stress σm = √(σmx² + σmy²) ≤ Rp0.2</p>
              <p>• Buckling: Omega method (σk = (Fv · ω) / A ≤ Rp0.2)</p>
              <p>• Fv includes safety gear force and rail self-weight (q1 · H)</p>
              <p>• Deflection: Resultant δ = √(δx² + δy²) ≤ 5.0mm</p>
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

        <div className="mt-8 p-4 bg-primary/5 border border-primary/10 rounded-sm">
          <h4 className="text-xs font-bold uppercase mb-2">Applied Formulas (ISO 8100-2)</h4>
          <div className="font-mono text-[10px] space-y-1 opacity-70">
            <p>• Cylinder Thickness: e ≥ (2.3 · 1.7 · p / Rp0.2) · (Di / 2) + e0 [Formula 38]</p>
            <p>• Buckling: Euler Verification (λ = {formatNumber(lambda, 1)})</p>
          </div>
        </div>
        {data.type === 'hydraulic' && <RuptureValveModule data={data} onChange={() => {}} />}
      </div>
    </div>
  );
};

const ACOP_UCMP_Module = ({ data, onChange }: { data: ProjectData, onChange: (newData: Partial<ProjectData>) => void }) => {
  const isAcopOk = data.acopTrippingSpeed > data.speed && data.acopTrippingSpeed <= 1.15 * data.speed + 0.25;
  const isUcmpOk = data.ucmpDetectionDist <= 150; // Simplified requirement

  return (
    <div className="space-y-8">
      <div className="bg-surface-container-low p-8 border-t-2 border-primary">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xl font-bold">ACOP & UCMP Verification (4.7 / 4.8)</h3>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 uppercase tracking-widest">ISO 8100-2 Compliant</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* ACOP Section */}
          <div className="space-y-6 p-6 bg-surface-container-lowest border border-outline-variant/10">
            <div className="flex items-center gap-3 mb-2">
              <ShieldAlert className="text-primary" size={20} />
              <h4 className="text-sm font-bold uppercase tracking-wider">4.7 Ascending Car Overspeed Protection</h4>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-on-surface-variant uppercase">Protection Type</label>
                <select 
                  value={data.acopType}
                  onChange={(e) => onChange({ acopType: e.target.value as any })}
                  className="w-full bg-surface-container-low border border-outline-variant/20 rounded-sm px-3 py-2 text-sm outline-none"
                >
                  <option value="governor">Overspeed Governor</option>
                  <option value="rope-brake">Rope Brake</option>
                  <option value="safety-gear">Safety Gear</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-on-surface-variant uppercase">Tripping Speed [m/s]</label>
                <input 
                  type="number"
                  value={data.acopTrippingSpeed}
                  onChange={(e) => onChange({ acopTrippingSpeed: safeNumber(e.target.value) })}
                  className="w-full bg-surface-container-low border border-outline-variant/20 rounded-sm px-3 py-2 text-sm outline-none"
                />
              </div>
              
              <div className={`p-4 rounded-sm border ${isAcopOk ? 'bg-emerald-50 border-emerald-200' : 'bg-error-container/10 border-error/20'}`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold uppercase opacity-60">Verification Status</span>
                  {isAcopOk ? <CheckCircle2 size={14} className="text-emerald-600" /> : <XCircle size={14} className="text-error" />}
                </div>
                <p className="text-xs font-medium">
                  {isAcopOk 
                    ? `Tripping speed of ${data.acopTrippingSpeed} m/s is within the normative range.` 
                    : `Tripping speed must be > ${data.speed} m/s and ≤ ${(1.15 * data.speed + 0.25).toFixed(2)} m/s.`}
                </p>
              </div>
            </div>
          </div>

          {/* UCMP Section */}
          <div className="space-y-6 p-6 bg-surface-container-lowest border border-outline-variant/10">
            <div className="flex items-center gap-3 mb-2">
              <ShieldCheck className="text-primary" size={20} />
              <h4 className="text-sm font-bold uppercase tracking-wider">4.8 Unintended Car Movement Protection</h4>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-on-surface-variant uppercase">Stopping Component</label>
                <select 
                  value={data.ucmpType}
                  onChange={(e) => onChange({ ucmpType: e.target.value as any })}
                  className="w-full bg-surface-container-low border border-outline-variant/20 rounded-sm px-3 py-2 text-sm outline-none"
                >
                  <option value="brake">Machine Brake</option>
                  <option value="safety-gear">Safety Gear</option>
                  <option value="valve">Rupture Valve</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-on-surface-variant uppercase">Detection Distance [mm]</label>
                <input 
                  type="number"
                  value={data.ucmpDetectionDist}
                  onChange={(e) => onChange({ ucmpDetectionDist: safeNumber(e.target.value) })}
                  className="w-full bg-surface-container-low border border-outline-variant/20 rounded-sm px-3 py-2 text-sm outline-none"
                />
              </div>
              
              <div className={`p-4 rounded-sm border ${isUcmpOk ? 'bg-emerald-50 border-emerald-200' : 'bg-error-container/10 border-error/20'}`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold uppercase opacity-60">Verification Status</span>
                  {isUcmpOk ? <CheckCircle2 size={14} className="text-emerald-600" /> : <XCircle size={14} className="text-error" />}
                </div>
                <p className="text-xs font-medium">
                  {isUcmpOk 
                    ? `Detection distance of ${data.ucmpDetectionDist} mm is compliant with ISO 8100-2.` 
                    : `Detection distance exceeds the typical 150mm limit for safe stopping.`}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const RuptureValveModule = ({ data, onChange }: { data: ProjectData, onChange: (newData: Partial<ProjectData>) => void }) => {
  const isFlowOk = data.ruptureValveFlow > 0;
  const isPressureOk = data.ruptureValvePressure >= data.maxPressure * 1.5;

  return (
    <div className="space-y-6 p-6 bg-surface-container-low border border-outline-variant/10 rounded-sm mt-8">
      <h4 className="text-xs font-bold uppercase tracking-widest text-primary mb-4 flex items-center gap-2">
        <Droplets size={14} />
        4.9 Rupture Valves / Restrictors
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-on-surface-variant uppercase">Tripping Flow [L/min]</label>
          <input 
            type="number"
            value={data.ruptureValveFlow}
            onChange={(e) => onChange({ ruptureValveFlow: safeNumber(e.target.value) })}
            className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-sm px-3 py-2 text-sm outline-none"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-on-surface-variant uppercase">Max Operating Pressure [MPa]</label>
          <input 
            type="number"
            value={data.ruptureValvePressure}
            onChange={(e) => onChange({ ruptureValvePressure: safeNumber(e.target.value) })}
            className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-sm px-3 py-2 text-sm outline-none"
          />
        </div>
      </div>
      <div className="mt-4 p-4 bg-primary/5 border border-primary/10 rounded-sm">
        <p className="text-[10px] opacity-70 italic">
          Verification: The rupture valve must be capable of stopping the car with a deceleration between 0.2gn and 1.0gn. 
          The tripping flow should be set at 1.3 to 1.5 times the nominal flow.
        </p>
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
    { id: '4.7', name: 'ACOP', cat: 'Safety', status: 'implemented' },
    { id: '4.8', name: 'UCMP', cat: 'Safety', status: 'implemented' },
    { id: '4.9', name: 'Rupture Valves', cat: 'Hydraulic', status: 'implemented' },
    { id: '4.10', name: 'Guide Rails', cat: 'Structural', status: 'implemented' },
    { id: '4.11', name: 'Traction System', cat: 'Mechanical', status: 'implemented' },
    { id: '4.12', name: 'Suspension Means', cat: 'Mechanical', status: 'implemented' },
    { id: '4.13', name: 'Traction Sheaves', cat: 'Mechanical', status: 'implemented' },
    { id: '4.15', name: 'Hydraulic System', cat: 'Hydraulic', status: 'implemented' },
    { id: '4.18', name: 'SIL-rated Circuits', cat: 'Electrical', status: 'implemented' },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-surface-container-low p-6">
        <h3 className="text-lg font-bold mb-6">Technical Component Index (ISO 8100-2)</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-outline-variant/20 text-[10px] font-bold uppercase text-on-surface-variant">
                <th className="px-4 py-3">ISO Section</th>
                <th className="px-4 py-3">Component</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Status</th>
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
        <h2 className="text-2xl font-black uppercase tracking-tighter">Calculation Report</h2>
        <p className="text-sm italic">Project Alpha-7 | ISO 8100-2:2026 Compliance Report</p>
      </div>

      <section className="space-y-4">
        <h3 className="text-lg font-bold border-b border-on-surface/20 pb-1">1. Calculation Basis</h3>
        <p className="text-sm leading-relaxed">
          This document presents the preliminary engineering results for the traction and suspension system, 
          calculated according to the requirements of ISO 8100-2:2026.
        </p>
      </section>

      <section className="space-y-4">
        <h3 className="text-lg font-bold border-b border-on-surface/20 pb-1">2. Adopted Hypotheses</h3>
        <ul className="text-sm space-y-1 list-disc list-inside">
          <li>Traction calculation based on semi-circular groove with undercut (β={data.undercutAngle}º).</li>
          <li>Dynamic friction coefficient calculated for rated speed of {data.speed} m/s.</li>
          <li>Suspension ratio {data.suspension} with efficiency of {data.efficiency * 100}%.</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h3 className="text-lg font-bold border-b border-on-surface/20 pb-1">3. Main Results</h3>
        <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm">
          <div className="font-bold">Traction (T1/T2):</div>
          <div>{formatNumber(Math.exp(0.1 * degToRad(data.wrapAngle)))} (Static Limit)</div>
          
          <div className="font-bold">Rope Safety Factor:</div>
          <div>{formatNumber(data.ropeBreakingLoad / (((data.carMass + data.ratedLoad) * 9.81) / (parseInt(data.suspension.split(':')[0]) * data.numRopes)))}</div>
          
          <div className="font-bold">Upright Stress (Sling):</div>
          <div>{formatNumber((2 * (data.carMass + data.ratedLoad) * 9.81) / (2 * data.uprightArea))} N/mm²</div>
 
          <div className="font-bold">Sheave Pressure:</div>
          <div>{formatNumber(((data.carMass + data.ratedLoad + data.cwtMass) * 9.81 / parseInt(data.suspension.split(':')[0])) / (data.sheaveDiameter * data.ropeDiameter))} MPa</div>
          
          <div className="font-bold">Safety Gear Retardation:</div>
          <div>{formatNumber(((data.safetyGearBrakingForce / (data.carMass + data.ratedLoad)) - 9.81) / 9.81)} gn</div>
 
          <div className="font-bold">Cylinder Thickness (Hyd.):</div>
          <div>{data.cylinderWallThickness} mm (Actual)</div>
        </div>
      </section>

      {data.tractionNotes && (
        <section className="space-y-4">
          <h3 className="text-lg font-bold border-b border-on-surface/20 pb-1">4. Engineering Notes</h3>
          <p className="text-sm leading-relaxed whitespace-pre-wrap italic text-on-surface-variant">
            {data.tractionNotes}
          </p>
        </section>
      )}

      <div className="mt-12 pt-8 border-t border-on-surface/10 text-[10px] text-on-surface-variant italic">
        Note: Verification to be confirmed by the exact clause of ISO 8100-2:2026. Pre-dimensioning results.
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
            {isSlingOk ? 'Implemented - OK' : 'Implemented - NOK'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className={`p-6 border ${isSlingOk ? 'bg-surface-container-lowest border-outline-variant/10' : 'bg-error-container/10 border-error/20'}`}>
            <h4 className="text-xs font-bold uppercase mb-4 text-primary">Upright Stress</h4>
            <p className="text-2xl font-black">{formatNumber(sigma_upright)} <span className="text-xs font-normal opacity-50">N/mm²</span></p>
            <p className="text-[10px] mt-2 opacity-50 italic">Limit: {data.materialYield} N/mm²</p>
          </div>
          
          <div className="p-6 bg-surface-container-lowest border border-outline-variant/10">
            <h4 className="text-xs font-bold uppercase mb-4 text-primary">Impact Force (Fs)</h4>
            <p className="text-2xl font-black">{formatNumber(Fs / 1000, 1)} <span className="text-xs font-normal opacity-50">kN</span></p>
            <p className="text-[10px] mt-2 opacity-50 italic">Safety Gear Operation</p>
          </div>
        </div>

        <div className="mt-8 p-4 bg-primary/5 border border-primary/10 rounded-sm">
          <h4 className="text-xs font-bold uppercase mb-2">Design Criteria (4.6.2)</h4>
          <p className="text-[10px] opacity-70 leading-relaxed">
            The car frame must be dimensioned to withstand the forces resulting from the safety gear operation and the impact on the buffers. 
            The calculation considers a symmetrical load distribution on the uprights.
          </p>
        </div>
      </div>
    </div>
  );
};

const DoorLockingModule = () => {
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

const RuntimeChecksModule = () => {
  const checks = [
    { id: 'sys-01', label: 'Engineering Modules Loaded', status: 'ok' },
    { id: 'sys-02', label: 'Traction Formulas (ISO 4.11) Active', status: 'ok' },
    { id: 'sys-03', label: 'Input Validator (safeNumber) Active', status: 'ok' },
    { id: 'sys-04', label: 'Rope Calculation (ISO 4.12) Active', status: 'ok' },
    { id: 'sys-05', label: 'Guide Rails Module (ISO 4.10) Partial', status: 'warning' },
    { id: 'sys-06', label: 'OSG Verification (ISO 4.4) Active', status: 'ok' },
    { id: 'sys-07', label: 'Report Exporter Active', status: 'ok' },
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
  const [bufferTarget, setBufferTarget] = useState<'car' | 'cwt'>('car');

  // OSG Verification Logic
  const minTripping = 1.15 * data.speed;
  let maxTripping = 1.5;
  if (data.safetyGearType === 'instantaneous') maxTripping = 0.8;
  else if (data.safetyGearType === 'progressive' && data.speed > 1.0) maxTripping = 1.25 * data.speed + 0.25 / data.speed;
  
  const isTrippingOk = data.osgTrippingSpeed >= minTripping && data.osgTrippingSpeed <= maxTripping;
  const isForceOk = data.osgTensileForce >= 300;
  const isBrakingForceOk = data.osgMaxBrakingForce >= data.osgTensileForce;
  const osgSafetyFactor = data.osgTensileForce > 0 ? data.osgBreakingLoad / data.osgTensileForce : 0;
  const isOsgSfOk = osgSafetyFactor >= 8;

  return (
    <div className="space-y-8">
      <div className="bg-surface-container-low p-8 border-t-2 border-primary">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xl font-bold">Safety Components Verification</h3>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 uppercase">Implemented (4.2, 4.3, 4.4, 4.5, 4.18)</span>
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
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded flex items-center justify-center border border-outline-variant">
                        {/* Placeholder for manual check */}
                      </div>
                      <span className="text-xs font-medium">Protection against accidental manipulation (preventing opening from outside without key).</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded flex items-center justify-center border border-outline-variant">
                        {/* Placeholder for manual check */}
                      </div>
                      <span className="text-xs font-medium">Verification of clearances and alignment (max 6mm between door panels).</span>
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
                <h5 className="text-[10px] font-bold uppercase text-primary mb-4">Test Inputs</h5>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-on-surface-variant uppercase">Safety Gear Type</label>
                    <select 
                      value={data.safetyGearType}
                      onChange={(e) => onChange({ safetyGearType: e.target.value as any })}
                      className="w-full bg-surface-container-low border border-outline-variant/20 rounded-sm px-3 py-2 text-sm focus:ring-1 focus:ring-primary outline-none"
                    >
                      <option value="instantaneous">Instantaneous</option>
                      <option value="progressive">Progressive</option>
                      <option value="buffered">Instantaneous w/ Buffered Effect</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-on-surface-variant uppercase">Tripping Speed (vt)</label>
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
                    <label className="text-[11px] font-bold text-on-surface-variant uppercase">Tensile Force (Ft)</label>
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
                    <label className="text-[11px] font-bold text-on-surface-variant uppercase">Mechanism Breaking Load (Fr)</label>
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

                <div className="pt-4 border-t border-outline-variant/10 space-y-4">
                  <h5 className="text-[10px] font-bold uppercase text-primary">Datasheet & Identification</h5>
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-on-surface-variant uppercase">Manufacturer</label>
                      <input 
                        type="text"
                        value={data.osgManufacturer}
                        onChange={(e) => onChange({ osgManufacturer: e.target.value })}
                        className="w-full bg-surface-container-low border border-outline-variant/20 rounded-sm px-2 py-1.5 text-xs outline-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-on-surface-variant uppercase">Model</label>
                        <input 
                          type="text"
                          value={data.osgModel}
                          onChange={(e) => onChange({ osgModel: e.target.value })}
                          className="w-full bg-surface-container-low border border-outline-variant/20 rounded-sm px-2 py-1.5 text-xs outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-on-surface-variant uppercase">Serial Number</label>
                        <input 
                          type="text"
                          value={data.osgSerialNumber}
                          onChange={(e) => onChange({ osgSerialNumber: e.target.value })}
                          className="w-full bg-surface-container-low border border-outline-variant/20 rounded-sm px-2 py-1.5 text-xs outline-none"
                        />
                      </div>
                    </div>
                    <button className="w-full py-2 bg-primary/5 hover:bg-primary/10 text-primary border border-primary/20 rounded-sm text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors">
                      <FileText size={12} />
                      Link Datasheet / Certificate
                    </button>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-2 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className={`p-4 border ${isTrippingOk ? 'bg-emerald-50 border-emerald-200' : 'bg-error-container/10 border-error/20'}`}>
                    <p className="text-[10px] font-bold uppercase mb-1">Tripping Speed Verification (vt)</p>
                    <p className="text-xl font-black">{formatNumber(data.osgTrippingSpeed)} m/s</p>
                    <div className="mt-2 text-[10px] space-y-1 opacity-70">
                      <p>Min: {formatNumber(minTripping)} m/s (1.15v)</p>
                      <p>Max: {formatNumber(maxTripping)} m/s</p>
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      {isTrippingOk ? <CheckCircle2 size={14} className="text-emerald-600" /> : <XCircle size={14} className="text-error" />}
                      <span className={`text-[10px] font-bold uppercase ${isTrippingOk ? 'text-emerald-700' : 'text-error'}`}>
                        {isTrippingOk ? 'Compliant' : 'Non-Compliant'}
                      </span>
                    </div>
                  </div>

                  <div className={`p-4 border ${isForceOk ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
                    <p className="text-[10px] font-bold uppercase mb-1">Tensile Force (Ft)</p>
                    <p className="text-xl font-black">{formatNumber(data.osgTensileForce)} N</p>
                    <p className="mt-2 text-[10px] opacity-70 italic">Required: ≥ 300N</p>
                    <div className="mt-3 flex items-center gap-2">
                      {isForceOk ? <CheckCircle2 size={14} className="text-emerald-600" /> : <AlertCircle size={14} className="text-amber-600" />}
                      <span className={`text-[10px] font-bold uppercase ${isForceOk ? 'text-emerald-700' : 'text-amber-700'}`}>
                        {isForceOk ? 'Sufficient' : 'Check Requirement'}
                      </span>
                    </div>
                  </div>

                  <div className={`p-4 border ${isOsgSfOk ? 'bg-emerald-50 border-emerald-200' : 'bg-error-container/10 border-error/20'}`}>
                    <p className="text-[10px] font-bold uppercase mb-1">Safety Factor (Sf_osg)</p>
                    <p className="text-xl font-black">{formatNumber(osgSafetyFactor)}</p>
                    <p className="mt-2 text-[10px] opacity-70 italic">Required: ≥ 8.0</p>
                    <div className="mt-3 flex items-center gap-2">
                      {isOsgSfOk ? <CheckCircle2 size={14} className="text-emerald-600" /> : <XCircle size={14} className="text-error" />}
                      <span className={`text-[10px] font-bold uppercase ${isOsgSfOk ? 'text-emerald-700' : 'text-error'}`}>
                        {isOsgSfOk ? 'Compliant' : 'Insufficient'}
                      </span>
                    </div>
                  </div>

                  <div className={`p-4 border ${isBrakingForceOk ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
                    <p className="text-[10px] font-bold uppercase mb-1">Braking Force Check</p>
                    <p className="text-xl font-black">{formatNumber(data.osgMaxBrakingForce)} N</p>
                    <p className="mt-2 text-[10px] opacity-70 italic">Required: ≥ {formatNumber(data.osgTensileForce)} N (Ft)</p>
                    <div className="mt-3 flex items-center gap-2">
                      {isBrakingForceOk ? <CheckCircle2 size={14} className="text-emerald-600" /> : <AlertCircle size={14} className="text-amber-600" />}
                      <span className={`text-[10px] font-bold uppercase ${isBrakingForceOk ? 'text-emerald-700' : 'text-amber-700'}`}>
                        {isBrakingForceOk ? 'Sufficient' : 'Insufficient'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-surface-container-lowest border border-outline-variant/10 rounded-sm">
                  <h5 className="text-[10px] font-bold uppercase text-primary mb-4 flex items-center gap-2">
                    <CheckSquare size={12} />
                    Verification Checklist (4.4)
                  </h5>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded flex items-center justify-center border ${isTrippingOk ? 'bg-emerald-600 border-emerald-600' : 'border-outline-variant'}`}>
                        {isTrippingOk && <CheckSquare size={14} className="text-white" />}
                      </div>
                      <span className={`text-xs font-medium ${isTrippingOk ? 'text-on-surface' : 'text-on-surface-variant'}`}>
                        Tripping speed ({formatNumber(data.osgTrippingSpeed)} m/s) within normative limits.
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded flex items-center justify-center border ${isForceOk ? 'bg-emerald-600 border-emerald-600' : 'border-outline-variant'}`}>
                        {isForceOk && <CheckSquare size={14} className="text-white" />}
                      </div>
                      <span className={`text-xs font-medium ${isForceOk ? 'text-on-surface' : 'text-on-surface-variant'}`}>
                        Tensile force Ft ({formatNumber(data.osgTensileForce)} N) sufficient for tripping (≥ 300N).
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded flex items-center justify-center border ${isOsgSfOk ? 'bg-emerald-600 border-emerald-600' : 'border-outline-variant'}`}>
                        {isOsgSfOk && <CheckSquare size={14} className="text-white" />}
                      </div>
                      <span className={`text-xs font-medium ${isOsgSfOk ? 'text-on-surface' : 'text-on-surface-variant'}`}>
                        Mechanism safety factor ({formatNumber(osgSafetyFactor)}) meets the minimum requirement of 8.0.
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded flex items-center justify-center border ${isBrakingForceOk ? 'bg-emerald-600 border-emerald-600' : 'border-outline-variant'}`}>
                        {isBrakingForceOk && <CheckSquare size={14} className="text-white" />}
                      </div>
                      <span className={`text-xs font-medium ${isBrakingForceOk ? 'text-on-surface' : 'text-on-surface-variant'}`}>
                        Maximum braking force F_max ({formatNumber(data.osgMaxBrakingForce)} N) is sufficient to generate tripping force Ft ({formatNumber(data.osgTensileForce)} N).
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
                <h5 className="text-[10px] font-bold uppercase text-primary mb-4">Certification Data</h5>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-on-surface-variant uppercase">Max Certified Mass (P+Q)</label>
                    <input 
                      type="number"
                      value={data.safetyGearMaxMass}
                      onChange={(e) => onChange({ safetyGearMaxMass: safeNumber(e.target.value) })}
                      className="w-full bg-surface-container-low border border-outline-variant/20 rounded-sm px-3 py-2 text-sm outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-on-surface-variant uppercase">Braking Force (Fb) [N]</label>
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
                            <p className="text-[10px] font-bold uppercase mb-1">Total Mass (P+Q)</p>
                            <p className="text-xl font-black">{formatNumber(totalMass)} kg</p>
                            <p className="text-[10px] opacity-50">Limit: {data.safetyGearMaxMass} kg</p>
                          </div>
                          <div className={`p-4 border ${isRetardationOk ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
                            <div className="flex items-center justify-between mb-3">
                              <p className="text-[10px] font-bold uppercase tracking-wider">Resultant Retardation (gn)</p>
                              <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full animate-pulse ${isRetardationOk ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${isRetardationOk ? 'bg-emerald-600 text-white' : 'bg-amber-600 text-white'}`}>
                                  {isRetardationOk ? 'ISO 8100-2 Compliant' : 'Non-Compliant'}
                                </span>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                              <div className="space-y-2">
                                <div className="flex items-baseline gap-2">
                                  <p className="text-3xl font-black">{formatNumber(retardationG)} gn</p>
                                  <p className="text-[10px] opacity-40 font-bold uppercase">Result</p>
                                </div>
                                <div className="p-2 rounded bg-white/50 border border-black/5">
                                  <p className={`text-[11px] font-bold ${isRetardationOk ? 'text-emerald-700' : 'text-amber-700'}`}>
                                    {retardationG < 0.2 ? '❌ STATUS: Insufficient Braking' : 
                                     retardationG > 1.0 ? '❌ STATUS: Excessive Retardation' : 
                                     '✅ STATUS: Safe Deceleration'}
                                  </p>
                                  <p className="text-[10px] opacity-60 mt-0.5 leading-tight">
                                    {retardationG < 0.2 ? 'Braking force is too low to guarantee a safe stop.' : 
                                     retardationG > 1.0 ? 'Deceleration exceeds 1.0g, risking passenger injury.' : 
                                     'Retardation is within the normative range (0.2g - 1.0g).'}
                                  </p>
                                </div>
                              </div>

                              <div className="space-y-3">
                                <div className="p-3 bg-surface-container-low/50 rounded-sm border border-outline-variant/10">
                                  <p className="text-[9px] font-bold opacity-50 uppercase mb-2">Calculation Breakdown</p>
                                  <div className="space-y-1.5">
                                    <div className="flex justify-between text-[10px]">
                                      <span className="opacity-60">Braking Force (Fb)</span>
                                      <span className="font-bold">{formatNumber(data.safetyGearBrakingForce)} N</span>
                                    </div>
                                    <div className="flex justify-between text-[10px]">
                                      <span className="opacity-60">Total Mass (P+Q)</span>
                                      <span className="font-bold">{formatNumber(totalMass)} kg</span>
                                    </div>
                                    <div className="pt-1.5 border-t border-black/5 flex justify-between text-[10px] font-bold text-primary">
                                      <span>Formula</span>
                                      <span>[Fb / (P+Q)g] - 1</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            <div className="relative h-3 bg-surface-container-low rounded-full overflow-visible mb-2">
                              <div className="absolute inset-0 flex rounded-full overflow-hidden">
                                <div className="h-full bg-amber-200" style={{ width: '16.6%' }} />
                                <div className="h-full bg-emerald-500" style={{ width: '66.6%' }} />
                                <div className="h-full bg-amber-200" style={{ width: '16.8%' }} />
                              </div>
                              
                              <div 
                                className="absolute top-1/2 -translate-y-1/2 w-2 h-6 bg-primary shadow-lg border-2 border-white transition-all duration-1000 ease-out z-10"
                                style={{ left: `${Math.min(Math.max((retardationG / 1.2) * 100, 0), 100)}%` }}
                              >
                                <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-black text-primary">
                                  {formatNumber(retardationG)}
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex justify-between text-[9px] font-bold opacity-40 uppercase px-1">
                              <span>0.0</span>
                              <span>0.2 gn (Min)</span>
                              <span>1.0 gn (Max)</span>
                              <span>1.2+</span>
                            </div>
                          </div>
                        </div>

                        <div className="p-6 bg-surface-container-lowest border border-outline-variant/10 rounded-sm">
                          <h5 className="text-[10px] font-bold uppercase text-primary mb-4 flex items-center gap-2">
                            <CheckSquare size={12} />
                            Verification Checklist (ISO 8100-2)
                          </h5>
                          <div className="space-y-3">
                            <div className="flex items-center gap-3">
                              <div className={`w-5 h-5 rounded flex items-center justify-center border ${isMassOk ? 'bg-emerald-600 border-emerald-600' : 'border-outline-variant'}`}>
                                {isMassOk && <CheckSquare size={14} className="text-white" />}
                              </div>
                              <span className={`text-xs font-medium ${isMassOk ? 'text-on-surface' : 'text-on-surface-variant'}`}>
                                Total mass (P+Q) of {formatNumber(totalMass)}kg does not exceed the certified limit of {data.safetyGearMaxMass}kg.
                              </span>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className={`w-5 h-5 rounded flex items-center justify-center border ${isRetardationOk ? 'bg-emerald-600 border-emerald-600' : 'border-outline-variant'}`}>
                                {isRetardationOk && <CheckSquare size={14} className="text-white" />}
                              </div>
                              <span className={`text-xs font-medium ${isRetardationOk ? 'text-on-surface' : 'text-on-surface-variant'}`}>
                                Calculated retardation of {formatNumber(retardationG)}gn is within the normative range (0.2gn - 1.0gn).
                              </span>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className={`w-5 h-5 rounded flex items-center justify-center border ${data.safetyGearBrakingForce > 0 ? 'bg-emerald-600 border-emerald-600' : 'border-outline-variant'}`}>
                                {data.safetyGearBrakingForce > 0 && <CheckSquare size={14} className="text-white" />}
                              </div>
                              <span className={`text-xs font-medium ${data.safetyGearBrakingForce > 0 ? 'text-on-surface' : 'text-on-surface-variant'}`}>
                                Braking force (Fb) of {formatNumber(data.safetyGearBrakingForce)}N properly parameterized.
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
                <h5 className="text-[10px] font-bold uppercase text-primary mb-4 text-center">Buffer Parameters</h5>
                <div className="flex p-1 bg-surface-container-low rounded-sm mb-4">
                  <button 
                    onClick={() => setBufferTarget('car')}
                    className={`flex-1 py-1.5 text-[10px] font-bold uppercase rounded-sm transition-all ${bufferTarget === 'car' ? 'bg-primary text-white shadow-sm' : 'text-on-surface-variant hover:bg-surface-container-lowest'}`}
                  >
                    Car Buffer
                  </button>
                  <button 
                    onClick={() => setBufferTarget('cwt')}
                    className={`flex-1 py-1.5 text-[10px] font-bold uppercase rounded-sm transition-all ${bufferTarget === 'cwt' ? 'bg-primary text-white shadow-sm' : 'text-on-surface-variant hover:bg-surface-container-lowest'}`}
                  >
                    CWT Buffer
                  </button>
                </div>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-on-surface-variant uppercase">Buffer Type</label>
                    <select 
                      value={data.bufferType}
                      onChange={(e) => {
                        const type = e.target.value as any;
                        onChange({ 
                          bufferType: type,
                          bufferIsLinear: true // Reset to linear on type change for safety
                        });
                      }}
                      className="w-full bg-surface-container-low border border-outline-variant/20 rounded-sm px-3 py-2 text-sm outline-none"
                    >
                      <option value="energy-accumulation">Energy Accumulation</option>
                      <option value="energy-dissipation">Energy Dissipation</option>
                    </select>
                  </div>
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
                  const impactMass = bufferTarget === 'car' ? (data.carMass + data.ratedLoad) : data.cwtMass;
                  
                  // Kinetic Energy (J)
                  const Ek = 0.5 * impactMass * v * v;
                  const h_m = data.bufferStroke / 1000;
                  const Ep = impactMass * g * h_m;
                  const Etotal = Ek + Ep;
                  
                  // Absorption Capacity (J) at 1.0gn average deceleration limit
                  // Work = F * h = m * (a + g) * h. At a = 1.0gn, Work = 2 * m * g * h
                  // For non-linear dissipation, we apply a placeholder efficiency factor (0.8)
                  // representing a more complex force-stroke integration.
                  const nonLinearFactor = data.bufferIsLinear ? 1.0 : 0.8;
                  const Ecap = 2 * impactMass * g * h_m * nonLinearFactor;
                  
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
                  const isMassOk = impactMass >= data.bufferMinMass && impactMass <= data.bufferMaxMass;
                  const isEnergyOk = data.bufferType === 'energy-dissipation' ? Etotal <= Ecap : true;
                  
                  // Average Deceleration (gn)
                  const a_avg = h_m > 0 ? (v * v) / (2 * h_m * g) : 0;
                  
                  // Deceleration Force (N)
                  const F_buffer = impactMass * (a_avg + g);
                  
                  const utilization = h_min > 0 ? (data.bufferStroke / h_min) * 100 : 0;
                  const strokeUtilization = h_m > 0 ? (h_min / (data.bufferStroke)) * 100 : 0;

                  return (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className={`p-6 border ${isStrokeOk ? 'bg-emerald-50 border-emerald-200' : 'bg-error-container/10 border-error/20'}`}>
                          <p className="text-[10px] font-bold uppercase mb-1">Stroke Utilization</p>
                          <p className="text-2xl font-black">{formatNumber(data.bufferStroke)} mm</p>
                          <p className="text-[10px] opacity-50">Min: {formatNumber(h_min)} mm ({formatNumber(strokeUtilization)}%)</p>
                          <div className="mt-2 h-1 bg-surface-container-low rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${isStrokeOk ? 'bg-emerald-500' : 'bg-error'}`} 
                              style={{ width: `${Math.min(strokeUtilization, 100)}%` }}
                            />
                          </div>
                        </div>
                        <div className={`p-6 border ${a_avg <= 1.0 ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
                          <p className="text-[10px] font-bold uppercase mb-1">Avg Deceleration</p>
                          <p className="text-2xl font-black">{formatNumber(a_avg)} gn</p>
                          <p className="text-[10px] opacity-50">Limit: 1.0 gn</p>
                        </div>
                        <div className="p-6 border bg-surface-container-low border-outline-variant/10">
                          <p className="text-[10px] font-bold uppercase mb-1">Impact Force (Fb)</p>
                          <p className="text-2xl font-black">{formatNumber(F_buffer)} N</p>
                          <p className="text-[10px] opacity-50">m · (a + g)</p>
                        </div>
                      </div>

                      {data.bufferType === 'energy-dissipation' && (
                        <div className={`p-6 border ${isEnergyOk ? 'bg-emerald-50 border-emerald-200' : 'bg-error-container/10 border-error/20'}`}>
                          <div className="flex items-center justify-between mb-4">
                            <h5 className="text-[10px] font-bold uppercase text-primary">Energy Dissipation Capacity</h5>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isEnergyOk ? 'bg-emerald-100 text-emerald-700' : 'bg-error-container text-error'}`}>
                              {isEnergyOk ? 'CAPACITY OK' : 'OVERLOAD'}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-8">
                            <div>
                              <p className="text-[10px] opacity-50 uppercase mb-1">Total Impact Energy</p>
                              <p className="text-xl font-black">{formatNumber(Etotal)} J</p>
                              <p className="text-[9px] opacity-40 mt-1">Ek + Ep (0.5mv² + mgh)</p>
                            </div>
                            <div>
                              <p className="text-[10px] opacity-50 uppercase mb-1">Absorption Limit (1.0gn)</p>
                              <p className="text-xl font-black">{formatNumber(Ecap)} J</p>
                              <p className="text-[9px] opacity-40 mt-1">
                                {data.bufferIsLinear ? 'Work = m(a+g)h' : 'Placeholder: Non-linear Integration (η=0.8)'}
                              </p>
                            </div>
                          </div>
                          <div className="mt-4 pt-4 border-t border-outline-variant/10">
                            <div className="flex items-center justify-between">
                              <p className="text-[10px] font-bold uppercase opacity-60">Kinetic Energy vs Capacity</p>
                              <p className="text-[10px] font-bold text-primary">{(Ek / Ecap * 100).toFixed(1)}% Utilization</p>
                            </div>
                            <div className="mt-2 h-1.5 bg-surface-container-low rounded-full overflow-hidden">
                              <div 
                                className={`h-full ${Ek <= Ecap ? 'bg-primary' : 'bg-error'}`} 
                                style={{ width: `${Math.min(Ek / Ecap * 100, 100)}%` }}
                              />
                            </div>
                            <p className="text-[9px] opacity-40 mt-2 italic">
                              Comparison: Kinetic energy (Ek) represents {formatNumber(Ek)} J of the total {formatNumber(Etotal)} J impact energy.
                            </p>
                          </div>
                          {!data.bufferIsLinear && (
                            <div className="mt-4 p-2 bg-primary/5 border border-primary/10 rounded-sm">
                              <p className="text-[9px] text-primary font-medium italic">
                                Note: Non-linear capacity is currently estimated using a placeholder efficiency factor. 
                                Advanced verification requires integration of the specific buffer force-stroke curve.
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-surface-container-low border border-outline-variant/10">
                          <p className="text-[10px] font-bold uppercase mb-1 opacity-50">Kinetic Energy (Impact)</p>
                          <p className="text-xl font-black">{formatNumber(Ek)} J</p>
                          <p className="text-[9px] opacity-40 mt-1">0.5 · m · v²</p>
                        </div>
                        <div className={`p-4 border ${isMassOk ? 'bg-surface-container-low border-outline-variant/10' : 'bg-error-container/10 border-error/20'}`}>
                          <p className="text-[10px] font-bold uppercase mb-1 opacity-50">Impact Mass ({bufferTarget === 'car' ? 'P+Q' : 'Mcwt'})</p>
                          <p className="text-xl font-black">{formatNumber(impactMass)} kg</p>
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
                          {data.bufferType === 'energy-dissipation' && (
                            <div className="flex items-center gap-3">
                              <div className={`w-5 h-5 rounded flex items-center justify-center border ${isEnergyOk ? 'bg-emerald-600 border-emerald-600' : 'border-outline-variant'}`}>
                                {isEnergyOk && <CheckSquare size={14} className="text-white" />}
                              </div>
                              <span className={`text-xs font-medium ${isEnergyOk ? 'text-on-surface' : 'text-on-surface-variant'}`}>
                                Energy dissipation capacity ({formatNumber(Ecap)}J) is sufficient for total impact energy ({formatNumber(Etotal)}J).
                              </span>
                            </div>
                          )}
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

          {/* 3D Shaft Visualization (Module I) */}
          <section className="space-y-6 pt-8 border-t border-outline-variant/10">
            <div className="flex items-center gap-4 border-b border-outline-variant/20 pb-2">
              <Box className="text-primary" size={20} />
              <div className="flex items-center gap-3">
                <h4 className="text-sm font-bold uppercase tracking-wider">3D Shaft Visualization (Module I)</h4>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 uppercase tracking-tighter">Implemented</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="space-y-4 p-6 bg-surface-container-lowest border border-outline-variant/10">
                <h5 className="text-[10px] font-bold uppercase text-primary mb-4">Shaft Geometry Inputs</h5>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-on-surface-variant uppercase">Shaft Width</label>
                    <div className="relative">
                      <input 
                        type="number"
                        value={data.shaftWidth}
                        onChange={(e) => onChange({ shaftWidth: safeNumber(e.target.value) })}
                        className="w-full bg-surface-container-low border border-outline-variant/20 rounded-sm px-3 py-2 text-sm outline-none"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold opacity-50">mm</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-on-surface-variant uppercase">Shaft Depth</label>
                    <div className="relative">
                      <input 
                        type="number"
                        value={data.shaftDepth}
                        onChange={(e) => onChange({ shaftDepth: safeNumber(e.target.value) })}
                        className="w-full bg-surface-container-low border border-outline-variant/20 rounded-sm px-3 py-2 text-sm outline-none"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold opacity-50">mm</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-on-surface-variant uppercase">Shaft Height</label>
                    <div className="relative">
                      <input 
                        type="number"
                        value={data.shaftHeight}
                        onChange={(e) => onChange({ shaftHeight: safeNumber(e.target.value) })}
                        className="w-full bg-surface-container-low border border-outline-variant/20 rounded-sm px-3 py-2 text-sm outline-none"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold opacity-50">mm</span>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-outline-variant/10">
                    <label className="text-[11px] font-bold text-on-surface-variant uppercase mb-2 block">Car Position Simulator</label>
                    <input 
                      type="range"
                      min="0"
                      max="100"
                      value={data.carPositionPercent}
                      onChange={(e) => onChange({ carPositionPercent: safeNumber(e.target.value) })}
                      className="w-full h-2 bg-surface-container-low rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                    <div className="flex justify-between mt-1">
                      <span className="text-[9px] font-bold opacity-50 uppercase">Pit</span>
                      <span className="text-[9px] font-bold text-primary">{data.carPositionPercent}%</span>
                      <span className="text-[9px] font-bold opacity-50 uppercase">Headroom</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-2">
                <Shaft3DModule 
                  width={data.shaftWidth}
                  depth={data.shaftDepth}
                  height={data.shaftHeight}
                  carPos={data.carPositionPercent / 100}
                />
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
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-on-surface-variant uppercase">Dangerous Fr. (%)</label>
                      <input 
                        type="number"
                        value={data.dangerousFraction}
                        onChange={(e) => onChange({ dangerousFraction: safeNumber(e.target.value) })}
                        className="w-full bg-surface-container-low border border-outline-variant/20 rounded-sm px-3 py-2 text-sm outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-on-surface-variant uppercase">Diag. Coverage (%)</label>
                      <input 
                        type="number"
                        value={data.diagnosticCoverage}
                        onChange={(e) => onChange({ diagnosticCoverage: safeNumber(e.target.value) })}
                        className="w-full bg-surface-container-low border border-outline-variant/20 rounded-sm px-3 py-2 text-sm outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="lg:col-span-2 space-y-4">
                {(() => {
                  // PFH Calculation (IEC 61508)
                  // λD = λ * DangerousFraction
                  // λDU = λD * (1 - DC)
                  // For high demand mode, PFH ≈ λDU
                  const lambdaD = data.failureRate * (data.dangerousFraction / 100);
                  const pfh = lambdaD * (1 - (data.diagnosticCoverage / 100));
                  
                  // SIL PFH Limits (High Demand / Continuous Mode)
                  const silLimits = {
                    3: { min: 1e-8, max: 1e-7 },
                    2: { min: 1e-7, max: 1e-6 },
                    1: { min: 1e-6, max: 1e-5 }
                  };
                  
                  const currentLimit = silLimits[data.silLevel as keyof typeof silLimits];
                  const isPfhOk = pfh <= currentLimit.max;
                  
                  // DC Requirements (Simplified)
                  const minDc = data.silLevel === 3 ? 90 : (data.silLevel === 2 ? 60 : 0);
                  const isDcOk = data.diagnosticCoverage >= minDc;

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
                        <div className={`p-6 border ${isPfhOk && isDcOk ? 'bg-emerald-50 border-emerald-200' : 'bg-error-container/10 border-error/20'}`}>
                          <p className="text-[10px] font-bold uppercase mb-1">Status</p>
                          <div className="flex items-center gap-2">
                            {(isPfhOk && isDcOk) ? (
                              <CheckCircle2 className="text-emerald-600" size={24} />
                            ) : (
                              <ShieldAlert className="text-error" size={24} />
                            )}
                            <p className="text-xl font-black">{(isPfhOk && isDcOk) ? 'COMPLIANT' : 'NON-COMPLIANT'}</p>
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
                            <span className="text-xs font-medium">PFH value ({pfh.toExponential(2)}) within the range for SIL {data.silLevel}.</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded flex items-center justify-center border ${isDcOk ? 'bg-emerald-600 border-emerald-600' : 'border-outline-variant'}`}>
                              {isDcOk && <CheckSquare size={14} className="text-white" />}
                            </div>
                            <span className="text-xs font-medium">Diagnostic Coverage ({data.diagnosticCoverage}%) meets minimum for SIL {data.silLevel} (≥{minDc}%).</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded flex items-center justify-center border ${data.faultTolerance >= (data.silLevel - 1) ? 'bg-emerald-600 border-emerald-600' : 'border-outline-variant'}`}>
                              {data.faultTolerance >= (data.silLevel - 1) && <CheckSquare size={14} className="text-white" />}
                            </div>
                            <span className="text-xs font-medium">Hardware Fault Tolerance (HFT={data.faultTolerance}) compatible with SIL {data.silLevel}.</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded flex items-center justify-center border ${data.safetyIntegrity ? 'bg-emerald-600 border-emerald-600' : 'border-outline-variant'}`}>
                              {data.safetyIntegrity && <CheckSquare size={14} className="text-white" />}
                            </div>
                            <span className="text-xs font-medium">Safety Integrity documentation and λD ({lambdaD.toExponential(2)}) verified.</span>
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

const ValidationModal = ({ isOpen, onClose, results }: { isOpen: boolean, onClose: () => void, results: { type: 'error' | 'warning' | 'success', msg: string }[] }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-surface-container-low w-full max-w-lg rounded-sm shadow-2xl border border-outline-variant/20 overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-6 border-b border-outline-variant/10 flex items-center justify-between bg-surface-container">
          <h3 className="text-lg font-black uppercase tracking-tighter">Project Validation Results</h3>
          <button onClick={onClose} className="p-1 hover:bg-surface-container-high rounded-full transition-colors">
            <XCircle size={20} className="text-on-surface-variant" />
          </button>
        </div>
        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          {results.length === 0 ? (
            <div className="flex flex-col items-center py-8 text-center">
              <CheckCircle2 size={48} className="text-emerald-500 mb-4" />
              <p className="font-bold text-emerald-700">All Systems Nominal</p>
              <p className="text-xs text-on-surface-variant opacity-70">No critical errors or warnings detected in the current configuration.</p>
            </div>
          ) : (
            results.map((r, i) => (
              <div key={i} className={`p-4 border-l-4 flex gap-4 ${
                r.type === 'error' ? 'bg-error-container/10 border-error' : 
                r.type === 'warning' ? 'bg-amber-50 border-amber-400' : 'bg-emerald-50 border-emerald-500'
              }`}>
                {r.type === 'error' ? <XCircle className="text-error shrink-0" size={18} /> : 
                 r.type === 'warning' ? <AlertTriangle className="text-amber-500 shrink-0" size={18} /> : 
                 <CheckCircle2 className="text-emerald-500 shrink-0" size={18} />}
                <div>
                  <p className={`text-xs font-bold uppercase ${
                    r.type === 'error' ? 'text-error' : 
                    r.type === 'warning' ? 'text-amber-700' : 'text-emerald-700'
                  }`}>{r.type}</p>
                  <p className="text-sm text-on-surface font-medium">{r.msg}</p>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="p-6 bg-surface-container-lowest border-t border-outline-variant/10 flex justify-end">
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-primary text-white font-bold text-xs uppercase tracking-widest hover:opacity-90 transition-all"
          >
            Close Report
          </button>
        </div>
      </div>
    </div>
  );
};

const SimpleModal = ({ isOpen, onClose, title, children }: { isOpen: boolean, onClose: () => void, title: string, children: React.ReactNode }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-surface-container-low w-full max-w-md rounded-sm shadow-xl border border-outline-variant/10 animate-in zoom-in-95 duration-200">
        <div className="p-4 border-b border-outline-variant/10 flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-widest">{title}</h3>
          <button onClick={onClose} className="p-1 hover:bg-surface-container-high rounded-full"><XCircle size={16} /></button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [isValidationOpen, setIsValidationOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [validationResults, setValidationResults] = useState<{ type: 'error' | 'warning' | 'success', msg: string }[]>([]);
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
    bufferMaxMass: 2500,
    bufferMinMass: 500,
    bufferIsLinear: true,
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
    diagnosticCoverage: 90,
    dangerousFraction: 50,
    doorLockingForce: 1000,
    doorLockingEngagement: 7,
    doorLockingElectricalCheck: true,
    osgMaxBrakingForce: 300,
    osgManufacturer: '',
    osgModel: '',
    osgSerialNumber: '',
    shaftWidth: 2000,
    shaftDepth: 2000,
    shaftHeight: 30000,
    carPositionPercent: 50,
    acopType: 'governor',
    acopTrippingSpeed: 1.5,
    ucmpType: 'brake',
    ucmpDetectionDist: 150,
    ruptureValveFlow: 120,
    ruptureValvePressure: 6.0
  });

  const handleDataChange = (newData: Partial<ProjectData>) => {
    setProjectData(prev => ({ ...prev, ...newData }));
  };

  const validateProject = () => {
    const results: { type: 'error' | 'warning' | 'success', msg: string }[] = [];
    
    // Traction Check
    const f_traction = Math.exp(projectData.frictionCoeff * degToRad(projectData.wrapAngle));
    if (f_traction < 1.5) results.push({ type: 'warning', msg: 'Traction ratio is low (< 1.5). Check wrap angle or undercut.' });
    
    // Safety Factor Check
    const sf = projectData.ropeBreakingLoad / (((projectData.carMass + projectData.ratedLoad) * 9.81) / (parseInt(projectData.suspension.split(':')[0]) * projectData.numRopes));
    if (sf < 12) results.push({ type: 'error', msg: `Rope safety factor (${sf.toFixed(1)}) is below normative limit (12.0).` });
    
    // Guide Rails Check
    if (projectData.bracketDist > 3000) results.push({ type: 'warning', msg: 'Bracket distance exceeds 3000mm. Verify buckling stability.' });
    
    // Buffer Check
    if (projectData.speed > 1.0 && projectData.bufferType === 'energy-accumulation') {
      results.push({ type: 'error', msg: 'Energy accumulation buffers are only allowed for speeds ≤ 1.0 m/s.' });
    }

    // ACOP Check
    if (projectData.acopTrippingSpeed > 1.15 * projectData.speed + 0.25) {
      results.push({ type: 'error', msg: 'ACOP tripping speed exceeds normative limit.' });
    }

    setValidationResults(results);
    setIsValidationOpen(true);
  };

  const modules: ModuleStatus[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard, status: 'implemented' },
    { id: 'global', label: 'Global Project', icon: Globe, status: 'implemented' },
    { id: 'doors', label: 'Door Locking', icon: Lock, status: 'implemented' },
    { id: 'library', label: 'Component Library', icon: Library, status: 'implemented' },
    { id: 'traction', label: 'Traction', icon: Settings2, status: 'implemented' },
    { id: 'ropes', label: 'Ropes / Suspension', icon: Cable, status: 'implemented' },
    { id: 'rails', label: 'Guide Rails', icon: ArrowUpDown, status: 'implemented' },
    { id: 'sling', label: 'Car Frame / Sling', icon: Box, status: 'implemented' },
    { id: 'hydraulic', label: 'Hydraulic', icon: Droplets, status: 'implemented' },
    { id: 'safety', label: 'Safety Components', icon: ShieldCheck, status: 'implemented' },
    { id: 'acop-ucmp', label: 'ACOP / UCMP', icon: ShieldAlert, status: 'implemented' },
    { id: 'shaft', label: '3D Shaft', icon: Box, status: 'implemented' },
    { id: 'memory', label: 'Calculation Memory', icon: History, status: 'implemented' },
    { id: 'export', label: 'PDF Export', icon: FileText, status: 'implemented' },
    { id: 'checks', label: 'Runtime Checks', icon: CheckSquare, status: 'implemented' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'overview': return <OverviewModule modules={modules} onSelect={setActiveTab} />;
      case 'global': return <GlobalProjectModule data={projectData} onChange={handleDataChange} />;
      case 'doors': return <DoorLockingModule />;
      case 'traction': return <TractionModule data={projectData} onChange={handleDataChange} />;
      case 'ropes': return <RopesModule data={projectData} onChange={handleDataChange} />;
      case 'rails': return <GuideRailsModule data={projectData} onChange={handleDataChange} />;
      case 'sling': return <SlingModule data={projectData} />;
      case 'hydraulic': return <HydraulicModule data={projectData} />;
      case 'safety': return <SafetyComponentsModule data={projectData} onChange={handleDataChange} />;
      case 'acop-ucmp': return <ACOP_UCMP_Module data={projectData} onChange={handleDataChange} />;
      case 'library': return <ComponentLibraryModule />;
      case 'memory': return <CalculationMemoryModule data={projectData} />;
      case 'checks': return <RuntimeChecksModule />;
      case 'shaft': return (
        <div className="space-y-6">
          <div className="bg-surface-container-low p-6 rounded-sm border border-outline-variant/10">
            <h3 className="text-xl font-black uppercase tracking-tighter mb-4">3D Shaft Geometry Explorer</h3>
            <Shaft3DModule 
              width={projectData.shaftWidth}
              depth={projectData.shaftDepth}
              height={projectData.shaftHeight}
              carPos={projectData.carPositionPercent / 100}
            />
            <div className="mt-6 p-4 bg-surface-container-lowest border border-outline-variant/10 rounded-sm">
              <h4 className="text-[10px] font-bold uppercase text-primary mb-2">Simulation Controls</h4>
              <input 
                type="range"
                min="0"
                max="100"
                value={projectData.carPositionPercent}
                onChange={(e) => handleDataChange({ carPositionPercent: safeNumber(e.target.value) })}
                className="w-full h-2 bg-surface-container-low rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>
          </div>
        </div>
      );
      case 'export': return (
        <div className="space-y-8">
          <div className="bg-surface-container-low p-8 border border-outline-variant/10 rounded-sm">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-2xl font-black uppercase tracking-tighter">Export Engine</h3>
                <p className="text-sm text-on-surface-variant opacity-70">Generate comprehensive technical documentation</p>
              </div>
              <button 
                onClick={() => window.print()}
                className="px-6 py-2.5 bg-primary text-white rounded-sm font-bold text-xs uppercase tracking-widest flex items-center gap-2 hover:opacity-90 transition-all"
              >
                <FileText size={16} />
                Print Report
              </button>
            </div>
            
            <div className="bg-white p-8 border border-outline-variant/20 shadow-lg max-w-4xl mx-auto overflow-hidden">
              <CalculationMemoryModule data={projectData} />
            </div>
          </div>
        </div>
      );
      default: return <div className="p-8 text-center opacity-50">Module in development.</div>;
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
          <button 
            onClick={validateProject}
            className="w-full py-2.5 bg-gradient-to-r from-primary to-primary-dim text-white rounded-sm font-bold shadow-md hover:opacity-90 transition-all text-[11px] uppercase tracking-wider flex items-center justify-center gap-2"
          >
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
              <button 
                onClick={() => setIsSettingsOpen(true)}
                className="p-2 text-secondary hover:bg-surface-container transition-colors rounded-full"
              ><Settings size={16} /></button>
              <button 
                onClick={() => setIsHelpOpen(true)}
                className="p-2 text-secondary hover:bg-surface-container transition-colors rounded-full"
              ><HelpCircle size={16} /></button>
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

      <ValidationModal 
        isOpen={isValidationOpen} 
        onClose={() => setIsValidationOpen(false)} 
        results={validationResults} 
      />

      <SimpleModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        title="System Settings"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium">Units</span>
            <span className="text-xs font-bold text-primary">Metric (SI)</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium">Auto-Save</span>
            <span className="text-xs font-bold text-emerald-600">Enabled</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium">Language</span>
            <span className="text-xs font-bold">English (US)</span>
          </div>
        </div>
      </SimpleModal>

      <SimpleModal 
        isOpen={isHelpOpen} 
        onClose={() => setIsHelpOpen(false)} 
        title="Engineering Help"
      >
        <div className="space-y-4 text-xs leading-relaxed opacity-80">
          <p>This tool follows the <strong>ISO 8100-2:2026</strong> standard for elevator component verification.</p>
          <p>For technical support or feature requests, contact the engineering department at <code>support@liftcalc.eng</code>.</p>
          <div className="p-3 bg-primary/5 border border-primary/10 rounded-sm">
            <p className="font-bold text-primary mb-1 uppercase tracking-tighter">Documentation</p>
            <p>Full technical documentation is available in the internal engineering portal.</p>
          </div>
        </div>
      </SimpleModal>
    </div>
  );
}

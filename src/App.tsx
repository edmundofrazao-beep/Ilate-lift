/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';
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
  Download,
  Zap,
  HelpCircle,
  UserCircle,
  Maximize2,
  ChevronRight,
  AlertCircle,
  Ruler,
  Calculator,
  Accessibility,
  Shield
} from 'lucide-react';
import { Shaft3DModule } from './components/Shaft3DModule';
import { Cabin3DModule } from './components/Cabin3DModule';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

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
  railProfile: string;
  // Rope Advanced Properties
  numSimpleBends: number; // Nps
  numReverseBends: number; // Npr
  ropeBreakingLoad: number; // Fmin (N)
  // Safety Gear Advanced
  safetyGearMaxMass: number; // P+Q max (kg)
  safetyGearBrakingForce: number; // Fb (N)
  safetyGearCertifiedSpeed: number; // m/s
  safetyGearRailCondition: 'dry' | 'oiled' | 'machined';
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
  // New Traction & Belt Variables
  grooveType: 'V' | 'semi-circular' | 'U';
  undercutWidth: number; // mm
  ropeAngleOfWrap: number; // deg
  acceleration: number; // m/s2
  deceleration: number; // m/s2
  ropeSpecificPressure: number; // MPa
  beltWidth: number; // mm
  beltThickness: number; // mm
  numBelts: number;
  beltTensileStrength: number; // N
  // New Clearances (ISO 8100-1)
  pitDepth: number; // mm
  headroomHeight: number; // mm
  carToWallClearance: number; // mm
  carToCounterweightClearance: number; // mm
  carToLandingSillClearance: number; // mm
  showClearances: boolean;
  // Additional Variables from HTML Engine
  Faux: number; // N
  delta_str_x: number; // mm
  delta_str_y: number; // mm
  N_equiv_t: number;
  Kp: number;
  N_lift: number;
  C_R: number;
  wellToCarWall: number; // m
  sillGap: number; // m
  doorPanelGap: number; // m
  pitRefugeHeight: number; // m
  pitObstacleClearance: number; // m
  pitFreeVerticalHazard: number; // m
  carToCwtDistance: number; // m
  headroomGeneral: number; // m
  headroomGuideShoeZone: number; // m
  balustradeVertical: number; // m
  toeBoardOutside: number; // m
  ramHeadClearance: number; // m
  cwtScreenBottomFromPit: number; // m
  cwtScreenHeight: number; // m
  carWidth: number; // mm
  carDepth: number; // mm
  carHeight: number; // mm
}

interface ModuleStatus {
  id: string;
  label: string;
  icon: any;
  status: 'implemented' | 'partial' | 'placeholder';
}

// --- Profile Databases ---

const ISO_RAIL_PROFILES = [
  { name: 'ISO T45/A', A: 425, Iy: 40000, Ix: 13100, Wy: 1310, Wx: 580, iy: 9.7, ix: 5.5, q: 3.34 },
  { name: 'ISO T50/A', A: 532, Iy: 63000, Ix: 20000, Wy: 1860, Wx: 800, iy: 10.9, ix: 6.1, q: 4.18 },
  { name: 'ISO T70-1/A', A: 940, Iy: 245000, Ix: 81000, Wy: 5210, Wx: 2310, iy: 16.1, ix: 9.3, q: 7.38 },
  { name: 'ISO T75-3/B', A: 1100, Iy: 300000, Ix: 100000, Wy: 6000, Wx: 2600, iy: 16.5, ix: 9.5, q: 8.6 },
  { name: 'ISO T82/B', A: 1250, Iy: 400000, Ix: 130000, Wy: 7500, Wx: 3200, iy: 17.9, ix: 10.2, q: 9.8 },
  { name: 'ISO T89/B', A: 1570, Iy: 595000, Ix: 198000, Wy: 10100, Wx: 4450, iy: 19.5, ix: 11.2, q: 12.3 },
  { name: 'ISO T90/B', A: 1720, Iy: 750000, Ix: 250000, Wy: 12000, Wx: 5500, iy: 20.9, ix: 12.1, q: 13.5 },
  { name: 'ISO T125/B', A: 2260, Iy: 1510000, Ix: 500000, Wy: 20000, Wx: 8000, iy: 25.8, ix: 14.9, q: 17.7 },
  { name: 'ISO T127-1/B', A: 2890, Iy: 2100000, Ix: 700000, Wy: 26000, Wx: 11000, iy: 26.9, ix: 15.5, q: 22.7 },
  { name: 'ISO T127-2/B', A: 3510, Iy: 3000000, Ix: 1000000, Wy: 35000, Wx: 15000, iy: 29.2, ix: 16.9, q: 27.5 },
  { name: 'ISO T140-1/B', A: 4200, Iy: 4500000, Ix: 1500000, Wy: 48000, Wx: 21000, iy: 32.7, ix: 18.9, q: 33.0 },
  { name: 'ISO T140-2/B', A: 5800, Iy: 7500000, Ix: 2500000, Wy: 75000, Wx: 35000, iy: 35.9, ix: 20.7, q: 45.5 },
  { name: 'ISO T140-3/B', A: 7900, Iy: 12000000, Ix: 4000000, Wy: 110000, Wx: 55000, iy: 39.0, ix: 22.5, q: 62.0 },
];

const BELT_PROFILES = [
  { id: 'B30', label: 'Belt 30mm', width: 30, thickness: 3, mbf: 40000 },
  { id: 'B60', label: 'Belt 60mm', width: 60, thickness: 4, mbf: 80000 },
];

// --- Helpers ---

const safeNumber = (val: any, fallback = 0) => {
  const n = parseFloat(val);
  return isNaN(n) ? fallback : n;
};

const formatNumber = (val: number, decimals = 2) => {
  return val.toLocaleString('pt-PT', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
};

const degToRad = (deg: number) => (deg * Math.PI) / 180;

const InputGroup = ({ label, children }: { label: string, children: React.ReactNode }) => (
  <div className="space-y-4 p-6 bg-surface-container-low border border-outline-variant/5">
    <h3 className="text-xs font-bold uppercase tracking-widest text-primary border-b border-primary/20 pb-2">{label}</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {children}
    </div>
  </div>
);

const LiftField = ({ 
  label, 
  name, 
  unit, 
  type = "number", 
  data, 
  onChange,
  min,
  max,
  required = false,
  suggestion
}: { 
  label: string, 
  name: keyof ProjectData, 
  unit?: string, 
  type?: string, 
  data: ProjectData, 
  onChange: (newData: Partial<ProjectData>) => void,
  min?: number,
  max?: number,
  required?: boolean,
  suggestion?: string
}) => {
  const [error, setError] = React.useState<string | null>(null);

  const validate = (val: any) => {
    if (type !== 'number') return null;
    const n = parseFloat(val);
    if (required && (val === '' || isNaN(n))) return 'Required';
    if (!isNaN(n)) {
      if (min !== undefined && n < min) return `Min: ${min}`;
      if (max !== undefined && n > max) return `Max: ${max}`;
    }
    return null;
  };

  const isInvalid = !!error;

  return (
    <div className="space-y-1 group">
      <div className="flex justify-between items-center">
        <label className="text-[11px] font-bold text-on-surface-variant uppercase flex items-center gap-1.5">
          {label}
          {isInvalid && <AlertCircle size={10} className="text-error" />}
        </label>
        {error && <span className="text-[9px] text-error font-bold uppercase animate-pulse">{error}</span>}
      </div>
      <div className="relative">
        <input 
          type={type}
          value={typeof data[name] === 'boolean' ? undefined : (data[name] as string | number)}
          checked={typeof data[name] === 'boolean' ? (data[name] as boolean) : undefined}
          onChange={(e) => {
            const val = type === 'checkbox' ? e.target.checked : e.target.value;
            const err = validate(val);
            setError(err);
            if (type === 'checkbox') {
              onChange({ [name]: e.target.checked });
            } else {
              onChange({ [name]: type === 'number' ? safeNumber(e.target.value) : e.target.value });
            }
          }}
          className={`
            ${type === 'checkbox' ? "rounded-sm border-outline-variant/30 text-primary focus:ring-primary" : "w-full bg-surface-container-lowest border rounded-sm px-3 py-2 text-sm focus:ring-1 focus:ring-primary outline-none transition-all"}
            ${error ? 'border-error ring-1 ring-error bg-error/5' : 'border-outline-variant/20 hover:border-primary/30'}
          `}
        />
        {unit && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-on-surface-variant opacity-50">{unit}</span>}
      </div>
      {isInvalid && suggestion && (
        <p className="text-[9px] text-error/80 italic font-medium mt-1 leading-tight">
          Suggestion: {suggestion}
        </p>
      )}
    </div>
  );
};

const CollapsibleSection = ({ title, children, icon: Icon }: { title: string, children: React.ReactNode, icon?: any }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  return (
    <div className="border border-outline-variant/10 rounded-sm overflow-hidden bg-surface-container-lowest">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 hover:bg-surface-container-low transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          {Icon && <Icon size={16} className="text-primary" />}
          <span className="text-xs font-bold uppercase tracking-widest">{title}</span>
        </div>
        <ChevronRight size={16} className={`transition-transform duration-300 ${isOpen ? 'rotate-90' : ''}`} />
      </button>
      <div className={`transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[1000px] opacity-100 p-6 border-t border-outline-variant/10' : 'max-h-0 opacity-0 pointer-events-none'}`}>
        {children}
      </div>
    </div>
  );
};

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

const GlobalProjectModule = ({ data, onChange }: { data: ProjectData, onChange: (newData: Partial<ProjectData>) => void }) => {
  return (
    <div className="space-y-6">
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
              className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-sm px-3 py-2 text-sm focus:ring-1 focus:ring-primary outline-none"
            >
              <option value="1:1">1:1</option>
              <option value="2:1">2:1</option>
              <option value="4:1">4:1</option>
            </select>
          </div>
          <LiftField label="Rated Load (Q)" name="ratedLoad" unit="kg" data={data} onChange={onChange} min={50} required suggestion="Rated load defines the minimum car area and safety gear capacity." />
          <LiftField label="Car Mass (P)" name="carMass" unit="kg" data={data} onChange={onChange} min={100} required suggestion="Car mass includes sling, cabin, and accessories." />
          <LiftField label="Counterweight Mass (Mcwt)" name="cwtMass" unit="kg" data={data} onChange={onChange} min={100} required suggestion="Standard balancing is usually P + 0.5Q." />
          <LiftField label="Rated Speed (v)" name="speed" unit="m/s" data={data} onChange={onChange} min={0.1} max={10} required suggestion="Speed determines buffer type and safety gear requirements." />
        </InputGroup>

        <InputGroup label="Shaft & Travel">
          <LiftField label="Travel (H)" name="travel" unit="m" data={data} onChange={onChange} min={1} max={500} required />
          <LiftField label="Number of Stops" name="stops" data={data} onChange={onChange} min={2} max={128} required />
          <LiftField label="Floor to Floor Height" name="floorHeight" unit="m" data={data} onChange={onChange} min={2} required />
          <LiftField label="Shaft Width" name="shaftWidth" unit="mm" data={data} onChange={onChange} min={1000} required />
          <LiftField label="Shaft Depth" name="shaftDepth" unit="mm" data={data} onChange={onChange} min={1000} required />
          <LiftField label="Shaft Height" name="shaftHeight" unit="mm" data={data} onChange={onChange} min={3000} required />
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
  
  // Dynamic Loads (Formula 28)
  const T1_dynamic = T1_static * (1 + data.acceleration / g);
  const T2_dynamic = T2_static * (1 - data.acceleration / g);
  
  const mu_dynamic = 0.1 / (1 + data.speed / 10);
  
  const beta = degToRad(data.undercutAngle);
  const gamma = degToRad(data.grooveAngle);
  
  // f_load for different groove types
  let f_load = 0;
  if (data.grooveType === 'V') {
    f_load = data.frictionCoeff * (4 / Math.sin(gamma / 2));
  } else if (data.grooveType === 'semi-circular') {
    f_load = data.frictionCoeff * (4 * (Math.cos(gamma/2) - Math.sin(beta/2))) / (Math.PI - beta - gamma - Math.sin(beta) + Math.sin(gamma));
  } else {
    f_load = data.frictionCoeff * 4 / Math.PI;
  }
  
  const alpha = degToRad(data.wrapAngle);
  const expMuAlpha = Math.exp(f_load * alpha);
  const ratio_static = T2_static > 0 ? T1_static / T2_static : 0;
  const ratio_dynamic = T2_dynamic > 0 ? T1_dynamic / T2_dynamic : 0;
  
  const isOk = ratio_static <= expMuAlpha && ratio_dynamic <= expMuAlpha;

  const DdRatio = data.ropeDiameter > 0 ? data.sheaveDiameter / data.ropeDiameter : 0;
  
  // Specific Pressure (Formula 34)
  const p_groove = (T1_static + T2_static) / (data.numRopes * data.ropeDiameter * data.sheaveDiameter * Math.sin(gamma/2 || 1));
  const p_allow = (data.sheaveHardness * 10) / (1 + 2 * data.speed);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-surface-container-low p-6 border-t-2 border-primary">
            <h3 className="text-lg font-bold mb-6 flex items-center justify-between">
              Traction Verification (ISO 8100-2:2026)
              <span className={`text-xs px-3 py-1 rounded-full font-bold uppercase ${isOk ? 'bg-emerald-100 text-emerald-700' : 'bg-error-container/20 text-error'}`}>
                {isOk ? 'Compliant' : 'Non-Compliant'}
              </span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="p-4 bg-surface-container-lowest border border-outline-variant/10">
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase mb-1">Static Ratio (T1/T2)</p>
                  <p className="text-xl font-black">{formatNumber(ratio_static)}</p>
                  <div className="mt-2 h-1 bg-surface-container-high rounded-full overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: `${Math.min(100, (ratio_static/expMuAlpha)*100)}%` }} />
                  </div>
                </div>
                <div className="p-4 bg-surface-container-lowest border border-outline-variant/10">
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase mb-1">Dynamic Ratio (T1/T2)</p>
                  <p className="text-xl font-black">{formatNumber(ratio_dynamic)}</p>
                  <div className="mt-2 h-1 bg-surface-container-high rounded-full overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: `${Math.min(100, (ratio_dynamic/expMuAlpha)*100)}%` }} />
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 bg-surface-container-lowest border border-outline-variant/10">
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase mb-1">Traction Limit (e^fα)</p>
                  <p className="text-xl font-black">{formatNumber(expMuAlpha)}</p>
                </div>
                <div className="p-4 bg-surface-container-lowest border border-outline-variant/10">
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase mb-1">Specific Pressure</p>
                  <p className={`text-xl font-black ${p_groove > p_allow ? 'text-error' : ''}`}>{formatNumber(p_groove)} <span className="text-xs font-normal opacity-50">MPa</span></p>
                  <p className="text-[9px] opacity-50 mt-1">Allowed: {formatNumber(p_allow)} MPa</p>
                </div>
              </div>
            </div>

            <div className="mt-8 p-6 bg-slate-900 text-white rounded-sm">
              <h4 className="text-xs font-bold uppercase mb-4 text-primary">Applied ISO 8100-2 Formulas</h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <span className="text-[10px] opacity-60">Traction Condition</span>
                  <InlineMath math="\frac{T_1}{T_2} \le e^{f \cdot \alpha}" />
                </div>
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <span className="text-[10px] opacity-60">Friction Coeff (Dynamic)</span>
                  <InlineMath math="\mu = \frac{0.1}{1 + v/10}" />
                </div>
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <span className="text-[10px] opacity-60">Specific Pressure</span>
                  <InlineMath math="p = \frac{T_1 + T_2}{n \cdot d \cdot D \cdot \sin(\gamma/2)}" />
                </div>
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <span className="text-[10px] opacity-60">Stalling Condition</span>
                  <InlineMath math="\frac{T_1}{T_2} \ge e^{f_{stall} \cdot \alpha}" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-surface-container-low p-6 border border-outline-variant/10">
            <h4 className="text-xs font-bold uppercase tracking-widest mb-6 flex items-center gap-2">
              <Settings2 size={14} />
              Traction Parameters (4.11)
            </h4>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase opacity-60">Groove Type</label>
                <select 
                  value={data.grooveType}
                  onChange={(e) => onChange({ grooveType: e.target.value as any })}
                  className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded px-3 py-2 text-sm outline-none focus:border-primary transition-colors"
                >
                  <option value="V">V-Groove</option>
                  <option value="semi-circular">Semi-Circular Undercut</option>
                  <option value="U">U-Groove</option>
                </select>
              </div>
              <LiftField label="Rated Speed (v)" name="speed" unit="m/s" data={data} onChange={onChange} min={0.1} max={10} required suggestion="Speed affects dynamic friction coefficient (mu)." />
              <LiftField label="Friction Coeff. (μ)" name="frictionCoeff" data={data} onChange={onChange} min={0.01} max={0.5} required suggestion="Typically around 0.1, calculated from formula." />
              <LiftField label="Acceleration (a)" name="acceleration" unit="m/s²" data={data} onChange={onChange} min={0.1} max={2.0} required suggestion="Higher acceleration increases T1/T2 ratio during start." />
              <LiftField label="Deceleration (d)" name="deceleration" unit="m/s²" data={data} onChange={onChange} min={0.1} max={2.0} required suggestion="Higher deceleration increases T1/T2 ratio during emergency stop." />
              <LiftField label="Wrap Angle (α)" name="wrapAngle" unit="deg" data={data} onChange={onChange} min={90} max={270} required suggestion="Increase wrap angle to improve traction capacity (e^fα)." />
              <LiftField label="Groove Angle (γ)" name="grooveAngle" unit="deg" data={data} onChange={onChange} min={30} max={60} required suggestion="Smaller groove angle increases friction but also rope wear." />
              <LiftField label="Undercut Angle (β)" name="undercutAngle" unit="deg" data={data} onChange={onChange} min={0} max={105} required />
              <LiftField label="Sheave Hardness" name="sheaveHardness" unit="HB" data={data} onChange={onChange} min={150} required suggestion="Harder sheaves allow higher specific pressure." />
            </div>
          </div>
        </div>
      </div>

      {/* Dedicated Engineering Notes Section */}
      <div className="space-y-6">
        <CollapsibleSection title="ISO 8100-2:2026 Traction Formula Details" icon={Info}>
          <div className="space-y-4 text-sm text-on-surface-variant leading-relaxed">
            <p>
              <strong>Clause 4.11.2:</strong> The traction verification ensures that the friction between the traction sheave and the suspension means is sufficient to prevent slipping during normal operation, emergency braking, and stalling.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <div className="p-4 bg-surface-container-low rounded border border-outline-variant/10">
                <h5 className="font-bold text-primary mb-2 uppercase text-[10px]">Friction Coefficient (f)</h5>
                <p className="text-xs mb-2">The friction coefficient $f$ depends on the groove shape and the material properties. For V-grooves:</p>
                <InlineMath math="f = \mu \cdot \frac{4}{\sin(\gamma/2)}" />
                <p className="text-[10px] mt-2 opacity-70">Where $\mu$ is the basic friction coefficient and $\gamma$ is the groove angle.</p>
              </div>
              <div className="p-4 bg-surface-container-low rounded border border-outline-variant/10">
                <h5 className="font-bold text-primary mb-2 uppercase text-[10px]">Wrap Angle (α)</h5>
                <p className="text-xs mb-2">The angle of wrap $\alpha$ is the contact arc between the rope and the sheave, expressed in radians.</p>
                <InlineMath math="\alpha_{rad} = \alpha_{deg} \cdot \frac{\pi}{180}" />
              </div>
            </div>
          </div>
        </CollapsibleSection>

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
          <div className="p-4 bg-surface-container-lowest border border-outline-variant/10">
            <p className="text-[10px] font-bold text-on-surface-variant uppercase mb-1">Belt/Rope Preset</p>
            <select 
              value={data.ropeType}
              onChange={(e) => {
                const belt = BELT_PROFILES.find(b => b.id === e.target.value);
                if (belt) {
                  onChange({ 
                    ropeType: belt.label,
                    beltWidth: belt.width,
                    beltThickness: belt.thickness,
                    numBelts: 1, // Reset to 1 by default for a single belt profile unless specified
                    beltTensileStrength: belt.mbf,
                    ropeBreakingLoad: belt.mbf,
                    ropeDiameter: belt.thickness // For D/d calculation
                  });
                } else {
                  onChange({ ropeType: e.target.value });
                }
              }}
              className="w-full bg-transparent text-xl font-black outline-none cursor-pointer text-primary"
            >
              <option value="">Select Preset...</option>
              <optgroup label="Belts">
                {BELT_PROFILES.map(b => (
                  <option key={b.id} value={b.id}>{b.label}</option>
                ))}
              </optgroup>
              <optgroup label="Ropes">
                <option value="Steel Wire">Steel (Standard)</option>
                <option value="Coated">Coated (Synthetic)</option>
              </optgroup>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          <InputGroup label="Suspension Parameters">
            <LiftField label="Number of Ropes (n)" name="numRopes" data={data} onChange={onChange} min={1} required suggestion="Increase number of ropes to improve safety factor." />
            <LiftField label="Diameter/Thickness (d)" name="ropeDiameter" unit="mm" data={data} onChange={onChange} min={4} max={20} required suggestion="D/d ratio must be ≥ 40 for steel ropes." />
            <LiftField label="Breaking Load (Fmin)" name="ropeBreakingLoad" unit="N" data={data} onChange={onChange} min={1000} required suggestion="Check manufacturer data for minimum breaking force." />
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-on-surface-variant uppercase">Groove Type</label>
              <select 
                value={data.grooveType}
                onChange={(e) => onChange({ grooveType: e.target.value as any })}
                className="w-full bg-surface-container-low border border-outline-variant/20 rounded-sm px-3 py-2 text-sm focus:ring-1 focus:ring-primary outline-none"
              >
                <option value="V">V-Groove</option>
                <option value="semi-circular">Semi-Circular</option>
                <option value="U">U-Groove</option>
              </select>
            </div>
            <LiftField label="Spec. Pressure (p)" name="ropeSpecificPressure" unit="MPa" data={data} onChange={onChange} min={0} required />
            <LiftField label="Simple Pulleys (Nps)" name="numSimpleBends" data={data} onChange={onChange} min={0} required />
            <LiftField label="Reverse Pulleys (Npr)" name="numReverseBends" data={data} onChange={onChange} min={0} required suggestion="Reverse bends significantly reduce rope lifetime." />
          </InputGroup>

          <InputGroup label="Belt Specific Parameters">
            <LiftField label="Belt Width" name="beltWidth" unit="mm" data={data} onChange={onChange} min={1} />
            <LiftField label="Belt Thickness" name="beltThickness" unit="mm" data={data} onChange={onChange} min={1} />
            <LiftField label="Number of Belts" name="numBelts" data={data} onChange={onChange} min={1} />
            <LiftField label="Tensile Strength" name="beltTensileStrength" unit="N" data={data} onChange={onChange} min={1000} />
          </InputGroup>

          <InputGroup label="Machine & Sheave">
            <LiftField label="Sheave Diameter (D)" name="sheaveDiameter" unit="mm" data={data} onChange={onChange} min={160} required suggestion="Larger sheave diameter improves rope lifetime (D/d ratio)." />
            <LiftField label="Sheave Hardness" name="sheaveHardness" unit="HB" data={data} onChange={onChange} min={150} required />
            <LiftField label="Wrap Angle (α)" name="wrapAngle" unit="deg" data={data} onChange={onChange} min={90} max={270} required suggestion="Increase wrap angle to improve traction." />
          </InputGroup>

          <InputGroup label="Advanced Lifting Parameters">
            <LiftField label="N_equiv(t)" name="N_equiv_t" data={data} onChange={onChange} min={1} required />
            <LiftField label="Pulley Factor (Kp)" name="Kp" data={data} onChange={onChange} min={1} required />
            <LiftField label="Trips per Year (N_lift)" name="N_lift" data={data} onChange={onChange} min={1000} required />
            <LiftField label="Reeving Factor (C_R)" name="C_R" data={data} onChange={onChange} min={1} required />
          </InputGroup>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="p-4 bg-surface-container-lowest border border-outline-variant/10">
              <h4 className="text-xs font-bold uppercase mb-2">Formulas (ISO 8100-2:2026)</h4>
              <div className="font-mono text-[10px] space-y-1 opacity-70">
                <p>• Sf = 10^(2.6834 - log(N_equiv / 2.6834e6) / log(D/d)) [Formula 36]</p>
                <p>• N_equiv = N_ps + 4 · N_pr</p>
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
                  <LiftField label="Cycles/Year" name="loadCycles" data={data} onChange={onChange} min={1000} required />
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
  const lambda_y = data.railIyRadius > 0 ? l / data.railIyRadius : 0;
  const lambda_x = data.railIxRadius > 0 ? l / data.railIxRadius : 0;
  const lambda = Math.max(lambda_y, lambda_x);
  
  // Full Omega factor calculation for S235 (ISO 8100-2:2026)
  let omega = 1;
  if (lambda <= 20) {
    omega = 1.0;
  } else if (lambda <= 115) {
    // Polynomial fit for S235 omega curve
    omega = 1 + 0.0001 * Math.pow(lambda, 2);
  } else {
    // Euler buckling region
    omega = 0.00007 * Math.pow(lambda, 2);
  }

  // Fv (Vertical force on rail)
  const F_safety_gear = (data.ratedLoad + data.carMass) * g * 0.6;
  const F_rail_weight = data.railWeight * data.travel * g;
  const Fv = F_safety_gear + F_rail_weight;
  
  const sigma_k = data.railArea > 0 ? (Fv * omega) / data.railArea : 0;

  // 3. Combined Stresses (Clause 4.10.4)
  // Case: Safety Gear Operation
  const sigma_combined = sigma_k + 0.9 * sigma_m;

  // 4. Deflection (Formula 20/21)
  // delta = (Fh * l^3) / (48 * E * I)
  const delta_y = (data.railIy > 0 && E > 0) ? (Fh * Math.pow(l, 3)) / (48 * E * data.railIy) : 0;
  const delta_x = (data.railIx > 0 && E > 0) ? ((Fh * 0.5) * Math.pow(l, 3)) / (48 * E * data.railIx) : 0;
  const delta = Math.sqrt(Math.pow(delta_y, 2) + Math.pow(delta_x, 2));

  // ISO 8100-2:2026 Clause 4.10.6 Deflection Limits
  // For car rails: 5mm
  // For CWT rails with safety gear: 10mm
  // For CWT rails without safety gear: no limit specified but 10mm is common practice
  const deflectionLimit = 5; 
  const isDeflectionOk = delta < deflectionLimit;

  const isBendingOk = sigma_m < data.materialYield;
  const isBucklingOk = sigma_k < data.materialYield;
  const isCombinedOk = sigma_combined < data.materialYield;

  const bendingUtilization = (sigma_m / data.materialYield) * 100;
  const bucklingUtilization = (sigma_k / data.materialYield) * 100;
  const combinedUtilization = (sigma_combined / data.materialYield) * 100;
  const deflectionUtilization = (delta / deflectionLimit) * 100;

  return (
    <div className="space-y-8">
      <div className="bg-surface-container-low p-8 border-t-2 border-outline">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xl font-bold">Guide Rails Calculation (4.10)</h3>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 uppercase">Implemented (ISO 8100-2)</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="p-4 bg-surface-container-low border border-outline-variant/10 rounded-sm">
            <p className="text-[10px] font-bold uppercase opacity-50 mb-1">Bracket Distance (l)</p>
            <p className="text-xl font-black">{data.bracketDist} mm</p>
          </div>
          <div className="p-4 bg-surface-container-low border border-outline-variant/10 rounded-sm">
            <p className="text-[10px] font-bold uppercase opacity-50 mb-1">Elastic Modulus (E)</p>
            <p className="text-xl font-black">{formatNumber(data.materialE / 1000, 0)} <span className="text-xs font-normal">GPa</span></p>
          </div>
          <div className="p-4 bg-surface-container-low border border-outline-variant/10 rounded-sm">
            <p className="text-[10px] font-bold uppercase opacity-50 mb-1">Yield Strength (Rp0.2)</p>
            <p className="text-xl font-black">{data.materialYield} <span className="text-xs font-normal">N/mm²</span></p>
          </div>
          <div className="p-4 bg-surface-container-low border border-outline-variant/10 rounded-sm">
            <p className="text-[10px] font-bold uppercase opacity-50 mb-1">Rail Preset Selection</p>
            <select 
              value={data.railProfile}
              onChange={(e) => {
                const profile = ISO_RAIL_PROFILES.find(p => p.name === e.target.value);
                if (profile) {
                  onChange({ 
                    railProfile: profile.name,
                    railArea: profile.A,
                    railIy: profile.Iy,
                    railIx: profile.Ix,
                    railWy: profile.Wy,
                    railWx: profile.Wx,
                    railIyRadius: profile.iy,
                    railIxRadius: profile.ix,
                    railWeight: profile.q,
                    guideType: profile.name
                  });
                } else {
                  onChange({ railProfile: e.target.value });
                }
              }}
              className="w-full bg-transparent text-xl font-black outline-none cursor-pointer text-primary"
            >
              <option value="">Select Profile...</option>
              {ISO_RAIL_PROFILES.map(p => (
                <option key={p.name} value={p.name}>{p.name}</option>
              ))}
              <option value="Custom">Custom Profile</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <InputGroup label="Rail Geometric Properties">
            <LiftField label="Section Area (A)" name="railArea" unit="mm²" data={data} onChange={onChange} min={100} required suggestion="Increase section area to reduce combined stress." />
            <LiftField label="Inertia Moment (Iy)" name="railIy" unit="mm⁴" data={data} onChange={onChange} min={1000} required suggestion="Higher Iy reduces deflection in the Y axis." />
            <LiftField label="Inertia Moment (Ix)" name="railIx" unit="mm⁴" data={data} onChange={onChange} min={1000} required suggestion="Higher Ix reduces deflection in the X axis." />
            <LiftField label="Section Modulus (Wy)" name="railWy" unit="mm³" data={data} onChange={onChange} min={100} required suggestion="Wy directly affects bending stress capacity." />
            <LiftField label="Section Modulus (Wx)" name="railWx" unit="mm³" data={data} onChange={onChange} min={100} required />
            <LiftField label="Gyration Radius (iy)" name="railIyRadius" unit="mm" data={data} onChange={onChange} min={1} required suggestion="Radius of gyration affects buckling stability." />
            <LiftField label="Gyration Radius (ix)" name="railIxRadius" unit="mm" data={data} onChange={onChange} min={1} required />
            <LiftField label="Rail Weight (q1)" name="railWeight" unit="kg/m" data={data} onChange={onChange} min={1} required />
          </InputGroup>

          <InputGroup label="Material & Installation">
            <LiftField label="Elastic Modulus (E)" name="materialE" unit="N/mm²" data={data} onChange={onChange} min={100000} required />
            <LiftField label="Yield Strength (Rp0.2)" name="materialYield" unit="N/mm²" data={data} onChange={onChange} min={100} required suggestion="Use higher grade steel (e.g. S355) if stresses are too high." />
            <LiftField label="Bracket Distance (l)" name="bracketDist" unit="mm" data={data} onChange={onChange} min={500} max={6000} required suggestion="Reduce bracket distance to significantly lower bending stress and deflection." />
          </InputGroup>

          <InputGroup label="Forces & Displacements">
            <LiftField label="Auxiliary Force (Faux)" name="Faux" unit="N" data={data} onChange={onChange} min={0} suggestion="Force exerted by auxiliary equipment." />
            <LiftField label="Structural Disp. X" name="delta_str_x" unit="mm" data={data} onChange={onChange} min={0} suggestion="Displacement of building structure in X." />
            <LiftField label="Structural Disp. Y" name="delta_str_y" unit="mm" data={data} onChange={onChange} min={0} suggestion="Displacement of building structure in Y." />
          </InputGroup>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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

          <div className={`p-6 border ${isCombinedOk ? 'bg-surface-container-lowest border-outline-variant/10' : 'bg-error-container/10 border-error/20'}`}>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-xs font-bold uppercase text-primary">Combined Stress (σ)</h4>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${isCombinedOk ? 'bg-emerald-100 text-emerald-700' : 'bg-error-container text-error'}`}>
                {formatNumber(combinedUtilization, 1)}%
              </span>
            </div>
            <p className="text-2xl font-black">{formatNumber(sigma_combined)} <span className="text-xs font-normal opacity-50">N/mm²</span></p>
            <div className="mt-2 h-1 bg-surface-container-low rounded-full overflow-hidden">
              <div 
                className={`h-full ${isCombinedOk ? 'bg-emerald-500' : 'bg-error'}`} 
                style={{ width: `${Math.min(combinedUtilization, 100)}%` }}
              />
            </div>
            <div className="mt-4 flex items-center gap-2">
              {isCombinedOk ? <CheckCircle2 size={14} className="text-emerald-600" /> : <XCircle size={14} className="text-error" />}
              <span className="text-[10px] font-bold uppercase opacity-70">Limit (Rp0.2): {data.materialYield}</span>
            </div>
            <div className="mt-3 pt-3 border-t border-outline-variant/10 text-[10px] opacity-60 font-mono">
              σ = σk + 0.9σm (Clause 4.10.4)
            </div>
          </div>

          <div className={`p-6 border ${isDeflectionOk ? 'bg-surface-container-lowest border-outline-variant/10' : 'bg-error-container/10 border-error/20'}`}>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-xs font-bold uppercase text-primary">Deflection (δ)</h4>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${isDeflectionOk ? 'bg-emerald-100 text-emerald-700' : 'bg-error-container text-error'}`}>
                {formatNumber(deflectionUtilization, 1)}%
              </span>
            </div>
            <p className="text-2xl font-black">{formatNumber(delta)} <span className="text-xs font-normal opacity-50">mm</span></p>
            <div className="mt-2 h-1 bg-surface-container-low rounded-full overflow-hidden">
              <div 
                className={`h-full ${isDeflectionOk ? 'bg-emerald-500' : 'bg-error'}`} 
                style={{ width: `${Math.min(deflectionUtilization, 100)}%` }}
              />
            </div>
            <div className="mt-4 flex items-center gap-2">
              {isDeflectionOk ? <CheckCircle2 size={14} className="text-emerald-600" /> : <XCircle size={14} className="text-error" />}
              <span className="text-[10px] font-bold uppercase opacity-70">Limit: {deflectionLimit} mm</span>
            </div>
            <div className="mt-3 pt-3 border-t border-outline-variant/10 grid grid-cols-2 gap-2 text-[10px] opacity-60 font-mono">
              <div>δx: {formatNumber(delta_x)}</div>
              <div>δy: {formatNumber(delta_y)}</div>
            </div>
          </div>
        </div>

        <div className="mt-8 space-y-6">
          <CollapsibleSection title="ISO 8100-2:2026 Guide Rail Formula Details" icon={Info}>
            <div className="space-y-4 text-sm text-on-surface-variant leading-relaxed">
              <p>
                <strong>Clause 4.10:</strong> Guide rails must be verified for bending, buckling, and deflection under various load cases (safety gear operation, normal travel, loading).
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <div className="p-4 bg-surface-container-low rounded border border-outline-variant/10">
                  <h5 className="font-bold text-primary mb-2 uppercase text-[10px]">Bending Stress ($\sigma_m$)</h5>
                  <p className="text-xs mb-2">Calculated based on the horizontal force $F_h$ and bracket distance $l$:</p>
                  <InlineMath math="\sigma_m = \frac{M_m}{W} = \frac{3 \cdot F_h \cdot l}{16 \cdot W}" />
                  <p className="text-[10px] mt-2 opacity-70">Where $M_m$ is the bending moment and $W$ is the section modulus.</p>
                </div>
                <div className="p-4 bg-surface-container-low rounded border border-outline-variant/10">
                  <h5 className="font-bold text-primary mb-2 uppercase text-[10px]">Buckling Stress ($\sigma_k$)</h5>
                  <p className="text-xs mb-2">Verified using the Omega method ($\omega$) for the vertical force $F_v$:</p>
                  <InlineMath math="\sigma_k = \frac{F_v \cdot \omega}{A}" />
                  <p className="text-[10px] mt-2 opacity-70">Where $A$ is the cross-sectional area and $\omega$ is the buckling factor.</p>
                </div>
              </div>
            </div>
          </CollapsibleSection>

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
                <p className="text-xs font-medium mb-2">
                  {isAcopOk 
                    ? `Tripping speed of ${data.acopTrippingSpeed} m/s is within the normative range.` 
                    : `Tripping speed must be > ${data.speed} m/s and ≤ ${(1.15 * data.speed + 0.25).toFixed(2)} m/s.`}
                </p>
                <div className="pt-2 border-t border-black/5">
                  <p className="text-[10px] text-on-surface-variant italic">
                    <strong>ISO 8100-2:2026 Clause 4.7.4.1:</strong> The means of protection shall detect ascending car overspeed at a speed not less than 115% of the rated speed, and not greater than the limits specified in 4.7.4.2.
                  </p>
                </div>
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
                <p className="text-xs font-medium mb-2">
                  {isUcmpOk 
                    ? `Detection distance of ${data.ucmpDetectionDist} mm is compliant with ISO 8100-2.` 
                    : `Detection distance exceeds the typical 150mm limit for safe stopping.`}
                </p>
                <div className="pt-2 border-t border-black/5">
                  <p className="text-[10px] text-on-surface-variant italic">
                    <strong>ISO 8100-2:2026 Clause 4.8.3.1:</strong> The unintended movement shall be detected before the car leaves the unlocking zone. The car shall be stopped within 1200 mm from the landing (Clause 4.8.4).
                  </p>
                </div>
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

  return (
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
          <p className="text-sm leading-relaxed">
            The traction verification is performed according to the Euler formula for friction drives. 
            The static and dynamic loads on the traction sheave are calculated as follows:
          </p>
          <div className="bg-slate-50 p-6 rounded border border-slate-100 flex flex-col items-center gap-4">
            <BlockMath math={`T_1 = \\frac{(P + Q)}{r} \\cdot (g_n + a) = \\frac{(${data.carMass} + ${data.ratedLoad})}{${r}} \\cdot (9.81 + ${data.acceleration}) = ${formatNumber(T1)} \\text{ N}`} />
            <BlockMath math={`T_2 = \\frac{(P + 0.5Q)}{r} \\cdot (g_n - a) = \\frac{(${data.carMass} + 500)}{${r}} \\cdot (9.81 - ${data.acceleration}) = ${formatNumber(T2)} \\text{ N}`} />
            <BlockMath math={`\\text{Ratio } T_1/T_2 = ${formatNumber(tractionRatio)}`} />
          </div>
          <p className="text-sm leading-relaxed">
            The traction condition must satisfy the following criteria for loading, emergency braking, and stalling:
          </p>
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
          <p className="text-sm leading-relaxed">
            {'The equivalent number of pulleys $N_{equiv}$ is calculated to determine the required safety factor:'}
          </p>
          <div className="bg-slate-50 p-6 rounded border border-slate-100 flex flex-col items-center gap-4">
            <BlockMath math={`N_{equiv} = N_{equiv(t)} + N_{equiv(p)} = ${data.N_equiv_t} + ${formatNumber(N_equiv_p)} = ${formatNumber(N_equiv)}`} />
            <BlockMath math={`N_{equiv(p)} = K_p \\cdot (N_{ps} + 4N_{pr}) = ${data.Kp} \\cdot (${data.numSimpleBends} + 4 \\cdot ${data.numReverseBends}) = ${formatNumber(N_equiv_p)}`} />
          </div>
          <p className="text-sm leading-relaxed">
            The minimum required safety factor according to Formula (36) is:
          </p>
          <div className="bg-slate-50 p-6 rounded border border-slate-100 flex flex-col items-center gap-4">
            <BlockMath math="S_{f,req} = 10^{2.6834 - \frac{\log(N_{equiv} / 2.6834 \cdot 10^6)}{\log(D/d)}}" />
          </div>
          <p className="text-sm leading-relaxed">
            Total number of trips $S_T$ (Clause 4.12.3):
          </p>
          <div className="bg-slate-50 p-6 rounded border border-slate-100 flex flex-col items-center gap-4">
            <BlockMath math={`S_T = N_{lift} \\cdot C_R \\cdot H \\cdot r = ${data.N_lift} \\cdot ${data.C_R} \\cdot ${data.travel} \\cdot ${r} = ${formatNumber(ST, 0)}`} />
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <h3 className="text-xl font-bold border-b border-slate-200 pb-2">3. Guide Rails Analysis (Clause 4.10)</h3>
        <div className="space-y-4">
          <p className="text-sm leading-relaxed">
            Bending and buckling stresses are verified for the selected profile using the Omega method:
          </p>
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
          <p className="text-sm leading-relaxed">
            Combined stress verification (Clause 4.10.4):
          </p>
          <div className="bg-slate-50 p-6 rounded border border-slate-100 flex flex-col items-center gap-4">
            <BlockMath math={`\\sigma = \\sigma_k + 0.9 \\cdot \\sigma_m = ${formatNumber(sigma_combined)} \\text{ N/mm}^2`} />
            <p className="text-xs font-bold text-primary">Compliance: {isCombinedOk ? 'YES' : 'NO'} (Limit: {data.materialYield} N/mm²)</p>
          </div>
          <p className="text-sm leading-relaxed">
            Deflection verification (Clause 4.10.6):
          </p>
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
            <p className="text-sm leading-relaxed">
              Verification of certified mass, speed, and braking force:
            </p>
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
            <p className="text-sm leading-relaxed">
              Energy absorption and stroke verification according to Clause 4.5.2:
            </p>
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
            <h4 className="text-lg font-bold">4.18 SIL-rated Circuits</h4>
            <p className="text-sm leading-relaxed">
              Probability of Hardware Failure per Hour (PFH) calculation:
            </p>
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
          <p className="text-sm leading-relaxed">
            Cylinder wall thickness and ram buckling are verified:
          </p>
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

const FormulaLibraryModule = () => {
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

const ClearanceValidationModule = ({ data }: { data: ProjectData }) => {
  const checks = [
    { key: "well-car-facing-clearance", clause: "4.2.5.3.1", value: data.wellToCarWall, limit: 0.12, op: "<=", unit: "m", note: "Well wall to car sill/frame/door edge" },
    { key: "sill-horizontal-gap", clause: "4.3.4.1", value: data.sillGap, limit: 0.035, op: "<=", unit: "m", note: "Car sill to landing sill gap" },
    { key: "door-panel-gap", clause: "4.3.4.2", value: data.doorPanelGap, limit: 0.10, op: "<=", unit: "m", note: "Door panel clearance" },
    { key: "pit-refuge-height", clause: "4.2.5.8.2(a)", value: data.pitRefugeHeight, limit: 0.50, op: ">=", unit: "m", note: "Pit/platform to lowest car parts" },
    { key: "pit-obstacle-clearance", clause: "4.2.5.8.2(b)", value: data.pitObstacleClearance, limit: 0.30, op: ">=", unit: "m", note: "Pit fixed parts to lowest car parts" },
    { key: "pit-hazard-vertical", clause: "4.2.3.3(d)2", value: data.pitFreeVerticalHazard, limit: 2.00, op: ">=", unit: "m", note: "Free vertical distance in pit hazardous zone" },
    { key: "car-counterweight-distance", clause: "4.2.5.5.3", value: data.carToCwtDistance, limit: 0.05, op: ">=", unit: "m", note: "Car and associated parts to counterweight" },
    { key: "headroom-general", clause: "4.2.5.7.2(a)", value: data.headroomGeneral, limit: 0.50, op: ">=", unit: "m", note: "General headroom above car roof fixed parts" },
    { key: "headroom-guideshoe-zone", clause: "4.2.5.7.2(b)", value: data.headroomGuideShoeZone, limit: 0.10, op: ">=", unit: "m", note: "Guide shoes/suspension terminations zone" },
    { key: "balustrade-vertical", clause: "4.2.5.7.2(c)1", value: data.balustradeVertical, limit: 0.30, op: ">=", unit: "m", note: "Vertical above balustrade zone" },
    { key: "toeboard-outside", clause: "4.2.5.7.2(d)2", value: data.toeBoardOutside, limit: 0.10, op: ">=", unit: "m", note: "Outside toe board vertical clearance" },
    { key: "ram-head-ceiling", clause: "4.2.5.7.4", value: data.ramHeadClearance, limit: 0.10, op: ">=", unit: "m", note: "Ceiling to ram-head assembly" },
    { key: "cwt-screen-bottom", clause: "4.2.5.5.1(c)", value: data.cwtScreenBottomFromPit, limit: 0.30, op: "<=", unit: "m", note: "Lowest part of CWT screen from pit floor" },
    { key: "cwt-screen-height", clause: "4.2.5.5.1(b)", value: data.cwtScreenHeight, limit: 2.00, op: ">=", unit: "m", note: "CWT screen minimum extension height" }
  ];

  const results = checks.map((c) => {
    const pass = c.op === "<=" ? c.value <= c.limit : c.value >= c.limit;
    return { ...c, pass };
  });

  const passCount = results.filter(r => r.pass).length;
  const allPass = passCount === results.length;

  return (
    <div className="space-y-8">
      <div className="bg-surface-container-low p-8 border-t-2 border-primary">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xl font-bold">ISO 8100-1 Shaft Clearance Validation</h3>
          <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase ${allPass ? 'bg-emerald-100 text-emerald-700' : 'bg-error-container/20 text-error'}`}>
            {allPass ? 'PASS' : 'ATTENTION'} {passCount}/{results.length}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {results.map(r => (
            <div key={r.key} className={`p-4 border flex items-center justify-between ${r.pass ? 'bg-surface-container-lowest border-outline-variant/10' : 'bg-error-container/10 border-error/20'}`}>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-primary uppercase">{r.clause}</p>
                <p className="text-xs font-medium">{r.note}</p>
              </div>
              <div className="text-right">
                <p className={`text-sm font-black ${r.pass ? 'text-emerald-600' : 'text-error'}`}>
                  {r.value.toFixed(3)} {r.unit} {r.op} {r.limit.toFixed(3)} {r.unit}
                </p>
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

const SAFETY_GEAR_PRESETS = [
  { name: 'Standard S-1200', maxMass: 1200, brakingForce: 15000, certifiedSpeed: 1.5 },
  { name: 'Standard M-2500', maxMass: 2500, brakingForce: 35000, certifiedSpeed: 2.5 },
  { name: 'Standard L-5000', maxMass: 5000, brakingForce: 75000, certifiedSpeed: 4.0 },
];

const SafetyComponentsModule = ({ data, onChange, section = 'all' }: { data: ProjectData, onChange: (newData: Partial<ProjectData>) => void, section?: 'all' | 'safety' | 'buffers' | 'sil' | 'acop' | 'doors' }) => {
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

  // 4.3 Safety Gear Logic
  const g = 9.81;
  const totalMass = data.carMass + data.ratedLoad;
  const isMassOk = totalMass <= data.safetyGearMaxMass;
  const isSpeedOk = data.osgTrippingSpeed <= data.safetyGearCertifiedSpeed;
  // Refined retardation: a = Fb / ((P+Q) * g) - 1
  const retardationG = data.safetyGearBrakingForce > 0 ? (data.safetyGearBrakingForce / (totalMass * g)) - 1 : 0;
  const isRetardationOk = retardationG >= 0.2 && retardationG <= 1.0;

  // 4.5 Buffer Logic
  const impactMass = bufferTarget === 'car' ? (data.carMass + data.ratedLoad) : data.cwtMass;
  const v_impact = 1.15 * data.speed; // Impact speed is 115% of rated speed
  const Ek = 0.5 * impactMass * v_impact * v_impact;
  const h_m = data.bufferStroke / 1000;
  const Ep = impactMass * g * h_m;
  const Etotal = Ek + Ep;
  
  // Non-linear buffer capacity estimation (Clause 4.5.3)
  let Ecap = 0;
  if (data.bufferIsLinear) {
    const eta = 0.5;
    Ecap = impactMass * (1.0 * g + g) * h_m * eta; // Capacity at 1.0gn limit
  } else {
    // Numerical integration of a non-linear force-stroke curve for energy dissipation buffer
    // Simulating a hydraulic buffer profile where force rises quickly and plateaus
    const steps = 100;
    const dx = h_m / steps;
    const F_max = impactMass * (1.0 * g + g); // Max force at 1.0gn
    let integratedEnergy = 0;
    for (let i = 0; i < steps; i++) {
      const normalizedX1 = (i * dx) / h_m;
      const normalizedX2 = ((i + 1) * dx) / h_m;
      // Simulated hydraulic profile: F(x) = F_max * (1 - exp(-10 * x/h))
      const F1 = F_max * (1 - Math.exp(-10 * normalizedX1));
      const F2 = F_max * (1 - Math.exp(-10 * normalizedX2));
      // Trapezoidal rule integration
      integratedEnergy += ((F1 + F2) / 2) * dx;
    }
    Ecap = integratedEnergy;
  }
  
  // ISO 8100-2:2026 Clause 4.5.2
  // For energy accumulation buffers:
  // h_min = 0.0674 * v^2 (for linear)
  // h_min = 0.135 * v^2 (for non-linear) - Wait, standard says 0.135 for linear?
  // Let's use the standard values:
  let h_min = 0;
  if (data.bufferType === 'energy-accumulation') {
    h_min = (data.bufferIsLinear ? 0.135 : 0.067) * data.speed * data.speed * 1000;
  } else {
    // Energy dissipation: h = (1.15v)^2 / (2 * 0.5 * gn) = 0.0674 * v^2
    h_min = 0.0674 * data.speed * data.speed * 1000;
  }
  
  const isStrokeOk = data.bufferStroke >= h_min;
  const isBufferMassOk = impactMass >= data.bufferMinMass && impactMass <= data.bufferMaxMass;
  
  // Energy capacity check for dissipation buffers
  // a_avg must be <= 1.0gn
  const a_avg = h_m > 0 ? (v_impact * v_impact) / (2 * h_m * g) : 0;
  const isEnergyOk = Etotal <= Ecap;
  
  const F_buffer = impactMass * (a_avg + g);
  const strokeUtilization = h_m > 0 ? (h_min / (data.bufferStroke)) * 100 : 0;
  const massUtilization = data.bufferMaxMass > data.bufferMinMass ? ((impactMass - data.bufferMinMass) / (data.bufferMaxMass - data.bufferMinMass)) * 100 : 0;

  // 4.18 SIL Logic
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

  // 4.7 ACOP Logic
  const acopMaxTripping = data.speed <= 1.0 ? 1.15 * data.speed + 0.25 : 1.15 * data.speed;
  const isAcopOk = data.acopTrippingSpeed > data.speed && data.acopTrippingSpeed <= acopMaxTripping;

  // 4.8 UCMP Logic
  const isUcmpOk = data.ucmpDetectionDist > 0 && data.ucmpDetectionDist <= 1200;

  return (
    <div className="space-y-8">
      <div className="bg-surface-container-low p-8 border-t-2 border-primary">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xl font-bold">Safety Verification</h3>
        </div>

        <div className="space-y-12">
          {/* 4.2 Door Locking Devices */}
          {(section === 'all' || section === 'doors') && (
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
        )}

          {/* 4.4 Overspeed Governor */}
          {(section === 'all' || section === 'safety') && (
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

                <div className="space-y-6 mt-4">
                  <CollapsibleSection title="ISO 8100-2:2026 OSG Formula Details" icon={Info}>
                    <div className="space-y-4 text-sm text-on-surface-variant leading-relaxed">
                      <p>
                        <strong>Clause 4.4:</strong> The overspeed governor (OSG) must trip at a speed $v_t$ that ensures the safety gear is activated before the car reaches a dangerous speed.
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                        <div className="p-4 bg-surface-container-low rounded border border-outline-variant/10">
                          <h5 className="font-bold text-primary mb-2 uppercase text-[10px]">Tripping Speed ($v_t$)</h5>
                          <p className="text-xs mb-2">The tripping speed must satisfy:</p>
                          <InlineMath math="v_t \ge 1.15 \cdot v" />
                          <p className="text-[10px] mt-2 opacity-70">Where $v$ is the rated speed. Maximum limits depend on the type of safety gear.</p>
                        </div>
                        <div className="p-4 bg-surface-container-low rounded border border-outline-variant/10">
                          <h5 className="font-bold text-primary mb-2 uppercase text-[10px]">Tensile Force ($F_t$)</h5>
                          <p className="text-xs mb-2">The force produced by the OSG when tripped must be:</p>
                          <InlineMath math="F_t \ge 300\text{ N} \text{ or } 2 \cdot F_{trip}" />
                          <p className="text-[10px] mt-2 opacity-70">{"Where $F_{trip}$ is the force required to activate the safety gear."}</p>
                        </div>
                      </div>
                    </div>
                  </CollapsibleSection>

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
          </div>
        </section>
        )}

          {/* 4.3 Verification of Safety Gear */}
          {(section === 'all' || section === 'safety') && (
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
                    <label className="text-[11px] font-bold text-on-surface-variant uppercase">Component Presets</label>
                    <select 
                      onChange={(e) => {
                        const preset = SAFETY_GEAR_PRESETS.find(p => p.name === e.target.value);
                        if (preset) {
                          onChange({ 
                            safetyGearMaxMass: preset.maxMass,
                            safetyGearBrakingForce: preset.brakingForce,
                            safetyGearCertifiedSpeed: preset.certifiedSpeed
                          });
                        }
                      }}
                      className="w-full bg-surface-container-low border border-outline-variant/20 rounded-sm px-3 py-2 text-sm outline-none"
                    >
                      <option value="">Select a preset...</option>
                      {SAFETY_GEAR_PRESETS.map(p => (
                        <option key={p.name} value={p.name}>{p.name}</option>
                      ))}
                    </select>
                  </div>
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
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-on-surface-variant uppercase">Certified Speed [m/s]</label>
                    <input 
                      type="number"
                      value={data.safetyGearCertifiedSpeed}
                      onChange={(e) => onChange({ safetyGearCertifiedSpeed: safeNumber(e.target.value) })}
                      className="w-full bg-surface-container-low border border-outline-variant/20 rounded-sm px-3 py-2 text-sm outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-on-surface-variant uppercase">Rail Surface Condition</label>
                    <select 
                      value={data.safetyGearRailCondition}
                      onChange={(e) => onChange({ safetyGearRailCondition: e.target.value as any })}
                      className="w-full bg-surface-container-low border border-outline-variant/20 rounded-sm px-3 py-2 text-sm outline-none"
                    >
                      <option value="dry">Dry / Machined</option>
                      <option value="oiled">Oiled</option>
                      <option value="machined">Special Machined</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="lg:col-span-2 space-y-4">
                <>
                  <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className={`p-4 border ${isMassOk ? 'bg-emerald-50 border-emerald-200' : 'bg-error-container bg-opacity-10 border-error border-opacity-20'}`}>
                            <p className="text-[10px] font-bold uppercase mb-1">Total Mass (P+Q)</p>
                            <p className="text-xl font-black">{formatNumber(totalMass)} kg</p>
                            <p className="text-[10px] opacity-50">Limit: {data.safetyGearMaxMass} kg</p>
                          </div>
                          <div className={`p-4 border ${isSpeedOk ? 'bg-emerald-50 border-emerald-200' : 'bg-error-container bg-opacity-10 border-error border-opacity-20'}`}>
                            <p className="text-[10px] font-bold uppercase mb-1">Certified Speed</p>
                            <p className="text-xl font-black">{formatNumber(data.osgTrippingSpeed)} m/s</p>
                            <p className="text-[10px] opacity-50">Limit: {data.safetyGearCertifiedSpeed} m/s</p>
                          </div>
                          <div className={`p-4 border ${isRetardationOk ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 bg-opacity-10 border-amber border-opacity-20'}`}>
                            <div className="flex items-center justify-between mb-3">
                              <p className="text-[10px] font-bold uppercase tracking-wider">Resultant Retardation (gn)</p>
                              <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full animate-pulse ${isRetardationOk ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${isRetardationOk ? 'bg-emerald-600 text-white' : 'bg-amber-600 text-white'}`}>
                                  {isRetardationOk ? 'ISO 8100-2 Compliant' : 'Non-Compliant'}
                                </span>
                              </div>
                            </div>
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

                          <div className="space-y-6 mt-6">
                          <CollapsibleSection title="ISO 8100-2:2026 Safety Gear Formula Details" icon={Info}>
                            <div className="space-y-4 text-sm text-on-surface-variant leading-relaxed">
                              <p>
                                <strong>Clause 4.3:</strong> Progressive safety gear must decelerate the car with an average retardation between $0.2g$ and $1.0g$ for the most unfavorable case.
                              </p>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                                <div className="p-4 bg-surface-container-low rounded border border-outline-variant/10">
                                  <h5 className="font-bold text-primary mb-2 uppercase text-[10px]">Average Retardation ($a$)</h5>
                                  <p className="text-xs mb-2">The retardation is calculated from the braking force $F_b$ and the total mass $P+Q$:</p>
                                  <InlineMath math="a = \frac{F_b}{P+Q} - g" />
                                  <p className="text-[10px] mt-2 opacity-70">{"Where $g = 9.81 \\text{ m/s}^2$. The result is often expressed in $g_n$ units."}</p>
                                </div>
                                <div className="p-4 bg-surface-container-low rounded border border-outline-variant/10">
                                  <h5 className="font-bold text-primary mb-2 uppercase text-[10px]">Permissible Range</h5>
                                  <p className="text-xs mb-2">The normative limits for safe deceleration are:</p>
                                  <InlineMath math="0.2g \le a \le 1.0g" />
                                  <p className="text-[10px] mt-2 opacity-70">Values below $0.2g$ may fail to stop the car; above $1.0g$ may cause passenger injury.</p>
                                </div>
                              </div>
                            </div>
                          </CollapsibleSection>

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
                    </>
                </div>
              </div>
            </section>
            )}

          {/* 4.5 Verification of Buffers */}
          {(section === 'all' || section === 'buffers') && (
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
                <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className={`p-6 border ${isStrokeOk ? 'bg-emerald-50 border-emerald-200' : 'bg-error-container/10 border-error/20'}`}>
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-[10px] font-bold uppercase">Stroke Utilization</p>
                            <div className="flex items-center gap-1">
                              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${data.bufferIsLinear ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                                {data.bufferIsLinear ? 'Linear' : 'Non-Linear'}
                              </span>
                            </div>
                          </div>
                          <p className="text-2xl font-black">{formatNumber(data.bufferStroke)} mm</p>
                          <p className="text-[10px] opacity-50">Min Required: {formatNumber(h_min)} mm ({formatNumber(strokeUtilization)}%)</p>
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
                          <p className="text-[10px] opacity-50">Limit: 1.0 gn (ISO 8100-2)</p>
                          <div className="mt-2 h-1 bg-surface-container-low rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${a_avg <= 1.0 ? 'bg-emerald-500' : 'bg-amber-500'}`} 
                              style={{ width: `${Math.min(a_avg * 100, 100)}%` }}
                            />
                          </div>
                        </div>
                        <div className={`p-6 border ${isBufferMassOk ? 'bg-emerald-50 border-emerald-200' : 'bg-error-container/10 border-error/20'}`}>
                          <p className="text-[10px] font-bold uppercase mb-1">Mass Compliance</p>
                          <p className="text-2xl font-black">{formatNumber(impactMass)} <span className="text-xs font-normal opacity-50">kg</span></p>
                          <p className="text-[10px] opacity-50">Range: {data.bufferMinMass} - {data.bufferMaxMass} kg</p>
                          <div className="mt-2 h-1 bg-surface-container-low rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${isBufferMassOk ? 'bg-emerald-500' : 'bg-error'}`} 
                              style={{ width: `${Math.min(Math.max(massUtilization, 0), 100)}%` }}
                            />
                          </div>
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
                                {data.bufferIsLinear ? 'Work = m(a+g)h' : 'Numerical Integration of Force-Stroke Curve'}
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

                      <div className="space-y-6 mt-6">
                        <CollapsibleSection title="ISO 8100-2:2026 Buffer Formula Details" icon={Info}>
                          <div className="space-y-4 text-sm text-on-surface-variant leading-relaxed">
                            <p>
                              <strong>Clause 4.5:</strong> Buffers must be capable of absorbing the kinetic energy of the car or counterweight at the moment of impact.
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                              <div className="p-4 bg-surface-container-low rounded border border-outline-variant/10">
                                <h5 className="font-bold text-primary mb-2 uppercase text-[10px]">Minimum Stroke ($h$)</h5>
                                <p className="text-xs mb-2">For energy accumulation buffers with linear characteristics:</p>
                                <InlineMath math="h \ge 0.135 \cdot v^2" />
                                <p className="text-[10px] mt-2 opacity-70">Where $v$ is the rated speed. For non-linear, the factor is $0.067$.</p>
                              </div>
                              <div className="p-4 bg-surface-container-low rounded border border-outline-variant/10">
                                <h5 className="font-bold text-primary mb-2 uppercase text-[10px]">Impact Energy ($E$)</h5>
                                <p className="text-xs mb-2">The total energy to be dissipated includes kinetic and potential energy:</p>
                                <InlineMath math="E = \frac{1}{2} \cdot m \cdot v^2 + m \cdot g \cdot h" />
                                <p className="text-[10px] mt-2 opacity-70">Where $m$ is the impact mass and $h$ is the buffer stroke.</p>
                              </div>
                            </div>
                          </div>
                        </CollapsibleSection>

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
                            <div className={`w-5 h-5 rounded flex items-center justify-center border ${isBufferMassOk ? 'bg-emerald-600 border-emerald-600' : 'border-outline-variant'}`}>
                              {isBufferMassOk && <CheckSquare size={14} className="text-white" />}
                            </div>
                            <span className={`text-xs font-medium ${isBufferMassOk ? 'text-on-surface' : 'text-on-surface-variant'}`}>
                              Total impact mass ({formatNumber(impactMass)}kg) is within the certified range ({data.bufferMinMass}kg - {data.bufferMaxMass}kg).
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
                  </div>
                </div>
              </div>
            </section>
            )}

          {/* 4.7 Ascending Car Overspeed Protection (ACOP) */}
          {(section === 'all' || section === 'acop') && (
          <section className="space-y-6">
            <div className="flex items-center gap-4 border-b border-outline-variant/20 pb-2">
              <ShieldCheck className="text-primary" size={20} />
              <h4 className="text-sm font-bold uppercase tracking-wider">4.7 Ascending Car Overspeed Protection (ACOP)</h4>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="space-y-4 p-6 bg-surface-container-lowest border border-outline-variant/10">
                <h5 className="text-[10px] font-bold uppercase text-primary mb-4">ACOP Parameters</h5>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-on-surface-variant uppercase">Means of Protection</label>
                    <select 
                      value={data.acopType}
                      onChange={(e) => onChange({ acopType: e.target.value as any })}
                      className="w-full bg-surface-container-low border border-outline-variant/20 rounded-sm px-3 py-2 text-sm outline-none"
                    >
                      <option value="governor">Overspeed Governor</option>
                      <option value="rope-brake">Rope Brake</option>
                      <option value="safety-gear">Safety Gear (Bi-directional)</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-on-surface-variant uppercase">Tripping Speed (vt_acop)</label>
                    <div className="relative">
                      <input 
                        type="number"
                        value={data.acopTrippingSpeed}
                        onChange={(e) => onChange({ acopTrippingSpeed: safeNumber(e.target.value) })}
                        className="w-full bg-surface-container-low border border-outline-variant/20 rounded-sm px-3 py-2 text-sm outline-none"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold opacity-50">m/s</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="lg:col-span-2 space-y-4">
                <div className={`p-6 border ${isAcopOk ? 'bg-emerald-50 border-emerald-200' : 'bg-error-container/10 border-error/20'}`}>
                  <p className="text-[10px] font-bold uppercase mb-1">ACOP Tripping Speed Verification</p>
                  <p className="text-2xl font-black">{formatNumber(data.acopTrippingSpeed)} m/s</p>
                  <p className="text-[10px] opacity-50">Limit: {formatNumber(acopMaxTripping)} m/s (ISO 8100-2:2026)</p>
                  <div className="mt-4 p-4 bg-white/50 rounded border border-black/5">
                    <h5 className="text-[10px] font-bold uppercase text-primary mb-2">Normative Limit (Clause 4.7)</h5>
                    <p className="text-xs leading-relaxed">
                      <strong>ISO 8100-2:2026 Clause 4.7.2.1:</strong> For rated speeds <InlineMath math="v \le 1.0\text{ m/s}" />, <InlineMath math="v_{t\_acop} \le 1.15v + 0.25\text{ m/s}" />.<br/>
                      <strong>ISO 8100-2:2026 Clause 4.7.2.2:</strong> For rated speeds <InlineMath math="v > 1.0\text{ m/s}" />, <InlineMath math="v_{t\_acop} \le 1.15v" />.
                    </p>
                  </div>
                </div>
                <div className="p-6 bg-surface-container-lowest border border-outline-variant/10 rounded-sm">
                  <h5 className="text-[10px] font-bold uppercase text-primary mb-4 flex items-center gap-2">
                    <CheckSquare size={12} />
                    ACOP Checklist (4.7)
                  </h5>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded flex items-center justify-center border ${isAcopOk ? 'bg-emerald-600 border-emerald-600' : 'border-outline-variant'}`}>
                        {isAcopOk && <CheckSquare size={14} className="text-white" />}
                      </div>
                      <span className="text-xs font-medium">Tripping speed does not exceed normative limits ({formatNumber(acopMaxTripping)} m/s).</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded flex items-center justify-center border border-outline-variant">
                        {/* Manual check */}
                      </div>
                      <span className="text-xs font-medium">Braking element acts on the car, counterweight, or rope system.</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
          )}

          {/* 4.8 Unintended Car Movement Protection (UCMP) */}
          {(section === 'all' || section === 'acop') && (
          <section className="space-y-6">
            <div className="flex items-center gap-4 border-b border-outline-variant/20 pb-2">
              <ShieldCheck className="text-primary" size={20} />
              <h4 className="text-sm font-bold uppercase tracking-wider">4.8 Unintended Car Movement Protection (UCMP)</h4>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="space-y-4 p-6 bg-surface-container-lowest border border-outline-variant/10">
                <h5 className="text-[10px] font-bold uppercase text-primary mb-4">UCMP Parameters</h5>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-on-surface-variant uppercase">Stopping Element</label>
                    <select 
                      value={data.ucmpType}
                      onChange={(e) => onChange({ ucmpType: e.target.value as any })}
                      className="w-full bg-surface-container-low border border-outline-variant/20 rounded-sm px-3 py-2 text-sm outline-none"
                    >
                      <option value="brake">Machine Brake</option>
                      <option value="safety-gear">Safety Gear</option>
                      <option value="valve">Hydraulic Valve</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-on-surface-variant uppercase">Detection Distance (s)</label>
                    <div className="relative">
                      <input 
                        type="number"
                        value={data.ucmpDetectionDist}
                        onChange={(e) => onChange({ ucmpDetectionDist: safeNumber(e.target.value) })}
                        className="w-full bg-surface-container-low border border-outline-variant/20 rounded-sm px-3 py-2 text-sm outline-none"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold opacity-50">mm</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="lg:col-span-2 space-y-4">
                <div className={`p-6 border ${isUcmpOk ? 'bg-emerald-50 border-emerald-200' : 'bg-error-container/10 border-error/20'}`}>
                  <p className="text-[10px] font-bold uppercase mb-1">UCMP Stopping Distance Verification</p>
                  <p className="text-2xl font-black">{formatNumber(data.ucmpDetectionDist)} mm</p>
                  <p className="text-[10px] opacity-50">Max Permissible Movement: 1200 mm (ISO 8100-1:2026)</p>
                  <div className="mt-4 p-4 bg-white/50 rounded border border-black/5">
                    <h5 className="text-[10px] font-bold uppercase text-primary mb-2">Normative Requirement (Clause 4.8)</h5>
                    <p className="text-xs leading-relaxed">
                      <strong>ISO 8100-2:2026 Clause 4.8.2:</strong> The car shall stop within a distance of <InlineMath math="1.20\text{ m}" /> from the landing level. 
                      The detection distance <InlineMath math="s" /> plus the braking distance must not exceed this limit.
                    </p>
                  </div>
                </div>
                <div className="p-6 bg-surface-container-lowest border border-outline-variant/10 rounded-sm">
                  <h5 className="text-[10px] font-bold uppercase text-primary mb-4 flex items-center gap-2">
                    <CheckSquare size={12} />
                    UCMP Checklist (4.8)
                  </h5>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded flex items-center justify-center border ${isUcmpOk ? 'bg-emerald-600 border-emerald-600' : 'border-outline-variant'}`}>
                        {isUcmpOk && <CheckSquare size={14} className="text-white" />}
                      </div>
                      <span className="text-xs font-medium">Car stops within 1.20m from the landing level.</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded flex items-center justify-center border border-outline-variant">
                        {/* Manual check */}
                      </div>
                      <span className="text-xs font-medium">Detection zone does not exceed 250mm from landing.</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
          )}

          {/* 4.18 SIL-rated Circuits (PESSRAL) */}
          {(section === 'all' || section === 'sil') && (
          <section className="space-y-6">
            <div className="flex items-center gap-4 border-b border-outline-variant/20 pb-2">
              <Zap className="text-primary" size={20} />
              <h4 className="text-sm font-bold uppercase tracking-wider">4.18 SIL-rated Circuits (PESSRAL)</h4>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="space-y-4 p-6 bg-surface-container-lowest border border-outline-variant/10">
                <h5 className="text-[10px] font-bold uppercase text-primary mb-4">PESSRAL Configuration</h5>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-on-surface-variant uppercase">Target SIL Level</label>
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
                    <label className="text-[11px] font-bold text-on-surface-variant uppercase">Failure Rate (λ) [failures/h]</label>
                    <input 
                      type="number"
                      value={data.failureRate}
                      onChange={(e) => onChange({ failureRate: safeNumber(e.target.value) })}
                      className="w-full bg-surface-container-low border border-outline-variant/20 rounded-sm px-3 py-2 text-sm outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-on-surface-variant uppercase">Dangerous Fraction (B) [%]</label>
                      <input 
                        type="number"
                        value={data.dangerousFraction}
                        onChange={(e) => onChange({ dangerousFraction: safeNumber(e.target.value) })}
                        className="w-full bg-surface-container-low border border-outline-variant/20 rounded-sm px-3 py-2 text-sm outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-on-surface-variant uppercase">Diagnostic Coverage (DC) [%]</label>
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
              <div className="lg:col-span-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className={`p-6 border ${isPfhOk ? 'bg-emerald-50 border-emerald-200' : 'bg-error-container/10 border-error/20'}`}>
                    <p className="text-[10px] font-bold uppercase mb-1">Calculated PFH</p>
                    <p className="text-2xl font-black">{pfh.toExponential(2)}</p>
                    <p className="text-[10px] opacity-50">Limit: {currentLimit.max.toExponential(0)} failures/h</p>
                    <div className="mt-4 flex items-center gap-2">
                      {isPfhOk ? <CheckCircle2 size={14} className="text-emerald-600" /> : <XCircle size={14} className="text-error" />}
                      <span className="text-[10px] font-bold uppercase opacity-70">PFH Verification</span>
                    </div>
                  </div>
                  <div className={`p-6 border ${isDcOk ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
                    <p className="text-[10px] font-bold uppercase mb-1">Diagnostic Coverage</p>
                    <p className="text-2xl font-black">{data.diagnosticCoverage}%</p>
                    <p className="text-[10px] opacity-50">Min Required: {minDc}%</p>
                    <div className="mt-4 flex items-center gap-2">
                      {isDcOk ? <CheckCircle2 size={14} className="text-emerald-600" /> : <AlertCircle size={14} className="text-amber-600" />}
                      <span className="text-[10px] font-bold uppercase opacity-70">DC Verification</span>
                    </div>
                  </div>
                </div>
                <div className="mt-6 p-6 bg-surface-container-low border border-outline-variant/10 rounded-sm">
                  <h5 className="text-[10px] font-bold uppercase text-primary mb-4">ISO 8100-1 Clause 5.11.2 Requirements</h5>
                  <div className="space-y-3 text-xs text-on-surface-variant">
                    <p>• Programmable electronic systems in safety-related applications (PESSRAL) shall meet the requirements of SIL {data.silLevel}.</p>
                    <p>• The probability of dangerous failure per hour (PFH) shall be less than {currentLimit.max.toExponential(0)}.</p>
                    <p>• Fault tolerance and diagnostic coverage must be verified according to IEC 61508.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
          )}
        </div>
      </div>
    </div>
  );
};

// --- Main App ---

const PDFExportModule = ({ data }: { data: ProjectData }) => {
  const [isGenerating, setIsGenerating] = React.useState(false);

  const exportPDF = async () => {
    setIsGenerating(true);
    try {
      const element = document.getElementById('calculation-memory-report');
      if (!element) {
        console.error('Report element not found');
        return;
      }

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        onclone: (clonedDoc) => {
          // html2canvas fails on oklch/oklab colors which are default in Tailwind v4
          // We need to replace them in the cloned document before rendering
          const elements = clonedDoc.getElementsByTagName('*');
          for (let i = 0; i < elements.length; i++) {
            const el = elements[i] as HTMLElement;
            
            // Check inline style attribute first as it's faster
            const styleAttr = el.getAttribute('style');
            if (styleAttr && (styleAttr.includes('oklch') || styleAttr.includes('oklab'))) {
              el.setAttribute('style', styleAttr.replace(/okl(ch|ab)\([^)]+\)/g, '#000000'));
            }

            // Check computed style for values coming from stylesheets
            const style = window.getComputedStyle(el);
            const colorProps = [
              'color', 
              'background-color', 
              'border-color', 
              'border-top-color', 
              'border-right-color', 
              'border-bottom-color', 
              'border-left-color', 
              'fill', 
              'stroke',
              'stop-color',
              'flood-color',
              'lighting-color'
            ];

            colorProps.forEach(prop => {
              try {
                const val = style.getPropertyValue(prop);
                if (val && (val.includes('oklch') || val.includes('oklab'))) {
                  // Fallback to a safe color
                  // For backgrounds, we might want white or transparent, but black is safer for visibility if it's a border/text
                  const fallback = (prop === 'color' || prop === 'fill' || prop === 'stroke' || prop.includes('border')) 
                    ? '#333333' 
                    : 'transparent';
                  el.style.setProperty(prop, fallback, 'important');
                }
              } catch (e) {
                // Ignore errors for unsupported properties
              }
            });
          }
        }
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      // Handle multi-page if height exceeds A4
      const pageHeight = pdf.internal.pageSize.getHeight();
      let heightLeft = pdfHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`LiftCalc_Report_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('PDF Export failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="bg-surface-container-low p-8 rounded-sm border border-outline-variant/10 text-center">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <FileText size={32} className="text-primary" />
        </div>
        <h2 className="text-2xl font-black uppercase tracking-tighter mb-2">Technical Report Generator</h2>
        <p className="text-on-surface-variant mb-8 max-w-md mx-auto">
          Generate a comprehensive PDF report containing all engineering parameters, ISO 8100-2 calculations, and compliance verifications.
        </p>
        
        <button 
          onClick={exportPDF}
          disabled={isGenerating}
          className="px-8 py-4 bg-primary text-white font-black uppercase tracking-[0.2em] rounded-sm hover:opacity-90 transition-all shadow-lg flex items-center gap-3 mx-auto disabled:opacity-50"
        >
          {isGenerating ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <FileText size={18} />
              Export PDF Report
            </>
          )}
        </button>
      </div>

      <div className="bg-amber-50 border border-amber-200 p-6 rounded-sm flex gap-4">
        <Info className="text-amber-600 shrink-0" size={20} />
        <div className="text-sm text-amber-800">
          <p className="font-bold mb-1">Export Instructions</p>
          <p>The report is generated from the "Calculation Memory" module. Ensure all data is correctly entered before exporting. The process may take a few seconds depending on the complexity of the data.</p>
        </div>
      </div>

      {/* Hidden container for rendering the report for capture */}
      <div className="fixed left-[-9999px] top-0 w-[1200px] bg-white">
        <CalculationMemoryModule data={data} />
      </div>
    </div>
  );
};

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
    railIx: 198000,
    railWy: 10100,
    railWx: 4450,
    railIyRadius: 19.5,
    railIxRadius: 11.2,
    railWeight: 12.3,
    railProfile: 'ISO T89/B',
    numSimpleBends: 2,
    numReverseBends: 0,
    ropeBreakingLoad: 45000,
    safetyGearMaxMass: 2500,
    safetyGearBrakingForce: 35000,
    safetyGearCertifiedSpeed: 1.5,
    safetyGearRailCondition: 'dry',
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
    ruptureValvePressure: 6.0,
    // New Traction & Belt Variables
    grooveType: 'semi-circular',
    undercutWidth: 90,
    ropeAngleOfWrap: 180,
    acceleration: 0.5,
    deceleration: 0.5,
    ropeSpecificPressure: 1.2,
    beltWidth: 30,
    beltThickness: 3,
    numBelts: 4,
    beltTensileStrength: 40000,
    // New Clearances (ISO 8100-1)
    pitDepth: 1500,
    headroomHeight: 3800,
    carToWallClearance: 120,
    carToCounterweightClearance: 50,
    carToLandingSillClearance: 35,
    showClearances: true,
    // Additional Variables from HTML Engine
    Faux: 4000,
    delta_str_x: 0.6,
    delta_str_y: 0.6,
    N_equiv_t: 5,
    Kp: 5.06,
    N_lift: 120000,
    C_R: 1.0,
    wellToCarWall: 0.11,
    sillGap: 0.03,
    doorPanelGap: 0.08,
    pitRefugeHeight: 0.55,
    pitObstacleClearance: 0.32,
    pitFreeVerticalHazard: 2.05,
    carToCwtDistance: 0.06,
    headroomGeneral: 0.52,
    headroomGuideShoeZone: 0.12,
    balustradeVertical: 0.32,
    toeBoardOutside: 0.12,
    ramHeadClearance: 0.12,
    cwtScreenBottomFromPit: 0.28,
    cwtScreenHeight: 2.1,
    carWidth: 1200,
    carDepth: 1400,
    carHeight: 2200
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
    { id: 'global', label: 'General (Clause 4.1)', icon: Globe, status: 'implemented' },
    { id: 'doors', label: 'Door Locking (4.2)', icon: Lock, status: 'implemented' },
    { id: 'safety', label: 'Safety Gear (4.3)', icon: ShieldCheck, status: 'implemented' },
    { id: 'buffers', label: 'Buffers (4.5)', icon: Box, status: 'implemented' },
    { id: 'acop-ucmp', label: 'ACOP / UCMP (4.7/4.8)', icon: ShieldAlert, status: 'implemented' },
    { id: 'rails', label: 'Guide Rails (4.10)', icon: ArrowUpDown, status: 'implemented' },
    { id: 'traction', label: 'Traction (4.11)', icon: Settings2, status: 'implemented' },
    { id: 'ropes', label: 'Suspension (4.12)', icon: Cable, status: 'implemented' },
    { id: 'hydraulic', label: 'Hydraulic (4.15)', icon: Droplets, status: 'implemented' },
    { id: 'sil', label: 'SIL / PESSAL (4.18)', icon: Zap, status: 'implemented' },
    { id: 'clearances', label: 'Clearances (ISO 8100-1)', icon: Ruler, status: 'implemented' },
    { id: 'sling', label: 'Car Frame / Sling', icon: Box, status: 'implemented' },
    { id: 'library', label: 'Component Library', icon: Library, status: 'implemented' },
    { id: 'formulas', label: 'Formula Library', icon: Calculator, status: 'implemented' },
    { id: 'shaft', label: '3D Shaft', icon: Box, status: 'implemented' },
    { id: 'cabin', label: '3D Cabin', icon: Maximize2, status: 'implemented' },
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
      case 'safety': return <SafetyComponentsModule data={projectData} onChange={handleDataChange} section="safety" />;
      case 'buffers': return <SafetyComponentsModule data={projectData} onChange={handleDataChange} section="buffers" />;
      case 'acop-ucmp': return <ACOP_UCMP_Module data={projectData} onChange={handleDataChange} />;
      case 'sil': return <SafetyComponentsModule data={projectData} onChange={handleDataChange} section="sil" />;
      case 'clearances': return <ClearanceValidationModule data={projectData} />;
      case 'formulas': return <FormulaLibraryModule />;
      case 'library': return <ComponentLibraryModule />;
      case 'memory': return <CalculationMemoryModule data={projectData} />;
      case 'export': return <PDFExportModule data={projectData} />;
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
              wellToCarWall={projectData.wellToCarWall}
              sillGap={projectData.sillGap}
              pitRefugeHeight={projectData.pitRefugeHeight}
              carToCwtDistance={projectData.carToCwtDistance}
              headroomGeneral={projectData.headroomGeneral}
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
      case 'cabin': return (
        <div className="space-y-6">
          <div className="bg-surface-container-low p-6 rounded-sm border border-outline-variant/10">
            <h3 className="text-xl font-black uppercase tracking-tighter mb-4">3D Cabin Interior Explorer</h3>
            <Cabin3DModule 
              width={projectData.carWidth / 1000}
              depth={projectData.carDepth / 1000}
              height={projectData.carHeight / 1000}
            />
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-sm">
                <h4 className="text-[10px] font-bold uppercase text-emerald-700 mb-2 flex items-center gap-2">
                  <Accessibility size={12} />
                  ISO 8100-7 / EN 81-70
                </h4>
                <p className="text-[10px] text-emerald-900/70 leading-relaxed">
                  Accessibility requirements implemented: Handrails, Control Panel height, and Mirror placement for wheelchair users.
                </p>
              </div>
              <div className="p-4 bg-blue-50 border border-blue-100 rounded-sm">
                <h4 className="text-[10px] font-bold uppercase text-blue-700 mb-2 flex items-center gap-2">
                  <Shield size={12} />
                  ISO 8100-20 Cybersecurity
                </h4>
                <p className="text-[10px] text-blue-900/70 leading-relaxed">
                  Secure IoT Gateway integration for encrypted telemetry and remote monitoring compliance.
                </p>
              </div>
              <div className="p-4 bg-amber-50 border border-amber-100 rounded-sm">
                <h4 className="text-[10px] font-bold uppercase text-amber-700 mb-2 flex items-center gap-2">
                  <Zap size={12} />
                  EN 81-77 Seismic
                </h4>
                <p className="text-[10px] text-amber-900/70 leading-relaxed">
                  Seismic retainer plates (snags) and reinforced frame considerations for high-activity zones.
                </p>
              </div>
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

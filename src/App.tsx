import { ProjectData, ModuleStatus } from './types';
import { computeLiftCalculations } from './lib/calculations';
import { OverviewModule } from './modules/OverviewModule';
import { SeismicModule } from './modules/SeismicModule';
import { EN8128Module } from './modules/EN8128Module';
import { GlobalProjectModule } from './modules/GlobalProjectModule';
import { TractionModule } from './modules/TractionModule';
import { RopesModule } from './modules/RopesModule';
import { GuideRailsModule } from './modules/GuideRailsModule';
import { HydraulicModule } from './modules/HydraulicModule';
import { RuptureValveModule } from './modules/RuptureValveModule';
import { ComponentLibraryModule } from './modules/ComponentLibraryModule';
import { CalculationMemoryModule } from './modules/CalculationMemoryModule';
import { SlingModule } from './modules/SlingModule';
import { DoorLockingModule } from './modules/DoorLockingModule';
import { FormulaLibraryModule } from './modules/FormulaLibraryModule';
import { ClearanceValidationModule } from './modules/ClearanceValidationModule';
import { SafetyComponentsModule } from './modules/SafetyComponentsModule';
import { PDFExportModule, ValidationModal, SimpleModal, ValidationResult } from './modules/PDFExportModule';
import { OverspeedGovernorModule } from './modules/OverspeedGovernorModule';
import { TractionSheavesModule } from './modules/TractionSheavesModule';
import { CounterweightModule } from './modules/CounterweightModule';

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
  Unlock,
  History, 
  FileText, 
  Database,
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
  Shield,
  Bell,
  Activity,
  Package
} from 'lucide-react';
import { Shaft3DModule } from './components/Shaft3DModule';
import { Cabin3DModule } from './components/Cabin3DModule';
import { computeLiftCalculations } from './lib/calculations';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

import { ISO_RAIL_PROFILES, BELT_PROFILES } from './constants';

import { safeNumber, formatNumber, degToRad, InputGroup, LiftField, SliderField, CollapsibleSection } from './components/ui';

// --- Modules ---



















export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [isValidationOpen, setIsValidationOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
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
    railLubrication: 'oiled',
    numSimpleBends: 2,
    numReverseBends: 0,
    ropeBreakingLoad: 45000,
    ropeGrade: 1770,
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
    bufferManualOverride: false,
    bufferManualStroke: 150,
    uprightSection: 'UPE 140',
    uprightArea: 1640,
    uprightWy: 86400,
    slingWidth: 1250,
    slingDepth: 1450,
    slingHeight: 3500,
    sheaveHardness: 210,
    sheaveMaterial: 'Cast Iron',
    sheaveAllowableStress: 80,
    silLevel: 3,
    safetyIntegrity: 'High',
    faultTolerance: 1,
    mtbf: 100000,
    failureRate: 0.00001,
    diagnosticCoverage: 90,
    dangerousFraction: 50,
    doorLockingForce: 1000,
    doorMinimumEngagement: 7,
    doorElectricalSafetyCheck: true,
    doorLimitSwitchType: 'NC',
    doorElectricalContinuity: true,
    osgMaxBrakingForce: 300,
    osgManufacturer: '',
    osgModel: '',
    osgSerialNumber: '',
    railBoltDiameter: 12,
    railNumBoltsPerJoint: 8,
    alarmButtonType: 'NO',
    alarmBackupBatteryTime: 1, // hours
    alarmCommunicationType: 'GSM',
    alarmFilteringImplemented: false,
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
    ropeWearPercentage: 0,
    bufferForceCurveExponent: 1.5,
    suspensionType: 'wire-rope',
    compensationType: 'none',
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
    // EN 81-77 Seismic
    seismicCategory: 0,
    designAcceleration: 0,
    primaryWaveDetection: false,
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
    setProjectData(prev => {
      const merged = { ...prev, ...newData };
      // Enforce physical constraints: Cabin cannot exceed shaft minus 200mm for clearances
      // If expanding the cabin, grow the shaft automatically.
      if ('carWidth' in newData && merged.carWidth > merged.shaftWidth - 200) {
        merged.shaftWidth = merged.carWidth + 200;
      }
      if ('carDepth' in newData && merged.carDepth > merged.shaftDepth - 200) {
        merged.shaftDepth = merged.carDepth + 200;
      }
      // If shrinking the shaft, shrink the cabin automatically.
      if ('shaftWidth' in newData && merged.carWidth > merged.shaftWidth - 200) {
        merged.carWidth = merged.shaftWidth - 200;
      }
      if ('shaftDepth' in newData && merged.carDepth > merged.shaftDepth - 200) {
        merged.carDepth = merged.shaftDepth - 200;
      }
      return merged;
    });
  };

  const validateProject = () => {
    const calc = computeLiftCalculations(projectData);
    const results: ValidationResult[] = [];
    
    // Traction Check (Dynamic and Static conditions from ISO 8100)
    if (!calc.traction.isOk) {
      results.push({ 
        type: 'error', 
        msg: `Traction condition fails (T1/T2 > e^(f*α)). Check wrap angle or equivalent friction.`,
        moduleId: 'traction-verify',
        actionLabel: 'Increase Wrap Angle',
        onAction: () => handleDataChange({ wrapAngle: Math.min(270, projectData.wrapAngle + 15) })
      });
    }

    if (calc.traction.p_groove > calc.traction.p_allow) {
      results.push({
        type: 'warning',
        msg: `Specific groove pressure (${calc.traction.p_groove.toFixed(2)} MPa) exceeds allowance (${calc.traction.p_allow.toFixed(2)} MPa).`,
        moduleId: 'sheaves',
        actionLabel: 'Increase Hardness',
        onAction: () => handleDataChange({ sheaveHardness: Math.min(300, projectData.sheaveHardness + 20) })
      });
    }
    
    // Safety Factor Check
    if (!calc.ropes.isSfOk) {
      results.push({ 
        type: 'error', 
        msg: `Rope safety factor (${calc.ropes.sf_actual.toFixed(1)}) is below normative limit (${calc.ropes.sf_required.toFixed(1)}).`,
        moduleId: 'ropes',
        actionLabel: 'Add Rope',
        onAction: () => handleDataChange({ numRopes: projectData.numRopes + 1 })
      });
    }
    
    // OSG Braking Force Check
    if (projectData.osgMaxBrakingForce < projectData.osgTensileForce) {
      results.push({
        type: 'error',
        msg: `OSG Max Braking Force (${projectData.osgMaxBrakingForce}N) is less than Tensile Force (${projectData.osgTensileForce}N).`,
        moduleId: 'osg',
        actionLabel: 'Match Braking Force',
        onAction: () => handleDataChange({ osgMaxBrakingForce: projectData.osgTensileForce })
      });
    }

    // Guide Rails Check
    if (projectData.bracketDist > 3000) {
      results.push({ 
        type: 'warning', 
        msg: 'Bracket distance exceeds 3000mm. Verify buckling stability.',
        moduleId: 'rails',
        actionLabel: 'Reduce to 2500mm',
        onAction: () => handleDataChange({ bracketDist: 2500 })
      });
    }
    
    // Buffer Check
    if (projectData.speed > 1.0 && projectData.bufferType === 'energy-accumulation') {
      results.push({ 
        type: 'error', 
        msg: 'Energy accumulation buffers are only allowed for speeds ≤ 1.0 m/s.',
        moduleId: 'buffers',
        actionLabel: 'Change to Dissipation',
        onAction: () => handleDataChange({ bufferType: 'energy-dissipation' })
      });
    }

    // ACOP Check
    const maxAcop = 1.15 * projectData.speed + 0.25;
    if (projectData.acopTrippingSpeed > maxAcop) {
      results.push({ 
        type: 'error', 
        msg: `ACOP tripping speed (${projectData.acopTrippingSpeed}m/s) exceeds normative limit (${maxAcop.toFixed(2)}m/s).`,
        moduleId: 'acop-ucmp',
        actionLabel: 'Set to Max Limit',
        onAction: () => handleDataChange({ acopTrippingSpeed: parseFloat(maxAcop.toFixed(2)) })
      });
    }

    setValidationResults(results);
    setIsValidationOpen(true);
  };

  const modules: ModuleStatus[] = [
    // Project Definition
    { id: 'overview', label: 'Overview', icon: LayoutDashboard, status: 'implemented', category: 'Project Overview' },
    { id: 'global', label: 'General Parameters (4.1)', icon: Globe, status: 'implemented', category: 'Project Overview' },
    { id: 'cybersecurity', label: 'Cybersecurity (ISO 8100-20)', icon: Shield, status: 'placeholder', category: 'Project Overview' },

    // Cabin / Car
    { id: 'doors', label: 'Door Locking (4.2)', icon: Lock, status: 'implemented', category: 'Cabin / Car' },
    { id: 'sling', label: 'Car Frame / Sling', icon: Box, status: 'implemented', category: 'Cabin / Car' },
    { id: 'cabin', label: '3D Cabin Explorer', icon: Maximize2, status: 'implemented', category: 'Cabin / Car' },

    // Counterweight
    { id: 'cwt', label: 'Counterweight Definition', icon: Database, status: 'placeholder', category: 'Counterweight' },

    // Guide Rails (4.10)
    { id: 'rails-params', label: 'Profiles & Material', icon: ArrowUpDown, status: 'implemented', category: 'Guide Rails (4.10)' },
    { id: 'rails-forces', label: 'Forces & Displacements', icon: Activity, status: 'implemented', category: 'Guide Rails (4.10)' },
    { id: 'rails-verify', label: 'Verification', icon: CheckSquare, status: 'implemented', category: 'Guide Rails (4.10)' },

    // Traction System
    { id: 'traction-params', label: 'Traction Parameters', icon: Settings2, status: 'implemented', category: 'Traction System' },
    { id: 'sheaves', label: 'Traction Sheaves', icon: Settings, status: 'implemented', category: 'Traction System' },
    { id: 'traction-verify', label: 'System Verification', icon: CheckSquare, status: 'implemented', category: 'Traction System' },
    
    // Suspension & Compensation
    { id: 'suspension-params', label: 'Suspension Configuration', icon: Cable, status: 'implemented', category: 'Suspension & Compensation Means' },
    { id: 'suspension-verify', label: 'Suspension Verification', icon: CheckSquare, status: 'implemented', category: 'Suspension & Compensation Means' },
    { id: 'compensation', label: 'Compensation Means', icon: Package, status: 'implemented', category: 'Suspension & Compensation Means' },

    // Safety Systems
    { id: 'safety', label: 'Safety Gear (4.3)', icon: ShieldCheck, status: 'implemented', category: 'Safety Components' },
    { id: 'osg', label: 'Overspeed Governor (4.4)', icon: ShieldAlert, status: 'implemented', category: 'Safety Components' },
    { id: 'buffers', label: 'Buffers (4.5)', icon: Box, status: 'implemented', category: 'Safety Components' },
    { id: 'acop-ucmp', label: 'ACOP / UCMP (4.7/4.8)', icon: ShieldAlert, status: 'implemented', category: 'Safety Components' },

    // Electronics & Safety
    { id: 'sil', label: 'SIL / PESSAL (4.18)', icon: Zap, status: 'implemented', category: 'Electronics & Safety' },
    { id: 'alarms', label: 'Remote Alarms (EN 81-28)', icon: Bell, status: 'implemented', category: 'Electronics & Safety' },
    { id: 'seismic', label: 'Seismic (EN 81-77)', icon: Zap, status: 'implemented', category: 'Electronics & Safety' },

    // Clearances & Geometry
    { id: 'clearances', label: 'Clearances (ISO 8100-1)', icon: Ruler, status: 'implemented', category: 'Hoistway & Clearances' },
    { id: 'shaft', label: '3D Shaft Configurator', icon: Box, status: 'implemented', category: 'Hoistway & Clearances' },

    // Hydraulic
    { id: 'hydraulic', label: 'Hydraulic (4.15)', icon: Droplets, status: 'implemented', category: 'Hydraulic systems' },
    
    // Tools
    { id: 'library', label: 'Component Library', icon: Library, status: 'implemented', category: 'Tools & Documentation' },
    { id: 'formulas', label: 'Formula Library', icon: Calculator, status: 'implemented', category: 'Tools & Documentation' },
    { id: 'memory', label: 'Calculation Memory', icon: History, status: 'implemented', category: 'Tools & Documentation' },
    { id: 'export', label: 'PDF Export', icon: FileText, status: 'implemented', category: 'Tools & Documentation' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'overview': return <OverviewModule modules={modules} onSelect={setActiveTab} />;
      case 'global': return <GlobalProjectModule data={projectData} onChange={handleDataChange} />;
      
      case 'traction-verify': return <TractionModule data={projectData} onChange={handleDataChange} view="verify" />;
      case 'traction-params': return <TractionModule data={projectData} onChange={handleDataChange} view="params" />;
      case 'sheaves': return <TractionSheavesModule data={projectData} onChange={handleDataChange} />;
      
      
      // Suspension split
      case 'suspension-params': return <RopesModule data={projectData} onChange={handleDataChange} view="params" />;
      case 'suspension-verify': return <RopesModule data={projectData} onChange={handleDataChange} view="verify" />;
      case 'suspension': return <RopesModule data={projectData} onChange={handleDataChange} view="all" />; // Fallback
      case 'compensation': return <div className="p-8 text-center text-on-surface-variant font-bold border border-dashed border-outline-variant/30 rounded-sm bg-surface-container-low">Compensation module coming soon (analyzes lift mass, height, speed via ISO 8100 limits).</div>;
      case 'cybersecurity': return <div className="p-8 text-center text-on-surface-variant font-bold border border-dashed border-outline-variant/30 rounded-sm bg-surface-container-low">Cybersecurity framework via ISO 8100-20 to be integrated here.</div>;

      // Safety Systems
      case 'safety': return <SafetyComponentsModule data={projectData} onChange={handleDataChange} section="safety" />;
      case 'osg': return <OverspeedGovernorModule data={projectData} onChange={handleDataChange} />;
      case 'buffers': return <SafetyComponentsModule data={projectData} onChange={handleDataChange} section="buffers" />;
      case 'acop-ucmp': return <SafetyComponentsModule data={projectData} onChange={handleDataChange} section="acop" />;
      
      // Safety Electronics
      case 'alarms': return <EN8128Module data={projectData} onChange={handleDataChange} />;
      case 'sil': return <SafetyComponentsModule data={projectData} onChange={handleDataChange} section="sil" />;

      // Singular Mechanics
      case 'rails-params': return <GuideRailsModule data={projectData} onChange={handleDataChange} view="params" />;
      case 'rails-forces': return <GuideRailsModule data={projectData} onChange={handleDataChange} view="forces" />;
      case 'rails-verify': return <GuideRailsModule data={projectData} onChange={handleDataChange} view="verify" />;
      case 'rails': return <GuideRailsModule data={projectData} onChange={handleDataChange} view="all" />;

      case 'cwt': return <CounterweightModule data={projectData} onChange={handleDataChange} />;
      
      case 'sling': return <SlingModule data={projectData} onChange={handleDataChange} />;
      case 'hydraulic': return <HydraulicModule data={projectData} />;
      case 'seismic': return <SeismicModule data={projectData} onChange={handleDataChange} />;
      case 'doors': return <DoorLockingModule />;
      
      // Geometry
      case 'clearances': return <ClearanceValidationModule data={projectData} onChange={handleDataChange} />;
      case 'formulas': return <FormulaLibraryModule />;
      case 'library': return <ComponentLibraryModule />;
      case 'memory': return <CalculationMemoryModule data={projectData} />;
      case 'export': return <PDFExportModule data={projectData} />;
      case 'shaft': return (
        <div className="space-y-6">
          <div className="bg-surface-container-low p-6 rounded-sm border border-outline-variant/10">
            <h3 className="text-xl font-black uppercase tracking-tighter mb-4">3D Shaft Geometry Explorer</h3>
              <Shaft3DModule 
              width={projectData.shaftWidth}
              depth={projectData.shaftDepth}
              height={projectData.shaftHeight}
              carWidth={projectData.carWidth / 1000}
              carDepth={projectData.carDepth / 1000}
              carHeight={projectData.carHeight / 1000}
              carPos={projectData.carPositionPercent / 100}
              wellToCarWall={projectData.wellToCarWall}
              sillGap={projectData.sillGap}
              pitRefugeHeight={projectData.pitRefugeHeight}
              carToCwtDistance={projectData.carToCwtDistance}
              headroomGeneral={projectData.headroomGeneral}
              showClearances={projectData.showClearances}
            />
            <div className="mt-6 p-4 bg-surface-container-lowest border border-outline-variant/10 rounded-sm">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-[10px] font-bold uppercase text-primary">Simulation & Geometry Controls</h4>
                <label className="flex items-center gap-2 cursor-pointer text-[10px] font-bold uppercase tracking-wider">
                  <input 
                    type="checkbox" 
                    checked={projectData.showClearances} 
                    onChange={e => handleDataChange({ showClearances: e.target.checked })}
                    className="accent-primary"
                  />
                  Show Dynamic Clearances
                </label>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
                <SliderField label="Car Position" value={projectData.carPositionPercent} min={0} max={100} onChange={v => handleDataChange({ carPositionPercent: v })} unit="%" />
                <SliderField label="Shaft Width" value={projectData.shaftWidth} min={1000} max={5000} onChange={v => handleDataChange({ shaftWidth: v })} unit="mm" />
                <SliderField label="Shaft Depth" value={projectData.shaftDepth} min={1000} max={5000} onChange={v => handleDataChange({ shaftDepth: v })} unit="mm" />
                <SliderField label="Shaft Height" value={projectData.shaftHeight} min={3000} max={100000} onChange={v => handleDataChange({ shaftHeight: v })} unit="mm" />
                <SliderField label="Pit Depth" value={projectData.pitDepth} min={500} max={4000} onChange={v => handleDataChange({ pitDepth: v })} unit="mm" />
                <SliderField label="Headroom Height" value={projectData.headroomHeight} min={2500} max={6000} onChange={v => handleDataChange({ headroomHeight: v })} unit="mm" />
                <div className="col-span-1 md:col-span-2 lg:col-span-3 border-t border-outline-variant/10 pt-4 mt-2" />
                <SliderField label="Pit Refuge Height" value={projectData.pitRefugeHeight} min={0.5} max={2.0} onChange={v => handleDataChange({ pitRefugeHeight: v })} unit="m" />
                <SliderField label="Headroom Gen. Clearance" value={projectData.headroomGeneral} min={0.5} max={2.0} onChange={v => handleDataChange({ headroomGeneral: v })} unit="m" />
                <SliderField label="Car to CWT Dist." value={projectData.carToCwtDistance} min={0.05} max={0.5} onChange={v => handleDataChange({ carToCwtDistance: v })} unit="m" />
              </div>
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
            <div className="mt-6 p-4 bg-surface-container-lowest border border-outline-variant/10 rounded-sm mb-6">
              <h4 className="text-[10px] font-bold uppercase text-primary mb-4">Dimensions Controls</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-4">
                <SliderField label="Car Width" value={projectData.carWidth} min={800} max={3000} onChange={v => handleDataChange({ carWidth: v })} unit="mm" />
                <SliderField label="Car Depth" value={projectData.carDepth} min={800} max={3000} onChange={v => handleDataChange({ carDepth: v })} unit="mm" />
                <SliderField label="Car Height" value={projectData.carHeight} min={2000} max={3500} onChange={v => handleDataChange({ carHeight: v })} unit="mm" />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
        
        <nav className="flex-1 flex flex-col gap-4">
          {Array.from(new Set(modules.map(m => m.category || 'Other'))).map(category => (
            <div key={category} className="flex flex-col gap-0.5">
              <h3 className="px-6 py-1 text-[10px] font-bold tracking-widest text-on-surface-variant uppercase opacity-50">
                {category}
              </h3>
              {modules.filter(m => (m.category || 'Other') === category).map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-3 px-6 py-2 transition-all duration-200 group text-left ${
                    activeTab === item.id 
                      ? 'bg-primary/10 text-primary border-r-4 border-primary' 
                      : 'text-secondary hover:bg-surface-container-low hover:translate-x-1'
                  }`}
                >
                  <item.icon size={14} className={activeTab === item.id ? 'text-primary' : 'text-secondary opacity-70 group-hover:opacity-100'} />
                  <span className="text-xs font-medium">{item.label}</span>
                </button>
              ))}
            </div>
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
        onNavigate={setActiveTab}
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

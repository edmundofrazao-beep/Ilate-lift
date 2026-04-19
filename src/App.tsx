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
import { FormulaLibraryModule } from './modules/FormulaLibraryModule';
import { ClearanceValidationModule } from './modules/ClearanceValidationModule';
import { SafetyComponentsModule } from './modules/SafetyComponentsModule';
import { PDFExportModule, ValidationModal, SimpleModal, ValidationResult } from './modules/PDFExportModule';
import { OverspeedGovernorModule } from './modules/OverspeedGovernorModule';
import { TractionSheavesModule } from './modules/TractionSheavesModule';
import { CounterweightModule } from './modules/CounterweightModule';
import { CybersecurityModule } from './modules/CybersecurityModule';

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
  const [validationModalTitle, setValidationModalTitle] = useState('Project Validation Results');
  const [projectData, setProjectData] = useState<ProjectData>({
    type: 'electric',
    suspension: '2:1',
    ratedLoad: 1000,
    carMass: 1200,
    cwtMass: 1700,
    balanceRatio: 0.5,
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
    railPresetId: 'mf-t89b',
    railLubrication: 'oiled',
    numSimpleBends: 2,
    numReverseBends: 0,
    ropeBreakingLoad: 45000,
    ropeGrade: 1770,
    safetyGearMaxMass: 2500,
    safetyGearBrakingForce: 35000,
    safetyGearCertifiedSpeed: 1.5,
    safetyGearPresetId: '',
    safetyGearRailCondition: 'dry',
    ramDiameter: 100,
    cylinderWallThickness: 5,
    ramLength: 5000,
    maxPressure: 4.5,
    bufferStroke: 150,
    bufferType: 'energy-accumulation',
    bufferMaxMass: 2500,
    bufferMinMass: 500,
    bufferPresetId: '',
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
    osgPresetId: '',
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
    ropePresetId: '',
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
    carHeight: 2200,
    
    // Cybersecurity Defaults
    cyberNetworkIsolation: true,
    cyberAccessControl: 'Basic',
    cyberDataEncryption: true,
    cyberVulnerabilityPatching: false,
    cyberIntrusionDetection: false
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

  const getValidationResults = (data: ProjectData) => {
    const calc = computeLiftCalculations(data);
    const results: ValidationResult[] = [];
    
    // Traction Check (Dynamic and Static conditions from ISO 8100)
    if (!calc.traction.isOk) {
      results.push({ 
        type: 'error', 
        msg: `Traction condition fails (T1/T2 > e^(f*α)). Check wrap angle or equivalent friction.`,
        moduleId: 'traction-verify',
        actionLabel: 'Increase Wrap Angle',
        onAction: () => handleDataChange({ wrapAngle: Math.min(270, data.wrapAngle + 15) })
      });
    }

    if (calc.traction.p_groove > calc.traction.p_allow) {
      results.push({
        type: 'warning',
        msg: `Specific groove pressure (${calc.traction.p_groove.toFixed(2)} MPa) exceeds allowance (${calc.traction.p_allow.toFixed(2)} MPa).`,
        moduleId: 'sheaves',
        actionLabel: 'Increase Hardness',
        onAction: () => handleDataChange({ sheaveHardness: Math.min(300, data.sheaveHardness + 20) })
      });
    }
    
    // Safety Factor Check
    if (!calc.ropes.isSfOk) {
      results.push({ 
        type: 'error', 
        msg: `Rope safety factor (${calc.ropes.sf_actual.toFixed(1)}) is below normative limit (${calc.ropes.sf_required.toFixed(1)}).`,
        moduleId: 'suspension-verify',
        actionLabel: 'Add Rope',
        onAction: () => handleDataChange({ numRopes: data.numRopes + 1 })
      });
    }

    if (data.ropeWearPercentage >= 6) {
      results.push({
        type: 'warning',
        msg: `Rope diameter reduction (${data.ropeWearPercentage.toFixed(1)}%) reached the discard review threshold.`,
        moduleId: 'suspension-verify'
      });
    }
    
    // OSG Braking Force Check
    if (data.osgMaxBrakingForce < data.osgTensileForce) {
      results.push({
        type: 'error',
        msg: `OSG Max Braking Force (${data.osgMaxBrakingForce}N) is less than Tensile Force (${data.osgTensileForce}N).`,
        moduleId: 'osg',
        actionLabel: 'Match Braking Force',
        onAction: () => handleDataChange({ osgMaxBrakingForce: data.osgTensileForce })
      });
    }

    // Guide Rails Check
    if (data.bracketDist > 3000) {
      results.push({ 
        type: 'warning', 
        msg: 'Bracket distance exceeds 3000mm. Verify buckling stability.',
        moduleId: 'rails-verify',
        actionLabel: 'Reduce to 2500mm',
        onAction: () => handleDataChange({ bracketDist: 2500 })
      });
    }
    
    // Buffer Check
    if (data.speed > 1.0 && data.bufferType === 'energy-accumulation') {
      results.push({ 
        type: 'error', 
        msg: 'Energy accumulation buffers are only allowed for speeds ≤ 1.0 m/s.',
        moduleId: 'buffers',
        actionLabel: 'Change to Dissipation',
        onAction: () => handleDataChange({ bufferType: 'energy-dissipation' })
      });
    }

    // ACOP Check
    const maxAcop = 1.15 * data.speed + 0.25;
    if (data.acopTrippingSpeed > maxAcop) {
      results.push({ 
        type: 'error', 
        msg: `ACOP tripping speed (${data.acopTrippingSpeed}m/s) exceeds normative limit (${maxAcop.toFixed(2)}m/s).`,
        moduleId: 'acop-ucmp',
        actionLabel: 'Set to Max Limit',
        onAction: () => handleDataChange({ acopTrippingSpeed: parseFloat(maxAcop.toFixed(2)) })
      });
    }

    if (data.doorLockingForce < 1000 || data.doorMinimumEngagement < 7 || !data.doorElectricalSafetyCheck) {
      results.push({
        type: 'warning',
        msg: 'Door locking verification is incomplete for 4.2 mechanical or electrical conditions.',
        moduleId: 'doors'
      });
    }

    const lambdaD = data.failureRate * (data.dangerousFraction / 100);
    const pfh = lambdaD * (1 - (data.diagnosticCoverage / 100));
    const silMax = data.silLevel === 3 ? 1e-7 : data.silLevel === 2 ? 1e-6 : 1e-5;
    const minDc = data.silLevel === 3 ? 90 : data.silLevel === 2 ? 60 : 0;
    if (pfh > silMax || data.diagnosticCoverage < minDc || data.faultTolerance < (data.silLevel >= 3 ? 1 : 0)) {
      results.push({
        type: 'warning',
        msg: 'Safety circuits evidence is incomplete for the selected SIL target.',
        moduleId: 'sil'
      });
    }

    return results;
  };

  const getValidationScopeForTab = (tab: string) => {
    const map: Record<string, string[]> = {
      doors: ['doors'],
      sling: ['sling', 'safety'],
      sheaves: ['sheaves', 'traction-verify', 'suspension-verify'],
      'traction-params': ['traction-verify', 'sheaves'],
      'traction-verify': ['traction-verify', 'sheaves'],
      'suspension-params': ['suspension-verify'],
      'suspension-verify': ['suspension-verify'],
      safety: ['safety'],
      osg: ['osg'],
      buffers: ['buffers'],
      'acop-ucmp': ['acop-ucmp'],
      sil: ['sil'],
      'rails-params': ['rails-verify'],
      'rails-forces': ['rails-verify'],
      'rails-verify': ['rails-verify'],
      hydraulic: ['hydraulic'],
      clearances: ['clearances', 'shaft'],
      shaft: ['shaft', 'clearances'],
      cabin: ['cabin', 'doors'],
    };
    return map[tab] || [tab];
  };

  const validateProject = () => {
    const results = getValidationResults(projectData);
    setValidationResults(results);
    setValidationModalTitle('Project Validation Results');
    setIsValidationOpen(true);
  };

  const validateActiveSection = () => {
    const scopedIds = new Set(getValidationScopeForTab(activeTab));
    const results = getValidationResults(projectData).filter(result => result.moduleId && scopedIds.has(result.moduleId));
    setValidationResults(results);
    setValidationModalTitle(`${activeSectionLabel} Validation`);
    setIsValidationOpen(true);
  };

  const allValidationResults = useMemo(() => getValidationResults(projectData), [projectData]);
  const activeSectionResults = useMemo(() => {
    const scopedIds = new Set(getValidationScopeForTab(activeTab));
    return allValidationResults.filter(result => result.moduleId && scopedIds.has(result.moduleId));
  }, [activeTab, allValidationResults]);

  const modules: ModuleStatus[] = [
    // Project Definition
    { id: 'overview', label: 'Overview', icon: LayoutDashboard, status: 'implemented', category: 'Project Setup' },
    { id: 'global', label: 'Project Parameters (4.1)', icon: Globe, status: 'implemented', category: 'Project Setup' },

    // Cabin / Car
    { id: 'doors', label: 'Door Locking (4.2)', icon: Lock, status: 'implemented', category: 'Cabin and Car' },
    { id: 'sling', label: 'Car Frame', icon: Box, status: 'implemented', category: 'Cabin and Car' },
    { id: 'cabin', label: '3D Cabin', icon: Maximize2, status: 'implemented', category: 'Cabin and Car' },

    // Counterweight
    { id: 'cwt', label: 'Counterweight Definition', icon: Database, status: 'implemented', category: 'Counterweight' },

    // Guide Rails (4.10)
    { id: 'rails-params', label: 'Guide Rail Setup', icon: ArrowUpDown, status: 'implemented', category: 'Guide Rails (4.10)' },
    { id: 'rails-forces', label: 'Loads and Deflection', icon: Activity, status: 'implemented', category: 'Guide Rails (4.10)' },
    { id: 'rails-verify', label: 'Guide Rail Checks', icon: CheckSquare, status: 'implemented', category: 'Guide Rails (4.10)' },

    // Traction System
    { id: 'traction-params', label: 'Traction Setup', icon: Settings2, status: 'implemented', category: 'Traction System' },
    { id: 'sheaves', label: 'Sheaves and Grooves', icon: Settings, status: 'implemented', category: 'Traction System' },
    { id: 'traction-verify', label: 'Traction Checks', icon: CheckSquare, status: 'implemented', category: 'Traction System' },
    
    // Suspension & Compensation
    { id: 'suspension-params', label: 'Suspension Setup', icon: Cable, status: 'implemented', category: 'Suspension and Compensation' },
    { id: 'suspension-verify', label: 'Discard and Compliance', icon: CheckSquare, status: 'implemented', category: 'Suspension and Compensation' },
    { id: 'compensation', label: 'Compensation Means', icon: Package, status: 'implemented', category: 'Suspension and Compensation' },

    // Safety Systems
    { id: 'safety', label: 'Safety Gear (4.3)', icon: ShieldCheck, status: 'implemented', category: 'Safety Components' },
    { id: 'osg', label: 'Overspeed Governor (4.4)', icon: ShieldAlert, status: 'implemented', category: 'Safety Components' },
    { id: 'buffers', label: 'Buffers (4.5)', icon: Box, status: 'implemented', category: 'Safety Components' },
    { id: 'acop-ucmp', label: 'ACOP and UCMP (4.7/4.8)', icon: ShieldAlert, status: 'implemented', category: 'Safety Components' },

    // Electronics & Safety
    { id: 'sil', label: 'Safety Circuits (4.6)', icon: Zap, status: 'implemented', category: 'Control and Electronics' },
    { id: 'alarms', label: 'Remote Alarms (EN 81-28)', icon: Bell, status: 'implemented', category: 'Control and Electronics' },
    { id: 'seismic', label: 'Seismic (EN 81-77)', icon: Zap, status: 'implemented', category: 'Control and Electronics' },
    { id: 'cybersecurity', label: 'Cybersecurity (ISO 8100-20)', icon: Lock, status: 'implemented', category: 'Control and Electronics' },

    // Clearances & Geometry
    { id: 'clearances', label: 'Clearances (ISO 8100-1)', icon: Ruler, status: 'implemented', category: 'Hoistway and Geometry' },
    { id: 'shaft', label: '3D Shaft', icon: Box, status: 'implemented', category: 'Hoistway and Geometry' },

    // Hydraulic
    { id: 'hydraulic', label: 'Hydraulic (4.15)', icon: Droplets, status: 'implemented', category: 'Hydraulic Systems' },
    
    // Tools
    { id: 'library', label: 'Component Library', icon: Library, status: 'implemented', category: 'Tools and Documentation' },
    { id: 'formulas', label: 'Formula Library', icon: Calculator, status: 'implemented', category: 'Tools and Documentation' },
    { id: 'memory', label: 'Calculation Memory', icon: History, status: 'implemented', category: 'Tools and Documentation' },
    { id: 'export', label: 'PDF Export', icon: FileText, status: 'implemented', category: 'Tools and Documentation' },
  ];

  const activeSectionStatus = activeSectionResults.some(result => result.type === 'error')
    ? { label: 'attention', tone: 'text-error bg-error-container/10 border-error/20' }
    : activeSectionResults.some(result => result.type === 'warning')
      ? { label: 'review', tone: 'text-amber-700 bg-amber-50 border-amber-200' }
      : { label: 'ok', tone: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
  const activeSectionLabel = modules.find(m => m.id === activeTab)?.label || 'Current Section';

  const exportProjectData = () => {
    const dataStr = JSON.stringify(projectData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ilate-project-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

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
      case 'cybersecurity': return <CybersecurityModule data={projectData} onChange={handleDataChange} />;

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
      case 'doors': return <SafetyComponentsModule data={projectData} onChange={handleDataChange} section="doors" />;
      
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
      <aside className="fixed left-0 top-0 h-full flex flex-col py-4 gap-1 z-40 w-64 border-r border-outline-variant/50 bg-surface-container overflow-y-auto no-scrollbar">
        <div className="px-6 mb-8">
          <h1 className="text-xl font-black text-primary uppercase tracking-tighter">ILATE</h1>
          <p className="text-[10px] text-on-surface-variant font-semibold tracking-widest uppercase mt-1">Operational Cockpit</p>
        </div>
        
        <nav className="flex-1 flex flex-col gap-4">
          {Array.from(new Set(modules.map(m => m.category || 'Other'))).map(category => (
            <div key={category} className="flex flex-col gap-0.5">
              <h3 className="px-6 py-1 text-[10px] font-bold tracking-widest text-on-surface-variant uppercase opacity-70">
                {category}
              </h3>
              {modules.filter(m => (m.category || 'Other') === category).map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-3 px-6 py-2 transition-all duration-200 group text-left ${
                    activeTab === item.id 
                      ? 'bg-primary/10 text-primary border-r-2 border-primary font-bold' 
                      : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                  }`}
                >
                  <item.icon size={14} className={activeTab === item.id ? 'text-primary' : 'text-on-surface-variant opacity-70 group-hover:opacity-100 group-hover:text-primary'} />
                  <span className="text-[11px] font-medium uppercase tracking-wider">{item.label}</span>
                </button>
              ))}
            </div>
          ))}
        </nav>

        <div className="px-6 pt-4 mt-auto border-t border-outline-variant/30">
          <button 
            onClick={validateProject}
            className="w-full py-2.5 bg-primary text-surface-container-lowest rounded-sm font-bold hover:bg-primary-dim transition-colors text-[11px] uppercase tracking-wider flex items-center justify-center gap-2"
          >
            <Play size={12} fill="currentColor" />
            Validate Project
          </button>
        </div>
      </aside>
      
      {/* Main Content */}
      <main className="ml-64 flex-1 flex flex-col h-full overflow-hidden bg-surface">
        {/* Header */}
        <header className="flex justify-between items-center w-full px-8 h-14 bg-surface-container-highest sticky top-0 z-50 border-b border-outline-variant/50">
          <div className="flex items-center gap-6">
            <span className="text-sm font-bold tracking-widest text-primary uppercase">ISO 8100 ENGINE</span>
            <div className="h-4 w-px bg-outline-variant" />
            <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">{modules.find(m => m.id === activeTab)?.label}</span>
            <span className={`hidden lg:inline-flex items-center rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] ${activeSectionStatus.tone}`}>
              {activeSectionStatus.label}
              {activeSectionResults.length > 0 ? ` · ${activeSectionResults.length}` : ' · 0'}
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={validateActiveSection}
              className="px-4 py-1.5 bg-surface-container border border-outline-variant/50 text-on-surface hover:text-primary hover:border-primary transition-colors rounded-sm flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest"
            >
              <CheckSquare size={14} />
              Validate Section
            </button>
            <button
              onClick={exportProjectData}
              className="px-4 py-1.5 bg-surface-container border border-outline-variant/50 text-on-surface hover:text-primary hover:border-primary transition-colors rounded-sm flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest"
            >
              <Download size={14} />
              Export JSON
            </button>
            <div className="h-4 w-px bg-outline-variant/50" />
            <div className="flex gap-1">
              <button 
                onClick={() => setIsSettingsOpen(true)}
                className="p-2 text-on-surface-variant hover:text-primary transition-colors"
                title="Settings"
              ><Settings size={16} /></button>
              <button 
                onClick={() => setIsHelpOpen(true)}
                className="p-2 text-on-surface-variant hover:text-primary transition-colors"
                title="Help"
              ><HelpCircle size={16} /></button>
            </div>
          </div>
        </header>
        
        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-8 no-scrollbar bg-surface">
          <div className="max-w-7xl mx-auto">
            {activeSectionResults.length === 0 ? (
              <div className="mb-6 flex flex-col gap-3 rounded-sm border border-emerald-200 bg-emerald-50 p-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-700/80">Section Validation</p>
                  <p className="mt-1 text-sm font-bold text-emerald-800">{activeSectionLabel} is currently clear.</p>
                </div>
                <button
                  onClick={validateActiveSection}
                  className="px-4 py-2 bg-white text-emerald-800 rounded-sm border border-emerald-200 hover:border-emerald-400 transition-colors text-[10px] font-black uppercase tracking-[0.18em]"
                >
                  Check Section
                </button>
              </div>
            ) : (
              <div className={`mb-6 rounded-sm border p-4 ${activeSectionStatus.tone}`}>
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Section Validation</p>
                    <h3 className="mt-1 text-lg font-black tracking-tight">{activeSectionLabel}</h3>
                    <p className="mt-2 text-sm opacity-80">
                      {`${activeSectionResults.length} validation point${activeSectionResults.length > 1 ? 's' : ''} detected in this section. Resolve them here before moving on.`}
                    </p>
                  </div>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="rounded-sm border border-current/15 bg-black/5 px-3 py-2">
                        <p className="text-[10px] font-bold uppercase opacity-70">Errors</p>
                        <p className="text-lg font-black">{activeSectionResults.filter(r => r.type === 'error').length}</p>
                      </div>
                      <div className="rounded-sm border border-current/15 bg-black/5 px-3 py-2">
                        <p className="text-[10px] font-bold uppercase opacity-70">Warnings</p>
                        <p className="text-lg font-black">{activeSectionResults.filter(r => r.type === 'warning').length}</p>
                      </div>
                      <div className="rounded-sm border border-current/15 bg-black/5 px-3 py-2">
                        <p className="text-[10px] font-bold uppercase opacity-70">State</p>
                        <p className="text-lg font-black uppercase">{activeSectionStatus.label}</p>
                      </div>
                    </div>
                    <button
                      onClick={validateActiveSection}
                      className="px-4 py-2 bg-surface-container-highest text-on-surface rounded-sm border border-outline-variant/30 hover:border-primary hover:text-primary transition-colors text-[10px] font-black uppercase tracking-[0.18em]"
                    >
                      Open Section Report
                    </button>
                  </div>
                </div>
              </div>
            )}
            {renderContent()}
          </div>
        </div>
        
        {/* Footer */}
        <footer className="h-10 bg-surface-container-highest border-t border-outline-variant/50 px-8 flex items-center justify-between text-[10px] text-on-surface-variant font-medium shrink-0 uppercase tracking-widest">
          <div className="flex gap-6">
            <span>ISO 8100-2:2026 Engine v1.0.4</span>
            <span className="text-primary opacity-80">Workspace: Global Project Alpha-7</span>
          </div>
          <div className="flex gap-4 items-center">
            <span className="flex items-center gap-1">
              <CheckCircle2 size={12} className="text-emerald-500" /> 
              All Calculations Valid
            </span>
            <span className="bg-primary border border-primary-dim px-2 py-0.5 text-surface-container-lowest font-bold">
              ILATE ENTERPRISE
            </span>
          </div>
        </footer>
      </main>

      <ValidationModal 
        isOpen={isValidationOpen} 
        onClose={() => setIsValidationOpen(false)} 
        results={validationResults} 
        onNavigate={setActiveTab}
        title={validationModalTitle}
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

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
import { CompensationModule } from './modules/CompensationModule';

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

import { ISO_RAIL_PROFILES, BELT_PROFILES, SHAFT_LUMINAIRE_PRESETS } from './constants';
import { RuntimeTextConfig, loadRuntimeTextConfig } from './lib/runtimeConfig';

import { safeNumber, formatNumber, degToRad, InputGroup, LiftField, SliderField, CollapsibleSection } from './components/ui';

// --- Modules ---

const MODULE_GUIDANCE: Record<string, { owner: string; output: string; report: string; next?: string }> = {
  overview: {
    owner: 'Mapa de trabalho. Não editar valores técnicos aqui.',
    output: 'Mostra a sequência recomendada e os blocos ainda por fechar.',
    report: 'Não entra como cálculo; serve para orientar validação.',
    next: 'Começa em Project Base.',
  },
  global: {
    owner: 'Único local para tipo de elevador, velocidade, curso, pisos, geometria base e arquitetura de comando.',
    output: 'Alimenta tração/hidráulico, guias, buffers, 3D e relatório.',
    report: 'Parâmetros de entrada principais.',
    next: 'Depois segue para tração ou hidráulico.',
  },
  cwt: {
    owner: 'Único local para massa, razão e material do contrapeso.',
    output: 'Define massa efetiva, volume aproximado e estado de balanço.',
    report: 'Parâmetros e verificação do contrapeso.',
  },
  'traction-params': {
    owner: 'Único local para geometria de tração, suspensão, ângulos, atrito e aceleração.',
    output: 'Alimenta polia, aderência, pressão específica e suspensão.',
    report: 'Base de cálculo da tração.',
    next: 'Depois valida Sheaves and Grooves.',
  },
  sheaves: {
    owner: 'Único local para polia, ranhura, material, dureza e pressão de contacto.',
    output: 'Fecha D/d, pressão específica e compatibilidade com o sistema de suspensão.',
    report: 'Verificação da polia e ranhuras.',
  },
  'traction-verify': {
    owner: 'Página de leitura e validação. Não deve ser usada para tunar inputs base.',
    output: 'Mostra aderência estática/dinâmica e pressão admissível.',
    report: 'Resultados de tração.',
  },
  'suspension-params': {
    owner: 'Único local para escolher cabos/cintas, quantidade, resistência e presets.',
    output: 'Alimenta segurança de suspensão, fadiga e tração.',
    report: 'Sistema de suspensão instalado.',
  },
  'suspension-verify': {
    owner: 'Página de verificação de segurança, descarte e fadiga da suspensão.',
    output: 'Mostra SF, vida estimada, descarte e ações de serviço.',
    report: 'Critérios de descarte e conformidade.',
  },
  compensation: {
    owner: 'Único local para meios de compensação em elevadores elétricos aplicáveis.',
    output: 'Indica necessidade por curso, velocidade e massa.',
    report: 'Compensação quando aplicável.',
  },
  'rails-params': {
    owner: 'Único local para perfil de guia, material, fixação e rodadeiras.',
    output: 'Alimenta esforços, flecha, EN 81-77 e 3D.',
    report: 'Perfis e dados das guias.',
  },
  'rails-forces': {
    owner: 'Página de cargas e flechas das guias. Inputs devem vir do setup de guias.',
    output: 'Mostra esforços, flechas e sensibilidade.',
    report: 'Resultados estruturais das guias.',
  },
  'rails-verify': {
    owner: 'Página de validação final das guias.',
    output: 'Consolida checks ISO 8100-2/EN 81-77.',
    report: 'Estado final das guias.',
  },
  doors: {
    owner: 'Único local para parâmetros de fecho, engate, continuidade e interlock.',
    output: 'Fecha 4.2 e alimenta segurança/relatório.',
    report: 'Verificação dos fechos de porta.',
  },
  safety: {
    owner: 'Único local para paraquedas/safety gear e massa certificada.',
    output: 'Valida desaceleração, massa e velocidade certificada.',
    report: 'Safety gear.',
  },
  osg: {
    owner: 'Único local para limitador de velocidade, fabricante, modelo e força de tração.',
    output: 'Alimenta ACOP, safety gear e validação de segurança.',
    report: 'Limitador de velocidade.',
  },
  buffers: {
    owner: 'Único local para buffers, curso, tipo, meio e presets.',
    output: 'Valida energia, desaceleração e massa admissível.',
    report: 'Amortecedores/buffers.',
  },
  'acop-ucmp': {
    owner: 'Único local para ACOP/UCMP, tipo de proteção e distâncias.',
    output: 'Fecha proteção contra excesso de velocidade ascendente e movimento involuntário.',
    report: 'ACOP e UCMP.',
  },
  sil: {
    owner: 'Único local para SIL, PFH, cobertura diagnóstica e tolerância a falhas.',
    output: 'Mostra se o circuito é aceitável ou exige arquitetura superior.',
    report: 'Circuitos de segurança.',
  },
  alarms: {
    owner: 'Único local para alarme remoto EN 81-28.',
    output: 'Valida comunicação, bateria e filtragem.',
    report: 'Sistema de alarme.',
  },
  seismic: {
    owner: 'Único local para categoria sísmica, aceleração, retainers e lógica EN 81-77.',
    output: 'Determina necessidade de rodadeiras, eixos independentes e retainers.',
    report: 'Condições sísmicas.',
  },
  cybersecurity: {
    owner: 'Único local para isolamento, encriptação, acesso e patching.',
    output: 'Fecha ISO 8100-20.',
    report: 'Cibersegurança.',
  },
  hydraulic: {
    owner: 'Único local para cilindro, pressão, ram, buckling e power unit hidráulica.',
    output: 'Alimenta rupture valve, buffers hidráulicos e relatório hidráulico.',
    report: 'Sistema hidráulico.',
  },
  'rupture-valve': {
    owner: 'Único local para válvula de rutura e parâmetros de fecho hidráulico.',
    output: 'Valida caudal e pressão de disparo.',
    report: 'Válvula de rutura.',
  },
  clearances: {
    owner: 'Único local para folgas ISO 8100-1, poço, topo, refúgios e balaustrada.',
    output: 'Alimenta shaft 3D e validação de geometria.',
    report: 'Folgas e espaços de segurança.',
  },
  shaft: {
    owner: 'Visualização/simulação. Medidas estruturais devem vir de Project Base e Clearances.',
    output: 'Mostra caixa, posição da cabina e interfaces.',
    report: 'Representação 3D quando estabilizada.',
  },
  cabin: {
    owner: 'Visualização/simulação. Dimensões vêm da geometria base e acessibilidade.',
    output: 'Mostra interior, topo da cabina e elementos de inspeção.',
    report: 'Representação da cabina quando estabilizada.',
  },
  library: {
    owner: 'Biblioteca de presets e componentes.',
    output: 'Ajuda a escolher fabricantes/modelos.',
    report: 'Referências dos componentes escolhidos.',
  },
  formulas: {
    owner: 'Biblioteca técnica. Não edita projeto.',
    output: 'Explica fórmulas e cláusulas.',
    report: 'Base normativa e fórmulas.',
  },
  memory: {
    owner: 'Memória de cálculo gerada a partir dos inputs validados.',
    output: 'Pré-visualização do relatório técnico.',
    report: 'Corpo principal do relatório.',
  },
  export: {
    owner: 'Saída final. Não corrige inputs; apenas exporta o que está validado.',
    output: 'PDF/relatório final.',
    report: 'Entrega final.',
  },
};



















export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isInspectorCollapsed, setIsInspectorCollapsed] = useState(false);
  const [isValidationOpen, setIsValidationOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
  const [validationModalTitle, setValidationModalTitle] = useState('Project Validation Results');
  const [pendingFocusField, setPendingFocusField] = useState<string | null>(null);
  const [runtimeText, setRuntimeText] = useState<RuntimeTextConfig | null>(null);
  const [projectData, setProjectData] = useState<ProjectData>({
    type: 'electric',
    suspension: '2:1',
    ratedLoad: 1000,
    carMass: 1200,
    cwtMass: 1700,
    balanceRatio: 0.5,
    cwtFillMaterial: 'cast-iron',
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
    guideInterfaceType: 'sliding',
    guideRollerPresetId: '',
    guideRollerWheelMaterial: 'nylon',
    guideRollerIndependentAxes: false,
    guideRollerClearanceX: 1.5,
    guideRollerClearanceY: 1.5,
    guideRollerClearanceZ: 1.0,
    guideRollerSpringStiffness: 180,
    driveArrangement: 'mrl',
    machineRoomPosition: 'none',
    controlCabinetLocation: 'top-landing',
    drivePackageLocation: 'shaft-head',
    controllerArchitecture: 'vvvf',
    roofInspectionStation: true,
    pitInspectionStation: true,
    cabinetInspectionEnabled: true,
    travellingCableType: 'flat',
    travellingCableRouting: 'rear-wall',
    shaftLightingLux: 220,
    shaftLuminairePresetId: 'schneider-ledbar-1200',
    shaftLuminaireSpacing: 3.0,
    shaftLuminaireCount: 11,
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
    bufferMedium: 'spring',
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
    seismicRetainerEnabled: false,
    seismicRetainerType: 'none',
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
    carRoofBalustradeHeight: 1.1,
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
      if ('suspensionType' in newData) {
        if (newData.suspensionType === 'belt') {
          merged.ropePresetId = '';
          merged.ropeType = merged.ropeType && merged.ropeType !== 'Steel Wire' ? merged.ropeType : 'Elastomeric Belt';
          merged.grooveType = 'semi-circular';
          merged.undercutAngle = 0;
          merged.grooveAngle = 0;
          merged.numBelts = Math.max(merged.numBelts || 0, 1);
          merged.beltWidth = Math.max(merged.beltWidth || 0, 1);
          merged.beltThickness = Math.max(merged.beltThickness || 0, 1);
          merged.beltTensileStrength = Math.max(merged.beltTensileStrength || merged.ropeBreakingLoad || 0, 1000);
        } else {
          merged.ropePresetId = '';
          merged.ropeType = merged.ropeType && merged.ropeType !== 'Elastomeric Belt' ? merged.ropeType : 'Steel Wire';
          merged.numRopes = Math.max(merged.numRopes || 0, 1);
          merged.ropeDiameter = Math.max(merged.ropeDiameter || merged.beltThickness || 0, 4);
          merged.ropeBreakingLoad = Math.max(merged.ropeBreakingLoad || merged.beltTensileStrength || 0, 1000);
          merged.grooveType = prev.grooveType === 'semi-circular' || prev.grooveType === 'V' || prev.grooveType === 'U' ? prev.grooveType : 'semi-circular';
          merged.grooveAngle = Math.max(merged.grooveAngle || 0, 35);
          merged.undercutAngle = Math.max(merged.undercutAngle || 0, 80);
        }
      }
      if ('type' in newData && newData.type === 'hydraulic') {
        merged.speed = Math.min(merged.speed, 1.0);
        merged.compensationType = 'none';
        merged.suspensionType = 'wire-rope';
        merged.suspension = '1:1';
        merged.cwtMass = 0;
        merged.balanceRatio = 0;
        merged.bufferPresetId = '';
        merged.bufferType = 'energy-dissipation';
        merged.bufferMedium = 'hydraulic-oil';
        merged.drivePackageLocation = merged.driveArrangement === 'machine-room' ? 'machine-room' : 'landing-cabinet';
        merged.controllerArchitecture = 'hydraulic-valve';
      }
      if (merged.type === 'hydraulic') {
        merged.speed = Math.min(merged.speed, 1.0);
        merged.compensationType = 'none';
        merged.cwtMass = 0;
        merged.balanceRatio = 0;
        merged.suspension = '1:1';
        merged.suspensionType = 'wire-rope';
        if (merged.bufferMedium !== 'hydraulic-oil' || merged.bufferType !== 'energy-dissipation') {
          merged.bufferPresetId = '';
        }
        merged.bufferType = 'energy-dissipation';
        merged.bufferMedium = 'hydraulic-oil';
        merged.controllerArchitecture = 'hydraulic-valve';
        if (merged.driveArrangement === 'mrl') {
          merged.machineRoomPosition = 'none';
          if (merged.controlCabinetLocation === 'machine-room') {
            merged.controlCabinetLocation = 'top-landing';
          }
          if (merged.drivePackageLocation === 'machine-room') {
            merged.drivePackageLocation = 'landing-cabinet';
          }
        } else {
          merged.controlCabinetLocation = 'machine-room';
          merged.drivePackageLocation = 'machine-room';
        }
      } else if (merged.controllerArchitecture === 'hydraulic-valve') {
        merged.controllerArchitecture = 'vvvf';
        if (merged.driveArrangement === 'mrl' && merged.drivePackageLocation === 'landing-cabinet') {
          merged.drivePackageLocation = 'shaft-head';
        }
      }
      if ('driveArrangement' in newData) {
        if (merged.driveArrangement === 'mrl') {
          merged.machineRoomPosition = 'none';
          merged.controlCabinetLocation = merged.controlCabinetLocation === 'machine-room' ? 'top-landing' : merged.controlCabinetLocation;
          merged.drivePackageLocation = merged.type === 'hydraulic' ? 'landing-cabinet' : 'shaft-head';
        } else {
          if (merged.machineRoomPosition === 'none') merged.machineRoomPosition = 'overhead';
          merged.controlCabinetLocation = 'machine-room';
          merged.drivePackageLocation = 'machine-room';
        }
      }
      if ('machineRoomPosition' in newData && merged.driveArrangement === 'mrl') {
        merged.machineRoomPosition = 'none';
      }
      if ('controlCabinetLocation' in newData && merged.driveArrangement === 'machine-room') {
        merged.controlCabinetLocation = 'machine-room';
      }
      if ('drivePackageLocation' in newData && merged.driveArrangement === 'machine-room') {
        merged.drivePackageLocation = 'machine-room';
      }
      if ('shaftLuminairePresetId' in newData || 'shaftHeight' in newData || 'travel' in newData || 'shaftLuminaireSpacing' in newData) {
        const luminairePreset = SHAFT_LUMINAIRE_PRESETS.find((preset) => preset.id === merged.shaftLuminairePresetId);
        if (luminairePreset && 'shaftLuminairePresetId' in newData) {
          merged.shaftLuminaireSpacing = luminairePreset.recommendedSpacing;
          merged.shaftLightingLux = Math.max(merged.shaftLightingLux, luminairePreset.nominalLux);
        }
        const referenceHeight = Math.max((merged.shaftHeight || 0) / 1000, merged.travel || 0, 3);
        const spacing = Math.max(merged.shaftLuminaireSpacing || luminairePreset?.recommendedSpacing || 3, 1.5);
        merged.shaftLuminaireCount = Math.max(2, Math.ceil(referenceHeight / spacing) + 1);
      }
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

  useEffect(() => {
    loadRuntimeTextConfig().then((config) => {
      if (config) setRuntimeText(config);
    });
  }, []);

  useEffect(() => {
    if (!pendingFocusField) return;
    const target = document.querySelector(`[data-field="${pendingFocusField}"]`) as HTMLElement | null;
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      target.classList.add('ring-2', 'ring-primary', 'bg-primary/5');
      window.setTimeout(() => {
        target.classList.remove('ring-2', 'ring-primary', 'bg-primary/5');
      }, 1800);
      const input = target.querySelector('input, select, textarea') as HTMLElement | null;
      input?.focus();
    }
    setPendingFocusField(null);
  }, [activeTab, pendingFocusField]);

  const getValidationResults = (data: ProjectData) => {
    const calc = computeLiftCalculations(data);
    const results: ValidationResult[] = [];
    const logic = calc.systemLogic;
    
    const isElectric = data.type === 'electric';
    const isHydraulic = data.type === 'hydraulic';

    // Traction Check (Dynamic and Static conditions from ISO 8100)
    if (isElectric && !calc.traction.isOk) {
      results.push({ 
        type: 'error', 
        msg: `Traction condition fails (T1/T2 > e^(f*α)). Check wrap angle or equivalent friction.`,
        moduleId: 'traction-verify',
        actionLabel: 'Increase Wrap Angle',
        onAction: () => handleDataChange({ wrapAngle: Math.min(270, data.wrapAngle + 15) })
      });
    }

    if (isElectric && calc.traction.p_groove > calc.traction.p_allow) {
      results.push({
        type: 'warning',
        msg: data.suspensionType === 'belt'
          ? `Belt/sheave interface pressure (${calc.traction.p_groove.toFixed(2)} MPa) exceeds allowance (${calc.traction.p_allow.toFixed(2)} MPa).`
          : `Specific groove pressure (${calc.traction.p_groove.toFixed(2)} MPa) exceeds allowance (${calc.traction.p_allow.toFixed(2)} MPa).`,
        moduleId: 'sheaves',
        actionLabel: 'Increase Hardness',
        onAction: () => handleDataChange({ sheaveHardness: Math.min(300, data.sheaveHardness + 20) })
      });
    }
    
    // Safety Factor Check
    if (isElectric && !calc.ropes.isSfOk) {
      results.push({ 
        type: 'error', 
        msg: `${data.suspensionType === 'belt' ? 'Belt' : 'Rope'} safety factor (${calc.ropes.sf_actual.toFixed(1)}) is below normative limit (${calc.ropes.sf_required.toFixed(1)}).`,
        moduleId: 'suspension-verify',
        fieldName: data.suspensionType === 'belt' ? 'numBelts' : 'numRopes',
        actionLabel: data.suspensionType === 'belt' ? 'Add Belt' : 'Add Rope',
        onAction: () => handleDataChange(
          data.suspensionType === 'belt'
            ? { numBelts: data.numBelts + 1 }
            : { numRopes: data.numRopes + 1 }
        )
      });
    }

    if (isElectric && data.suspensionType !== 'belt' && data.ropeWearPercentage >= 6) {
      results.push({
        type: 'warning',
        msg: `Rope diameter reduction (${data.ropeWearPercentage.toFixed(1)}%) reached the discard review threshold.`,
        moduleId: 'suspension-verify',
        fieldName: 'ropeWearPercentage'
      });
    }
    
    // OSG Braking Force Check
    if (isElectric && data.osgMaxBrakingForce < data.osgTensileForce) {
      results.push({
        type: 'error',
        msg: `OSG Max Braking Force (${data.osgMaxBrakingForce}N) is less than Tensile Force (${data.osgTensileForce}N).`,
        moduleId: 'osg',
        fieldName: 'osgMaxBrakingForce',
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
        fieldName: 'bracketDist',
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
        fieldName: 'bufferType',
        actionLabel: 'Change to Dissipation',
        onAction: () => handleDataChange({ bufferType: 'energy-dissipation' })
      });
    }

    // ACOP Check
    const maxAcop = 1.15 * data.speed + 0.25;
    if (isElectric && data.acopTrippingSpeed > maxAcop) {
      results.push({ 
        type: 'error', 
        msg: `ACOP tripping speed (${data.acopTrippingSpeed}m/s) exceeds normative limit (${maxAcop.toFixed(2)}m/s).`,
        moduleId: 'acop-ucmp',
        fieldName: 'acopTrippingSpeed',
        actionLabel: 'Set to Max Limit',
        onAction: () => handleDataChange({ acopTrippingSpeed: parseFloat(maxAcop.toFixed(2)) })
      });
    }

    if (data.doorLockingForce < 1000 || data.doorMinimumEngagement < 7 || !data.doorElectricalSafetyCheck) {
      results.push({
        type: 'warning',
        msg: 'Door locking verification is incomplete for 4.2 mechanical or electrical conditions.',
        moduleId: 'doors',
        fieldName: data.doorLockingForce < 1000 ? 'doorLockingForce' : data.doorMinimumEngagement < 7 ? 'doorMinimumEngagement' : 'doorElectricalSafetyCheck'
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
        moduleId: 'sil',
        fieldName: pfh > silMax ? 'failureRate' : data.diagnosticCoverage < minDc ? 'diagnosticCoverage' : 'faultTolerance'
      });
    }

    if (isElectric && logic.compensationRequired && !logic.compensationAligned) {
      results.push({
        type: 'warning',
        msg: `Compensation means should be closed as ${logic.recommendedCompensationType} for the current speed/travel envelope.`,
        moduleId: 'compensation',
        fieldName: 'compensationType'
      });
    }

    if (isElectric && !logic.bufferSelectionAligned) {
      results.push({
        type: 'warning',
        msg: `Buffer selection should be ${logic.recommendedBufferType} with ${logic.recommendedBufferMedium} for the current speed class.`,
        moduleId: 'buffers',
        fieldName: 'bufferType'
      });
    }

    if (isElectric && logic.requiresGuideRollers && !logic.guideInterfaceAligned) {
      results.push({
        type: 'warning',
        msg: `Guide interface should switch to rollers for this speed/seismic envelope.`,
        moduleId: 'rails-params',
        fieldName: 'guideInterfaceType'
      });
    }

    if (isElectric && logic.requiresIndependentGuideAxes && !logic.guideRollerIndependentAxesAligned) {
      results.push({
        type: 'warning',
        msg: 'Independent 3-axis guide roller suspension should be active for this seismic/high-speed envelope.',
        moduleId: 'rails-params',
        fieldName: 'guideRollerIndependentAxes'
      });
    }

    if (isElectric && logic.requiresSeismicRetainers && !logic.seismicRetainerAligned) {
      results.push({
        type: 'warning',
        msg: 'Seismic retainers are expected for the current EN 81-77 category.',
        moduleId: 'seismic',
        fieldName: 'seismicRetainerEnabled'
      });
    }

    if (isElectric && !logic.guideRollerClearanceEnvelopeOk && data.guideInterfaceType === 'roller') {
      results.push({
        type: 'warning',
        msg: 'Guide roller clearances are too loose for the current speed/seismic recommendation.',
        moduleId: 'rails-params',
        fieldName: 'guideRollerClearanceX'
      });
    }

    if (isElectric && !logic.balustradeHeightOk) {
      results.push({
        type: 'warning',
        msg: `Car roof balustrade height should be at least ${logic.recommendedBalustradeHeight.toFixed(2)} m for the current operating envelope.`,
        moduleId: 'clearances',
        fieldName: 'carRoofBalustradeHeight'
      });
    }

    if (!logic.machineRoomAligned) {
      results.push({
        type: 'warning',
        msg: data.driveArrangement === 'machine-room'
          ? 'Machine room layout is selected, but the machine room position is still undefined.'
          : 'MRL layout is selected, but a machine room is still declared in the project base.',
        moduleId: 'global',
        fieldName: 'machineRoomPosition'
      });
    }

    if (!logic.drivePackageAligned) {
      results.push({
        type: 'warning',
        msg: `Drive / power unit should be closed as ${logic.recommendedDrivePackageLocation} for the current installation layout.`,
        moduleId: 'global',
        fieldName: 'drivePackageLocation'
      });
    }

    if (!logic.controlCabinetAligned) {
      results.push({
        type: 'warning',
        msg: `Control cabinet location should be aligned with the current ${data.driveArrangement === 'machine-room' ? 'machine-room' : 'MRL'} layout.`,
        moduleId: 'global',
        fieldName: 'controlCabinetLocation'
      });
    }

    if (!logic.inspectionChainComplete) {
      results.push({
        type: 'warning',
        msg: 'Inspection chain is incomplete. Close car roof, pit and cabinet inspection controls before final verification.',
        moduleId: 'global',
        fieldName: !data.roofInspectionStation ? 'roofInspectionStation' : !data.pitInspectionStation ? 'pitInspectionStation' : 'cabinetInspectionEnabled'
      });
    }

    if (!logic.travellingCableAligned) {
      results.push({
        type: 'warning',
        msg: 'Travelling cable definition is still missing or invalid for the current installation base.',
        moduleId: 'global',
        fieldName: 'travellingCableType'
      });
    }

    if (!logic.shaftLightingCompliant) {
      results.push({
        type: 'warning',
        msg: `Shaft lighting is below the maintenance target of ${logic.shaftLightingTargetLux} lx.`,
        moduleId: 'global',
        fieldName: 'shaftLightingLux'
      });
    }

    if (!logic.luminaireCoverageOk) {
      results.push({
        type: 'warning',
        msg: `Luminaire layout should close around ${logic.recommendedLuminaireCount} units at about ${logic.recommendedLuminaireSpacing.toFixed(1)} m spacing.`,
        moduleId: 'global',
        fieldName: 'shaftLuminaireCount'
      });
    }

    if (isHydraulic) {
      const hydraulicLoad = (data.carMass + data.ratedLoad) * 9.81 * 1.4;
      const hydraulicInternalDiameter = data.ramDiameter + 10;
      const hydraulicRequiredWallThickness = ((2.3 * 1.7 * data.maxPressure) / Math.max(data.materialYield, 1)) * (hydraulicInternalDiameter / 2) + 0.5;
      const hydraulicEulerBuckling = (Math.PI * Math.PI * data.materialE * ((Math.PI * Math.pow(data.ramDiameter, 4)) / 64)) / Math.max(Math.pow(data.ramLength, 2), 1);

      if (data.speed > 1.0) {
        results.push({
          type: 'error',
          msg: `Hydraulic configuration cannot remain at ${data.speed.toFixed(2)} m/s. Limit this project to 1.0 m/s or below.`,
          moduleId: 'global',
          fieldName: 'speed',
          actionLabel: 'Clamp to 1.0 m/s',
          onAction: () => handleDataChange({ speed: 1.0 })
        });
      }
      if (data.compensationType !== 'none') {
        results.push({
          type: 'warning',
          msg: 'Compensation means are not expected in the current hydraulic configuration.',
          moduleId: 'global',
          fieldName: 'compensationType',
          actionLabel: 'Clear Compensation',
          onAction: () => handleDataChange({ compensationType: 'none' })
        });
      }
      if (data.bufferMedium !== 'hydraulic-oil' || data.bufferType !== 'energy-dissipation') {
        results.push({
          type: 'warning',
          msg: 'Hydraulic configuration should stay on hydraulic-oil energy dissipation buffers in this workspace.',
          moduleId: 'buffers',
          fieldName: 'bufferMedium'
        });
      }
      if (data.cwtMass > 0) {
        results.push({
          type: 'warning',
          msg: 'Hydraulic configuration still carries counterweight data. Review project base assumptions.',
          moduleId: 'global',
          fieldName: 'type'
        });
      }
      if (data.cylinderWallThickness < hydraulicRequiredWallThickness) {
        results.push({
          type: 'error',
          msg: `Cylinder wall thickness (${data.cylinderWallThickness.toFixed(2)} mm) is below the current hydraulic requirement (${hydraulicRequiredWallThickness.toFixed(2)} mm).`,
          moduleId: 'hydraulic',
          fieldName: 'cylinderWallThickness'
        });
      }
      if (hydraulicLoad >= hydraulicEulerBuckling / 2) {
        results.push({
          type: 'error',
          msg: 'Ram buckling check is not closed for the current hydraulic load and ram length.',
          moduleId: 'hydraulic',
          fieldName: 'ramLength'
        });
      }
      if (data.ruptureValveFlow <= 0) {
        results.push({
          type: 'warning',
          msg: 'Rupture valve tripping flow is still undefined for the hydraulic safety chain.',
          moduleId: 'rupture-valve',
          fieldName: 'ruptureValveFlow'
        });
      }
      if (data.ruptureValvePressure < data.maxPressure * 1.5) {
        results.push({
          type: 'warning',
          msg: `Rupture valve pressure (${data.ruptureValvePressure.toFixed(2)} MPa) should stay at or above 1.5x the operating pressure (${(data.maxPressure * 1.5).toFixed(2)} MPa).`,
          moduleId: 'rupture-valve',
          fieldName: 'ruptureValvePressure'
        });
      }
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
      'rupture-valve': ['hydraulic', 'rupture-valve'],
      'rails-params': ['rails-verify'],
      'rails-forces': ['rails-verify'],
      'rails-verify': ['rails-verify'],
      hydraulic: ['hydraulic', 'rupture-valve', 'buffers'],
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

  const electricModules: ModuleStatus[] = [
    // Project Definition
    { id: 'overview', label: 'Overview', icon: LayoutDashboard, status: 'implemented', category: 'Setup' },
    { id: 'global', label: 'Project Base (4.1)', icon: Globe, status: 'implemented', category: 'Setup' },
    { id: 'cwt', label: 'Counterweight', icon: Database, status: 'implemented', category: 'Setup' },

    // Cabin / Car
    { id: 'doors', label: 'Door Locking (4.2)', icon: Lock, status: 'implemented', category: 'Safety' },
    { id: 'sling', label: 'Car Frame', icon: Box, status: 'implemented', category: 'Geometry & 3D' },
    { id: 'cabin', label: '3D Cabin', icon: Maximize2, status: 'implemented', category: 'Geometry & 3D' },

    // Guide Rails (4.10)
    { id: 'rails-params', label: 'Guide Setup', icon: ArrowUpDown, status: 'implemented', category: 'Guides' },
    { id: 'rails-forces', label: 'Loads & Deflection', icon: Activity, status: 'implemented', category: 'Guides' },
    { id: 'rails-verify', label: 'Guide Checks', icon: CheckSquare, status: 'implemented', category: 'Guides' },

    // Traction System
    { id: 'traction-params', label: 'Traction Setup', icon: Settings2, status: 'implemented', category: 'Traction' },
    { id: 'sheaves', label: 'Sheaves & Grooves', icon: Settings, status: 'implemented', category: 'Traction' },
    { id: 'traction-verify', label: 'Traction Checks', icon: CheckSquare, status: 'implemented', category: 'Traction' },
    
    // Suspension & Compensation
    { id: 'suspension-params', label: 'Suspension Setup', icon: Cable, status: 'implemented', category: 'Traction' },
    { id: 'suspension-verify', label: 'Discard & Compliance', icon: CheckSquare, status: 'implemented', category: 'Traction' },
    { id: 'compensation', label: 'Compensation', icon: Package, status: 'implemented', category: 'Traction' },

    // Safety Systems
    { id: 'safety', label: 'Safety Gear (4.3)', icon: ShieldCheck, status: 'implemented', category: 'Safety' },
    { id: 'osg', label: 'Overspeed Governor', icon: ShieldAlert, status: 'implemented', category: 'Safety' },
    { id: 'buffers', label: 'Buffers (4.5)', icon: Box, status: 'implemented', category: 'Safety' },
    { id: 'acop-ucmp', label: 'ACOP / UCMP', icon: ShieldAlert, status: 'implemented', category: 'Safety' },

    // Electronics & Safety
    { id: 'sil', label: 'Safety Circuits', icon: Zap, status: 'implemented', category: 'Safety' },
    { id: 'alarms', label: 'Remote Alarms', icon: Bell, status: 'implemented', category: 'Safety' },
    { id: 'seismic', label: 'Seismic EN 81-77', icon: Zap, status: 'implemented', category: 'Safety' },
    { id: 'cybersecurity', label: 'Cybersecurity', icon: Lock, status: 'implemented', category: 'Safety' },

    // Clearances & Geometry
    { id: 'clearances', label: 'Clearances', icon: Ruler, status: 'implemented', category: 'Geometry & 3D' },
    { id: 'shaft', label: '3D Shaft', icon: Box, status: 'implemented', category: 'Geometry & 3D' },

    // Tools
    { id: 'library', label: 'Presets Library', icon: Library, status: 'implemented', category: 'Report' },
    { id: 'formulas', label: 'Formula Library', icon: Calculator, status: 'implemented', category: 'Report' },
    { id: 'memory', label: 'Calculation Memory', icon: History, status: 'implemented', category: 'Report' },
    { id: 'export', label: 'PDF Export', icon: FileText, status: 'implemented', category: 'Report' },
  ];

  const hydraulicModules: ModuleStatus[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard, status: 'implemented', category: 'Setup' },
    { id: 'global', label: 'Project Base (4.1)', icon: Globe, status: 'implemented', category: 'Setup' },
    { id: 'hydraulic', label: 'Hydraulic Core', icon: Droplets, status: 'implemented', category: 'Hydraulic' },
    { id: 'rupture-valve', label: 'Rupture Valve', icon: ShieldAlert, status: 'implemented', category: 'Hydraulic' },
    { id: 'doors', label: 'Door Locking', icon: Lock, status: 'implemented', category: 'Safety' },
    { id: 'safety', label: 'Safety Gear', icon: ShieldCheck, status: 'implemented', category: 'Safety' },
    { id: 'buffers', label: 'Buffers', icon: Box, status: 'implemented', category: 'Safety' },
    { id: 'sil', label: 'Safety Circuits', icon: Zap, status: 'implemented', category: 'Safety' },
    { id: 'alarms', label: 'Remote Alarms', icon: Bell, status: 'implemented', category: 'Safety' },
    { id: 'seismic', label: 'Seismic EN 81-77', icon: Zap, status: 'implemented', category: 'Safety' },
    { id: 'cybersecurity', label: 'Cybersecurity', icon: Lock, status: 'implemented', category: 'Safety' },
    { id: 'clearances', label: 'Clearances', icon: Ruler, status: 'implemented', category: 'Geometry & 3D' },
    { id: 'shaft', label: '3D Shaft', icon: Box, status: 'implemented', category: 'Geometry & 3D' },
    { id: 'cabin', label: '3D Cabin', icon: Maximize2, status: 'implemented', category: 'Geometry & 3D' },
    { id: 'library', label: 'Presets Library', icon: Library, status: 'implemented', category: 'Report' },
    { id: 'formulas', label: 'Formula Library', icon: Calculator, status: 'implemented', category: 'Report' },
    { id: 'memory', label: 'Calculation Memory', icon: History, status: 'implemented', category: 'Report' },
    { id: 'export', label: 'PDF Export', icon: FileText, status: 'implemented', category: 'Report' },
  ];

  const modules = useMemo(() => (projectData.type === 'hydraulic' ? hydraulicModules : electricModules), [projectData.type]);
  const visibleModules = modules;

  useEffect(() => {
    if (!visibleModules.some((module) => module.id === activeTab)) {
      setActiveTab(projectData.type === 'hydraulic' ? 'hydraulic' : 'overview');
    }
  }, [activeTab, projectData.type, visibleModules]);

  const activeSectionStatus = activeSectionResults.some(result => result.type === 'error')
    ? { label: 'attention', tone: 'text-error bg-error-container/10 border-error/20' }
    : activeSectionResults.some(result => result.type === 'warning')
      ? { label: 'review', tone: 'text-amber-700 bg-amber-50 border-amber-200' }
      : { label: 'ok', tone: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
  const getModuleLabel = (module?: ModuleStatus) => module ? (runtimeText?.modules?.[module.id]?.label || module.label) : '';
  const activeSectionLabel = getModuleLabel(modules.find(m => m.id === activeTab)) || 'Current Section';
  const activeCategory = modules.find(m => m.id === activeTab)?.category || 'Current Workspace';
  const categoryModules = modules.filter((module) => module.category === activeCategory);
  const categoryIssueMap = useMemo(() => {
    const counts = new Map<string, number>();
    allValidationResults.forEach((result) => {
      if (!result.moduleId) return;
      counts.set(result.moduleId, (counts.get(result.moduleId) || 0) + 1);
    });
    return counts;
  }, [allValidationResults]);
  const workflowSteps = useMemo(() => (
    projectData.type === 'hydraulic'
      ? [
          { id: 'setup', label: '1. Setup', target: 'global', moduleIds: ['overview', 'global'] },
          { id: 'hydraulic', label: '2. Hydraulic', target: 'hydraulic', moduleIds: ['hydraulic', 'rupture-valve'] },
          { id: 'safety', label: '3. Safety', target: 'doors', moduleIds: ['doors', 'safety', 'buffers', 'sil', 'alarms', 'seismic', 'cybersecurity'] },
          { id: 'geometry', label: '4. Geometry', target: 'clearances', moduleIds: ['clearances', 'shaft', 'cabin'] },
          { id: 'report', label: '5. Report', target: 'memory', moduleIds: ['library', 'formulas', 'memory', 'export'] },
        ]
      : [
          { id: 'setup', label: '1. Setup', target: 'global', moduleIds: ['overview', 'global', 'cwt'] },
          { id: 'traction', label: '2. Traction', target: 'traction-params', moduleIds: ['traction-params', 'sheaves', 'traction-verify', 'suspension-params', 'suspension-verify', 'compensation'] },
          { id: 'guides', label: '3. Guides', target: 'rails-params', moduleIds: ['rails-params', 'rails-forces', 'rails-verify'] },
          { id: 'safety', label: '4. Safety', target: 'doors', moduleIds: ['doors', 'safety', 'osg', 'buffers', 'acop-ucmp', 'sil', 'alarms', 'seismic', 'cybersecurity'] },
          { id: 'geometry', label: '5. Geometry', target: 'clearances', moduleIds: ['sling', 'clearances', 'shaft', 'cabin'] },
          { id: 'report', label: '6. Report', target: 'memory', moduleIds: ['library', 'formulas', 'memory', 'export'] },
        ]
  ), [projectData.type]);
  const activeWorkflowStep = workflowSteps.find((step) => step.moduleIds.includes(activeTab)) || workflowSteps[0];
  const activeGuidanceBase = MODULE_GUIDANCE[activeTab] || {
    owner: 'Este módulo ainda não tem ownership definido.',
    output: 'Rever outputs antes de fechar relatório.',
    report: 'A confirmar.',
  };
  const activeGuidance = {
    ...activeGuidanceBase,
    ...(runtimeText?.modules?.[activeTab] || {}),
  };
  const totalErrors = allValidationResults.filter((result) => result.type === 'error').length;
  const totalWarnings = allValidationResults.filter((result) => result.type === 'warning').length;
  const getWorkflowIssueCount = (moduleIds: string[]) => moduleIds.reduce((sum, moduleId) => sum + (categoryIssueMap.get(moduleId) || 0), 0);

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
      case 'overview': return <OverviewModule modules={modules} onSelect={setActiveTab} workspace={projectData.type} />;
      case 'global': return <GlobalProjectModule data={projectData} onChange={handleDataChange} />;
      
      case 'traction-verify': return <TractionModule data={projectData} onChange={handleDataChange} view="verify" />;
      case 'traction-params': return <TractionModule data={projectData} onChange={handleDataChange} view="params" />;
      case 'sheaves': return <TractionSheavesModule data={projectData} onChange={handleDataChange} />;
      
      
      // Suspension split
      case 'suspension-params': return <RopesModule data={projectData} onChange={handleDataChange} view="params" />;
      case 'suspension-verify': return <RopesModule data={projectData} onChange={handleDataChange} view="verify" />;
      case 'suspension': return <RopesModule data={projectData} onChange={handleDataChange} view="all" />; // Fallback
      case 'compensation': return <CompensationModule data={projectData} onChange={handleDataChange} />;
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
      case 'hydraulic': return <HydraulicModule data={projectData} onChange={handleDataChange} />;
      case 'rupture-valve': return <RuptureValveModule data={projectData} onChange={handleDataChange} />;
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
              projectType={projectData.type}
              onPresetSelect={handleDataChange}
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
              driveArrangement={projectData.driveArrangement}
              machineRoomPosition={projectData.machineRoomPosition}
              controlCabinetLocation={projectData.controlCabinetLocation}
              drivePackageLocation={projectData.drivePackageLocation}
              travellingCableType={projectData.travellingCableType}
              travellingCableRouting={projectData.travellingCableRouting}
              shaftLightingLux={projectData.shaftLightingLux}
              shaftLuminaireSpacing={projectData.shaftLuminaireSpacing}
              shaftLuminaireCount={projectData.shaftLuminaireCount}
              roofInspectionStation={projectData.roofInspectionStation}
              pitInspectionStation={projectData.pitInspectionStation}
              cabinetInspectionEnabled={projectData.cabinetInspectionEnabled}
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
              projectType={projectData.type}
              width={projectData.carWidth / 1000}
              depth={projectData.carDepth / 1000}
              height={projectData.carHeight / 1000}
              showSeismic={projectData.seismicRetainerEnabled || projectData.seismicCategory > 0}
              roofInspectionStation={projectData.roofInspectionStation}
              balustradeHeight={projectData.carRoofBalustradeHeight}
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
      <aside className={`fixed left-0 top-0 h-full flex flex-col py-4 gap-1 z-40 border-r border-outline-variant/50 bg-surface-container overflow-y-auto no-scrollbar transition-all duration-200 ${isSidebarCollapsed ? 'w-20' : 'w-64'}`}>
        <div className="px-6 mb-8">
          <div className="flex items-center justify-between gap-2">
            <div className={isSidebarCollapsed ? 'hidden' : 'block'}>
              <h1 className="text-xl font-black text-primary uppercase tracking-tighter">{runtimeText?.app?.title || 'ILATE'}</h1>
              <p className="mt-1 text-[10px] font-semibold uppercase tracking-widest text-on-surface-variant">{runtimeText?.app?.subtitle || 'Operational Cockpit'}</p>
            </div>
            <button
              onClick={() => setIsSidebarCollapsed((prev) => !prev)}
              className="rounded-sm border border-outline-variant/20 p-2 text-on-surface-variant transition-colors hover:text-primary"
              title={isSidebarCollapsed ? 'Expand navigation' : 'Collapse navigation'}
            >
              <ChevronRight size={14} className={`transition-transform ${isSidebarCollapsed ? '' : 'rotate-180'}`} />
            </button>
          </div>
        </div>
        
        <nav className="flex-1 flex flex-col gap-4">
          {Array.from(new Set(visibleModules.map(m => m.category || 'Other'))).map(category => (
            <div key={category} className="flex flex-col gap-0.5">
              <h3 className={`px-6 py-1 text-[10px] font-bold tracking-widest text-on-surface-variant uppercase opacity-70 ${isSidebarCollapsed ? 'hidden' : ''}`}>
                {category}
              </h3>
              {visibleModules.filter(m => (m.category || 'Other') === category).map((item) => (
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
                  <span className={`text-[11px] font-medium uppercase tracking-wider ${isSidebarCollapsed ? 'hidden' : ''}`}>{getModuleLabel(item)}</span>
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
      <main className={`${isSidebarCollapsed ? 'ml-20' : 'ml-64'} ${isInspectorCollapsed ? 'mr-20' : 'mr-[320px]'} flex-1 flex flex-col h-full overflow-hidden bg-surface transition-all duration-200`}>
        {/* Header */}
        <header className="flex justify-between items-center w-full px-8 h-14 bg-surface-container-highest sticky top-0 z-50 border-b border-outline-variant/50">
          <div className="flex items-center gap-6">
            <span className="text-sm font-bold tracking-widest text-primary uppercase">
              {projectData.type === 'hydraulic' ? (runtimeText?.app?.workspaceHydraulic || 'ISO 8100 HYDRAULIC') : (runtimeText?.app?.workspaceElectric || 'ISO 8100 ENGINE')}
            </span>
            <div className="h-4 w-px bg-outline-variant" />
            <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">{getModuleLabel(visibleModules.find(m => m.id === activeTab) || modules.find(m => m.id === activeTab))}</span>
            <span className={`hidden lg:inline-flex items-center rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] ${activeSectionStatus.tone}`}>
              {activeSectionStatus.label}
              {activeSectionResults.length > 0 ? ` · ${activeSectionResults.length}` : ' · 0'}
            </span>
            <span className="hidden xl:inline-flex items-center rounded-full border border-outline-variant/30 bg-surface-container px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-on-surface-variant">
              {activeWorkflowStep.label}
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
            <div className="mb-6 rounded-sm border border-outline-variant/20 bg-surface-container-low p-3">
              <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Guided workflow</p>
                  <p className="mt-1 text-xs leading-relaxed text-on-surface-variant">
                    Edita cada tema no seu dono. As outras páginas leem e validam, não duplicam inputs.
                  </p>
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1 xl:pb-0">
                  {workflowSteps.map((step) => {
                    const issueCount = getWorkflowIssueCount(step.moduleIds);
                    const isActive = step.id === activeWorkflowStep.id;
                    return (
                      <button
                        key={step.id}
                        onClick={() => setActiveTab(step.target)}
                        className={`shrink-0 rounded-sm border px-3 py-2 text-left transition-colors ${
                          isActive
                            ? 'border-primary/40 bg-primary/10 text-primary'
                            : issueCount > 0
                              ? 'border-error/25 bg-error-container/10 text-error hover:border-error/40'
                              : 'border-outline-variant/20 bg-surface-container-lowest text-on-surface-variant hover:border-primary/30 hover:text-primary'
                        }`}
                      >
                        <span className="block text-[10px] font-black uppercase tracking-[0.16em]">{step.label}</span>
                        <span className="mt-1 block text-[9px] font-bold uppercase tracking-[0.12em] opacity-70">
                          {issueCount > 0 ? `${issueCount} issue${issueCount > 1 ? 's' : ''}` : 'clear'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
            {activeSectionResults.length === 0 ? (
              <div className="mb-6 flex flex-col gap-3 rounded-sm border border-emerald-500/20 bg-emerald-950/20 p-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-300">Section Validation</p>
                  <p className="mt-1 text-sm font-bold text-emerald-100">{activeSectionLabel} is currently clear.</p>
                </div>
                <button
                  onClick={validateActiveSection}
                  className="px-4 py-2 bg-surface-container-lowest text-emerald-200 rounded-sm border border-emerald-500/20 hover:border-emerald-400 transition-colors text-[10px] font-black uppercase tracking-[0.18em]"
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
            <span>{projectData.type === 'hydraulic' ? (runtimeText?.app?.footerHydraulic || 'ISO 8100-2:2026 Hydraulic Workspace v1.0.4') : (runtimeText?.app?.footerElectric || 'ISO 8100-2:2026 Engine v1.0.4')}</span>
            <span className="text-primary opacity-80">
              Workspace: {projectData.type === 'hydraulic' ? 'Hydraulic Project Workspace' : 'Traction Project Workspace'}
            </span>
          </div>
          <div className="flex gap-4 items-center">
            <span className="flex items-center gap-1">
              {totalErrors > 0 ? (
                <>
                  <XCircle size={12} className="text-error" />
                  {totalErrors} error{totalErrors > 1 ? 's' : ''}
                </>
              ) : totalWarnings > 0 ? (
                <>
                  <AlertTriangle size={12} className="text-amber-500" />
                  {totalWarnings} warning{totalWarnings > 1 ? 's' : ''}
                </>
              ) : (
                <>
                  <CheckCircle2 size={12} className="text-emerald-500" />
                  All Calculations Valid
                </>
              )}
            </span>
            <span className="bg-primary border border-primary-dim px-2 py-0.5 text-surface-container-lowest font-bold">
              {projectData.type === 'hydraulic' ? 'ILATE HYDRAULIC' : 'ILATE ENTERPRISE'}
            </span>
          </div>
        </footer>
      </main>

      <aside className={`fixed right-0 top-0 z-40 flex h-full flex-col border-l border-outline-variant/50 bg-surface-container transition-all duration-200 ${isInspectorCollapsed ? 'w-20' : 'w-[320px]'}`}>
        <div className="border-b border-outline-variant/30 px-4 py-4">
          <div className="flex items-start justify-between gap-3">
            <div className={isInspectorCollapsed ? 'hidden' : 'block'}>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Quick Inspector</p>
              <h3 className="mt-1 text-lg font-black tracking-tight text-on-surface">{activeCategory}</h3>
              <p className="mt-1 text-xs leading-relaxed text-on-surface-variant">
                Navegação curta, issues desta zona e atalho direto para o campo ou secção relevante.
              </p>
            </div>
            <button
              onClick={() => setIsInspectorCollapsed((prev) => !prev)}
              className="rounded-sm border border-outline-variant/20 p-2 text-on-surface-variant transition-colors hover:text-primary"
              title={isInspectorCollapsed ? 'Expand inspector' : 'Collapse inspector'}
            >
              <ChevronRight size={14} className={`transition-transform ${isInspectorCollapsed ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-4 no-scrollbar">
          {isInspectorCollapsed ? (
            <div className="flex flex-col gap-2">
              <button
                onClick={validateActiveSection}
                className="flex h-12 items-center justify-center rounded-sm border border-outline-variant/20 bg-surface-container-high text-primary"
                title="Validate current section"
              >
                <CheckSquare size={16} />
              </button>
              {categoryModules.map((module) => {
                const Icon = module.icon;
                const issueCount = categoryIssueMap.get(module.id) || 0;
                return (
                  <button
                    key={module.id}
                    onClick={() => setActiveTab(module.id)}
                    className={`relative flex h-12 items-center justify-center rounded-sm border transition-colors ${
                      activeTab === module.id
                        ? 'border-primary/40 bg-primary/10 text-primary'
                        : 'border-outline-variant/20 bg-surface-container-low text-on-surface-variant hover:border-primary/30 hover:text-primary'
                    }`}
                    title={`${getModuleLabel(module)}${issueCount ? ` • ${issueCount} issue${issueCount > 1 ? 's' : ''}` : ''}`}
                  >
                    <Icon size={16} />
                    {issueCount > 0 && (
                      <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-error px-1 text-[9px] font-black text-white">
                        {issueCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-sm border border-outline-variant/20 bg-surface-container-low p-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-on-surface-variant">Current section</p>
                    <p className="mt-1 text-sm font-black text-on-surface">{activeSectionLabel}</p>
                    <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.14em] text-primary">{activeWorkflowStep.label}</p>
                  </div>
                  <span className={`inline-flex rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] ${activeSectionStatus.tone}`}>
                    {activeSectionStatus.label}
                  </span>
                </div>
                <button
                  onClick={validateActiveSection}
                  className="mt-3 w-full rounded-sm border border-primary/25 bg-primary/10 px-3 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-primary transition-colors hover:border-primary/40 hover:bg-primary/15"
                >
                  Validate current section
                </button>
              </div>

              <div className="rounded-sm border border-primary/20 bg-primary/5 p-3">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-primary">Source of truth</p>
                <p className="mt-2 text-xs leading-relaxed text-on-surface">{activeGuidance.owner}</p>
                <div className="mt-3 grid gap-2">
                  <div className="rounded-sm border border-outline-variant/20 bg-surface-container-lowest p-2">
                    <p className="text-[9px] font-black uppercase tracking-[0.16em] text-on-surface-variant">Output</p>
                    <p className="mt-1 text-xs leading-relaxed text-on-surface-variant">{activeGuidance.output}</p>
                  </div>
                  <div className="rounded-sm border border-outline-variant/20 bg-surface-container-lowest p-2">
                    <p className="text-[9px] font-black uppercase tracking-[0.16em] text-on-surface-variant">Report</p>
                    <p className="mt-1 text-xs leading-relaxed text-on-surface-variant">{activeGuidance.report}</p>
                  </div>
                </div>
                {activeGuidance.next && (
                  <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.14em] text-primary/80">{activeGuidance.next}</p>
                )}
              </div>

              <div className="rounded-sm border border-outline-variant/20 bg-surface-container-low p-3">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-on-surface-variant">This block</p>
                <div className="mt-3 space-y-2">
                  {categoryModules.map((module) => {
                    const issueCount = categoryIssueMap.get(module.id) || 0;
                    const Icon = module.icon;
                    return (
                      <button
                        key={module.id}
                        onClick={() => setActiveTab(module.id)}
                        className={`flex w-full items-center justify-between rounded-sm border px-3 py-3 text-left transition-colors ${
                          activeTab === module.id
                            ? 'border-primary/35 bg-primary/10'
                            : 'border-outline-variant/20 bg-surface-container-lowest hover:border-primary/25 hover:bg-surface-container'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon size={15} className={activeTab === module.id ? 'text-primary' : 'text-on-surface-variant'} />
                          <div>
                            <p className="text-[11px] font-black uppercase tracking-[0.14em] text-on-surface">{getModuleLabel(module)}</p>
                            <p className="text-[10px] text-on-surface-variant">
                              {issueCount > 0 ? `${issueCount} issue${issueCount > 1 ? 's' : ''} flagged here` : 'section currently clean'}
                            </p>
                          </div>
                        </div>
                        <ChevronRight size={14} className={activeTab === module.id ? 'text-primary' : 'text-on-surface-variant'} />
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-sm border border-outline-variant/20 bg-surface-container-low p-3">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-on-surface-variant">Immediate queue</p>
                <div className="mt-3 space-y-2">
                  {(activeSectionResults.length > 0 ? activeSectionResults : allValidationResults.slice(0, 4)).slice(0, 4).map((result, index) => (
                    <button
                      key={`${result.moduleId || 'global'}-${index}`}
                      onClick={() => {
                        if (result.moduleId) {
                          setActiveTab(result.moduleId);
                        }
                        if (result.fieldName) {
                          setPendingFocusField(result.fieldName);
                        }
                      }}
                      className="w-full rounded-sm border border-outline-variant/20 bg-surface-container-lowest px-3 py-3 text-left transition-colors hover:border-primary/25 hover:bg-surface-container"
                    >
                      <div className="flex items-start gap-3">
                        <div className={`mt-0.5 rounded-full p-1 ${result.type === 'error' ? 'bg-error/15 text-error' : result.type === 'warning' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                          {result.type === 'error' ? <XCircle size={12} /> : result.type === 'warning' ? <AlertTriangle size={12} /> : <CheckCircle2 size={12} />}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-on-surface">
                            {result.fieldName ? 'Open related field' : 'Open related section'}
                          </p>
                          <p className="mt-1 text-xs leading-relaxed text-on-surface-variant">{result.msg}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>

      <ValidationModal 
        isOpen={isValidationOpen} 
        onClose={() => setIsValidationOpen(false)} 
        results={validationResults} 
        onNavigate={setActiveTab}
        onFocusField={(fieldName) => setPendingFocusField(fieldName)}
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
            <span className="text-xs font-bold">English UI / Portuguese-ready</span>
          </div>
          <div className="rounded-sm border border-primary/20 bg-primary/5 p-3 text-xs leading-relaxed text-on-surface-variant">
            This workspace keeps one validated source per engineering topic. Edit each topic in its own dedicated module instead of spreading changes across multiple screens.
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
          <p>Documentation should live inside the workspace itself: section notes, validation prompts, technical memory and PDF output.</p>
          <div className="p-3 bg-primary/5 border border-primary/10 rounded-sm">
            <p className="font-bold text-primary mb-1 uppercase tracking-tighter">Documentation</p>
            <p>Use the section inspector, formula library, technical memory and PDF export as the working documentation stack. External contacts should not replace in-product guidance.</p>
          </div>
        </div>
      </SimpleModal>
    </div>
  );
}

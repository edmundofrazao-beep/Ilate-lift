
export interface ProjectData {
  type: 'electric' | 'hydraulic';
  suspension: '1:1' | '2:1' | '4:1';
  ratedLoad: number; // Q (kg)
  carMass: number; // P (kg)
  cwtMass: number; // Mcwt (kg)
  balanceRatio: number; // 0-1 target counterweight balance ratio
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
  railPresetId: string;
  railLubrication: 'dry' | 'oiled' | 'machined';
  // Rope Advanced Properties
  numSimpleBends: number; // Nps
  numReverseBends: number; // Npr
  ropeBreakingLoad: number; // Fmin (N)
  ropeGrade: number; // ISO 4344 Tensile Grade
  ropeWearPercentage: number; // 0-100% reduction in diameter over time
  // Safety Gear Advanced
  safetyGearMaxMass: number; // P+Q max (kg)
  safetyGearBrakingForce: number; // Fb (N)
  safetyGearCertifiedSpeed: number; // m/s
  safetyGearPresetId: string;
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
  bufferPresetId: string;
  bufferIsLinear: boolean;
  bufferForceCurveExponent: number; // For non-linear buffers (Clause 4.5.3)
  bufferManualOverride: boolean;
  bufferManualStroke: number; // mm
  // Sling Properties
  uprightSection: string;
  uprightArea: number; // A (mm2)
  uprightWy: number; // Wy (mm3)
  slingWidth: number; // W (mm)
  slingDepth: number; // D (mm)
  slingHeight: number; // H (mm)
  // Sheave Properties
  sheaveHardness: number; // HB
  sheaveMaterial: string; // Cast Iron, Steel
  sheaveAllowableStress: number; // MPa
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
  doorMinimumEngagement: number; // mm
  doorElectricalSafetyCheck: boolean;
  doorLimitSwitchType: 'NO' | 'NC';
  doorElectricalContinuity: boolean;
  osgMaxBrakingForce: number; // F_max (N)
  osgPresetId: string;
  osgManufacturer: string;
  osgModel: string;
  osgSerialNumber: string;
  // Guide Rail Fastening
  railBoltDiameter: number; // mm
  railNumBoltsPerJoint: number; // count
  // EN 81-28 (Remote Alarms)
  alarmButtonType: 'NO' | 'NC';
  alarmBackupBatteryTime: number; // hours
  alarmCommunicationType: 'PSTN' | 'GSM' | 'VoIP';
  alarmFilteringImplemented: boolean;
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
  suspensionType: 'wire-rope' | 'elastomeric-rope' | 'belt';
  compensationType: 'none' | 'chain' | 'rope';
  grooveType: 'V' | 'semi-circular' | 'U';
  undercutWidth: number; // mm
  ropeAngleOfWrap: number; // deg
  acceleration: number; // m/s2
  deceleration: number; // m/s2
  ropeSpecificPressure: number; // MPa
  ropePresetId: string;
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
  // EN 81-77 Seismic
  seismicCategory: 0 | 1 | 2 | 3;
  designAcceleration: number; // ad (m/s2)
  primaryWaveDetection: boolean;
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
  
  // Cybersecurity (ISO 8100-20)
  cyberNetworkIsolation: boolean;
  cyberAccessControl: 'Basic' | 'Role-Based' | 'Multi-Factor';
  cyberDataEncryption: boolean;
  cyberVulnerabilityPatching: boolean;
  cyberIntrusionDetection: boolean;
}

export interface ModuleStatus {
  id: string;
  label: string;
  icon: any;
  status: 'implemented' | 'partial' | 'placeholder';
  category?: string;
}

export type ProjectFieldName = keyof ProjectData;

export interface StandardDefinition {
  id: string;
  title: string;
  shortTitle: string;
  family: 'ISO' | 'EN';
  year: string;
  role: string;
  status: 'implemented' | 'partial' | 'planned';
  priority: 'foundation' | 'core' | 'extended';
  sourcePath?: string;
}

export interface RuleDefinition {
  id: string;
  standardId: string;
  clause: string;
  title: string;
  subsystem: string;
  applicability: string[];
  requiredInputs: string[];
  moduleIds: string[];
  status: 'implemented' | 'partial' | 'planned';
  severity: 'info' | 'warning' | 'error';
}

export interface StandardsCoverageSummary {
  totalStandards: number;
  implementedStandards: number;
  partialStandards: number;
  plannedStandards: number;
  totalRules: number;
  implementedRules: number;
  partialRules: number;
  plannedRules: number;
}

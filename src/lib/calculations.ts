export function computeLiftCalculations(data: any) {
  const g = 9.81;
  const r = parseInt(data.suspension?.split(':')[0] || '1');
  const d_eff = data.ropeDiameter * (1 - (data.ropeWearPercentage || 0) / 100);

  // Traction Calculations
  const T1_static = ((data.carMass + data.ratedLoad) * g) / r;
  const T2_static = (data.cwtMass * g) / r;
  const T1_dynamic = T1_static * (1 + data.acceleration / g);
  const T2_dynamic = T2_static * (1 - data.acceleration / g);
  
  const mu_dynamic = 0.1 / (1 + data.speed / 10);
  const beta = data.undercutAngle * Math.PI / 180;
  const gamma = data.grooveAngle * Math.PI / 180;
  
  // Apply a small coefficient penalty proportional to wear (up to 15% loss at 10% wear)
  const wearPenalty = 1 - Math.min(1.5 * ((data.ropeWearPercentage || 0) / 100), 0.2);

  let f_load = 0;
  if (data.grooveType === 'V') {
    f_load = data.frictionCoeff * (4 / Math.sin(gamma / 2)) * wearPenalty;
  } else if (data.grooveType === 'semi-circular') {
    f_load = data.frictionCoeff * (4 * (Math.cos(gamma/2) - Math.sin(beta/2))) / (Math.PI - beta - gamma - Math.sin(beta) + Math.sin(gamma)) * wearPenalty;
  } else {
    f_load = data.frictionCoeff * 4 / Math.PI * wearPenalty;
  }
  
  const alpha = data.wrapAngle * Math.PI / 180;
  const expMuAlpha = Math.exp(f_load * alpha);
  const traction_ratio_static = T2_static > 0 ? T1_static / T2_static : 0;
  const traction_ratio_dynamic = T2_dynamic > 0 ? T1_dynamic / T2_dynamic : 0;
  const isTractionOk = traction_ratio_static <= expMuAlpha && traction_ratio_dynamic <= expMuAlpha;

  // Specific Pressure (EN 81-50 / ISO 8100-2 formulas) using effective diameter
  let p_groove = 0;
  if (data.grooveType === 'V') {
    p_groove = (T1_static + T2_static) / (data.numRopes * d_eff * data.sheaveDiameter * Math.sin(gamma / 2));
  } else if (data.grooveType === 'semi-circular') {
    p_groove = (8 * (T1_static + T2_static) * Math.cos(beta / 2)) / (data.numRopes * d_eff * data.sheaveDiameter * (Math.PI - beta - Math.sin(beta)));
  } else {
    // U-groove is essentially semi-circular with beta = 0
    p_groove = (8 * (T1_static + T2_static)) / (data.numRopes * d_eff * data.sheaveDiameter * Math.PI);
  }

  // Allowable Specific Pressure limit approximation based on material & speed
  let base_p = 12.5; 
  if (data.sheaveMaterial === 'Cast Iron') {
    base_p = 9.0;
  } else if (data.sheaveMaterial === 'Ductile Iron') {
    base_p = 10.5;
  } else if (data.sheaveMaterial === 'Steel') {
    base_p = 12.5;
  }
  
  // Scaling limit by rope speed matching typical ISO tables
  const p_allow = base_p / (1 + data.speed / 10);

  // Ropes
  const Fstatic_total = (data.carMass + data.ratedLoad) * g;
  const Fstatic_per_rope = data.numRopes > 0 ? Fstatic_total / (r * data.numRopes) : 0;
  const N_equiv = data.numSimpleBends + 4 * data.numReverseBends;
  const Dd = d_eff > 0 ? data.sheaveDiameter / d_eff : 0;
  
  let sf_required = 12;
  if (Dd > 0 && N_equiv > 0) {
    const logN = Math.log10(N_equiv / (2.6834 * Math.pow(10, 6)));
    const logDd = Math.log10(Dd);
    sf_required = Math.pow(10, 2.6834 - (logN / logDd));
  }
  const sf_actual = Fstatic_per_rope > 0 ? data.ropeBreakingLoad / Fstatic_per_rope : 0;
  const isSfOk = sf_actual >= sf_required;

  // ISO 4344 Minimum Breaking Load (Fmin)
  // K is fill factor (0.356 typical for 8x19 steel core rope)
  const K = 0.356;
  const iso4344_Fmin = K * Math.pow(data.ropeDiameter, 2) * (data.ropeGrade || 1770);
  const isBreakingLoadOk = data.ropeBreakingLoad >= iso4344_Fmin;

  // Guide Rails
  const lambda = (data.bracketDist) / data.railIyRadius;
  // Omega calculation as per typical ISO 8100-2 approach (or structural standards like Eurocode 3 approximation)
  // Accurate approach depends on slenderness. Example simplification for steel (E = 210000, Yield = 235-355):
  // We'll use a standard Euler / Tetmajer formulation placeholder or the detailed table approach.
  let omega = 1;
  if (lambda > 115) {
    omega = Math.pow(lambda / 115, 2);
  } else if (lambda > 20) {
    // simplified linear or polynomial interpolation for lambda between 20-115
    omega = 1 + 0.005 * (lambda - 20) + 0.0001 * Math.pow(lambda - 20, 2);
  }
  const bucklingFactor = (data.carMass + data.ratedLoad) * g * omega / data.railArea;
  const maxDeflection = Math.min(5, data.bracketDist / 500);

  // Guide Rails - Fastening & Fatigue
  const boltArea = Math.PI * Math.pow((data.railBoltDiameter || 12) / 2, 2);
  const totalBoltArea = boltArea * (data.railNumBoltsPerJoint || 8);
  const railConnectionStress = ((data.carMass + data.ratedLoad) * g) / totalBoltArea;
  const lubFactor = data.railLubrication === 'dry' ? 0.8 : (data.railLubrication === 'oiled' ? 1.2 : 1.5);
  const estimatedFatigueLife = (data.loadCycles || 1000000) * lubFactor;

  // Buffer Energy Calculation
  const impactMass = data.carMass + data.ratedLoad; // Worst case: Car + rated load
  const v_impact = 1.15 * data.speed;
  const Ek = 0.5 * impactMass * Math.pow(v_impact, 2); // Kinetic Energy (Joules)
  const Ep = impactMass * g * (data.bufferStroke / 1000); // Potential Energy across stroke (Joules)
  const bufferEnergyTotal = Ek + Ep;
  
  // Non-linear integration based on user-defined exponent (Clause 4.5.3)
  // F(x) = F_max * (x/h)^exponent
  // Integral = (F_max * h) / (exponent + 1) => solving for F_max required to dissipate Ek+Ep
  const nExponent = data.bufferForceCurveExponent || 1;
  const bufferFmaxRequired = (bufferEnergyTotal * (nExponent + 1)) / (data.bufferStroke / 1000 || 0.001);

  // Safety Gear & OSG
  const minTripping = 1.15 * data.speed;
  let maxTripping = 1.5;
  if (data.safetyGearType === 'instantaneous') maxTripping = 0.8;
  else if (data.safetyGearType === 'progressive' && data.speed > 1.0) maxTripping = 1.25 * data.speed + 0.25 / data.speed;
  
  const totalMass = data.carMass + data.ratedLoad;
  const retardationG = data.safetyGearBrakingForce > 0 ? (data.safetyGearBrakingForce / (totalMass * g)) - 1 : 0;
  
  // Sling Strength Calculation
  const slingTotalArea = (data.uprightArea || 1) * 2; // Two uprights
  const slingWy = (data.uprightWy || 1) * 2;
  const F_safety_gear_total = totalMass * g * (1 + retardationG);
  const slingBendingMoment = (F_safety_gear_total * (data.slingWidth || 1) / 2) / 1000; // Simplified Moment (N*m)
  const uprightStress = (F_safety_gear_total / slingTotalArea) + ((slingBendingMoment * 1000) / slingWy); // MPa

  // ACOP
  const acop_max_limit = data.speed <= 1.0 ? 1.15 * data.speed + 0.25 : 1.15 * data.speed;

  // Hydraulic
  const A_ram = Math.PI * Math.pow(data.ramDiameter / 2, 2);
  const P_hyd = data.carMass + 0.1 * data.ratedLoad; 
  const pressure = A_ram > 0 ? ((P_hyd + data.ratedLoad) * g) / A_ram : 0;

  return {
    traction: {
      T1_static, T2_static, T1_dynamic, T2_dynamic, mu_dynamic, f_load,
      expMuAlpha, ratio_static: traction_ratio_static, ratio_dynamic: traction_ratio_dynamic, isOk: isTractionOk, DdRatio: Dd, p_groove, p_allow
    },
    ropes: {
      Fstatic_total, Fstatic_per_rope, N_equiv, Dd, sf_required, sf_actual, isSfOk,
      iso4344_Fmin, isBreakingLoadOk
    },
    guideRails: {
      lambda, omega, bucklingFactor, maxDeflection, railConnectionStress, estimatedFatigueLife
    },
    safetyGear: {
      minTripping, maxTripping, totalMass, retardationG, acop_max_limit
    },
    buffers: {
      Ek, Ep, totalEnergy: bufferEnergyTotal, FmaxRequired: bufferFmaxRequired
    },
    sling: {
      uprightStress, slingTotalArea, slingWy, slingBendingMoment, F_safety_gear_total
    },
    hydraulic: {
      A_ram, P_hyd, pressure
    }
  };
}

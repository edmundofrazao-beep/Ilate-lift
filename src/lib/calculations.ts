export function computeLiftCalculations(data: any) {
  const g = 9.81;
  const r = parseInt(data.suspension?.split(':')[0] || '1');

  // Traction Calculations
  const T1_static = ((data.carMass + data.ratedLoad) * g) / r;
  const T2_static = (data.cwtMass * g) / r;
  const T1_dynamic = T1_static * (1 + data.acceleration / g);
  const T2_dynamic = T2_static * (1 - data.acceleration / g);
  
  const mu_dynamic = 0.1 / (1 + data.speed / 10);
  const beta = data.undercutAngle * Math.PI / 180;
  const gamma = data.grooveAngle * Math.PI / 180;
  
  let f_load = 0;
  if (data.grooveType === 'V') {
    f_load = data.frictionCoeff * (4 / Math.sin(gamma / 2));
  } else if (data.grooveType === 'semi-circular') {
    f_load = data.frictionCoeff * (4 * (Math.cos(gamma/2) - Math.sin(beta/2))) / (Math.PI - beta - gamma - Math.sin(beta) + Math.sin(gamma));
  } else {
    f_load = data.frictionCoeff * 4 / Math.PI;
  }
  
  const alpha = data.wrapAngle * Math.PI / 180;
  const expMuAlpha = Math.exp(f_load * alpha);
  const traction_ratio_static = T2_static > 0 ? T1_static / T2_static : 0;
  const traction_ratio_dynamic = T2_dynamic > 0 ? T1_dynamic / T2_dynamic : 0;
  const isTractionOk = traction_ratio_static <= expMuAlpha && traction_ratio_dynamic <= expMuAlpha;

  // Specific Pressure
  const p_groove = (T1_static + T2_static) / (data.numRopes * data.ropeDiameter * data.sheaveDiameter * Math.sin(gamma/2 || 1));
  const p_allow = (data.sheaveHardness * 10) / (1 + 2 * data.speed);

  // Ropes
  const Fstatic_total = (data.carMass + data.ratedLoad) * g;
  const Fstatic_per_rope = data.numRopes > 0 ? Fstatic_total / (r * data.numRopes) : 0;
  const N_equiv = data.numSimpleBends + 4 * data.numReverseBends;
  const Dd = data.ropeDiameter > 0 ? data.sheaveDiameter / data.ropeDiameter : 0;
  
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
  const omega = lambda > 115 ? Math.pow(lambda / 115, 2) : 1;
  const bucklingFactor = (data.carMass + data.ratedLoad) * g * omega / data.railArea;
  const maxDeflection = Math.min(5, data.bracketDist / 500);

  // Safety Gear & OSG
  const minTripping = 1.15 * data.speed;
  let maxTripping = 1.5;
  if (data.safetyGearType === 'instantaneous') maxTripping = 0.8;
  else if (data.safetyGearType === 'progressive' && data.speed > 1.0) maxTripping = 1.25 * data.speed + 0.25 / data.speed;
  
  const totalMass = data.carMass + data.ratedLoad;
  const retardationG = data.safetyGearBrakingForce > 0 ? (data.safetyGearBrakingForce / (totalMass * g)) - 1 : 0;
  
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
      lambda, omega, bucklingFactor, maxDeflection
    },
    safetyGear: {
      minTripping, maxTripping, totalMass, retardationG, acop_max_limit
    },
    hydraulic: {
      A_ram, P_hyd, pressure
    }
  };
}

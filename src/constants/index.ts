
export const ISO_RAIL_PROFILES = [
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

export const BELT_PROFILES = [
  { id: 'B30', label: 'Belt 30mm', width: 30, thickness: 3, mbf: 40000 },
  { id: 'B60', label: 'Belt 60mm', width: 60, thickness: 4, mbf: 80000 },
];

export const SEISMIC_CATEGORIES = [
  { id: 0, label: 'Category 0 (ad ≤ 1 m/s²)' },
  { id: 1, label: 'Category 1 (1 < ad ≤ 2.5 m/s²)' },
  { id: 2, label: 'Category 2 (2.5 < ad ≤ 4 m/s²)' },
  { id: 3, label: 'Category 3 (ad > 4 m/s²)' },
];

export const SAFETY_GEAR_PRESETS = [
  // Instantaneous (Speeds <= 0.63 m/s)
  { name: 'Dynatech IN-3000 (Instantaneous)', maxMass: 3000, brakingForce: 35000, certifiedSpeed: 0.63 },
  { name: 'Wittur ISG-01 (Instantaneous)', maxMass: 1500, brakingForce: 18000, certifiedSpeed: 0.63 },

  // Progressive - Compact/Modern
  { name: 'Dynatech ASG-100 (Progressive)', maxMass: 1545, brakingForce: 20000, certifiedSpeed: 2.0 },
  { name: 'Dynatech ASG-120 (Progressive)', maxMass: 2200, brakingForce: 30000, certifiedSpeed: 2.5 },
  { name: 'Dynatech PR-2500 (Progressive)', maxMass: 3450, brakingForce: 45000, certifiedSpeed: 2.5 },

  // Progressive - Standard
  { name: 'Wittur CSGB-01 (Progressive)', maxMass: 1400, brakingForce: 18000, certifiedSpeed: 2.0 },
  { name: 'Wittur CSGB-02 (Progressive)', maxMass: 2600, brakingForce: 35000, certifiedSpeed: 2.5 },
  { name: 'Wittur CSGB-03 (Progressive)', maxMass: 4500, brakingForce: 59000, certifiedSpeed: 3.0 },

  // Progressive - Heavy Duty
  { name: 'Cobianchi PC13GA (Progressive)', maxMass: 4500, brakingForce: 60000, certifiedSpeed: 3.5 },
  { name: 'Cobianchi PC24GA (Progressive)', maxMass: 8000, brakingForce: 110000, certifiedSpeed: 4.0 },

  // Generic / Default fallbacks
  { name: 'Generic S-1200 (Progressive)', maxMass: 1200, brakingForce: 15600, certifiedSpeed: 1.5 },
  { name: 'Generic M-2500 (Progressive)', maxMass: 2500, brakingForce: 32500, certifiedSpeed: 2.5 },
  { name: 'Generic L-5000 (Progressive)', maxMass: 5000, brakingForce: 65000, certifiedSpeed: 4.0 },
];


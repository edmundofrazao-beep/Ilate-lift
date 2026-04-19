
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

export const GUIDE_RAIL_PRESETS = [
  { id: 'mf-t50a', manufacturer: 'Monteferro', model: 'T50/A', profile: 'ISO T50/A', A: 532, Iy: 63000, Ix: 20000, Wy: 1860, Wx: 800, iy: 10.9, ix: 6.1, q: 4.18 },
  { id: 'mf-t70-1a', manufacturer: 'Monteferro', model: 'T70-1/A', profile: 'ISO T70-1/A', A: 940, Iy: 245000, Ix: 81000, Wy: 5210, Wx: 2310, iy: 16.1, ix: 9.3, q: 7.38 },
  { id: 'mf-t75-3b', manufacturer: 'Monteferro', model: 'T75-3/B', profile: 'ISO T75-3/B', A: 1100, Iy: 300000, Ix: 100000, Wy: 6000, Wx: 2600, iy: 16.5, ix: 9.5, q: 8.6 },
  { id: 'mf-t82b', manufacturer: 'Monteferro', model: 'T82/B', profile: 'ISO T82/B', A: 1250, Iy: 400000, Ix: 130000, Wy: 7500, Wx: 3200, iy: 17.9, ix: 10.2, q: 9.8 },
  { id: 'mf-t89b', manufacturer: 'Monteferro', model: 'T89/B', profile: 'ISO T89/B', A: 1570, Iy: 595000, Ix: 198000, Wy: 10100, Wx: 4450, iy: 19.5, ix: 11.2, q: 12.3 },
  { id: 'mf-t127-1b', manufacturer: 'Monteferro', model: 'T127-1/B', profile: 'ISO T127-1/B', A: 2890, Iy: 2100000, Ix: 700000, Wy: 26000, Wx: 11000, iy: 26.9, ix: 15.5, q: 22.7 },
  { id: 'sav-t90b', manufacturer: 'Savera', model: 'T90/B', profile: 'ISO T90/B', A: 1720, Iy: 750000, Ix: 250000, Wy: 12000, Wx: 5500, iy: 20.9, ix: 12.1, q: 13.5 },
  { id: 'sav-t125b', manufacturer: 'Savera', model: 'T125/B', profile: 'ISO T125/B', A: 2260, Iy: 1510000, Ix: 500000, Wy: 20000, Wx: 8000, iy: 25.8, ix: 14.9, q: 17.7 },
  { id: 'sav-t140-1b', manufacturer: 'Savera', model: 'T140-1/B', profile: 'ISO T140-1/B', A: 4200, Iy: 4500000, Ix: 1500000, Wy: 48000, Wx: 21000, iy: 32.7, ix: 18.9, q: 33.0 },
  { id: 'mar-t82b', manufacturer: 'Marazzi', model: 'T82/B', profile: 'ISO T82/B', A: 1250, Iy: 400000, Ix: 130000, Wy: 7500, Wx: 3200, iy: 17.9, ix: 10.2, q: 9.8 },
  { id: 'mar-t127-2b', manufacturer: 'Marazzi', model: 'T127-2/B', profile: 'ISO T127-2/B', A: 3510, Iy: 3000000, Ix: 1000000, Wy: 35000, Wx: 15000, iy: 29.2, ix: 16.9, q: 27.5 },
  { id: 'mar-t140-2b', manufacturer: 'Marazzi', model: 'T140-2/B', profile: 'ISO T140-2/B', A: 5800, Iy: 7500000, Ix: 2500000, Wy: 75000, Wx: 35000, iy: 35.9, ix: 20.7, q: 45.5 },
  { id: 'mar-t140-3b', manufacturer: 'Marazzi', model: 'T140-3/B', profile: 'ISO T140-3/B', A: 7900, Iy: 12000000, Ix: 4000000, Wy: 110000, Wx: 55000, iy: 39.0, ix: 22.5, q: 62.0 },
  { id: 'selcom-t70-1a', manufacturer: 'Selcom', model: 'T70-1/A', profile: 'ISO T70-1/A', A: 940, Iy: 245000, Ix: 81000, Wy: 5210, Wx: 2310, iy: 16.1, ix: 9.3, q: 7.38 },
  { id: 'selcom-t89b', manufacturer: 'Selcom', model: 'T89/B', profile: 'ISO T89/B', A: 1570, Iy: 595000, Ix: 198000, Wy: 10100, Wx: 4450, iy: 19.5, ix: 11.2, q: 12.3 },
];

export const BELT_PROFILES = [
  { id: 'B30', label: 'Belt 30mm', width: 30, thickness: 3, mbf: 40000 },
  { id: 'B40', label: 'Belt 40mm', width: 40, thickness: 3.2, mbf: 52000 },
  { id: 'B50', label: 'Belt 50mm', width: 50, thickness: 3.5, mbf: 64000 },
  { id: 'B60', label: 'Belt 60mm', width: 60, thickness: 4, mbf: 80000 },
  { id: 'B80', label: 'Belt 80mm', width: 80, thickness: 4.5, mbf: 105000 },
];

export const ROPE_PRESETS = [
  { id: 'brugg-8mm-1570', manufacturer: 'Brugg', model: '8x19 Seale', label: 'Brugg 8 mm 1570', diameter: 8, grade: 1570, breakingLoad: 29000 },
  { id: 'brugg-10mm-1770', manufacturer: 'Brugg', model: '8x19 Seale', label: 'Brugg 10 mm 1770', diameter: 10, grade: 1770, breakingLoad: 45000 },
  { id: 'brugg-11mm-1770', manufacturer: 'Brugg', model: '8x19 Seale', label: 'Brugg 11 mm 1770', diameter: 11, grade: 1770, breakingLoad: 54000 },
  { id: 'brugg-12mm-1960', manufacturer: 'Brugg', model: '8x19 Warrington', label: 'Brugg 12 mm 1960', diameter: 12, grade: 1960, breakingLoad: 70000 },
  { id: 'gustavwolf-10mm-1770', manufacturer: 'Gustav Wolf', model: '8x19 Seale', label: 'Gustav Wolf 10 mm 1770', diameter: 10, grade: 1770, breakingLoad: 45500 },
  { id: 'gustavwolf-12mm-1770', manufacturer: 'Gustav Wolf', model: '8x19 Seale', label: 'Gustav Wolf 12 mm 1770', diameter: 12, grade: 1770, breakingLoad: 65000 },
  { id: 'gustavwolf-13mm-1960', manufacturer: 'Gustav Wolf', model: '8x19 Warrington', label: 'Gustav Wolf 13 mm 1960', diameter: 13, grade: 1960, breakingLoad: 83500 },
  { id: 'drako-10mm-1770', manufacturer: 'Drako', model: '8x19 Seale', label: 'Drako 10 mm 1770', diameter: 10, grade: 1770, breakingLoad: 44800 },
  { id: 'drako-13mm-1960', manufacturer: 'Drako', model: '8x19 Warrington', label: 'Drako 13 mm 1960', diameter: 13, grade: 1960, breakingLoad: 82000 },
  { id: 'drako-16mm-1960', manufacturer: 'Drako', model: '8x19 Warrington', label: 'Drako 16 mm 1960', diameter: 16, grade: 1960, breakingLoad: 122000 },
  { id: 'kiswire-12mm-1770', manufacturer: 'Kiswire', model: '8x19 Seale', label: 'Kiswire 12 mm 1770', diameter: 12, grade: 1770, breakingLoad: 64000 },
  { id: 'kiswire-14mm-1960', manufacturer: 'Kiswire', model: '8x19 Warrington', label: 'Kiswire 14 mm 1960', diameter: 14, grade: 1960, breakingLoad: 97000 },
  { id: 'teufelberger-10mm-1770', manufacturer: 'Teufelberger', model: '8x19 Seale', label: 'Teufelberger 10 mm 1770', diameter: 10, grade: 1770, breakingLoad: 45200 },
  { id: 'teufelberger-12mm-1960', manufacturer: 'Teufelberger', model: '8x19 Warrington', label: 'Teufelberger 12 mm 1960', diameter: 12, grade: 1960, breakingLoad: 70500 },
];

export const SEISMIC_CATEGORIES = [
  { id: 0, label: 'Category 0 (ad ≤ 1 m/s²)' },
  { id: 1, label: 'Category 1 (1 < ad ≤ 2.5 m/s²)' },
  { id: 2, label: 'Category 2 (2.5 < ad ≤ 4 m/s²)' },
  { id: 3, label: 'Category 3 (ad > 4 m/s²)' },
];

export const SAFETY_GEAR_PRESETS = [
  // Instantaneous (Speeds <= 0.63 m/s)
  { id: 'dynatech-in-3000', manufacturer: 'Dynatech', model: 'IN-3000', name: 'Dynatech IN-3000 (Instantaneous)', type: 'instantaneous', maxMass: 3000, brakingForce: 35000, certifiedSpeed: 0.63 },
  { id: 'wittur-isg-01', manufacturer: 'Wittur', model: 'ISG-01', name: 'Wittur ISG-01 (Instantaneous)', type: 'instantaneous', maxMass: 1500, brakingForce: 18000, certifiedSpeed: 0.63 },
  { id: 'safedrive-si-2000', manufacturer: 'Safedrive', model: 'SI-2000', name: 'Safedrive SI-2000 (Instantaneous)', type: 'instantaneous', maxMass: 2200, brakingForce: 25000, certifiedSpeed: 0.63 },

  // Progressive - Compact/Modern
  { id: 'dynatech-asg-100', manufacturer: 'Dynatech', model: 'ASG-100', name: 'Dynatech ASG-100 (Progressive)', type: 'progressive', maxMass: 1545, brakingForce: 20000, certifiedSpeed: 2.0 },
  { id: 'dynatech-asg-120', manufacturer: 'Dynatech', model: 'ASG-120', name: 'Dynatech ASG-120 (Progressive)', type: 'progressive', maxMass: 2200, brakingForce: 30000, certifiedSpeed: 2.5 },
  { id: 'dynatech-pr-2500', manufacturer: 'Dynatech', model: 'PR-2500', name: 'Dynatech PR-2500 (Progressive)', type: 'progressive', maxMass: 3450, brakingForce: 45000, certifiedSpeed: 2.5 },
  { id: 'dynatech-pr-4000', manufacturer: 'Dynatech', model: 'PR-4000', name: 'Dynatech PR-4000 (Progressive)', type: 'progressive', maxMass: 4200, brakingForce: 56000, certifiedSpeed: 3.0 },

  // Progressive - Standard
  { id: 'wittur-csgb-01', manufacturer: 'Wittur', model: 'CSGB-01', name: 'Wittur CSGB-01 (Progressive)', type: 'progressive', maxMass: 1400, brakingForce: 18000, certifiedSpeed: 2.0 },
  { id: 'wittur-csgb-02', manufacturer: 'Wittur', model: 'CSGB-02', name: 'Wittur CSGB-02 (Progressive)', type: 'progressive', maxMass: 2600, brakingForce: 35000, certifiedSpeed: 2.5 },
  { id: 'wittur-csgb-03', manufacturer: 'Wittur', model: 'CSGB-03', name: 'Wittur CSGB-03 (Progressive)', type: 'progressive', maxMass: 4500, brakingForce: 59000, certifiedSpeed: 3.0 },
  { id: 'wittur-csgb-04', manufacturer: 'Wittur', model: 'CSGB-04', name: 'Wittur CSGB-04 (Progressive)', type: 'progressive', maxMass: 6500, brakingForce: 86000, certifiedSpeed: 3.5 },
  { id: 'pfb-sg-2200', manufacturer: 'PFB', model: 'SG-2200', name: 'PFB SG-2200 (Progressive)', type: 'progressive', maxMass: 2200, brakingForce: 29000, certifiedSpeed: 2.0 },
  { id: 'pfb-sg-4500', manufacturer: 'PFB', model: 'SG-4500', name: 'PFB SG-4500 (Progressive)', type: 'progressive', maxMass: 4500, brakingForce: 61000, certifiedSpeed: 3.0 },

  // Progressive - Heavy Duty
  { id: 'cobianchi-pc13ga', manufacturer: 'Cobianchi', model: 'PC13GA', name: 'Cobianchi PC13GA (Progressive)', type: 'progressive', maxMass: 4500, brakingForce: 60000, certifiedSpeed: 3.5 },
  { id: 'cobianchi-pc24ga', manufacturer: 'Cobianchi', model: 'PC24GA', name: 'Cobianchi PC24GA (Progressive)', type: 'progressive', maxMass: 8000, brakingForce: 110000, certifiedSpeed: 4.0 },
  { id: 'cobianchi-pc30ga', manufacturer: 'Cobianchi', model: 'PC30GA', name: 'Cobianchi PC30GA (Progressive)', type: 'progressive', maxMass: 12000, brakingForce: 150000, certifiedSpeed: 5.0 },

  // Generic / Default fallbacks
  { id: 'generic-s-1200', manufacturer: 'Generic', model: 'S-1200', name: 'Generic S-1200 (Progressive)', type: 'progressive', maxMass: 1200, brakingForce: 15600, certifiedSpeed: 1.5 },
  { id: 'generic-m-2500', manufacturer: 'Generic', model: 'M-2500', name: 'Generic M-2500 (Progressive)', type: 'progressive', maxMass: 2500, brakingForce: 32500, certifiedSpeed: 2.5 },
  { id: 'generic-l-5000', manufacturer: 'Generic', model: 'L-5000', name: 'Generic L-5000 (Progressive)', type: 'progressive', maxMass: 5000, brakingForce: 65000, certifiedSpeed: 4.0 },
  { id: 'generic-xl-8000', manufacturer: 'Generic', model: 'XL-8000', name: 'Generic XL-8000 (Progressive)', type: 'progressive', maxMass: 8000, brakingForce: 104000, certifiedSpeed: 4.5 },
];

export const OSG_PRESETS = [
  { id: 'dynatech-qs-180', manufacturer: 'Dynatech', model: 'QS-180', trippingSpeed: 1.10, tensileForce: 380, maxBrakingForce: 420, ropeBreakingLoad: 3200, speedRange: '0.40-0.63 m/s' },
  { id: 'dynatech-qs-300', manufacturer: 'Dynatech', model: 'QS-300', trippingSpeed: 1.35, tensileForce: 450, maxBrakingForce: 500, ropeBreakingLoad: 4200, speedRange: '0.63-1.00 m/s' },
  { id: 'dynatech-qs-500', manufacturer: 'Dynatech', model: 'QS-500', trippingSpeed: 1.75, tensileForce: 500, maxBrakingForce: 650, ropeBreakingLoad: 4800, speedRange: '1.00-1.60 m/s' },
  { id: 'dynatech-qs-650', manufacturer: 'Dynatech', model: 'QS-650', trippingSpeed: 2.40, tensileForce: 620, maxBrakingForce: 820, ropeBreakingLoad: 5600, speedRange: '1.60-3.00 m/s' },
  { id: 'wittur-lsg-1', manufacturer: 'Wittur', model: 'LSG-1', trippingSpeed: 1.40, tensileForce: 400, maxBrakingForce: 500, ropeBreakingLoad: 3600, speedRange: '0.63-1.00 m/s' },
  { id: 'wittur-lsg-2', manufacturer: 'Wittur', model: 'LSG-2', trippingSpeed: 2.00, tensileForce: 500, maxBrakingForce: 700, ropeBreakingLoad: 5000, speedRange: '1.00-1.75 m/s' },
  { id: 'wittur-lsg-3', manufacturer: 'Wittur', model: 'LSG-3', trippingSpeed: 2.60, tensileForce: 650, maxBrakingForce: 900, ropeBreakingLoad: 6200, speedRange: '1.75-3.50 m/s' },
  { id: 'pfb-gov-160', manufacturer: 'PFB', model: 'GOV-160', trippingSpeed: 1.84, tensileForce: 550, maxBrakingForce: 800, ropeBreakingLoad: 5200, speedRange: '1.60-2.50 m/s' },
  { id: 'pfb-gov-250', manufacturer: 'PFB', model: 'GOV-250', trippingSpeed: 2.90, tensileForce: 700, maxBrakingForce: 980, ropeBreakingLoad: 6800, speedRange: '2.50-4.00 m/s' },
  { id: 'sicor-sgo-120', manufacturer: 'Sicor', model: 'SGO-120', trippingSpeed: 1.20, tensileForce: 390, maxBrakingForce: 460, ropeBreakingLoad: 3400, speedRange: '0.50-0.80 m/s' },
  { id: 'sicor-sgo-300', manufacturer: 'Sicor', model: 'SGO-300', trippingSpeed: 1.60, tensileForce: 470, maxBrakingForce: 610, ropeBreakingLoad: 4700, speedRange: '0.80-1.40 m/s' },
];

export const BUFFER_PRESETS = [
  { id: 'wittur-bea-150', manufacturer: 'Wittur', model: 'BEA-150', type: 'energy-accumulation', isLinear: true, stroke: 150, minMass: 450, maxMass: 1800, speedRange: '<= 1.0 m/s' },
  { id: 'wittur-bea-200', manufacturer: 'Wittur', model: 'BEA-200', type: 'energy-accumulation', isLinear: true, stroke: 200, minMass: 650, maxMass: 2200, speedRange: '<= 1.0 m/s' },
  { id: 'wittur-bed-200', manufacturer: 'Wittur', model: 'BED-200', type: 'energy-dissipation', isLinear: true, stroke: 200, minMass: 700, maxMass: 2500, speedRange: '1.0-1.6 m/s' },
  { id: 'wittur-bed-250', manufacturer: 'Wittur', model: 'BED-250', type: 'energy-dissipation', isLinear: true, stroke: 250, minMass: 900, maxMass: 3200, speedRange: '1.2-2.0 m/s' },
  { id: 'dynatech-hd-250', manufacturer: 'Dynatech', model: 'HD-250', type: 'energy-dissipation', isLinear: true, stroke: 250, minMass: 900, maxMass: 3200, speedRange: '1.0-2.0 m/s' },
  { id: 'dynatech-hd-300', manufacturer: 'Dynatech', model: 'HD-300', type: 'energy-dissipation', isLinear: true, stroke: 300, minMass: 1200, maxMass: 4200, speedRange: '1.6-2.5 m/s' },
  { id: 'dynatech-hd-400', manufacturer: 'Dynatech', model: 'HD-400', type: 'energy-dissipation', isLinear: true, stroke: 400, minMass: 1800, maxMass: 6500, speedRange: '2.0-3.5 m/s' },
  { id: 'cobianchi-nl-300', manufacturer: 'Cobianchi', model: 'NL-300', type: 'energy-dissipation', isLinear: false, stroke: 300, minMass: 1200, maxMass: 4500, speedRange: '1.6-2.5 m/s' },
  { id: 'cobianchi-nl-400', manufacturer: 'Cobianchi', model: 'NL-400', type: 'energy-dissipation', isLinear: false, stroke: 400, minMass: 2000, maxMass: 7000, speedRange: '2.0-3.5 m/s' },
  { id: 'pfb-bd-220', manufacturer: 'PFB', model: 'BD-220', type: 'energy-dissipation', isLinear: true, stroke: 220, minMass: 750, maxMass: 2600, speedRange: '1.0-1.6 m/s' },
  { id: 'pfb-bd-320', manufacturer: 'PFB', model: 'BD-320', type: 'energy-dissipation', isLinear: true, stroke: 320, minMass: 1400, maxMass: 4800, speedRange: '1.6-2.8 m/s' },
];

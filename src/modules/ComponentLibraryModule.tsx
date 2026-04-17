import React from 'react';
import { ProjectData, ModuleStatus } from '../types';
import { safeNumber, formatNumber, degToRad, InputGroup, LiftField, SliderField, CollapsibleSection } from '../components/ui';
import { ISO_RAIL_PROFILES, BELT_PROFILES, SAFETY_GEAR_PRESETS } from '../constants';
import { CheckCircle2, ShieldCheck, Zap, AlertTriangle, Info, ChevronRight, Calculator, FileText, Database, Activity, Package, Maximize, AlertCircle, PlayCircle, Settings, CheckSquare } from 'lucide-react';
import { BlockMath, InlineMath } from 'react-katex';

export const ComponentLibraryModule = () => {
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
    { id: 'EN 81-28', name: 'Remote Alarms on Lifts', cat: 'Safety/Comm', status: 'implemented' },
    { id: 'EN 81-58', name: 'Fire Resistance of Doors', cat: 'Safety/Fire', status: 'implemented' },
    { id: 'ISO 4344:2022', name: 'Steel Wire Ropes - Min Requirements', cat: 'Mechanical', status: 'implemented' },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-surface-container-low p-6">
        <h3 className="text-lg font-bold mb-6">Technical Component Index (ISO 8100-2)</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm mb-12">
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

          <h3 className="text-lg font-bold mb-6">Safety Gear Preset Database</h3>
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-outline-variant/20 text-[10px] font-bold uppercase text-on-surface-variant">
                <th className="px-4 py-3">Preset Name</th>
                <th className="px-4 py-3">Max Mass (P+Q) kg</th>
                <th className="px-4 py-3">Braking Force (N)</th>
                <th className="px-4 py-3">Cert. Speed (m/s)</th>
              </tr>
            </thead>
            <tbody>
              {SAFETY_GEAR_PRESETS.map((preset, i) => (
                <tr key={i} className="border-b border-outline-variant/10 hover:bg-primary/5 transition-colors">
                  <td className="px-4 py-3 font-bold">{preset.name}</td>
                  <td className="px-4 py-3">{formatNumber(preset.maxMass)}</td>
                  <td className="px-4 py-3">{formatNumber(preset.brakingForce)}</td>
                  <td className="px-4 py-3">{formatNumber(preset.certifiedSpeed)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

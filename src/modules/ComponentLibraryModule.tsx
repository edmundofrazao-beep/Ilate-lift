import React from 'react';
import { Activity, Box, Cable, Cpu, Droplets, Gauge, Library, ShieldCheck } from 'lucide-react';
import { SAFETY_GEAR_PRESETS } from '../constants';
import { formatNumber } from '../components/ui';

type ComponentStatus = 'implemented' | 'partial' | 'planned';

interface ComponentCard {
  id: string;
  clause: string;
  name: string;
  category: string;
  status: ComponentStatus;
  detail: string;
  drawing: 'door-lock' | 'safety-gear' | 'overspeed-governor' | 'buffer' | 'safety-circuit' | 'acop' | 'ucmp' | 'rupture-valve' | 'guide-rails' | 'traction-machine' | 'suspension' | 'traction-sheave' | 'discard' | 'hydraulic';
}

const statusClasses: Record<ComponentStatus, string> = {
  implemented: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300',
  partial: 'border-amber-500/20 bg-amber-500/10 text-amber-300',
  planned: 'border-white/10 bg-white/[0.04] text-white/60',
};

const components: ComponentCard[] = [
  { id: 'door-lock', clause: '4.2', name: 'Door Locking Devices', category: 'Mechanical Safety', status: 'implemented', detail: 'Mechanical lock, electrical contact and anti-manipulation checks for landing and car door interlocking.', drawing: 'door-lock' },
  { id: 'safety-gear', clause: '4.3', name: 'Safety Gear', category: 'Mechanical Safety', status: 'implemented', detail: 'Instantaneous and progressive safety gear with braking force and permissible mass logic.', drawing: 'safety-gear' },
  { id: 'overspeed-governor', clause: '4.4', name: 'Overspeed Governor', category: 'Mechanical Safety', status: 'implemented', detail: 'Governor wheel, rope path, tripping speed and tensile-force verification.', drawing: 'overspeed-governor' },
  { id: 'buffer', clause: '4.5', name: 'Buffers', category: 'Impact Protection', status: 'implemented', detail: 'Energy dissipation and accumulation buffer checks including stroke, mass range and retardation.', drawing: 'buffer' },
  { id: 'safety-circuit', clause: '4.6', name: 'Safety Circuits and SIL-rated Circuits', category: 'Electrical Safety', status: 'partial', detail: 'Functional, temperature, vibration and safety analysis of circuits with SIL-oriented behavior.', drawing: 'safety-circuit' },
  { id: 'acop', clause: '4.7', name: 'ACOP', category: 'Motion Protection', status: 'implemented', detail: 'Ascending car overspeed protection with speed monitoring and reducing element logic.', drawing: 'acop' },
  { id: 'ucmp', clause: '4.8', name: 'UCMP', category: 'Motion Protection', status: 'implemented', detail: 'Unintended car movement stopping distance and detection behavior at landing level.', drawing: 'ucmp' },
  { id: 'rupture-valve', clause: '4.9', name: 'Rupture Valves / Restrictors', category: 'Hydraulic Safety', status: 'partial', detail: 'Hydraulic protection components for flow interruption and pressure-safe deceleration.', drawing: 'rupture-valve' },
  { id: 'guide-rails', clause: '4.10', name: 'Guide Rails', category: 'Structural', status: 'implemented', detail: 'T-rail profiles, brackets, fishplates and deflection / buckling verification.', drawing: 'guide-rails' },
  { id: 'traction-machine', clause: '4.11', name: 'Traction System', category: 'Drive System', status: 'implemented', detail: 'Machine, rope path and traction ratio checks under loading, braking and stalling conditions.', drawing: 'traction-machine' },
  { id: 'suspension', clause: '4.12', name: 'Suspension Means', category: 'Drive System', status: 'partial', detail: 'Ropes or belts, bending history and compensation means with safety-factor tracking.', drawing: 'suspension' },
  { id: 'traction-sheave', clause: '4.13', name: 'Traction Sheaves', category: 'Drive System', status: 'implemented', detail: 'Sheave geometry, groove type, hardness and specific pressure verification.', drawing: 'traction-sheave' },
  { id: 'discard', clause: '4.14', name: 'Discard Criteria', category: 'Lifecycle Monitoring', status: 'partial', detail: 'Wear, reverse bends and replacement logic for service condition monitoring.', drawing: 'discard' },
  { id: 'hydraulic', clause: '4.15', name: 'Hydraulic System', category: 'Hydraulic', status: 'implemented', detail: 'Ram, cylinder wall thickness, pressure and stability verification.', drawing: 'hydraulic' },
];

function Drawing({ kind }: { kind: ComponentCard['drawing'] }) {
  const base = 'h-40 w-full rounded-sm border border-outline-variant/20 bg-gradient-to-br from-surface-container-high to-surface-container-lowest p-3';

  const commonStroke = { stroke: '#e2e8f0', strokeWidth: 2, fill: 'none', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

  return (
    <div className={base}>
      <svg viewBox="0 0 220 140" className="h-full w-full">
        {kind === 'door-lock' && (
          <>
            <rect x="20" y="18" width="70" height="104" rx="4" fill="#0f172a" stroke="#334155" />
            <rect x="95" y="18" width="70" height="104" rx="4" fill="#172033" stroke="#334155" />
            <circle cx="78" cy="70" r="10" fill="#f97316" />
            <path d="M88 70 H112" stroke="#f8fafc" strokeWidth="4" />
            <rect x="112" y="60" width="18" height="20" rx="3" fill="#94a3b8" />
            <rect x="138" y="58" width="18" height="24" rx="4" fill="#1e293b" stroke="#60a5fa" />
          </>
        )}
        {kind === 'safety-gear' && (
          <>
            <rect x="38" y="20" width="26" height="98" fill="#64748b" />
            <rect x="156" y="20" width="26" height="98" fill="#64748b" />
            <path d="M70 98 L110 42 L150 98" stroke="#f97316" strokeWidth="7" fill="none" />
            <circle cx="110" cy="42" r="9" fill="#f8fafc" />
            <rect x="92" y="98" width="36" height="18" rx="4" fill="#ef4444" />
          </>
        )}
        {kind === 'overspeed-governor' && (
          <>
            <circle cx="82" cy="58" r="28" fill="#0f172a" stroke="#94a3b8" strokeWidth="4" />
            <circle cx="82" cy="58" r="7" fill="#f8fafc" />
            <line x1="110" y1="58" x2="180" y2="20" {...commonStroke} />
            <line x1="110" y1="58" x2="178" y2="118" {...commonStroke} />
            <rect x="162" y="12" width="22" height="22" rx="4" fill="#f97316" />
            <rect x="160" y="106" width="26" height="18" rx="4" fill="#1e293b" stroke="#60a5fa" />
          </>
        )}
        {kind === 'buffer' && (
          <>
            <rect x="44" y="106" width="132" height="12" rx="3" fill="#334155" />
            <rect x="84" y="28" width="22" height="78" rx="8" fill="#f97316" />
            <rect x="114" y="18" width="28" height="88" rx="10" fill="#f8fafc" stroke="#94a3b8" />
            <line x1="128" y1="28" x2="128" y2="92" stroke="#0f172a" strokeWidth="2" strokeDasharray="5 5" />
          </>
        )}
        {kind === 'safety-circuit' && (
          <>
            <rect x="28" y="28" width="164" height="82" rx="8" fill="#0f172a" stroke="#334155" />
            <circle cx="56" cy="70" r="8" fill="#22c55e" />
            <rect x="76" y="48" width="28" height="16" rx="3" fill="#60a5fa" />
            <rect x="116" y="48" width="28" height="16" rx="3" fill="#60a5fa" />
            <rect x="156" y="48" width="18" height="40" rx="3" fill="#f97316" />
            <path d="M64 70 H76 M104 56 H116 M144 56 H156" stroke="#f8fafc" strokeWidth="3" />
            <path d="M56 78 V96 H174" stroke="#f8fafc" strokeWidth="2" strokeDasharray="4 4" fill="none" />
          </>
        )}
        {kind === 'acop' && (
          <>
            <circle cx="64" cy="78" r="18" fill="#1e293b" stroke="#94a3b8" strokeWidth="3" />
            <path d="M82 78 H146" stroke="#f8fafc" strokeWidth="5" />
            <rect x="146" y="56" width="26" height="44" rx="6" fill="#f97316" />
            <path d="M46 78 L64 50 L82 78" stroke="#22c55e" strokeWidth="4" fill="none" />
          </>
        )}
        {kind === 'ucmp' && (
          <>
            <rect x="34" y="74" width="152" height="16" rx="5" fill="#334155" />
            <rect x="70" y="56" width="56" height="18" rx="4" fill="#0f172a" stroke="#60a5fa" />
            <rect x="136" y="48" width="20" height="42" rx="4" fill="#f97316" />
            <path d="M56 102 H156" stroke="#22c55e" strokeWidth="4" strokeDasharray="7 5" />
            <path d="M84 44 V28 H154" stroke="#f8fafc" strokeWidth="2" />
          </>
        )}
        {kind === 'rupture-valve' && (
          <>
            <line x1="24" y1="72" x2="72" y2="72" stroke="#94a3b8" strokeWidth="8" />
            <circle cx="110" cy="72" r="22" fill="#0f172a" stroke="#f97316" strokeWidth="5" />
            <path d="M96 72 H124" stroke="#f8fafc" strokeWidth="4" />
            <line x1="132" y1="72" x2="194" y2="72" stroke="#94a3b8" strokeWidth="8" />
            <path d="M110 50 V30" stroke="#60a5fa" strokeWidth="4" />
            <circle cx="110" cy="24" r="7" fill="#60a5fa" />
          </>
        )}
        {kind === 'guide-rails' && (
          <>
            <rect x="44" y="18" width="18" height="102" fill="#94a3b8" />
            <rect x="58" y="18" width="40" height="12" fill="#94a3b8" />
            <rect x="122" y="18" width="18" height="102" fill="#94a3b8" />
            <rect x="136" y="18" width="40" height="12" fill="#94a3b8" />
            <rect x="84" y="54" width="58" height="16" rx="3" fill="#f97316" />
            <rect x="84" y="86" width="58" height="10" rx="3" fill="#334155" />
          </>
        )}
        {kind === 'traction-machine' && (
          <>
            <rect x="26" y="78" width="168" height="22" rx="5" fill="#334155" />
            <circle cx="86" cy="64" r="24" fill="#0f172a" stroke="#f97316" strokeWidth="5" />
            <circle cx="146" cy="62" r="18" fill="#0f172a" stroke="#94a3b8" strokeWidth="4" />
            <rect x="42" y="30" width="34" height="22" rx="4" fill="#1e293b" stroke="#60a5fa" />
            <line x1="86" y1="40" x2="146" y2="44" stroke="#f8fafc" strokeWidth="4" />
          </>
        )}
        {kind === 'suspension' && (
          <>
            <rect x="46" y="24" width="128" height="10" rx="4" fill="#334155" />
            {['66', '90', '114', '138'].map((x) => (
              <line key={x} x1={x} y1="34" x2={x} y2="116" stroke="#f8fafc" strokeWidth="4" />
            ))}
            <rect x="58" y="116" width="92" height="12" rx="4" fill="#f97316" />
          </>
        )}
        {kind === 'traction-sheave' && (
          <>
            <circle cx="110" cy="70" r="40" fill="#0f172a" stroke="#94a3b8" strokeWidth="5" />
            <circle cx="110" cy="70" r="28" fill="none" stroke="#f97316" strokeWidth="4" />
            <circle cx="110" cy="70" r="8" fill="#f8fafc" />
            <path d="M70 70 H24" stroke="#f8fafc" strokeWidth="4" />
            <path d="M150 70 H196" stroke="#f8fafc" strokeWidth="4" />
          </>
        )}
        {kind === 'discard' && (
          <>
            {['56', '82', '108', '134', '160'].map((x, i) => (
              <line key={x} x1={x} y1="18" x2={x} y2="122" stroke={i === 2 ? '#ef4444' : '#f8fafc'} strokeWidth={i === 2 ? 6 : 4} strokeDasharray={i === 2 ? '8 5' : '0'} />
            ))}
            <path d="M96 46 L122 94" stroke="#ef4444" strokeWidth="5" />
            <rect x="70" y="104" width="80" height="14" rx="4" fill="#334155" />
          </>
        )}
        {kind === 'hydraulic' && (
          <>
            <rect x="92" y="18" width="36" height="102" rx="8" fill="#94a3b8" />
            <rect x="86" y="18" width="48" height="22" rx="6" fill="#f97316" />
            <line x1="110" y1="120" x2="110" y2="136" stroke="#f8fafc" strokeWidth="4" />
            <path d="M42 106 H86" stroke="#60a5fa" strokeWidth="7" />
            <circle cx="42" cy="106" r="10" fill="#0f172a" stroke="#60a5fa" strokeWidth="4" />
          </>
        )}
      </svg>
    </div>
  );
}

export const ComponentLibraryModule = () => {
  const implementedCount = components.filter((component) => component.status === 'implemented').length;
  const partialCount = components.filter((component) => component.status === 'partial').length;
  const plannedCount = components.filter((component) => component.status === 'planned').length;

  return (
    <div className="space-y-8">
      <div className="rounded-sm border border-outline-variant/20 bg-surface-container-low p-8">
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-sm border border-outline-variant/20 bg-gradient-to-br from-surface-container-high to-surface-container-lowest p-6">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-primary">
              <Library size={12} />
              Visual component atlas
            </div>
            <h3 className="text-2xl font-black tracking-tight text-on-surface">Elevator Component Library</h3>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-on-surface-variant">
              This library now acts as a visual atlas of the main `ISO 8100-2` components. The drawings are still schematic, but they are no longer generic placeholders.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-sm border border-emerald-500/20 bg-emerald-500/10 p-4">
              <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-300">Implemented</div>
              <div className="mt-2 text-3xl font-black text-white">{implementedCount}</div>
            </div>
            <div className="rounded-sm border border-amber-500/20 bg-amber-500/10 p-4">
              <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-300">Partial</div>
              <div className="mt-2 text-3xl font-black text-white">{partialCount}</div>
            </div>
            <div className="rounded-sm border border-white/10 bg-white/[0.04] p-4">
              <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/60">Planned</div>
              <div className="mt-2 text-3xl font-black text-white">{plannedCount}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {components.map((component) => (
          <div key={component.id} className="rounded-sm border border-outline-variant/20 bg-surface-container-low p-5">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">{component.clause}</div>
                <h4 className="mt-2 text-lg font-black text-on-surface">{component.name}</h4>
                <div className="mt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-on-surface-variant">{component.category}</div>
              </div>
              <span className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] ${statusClasses[component.status]}`}>
                {component.status}
              </span>
            </div>

            <Drawing kind={component.drawing} />

            <p className="mt-4 text-sm leading-relaxed text-on-surface-variant">{component.detail}</p>
          </div>
        ))}
      </div>

      <div className="rounded-sm border border-outline-variant/20 bg-surface-container-low p-8">
        <div className="mb-6 flex items-center gap-3">
          <ShieldCheck size={18} className="text-primary" />
          <h3 className="text-lg font-black text-on-surface">Safety Gear Preset Database</h3>
        </div>
        <div className="overflow-x-auto">
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
                <tr key={i} className="border-b border-outline-variant/10 transition-colors hover:bg-primary/5">
                  <td className="px-4 py-3 font-bold text-on-surface">{preset.name}</td>
                  <td className="px-4 py-3 text-on-surface-variant">{formatNumber(preset.maxMass)}</td>
                  <td className="px-4 py-3 text-on-surface-variant">{formatNumber(preset.brakingForce)}</td>
                  <td className="px-4 py-3 text-on-surface-variant">{formatNumber(preset.certifiedSpeed)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-sm border border-outline-variant/20 bg-surface-container-low p-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-sm border border-outline-variant/20 bg-surface-container-lowest p-4">
            <div className="flex items-center gap-2 text-primary">
              <Gauge size={14} />
              <span className="text-[11px] font-black uppercase tracking-[0.2em]">Drive System</span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-on-surface-variant">
              Traction machine, suspension means and traction sheaves now have dedicated drawings and clause mapping.
            </p>
          </div>
          <div className="rounded-sm border border-outline-variant/20 bg-surface-container-lowest p-4">
            <div className="flex items-center gap-2 text-primary">
              <Cable size={14} />
              <span className="text-[11px] font-black uppercase tracking-[0.2em]">Lifecycle Monitoring</span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-on-surface-variant">
              Discard criteria and service-condition logic are now visible as a separate engineering object instead of being hidden in formulas.
            </p>
          </div>
          <div className="rounded-sm border border-outline-variant/20 bg-surface-container-lowest p-4">
            <div className="flex items-center gap-2 text-primary">
              <Cpu size={14} />
              <span className="text-[11px] font-black uppercase tracking-[0.2em]">Electrical Safety</span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-on-surface-variant">
              Safety circuits are now acknowledged explicitly in the library instead of being buried under a generic SIL heading.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { AlertTriangle, ArrowRight, BookOpen, CheckCircle2, Clock3, Layers3, ShieldCheck, Target } from 'lucide-react';
import { RULES_REGISTRY, STANDARDS_REGISTRY } from '../constants/standards';
import { getCoverageSummary, getPriorityStandards, getRulesForModule } from '../lib/standards';
import { ModuleStatus } from '../types';

const statusClasses = {
  implemented: 'bg-emerald-900/30 text-emerald-400 border-emerald-500/30',
  partial: 'bg-amber-900/30 text-amber-300 border-amber-500/30',
  planned: 'bg-surface-container-high text-on-surface-variant border-outline-variant/50',
  placeholder: 'bg-surface-container-high text-on-surface-variant border-outline-variant/50',
};

export const OverviewModule = ({ modules, onSelect, workspace = 'electric' }: { modules: ModuleStatus[]; onSelect: (id: string) => void; workspace?: 'electric' | 'hydraulic' }) => {
  const coverage = getCoverageSummary();
  const categories = Array.from(new Set(modules.map((module) => module.category || 'Other')));
  const statusScore = { implemented: 2, partial: 1, placeholder: 0 } as const;
  const highlightedStandards = STANDARDS_REGISTRY.slice(0, 6);
  const highlightedRules = RULES_REGISTRY.slice(0, 4);

  const workflowSections = workspace === 'hydraulic'
    ? [
        {
          title: 'Hydraulic Base',
          description: 'Set the project assumptions, speed cap, travel and geometry before touching hydraulic proofs and safety checks.',
          primary: 'global',
          secondary: ['clearances', 'hydraulic'],
        },
        {
          title: 'Hydraulic Power Chain',
          description: 'Close cylinder, pressure, buckling, rupture valve and buffer logic as one hydraulic engineering block.',
          primary: 'hydraulic',
          secondary: ['rupture-valve', 'buffers'],
        },
        {
          title: 'Safety and Control',
          description: 'Door locking, safety gear, circuits, alarms and seismic conditions must be aligned before output.',
          primary: 'doors',
          secondary: ['safety', 'sil', 'alarms', 'seismic'],
        },
        {
          title: 'Geometry and Output',
          description: 'Finish shaft, cabin, memory and export only after the hydraulic chain is already coherent.',
          primary: 'clearances',
          secondary: ['shaft', 'cabin', 'memory', 'export'],
        },
      ]
    : [
        {
          title: 'Project Base',
          description: 'Set the project assumptions, speed, travel, type and overall lift architecture before touching component checks.',
          primary: 'global',
          secondary: ['clearances', 'cwt'],
        },
        {
          title: 'Traction and Suspension',
          description: 'Close traction setup, sheaves, ropes, discard criteria and suspension compliance as one engineering block.',
          primary: 'traction-params',
          secondary: ['sheaves', 'suspension-verify'],
        },
        {
          title: 'Safety Chain',
          description: 'Work through door locking, safety gear, governor, buffers and safety circuits in the right order.',
          primary: 'doors',
          secondary: ['safety', 'osg', 'buffers', 'sil'],
        },
        {
          title: 'Geometry and Final Proof',
          description: 'Finish shaft, clearances, cabin and output documents only after the core engineering sections are stable.',
          primary: 'clearances',
          secondary: ['shaft', 'cabin', 'memory', 'export'],
        },
      ];

  const actionQueue = workspace === 'hydraulic'
    ? [
        {
          title: 'Close hydraulic assumptions',
          detail: 'Confirm hydraulic base setup, speed cap and geometry before opening component verification.',
          target: 'global',
        },
        {
          title: 'Finish hydraulic chain',
          detail: 'Review cylinder checks, rupture valve and buffers together.',
          target: 'hydraulic',
        },
        {
          title: 'Close the safety chain',
          detail: 'Door locking, safety gear, safety circuits and alarms should be aligned before output.',
          target: 'doors',
        },
        {
          title: 'Generate final memory',
          detail: 'Only move to calculation memory and PDF when the hydraulic sections are already clean.',
          target: 'memory',
        },
      ]
    : [
        {
          title: 'Close project assumptions',
          detail: 'Confirm project setup before opening the mechanical verification chain.',
          target: 'global',
        },
        {
          title: 'Finish traction backbone',
          detail: 'Review traction setup, sheaves and suspension discard logic together.',
          target: 'traction-params',
        },
        {
          title: 'Close the safety chain',
          detail: 'Door locking, safety gear, governor, buffers and safety circuits should be aligned before output.',
          target: 'doors',
        },
        {
          title: 'Generate final memory',
          detail: 'Only move to calculation memory and PDF when the main sections are already clean.',
          target: 'memory',
        },
      ];

  const priorityBlocks = [
    {
      id: 'foundation' as const,
      title: 'Foundation Layer',
      description: 'Rules backbone, project context, geometry governance and traceability.',
    },
    {
      id: 'core' as const,
      title: 'Core Modes',
      description: 'Accessibility, alarms, seismic and guide-rail data backbone.',
    },
    {
      id: 'extended' as const,
      title: 'Extended Modes',
      description: 'Existing buildings, vandal resistance and fire-rated door support.',
    },
  ];

  const nextBuildTargets = [
    {
      title: 'ISO 8100-1 closure',
      detail: 'Make clearances, pit, headroom and shaft geometry behave as a true source of truth.',
      modules: ['clearances', 'shaft', 'global'],
    },
    {
      title: 'Safety circuits evidence',
      detail: 'Turn 4.6 into a fully closed engineering section, not just a SIL fragment.',
      modules: ['sil', 'doors'],
    },
    {
      title: 'Existing-building mode',
      detail: 'Add EN 81-21 as a real project mode for constrained geometry and reduced clearances.',
      modules: ['clearances', 'shaft'],
    },
    {
      title: 'Accessibility-driven outputs',
      detail: 'Convert EN 81-70 from visual hints into rule-driven cabin and user-facing checks.',
      modules: ['cabin'],
    },
  ];

  return (
    <div className="space-y-8">
      <section className="bg-surface-container-low border border-outline-variant/20 rounded-sm p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 border border-primary/30 bg-primary/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.24em] text-primary">
              <ShieldCheck size={12} />
              Normative Control Layer
            </div>
            <div>
              <h2 className="text-3xl font-black tracking-tight text-on-surface">{workspace === 'hydraulic' ? 'ILATE Hydraulic Compliance Cockpit' : 'ILATE Lift Compliance Cockpit'}</h2>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-on-surface-variant">
                {workspace === 'hydraulic'
                  ? 'This overview is the dedicated hydraulic workspace. It should guide the user through cylinder, valve, safety and geometry checks without inheriting traction noise.'
                  : 'This overview should work as the starting point of the app. The goal is simple: show what to close next, send the user to the right section, and avoid treating the product as a bag of disconnected calculators.'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 lg:min-w-[360px]">
            <div className="border border-outline-variant/30 bg-surface-container-lowest p-4">
              <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-on-surface-variant">Standards</div>
              <div className="mt-2 text-3xl font-black text-on-surface">{coverage.totalStandards}</div>
              <div className="mt-2 text-xs text-on-surface-variant">{coverage.implementedStandards} implemented, {coverage.partialStandards} partial</div>
            </div>
            <div className="border border-outline-variant/30 bg-surface-container-lowest p-4">
              <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-on-surface-variant">Rules</div>
              <div className="mt-2 text-3xl font-black text-on-surface">{coverage.totalRules}</div>
              <div className="mt-2 text-xs text-on-surface-variant">{coverage.implementedRules} implemented, {coverage.partialRules} partial</div>
            </div>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="border border-emerald-500/20 bg-emerald-950/20 p-4">
            <div className="flex items-center gap-2 text-emerald-400">
              <CheckCircle2 size={16} />
              <span className="text-[11px] font-bold uppercase tracking-[0.2em]">Already Strong</span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-on-surface-variant">
              {workspace === 'hydraulic'
                ? 'Hydraulic checks, rupture-valve logic, buffers, safety gear, guide rails and the documentation stack already exist as active modules.'
                : 'ISO 8100-2 calculations, traction, safety gear, buffers, guide rails and hydraulic logic already exist as active modules.'}
            </p>
          </div>
          <div className="border border-amber-500/20 bg-amber-950/20 p-4">
            <div className="flex items-center gap-2 text-amber-300">
              <Clock3 size={16} />
              <span className="text-[11px] font-bold uppercase tracking-[0.2em]">Partially Closed</span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-on-surface-variant">
              {workspace === 'hydraulic'
                ? 'ISO 8100-1, EN 81-28, EN 81-70 and EN 81-77 still need better rule-driven closure inside the hydraulic flow.'
                : 'ISO 8100-1, EN 81-28, EN 81-70, EN 81-77 and ISO 8100-33 are present only as fragments and still need rule-driven closure.'}
            </p>
          </div>
          <div className="border border-error/20 bg-error-container/20 p-4">
            <div className="flex items-center gap-2 text-error">
              <AlertTriangle size={16} />
              <span className="text-[11px] font-bold uppercase tracking-[0.2em]">Missing Modes</span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-on-surface-variant">
              {workspace === 'hydraulic'
                ? 'Hydraulic-specific UX and proof flow still need more dedicated coverage, especially for the full power-unit chain and output structure.'
                : 'EN 81-21, EN 81-58 and EN 81-71 still do not exist as project modes, which leaves serious product gaps for constrained and special cases.'}
            </p>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-8 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="bg-surface-container-low border border-outline-variant/20 rounded-sm p-6">
          <div className="flex items-center gap-3">
            <Target size={18} className="text-primary" />
            <h3 className="text-lg font-black">Start Here</h3>
          </div>
          <div className="mt-6 grid grid-cols-1 gap-4">
            {workflowSections.map((section) => (
              <div key={section.title} className="border border-outline-variant/20 bg-surface-container-lowest p-4">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-2">
                    <h4 className="text-sm font-bold text-on-surface">{section.title}</h4>
                    <p className="text-sm leading-relaxed text-on-surface-variant">{section.description}</p>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {section.secondary.map((id) => {
                        const module = modules.find((entry) => entry.id === id);
                        if (!module) return null;
                        return (
                          <button
                            key={id}
                            onClick={() => onSelect(id)}
                            className="border border-outline-variant/30 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-on-surface-variant transition-colors hover:border-primary/40 hover:text-primary"
                          >
                            {module.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <button
                    onClick={() => onSelect(section.primary)}
                    className="inline-flex items-center gap-2 rounded-sm border border-primary/30 bg-primary/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-primary transition-colors hover:bg-primary/15"
                  >
                    Open Section
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-surface-container-low border border-outline-variant/20 rounded-sm p-6">
          <div className="flex items-center gap-3">
            <Layers3 size={18} className="text-primary" />
            <h3 className="text-lg font-black">Immediate Queue</h3>
          </div>
          <div className="mt-6 space-y-3">
            {actionQueue.map((item, index) => (
              <button
                key={item.title}
                onClick={() => onSelect(item.target)}
                className="w-full border border-outline-variant/20 bg-surface-container-lowest p-4 text-left transition-all hover:border-primary/40"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-[11px] font-black text-primary">
                    {index + 1}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-on-surface">{item.title}</h4>
                    <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">{item.detail}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-8 xl:grid-cols-[1.3fr_0.9fr]">
        <div className="bg-surface-container-low border border-outline-variant/20 rounded-sm p-6">
          <div className="flex items-center gap-3">
            <BookOpen size={18} className="text-primary" />
            <h3 className="text-lg font-black">Standards Coverage</h3>
          </div>
          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            {highlightedStandards.map((standard) => (
              <div key={standard.id} className="border border-outline-variant/20 bg-surface-container-lowest p-4">
                <div className="flex items-start justify-between gap-3">
                  <span className="text-sm font-black text-on-surface">{standard.shortTitle}</span>
                  <span className={`border px-2 py-0.5 text-[10px] font-bold uppercase ${statusClasses[standard.status]}`}>
                    {standard.status}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-on-surface-variant">{standard.role}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-sm border border-outline-variant/20 bg-surface-container-lowest p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-on-surface-variant">Coverage Note</p>
            <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
              The product is already anchored on ISO 8100-2. The remaining closure work is mostly geometry, alarms, accessibility, seismic logic and special project modes.
            </p>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-surface-container-low border border-outline-variant/20 rounded-sm p-6">
            <div className="flex items-center gap-3">
              <Target size={18} className="text-primary" />
              <h3 className="text-lg font-black">Build Priorities</h3>
            </div>
            <div className="mt-6 space-y-4">
              {priorityBlocks.map((block) => {
                const standards = getPriorityStandards(block.id);
                return (
                  <div key={block.id} className="border border-outline-variant/20 bg-surface-container-lowest p-4">
                    <div className="flex items-center justify-between gap-3">
                      <h4 className="text-sm font-bold text-on-surface">{block.title}</h4>
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">{standards.length} standards</span>
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">{block.description}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {standards.map((standard) => (
                        <span key={standard.id} className="border border-outline-variant/30 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-on-surface-variant">
                          {standard.shortTitle}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-surface-container-low border border-outline-variant/20 rounded-sm p-6">
            <div className="flex items-center gap-3">
              <Layers3 size={18} className="text-primary" />
              <h3 className="text-lg font-black">Immediate Targets</h3>
            </div>
            <div className="mt-6 space-y-3">
              {nextBuildTargets.map((target) => (
                <div key={target.title} className="border border-outline-variant/20 bg-surface-container-lowest p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="text-sm font-bold text-on-surface">{target.title}</h4>
                      <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">{target.detail}</p>
                    </div>
                    <ArrowRight size={16} className="mt-1 shrink-0 text-primary" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-surface-container-low border border-outline-variant/20 rounded-sm p-6">
        <div className="flex items-center gap-3">
          <Layers3 size={18} className="text-primary" />
          <h3 className="text-lg font-black">Section Readiness</h3>
        </div>
        <div className="mt-6 space-y-6">
          {categories.map((category) => {
            const categoryModules = modules.filter((module) => (module.category || 'Other') === category).filter((module) => module.id !== 'overview');
            if (categoryModules.length === 0) return null;

            const readinessScore =
              categoryModules.reduce((sum, module) => sum + statusScore[module.status], 0) / Math.max(categoryModules.length, 1);
            const readinessLabel = readinessScore >= 1.75 ? 'stable' : readinessScore >= 1 ? 'in progress' : 'early';
            const readinessTone =
              readinessScore >= 1.75
                ? 'bg-emerald-900/30 text-emerald-400 border-emerald-500/30'
                : readinessScore >= 1
                  ? 'bg-amber-900/30 text-amber-300 border-amber-500/30'
                  : 'bg-surface-container-high text-on-surface-variant border-outline-variant/50';

            return (
              <div key={category}>
                <div className="flex items-center justify-between gap-3 border-b border-outline-variant/20 pb-2">
                  <h4 className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary">
                    {category}
                  </h4>
                  <span className={`border px-2 py-0.5 text-[10px] font-bold uppercase ${readinessTone}`}>
                    {readinessLabel}
                  </span>
                </div>
                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {categoryModules.map((module) => {
                    const mappedRules = getRulesForModule(module.id);
                    return (
                      <button
                        key={module.id}
                        onClick={() => onSelect(module.id)}
                        className="border border-outline-variant/20 bg-surface-container-lowest p-4 text-left transition-all hover:border-primary/40"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-sm font-bold text-on-surface">{module.label}</span>
                          <span className={`border px-2 py-0.5 text-[10px] font-bold uppercase ${statusClasses[module.status]}`}>
                            {module.status}
                          </span>
                        </div>
                        <div className="mt-3 text-xs leading-relaxed text-on-surface-variant">
                          {mappedRules.length > 0 ? `${mappedRules.length} mapped normative rule${mappedRules.length > 1 ? 's' : ''}` : 'No mapped rules yet'}
                        </div>
                        {mappedRules.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {mappedRules.slice(0, 3).map((rule) => (
                              <span key={rule.id} className="border border-outline-variant/30 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-on-surface-variant">
                                {rule.clause}
                              </span>
                            ))}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="bg-surface-container-low border border-outline-variant/20 rounded-sm p-6">
        <div className="flex items-center gap-3">
          <BookOpen size={18} className="text-primary" />
          <h3 className="text-lg font-black">Rules Snapshot</h3>
        </div>
        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
          {highlightedRules.map((rule) => (
            <div key={rule.id} className="border border-outline-variant/20 bg-surface-container-lowest p-4">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-bold text-on-surface">{rule.title}</span>
                <span className={`border px-2 py-0.5 text-[10px] font-bold uppercase ${statusClasses[rule.status]}`}>
                  {rule.status}
                </span>
              </div>
              <div className="mt-2 text-xs font-bold uppercase tracking-[0.18em] text-primary">
                {rule.clause} · {rule.subsystem}
              </div>
              <p className="mt-3 text-sm leading-relaxed text-on-surface-variant">
                Applies to {rule.applicability.join(', ')} and depends on {rule.requiredInputs.length} key inputs.
              </p>
            </div>
          ))}
        </div>
        <div className="mt-4 rounded-sm border border-outline-variant/20 bg-surface-container-lowest p-4">
          <p className="text-sm leading-relaxed text-on-surface-variant">
            The full registry still exists underneath. This overview now only exposes a short operational sample so the page stays usable as a dashboard.
          </p>
        </div>
      </section>
    </div>
  );
};

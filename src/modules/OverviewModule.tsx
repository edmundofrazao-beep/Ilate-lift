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

export const OverviewModule = ({ modules, onSelect }: { modules: ModuleStatus[]; onSelect: (id: string) => void }) => {
  const coverage = getCoverageSummary();
  const categories = Array.from(new Set(modules.map((module) => module.category || 'Other')));

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
      title: 'Standards Registry',
      detail: 'Central clause and standard backbone for the whole product.',
      modules: ['overview'],
    },
    {
      title: 'Rules Registry',
      detail: 'Machine-readable checks linked to clauses, inputs and modules.',
      modules: ['overview'],
    },
    {
      title: 'Geometry Backbone',
      detail: 'Make ISO 8100-1 the real source of truth for pit, headroom and clearances.',
      modules: ['clearances', 'shaft', 'global'],
    },
    {
      title: 'Accessibility Engine',
      detail: 'Turn EN 81-70 from visual hints into rule-driven checks.',
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
              <h2 className="text-3xl font-black tracking-tight text-on-surface">ILATE Lift Compliance Cockpit</h2>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-on-surface-variant">
                The product now has an explicit standards backbone. The goal is to stop treating modules as isolated calculators and
                start treating the app as a guided engineering workflow with normative traceability.
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
              ISO 8100-2 calculations, traction, safety gear, buffers, guide rails and hydraulic logic already exist as active modules.
            </p>
          </div>
          <div className="border border-amber-500/20 bg-amber-950/20 p-4">
            <div className="flex items-center gap-2 text-amber-300">
              <Clock3 size={16} />
              <span className="text-[11px] font-bold uppercase tracking-[0.2em]">Partially Closed</span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-on-surface-variant">
              ISO 8100-1, EN 81-28, EN 81-70, EN 81-77 and ISO 8100-33 are present only as fragments and still need rule-driven closure.
            </p>
          </div>
          <div className="border border-error/20 bg-error-container/20 p-4">
            <div className="flex items-center gap-2 text-error">
              <AlertTriangle size={16} />
              <span className="text-[11px] font-bold uppercase tracking-[0.2em]">Missing Modes</span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-on-surface-variant">
              EN 81-21, EN 81-58 and EN 81-71 still do not exist as project modes, which leaves serious product gaps for constrained and special cases.
            </p>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-8 xl:grid-cols-[1.3fr_0.9fr]">
        <div className="bg-surface-container-low border border-outline-variant/20 rounded-sm p-6">
          <div className="flex items-center gap-3">
            <BookOpen size={18} className="text-primary" />
            <h3 className="text-lg font-black">Standards Coverage</h3>
          </div>
          <div className="mt-6 space-y-4">
            {STANDARDS_REGISTRY.map((standard) => (
              <div key={standard.id} className="border border-outline-variant/20 bg-surface-container-lowest p-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-black text-on-surface">{standard.shortTitle}</span>
                      <span className={`border px-2 py-0.5 text-[10px] font-bold uppercase ${statusClasses[standard.status]}`}>
                        {standard.status}
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed text-on-surface-variant">{standard.role}</p>
                  </div>
                  <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant">
                    {standard.priority}
                  </div>
                </div>
              </div>
            ))}
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
          <h3 className="text-lg font-black">Module Readiness</h3>
        </div>
        <div className="mt-6 space-y-6">
          {categories.map((category) => {
            const categoryModules = modules.filter((module) => (module.category || 'Other') === category).filter((module) => module.id !== 'overview');
            if (categoryModules.length === 0) return null;

            return (
              <div key={category}>
                <h4 className="border-b border-outline-variant/20 pb-2 text-[11px] font-bold uppercase tracking-[0.22em] text-primary">
                  {category}
                </h4>
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
          <h3 className="text-lg font-black">Rules Registry Snapshot</h3>
        </div>
        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
          {RULES_REGISTRY.slice(0, 8).map((rule) => (
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
      </section>
    </div>
  );
};

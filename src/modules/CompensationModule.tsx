import React from 'react';
import { Package, CheckCircle2, AlertTriangle, ArrowRightLeft } from 'lucide-react';
import { ProjectData } from '../types';
import { InputGroup, LiftField, formatNumber } from '../components/ui';

const getCompensationAssessment = (data: ProjectData) => {
  const triggerBySpeed = data.speed >= 2.5;
  const triggerByTravel = data.travel >= 45;
  const shouldReview = data.type === 'electric' && (triggerBySpeed || triggerByTravel);

  const recommendedType = data.speed >= 3 ? 'rope' : 'chain';
  const selectedOk = !shouldReview
    ? data.compensationType === 'none'
    : data.compensationType === recommendedType;

  const suspendedMass = data.carMass + data.ratedLoad + (data.suspensionType === 'belt' ? data.numBelts * data.beltTensileStrength / 400 : data.numRopes * data.ropeDiameter * 2.2);
  const estimatedCompMass = data.compensationType === 'chain'
    ? Math.max(data.travel * 3.5, 0)
    : data.compensationType === 'rope'
      ? Math.max(data.travel * 2.1, 0)
      : 0;

  return {
    shouldReview,
    recommendedType,
    selectedOk,
    suspendedMass,
    estimatedCompMass,
  };
};

export const CompensationModule = ({ data, onChange }: { data: ProjectData; onChange: (newData: Partial<ProjectData>) => void }) => {
  const assessment = getCompensationAssessment(data);
  const isHydraulic = data.type === 'hydraulic';

  if (isHydraulic) {
    return (
      <div className="space-y-8">
        <div className="rounded-sm border border-outline-variant/20 bg-surface-container-low p-6">
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.05fr_0.95fr]">
            <div className="rounded-sm border border-outline-variant/20 bg-gradient-to-br from-surface-container-high to-surface-container-lowest p-6">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-primary">
                <Package size={12} />
                Hydraulic lock
              </div>
              <h3 className="text-2xl font-black tracking-tight text-on-surface">Compensation Means Not Used</h3>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-on-surface-variant">
                Hydraulic projects in this workspace do not route through compensation means. Keep this page read-only and close the hydraulic chain in the dedicated hydraulic, rupture-valve, buffers and guide-rail sections.
              </p>
            </div>
            <div className="rounded-sm border border-emerald-200 bg-emerald-50 p-6">
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-emerald-700">Current state</p>
              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between rounded-sm border border-emerald-200 bg-white p-3">
                  <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">Compensation means</span>
                  <span className="text-xs font-black uppercase text-emerald-700">none</span>
                </div>
                <div className="flex items-center justify-between rounded-sm border border-emerald-200 bg-white p-3">
                  <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">Speed envelope</span>
                  <span className="text-xs font-black uppercase text-emerald-700">≤ 1.0 m/s</span>
                </div>
                <div className="flex items-center justify-between rounded-sm border border-emerald-200 bg-white p-3">
                  <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">Hydraulic status</span>
                  <span className="text-xs font-black uppercase text-emerald-700">isolated correctly</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-sm border border-outline-variant/20 bg-surface-container-lowest p-6">
            <h4 className="mb-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-primary">
              <ArrowRightLeft size={12} />
              Continue in these sections
            </h4>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {[
                'Hydraulic Core (4.15)',
                'Rupture Valve (4.9)',
                'Buffers (4.5)',
                'Guide Rail Checks',
              ].map((item) => (
                <div key={item} className="rounded-sm border border-outline-variant/20 bg-surface-container-low p-3 text-xs font-bold uppercase tracking-[0.14em] text-on-surface">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="rounded-sm border border-outline-variant/20 bg-surface-container-low p-6">
        <div className="mb-6 grid grid-cols-1 gap-4 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-sm border border-outline-variant/20 bg-gradient-to-br from-surface-container-high to-surface-container-lowest p-6">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-primary">
              <Package size={12} />
              Compensation means
            </div>
            <h3 className="text-2xl font-black tracking-tight text-on-surface">Suspension and Compensation Review</h3>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-on-surface-variant">
              This page closes the vertical balancing strategy for traction systems only. Hydraulic layouts do not use compensation means in this workspace and should never route through this review.
            </p>
          </div>
          <div className="rounded-sm border border-outline-variant/20 bg-surface-container-lowest p-6">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white">Decision state</p>
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between rounded-sm border border-outline-variant/20 bg-surface-container-low p-3">
                <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-on-surface-variant">Project type</span>
                <span className="text-xs font-black uppercase text-on-surface">{data.type}</span>
              </div>
              <div className="flex items-center justify-between rounded-sm border border-outline-variant/20 bg-surface-container-low p-3">
                <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-on-surface-variant">Recommended</span>
                <span className="text-xs font-black uppercase text-primary">{assessment.shouldReview ? assessment.recommendedType : 'none required'}</span>
              </div>
              <div className={`flex items-center justify-between rounded-sm border p-3 ${assessment.selectedOk ? 'border-emerald-200 bg-emerald-50' : 'border-amber-200 bg-amber-50'}`}>
                <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-on-surface-variant">Status</span>
                <span className={`text-xs font-black uppercase ${assessment.selectedOk ? 'text-emerald-700' : 'text-amber-700'}`}>
                  {assessment.selectedOk ? 'aligned' : 'review required'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <InputGroup label="Compensation Definition">
            <div data-field="compensationType" className="space-y-1 md:col-span-2 scroll-mt-28">
              <label htmlFor="field-compensationType" className="text-[11px] font-bold text-on-surface-variant uppercase">Compensation Means</label>
              <select
                id="field-compensationType"
                value={data.compensationType}
                onChange={(e) => onChange({ compensationType: e.target.value as ProjectData['compensationType'] })}
                className="w-full rounded-sm border border-outline-variant/20 bg-surface-container-lowest px-3 py-2 text-sm outline-none transition-all focus:ring-1 focus:ring-primary"
              >
                <option value="none">None</option>
                <option value="chain">Compensation Chain</option>
                <option value="rope">Compensation Rope</option>
              </select>
            </div>
            <LiftField label="Travel (H)" name="travel" unit="m" data={data} onChange={onChange} min={1} max={500} />
            <LiftField label="Rated Speed (v)" name="speed" unit="m/s" data={data} onChange={onChange} min={0.1} max={10} step={0.1} />
            <div className="rounded-sm border border-primary/20 bg-primary/5 p-4 md:col-span-2">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-primary">Editing rule</p>
              <p className="mt-2 text-xs leading-relaxed text-on-surface-variant">
                Compensation logic stays here. Suspension means stay in <strong>Suspension Setup</strong>, and traction proof stays in <strong>Traction Checks</strong>.
              </p>
            </div>
          </InputGroup>

          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="rounded-sm border border-outline-variant/20 bg-surface-container-lowest p-4">
                <p className="text-[10px] font-bold uppercase text-on-surface-variant">Suspended mass snapshot</p>
                <p className="mt-2 text-xl font-black text-on-surface">{formatNumber(assessment.suspendedMass)} kg</p>
              </div>
              <div className="rounded-sm border border-outline-variant/20 bg-surface-container-lowest p-4">
                <p className="text-[10px] font-bold uppercase text-on-surface-variant">Estimated comp. mass</p>
                <p className="mt-2 text-xl font-black text-on-surface">{formatNumber(assessment.estimatedCompMass)} kg</p>
              </div>
              <div className={`rounded-sm border p-4 ${assessment.shouldReview ? 'border-amber-200 bg-amber-50' : 'border-emerald-200 bg-emerald-50'}`}>
                <p className="text-[10px] font-bold uppercase text-on-surface-variant">Trigger state</p>
                <p className={`mt-2 text-xl font-black ${assessment.shouldReview ? 'text-amber-700' : 'text-emerald-700'}`}>
                  {assessment.shouldReview ? 'Review' : 'Clear'}
                </p>
              </div>
            </div>

            <div className="rounded-sm border border-outline-variant/20 bg-surface-container-lowest p-6">
              <h4 className="mb-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-primary">
                <ArrowRightLeft size={12} />
                Compensation checklist
              </h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  {data.type === 'electric' ? <CheckCircle2 size={16} className="text-emerald-600" /> : <AlertTriangle size={16} className="text-amber-600" />}
                  <span className="text-xs text-on-surface">Compensation is evaluated only for traction layouts.</span>
                </div>
                <div className="flex items-center gap-3">
                  {assessment.shouldReview ? <AlertTriangle size={16} className="text-amber-600" /> : <CheckCircle2 size={16} className="text-emerald-600" />}
                  <span className="text-xs text-on-surface">Travel and speed are screened to decide whether compensation review is required.</span>
                </div>
                <div className="flex items-center gap-3">
                  {assessment.selectedOk ? <CheckCircle2 size={16} className="text-emerald-600" /> : <AlertTriangle size={16} className="text-amber-600" />}
                  <span className="text-xs text-on-surface">Selected means is consistent with the current project envelope.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

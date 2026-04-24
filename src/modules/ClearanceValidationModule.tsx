import React from 'react';
import { ProjectData } from '../types';
import { LiftField } from '../components/ui';

export const ClearanceValidationModule = ({ data, onChange }: { data: ProjectData, onChange: (newData: Partial<ProjectData>) => void }) => {
  const checks = [
    { key: "wellToCarWall", clause: "4.2.5.3.1", value: data.wellToCarWall, limit: 0.15, op: "<=", unit: "m", note: "Well wall to car sill/frame/door edge", max: 0.5 },
    { key: "sillGap", clause: "4.3.4.1", value: data.sillGap, limit: 0.035, op: "<=", unit: "m", note: "Car sill to landing sill gap", max: 0.1 },
    { key: "doorPanelGap", clause: "4.3.4.2", value: data.doorPanelGap, limit: 0.10, op: "<=", unit: "m", note: "Door panel clearance", max: 0.2 },
    { key: "pitRefugeHeight", clause: "4.2.5.8.2(a)", value: data.pitRefugeHeight, limit: 0.50, op: ">=", unit: "m", note: "Pit/platform to lowest car parts", max: 2.0 },
    { key: "pitObstacleClearance", clause: "4.2.5.8.2(b)", value: data.pitObstacleClearance, limit: 0.30, op: ">=", unit: "m", note: "Pit fixed parts to lowest car parts", max: 1.0 },
    { key: "pitFreeVerticalHazard", clause: "4.2.3.3(d)2", value: data.pitFreeVerticalHazard, limit: 2.00, op: ">=", unit: "m", note: "Free vertical distance in pit hazardous zone", max: 3.5 },
    { key: "carToCwtDistance", clause: "4.2.5.5.3", value: data.carToCwtDistance, limit: 0.05, op: ">=", unit: "m", note: "Car and associated parts to counterweight", max: 0.3 },
    { key: "headroomGeneral", clause: "4.2.5.7.2(a)", value: data.headroomGeneral, limit: 0.50, op: ">=", unit: "m", note: "General headroom above car roof fixed parts", max: 3.0 },
    { key: "headroomGuideShoeZone", clause: "4.2.5.7.2(b)", value: data.headroomGuideShoeZone, limit: 0.10, op: ">=", unit: "m", note: "Guide shoes/suspension terminations zone", max: 1.0 },
    { key: "carRoofBalustradeHeight", clause: "car roof safety barrier", value: data.carRoofBalustradeHeight, limit: 1.10, op: ">=", unit: "m", note: "Top of car balustrade minimum operating height for high-risk envelope", max: 1.5 },
    { key: "balustradeVertical", clause: "4.2.5.7.2(c)1", value: data.balustradeVertical, limit: 0.30, op: ">=", unit: "m", note: "Vertical above balustrade zone", max: 1.0 },
    { key: "toeBoardOutside", clause: "4.2.5.7.2(d)2", value: data.toeBoardOutside, limit: 0.10, op: ">=", unit: "m", note: "Outside toe board vertical clearance", max: 0.5 },
    { key: "ramHeadClearance", clause: "4.2.5.7.4", value: data.ramHeadClearance, limit: 0.10, op: ">=", unit: "m", note: "Ceiling to ram-head assembly", max: 1.0 },
    { key: "cwtScreenBottomFromPit", clause: "4.2.5.5.1(c)", value: data.cwtScreenBottomFromPit, limit: 0.30, op: "<=", unit: "m", note: "Lowest part of CWT screen from pit floor", max: 1.0 },
    { key: "cwtScreenHeight", clause: "4.2.5.5.1(b)", value: data.cwtScreenHeight, limit: 2.00, op: ">=", unit: "m", note: "CWT screen minimum extension height", max: 3.0 }
  ];

  const results = checks.map((c) => {
    const pass = c.op === "<=" ? c.value <= c.limit : c.value >= c.limit;
    return { ...c, pass };
  });

  const passCount = results.filter(r => r.pass).length;
  const allPass = passCount === results.length;

  return (
    <div className="space-y-8">
      <div className="bg-surface-container-low p-8 border-t-2 border-primary">
        <div className="mb-8 grid grid-cols-1 gap-4 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-sm border border-outline-variant/20 bg-gradient-to-br from-surface-container-high to-surface-container-lowest p-6">
            <h3 className="text-2xl font-black tracking-tight text-on-surface">Clearances (ISO 8100-1)</h3>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-on-surface-variant">
              Validate the shaft and refuge dimensions here. This page should answer one question fast: pass or review.
            </p>
          </div>
          <div className="rounded-sm border border-outline-variant/20 bg-surface-container-lowest p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white">Clearance State</p>
                <p className="mt-2 text-sm text-on-surface-variant">Passed items: {passCount} / {results.length}</p>
              </div>
              <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase ${allPass ? 'bg-emerald-100 text-emerald-700' : 'bg-error-container/20 text-error'}`}>
                {allPass ? 'pass' : 'review'}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {results.map(r => (
            <div key={r.key} className={`p-4 border ${r.pass ? 'bg-surface-container-lowest border-outline-variant/10' : 'bg-error-container/10 border-error/20'}`}>
              <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_280px] xl:items-center">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-primary uppercase">{r.clause}</p>
                    <p className="text-xs font-medium">{r.note}</p>
                    <p className="text-[10px] text-on-surface-variant uppercase tracking-[0.16em]">
                      {r.value.toFixed(3)} {r.unit} {r.op} {r.limit.toFixed(3)} {r.unit}
                    </p>
                  </div>
                  <span className={`shrink-0 rounded-full px-3 py-1 text-[10px] font-bold uppercase ${r.pass ? 'bg-emerald-100 text-emerald-700' : 'bg-error-container/20 text-error'}`}>
                    {r.pass ? 'pass' : 'review'}
                  </span>
                </div>
                <div className="w-full">
                  <LiftField label="Clearance" name={r.key as keyof ProjectData} unit="m" data={data} onChange={onChange} min={0} max={r.max} step={0.01} required />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

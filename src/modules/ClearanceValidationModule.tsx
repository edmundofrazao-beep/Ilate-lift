import React from 'react';
import { ProjectData, ModuleStatus } from '../types';
import { safeNumber, formatNumber, degToRad, InputGroup, LiftField, SliderField, CollapsibleSection } from '../components/ui';
import { ISO_RAIL_PROFILES, BELT_PROFILES } from '../constants';
import { CheckCircle2, ShieldCheck, Zap, AlertTriangle, Info, ChevronRight, Calculator, FileText, Database, Activity, Package, Maximize, AlertCircle, PlayCircle, Settings, CheckSquare } from 'lucide-react';
import { BlockMath, InlineMath } from 'react-katex';

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
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xl font-bold">ISO 8100-1 Shaft Clearance Validation</h3>
          <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase ${allPass ? 'bg-emerald-100 text-emerald-700' : 'bg-error-container/20 text-error'}`}>
            {allPass ? 'PASS' : 'ATTENTION'} {passCount}/{results.length}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {results.map(r => (
            <div key={r.key} className={`p-4 border flex flex-col gap-4 ${r.pass ? 'bg-surface-container-lowest border-outline-variant/10' : 'bg-error-container/10 border-error/20'}`}>
              <div className="flex justify-between w-full">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-primary uppercase">{r.clause}</p>
                  <p className="text-xs font-medium">{r.note}</p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-black ${r.pass ? 'text-emerald-600' : 'text-error'}`}>
                    {r.value.toFixed(3)} {r.unit} {r.op} {r.limit.toFixed(3)} {r.unit}
                  </p>
                </div>
              </div>
              <div className="w-full">
                <LiftField label="Clearance" name={r.key as keyof ProjectData} unit="m" data={data} onChange={onChange} min={0} max={r.max} step={0.01} required />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

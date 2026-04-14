import { CloudDrizzle } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="h-10 bg-surface-container-low border-t border-outline-variant/10 px-8 flex items-center justify-between text-[10px] text-on-surface-variant font-medium shrink-0">
      <div className="flex gap-6">
        <span>ISO 8100-2:2026 Engine v1.0.4</span>
        <span>Workspace: Global Project Alpha-7</span>
      </div>
      <div className="flex gap-4 items-center">
        <span className="flex items-center gap-1">
          <CloudDrizzle size={12} className="text-emerald-600" /> 
          All Changes Saved
        </span>
        <span className="bg-primary/10 px-2 py-0.5 rounded text-primary font-bold">
          LIFTCALC ENTERPRISE LICENSE
        </span>
      </div>
    </footer>
  );
}

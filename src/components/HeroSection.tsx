import { AlertTriangle } from 'lucide-react';

interface ModuleCardProps {
  module: string;
  title: string;
  status: 'IMPLEMENTED' | 'PARTIAL' | 'PLACEHOLDER';
}

function ModuleCard({ module, title, status }: ModuleCardProps) {
  const statusStyles = {
    IMPLEMENTED: 'bg-primary/10 text-primary',
    PARTIAL: 'bg-tertiary/10 text-tertiary',
    PLACEHOLDER: 'bg-slate-200 text-slate-600 opacity-60'
  };

  return (
    <div className={`bg-surface-container-low p-5 border-t-2 shadow-sm transition-all hover:shadow-md ${status === 'PLACEHOLDER' ? 'opacity-60 grayscale-[0.5]' : ''} ${status === 'IMPLEMENTED' ? 'border-primary' : 'border-tertiary'}`}>
      <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">{module}</p>
      <h4 className="text-base font-bold mb-3">{title}</h4>
      <div className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${statusStyles[status]}`}>
        {status}
      </div>
    </div>
  );
}

export default function HeroSection() {
  return (
    <section className="max-w-7xl mx-auto w-full space-y-8">
      <div>
        <h2 className="text-[2.25rem] font-black text-on-surface tracking-tight leading-tight">
          LiftCalc - Engineering & Calculation Tool <br/>
          <span className="text-primary font-medium opacity-80">(ISO 8100-2:2026)</span>
        </h2>
        
        <div className="mt-6 bg-error-container/10 border-l-4 border-error p-4 flex items-start gap-4">
          <AlertTriangle className="text-error shrink-0 mt-0.5" size={20} />
          <div>
            <p className="text-on-error-container text-sm font-semibold">Legal Disclaimer & Compliance Notice</p>
            <p className="text-on-error-container/80 text-sm leading-relaxed">
              Ferramenta de pré-dimensionamento e apoio ao projeto. Não substitui a confirmação contra o texto exato da ISO 8100-2. 
              The user is solely responsible for final technical validation and structural safety according to local regulations.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <ModuleCard module="Module 01" title="Traction" status="IMPLEMENTED" />
        <ModuleCard module="Module 02" title="Global Project" status="IMPLEMENTED" />
        <ModuleCard module="Module 03" title="Ropes" status="PARTIAL" />
        <ModuleCard module="Module 04" title="Guide Rails" status="PLACEHOLDER" />
        <ModuleCard module="Module 05" title="Hydraulic" status="PLACEHOLDER" />
        <ModuleCard module="Module 06" title="Safety Comp." status="PARTIAL" />
      </div>
    </section>
  );
}

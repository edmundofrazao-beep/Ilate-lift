import { Network } from 'lucide-react';

const workflowSteps = [
  {
    id: '01',
    title: 'Data Acquisition',
    description: 'Input of primary technical variables: load (P+Q), nominal speed, shaft height, and environmental classification.'
  },
  {
    id: '02',
    title: 'Suspension Analysis',
    description: 'Definition of rope diameter, number of falls, and safety factors calculation according to ISO 8100-2 Section 5.12.'
  },
  {
    id: '03',
    title: 'Traction Verification',
    description: "Friction checks for 'empty car up' and 'emergency stop' conditions. Adhesion coefficient evaluation."
  },
  {
    id: '04',
    title: 'Mechanical Compliance',
    description: 'Guide rail buckling tests, safety gear force distribution, and buffer energy absorption capacity.'
  }
];

export default function WorkflowSection() {
  return (
    <div className="bg-surface-container-low/50 p-8 rounded-sm border border-outline-variant/5">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <Network className="text-primary" size={20} />
          Workflow de Projeto
        </h3>
        <span className="text-xs text-on-surface-variant italic opacity-70">Standard ISO Procedure v2.6</span>
      </div>
      
      <div className="space-y-4">
        {workflowSteps.map((step) => (
          <div key={step.id} className="flex items-start gap-4 p-4 bg-surface-container-lowest border border-outline-variant/10 hover:border-primary/30 transition-colors group">
            <div className="h-8 w-8 rounded-full bg-primary/5 text-primary flex items-center justify-center font-bold text-xs shrink-0 group-hover:bg-primary group-hover:text-white transition-colors">
              {step.id}
            </div>
            <div>
              <h5 className="text-sm font-bold uppercase tracking-tight">{step.title}</h5>
              <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">{step.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

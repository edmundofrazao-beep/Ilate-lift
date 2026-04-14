import { Maximize2 } from 'lucide-react';

const tableData = [
  { name: 'Total Load (P + Q)', id: 'VAR_MASS_TOTAL', value: '12,450.00', unit: 'kg', status: 'Valid', statusColor: 'text-emerald-600' },
  { name: 'Max Travel Height', id: 'VAR_HT_TRAVEL', value: '42.50', unit: 'm', status: 'Valid', statusColor: 'text-emerald-600' },
  { name: 'Suspension Ratio', id: 'VAR_SUSP_RATIO', value: '2 : 1', unit: 'ratio', status: 'Valid', statusColor: 'text-emerald-600' },
  { name: 'Rope Minimum Bending', id: 'VAR_ROPE_BEND', value: '400.00', unit: 'mm', status: 'Check Req.', statusColor: 'text-amber-600' },
];

export default function DataTable() {
  return (
    <section className="max-w-7xl mx-auto w-full">
      <div className="bg-surface-container-lowest border border-outline-variant/10 overflow-hidden shadow-sm rounded-sm">
        <div className="bg-surface-container px-6 py-3 flex justify-between items-center">
          <h3 className="text-sm font-bold uppercase tracking-tight text-on-surface-variant">Active Calculation Summary</h3>
          <button className="text-on-surface-variant hover:text-primary transition-colors">
            <Maximize2 size={16} />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-surface text-on-surface-variant uppercase text-[10px] font-bold tracking-widest border-b border-outline-variant/10">
                <th className="px-6 py-3">Parameter Name</th>
                <th className="px-6 py-3">Variable ID</th>
                <th className="px-6 py-3">Value</th>
                <th className="px-6 py-3">Unit</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="text-xs">
              {tableData.map((row, idx) => (
                <tr key={idx} className={`hover:bg-primary/5 transition-colors ${idx % 2 !== 0 ? 'bg-surface-container-low/30' : ''}`}>
                  <td className="px-6 py-4 font-semibold">{row.name}</td>
                  <td className="px-6 py-4 font-mono opacity-60">{row.id}</td>
                  <td className="px-6 py-4">{row.value}</td>
                  <td className="px-6 py-4 italic">{row.unit}</td>
                  <td className="px-6 py-4">
                    <span className={`${row.statusColor} font-bold flex items-center gap-1.5`}>
                      <span className="h-1.5 w-1.5 rounded-full bg-current" />
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

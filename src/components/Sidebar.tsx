import { 
  LayoutDashboard, 
  Globe, 
  Library, 
  Settings2, 
  Cable, 
  ArrowUpDown, 
  Droplets, 
  ShieldCheck, 
  Box, 
  History, 
  FileText, 
  CheckSquare,
  Play
} from 'lucide-react';
import { motion } from 'motion/react';

const navItems = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard, active: true },
  { id: 'global', label: 'Global Project', icon: Globe },
  { id: 'library', label: 'Component Library', icon: Library },
  { id: 'traction', label: 'Traction', icon: Settings2 },
  { id: 'ropes', label: 'Ropes/Suspension', icon: Cable },
  { id: 'rails', label: 'Guide Rails', icon: ArrowUpDown },
  { id: 'hydraulic', label: 'Hydraulic', icon: Droplets },
  { id: 'safety', label: 'Safety Components', icon: ShieldCheck },
  { id: 'shaft', label: '3D Shaft', icon: Box },
  { id: 'memory', label: 'Calculation Memory', icon: History },
  { id: 'export', label: 'PDF Export', icon: FileText },
  { id: 'checks', label: 'Runtime Checks', icon: CheckSquare },
];

export default function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 h-full flex flex-col py-4 gap-1 z-40 w-64 border-r border-outline-variant/10 bg-white/50 backdrop-blur-sm font-sans text-[13px] font-medium overflow-y-auto no-scrollbar">
      <div className="px-6 mb-8">
        <h1 className="text-xl font-black text-on-surface uppercase tracking-tighter">Project Alpha-7</h1>
        <p className="text-[11px] text-on-surface-variant font-semibold tracking-widest uppercase opacity-70">ISO 8100-2:2026 Compliance</p>
      </div>
      
      <nav className="flex-1 flex flex-col gap-0.5">
        {navItems.map((item) => (
          <a
            key={item.id}
            href="#"
            className={`flex items-center gap-3 px-6 py-2.5 transition-all duration-200 group ${
              item.active 
                ? 'bg-primary/10 text-primary border-r-4 border-primary' 
                : 'text-secondary hover:bg-surface-container-low hover:translate-x-1'
            }`}
          >
            <item.icon size={18} className={item.active ? 'text-primary' : 'text-secondary opacity-70 group-hover:opacity-100'} />
            <span>{item.label}</span>
          </a>
        ))}
      </nav>

      <div className="px-6 pt-4 mt-auto">
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-2.5 bg-gradient-to-r from-primary to-primary-dim text-white rounded-sm font-bold shadow-md hover:opacity-90 transition-all text-[12px] uppercase tracking-wider flex items-center justify-center gap-2"
        >
          <Play size={14} fill="currentColor" />
          Run Validation
        </motion.button>
      </div>
    </aside>
  );
}

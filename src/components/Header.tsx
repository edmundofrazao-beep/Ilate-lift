import { Search, Settings, HelpCircle, UserCircle } from 'lucide-react';

export default function Header() {
  return (
    <header className="flex justify-between items-center w-full px-8 h-14 bg-white/70 backdrop-blur-md sticky top-0 z-50 border-b border-outline-variant/10">
      <div className="flex items-center gap-6">
        <span className="text-lg font-bold tracking-tighter text-on-primary-container uppercase">LiftCalc ISO 8100-2</span>
        <nav className="hidden md:flex gap-6">
          <a className="text-primary font-semibold border-b-2 border-primary text-sm py-4" href="#">Dashboard</a>
          <a className="text-secondary hover:text-primary text-sm py-4 transition-colors" href="#">Resources</a>
          <a className="text-secondary hover:text-primary text-sm py-4 transition-colors" href="#">Normative Tables</a>
        </nav>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="relative group">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant opacity-50 group-focus-within:opacity-100 transition-opacity" />
          <input 
            className="bg-surface-container-low border-none rounded-sm text-xs pl-9 pr-4 py-1.5 w-64 focus:ring-1 focus:ring-primary outline-none transition-all" 
            placeholder="Search parameters..." 
            type="text"
          />
        </div>
        <div className="flex gap-1">
          <button className="p-2 text-secondary hover:bg-surface-container transition-colors rounded-full">
            <Settings size={18} />
          </button>
          <button className="p-2 text-secondary hover:bg-surface-container transition-colors rounded-full">
            <HelpCircle size={18} />
          </button>
          <button className="p-2 text-secondary hover:bg-surface-container transition-colors rounded-full">
            <UserCircle size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}

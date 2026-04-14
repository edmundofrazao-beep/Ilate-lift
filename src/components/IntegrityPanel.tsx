import { motion } from 'motion/react';

export default function IntegrityPanel() {
  return (
    <div className="space-y-6">
      <div className="bg-slate-900 text-white p-6 rounded-sm shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold uppercase tracking-widest text-indigo-300">Runtime Integrity</h3>
          <div className="flex items-center gap-1.5">
            <motion.span 
              animate={{ opacity: [1, 0.4, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="h-2 w-2 rounded-full bg-emerald-500"
            />
            <span className="text-[10px] text-emerald-400 font-bold uppercase">System Core OK</span>
          </div>
        </div>
        
        <div className="space-y-4 font-mono text-[11px] opacity-80">
          <div className="flex justify-between border-b border-white/10 pb-2">
            <span>Compiler Version:</span>
            <span>ISO-C8100.26</span>
          </div>
          <div className="flex justify-between border-b border-white/10 pb-2">
            <span>Logic Engine:</span>
            <span>Active (V-Sync)</span>
          </div>
          <div className="flex justify-between border-b border-white/10 pb-2">
            <span>Memory Heap:</span>
            <span>24.5MB / 128MB</span>
          </div>
          <div className="flex justify-between">
            <span>Thread Load:</span>
            <span>2.4%</span>
          </div>
        </div>
        
        <div className="mt-8">
          <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: '88%' }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="bg-indigo-400 h-full"
            />
          </div>
          <p className="text-[10px] mt-2 text-indigo-200">Calculation Engine Integrity: 99.98% High-Precision</p>
        </div>
      </div>

      <div className="relative aspect-square bg-surface-container overflow-hidden group rounded-sm border border-outline-variant/10">
        <img 
          alt="Technical drawing of elevator shaft" 
          className="w-full h-full object-cover mix-blend-multiply opacity-40 grayscale group-hover:scale-105 transition-transform duration-700" 
          referrerPolicy="no-referrer"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuD6rvUGMcnL3RleaupDZiUsJvnIv8TtrkfPjKTgXKL7Ok1tFuHI3nlebifVgDM7D0ju-Xw9NIe2T-WBhJtBZWPc9NIe2T-WBhJtBZWPc9NYJH8XjHm-KUe3Qwm_65ksk8mp-lPrHTnMvRJVudeTLPeFwcIJMSKRrar_TXhOP4f1kdQztWMmIG0W0CoFHh-BYXe3N9flj4QxlXdy-02ybMcfpuwrBRrnV5mcUlIVoFbgHRmY8XFjlhBYmpdwS2om_HiJY1ZL1Ka0q85EC513e-iW3dLLJy9Y" 
        />
        <div className="absolute inset-0 flex flex-col justify-end p-6 bg-gradient-to-t from-white via-white/20 to-transparent">
          <span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] mb-1">Visualizer</span>
          <h4 className="text-sm font-bold text-on-surface">Integrated 3D Shaft Geometry</h4>
        </div>
      </div>
    </div>
  );
}

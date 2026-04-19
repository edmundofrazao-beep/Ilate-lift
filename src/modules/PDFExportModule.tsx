import React from 'react';
import { ProjectData, ModuleStatus } from '../types';
import { safeNumber, formatNumber, degToRad, InputGroup, LiftField, SliderField, CollapsibleSection } from '../components/ui';
import { ISO_RAIL_PROFILES, BELT_PROFILES } from '../constants';
import { CheckCircle2, ShieldCheck, Zap, AlertTriangle, Info, ChevronRight, Calculator, FileText, Database, Activity, Package, Maximize, AlertCircle, PlayCircle, Settings, CheckSquare } from 'lucide-react';
import { BlockMath, InlineMath } from 'react-katex';
import { CalculationMemoryModule } from './CalculationMemoryModule';
import { XCircle } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export const PDFExportModule = ({ data }: { data: ProjectData }) => {
  const [isGenerating, setIsGenerating] = React.useState(false);

  const exportPDF = async () => {
    setIsGenerating(true);
    try {
      const element = document.getElementById('calculation-memory-report');
      if (!element) {
        console.error('Report element not found');
        return;
      }

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        onclone: (clonedDoc) => {
          // html2canvas fails on oklch/oklab colors which are default in Tailwind v4
          // We need to replace them in the cloned document before rendering
          const elements = clonedDoc.getElementsByTagName('*');
          for (let i = 0; i < elements.length; i++) {
            const el = elements[i] as HTMLElement;
            
            // Check inline style attribute first as it's faster
            const styleAttr = el.getAttribute('style');
            if (styleAttr && (styleAttr.includes('oklch') || styleAttr.includes('oklab'))) {
              el.setAttribute('style', styleAttr.replace(/okl(ch|ab)\([^)]+\)/g, '#000000'));
            }

            // Check computed style for values coming from stylesheets
            const style = window.getComputedStyle(el);
            const colorProps = [
              'color', 
              'background-color', 
              'border-color', 
              'border-top-color', 
              'border-right-color', 
              'border-bottom-color', 
              'border-left-color', 
              'fill', 
              'stroke',
              'stop-color',
              'flood-color',
              'lighting-color'
            ];

            colorProps.forEach(prop => {
              try {
                const val = style.getPropertyValue(prop);
                if (val && (val.includes('oklch') || val.includes('oklab'))) {
                  // Fallback to a safe color
                  // For backgrounds, we might want white or transparent, but black is safer for visibility if it's a border/text
                  const fallback = (prop === 'color' || prop === 'fill' || prop === 'stroke' || prop.includes('border')) 
                    ? '#333333' 
                    : 'transparent';
                  el.style.setProperty(prop, fallback, 'important');
                }
              } catch (e) {
                // Ignore errors for unsupported properties
              }
            });
          }
        }
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      // Handle multi-page if height exceeds A4
      const pageHeight = pdf.internal.pageSize.getHeight();
      let heightLeft = pdfHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`LiftCalc_Report_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('PDF Export failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="bg-surface-container-low p-8 rounded-sm border border-outline-variant/10 text-center">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <FileText size={32} className="text-primary" />
        </div>
        <h2 className="text-2xl font-black uppercase tracking-tighter mb-2">Technical Report Generator</h2>
        <p className="text-on-surface-variant mb-8 max-w-md mx-auto">
          Generate a comprehensive PDF report containing all engineering parameters, ISO 8100-2 calculations, and compliance verifications.
        </p>
        
        <button 
          onClick={exportPDF}
          disabled={isGenerating}
          className="px-8 py-4 bg-primary text-white font-black uppercase tracking-[0.2em] rounded-sm hover:opacity-90 transition-all shadow-lg flex items-center gap-3 mx-auto disabled:opacity-50"
        >
          {isGenerating ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <FileText size={18} />
              Export PDF Report
            </>
          )}
        </button>
      </div>

      <div className="bg-amber-50 border border-amber-200 p-6 rounded-sm flex gap-4">
        <Info className="text-amber-600 shrink-0" size={20} />
        <div className="text-sm text-amber-800">
          <p className="font-bold mb-1">Export Instructions</p>
          <p>The report is generated from the "Calculation Memory" module. Ensure all data is correctly entered before exporting. The process may take a few seconds depending on the complexity of the data.</p>
        </div>
      </div>

      {/* Hidden container for rendering the report for capture */}
      <div className="fixed left-[-9999px] top-0 w-[1200px] bg-white">
        <CalculationMemoryModule data={data} />
      </div>
    </div>
  );
};

export type ValidationResult = {
  type: 'error' | 'warning' | 'success';
  msg: string;
  moduleId?: string;
  actionLabel?: string;
  onAction?: () => void;
};

export const ValidationModal = ({ isOpen, onClose, results, onNavigate, title = 'Project Validation Results' }: { isOpen: boolean, onClose: () => void, results: ValidationResult[], onNavigate?: (moduleId: string) => void, title?: string }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-surface-container-low w-full max-w-lg rounded-sm shadow-2xl border border-outline-variant/20 overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-6 border-b border-outline-variant/10 flex items-center justify-between bg-surface-container">
          <h3 className="text-lg font-black uppercase tracking-tighter">{title}</h3>
          <button onClick={onClose} className="p-1 hover:bg-surface-container-high rounded-full transition-colors">
            <XCircle size={20} className="text-on-surface-variant" />
          </button>
        </div>
        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          {results.length === 0 ? (
            <div className="flex flex-col items-center py-8 text-center">
              <CheckCircle2 size={48} className="text-emerald-500 mb-4" />
              <p className="font-bold text-emerald-700">All Systems Nominal</p>
              <p className="text-xs text-on-surface-variant opacity-70">No critical errors or warnings detected in the current configuration.</p>
            </div>
          ) : (
            results.map((r, i) => (
              <div 
                key={i} 
                className={`p-4 border-l-4 flex gap-4 transition-colors ${r.moduleId && onNavigate ? 'cursor-pointer hover:bg-black/5 hover:border-l-8' : ''} ${
                r.type === 'error' ? 'bg-error-container/10 border-error' : 
                r.type === 'warning' ? 'bg-amber-50 border-amber-400' : 'bg-emerald-50 border-emerald-500'
              }`}
                onClick={() => {
                  if (r.moduleId && onNavigate) {
                    onNavigate(r.moduleId);
                    onClose();
                  }
                }}
              >
                {r.type === 'error' ? <XCircle className="text-error shrink-0" size={18} /> : 
                 r.type === 'warning' ? <AlertTriangle className="text-amber-500 shrink-0" size={18} /> : 
                 <CheckCircle2 className="text-emerald-500 shrink-0" size={18} />}
                <div className="flex-1">
                  <p className={`text-xs font-bold uppercase ${
                    r.type === 'error' ? 'text-error' : 
                    r.type === 'warning' ? 'text-amber-700' : 'text-emerald-700'
                  }`}>{r.type}</p>
                  <p className="text-sm text-on-surface font-medium mb-2">{r.msg}</p>
                  <div className="flex items-center gap-2 mt-2">
                    {r.moduleId && onNavigate && (
                      <span className="text-[10px] uppercase font-bold text-primary/70 flex items-center gap-1 group-hover:text-primary transition-colors">
                        Open related section
                      </span>
                    )}
                    {r.onAction && r.actionLabel && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); r.onAction!(); onClose(); }}
                        className="px-3 py-1 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 text-[10px] font-bold uppercase rounded-sm transition-colors"
                      >
                        {r.actionLabel}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="p-6 bg-surface-container-lowest border-t border-outline-variant/10 flex justify-end">
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-primary text-white font-bold text-xs uppercase tracking-widest hover:opacity-90 transition-all"
          >
            Close Report
          </button>
        </div>
      </div>
    </div>
  );
};

export const SimpleModal = ({ isOpen, onClose, title, children }: { isOpen: boolean, onClose: () => void, title: string, children: React.ReactNode }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-surface-container-low w-full max-w-md rounded-sm shadow-xl border border-outline-variant/10 animate-in zoom-in-95 duration-200">
        <div className="p-4 border-b border-outline-variant/10 flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-widest">{title}</h3>
          <button onClick={onClose} className="p-1 hover:bg-surface-container-high rounded-full"><XCircle size={16} /></button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

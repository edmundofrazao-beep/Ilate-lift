import React from 'react';
import { AlertCircle, ChevronRight } from 'lucide-react';
import { ProjectData } from '../types';


export const safeNumber = (val: any, fallback = 0) => {
  const n = parseFloat(val);
  return isNaN(n) ? fallback : n;
};

export const formatNumber = (val: number, decimals = 2) => {
  return val.toLocaleString('pt-PT', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
};

export const degToRad = (deg: number) => (deg * Math.PI) / 180;

export const InputGroup = ({ label, children }: { label: string, children: React.ReactNode }) => (
  <div className="space-y-4 p-6 bg-surface-container-lowest border border-outline-variant/10 rounded-lg shadow-sm">
    <h3 className="text-xs font-bold uppercase tracking-widest text-primary border-b border-outline-variant/10 pb-2 mb-4">{label}</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
      {children}
    </div>
  </div>
);

export const LiftField = ({ 
  label, 
  name, 
  unit, 
  type = "number", 
  data, 
  onChange,
  min,
  max,
  required = false,
  suggestion,
  disabled = false,
  step
}: { 
  label: string, 
  name: keyof ProjectData, 
  unit?: string, 
  type?: string, 
  data: ProjectData, 
  onChange: (newData: Partial<ProjectData>) => void,
  min?: number,
  max?: number,
  required?: boolean,
  suggestion?: string,
  disabled?: boolean,
  step?: number
}) => {
  const [error, setError] = React.useState<string | null>(null);

  const validate = (val: any) => {
    if (type !== 'number' || disabled) return null;
    const n = parseFloat(val);
    if (required && (val === '' || isNaN(n))) return 'Required';
    if (!isNaN(n)) {
      if (min !== undefined && n < min) return `Min: ${min}`;
      if (max !== undefined && n > max) return `Max: ${max}`;
    }
    return null;
  };

  const isInvalid = !!error && !disabled;

  return (
    <div className={`space-y-1 group ${disabled ? 'opacity-50' : ''}`}>
      <div className="flex justify-between items-center">
        <label className="text-[11px] font-bold text-on-surface-variant uppercase flex items-center gap-1.5">
          {label}
          {isInvalid && <AlertCircle size={10} className="text-error" />}
        </label>
        {isInvalid && <span className="text-[9px] text-error font-bold uppercase animate-pulse">{error}</span>}
      </div>
      <div className="relative">
        <input 
          type={type}
          disabled={disabled}
          step={step}
          value={typeof data[name] === 'boolean' ? undefined : (data[name] as string | number)}
          checked={typeof data[name] === 'boolean' ? (data[name] as boolean) : undefined}
          onChange={(e) => {
            const val = type === 'checkbox' ? e.target.checked : e.target.value;
            const err = validate(val);
            setError(err);
            if (type === 'checkbox') {
              onChange({ [name]: e.target.checked });
            } else {
              onChange({ [name]: type === 'number' ? safeNumber(e.target.value) : e.target.value });
            }
          }}
          className={`
            ${type === 'checkbox' ? "rounded-sm border-outline-variant/30 text-primary focus:ring-primary" : "w-full bg-surface-container-lowest border rounded-sm px-3 py-2 text-sm focus:ring-1 focus:ring-primary outline-none transition-all"}
            ${isInvalid ? 'border-error ring-1 ring-error bg-error/5' : 'border-outline-variant/20 hover:border-primary/30'}
            ${disabled ? 'bg-surface-container-low cursor-not-allowed' : ''}
          `}
        />
        {unit && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-on-surface-variant opacity-50">{unit}</span>}
      </div>
      {(!disabled && type === 'number' && min !== undefined && max !== undefined) && (
        <div className="mt-1">
          <input 
            type="range"
            min={min}
            max={max}
            step={step || ((max - min) > 100 ? 1 : (max - min) > 10 ? 0.1 : 0.01)}
            value={data[name] as number}
            onChange={(e) => onChange({ [name]: parseFloat(e.target.value) })}
            className="w-full h-1 bg-surface-container-low rounded-lg appearance-none cursor-pointer accent-primary"
          />
        </div>
      )}
      {isInvalid && suggestion && !disabled && (
        <p className="text-[9px] text-error/80 italic font-medium mt-1 leading-tight">
          Suggestion: {suggestion}
        </p>
      )}
    </div>
  );
};

export const SliderField = ({ label, value, onChange, min, max, unit }: { label: string, value: number, onChange: (val: number) => void, min: number, max: number, unit: string }) => (
  <div className="space-y-1">
    <div className="flex justify-between items-center text-[10px] font-bold uppercase">
      <span className="opacity-50">{label}</span>
      <span className="text-primary">{value} {unit}</span>
    </div>
    <div className="flex items-center gap-4">
      <input 
        type="range" 
        min={min} 
        max={max} 
        value={value} 
        onChange={(e) => onChange(parseFloat(e.target.value))} 
        className="flex-1 h-1.5 bg-surface-container-low rounded-lg appearance-none cursor-pointer accent-primary" 
      />
      <input 
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value) || min)}
        className="w-20 bg-surface-container-lowest border border-outline-variant/20 rounded-sm px-2 py-1 text-xs focus:ring-1 focus:ring-primary outline-none"
      />
    </div>
  </div>
);

export const CollapsibleSection = ({ title, children, icon: Icon }: { title: string, children: React.ReactNode, icon?: any }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  return (
    <div className="border border-outline-variant/10 rounded-sm overflow-hidden bg-surface-container-lowest">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 hover:bg-surface-container-low transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          {Icon && <Icon size={16} className="text-primary" />}
          <span className="text-xs font-bold uppercase tracking-widest">{title}</span>
        </div>
        <ChevronRight size={16} className={`transition-transform duration-300 ${isOpen ? 'rotate-90' : ''}`} />
      </button>
      <div className={`transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[1000px] opacity-100 p-6 border-t border-outline-variant/10' : 'max-h-0 opacity-0 pointer-events-none'}`}>
        {children}
      </div>
    </div>
  );
};


import React from 'react';
import { ProjectData } from '../types';
import { ShieldCheck, Server, Key, AlertTriangle, CheckCircle2, Lock, XCircle, ExternalLink } from 'lucide-react';
import { LiftField } from '../components/ui';

export const CybersecurityModule = ({ data, onChange }: { data: ProjectData, onChange: (newData: Partial<ProjectData>) => void }) => {
  // ISO 8100-20 Compliance Checks
  const hasIsolation = data.cyberNetworkIsolation;
  const hasEncryption = data.cyberDataEncryption;
  const hasAdvancedAccess = data.cyberAccessControl === 'Role-Based' || data.cyberAccessControl === 'Multi-Factor';
  const hasPatching = data.cyberVulnerabilityPatching;
  const hasIDS = data.cyberIntrusionDetection;

  // Basic Risk Assessment Logic
  let riskScore = 100;
  if (!hasIsolation) riskScore -= 30;
  if (!hasEncryption) riskScore -= 25;
  if (data.cyberAccessControl === 'Basic') riskScore -= 15;
  if (!hasPatching) riskScore -= 20;
  if (!hasIDS) riskScore -= 10;

  const isCompliant = riskScore >= 80;

  return (
    <div className="space-y-8">
      <div className="bg-surface-container-low p-8 border border-outline-variant/20 rounded-none relative overflow-hidden">
        {/* Decorative Grid Background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:14px_24px] pointer-events-none"></div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="bg-primary/20 p-2 border border-primary/50">
                <Server className="text-primary" size={24} />
              </div>
              <div>
                <h3 className="text-2xl font-bold uppercase tracking-widest text-on-surface">ISO 8100-20</h3>
                <p className="text-[10px] uppercase font-bold text-on-surface-variant tracking-widest">Cybersecurity Protocol Baseline</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="space-y-4">
                <h4 className="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant flex items-center gap-2 border-b border-outline-variant/30 pb-2">
                  <Lock size={14} className="text-primary" />
                  Security Configuration
                </h4>
                
                <div className="grid grid-cols-1 gap-4">
                  <div className={`bg-surface-container p-4 border flex items-center justify-between ${hasIsolation ? 'border-outline-variant/30' : 'border-error/50 bg-error/5'}`}>
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        {hasIsolation ? <CheckCircle2 size={16} className="text-emerald-500" /> : <AlertTriangle size={16} className="text-error" />}
                      </div>
                      <div>
                        <h5 className={`text-[11px] font-bold uppercase ${hasIsolation ? 'text-on-surface' : 'text-error'}`}>Network Isolation</h5>
                        <p className="text-[9px] text-on-surface-variant uppercase mt-1">Isolate elevator control from public networks.</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-4">
                      <input type="checkbox" checked={data.cyberNetworkIsolation} onChange={(e) => onChange({ cyberNetworkIsolation: e.target.checked })} className="sr-only peer" />
                      <div className="w-9 h-5 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary border border-outline-variant/50"></div>
                    </label>
                  </div>

                  <div className={`bg-surface-container p-4 border flex items-center justify-between ${hasEncryption ? 'border-outline-variant/30' : 'border-error/50 bg-error/5'}`}>
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        {hasEncryption ? <CheckCircle2 size={16} className="text-emerald-500" /> : <AlertTriangle size={16} className="text-error" />}
                      </div>
                      <div>
                        <h5 className={`text-[11px] font-bold uppercase ${hasEncryption ? 'text-on-surface' : 'text-error'}`}>Data Encryption</h5>
                        <p className="text-[9px] text-on-surface-variant uppercase mt-1">Encrypt communications to dispatchers.</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-4">
                      <input type="checkbox" checked={data.cyberDataEncryption} onChange={(e) => onChange({ cyberDataEncryption: e.target.checked })} className="sr-only peer" />
                      <div className="w-9 h-5 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary border border-outline-variant/50"></div>
                    </label>
                  </div>

                  <div className={`bg-surface-container p-4 border ${hasAdvancedAccess ? 'border-outline-variant/30' : 'border-amber-500/50 bg-amber-500/5'}`}>
                    <div className="flex items-start gap-3 mb-2">
                       <div className="mt-0.5">
                        {hasAdvancedAccess ? <CheckCircle2 size={16} className="text-emerald-500" /> : <AlertTriangle size={16} className="text-amber-500" />}
                      </div>
                      <div className="flex-1">
                        <h5 className={`text-[11px] font-bold uppercase ${hasAdvancedAccess ? 'text-on-surface' : 'text-amber-500'}`}>Access Control Protocol</h5>
                        <select 
                          value={data.cyberAccessControl}
                          onChange={(e) => onChange({ cyberAccessControl: e.target.value as any })}
                          className="w-full mt-2 bg-surface-container-lowest border border-outline-variant/30 px-3 py-2 text-xs text-on-surface outline-none focus:border-primary transition-colors"
                        >
                          <option value="Basic">Basic (PIN/Key)</option>
                          <option value="Role-Based">Role-Based Access (RBAC)</option>
                          <option value="Multi-Factor">Multi-Factor Authentication (MFA)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className={`bg-surface-container p-4 border flex items-center justify-between ${hasPatching ? 'border-outline-variant/30' : 'border-error/50 bg-error/5'}`}>
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        {hasPatching ? <CheckCircle2 size={16} className="text-emerald-500" /> : <AlertTriangle size={16} className="text-error" />}
                      </div>
                      <div>
                        <h5 className={`text-[11px] font-bold uppercase ${hasPatching ? 'text-on-surface' : 'text-error'}`}>Patch Management</h5>
                        <p className="text-[9px] text-on-surface-variant uppercase mt-1">OTA vulnerability patching enabled.</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-4">
                      <input type="checkbox" checked={data.cyberVulnerabilityPatching} onChange={(e) => onChange({ cyberVulnerabilityPatching: e.target.checked })} className="sr-only peer" />
                      <div className="w-9 h-5 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary border border-outline-variant/50"></div>
                    </label>
                  </div>

                  <div className={`bg-surface-container p-4 border flex items-center justify-between ${hasIDS ? 'border-outline-variant/30' : 'border-amber-500/50 bg-amber-500/5'}`}>
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        {hasIDS ? <CheckCircle2 size={16} className="text-emerald-500" /> : <AlertTriangle size={16} className="text-amber-500" />}
                      </div>
                      <div>
                        <h5 className={`text-[11px] font-bold uppercase ${hasIDS ? 'text-on-surface' : 'text-amber-500'}`}>Intrusion Detection</h5>
                        <p className="text-[9px] text-on-surface-variant uppercase mt-1">Active network monitoring (IDS).</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-4">
                      <input type="checkbox" checked={data.cyberIntrusionDetection} onChange={(e) => onChange({ cyberIntrusionDetection: e.target.checked })} className="sr-only peer" />
                      <div className="w-9 h-5 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary border border-outline-variant/50"></div>
                    </label>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-outline-variant/20">
                  <a 
                    href="https://www.iso.org/standard/8100-20.html" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-3 bg-surface-container border border-outline-variant/50 hover:border-primary text-[11px] font-bold uppercase tracking-wider text-on-surface-variant hover:text-primary transition-colors"
                  >
                    <ExternalLink size={16} className="text-primary" />
                    View ISO 8100-20 Standard Documentation
                  </a>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h4 className="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant flex items-center gap-2 border-b border-outline-variant/30 pb-2">
                <ShieldCheck size={14} className="text-primary" />
                Compliance Verification
              </h4>
              
              <div className={`p-6 border ${isCompliant ? 'bg-surface-container-lowest border-outline-variant/30' : 'bg-error-container/10 border-error/20'}`}>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-[10px] font-bold uppercase text-on-surface-variant">System Security Score</h4>
                  <span className={`text-[10px] font-bold px-2 py-0.5 border ${isCompliant ? 'bg-emerald-900/40 text-emerald-400 border-emerald-500/30' : 'bg-error/20 text-error border-error/30'}`}>
                    {riskScore}/100
                  </span>
                </div>
                
                <p className={`text-4xl font-mono font-black mb-6 ${isCompliant ? 'text-on-surface' : 'text-error'}`}>
                  {riskScore}<span className="text-sm font-normal text-on-surface-variant"> PTS</span>
                </p>

                <div className="space-y-3">
                  <div className={`flex items-center justify-between text-[11px] font-mono p-2 rounded-sm ${hasIsolation ? '' : 'bg-error/10 border border-error/20'}`}>
                    <span className="text-on-surface-variant uppercase">Network Auth & Isolation</span>
                    {hasIsolation ? <span className="text-emerald-500 flex items-center gap-1"><CheckCircle2 size={12}/> PASS</span> : <span className="text-error flex items-center gap-1"><XCircle size={12}/> {`FAIL (-30)`}</span>}
                  </div>
                  <div className={`flex items-center justify-between text-[11px] font-mono border-t border-outline-variant/20 pt-2 p-2 rounded-sm ${hasEncryption ? '' : 'bg-error/10 border border-error/20'}`}>
                    <span className="text-on-surface-variant uppercase">Data Transport Security</span>
                    {hasEncryption ? <span className="text-emerald-500 flex items-center gap-1"><CheckCircle2 size={12}/> PASS</span> : <span className="text-error flex items-center gap-1"><XCircle size={12}/> {`FAIL (-25)`}</span>}
                  </div>
                  <div className={`flex items-center justify-between text-[11px] font-mono border-t border-outline-variant/20 pt-2 p-2 rounded-sm ${hasAdvancedAccess ? '' : 'bg-amber-500/10 border border-amber-500/20'}`}>
                    <span className="text-on-surface-variant uppercase">Access Control Matrix</span>
                    {hasAdvancedAccess ? <span className="text-emerald-500 flex items-center gap-1"><CheckCircle2 size={12}/> PASS</span> : <span className="text-amber-500 flex items-center gap-1"><AlertTriangle size={12}/> {`WARN (-15)`}</span>}
                  </div>
                  <div className={`flex items-center justify-between text-[11px] font-mono border-t border-outline-variant/20 pt-2 p-2 rounded-sm ${hasPatching ? '' : 'bg-error/10 border border-error/20'}`}>
                    <span className="text-on-surface-variant uppercase">Lifecycle Mgt (Patching)</span>
                    {hasPatching ? <span className="text-emerald-500 flex items-center gap-1"><CheckCircle2 size={12}/> PASS</span> : <span className="text-error flex items-center gap-1"><XCircle size={12}/> {`FAIL (-20)`}</span>}
                  </div>
                  <div className={`flex items-center justify-between text-[11px] font-mono border-t border-outline-variant/20 pt-2 p-2 rounded-sm ${hasIDS ? '' : 'bg-amber-500/10 border border-amber-500/20'}`}>
                    <span className="text-on-surface-variant uppercase">Intrusion Detection</span>
                    {hasIDS ? <span className="text-emerald-500 flex items-center gap-1"><CheckCircle2 size={12}/> PASS</span> : <span className="text-amber-500 flex items-center gap-1"><AlertTriangle size={12}/> {`WARN (-10)`}</span>}
                  </div>
                </div>
                
                <div className={`mt-6 p-4 border ${isCompliant ? 'bg-emerald-900/20 border-emerald-500/20' : 'bg-error/10 border-error/20'}`}>
                  <div className="flex items-center gap-2">
                    {isCompliant ? <CheckCircle2 size={16} className="text-emerald-500" /> : <AlertTriangle size={16} className="text-error" />}
                    <span className={`text-[11px] font-bold uppercase ${isCompliant ? 'text-emerald-500' : 'text-error'}`}>
                      {isCompliant ? 'ISO 8100-20 COMPLIANT' : 'SYSTEM VULNERABLE'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

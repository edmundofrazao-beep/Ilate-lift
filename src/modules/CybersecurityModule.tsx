import React from 'react';
import { ProjectData } from '../types';
import { ShieldCheck, Server, Key, AlertTriangle, CheckCircle2, Lock } from 'lucide-react';
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
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-primary/20 p-2 border border-primary/50">
              <Server className="text-primary" size={24} />
            </div>
            <div>
              <h3 className="text-2xl font-bold uppercase tracking-widest text-on-surface">ISO 8100-20</h3>
              <p className="text-[10px] uppercase font-bold text-on-surface-variant tracking-widest">Cybersecurity Protocol Baseline</p>
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
                  <div className="bg-surface-container p-4 border border-outline-variant/30 flex items-center justify-between">
                    <div>
                      <h5 className="text-[11px] font-bold uppercase text-on-surface">Network Isolation</h5>
                      <p className="text-[9px] text-on-surface-variant uppercase mt-1">Isolate elevator control from public networks.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={data.cyberNetworkIsolation} onChange={(e) => onChange({ cyberNetworkIsolation: e.target.checked })} className="sr-only peer" />
                      <div className="w-9 h-5 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary border border-outline-variant/50"></div>
                    </label>
                  </div>

                  <div className="bg-surface-container p-4 border border-outline-variant/30 flex items-center justify-between">
                    <div>
                      <h5 className="text-[11px] font-bold uppercase text-on-surface">Data Encryption</h5>
                      <p className="text-[9px] text-on-surface-variant uppercase mt-1">Encrypt communications to dispatchers.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={data.cyberDataEncryption} onChange={(e) => onChange({ cyberDataEncryption: e.target.checked })} className="sr-only peer" />
                      <div className="w-9 h-5 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary border border-outline-variant/50"></div>
                    </label>
                  </div>

                  <div className="bg-surface-container p-4 border border-outline-variant/30">
                    <h5 className="text-[11px] font-bold uppercase text-on-surface mb-2">Access Control Protocol</h5>
                    <select 
                      value={data.cyberAccessControl}
                      onChange={(e) => onChange({ cyberAccessControl: e.target.value as any })}
                      className="w-full bg-surface-container-lowest border border-outline-variant/30 px-3 py-2 text-xs text-on-surface outline-none focus:border-primary transition-colors"
                    >
                      <option value="Basic">Basic (PIN/Key)</option>
                      <option value="Role-Based">Role-Based Access (RBAC)</option>
                      <option value="Multi-Factor">Multi-Factor Authentication (MFA)</option>
                    </select>
                  </div>

                  <div className="bg-surface-container p-4 border border-outline-variant/30 flex items-center justify-between">
                    <div>
                      <h5 className="text-[11px] font-bold uppercase text-on-surface">Patch Management</h5>
                      <p className="text-[9px] text-on-surface-variant uppercase mt-1">OTA vulnerability patching enabled.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={data.cyberVulnerabilityPatching} onChange={(e) => onChange({ cyberVulnerabilityPatching: e.target.checked })} className="sr-only peer" />
                      <div className="w-9 h-5 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary border border-outline-variant/50"></div>
                    </label>
                  </div>

                  <div className="bg-surface-container p-4 border border-outline-variant/30 flex items-center justify-between">
                    <div>
                      <h5 className="text-[11px] font-bold uppercase text-on-surface">Intrusion Detection</h5>
                      <p className="text-[9px] text-on-surface-variant uppercase mt-1">Active network monitoring (IDS).</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={data.cyberIntrusionDetection} onChange={(e) => onChange({ cyberIntrusionDetection: e.target.checked })} className="sr-only peer" />
                      <div className="w-9 h-5 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary border border-outline-variant/50"></div>
                    </label>
                  </div>
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
                
                <p className="text-4xl font-mono font-black mb-6">
                  {riskScore}<span className="text-sm font-normal text-on-surface-variant"> PTS</span>
                </p>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-on-surface-variant uppercase">Network Auth & Isolation</span>
                    {hasIsolation ? <span className="text-emerald-500">PASS</span> : <span className="text-error">FAIL</span>}
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-mono border-t border-outline-variant/20 pt-2">
                    <span className="text-on-surface-variant uppercase">Data Transport Security</span>
                    {hasEncryption ? <span className="text-emerald-500">PASS</span> : <span className="text-error">FAIL</span>}
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-mono border-t border-outline-variant/20 pt-2">
                    <span className="text-on-surface-variant uppercase">Access Control Matrix</span>
                    {hasAdvancedAccess ? <span className="text-emerald-500">PASS</span> : <span className="text-amber-500">WARN (Basic)</span>}
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-mono border-t border-outline-variant/20 pt-2">
                    <span className="text-on-surface-variant uppercase">Lifecycle Mgt (Patching)</span>
                    {hasPatching ? <span className="text-emerald-500">PASS</span> : <span className="text-error">FAIL</span>}
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

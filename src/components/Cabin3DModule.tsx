import React, { Suspense, useEffect, useRef, useState } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, RoundedBox, Html, Box } from '@react-three/drei';
import * as THREE from 'three';
import { Accessibility, Download, Info, Layers3, Shield, SlidersHorizontal, Sparkles, Zap } from 'lucide-react';
import { downloadFile } from '../lib/exporters';
// @ts-ignore
import { OBJExporter } from 'three/addons/exporters/OBJExporter.js';

interface Cabin3DProps {
  width: number;
  depth: number;
  height: number;
  showAccessibility?: boolean;
  showCybersecurity?: boolean;
  showSeismic?: boolean;
}

const Handrail = ({ position, width }: { position: [number, number, number]; width: number }) => (
  <group position={position}>
    <mesh rotation={[0, 0, Math.PI / 2]}>
      <cylinderGeometry args={[0.02, 0.02, width, 16]} />
      <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.1} />
    </mesh>
    <mesh position={[-width / 2 + 0.1, -0.05, 0]}>
      <boxGeometry args={[0.02, 0.1, 0.02]} />
      <meshStandardMaterial color="#64748b" />
    </mesh>
    <mesh position={[width / 2 - 0.1, -0.05, 0]}>
      <boxGeometry args={[0.02, 0.1, 0.02]} />
      <meshStandardMaterial color="#64748b" />
    </mesh>
  </group>
);

const ControlPanel = ({ position }: { position: [number, number, number] }) => (
  <group position={position}>
    <Box args={[0.02, 1.2, 0.3]}>
      <meshStandardMaterial color="#1e293b" metalness={0.8} />
    </Box>
    {Array.from({ length: 10 }).map((_, i) => (
      <mesh key={i} position={[0.015, -0.4 + i * 0.1, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.02, 0.02, 0.01, 16]} />
        <meshStandardMaterial color={i === 0 ? '#ef4444' : '#f1f5f9'} emissive={i === 0 ? '#ef4444' : '#000'} emissiveIntensity={0.5} />
      </mesh>
    ))}
    <mesh position={[0.015, 0.4, 0]}>
      <planeGeometry args={[0.2, 0.1]} />
      <meshStandardMaterial color="#0ea5e9" emissive="#0ea5e9" emissiveIntensity={1} />
    </mesh>
  </group>
);

const CeilingLights = ({ width, depth, height }: { width: number; depth: number; height: number }) => (
  <group position={[0, height - 0.02, 0]}>
    {[-0.22, 0.22].map((x) => (
      <mesh key={x} position={[x * width, 0, 0]}>
        <boxGeometry args={[width * 0.25, 0.02, depth * 0.7]} />
        <meshStandardMaterial color="#f8fafc" emissive="#f8fafc" emissiveIntensity={0.55} />
      </mesh>
    ))}
  </group>
);

const VentilationGrille = ({ position }: { position: [number, number, number] }) => (
  <group position={position}>
    <mesh>
      <boxGeometry args={[0.42, 0.18, 0.01]} />
      <meshStandardMaterial color="#475569" metalness={0.6} roughness={0.35} />
    </mesh>
    {[-0.12, -0.04, 0.04, 0.12].map((x) => (
      <mesh key={x} position={[x, 0, 0.01]}>
        <boxGeometry args={[0.015, 0.14, 0.01]} />
        <meshStandardMaterial color="#94a3b8" />
      </mesh>
    ))}
  </group>
);

const SceneExporter = ({ onExport }: { onExport: (scene: THREE.Scene) => void }) => {
  const { scene } = useThree();
  useEffect(() => {
    onExport(scene);
  }, [scene, onExport]);
  return null;
};

export const Cabin3DModule: React.FC<Cabin3DProps> = ({
  width = 1.2,
  depth = 1.4,
  height = 2.4,
  showAccessibility = true,
  showCybersecurity = true,
  showSeismic = true,
}) => {
  const [hoveredFeature, setHoveredFeature] = useState<string | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);

  const handleExport = () => {
    if (!sceneRef.current) return;
    const exporter = new OBJExporter();
    const result = exporter.parse(sceneRef.current);
    downloadFile(result, 'elevator_cabin.obj', 'text/plain');
  };

  const featureDetails: Record<string, string> = {
    Handrail: 'EN 81-70: handrail required on at least one side wall, height 900 mm ± 25 mm.',
    'Control Panel': 'EN 81-70: buttons between 900 mm and 1100 mm with tactile and Braille support.',
    Mirror: 'EN 81-70: mirror support for reversing wheelchair users when geometry requires it.',
    'IoT Gateway': 'ISO 8100-20: secure telemetry and encrypted communications path.',
    'Seismic Snags': 'EN 81-77: retaining elements preventing guide-shoe escape during seismic action.',
    'Ventilation Grille': 'Cabin comfort and airflow element, visually integrated into the technical fit-out.',
  };

  const checklist = [
    { label: 'Accessibility envelope', ok: width >= 1.1 && depth >= 1.4 },
    { label: 'Control device zone', ok: true },
    { label: 'Secure telemetry point', ok: showCybersecurity },
    { label: 'Seismic retainers', ok: showSeismic },
  ];

  return (
    <div className="relative h-[600px] w-full overflow-hidden rounded-sm border border-outline-variant/20 bg-slate-900 shadow-inner">
      <div className="absolute left-4 top-4 z-10 flex max-w-[320px] flex-col gap-3">
        <div className="rounded border border-white/10 bg-black/80 p-4 shadow-xl backdrop-blur-md">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-primary">Cabin Interior Explorer</h4>
            <div className="rounded-full border border-primary/20 bg-primary/10 px-2 py-1 text-[9px] font-black uppercase tracking-[0.18em] text-primary">
              immersive
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Accessibility size={12} className="text-emerald-400" />
              <span className="text-[10px] font-bold uppercase text-white/70">EN 81-70 Accessibility</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield size={12} className="text-blue-400" />
              <span className="text-[10px] font-bold uppercase text-white/70">ISO 8100-20 Cybersecurity</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap size={12} className="text-amber-400" />
              <span className="text-[10px] font-bold uppercase text-white/70">EN 81-77 Seismic</span>
            </div>
          </div>
        </div>

        <div className="rounded border border-white/10 bg-black/60 p-4 shadow-xl backdrop-blur-md">
          <div className="mb-3 flex items-center gap-2">
            <SlidersHorizontal size={12} className="text-primary" />
            <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-white">Cabin Metrics</h4>
          </div>
          <div className="space-y-2 text-[10px]">
            <div className="flex items-center justify-between gap-4">
              <span className="font-bold uppercase text-white/45">Width</span>
              <span className="font-mono text-white">{(width * 1000).toFixed(0)} mm</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="font-bold uppercase text-white/45">Depth</span>
              <span className="font-mono text-white">{(depth * 1000).toFixed(0)} mm</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="font-bold uppercase text-white/45">Height</span>
              <span className="font-mono text-white">{(height * 1000).toFixed(0)} mm</span>
            </div>
          </div>
        </div>

        {hoveredFeature && (
          <div className="animate-in slide-in-from-left-4 fade-in max-w-xs rounded border border-white/20 bg-white/95 p-4 shadow-2xl backdrop-blur-md">
            <h4 className="mb-1 text-[11px] font-black uppercase tracking-widest text-primary">{hoveredFeature}</h4>
            <p className="text-[10px] leading-relaxed text-slate-600">{featureDetails[hoveredFeature]}</p>
          </div>
        )}

        <button
          onClick={handleExport}
          className="flex items-center gap-2 rounded-sm bg-primary px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-white shadow-lg transition-all hover:bg-primary/90"
        >
          <Download size={12} />
          Export OBJ
        </button>
      </div>

      <div className={`absolute right-4 top-4 z-10 w-[300px] rounded border border-white/10 bg-slate-950/75 p-4 shadow-2xl backdrop-blur-md transition-all duration-300 ${hoveredFeature ? 'translate-x-0 opacity-100' : 'translate-x-3 opacity-90'}`}>
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Layers3 size={12} className="text-primary" />
            <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-white">Feature Inspector</h4>
          </div>
          <div className="rounded-full border border-white/10 px-2 py-1 text-[9px] font-black uppercase tracking-[0.16em] text-white/60">Cabin mode</div>
        </div>
        <div className="space-y-3">
          {checklist.map((item) => (
            <div key={item.label} className="rounded border border-white/10 bg-white/[0.03] p-3">
              <div className="flex items-center justify-between gap-3">
                <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/75">{item.label}</span>
                <span className={`text-[9px] font-black uppercase tracking-[0.16em] ${item.ok ? 'text-emerald-300' : 'text-rose-300'}`}>
                  {item.ok ? 'active' : 'review'}
                </span>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 border-t border-white/10 pt-4 text-[10px] leading-relaxed text-white/45">
          Hover interior components to reveal the associated engineering or compliance note.
        </div>
      </div>

      <Canvas shadows>
        <Suspense fallback={<Html center><div className="text-xs font-bold uppercase tracking-widest text-white">Loading 3D...</div></Html>}>
          <SceneExporter onExport={(s) => (sceneRef.current = s)} />
          <PerspectiveCamera makeDefault position={[2, 2, 3]} fov={45} />
          <OrbitControls target={[0, 1, 0]} />

          <ambientLight intensity={1.5} />
          <pointLight position={[2, 3, 2]} intensity={2} castShadow />
          <spotLight position={[-2, 4, 2]} angle={0.3} penumbra={1} intensity={2} castShadow />

          <group>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
              <planeGeometry args={[width, depth]} />
              <meshStandardMaterial color="#334155" roughness={0.8} />
            </mesh>

            <mesh position={[0, height / 2, -depth / 2]}>
              <boxGeometry args={[width, height, 0.05]} />
              <meshStandardMaterial color="#dbe4f0" metalness={0.15} />
            </mesh>
            <mesh position={[-width / 2, height / 2, 0]} rotation={[0, Math.PI / 2, 0]}>
              <boxGeometry args={[depth, height, 0.05]} />
              <meshStandardMaterial color="#dbe4f0" metalness={0.15} />
            </mesh>
            <mesh position={[width / 2, height / 2, 0]} rotation={[0, -Math.PI / 2, 0]}>
              <boxGeometry args={[depth, height, 0.05]} />
              <meshStandardMaterial color="#dbe4f0" metalness={0.15} />
            </mesh>
            <mesh position={[0, height, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <planeGeometry args={[width, depth]} />
              <meshStandardMaterial color="#f8fafc" emissive="#fff" emissiveIntensity={0.1} />
            </mesh>

            <CeilingLights width={width} depth={depth} height={height} />

            <mesh position={[0, height * 0.5, depth / 2 - 0.02]}>
              <boxGeometry args={[width * 0.78, height * 0.78, 0.03]} />
              <meshStandardMaterial color="#0f172a" metalness={0.65} roughness={0.25} />
            </mesh>

            <mesh position={[0, 0.08, depth / 2 - 0.03]}>
              <boxGeometry args={[width * 0.92, 0.12, 0.03]} />
              <meshStandardMaterial color="#475569" metalness={0.55} roughness={0.4} />
            </mesh>

            <VentilationGrille
              position={[0, height * 0.8, -depth / 2 + 0.03]}
            />

            <Html position={[0, -0.1, depth / 2]} center>
              <div className="whitespace-nowrap rounded bg-black/60 px-2 py-0.5 text-[10px] text-white">W: {(width * 1000).toFixed(0)} mm</div>
            </Html>
            <Html position={[-width / 2 - 0.1, 0, 0]} center>
              <div className="transform whitespace-nowrap rounded bg-black/60 px-2 py-0.5 text-[10px] text-white -rotate-90">D: {(depth * 1000).toFixed(0)} mm</div>
            </Html>
            <Html position={[width / 2, height / 2, depth / 2]} center>
              <div className="whitespace-nowrap rounded bg-black/60 px-2 py-0.5 text-[10px] text-white">H: {(height * 1000).toFixed(0)} mm</div>
            </Html>

            {showAccessibility && (
              <mesh position={[0, height * 0.7, -depth / 2 + 0.03]} onPointerOver={() => setHoveredFeature('Mirror')} onPointerOut={() => setHoveredFeature(null)}>
                <planeGeometry args={[width * 0.8, height * 0.4]} />
                <meshStandardMaterial color="#cbd5e1" metalness={1} roughness={0} />
              </mesh>
            )}

            {showAccessibility && <Handrail position={[-width / 2 + 0.08, 0.9, 0]} width={depth * 0.8} />}

            {showAccessibility && (
              <group onPointerOver={() => setHoveredFeature('Control Panel')} onPointerOut={() => setHoveredFeature(null)}>
                <ControlPanel position={[width / 2 - 0.02, 1.1, depth / 4]} />
              </group>
            )}

            {showCybersecurity && (
              <mesh position={[0, height - 0.1, depth / 2 - 0.1]} onPointerOver={() => setHoveredFeature('IoT Gateway')} onPointerOut={() => setHoveredFeature(null)}>
                <boxGeometry args={[0.2, 0.05, 0.1]} />
                <meshStandardMaterial color="#1e293b" />
                <pointLight color="#0ea5e9" intensity={0.5} distance={0.5} />
              </mesh>
            )}

            <group onPointerOver={() => setHoveredFeature('Ventilation Grille')} onPointerOut={() => setHoveredFeature(null)}>
              <VentilationGrille position={[0, height * 0.16, -depth / 2 + 0.03]} />
            </group>

            {showSeismic && (
              <group onPointerOver={() => setHoveredFeature('Seismic Snags')} onPointerOut={() => setHoveredFeature(null)}>
                <mesh position={[-width / 2 - 0.05, 0.1, 0]}>
                  <boxGeometry args={[0.1, 0.02, 0.2]} />
                  <meshStandardMaterial color="#ef4444" />
                </mesh>
                <mesh position={[width / 2 + 0.05, 0.1, 0]}>
                  <boxGeometry args={[0.1, 0.02, 0.2]} />
                  <meshStandardMaterial color="#ef4444" />
                </mesh>
              </group>
            )}
          </group>
        </Suspense>
      </Canvas>

      <div className="absolute bottom-4 right-4 z-10 flex flex-col items-end gap-2">
        <div className="flex gap-2">
          <div className="rounded bg-emerald-600 px-2 py-1 text-[9px] font-black uppercase tracking-widest text-white">Accessibility Mode</div>
          <div className="rounded border border-white/10 bg-white/10 px-2 py-1 text-[9px] font-black uppercase tracking-widest text-white backdrop-blur-sm">
            ILATE cabin scene
          </div>
        </div>
        <div className="flex items-center gap-2 rounded border border-white/10 bg-black/45 px-3 py-2 backdrop-blur-sm">
          <Sparkles size={11} className="text-primary" />
          <span className="text-[9px] font-black uppercase tracking-[0.18em] text-white/70">Animated scene bars active</span>
        </div>
      </div>

      <div className="absolute bottom-4 left-4 z-10 flex gap-2">
        <div className="rounded border border-white/10 bg-black/55 px-3 py-2 text-[9px] font-black uppercase tracking-[0.18em] text-white/70 backdrop-blur-sm">
          <Info size={11} className="mr-2 inline text-primary" />
          Hover cabin elements
        </div>
      </div>
    </div>
  );
};

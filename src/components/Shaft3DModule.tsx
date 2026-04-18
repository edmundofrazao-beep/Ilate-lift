import React, { Suspense, useEffect, useRef, useState } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Grid, Box, RoundedBox, Html, Line } from '@react-three/drei';
import * as THREE from 'three';
import { Activity, ArrowRightLeft, Download, Layers3, Move3D, RotateCcw, ShieldCheck, ZoomIn, ZoomOut } from 'lucide-react';
import { downloadFile } from '../lib/exporters';
// @ts-ignore
import { OBJExporter } from 'three/addons/exporters/OBJExporter.js';

interface Shaft3DProps {
  width: number;
  depth: number;
  height: number;
  carWidth?: number;
  carDepth?: number;
  carHeight?: number;
  carPos?: number;
  pitDepth?: number;
  headroomHeight?: number;
  wellToCarWall?: number;
  sillGap?: number;
  pitRefugeHeight?: number;
  carToCwtDistance?: number;
  headroomGeneral?: number;
  showClearances?: boolean;
}

const ElevatorCar = ({ width, depth, height, position }: { width: number; depth: number; height: number; position: [number, number, number] }) => {
  return (
    <group position={position}>
      <RoundedBox args={[width, height, depth]} radius={0.02} smoothness={4}>
        <meshStandardMaterial color="#2563eb" metalness={0.6} roughness={0.2} />
      </RoundedBox>
      <mesh>
        <boxGeometry args={[width + 0.1, height + 0.2, depth + 0.1]} />
        <meshStandardMaterial color="#1e293b" wireframe />
      </mesh>
      <mesh position={[0, 0, depth / 2 + 0.01]}>
        <planeGeometry args={[width * 0.8, height * 0.8]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.8} roughness={0.1} />
      </mesh>
      <mesh position={[0, height / 2 + 0.1, 0]}>
        <boxGeometry args={[width * 0.6, 0.2, depth * 0.6]} />
        <meshStandardMaterial color="#475569" />
      </mesh>
    </group>
  );
};

const GuideRails = ({ shaftHeight, shaftWidth }: { shaftHeight: number; shaftWidth: number }) => {
  return (
    <group>
      <mesh position={[-shaftWidth / 2 + 0.05, shaftHeight / 2, 0]}>
        <boxGeometry args={[0.05, shaftHeight, 0.05]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.1} />
      </mesh>
      <mesh position={[shaftWidth / 2 - 0.05, shaftHeight / 2, 0]}>
        <boxGeometry args={[0.05, shaftHeight, 0.05]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.1} />
      </mesh>
    </group>
  );
};

const ShaftStructure = ({ width, depth, height, pitDepth = 1.5 }: { width: number; depth: number; height: number; pitDepth?: number }) => {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -pitDepth, 0]}>
        <planeGeometry args={[width, depth]} />
        <meshStandardMaterial color="#475569" />
      </mesh>
      <mesh position={[0, -pitDepth / 2, 0]}>
        <boxGeometry args={[width, pitDepth, depth]} />
        <meshStandardMaterial color="#334155" wireframe transparent opacity={0.3} />
      </mesh>
      <mesh position={[0, height / 2, 0]}>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial color="#e2e8f0" wireframe transparent opacity={0.1} />
      </mesh>
      {Array.from({ length: Math.floor(height / 3) + 1 }).map((_, i) => (
        <group key={i} position={[0, i * 3 + 1.05, depth / 2]}>
          <mesh>
            <planeGeometry args={[width * 0.6, 2.1]} />
            <meshStandardMaterial color="#f1f5f9" transparent opacity={0.3} side={THREE.DoubleSide} />
          </mesh>
        </group>
      ))}
    </group>
  );
};

const SuspensionRopes = ({
  shaftHeight,
  carY,
  shaftWidth,
  carZ,
}: {
  shaftHeight: number;
  carY: number;
  shaftWidth: number;
  carZ: number;
}) => (
  <group>
    {[-0.18, -0.06, 0.06, 0.18].map((offset) => (
      <Line
        key={offset}
        points={[
          [offset * shaftWidth, shaftHeight + 0.35, carZ - 0.15],
          [offset * shaftWidth, carY + 1.2, carZ - 0.15],
        ]}
        color="#f8fafc"
        lineWidth={1.4}
      />
    ))}
  </group>
);

const MachineDeck = ({ shaftHeight, shaftWidth, shaftDepth }: { shaftHeight: number; shaftWidth: number; shaftDepth: number }) => (
  <group position={[0, shaftHeight + 0.2, -shaftDepth * 0.18]}>
    <Box args={[shaftWidth * 0.82, 0.12, shaftDepth * 0.26]}>
      <meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.25} />
    </Box>
    <mesh position={[shaftWidth * 0.18, 0.18, 0]}>
      <cylinderGeometry args={[0.22, 0.22, 0.26, 24]} />
      <meshStandardMaterial color="#f97316" metalness={0.45} roughness={0.2} />
    </mesh>
    <mesh position={[-shaftWidth * 0.14, 0.1, 0]}>
      <boxGeometry args={[0.45, 0.18, 0.22]} />
      <meshStandardMaterial color="#1e293b" metalness={0.7} roughness={0.3} />
    </mesh>
  </group>
);

const Buffer = ({ position }: { position: [number, number, number] }) => (
  <mesh position={position}>
    <cylinderGeometry args={[0.1, 0.1, 0.3, 16]} />
    <meshStandardMaterial color="#f59e0b" metalness={0.5} />
  </mesh>
);

const LandingMarkers = ({ shaftHeight, shaftDepth }: { shaftHeight: number; shaftDepth: number }) => (
  <group>
    {Array.from({ length: Math.floor(shaftHeight / 3) + 1 }).map((_, i) => (
      <Html key={i} position={[-0.75, i * 3 + 0.2, shaftDepth / 2 + 0.16]}>
        <div className="rounded border border-white/10 bg-black/65 px-2 py-1 text-[9px] font-black uppercase tracking-[0.18em] text-white/70">
          L{String(i).padStart(2, '0')}
        </div>
      </Html>
    ))}
  </group>
);

const CameraControls = ({ onReset }: { onReset: () => void }) => {
  const { camera } = useThree();
  return (
    <Html as="div" style={{ position: 'absolute', bottom: '1rem', left: '1rem', zIndex: 20, pointerEvents: 'none' }}>
      <div className="flex flex-col gap-2" style={{ pointerEvents: 'auto' }}>
        <button onClick={() => camera.position.multiplyScalar(0.9)} className="rounded bg-black/60 p-2 text-white transition-colors hover:bg-primary">
          <ZoomIn size={16} />
        </button>
        <button onClick={() => camera.position.multiplyScalar(1.1)} className="rounded bg-black/60 p-2 text-white transition-colors hover:bg-primary">
          <ZoomOut size={16} />
        </button>
        <button onClick={onReset} className="rounded bg-black/60 p-2 text-white transition-colors hover:bg-primary">
          <RotateCcw size={16} />
        </button>
      </div>
    </Html>
  );
};

const SceneExporter = ({ onExport }: { onExport: (scene: THREE.Scene) => void }) => {
  const { scene } = useThree();
  useEffect(() => {
    onExport(scene);
  }, [scene, onExport]);
  return null;
};

export const Shaft3DModule: React.FC<Shaft3DProps> = ({
  width,
  depth,
  height,
  carWidth = 1.2,
  carDepth = 1.4,
  carHeight = 2.4,
  carPos = 0.5,
  pitDepth = 1500,
  headroomHeight = 3800,
  sillGap = 0.03,
  pitRefugeHeight = 0.55,
  carToCwtDistance = 0.06,
  headroomGeneral = 0.52,
  showClearances = true,
}) => {
  const [resetKey, setResetKey] = useState(0);
  const [hoveredZone, setHoveredZone] = useState<string | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);

  const handleExport = () => {
    if (!sceneRef.current) return;
    const exporter = new OBJExporter();
    const result = exporter.parse(sceneRef.current);
    downloadFile(result, 'elevator_shaft.obj', 'text/plain');
  };

  const w = width / 1000;
  const d = depth / 1000;
  const h = height / 1000;
  const pD = pitDepth / 1000;
  const sG = (sillGap || 30) / 1000;

  const carY = carPos * (h - carHeight) + carHeight / 2;
  const carZ = d / 2 - carDepth / 2 - sG;
  const actualWallGap = (w - carWidth) / 2;
  const carBackZ = carZ - carDepth / 2;
  const cwtThickness = 0.15;
  const cwtFrontZ = carBackZ - carToCwtDistance;
  const cwtZ = cwtFrontZ - cwtThickness / 2;

  const clearanceData: Record<string, { label: string; value: number; limit: string; clause: string }> = {
    headroom: {
      label: 'Headroom',
      value: height / 1000 - (carPos * (h - carHeight) + carHeight),
      limit: `≥ ${(headroomGeneral * 1000).toFixed(0)}mm`,
      clause: 'ISO 8100-1:2026 5.2.5.7',
    },
    pit: {
      label: 'Pit Refuge',
      value: pitRefugeHeight * 1000,
      limit: `≥ ${(pitRefugeHeight * 1000).toFixed(0)}mm`,
      clause: 'ISO 8100-1:2026 5.2.5.8',
    },
    wall: { label: 'Wall Gap', value: actualWallGap * 1000, limit: '≤ 150mm', clause: 'ISO 8100-1:2026 5.2.5.2' },
    sill: { label: 'Sill Gap', value: sillGap * 1000, limit: '≤ 35mm', clause: 'ISO 8100-1:2026 5.3.4' },
    cwt: { label: 'Car-CWT Gap', value: carToCwtDistance * 1000, limit: '≥ 50mm', clause: 'ISO 8100-1:2026 5.2.5.2' },
  };

  const telemetryRows = [
    { label: 'Travel Envelope', value: `${Math.max(height - pitDepth, 0).toFixed(0)} mm` },
    { label: 'Car Position', value: `${(carPos * 100).toFixed(0)} %` },
    { label: 'Wall Gap', value: `${(actualWallGap * 1000).toFixed(0)} mm` },
    { label: 'CWT Gap', value: `${(carToCwtDistance * 1000).toFixed(0)} mm` },
  ];

  const complianceStates = [
    { id: 'pit', label: 'Pit Refuge', ok: pitRefugeHeight * 1000 >= 500 },
    { id: 'wall', label: 'Wall Clearance', ok: actualWallGap * 1000 <= 150 },
    { id: 'sill', label: 'Landing Sill Gap', ok: sillGap * 1000 <= 35 },
    { id: 'cwt', label: 'Car vs Counterweight', ok: carToCwtDistance * 1000 >= 50 },
  ];

  return (
    <div className="relative h-[600px] w-full overflow-hidden rounded-sm border border-outline-variant/20 bg-slate-900 shadow-inner">
      <div className="absolute left-4 top-4 z-10 flex max-w-[320px] flex-col gap-3">
        <div className="rounded border border-white/10 bg-black/80 p-4 shadow-xl backdrop-blur-md">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-primary">Shaft Telemetry</h4>
            <div className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-1 text-[9px] font-black uppercase tracking-[0.18em] text-emerald-300">
              Live geometry
            </div>
          </div>
          <div className="grid grid-cols-2 gap-x-6 gap-y-2">
            <span className="text-[10px] font-bold uppercase text-white/40">Width</span>
            <span className="font-mono text-[10px] text-white">{width} mm</span>
            <span className="text-[10px] font-bold uppercase text-white/40">Depth</span>
            <span className="font-mono text-[10px] text-white">{depth} mm</span>
            <span className="text-[10px] font-bold uppercase text-white/40">Height</span>
            <span className="font-mono text-[10px] text-white">{height} mm</span>
            <span className="text-[10px] font-bold uppercase text-white/40">Pit</span>
            <span className="font-mono text-[10px] text-white">{pitDepth} mm</span>
          </div>
        </div>

        <div className="rounded border border-white/10 bg-black/60 p-4 shadow-xl backdrop-blur-md">
          <div className="mb-3 flex items-center gap-2">
            <Activity size={12} className="text-primary" />
            <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-white">Live Readings</h4>
          </div>
          <div className="space-y-2">
            {telemetryRows.map((row) => (
              <div key={row.label} className="flex items-center justify-between gap-4 text-[10px]">
                <span className="font-bold uppercase text-white/45">{row.label}</span>
                <span className="font-mono text-white">{row.value}</span>
              </div>
            ))}
          </div>
        </div>

        {hoveredZone && clearanceData[hoveredZone] && (
          <div className="animate-in slide-in-from-left-4 fade-in rounded border border-white/20 bg-primary/90 p-4 shadow-2xl duration-300 backdrop-blur-md">
            <h4 className="mb-1 text-[11px] font-black uppercase tracking-[0.2em] text-white">{clearanceData[hoveredZone].label}</h4>
            <div className="space-y-1">
              <div className="flex justify-between gap-4">
                <span className="text-[10px] font-bold uppercase text-white/60">Calculated</span>
                <span className="font-mono text-[10px] font-bold text-white">{clearanceData[hoveredZone].value.toFixed(0)} mm</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-[10px] font-bold uppercase text-white/60">Normative Limit</span>
                <span className="font-mono text-[10px] text-white">{clearanceData[hoveredZone].limit}</span>
              </div>
              <div className="mt-2 border-t border-white/10 pt-2">
                <span className="font-mono text-[9px] italic text-white/40">{clearanceData[hoveredZone].clause}</span>
              </div>
            </div>
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

      <div
        className={`absolute right-4 top-4 z-10 w-[300px] rounded border border-white/10 bg-slate-950/75 p-4 shadow-2xl backdrop-blur-md transition-all duration-300 ${
          hoveredZone ? 'translate-x-0 opacity-100' : 'translate-x-3 opacity-90'
        }`}
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Layers3 size={12} className="text-primary" />
            <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-white">Clearance Inspector</h4>
          </div>
          <div className="rounded-full border border-white/10 px-2 py-1 text-[9px] font-black uppercase tracking-[0.16em] text-white/60">ISO 8100-1</div>
        </div>
        <div className="space-y-3">
          {complianceStates.map((state) => (
            <div
              key={state.id}
              className={`rounded border p-3 transition-colors ${
                hoveredZone === state.id ? 'border-primary/40 bg-primary/10' : 'border-white/10 bg-white/[0.03]'
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/75">{state.label}</span>
                <span className={`text-[9px] font-black uppercase tracking-[0.16em] ${state.ok ? 'text-emerald-300' : 'text-rose-300'}`}>
                  {state.ok ? 'within limit' : 'review'}
                </span>
              </div>
              {clearanceData[state.id] && (
                <div className="mt-2 flex items-center justify-between gap-4 text-[11px]">
                  <span className="font-mono text-white">{clearanceData[state.id].value.toFixed(0)} mm</span>
                  <span className="text-white/45">{clearanceData[state.id].limit}</span>
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center gap-2 border-t border-white/10 pt-4 text-[10px] text-white/45">
          <ArrowRightLeft size={12} />
          Hover any clearance block in the scene to pin its normative reading.
        </div>
      </div>

      <div className="absolute left-4 top-1/2 z-10 hidden -translate-y-1/2 xl:flex">
        <div className="rounded border border-white/10 bg-black/55 p-2 backdrop-blur-md">
          <div className="flex flex-col gap-2">
            <div className="rounded border border-white/10 p-2 text-white/70 transition-colors hover:border-primary/30 hover:text-primary">
              <Move3D size={14} />
            </div>
            <div className="rounded border border-white/10 p-2 text-white/70 transition-colors hover:border-primary/30 hover:text-primary">
              <ShieldCheck size={14} />
            </div>
            <div className="rounded border border-white/10 p-2 text-white/70 transition-colors hover:border-primary/30 hover:text-primary">
              <Layers3 size={14} />
            </div>
          </div>
        </div>
      </div>

      <Canvas shadows key={resetKey}>
        <Suspense fallback={<Html center><div className="text-xs font-bold uppercase tracking-widest text-white">Loading 3D...</div></Html>}>
          <SceneExporter onExport={(s) => (sceneRef.current = s)} />
          <PerspectiveCamera makeDefault position={[w * 2, h / 2, d * 3]} fov={45} />
          <OrbitControls target={[0, h / 2, 0]} makeDefault />

          <ambientLight intensity={1.5} />
          <pointLight position={[w, h, d]} intensity={2} castShadow />
          <pointLight position={[-w, 0, -d]} intensity={2} castShadow />
          <directionalLight position={[10, 20, 10]} intensity={1.5} castShadow />
          <hemisphereLight intensity={1} groundColor="#222222" />

          <group>
            <ShaftStructure width={w} depth={d} height={h} pitDepth={pD} />
            <GuideRails shaftHeight={h} shaftWidth={w} />
            <ElevatorCar width={carWidth} depth={carDepth} height={carHeight} position={[0, carY, carZ]} />
            <SuspensionRopes shaftHeight={h} carY={carY} shaftWidth={w} carZ={carZ} />
            <MachineDeck shaftHeight={h} shaftWidth={w} shaftDepth={d} />
            <LandingMarkers shaftHeight={h} shaftDepth={d} />

            <Html position={[0, -0.1, d / 2 + 0.1]} center>
              <div className="whitespace-nowrap rounded bg-black/60 px-2 py-0.5 text-[10px] text-emerald-400">W: {width.toFixed(0)} mm</div>
            </Html>
            <Html position={[-w / 2 - 0.1, -0.1, 0]} center>
              <div className="transform whitespace-nowrap rounded bg-black/60 px-2 py-0.5 text-[10px] text-emerald-400 -rotate-90">D: {depth.toFixed(0)} mm</div>
            </Html>
            <Html position={[w / 2 + 0.1, h / 2, 0]} center>
              <div className="whitespace-nowrap rounded bg-black/60 px-2 py-0.5 text-[10px] text-primary">H: {height.toFixed(0)} mm</div>
            </Html>
            <Html position={[w / 2 + 0.1, -pD / 2, 0]} center>
              <div className="whitespace-nowrap rounded bg-black/60 px-2 py-0.5 text-[10px] text-amber-400">Pit: {pitDepth.toFixed(0)} mm</div>
            </Html>

            <Buffer position={[-w / 4, -pD + 0.15, 0]} />
            <Buffer position={[w / 4, -pD + 0.15, 0]} />

            <group position={[0, h - carY, cwtZ]}>
              <Box args={[w * 0.7, 1.8, cwtThickness]}>
                <meshStandardMaterial color="#ef4444" metalness={0.5} />
              </Box>
              <mesh position={[0, 1.0, 0]}>
                <boxGeometry args={[w * 0.75, 0.1, 0.2]} />
                <meshStandardMaterial color="#1e293b" />
              </mesh>
              <mesh position={[0, -1.05, 0]}>
                <boxGeometry args={[w * 0.5, 0.12, 0.18]} />
                <meshStandardMaterial color="#7f1d1d" metalness={0.4} roughness={0.45} />
              </mesh>
            </group>

            {showClearances && (
              <group>
                {carPos > 0.8 && (
                  <group
                    position={[0, h + headroomGeneral / 2, 0]}
                    onPointerOver={(e) => {
                      e.stopPropagation();
                      setHoveredZone('headroom');
                    }}
                    onPointerOut={() => setHoveredZone(null)}
                  >
                    <Box args={[w, headroomGeneral, d]}>
                      <meshStandardMaterial color={hoveredZone === 'headroom' ? '#f87171' : '#ef4444'} transparent opacity={hoveredZone === 'headroom' ? 0.4 : 0.2} />
                    </Box>
                  </group>
                )}

                {carPos < 0.2 && (
                  <group
                    position={[0, -pD + pitRefugeHeight / 2, 0]}
                    onPointerOver={(e) => {
                      e.stopPropagation();
                      setHoveredZone('pit');
                    }}
                    onPointerOut={() => setHoveredZone(null)}
                  >
                    <Box args={[w * 0.8, pitRefugeHeight, d * 0.8]}>
                      <meshStandardMaterial color={hoveredZone === 'pit' ? '#34d399' : '#10b981'} transparent opacity={hoveredZone === 'pit' ? 0.4 : 0.2} />
                    </Box>
                  </group>
                )}

                <group
                  position={[-w / 2 + actualWallGap / 2, carY, 0]}
                  onPointerOver={(e) => {
                    e.stopPropagation();
                    setHoveredZone('wall');
                  }}
                  onPointerOut={() => setHoveredZone(null)}
                >
                  <Box args={[actualWallGap, carHeight, d]}>
                    <meshStandardMaterial color={hoveredZone === 'wall' ? '#60a5fa' : '#3b82f6'} transparent opacity={hoveredZone === 'wall' ? 0.4 : 0.2} />
                  </Box>
                </group>

                <group
                  position={[0, carY - carHeight / 2, d / 2 - sG / 2]}
                  onPointerOver={(e) => {
                    e.stopPropagation();
                    setHoveredZone('sill');
                  }}
                  onPointerOut={() => setHoveredZone(null)}
                >
                  <Box args={[w * 0.6, 0.05, sG]}>
                    <meshStandardMaterial color={hoveredZone === 'sill' ? '#fbbf24' : '#f59e0b'} transparent opacity={hoveredZone === 'sill' ? 0.6 : 0.4} />
                  </Box>
                </group>

                <group
                  position={[0, carY, cwtFrontZ + carToCwtDistance / 2]}
                  onPointerOver={(e) => {
                    e.stopPropagation();
                    setHoveredZone('cwt');
                  }}
                  onPointerOut={() => setHoveredZone(null)}
                >
                  <Box args={[w * 0.7, carHeight, carToCwtDistance]}>
                    <meshStandardMaterial color={hoveredZone === 'cwt' ? '#a78bfa' : '#8b5cf6'} transparent opacity={hoveredZone === 'cwt' ? 0.4 : 0.2} />
                  </Box>
                </group>
              </group>
            )}
          </group>

          <Grid infiniteGrid fadeDistance={30} fadeStrength={3} cellSize={0.5} sectionSize={2.5} sectionColor="#334155" cellColor="#0f172a" />
          <CameraControls onReset={() => setResetKey((prev) => prev + 1)} />
        </Suspense>
      </Canvas>

      <div className="absolute bottom-4 right-4 z-10 flex flex-col items-end gap-2">
        <div className="flex gap-2">
          <div className="rounded bg-primary px-2 py-1 text-[9px] font-black uppercase tracking-widest text-white">3D Real-Time</div>
          <div className="rounded border border-white/10 bg-white/10 px-2 py-1 text-[9px] font-black uppercase tracking-widest text-white backdrop-blur-sm">
            ISO 8100-1 Clearances
          </div>
        </div>
        <div className="flex items-center gap-2 rounded border border-white/10 bg-black/45 px-3 py-2 backdrop-blur-sm">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[9px] font-black uppercase tracking-[0.18em] text-white/70">Animated overlay channels active</span>
        </div>
        <div className="font-mono text-[8px] uppercase text-white/30">Vulkan Engine v4.2.0</div>
      </div>
    </div>
  );
};

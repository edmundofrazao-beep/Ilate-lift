import React, { useRef, useMemo, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Grid, Box, Cylinder, RoundedBox, Html } from '@react-three/drei';
import * as THREE from 'three';
import { Maximize2, Minimize2, Move, ZoomIn, ZoomOut, RotateCcw, Download } from 'lucide-react';
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
  carPos?: number; // 0 to 1
  pitDepth?: number;
  headroomHeight?: number;
  wellToCarWall?: number;
  sillGap?: number;
  pitRefugeHeight?: number;
  carToCwtDistance?: number;
  headroomGeneral?: number;
  showClearances?: boolean;
}

const ElevatorCar = ({ width, depth, height, position }: { width: number, depth: number, height: number, position: [number, number, number] }) => {
  return (
    <group position={position}>
      {/* Car Body */}
      <RoundedBox args={[width, height, depth]} radius={0.02} smoothness={4}>
        <meshStandardMaterial color="#3b82f6" metalness={0.6} roughness={0.2} />
      </RoundedBox>
      {/* Car Frame (Sling) */}
      <mesh>
        <boxGeometry args={[width + 0.1, height + 0.2, depth + 0.1]} />
        <meshStandardMaterial color="#1e293b" wireframe />
      </mesh>
      {/* Car Door */}
      <mesh position={[0, 0, depth / 2 + 0.01]}>
        <planeGeometry args={[width * 0.8, height * 0.8]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.8} roughness={0.1} />
      </mesh>
      {/* Roof Equipment */}
      <mesh position={[0, height / 2 + 0.1, 0]}>
        <boxGeometry args={[width * 0.6, 0.2, depth * 0.6]} />
        <meshStandardMaterial color="#475569" />
      </mesh>
    </group>
  );
};

const GuideRails = ({ shaftHeight, shaftWidth, shaftDepth }: { shaftHeight: number, shaftWidth: number, shaftDepth: number }) => {
  return (
    <group>
      {/* Left Rail */}
      <mesh position={[-shaftWidth / 2 + 0.05, shaftHeight / 2, 0]}>
        <boxGeometry args={[0.05, shaftHeight, 0.05]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.1} />
      </mesh>
      {/* Right Rail */}
      <mesh position={[shaftWidth / 2 - 0.05, shaftHeight / 2, 0]}>
        <boxGeometry args={[0.05, shaftHeight, 0.05]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.1} />
      </mesh>
    </group>
  );
};

const ShaftStructure = ({ width, depth, height, pitDepth = 1.5 }: { width: number, depth: number, height: number, pitDepth?: number }) => {
  return (
    <group>
      {/* Pit Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -pitDepth, 0]}>
        <planeGeometry args={[width, depth]} />
        <meshStandardMaterial color="#475569" />
      </mesh>
      {/* Pit Walls */}
      <mesh position={[0, -pitDepth / 2, 0]}>
        <boxGeometry args={[width, pitDepth, depth]} />
        <meshStandardMaterial color="#334155" wireframe transparent opacity={0.3} />
      </mesh>
      {/* Main Walls */}
      <mesh position={[0, height / 2, 0]}>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial color="#e2e8f0" wireframe transparent opacity={0.1} />
      </mesh>
      {/* Landing Openings */}
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

const Buffer = ({ position }: { position: [number, number, number] }) => (
  <mesh position={position}>
    <cylinderGeometry args={[0.1, 0.1, 0.3, 16]} />
    <meshStandardMaterial color="#f59e0b" metalness={0.5} />
  </mesh>
);

const CameraControls = ({ onReset }: { onReset: () => void }) => {
  const { camera } = useThree();
  return (
    <Html as="div" style={{ position: 'absolute', bottom: '1rem', left: '1rem', zIndex: 20, pointerEvents: 'none' }}>
      <div className="flex flex-col gap-2" style={{ pointerEvents: 'auto' }}>
        <button onClick={() => camera.position.multiplyScalar(0.9)} className="p-2 bg-black/60 text-white rounded hover:bg-primary transition-colors"><ZoomIn size={16} /></button>
        <button onClick={() => camera.position.multiplyScalar(1.1)} className="p-2 bg-black/60 text-white rounded hover:bg-primary transition-colors"><ZoomOut size={16} /></button>
        <button onClick={onReset} className="p-2 bg-black/60 text-white rounded hover:bg-primary transition-colors"><RotateCcw size={16} /></button>
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
  wellToCarWall = 0.11,
  sillGap = 0.03,
  pitRefugeHeight = 0.55,
  carToCwtDistance = 0.06,
  headroomGeneral = 0.52,
  showClearances = true
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
  
  // Convert mm to meters
  const w = width / 1000;
  const d = depth / 1000;
  const h = height / 1000;
  const pD = pitDepth / 1000;
  const sG = (sillGap || 30) / 1000; // default 30mm if not provided
  
  const carY = carPos * (h - carHeight) + carHeight / 2;
  const carZ = (d / 2) - (carDepth / 2) - sG;

  // Actual computed positions
  const actualWallGap = (w - carWidth) / 2;
  const carBackZ = carZ - carDepth / 2;
  
  // Dynamic Counterweight Placement based on user parameter
  const cwtThickness = 0.15;
  const cwtFrontZ = carBackZ - carToCwtDistance;
  const cwtZ = cwtFrontZ - cwtThickness / 2;

  const clearanceData: Record<string, { label: string, value: number, limit: string, clause: string }> = {
    headroom: { label: 'Headroom', value: (height / 1000) - (carPos * (h - carHeight) + carHeight), limit: '≥ ' + (headroomGeneral * 1000).toFixed(0) + 'mm', clause: 'ISO 8100-1:2026 5.2.5.7' },
    pit: { label: 'Pit Refuge', value: pitRefugeHeight * 1000, limit: '≥ ' + (pitRefugeHeight * 1000).toFixed(0) + 'mm', clause: 'ISO 8100-1:2026 5.2.5.8' },
    wall: { label: 'Wall Gap', value: actualWallGap * 1000, limit: '≤ 150mm', clause: 'ISO 8100-1:2026 5.2.5.2' },
    sill: { label: 'Sill Gap', value: sillGap * 1000, limit: '≤ 35mm', clause: 'ISO 8100-1:2026 5.3.4' },
    cwt: { label: 'Car-CWT Gap', value: carToCwtDistance * 1000, limit: '≥ 50mm', clause: 'ISO 8100-1:2026 5.2.5.2' },
  };

  return (
    <div className="w-full h-[600px] bg-slate-900 rounded-sm overflow-hidden relative border border-outline-variant/20 shadow-inner">
      <div className="absolute top-4 left-4 z-10 space-y-2">
        <div className="bg-black/80 backdrop-blur-md p-4 rounded border border-white/10 shadow-xl">
          <h4 className="text-[11px] font-black text-primary uppercase tracking-[0.2em] mb-3">Shaft Telemetry</h4>
          <div className="grid grid-cols-2 gap-x-6 gap-y-2">
            <span className="text-[10px] text-white/40 uppercase font-bold">Width</span>
            <span className="text-[10px] text-white font-mono">{width} mm</span>
            <span className="text-[10px] text-white/40 uppercase font-bold">Depth</span>
            <span className="text-[10px] text-white font-mono">{depth} mm</span>
            <span className="text-[10px] text-white/40 uppercase font-bold">Height</span>
            <span className="text-[10px] text-white font-mono">{height} mm</span>
            <span className="text-[10px] text-white/40 uppercase font-bold">Pit</span>
            <span className="text-[10px] text-white font-mono">{pitDepth} mm</span>
          </div>
        </div>

        {hoveredZone && clearanceData[hoveredZone] && (
          <div className="bg-primary/90 backdrop-blur-md p-4 rounded border border-white/20 shadow-2xl animate-in fade-in slide-in-from-left-4 duration-300">
            <h4 className="text-[11px] font-black text-white uppercase tracking-[0.2em] mb-1">{clearanceData[hoveredZone].label}</h4>
            <div className="space-y-1">
              <div className="flex justify-between gap-4">
                <span className="text-[10px] text-white/60 uppercase font-bold">Calculated</span>
                <span className="text-[10px] text-white font-mono font-bold">{clearanceData[hoveredZone].value.toFixed(0)} mm</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-[10px] text-white/60 uppercase font-bold">Normative Limit</span>
                <span className="text-[10px] text-white font-mono">{clearanceData[hoveredZone].limit}</span>
              </div>
              <div className="pt-2 mt-2 border-t border-white/10">
                <span className="text-[9px] text-white/40 font-mono italic">{clearanceData[hoveredZone].clause}</span>
              </div>
            </div>
          </div>
        )}

        <button
          onClick={handleExport}
          className="bg-primary hover:bg-primary/90 text-white px-3 py-2 rounded-sm text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 shadow-lg transition-all"
        >
          <Download size={12} />
          Export OBJ
        </button>
      </div>

      <Canvas shadows key={resetKey}>
        <Suspense fallback={<Html center><div className="text-white text-xs font-bold uppercase tracking-widest">Loading 3D...</div></Html>}>
          <SceneExporter onExport={(s) => sceneRef.current = s} />
          <PerspectiveCamera makeDefault position={[w * 2, h / 2, d * 3]} fov={45} />
          <OrbitControls target={[0, h / 2, 0]} makeDefault />
          
          <ambientLight intensity={1.5} />
          <pointLight position={[w, h, d]} intensity={2} castShadow />
          <pointLight position={[-w, 0, -d]} intensity={2} castShadow />
          <directionalLight position={[10, 20, 10]} intensity={1.5} castShadow />
          <hemisphereLight intensity={1} groundColor="#222222" />

          <group>
            <ShaftStructure width={w} depth={d} height={h} pitDepth={pD} />
            <GuideRails shaftHeight={h} shaftWidth={w} shaftDepth={d} />
            <ElevatorCar width={carWidth} depth={carDepth} height={carHeight} position={[0, carY, carZ]} />
            
            {/* Dimensions */}
            <Html position={[0, -0.1, d / 2 + 0.1]} center>
              <div className="bg-black/60 text-emerald-400 px-2 py-0.5 rounded text-[10px] whitespace-nowrap">
                W: {width.toFixed(0)} mm
              </div>
            </Html>
            <Html position={[-w / 2 - 0.1, -0.1, 0]} center>
              <div className="bg-black/60 text-emerald-400 px-2 py-0.5 rounded text-[10px] whitespace-nowrap transform -rotate-90">
                D: {depth.toFixed(0)} mm
              </div>
            </Html>
            <Html position={[w / 2 + 0.1, h / 2, 0]} center>
              <div className="bg-black/60 text-primary px-2 py-0.5 rounded text-[10px] whitespace-nowrap">
                H: {height.toFixed(0)} mm
              </div>
            </Html>
            <Html position={[w / 2 + 0.1, -pD / 2, 0]} center>
              <div className="bg-black/60 text-amber-400 px-2 py-0.5 rounded text-[10px] whitespace-nowrap">
                Pit: {pitDepth.toFixed(0)} mm
              </div>
            </Html>

            {/* Buffers */}
            <Buffer position={[-w/4, -pD + 0.15, 0]} />
            <Buffer position={[w/4, -pD + 0.15, 0]} />
            
            {/* Counterweight */}
            <group position={[0, h - carY, cwtZ]}>
              <Box args={[w * 0.7, 1.8, cwtThickness]}>
                <meshStandardMaterial color="#ef4444" metalness={0.5} />
              </Box>
              <mesh position={[0, 1.0, 0]}>
                <boxGeometry args={[w * 0.75, 0.1, 0.2]} />
                <meshStandardMaterial color="#1e293b" />
              </mesh>
            </group>

            {/* Clearance Visualizers (ISO 8100-1) */}
            {showClearances && (
              <group>
                {/* Headroom Zone - Visible when car is high */}
                {carPos > 0.8 && (
                  <group 
                    position={[0, h + headroomGeneral / 2, 0]}
                    onPointerOver={(e) => { e.stopPropagation(); setHoveredZone('headroom'); }}
                    onPointerOut={() => setHoveredZone(null)}
                  >
                    <Box args={[w, headroomGeneral, d]}>
                      <meshStandardMaterial color={hoveredZone === 'headroom' ? "#f87171" : "#ef4444"} transparent opacity={hoveredZone === 'headroom' ? 0.4 : 0.2} />
                    </Box>
                  </group>
                )}

                {/* Pit Refuge Zone - Visible when car is low */}
                {carPos < 0.2 && (
                  <group 
                    position={[0, -pD + pitRefugeHeight / 2, 0]}
                    onPointerOver={(e) => { e.stopPropagation(); setHoveredZone('pit'); }}
                    onPointerOut={() => setHoveredZone(null)}
                  >
                    <Box args={[w * 0.8, pitRefugeHeight, d * 0.8]}>
                      <meshStandardMaterial color={hoveredZone === 'pit' ? "#34d399" : "#10b981"} transparent opacity={hoveredZone === 'pit' ? 0.4 : 0.2} />
                    </Box>
                  </group>
                )}

                {/* Wall Clearance */}
                <group 
                  position={[-w / 2 + actualWallGap / 2, carY, 0]}
                  onPointerOver={(e) => { e.stopPropagation(); setHoveredZone('wall'); }}
                  onPointerOut={() => setHoveredZone(null)}
                >
                  <Box args={[actualWallGap, carHeight, d]}>
                    <meshStandardMaterial color={hoveredZone === 'wall' ? "#60a5fa" : "#3b82f6"} transparent opacity={hoveredZone === 'wall' ? 0.4 : 0.2} />
                  </Box>
                </group>

                {/* Sill Gap */}
                <group 
                  position={[0, carY - carHeight / 2, d / 2 - sG / 2]}
                  onPointerOver={(e) => { e.stopPropagation(); setHoveredZone('sill'); }}
                  onPointerOut={() => setHoveredZone(null)}
                >
                  <Box args={[w * 0.6, 0.05, sG]}>
                    <meshStandardMaterial color={hoveredZone === 'sill' ? "#fbbf24" : "#f59e0b"} transparent opacity={hoveredZone === 'sill' ? 0.6 : 0.4} />
                  </Box>
                </group>

                {/* Car to Counterweight Clearance */}
                <group 
                  position={[0, carY, cwtFrontZ + carToCwtDistance / 2]}
                  onPointerOver={(e) => { e.stopPropagation(); setHoveredZone('cwt'); }}
                  onPointerOut={() => setHoveredZone(null)}
                >
                  <Box args={[w * 0.7, carHeight, carToCwtDistance]}>
                    <meshStandardMaterial color={hoveredZone === 'cwt' ? "#a78bfa" : "#8b5cf6"} transparent opacity={hoveredZone === 'cwt' ? 0.4 : 0.2} />
                  </Box>
                </group>
              </group>
            )}
          </group>

          <Grid 
            infiniteGrid 
            fadeDistance={30} 
            fadeStrength={3} 
            cellSize={0.5} 
            sectionSize={2.5} 
            sectionColor="#334155" 
            cellColor="#0f172a" 
          />
          
          <CameraControls onReset={() => setResetKey(prev => prev + 1)} />
        </Suspense>
      </Canvas>

      <div className="absolute bottom-4 right-4 z-10 flex flex-col items-end gap-2">
        <div className="flex gap-2">
          <div className="px-2 py-1 bg-primary text-white text-[9px] font-black uppercase rounded tracking-widest">3D Real-Time</div>
          <div className="px-2 py-1 bg-white/10 text-white text-[9px] font-black uppercase rounded backdrop-blur-sm tracking-widest border border-white/10">ISO 8100-1 Clearances</div>
        </div>
        <div className="text-[8px] text-white/30 font-mono uppercase">Vulkan Engine v4.2.0</div>
      </div>
    </div>
  );
};

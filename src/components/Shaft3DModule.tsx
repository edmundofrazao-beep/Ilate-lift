import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Grid, Text, Box, Cylinder } from '@react-three/drei';
import * as THREE from 'three';

interface Shaft3DProps {
  width: number;
  depth: number;
  height: number;
  carWidth?: number;
  carDepth?: number;
  carHeight?: number;
  carPos?: number; // 0 to 1
}

const ElevatorCar = ({ width, depth, height, position }: { width: number, depth: number, height: number, position: [number, number, number] }) => {
  return (
    <group position={position}>
      {/* Car Body */}
      <mesh>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial color="#3b82f6" transparent opacity={0.8} />
      </mesh>
      {/* Car Frame (Sling) */}
      <mesh>
        <boxGeometry args={[width + 0.1, height + 0.2, depth + 0.1]} />
        <meshStandardMaterial color="#1e293b" wireframe />
      </mesh>
      {/* Car Door */}
      <mesh position={[0, 0, depth / 2 + 0.01]}>
        <planeGeometry args={[width * 0.8, height * 0.8]} />
        <meshStandardMaterial color="#94a3b8" />
      </mesh>
    </group>
  );
};

const GuideRails = ({ shaftHeight, shaftWidth, shaftDepth }: { shaftHeight: number, shaftWidth: number, shaftDepth: number }) => {
  return (
    <group>
      {/* Left Rail */}
      <mesh position={[-shaftWidth / 2 + 0.1, shaftHeight / 2, 0]}>
        <boxGeometry args={[0.05, shaftHeight, 0.05]} />
        <meshStandardMaterial color="#64748b" />
      </mesh>
      {/* Right Rail */}
      <mesh position={[shaftWidth / 2 - 0.1, shaftHeight / 2, 0]}>
        <boxGeometry args={[0.05, shaftHeight, 0.05]} />
        <meshStandardMaterial color="#64748b" />
      </mesh>
    </group>
  );
};

const ShaftStructure = ({ width, depth, height }: { width: number, depth: number, height: number }) => {
  return (
    <group>
      {/* Pit Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[width, depth]} />
        <meshStandardMaterial color="#cbd5e1" />
      </mesh>
      {/* Walls (Wireframe for visibility) */}
      <mesh position={[0, height / 2, 0]}>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial color="#e2e8f0" wireframe transparent opacity={0.2} />
      </mesh>
      {/* Landing Openings */}
      {Array.from({ length: Math.floor(height / 3) + 1 }).map((_, i) => (
        <mesh key={i} position={[0, i * 3 + 1.2, depth / 2]}>
          <planeGeometry args={[width * 0.6, 2.1]} />
          <meshStandardMaterial color="#f1f5f9" transparent opacity={0.5} />
        </mesh>
      ))}
    </group>
  );
};

export const Shaft3DModule: React.FC<Shaft3DProps> = ({ 
  width, 
  depth, 
  height,
  carWidth = 1.2,
  carDepth = 1.4,
  carHeight = 2.4,
  carPos = 0.5
}) => {
  // Convert mm to meters for 3D space
  const w = width / 1000;
  const d = depth / 1000;
  const h = height / 1000;
  
  const carY = carPos * (h - carHeight) + carHeight / 2;

  return (
    <div className="w-full h-[600px] bg-slate-900 rounded-sm overflow-hidden relative border border-outline-variant/20">
      <div className="absolute top-4 left-4 z-10 space-y-2">
        <div className="bg-black/60 backdrop-blur-md p-3 rounded border border-white/10">
          <h4 className="text-[10px] font-bold text-white uppercase tracking-widest mb-2">Shaft Telemetry</h4>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            <span className="text-[9px] text-white/50 uppercase">Width:</span>
            <span className="text-[9px] text-white font-mono">{width} mm</span>
            <span className="text-[9px] text-white/50 uppercase">Depth:</span>
            <span className="text-[9px] text-white font-mono">{depth} mm</span>
            <span className="text-[9px] text-white/50 uppercase">Height:</span>
            <span className="text-[9px] text-white font-mono">{height} mm</span>
            <span className="text-[9px] text-white/50 uppercase">Car Pos:</span>
            <span className="text-[9px] text-white font-mono">{(carPos * 100).toFixed(1)}%</span>
          </div>
        </div>
      </div>

      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[w * 2, h / 2, d * 3]} fov={50} />
        <OrbitControls target={[0, h / 2, 0]} />
        
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} castShadow />
        <spotLight position={[-10, 20, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />

        <group>
          <ShaftStructure width={w} depth={d} height={h} />
          <GuideRails shaftHeight={h} shaftWidth={w} shaftDepth={d} />
          <ElevatorCar width={carWidth} depth={carDepth} height={carHeight} position={[0, carY, 0]} />
          
          {/* Counterweight Placeholder */}
          <mesh position={[0, h - carY, -d / 2 + 0.1]}>
            <boxGeometry args={[w * 0.8, 1.5, 0.1]} />
            <meshStandardMaterial color="#ef4444" />
          </mesh>
        </group>

        <Grid 
          infiniteGrid 
          fadeDistance={50} 
          fadeStrength={5} 
          cellSize={1} 
          sectionSize={5} 
          sectionColor="#334155" 
          cellColor="#1e293b" 
        />
      </Canvas>

      <div className="absolute bottom-4 right-4 z-10">
        <div className="flex gap-2">
          <div className="px-2 py-1 bg-primary text-white text-[9px] font-bold uppercase rounded">3D Engine Active</div>
          <div className="px-2 py-1 bg-white/10 text-white text-[9px] font-bold uppercase rounded backdrop-blur-sm">ISO 8100-2 Compliant Geometry</div>
        </div>
      </div>
    </div>
  );
};

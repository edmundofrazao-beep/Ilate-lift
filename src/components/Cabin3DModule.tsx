import React, { useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, RoundedBox, Text, Html, Box, Cylinder } from '@react-three/drei';
import * as THREE from 'three';
import { Accessibility, Shield, Zap, Info } from 'lucide-react';

interface Cabin3DProps {
  width: number;
  depth: number;
  height: number;
  showAccessibility?: boolean;
  showCybersecurity?: boolean;
  showSeismic?: boolean;
}

const Handrail = ({ position, width }: { position: [number, number, number], width: number }) => (
  <group position={position}>
    <mesh rotation={[0, 0, Math.PI / 2]}>
      <cylinderGeometry args={[0.02, 0.02, width, 16]} />
      <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.1} />
    </mesh>
    {/* Brackets */}
    <mesh position={[-width/2 + 0.1, -0.05, 0]}>
      <boxGeometry args={[0.02, 0.1, 0.02]} />
      <meshStandardMaterial color="#64748b" />
    </mesh>
    <mesh position={[width/2 - 0.1, -0.05, 0]}>
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
    {/* Buttons */}
    {Array.from({ length: 10 }).map((_, i) => (
      <mesh key={i} position={[0.015, -0.4 + i * 0.1, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.02, 0.02, 0.01, 16]} />
        <meshStandardMaterial color={i === 0 ? "#ef4444" : "#f1f5f9"} emissive={i === 0 ? "#ef4444" : "#000"} emissiveIntensity={0.5} />
      </mesh>
    ))}
    {/* Display */}
    <mesh position={[0.015, 0.4, 0]}>
      <planeGeometry args={[0.2, 0.1]} />
      <meshStandardMaterial color="#0ea5e9" emissive="#0ea5e9" emissiveIntensity={1} />
    </mesh>
  </group>
);

export const Cabin3DModule: React.FC<Cabin3DProps> = ({
  width = 1.2,
  depth = 1.4,
  height = 2.4,
  showAccessibility = true,
  showCybersecurity = true,
  showSeismic = true
}) => {
  const [hoveredFeature, setHoveredFeature] = useState<string | null>(null);

  return (
    <div className="w-full h-[600px] bg-slate-900 rounded-sm overflow-hidden relative border border-outline-variant/20 shadow-inner">
      <div className="absolute top-4 left-4 z-10 space-y-2">
        <div className="bg-black/80 backdrop-blur-md p-4 rounded border border-white/10 shadow-xl">
          <h4 className="text-[11px] font-black text-primary uppercase tracking-[0.2em] mb-3">Cabin Interior Explorer</h4>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Accessibility size={12} className="text-emerald-400" />
              <span className="text-[10px] text-white/70 uppercase font-bold">EN 81-70 Accessibility</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield size={12} className="text-blue-400" />
              <span className="text-[10px] text-white/70 uppercase font-bold">ISO 8100-20 Cybersecurity</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap size={12} className="text-amber-400" />
              <span className="text-[10px] text-white/70 uppercase font-bold">EN 81-77 Seismic</span>
            </div>
          </div>
        </div>

        {hoveredFeature && (
          <div className="bg-white/95 backdrop-blur-md p-4 rounded border border-black/10 shadow-2xl max-w-xs animate-in fade-in slide-in-from-left-4">
            <h4 className="text-[11px] font-black text-primary uppercase tracking-widest mb-1">{hoveredFeature}</h4>
            <p className="text-[10px] text-slate-600 leading-relaxed">
              {hoveredFeature === 'Handrail' && 'EN 81-70: Handrail required on at least one side wall, height 900mm ± 25mm.'}
              {hoveredFeature === 'Control Panel' && 'EN 81-70: Buttons between 900mm and 1100mm height. Braille and tactile symbols required.'}
              {hoveredFeature === 'Mirror' && 'EN 81-70: Required if car depth < 1.4m to assist wheelchair users in reversing.'}
              {hoveredFeature === 'IoT Gateway' && 'ISO 8100-20: Secure communication gateway with encrypted telemetry for predictive maintenance.'}
              {hoveredFeature === 'Seismic Snags' && 'EN 81-77: Retainer plates to prevent guide shoes from leaving rails during seismic events.'}
            </p>
          </div>
        )}
      </div>

      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[2, 2, 3]} fov={45} />
        <OrbitControls target={[0, 1, 0]} />
        
        <ambientLight intensity={0.5} />
        <pointLight position={[2, 3, 2]} intensity={1} castShadow />
        <spotLight position={[-2, 4, 2]} angle={0.3} penumbra={1} intensity={1.5} castShadow />

        <group>
          {/* Cabin Floor */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
            <planeGeometry args={[width, depth]} />
            <meshStandardMaterial color="#334155" roughness={0.8} />
          </mesh>

          {/* Cabin Walls */}
          {/* Back Wall */}
          <mesh position={[0, height / 2, -depth / 2]}>
            <boxGeometry args={[width, height, 0.05]} />
            <meshStandardMaterial color="#e2e8f0" metalness={0.1} />
          </mesh>
          {/* Left Wall */}
          <mesh position={[-width / 2, height / 2, 0]} rotation={[0, Math.PI / 2, 0]}>
            <boxGeometry args={[depth, height, 0.05]} />
            <meshStandardMaterial color="#e2e8f0" metalness={0.1} />
          </mesh>
          {/* Right Wall */}
          <mesh position={[width / 2, height / 2, 0]} rotation={[0, -Math.PI / 2, 0]}>
            <boxGeometry args={[depth, height, 0.05]} />
            <meshStandardMaterial color="#e2e8f0" metalness={0.1} />
          </mesh>
          {/* Ceiling */}
          <mesh position={[0, height, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <planeGeometry args={[width, depth]} />
            <meshStandardMaterial color="#f8fafc" emissive="#fff" emissiveIntensity={0.1} />
          </mesh>

          {/* Mirror (EN 81-70) */}
          {showAccessibility && (
            <mesh 
              position={[0, height * 0.7, -depth / 2 + 0.03]}
              onPointerOver={() => setHoveredFeature('Mirror')}
              onPointerOut={() => setHoveredFeature(null)}
            >
              <planeGeometry args={[width * 0.8, height * 0.4]} />
              <meshStandardMaterial color="#cbd5e1" metalness={1} roughness={0} />
            </mesh>
          )}

          {/* Handrail (EN 81-70) */}
          {showAccessibility && (
            <Handrail 
              position={[-width / 2 + 0.08, 0.9, 0]} 
              width={depth * 0.8} 
            />
          )}

          {/* Control Panel (EN 81-70) */}
          {showAccessibility && (
            <group
              onPointerOver={() => setHoveredFeature('Control Panel')}
              onPointerOut={() => setHoveredFeature(null)}
            >
              <ControlPanel position={[width / 2 - 0.02, 1.1, depth / 4]} />
            </group>
          )}

          {/* IoT Gateway (ISO 8100-20) */}
          {showCybersecurity && (
            <mesh 
              position={[0, height - 0.1, depth / 2 - 0.1]}
              onPointerOver={() => setHoveredFeature('IoT Gateway')}
              onPointerOut={() => setHoveredFeature(null)}
            >
              <boxGeometry args={[0.2, 0.05, 0.1]} />
              <meshStandardMaterial color="#1e293b" />
              <pointLight color="#0ea5e9" intensity={0.5} distance={0.5} />
            </mesh>
          )}

          {/* Seismic Snags (EN 81-77) */}
          {showSeismic && (
            <group
              onPointerOver={() => setHoveredFeature('Seismic Snags')}
              onPointerOut={() => setHoveredFeature(null)}
            >
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
      </Canvas>

      <div className="absolute bottom-4 right-4 z-10 flex flex-col items-end gap-2">
        <div className="flex gap-2">
          <div className="px-2 py-1 bg-emerald-600 text-white text-[9px] font-black uppercase rounded tracking-widest">Accessibility Mode</div>
          <div className="px-2 py-1 bg-white/10 text-white text-[9px] font-black uppercase rounded backdrop-blur-sm tracking-widest border border-white/10">ISO 8100-7 Compliance</div>
        </div>
      </div>
    </div>
  );
};

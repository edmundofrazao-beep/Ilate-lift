import React, { Suspense, useEffect, useRef, useState } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Grid, Box, RoundedBox, Html, Line } from '@react-three/drei';
import * as THREE from 'three';
import { Activity, ArrowRightLeft, Download, Layers3, Move3D, RotateCcw, ShieldCheck, ZoomIn, ZoomOut } from 'lucide-react';
import { downloadFile } from '../lib/exporters';
// @ts-ignore
import { OBJExporter } from 'three/addons/exporters/OBJExporter.js';

interface Shaft3DProps {
  projectType?: 'electric' | 'hydraulic';
  onPresetSelect?: (values: { carPositionPercent?: number }) => void;
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
  driveArrangement?: 'mrl' | 'machine-room';
  machineRoomPosition?: 'none' | 'overhead' | 'adjacent' | 'basement';
  controlCabinetLocation?: 'machine-room' | 'top-landing' | 'lowest-landing' | 'jamb';
  drivePackageLocation?: 'shaft-head' | 'machine-room' | 'landing-cabinet' | 'pit-unit';
  travellingCableType?: 'flat' | 'round' | 'bus';
  travellingCableRouting?: 'rear-wall' | 'side-wall';
  shaftLightingLux?: number;
  shaftLuminaireSpacing?: number;
  shaftLuminaireCount?: number;
  roofInspectionStation?: boolean;
  pitInspectionStation?: boolean;
  cabinetInspectionEnabled?: boolean;
}

const ElevatorCar = ({
  width,
  depth,
  height,
  position,
  projectType,
}: {
  width: number;
  depth: number;
  height: number;
  position: [number, number, number];
  projectType: 'electric' | 'hydraulic';
}) => {
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
      <mesh position={[0, -height / 2 - 0.22, depth / 2 - 0.035]}>
        <boxGeometry args={[width * 0.82, 0.44, 0.05]} />
        <meshStandardMaterial color="#1e293b" metalness={0.45} roughness={0.35} />
      </mesh>
      <mesh position={[0, -height / 2 - 0.46, depth / 2 - 0.03]}>
        <boxGeometry args={[width * 0.7, 0.46, 0.025]} />
        <meshStandardMaterial color="#0f172a" metalness={0.35} roughness={0.4} />
      </mesh>
      <mesh position={[0, height / 2 + 0.03, 0]}>
        <boxGeometry args={[width * 0.92, 0.06, depth * 0.92]} />
        <meshStandardMaterial color="#334155" metalness={0.45} roughness={0.28} />
      </mesh>
      <mesh position={[0, height / 2 + 0.12, -depth * 0.18]}>
        <boxGeometry args={[width * 0.48, 0.12, depth * 0.16]} />
        <meshStandardMaterial color="#0f172a" metalness={0.55} roughness={0.22} />
      </mesh>
      <mesh position={[width * 0.26, height / 2 + 0.14, depth * 0.18]}>
        <boxGeometry args={[0.16, 0.16, 0.18]} />
        <meshStandardMaterial color={projectType === 'hydraulic' ? '#f59e0b' : '#f97316'} metalness={0.5} roughness={0.2} />
      </mesh>
      <mesh position={[width * 0.14, height / 2 + 0.16, depth * 0.14]}>
        <boxGeometry args={[0.12, 0.12, 0.1]} />
        <meshStandardMaterial color="#111827" metalness={0.6} roughness={0.24} />
      </mesh>
      <group position={[0, height / 2 + 0.17, -depth * 0.2]}>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[width * 0.62, 0.03, 0.03]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.85} roughness={0.12} />
        </mesh>
        <mesh position={[-width * 0.3, -0.11, 0]}>
          <boxGeometry args={[0.03, 0.22, 0.03]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.85} roughness={0.12} />
        </mesh>
        <mesh position={[width * 0.3, -0.11, 0]}>
          <boxGeometry args={[0.03, 0.22, 0.03]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.85} roughness={0.12} />
        </mesh>
        <mesh position={[-width * 0.1, -0.11, 0]}>
          <boxGeometry args={[0.03, 0.22, 0.03]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.85} roughness={0.12} />
        </mesh>
        <mesh position={[width * 0.1, -0.11, 0]}>
          <boxGeometry args={[0.03, 0.22, 0.03]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.85} roughness={0.12} />
        </mesh>
      </group>
      <mesh position={[0, height / 2 + 0.17, depth * 0.22]}>
        <boxGeometry args={[width * 0.34, 0.03, 0.03]} />
        <meshStandardMaterial color="#e2e8f0" metalness={0.8} roughness={0.14} />
      </mesh>
      <mesh position={[-width * 0.17, height / 2 + 0.07, depth * 0.22]}>
        <boxGeometry args={[0.03, 0.2, 0.03]} />
        <meshStandardMaterial color="#e2e8f0" metalness={0.8} roughness={0.14} />
      </mesh>
      <mesh position={[width * 0.17, height / 2 + 0.07, depth * 0.22]}>
        <boxGeometry args={[0.03, 0.2, 0.03]} />
        <meshStandardMaterial color="#e2e8f0" metalness={0.8} roughness={0.14} />
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

const ShaftStructure = ({
  width,
  depth,
  height,
  pitDepth = 1.5,
  frontCutaway = 0,
}: {
  width: number;
  depth: number;
  height: number;
  pitDepth?: number;
  frontCutaway?: number;
}) => {
  const frontPanelWidth = width * 0.48;
  const slideOffset = frontCutaway * width * 0.42;
  const sideOpacity = 0.12;

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
      <mesh position={[0, height / 2, -depth / 2 - 0.015]}>
        <boxGeometry args={[width, height, 0.03]} />
        <meshStandardMaterial color="#cbd5e1" transparent opacity={0.14} />
      </mesh>
      <mesh position={[-width / 2 - 0.015, height / 2, 0]}>
        <boxGeometry args={[0.03, height, depth]} />
        <meshStandardMaterial color="#cbd5e1" transparent opacity={sideOpacity} />
      </mesh>
      <mesh position={[width / 2 + 0.015, height / 2, 0]}>
        <boxGeometry args={[0.03, height, depth]} />
        <meshStandardMaterial color="#cbd5e1" transparent opacity={sideOpacity} />
      </mesh>
      <mesh position={[-width * 0.26 - slideOffset, height / 2, depth / 2 + 0.015]}>
        <boxGeometry args={[frontPanelWidth, height, 0.03]} />
        <meshStandardMaterial color="#f1f5f9" transparent opacity={0.18} />
      </mesh>
      <mesh position={[width * 0.26 + slideOffset, height / 2, depth / 2 + 0.015]}>
        <boxGeometry args={[frontPanelWidth, height, 0.03]} />
        <meshStandardMaterial color="#f1f5f9" transparent opacity={0.18} />
      </mesh>
      {Array.from({ length: Math.floor(height / 3) + 1 }).map((_, i) => (
        <group key={i} position={[0, i * 3 + 1.05, depth / 2]}>
          <mesh>
            <planeGeometry args={[width * 0.6, 2.1]} />
            <meshStandardMaterial color="#f1f5f9" transparent opacity={Math.max(0.08, 0.3 - frontCutaway * 0.22)} side={THREE.DoubleSide} />
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

const MachineRoomPod = ({
  shaftHeight,
  shaftWidth,
  shaftDepth,
  position,
}: {
  shaftHeight: number;
  shaftWidth: number;
  shaftDepth: number;
  position: 'overhead' | 'adjacent' | 'basement';
}) => {
  const podPosition =
    position === 'adjacent'
      ? [shaftWidth * 0.72, shaftHeight * 0.72, 0]
      : position === 'basement'
        ? [0, -1.2, -shaftDepth * 0.72]
        : [0, shaftHeight + 1.2, -shaftDepth * 0.15];
  const podSize =
    position === 'adjacent'
      ? [shaftWidth * 0.4, 2.4, shaftDepth * 0.55]
      : [shaftWidth * 0.82, 1.8, shaftDepth * 0.4];

  return (
    <group position={podPosition as [number, number, number]}>
      <Box args={podSize as [number, number, number]}>
        <meshStandardMaterial color="#0f172a" metalness={0.62} roughness={0.24} />
      </Box>
      <mesh position={[-0.3, 0.2, podSize[2] / 2 + 0.01]}>
        <boxGeometry args={[0.42, 0.9, 0.03]} />
        <meshStandardMaterial color="#1e293b" metalness={0.55} roughness={0.28} />
      </mesh>
      <mesh position={[0.24, 0.18, 0]}>
        <boxGeometry args={[0.46, 0.34, 0.3]} />
        <meshStandardMaterial color="#f97316" metalness={0.45} roughness={0.22} />
      </mesh>
    </group>
  );
};

const ControlCabinet = ({
  shaftWidth,
  shaftDepth,
  shaftHeight,
  location,
}: {
  shaftWidth: number;
  shaftDepth: number;
  shaftHeight: number;
  location: 'machine-room' | 'top-landing' | 'lowest-landing' | 'jamb';
}) => {
  const position =
    location === 'machine-room'
      ? [shaftWidth * 0.24, shaftHeight + 0.58, -shaftDepth * 0.16]
      : location === 'top-landing'
        ? [shaftWidth / 2 + 0.18, shaftHeight - 1.2, shaftDepth / 2 + 0.02]
        : location === 'lowest-landing'
          ? [shaftWidth / 2 + 0.18, 1.1, shaftDepth / 2 + 0.02]
          : [shaftWidth / 2 + 0.06, 1.1, shaftDepth / 2 + 0.04];

  return (
    <group position={position as [number, number, number]}>
      <mesh>
        <boxGeometry args={[0.24, 0.62, 0.16]} />
        <meshStandardMaterial color="#111827" metalness={0.62} roughness={0.24} />
      </mesh>
      <mesh position={[0, 0.1, 0.085]}>
        <boxGeometry args={[0.16, 0.22, 0.01]} />
        <meshStandardMaterial color="#0ea5e9" emissive="#0ea5e9" emissiveIntensity={0.55} />
      </mesh>
    </group>
  );
};

const TravellingCableRun = ({
  shaftHeight,
  carY,
  carHeight,
  shaftWidth,
  shaftDepth,
  routing,
}: {
  shaftHeight: number;
  carY: number;
  carHeight: number;
  shaftWidth: number;
  shaftDepth: number;
  routing: 'rear-wall' | 'side-wall';
}) => {
  const x = routing === 'side-wall' ? shaftWidth / 2 - 0.12 : -shaftWidth * 0.22;
  const z = routing === 'side-wall' ? shaftDepth * 0.12 : -shaftDepth / 2 + 0.08;
  return (
    <Line
      points={[
        [x, shaftHeight + 0.15, z],
        [x, carY + carHeight * 0.2, z],
        [x + (routing === 'side-wall' ? -0.22 : 0.12), carY - carHeight * 0.12, z + (routing === 'side-wall' ? -0.08 : 0.05)],
      ]}
      color="#f59e0b"
      lineWidth={2.1}
    />
  );
};

const ShaftLightingRun = ({
  shaftHeight,
  shaftWidth,
  shaftDepth,
  count,
  lux,
}: {
  shaftHeight: number;
  shaftWidth: number;
  shaftDepth: number;
  count: number;
  lux: number;
}) => (
  <group>
    {Array.from({ length: Math.max(count, 2) }).map((_, i, arr) => {
      const y = arr.length === 1 ? shaftHeight / 2 : (i / (arr.length - 1)) * Math.max(shaftHeight - 1.4, 0) + 0.7;
      return (
        <group key={i} position={[-shaftWidth / 2 + 0.05, y, shaftDepth / 2 - 0.08]}>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <boxGeometry args={[0.44, 0.06, 0.05]} />
            <meshStandardMaterial color="#f8fafc" emissive="#f8fafc" emissiveIntensity={lux >= 200 ? 0.8 : 0.3} />
          </mesh>
        </group>
      );
    })}
  </group>
);

const InspectionStations = ({
  shaftWidth,
  shaftDepth,
  shaftHeight,
  roofInspectionStation,
  pitInspectionStation,
  cabinetInspectionEnabled,
}: {
  shaftWidth: number;
  shaftDepth: number;
  shaftHeight: number;
  roofInspectionStation: boolean;
  pitInspectionStation: boolean;
  cabinetInspectionEnabled: boolean;
}) => (
  <group>
    {roofInspectionStation && (
      <mesh position={[shaftWidth * 0.26, shaftHeight - 0.8, -shaftDepth * 0.16]}>
        <boxGeometry args={[0.22, 0.14, 0.12]} />
        <meshStandardMaterial color="#f97316" metalness={0.55} roughness={0.22} />
      </mesh>
    )}
    {pitInspectionStation && (
      <mesh position={[-shaftWidth / 2 + 0.16, -0.4, shaftDepth / 2 - 0.08]}>
        <boxGeometry args={[0.18, 0.14, 0.08]} />
        <meshStandardMaterial color="#38bdf8" metalness={0.45} roughness={0.28} />
      </mesh>
    )}
    {cabinetInspectionEnabled && (
      <mesh position={[shaftWidth / 2 + 0.18, Math.min(1.5, shaftHeight - 0.8), shaftDepth / 2 + 0.02]}>
        <boxGeometry args={[0.08, 0.08, 0.04]} />
        <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={0.45} />
      </mesh>
    )}
  </group>
);

const HydraulicRamAssembly = ({
  shaftHeight,
  carY,
  carHeight,
  shaftDepth,
}: {
  shaftHeight: number;
  carY: number;
  carHeight: number;
  shaftDepth: number;
}) => {
  const ramBaseY = -0.9;
  const ramTopY = Math.max(carY - carHeight / 2, ramBaseY + 0.8);
  const cylinderHeight = Math.max(ramTopY - ramBaseY - 0.35, 0.6);

  return (
    <group position={[0, 0, -shaftDepth * 0.24]}>
      <mesh position={[0, ramBaseY + cylinderHeight / 2, 0]}>
        <cylinderGeometry args={[0.16, 0.16, cylinderHeight, 28]} />
        <meshStandardMaterial color="#475569" metalness={0.85} roughness={0.18} />
      </mesh>
      <mesh position={[0, ramTopY - 0.12, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.42, 24]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.95} roughness={0.08} />
      </mesh>
      <mesh position={[0, ramTopY + 0.12, 0]}>
        <boxGeometry args={[0.42, 0.08, 0.24]} />
        <meshStandardMaterial color="#f97316" metalness={0.5} roughness={0.22} />
      </mesh>
      <mesh position={[0.34, -0.72, 0.22]}>
        <boxGeometry args={[0.58, 0.34, 0.42]} />
        <meshStandardMaterial color="#111827" metalness={0.55} roughness={0.24} />
      </mesh>
      <mesh position={[0.18, -0.64, 0.12]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.03, 0.03, 0.42, 18]} />
        <meshStandardMaterial color="#f59e0b" metalness={0.6} roughness={0.25} />
      </mesh>
      <mesh position={[0.06, -0.38, 0.02]} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[0.22, 0.02, 12, 36, Math.PI]} />
        <meshStandardMaterial color="#f59e0b" metalness={0.55} roughness={0.28} />
      </mesh>
    </group>
  );
};

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

const LandingDoors = ({
  shaftHeight,
  shaftWidth,
  shaftDepth,
  frontCutaway,
  activeLandingIndex,
  carPositionPercent,
}: {
  shaftHeight: number;
  shaftWidth: number;
  shaftDepth: number;
  frontCutaway: number;
  activeLandingIndex: number | null;
  carPositionPercent: number;
}) => {
  const levels = Array.from({ length: Math.floor(shaftHeight / 3) + 1 });
  const openingWidth = shaftWidth * 0.42;
  const openingHeight = 2.1;
  const basePanelWidth = openingWidth / 2 - 0.015;
  const shellOffset = frontCutaway * shaftWidth * 0.15;

  return (
    <group>
      {levels.map((_, i) => {
        const y = i * 3 + openingHeight / 2;
        const isActiveLanding = activeLandingIndex === i;
        const activeTravelBias = isActiveLanding ? Math.min(Math.max(Math.abs(carPositionPercent - i * (100 / Math.max(levels.length - 1, 1))) / 100, 0), 1) : 1;
        const doorOpenFactor = isActiveLanding ? Math.max(0.12, 1 - activeTravelBias * 3.2) : 0.08;
        const panelWidth = basePanelWidth;
        const activePanelOffset = isActiveLanding ? shellOffset + doorOpenFactor * openingWidth * 0.18 : shellOffset;
        return (
          <group key={i} position={[0, y, shaftDepth / 2 + 0.028]}>
            <mesh position={[0, 0, -0.02]}>
              <boxGeometry args={[openingWidth + 0.14, openingHeight + 0.18, 0.04]} />
              <meshStandardMaterial color={isActiveLanding ? '#1d4ed8' : '#0f172a'} metalness={0.75} roughness={0.22} />
            </mesh>
            <mesh position={[-panelWidth / 2 - 0.02 - activePanelOffset, 0, 0]}>
              <boxGeometry args={[panelWidth, openingHeight, 0.02]} />
              <meshStandardMaterial color={isActiveLanding ? '#f8fafc' : '#e2e8f0'} metalness={0.78} roughness={0.16} transparent opacity={isActiveLanding ? 0.92 : 0.78} />
            </mesh>
            <mesh position={[panelWidth / 2 + 0.02 + activePanelOffset, 0, 0]}>
              <boxGeometry args={[panelWidth, openingHeight, 0.02]} />
              <meshStandardMaterial color={isActiveLanding ? '#eff6ff' : '#cbd5e1'} metalness={0.78} roughness={0.16} transparent opacity={isActiveLanding ? 0.92 : 0.78} />
            </mesh>
            {isActiveLanding && (
              <mesh position={[0, 0, -0.005]}>
                <planeGeometry args={[openingWidth * Math.min(0.52, doorOpenFactor * 0.9), openingHeight * 0.92]} />
                <meshStandardMaterial color="#0b1220" transparent opacity={0.65} />
              </mesh>
            )}
            <mesh position={[0, -openingHeight / 2 - 0.04, 0.015]}>
              <boxGeometry args={[openingWidth + 0.04, 0.05, 0.08]} />
              <meshStandardMaterial color={isActiveLanding ? '#38bdf8' : '#64748b'} metalness={0.55} roughness={0.3} />
            </mesh>
            <mesh position={[0, openingHeight / 2 + 0.05, -0.005]}>
              <boxGeometry args={[openingWidth + 0.02, 0.05, 0.06]} />
              <meshStandardMaterial color={isActiveLanding ? '#2563eb' : '#475569'} metalness={0.6} roughness={0.25} />
            </mesh>
            <mesh position={[openingWidth / 2 + 0.12, 0.2, 0.025]}>
              <boxGeometry args={[0.08, 0.36, 0.04]} />
              <meshStandardMaterial color={isActiveLanding ? '#0f172a' : '#1e293b'} metalness={0.65} roughness={0.28} />
            </mesh>
            <mesh position={[openingWidth / 2 + 0.145, 0.29, 0.048]}>
              <boxGeometry args={[0.018, 0.018, 0.01]} />
              <meshStandardMaterial color={isActiveLanding ? '#22c55e' : '#f8fafc'} emissive={isActiveLanding ? '#22c55e' : '#000000'} emissiveIntensity={isActiveLanding ? 0.7 : 0} />
            </mesh>
            <mesh position={[openingWidth / 2 + 0.145, 0.14, 0.048]}>
              <boxGeometry args={[0.018, 0.018, 0.01]} />
              <meshStandardMaterial color={isActiveLanding ? '#f97316' : '#cbd5e1'} emissive={isActiveLanding ? '#f97316' : '#000000'} emissiveIntensity={isActiveLanding ? 0.6 : 0} />
            </mesh>
            <mesh position={[0, openingHeight / 2 + 0.15, 0.018]}>
              <boxGeometry args={[0.16, 0.08, 0.03]} />
              <meshStandardMaterial color={isActiveLanding ? '#0f172a' : '#1e293b'} metalness={0.7} roughness={0.2} />
            </mesh>
            <Html position={[0, openingHeight / 2 + 0.15, 0.04]} center>
              <div className={`rounded px-2 py-0.5 text-[8px] font-black uppercase tracking-[0.18em] ${isActiveLanding ? 'bg-emerald-500/90 text-white' : 'bg-black/60 text-white/70'}`}>
                {`L${String(i).padStart(2, '0')}`}
              </div>
            </Html>
            {isActiveLanding && (
              <Html position={[0, openingHeight / 2 + 0.18, 0.02]} center>
                <div className="flex items-center gap-2 whitespace-nowrap rounded bg-blue-600/90 px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.18em] text-white">
                  <span>Cabin Aligned</span>
                  <span className="rounded bg-white/15 px-1.5 py-0.5 text-[8px]">
                    {doorOpenFactor > 0.32 ? 'Door Active' : 'Door Closed'}
                  </span>
                </div>
              </Html>
            )}
            {isActiveLanding && (
              <Html position={[openingWidth / 2 + 0.16, 0.55, 0.025]} center>
                <div className="rounded bg-emerald-600/90 px-2 py-0.5 text-[8px] font-black uppercase tracking-[0.18em] text-white">
                  Landing Call
                </div>
              </Html>
            )}
          </group>
        );
      })}
    </group>
  );
};

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
  projectType = 'electric',
  onPresetSelect,
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
  driveArrangement = 'mrl',
  machineRoomPosition = 'none',
  controlCabinetLocation = 'top-landing',
  drivePackageLocation = 'shaft-head',
  travellingCableType = 'flat',
  travellingCableRouting = 'rear-wall',
  shaftLightingLux = 220,
  shaftLuminaireSpacing = 3.0,
  shaftLuminaireCount = 6,
  roofInspectionStation = true,
  pitInspectionStation = true,
  cabinetInspectionEnabled = true,
}) => {
  const [resetKey, setResetKey] = useState(0);
  const [hoveredZone, setHoveredZone] = useState<string | null>(null);
  const [frontCutaway, setFrontCutaway] = useState(0.45);
  const [isInspectorCollapsed, setIsInspectorCollapsed] = useState(false);
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
  const currentLandingIndex = (() => {
    const approx = Math.round((carY - carHeight / 2) / 3);
    if (approx < 0) return 0;
    const maxLanding = Math.floor(h / 3);
    return Math.min(approx, maxLanding);
  })();
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
    cwt: { label: projectType === 'hydraulic' ? 'Hydraulic Service Zone' : 'Car-CWT Gap', value: carToCwtDistance * 1000, limit: '≥ 50mm', clause: 'ISO 8100-1:2026 5.2.5.2' },
    lighting: { label: 'Shaft Lighting', value: shaftLightingLux, limit: '≥ 200 lx', clause: 'Maintenance lighting rule' },
  };

  const telemetryRows = [
    { label: 'Layout', value: driveArrangement === 'machine-room' ? 'Machine room' : 'MRL' },
    { label: 'Drive', value: drivePackageLocation },
    { label: 'Cabinet', value: controlCabinetLocation },
    { label: 'Travel Envelope', value: `${Math.max(height - pitDepth, 0).toFixed(0)} mm` },
    { label: 'Car Position', value: `${(carPos * 100).toFixed(0)} %` },
    { label: 'Active Landing', value: `L${String(currentLandingIndex).padStart(2, '0')}` },
    { label: 'Front Cutaway', value: `${(frontCutaway * 100).toFixed(0)} %` },
    { label: 'Wall Gap', value: `${(actualWallGap * 1000).toFixed(0)} mm` },
    { label: projectType === 'hydraulic' ? 'Service Zone' : 'CWT Gap', value: `${(carToCwtDistance * 1000).toFixed(0)} mm` },
    { label: 'Cable', value: `${travellingCableType} / ${travellingCableRouting}` },
    { label: 'Lighting', value: `${shaftLightingLux.toFixed(0)} lx / ${shaftLuminaireCount} pcs @ ${shaftLuminaireSpacing.toFixed(1)}m` },
  ];
  const hydraulicPowerUnitScene = (() => {
    if (projectType !== 'hydraulic') return null;
    if (drivePackageLocation === 'machine-room') {
      return {
        position: [w / 2 + 0.34, h - 0.65, -d * 0.18] as [number, number, number],
        box: [0.72, 0.42, 0.5] as [number, number, number],
        label: 'Power unit in machine room',
      };
    }
    if (drivePackageLocation === 'pit-unit') {
      return {
        position: [0, -pD + 0.16, -d * 0.24] as [number, number, number],
        box: [0.86, 0.12, 0.46] as [number, number, number],
        label: 'Pit hydraulic power unit',
      };
    }
    return {
      position: [w / 2 + 0.28, Math.max(h - 1.35, 1.2), d / 2 - 0.2] as [number, number, number],
      box: [0.36, 0.9, 0.24] as [number, number, number],
      label: 'Landing cabinet power unit',
    };
  })();

  const inspectionPresets = [
    {
      id: 'pit',
      label: 'Pit',
      description: 'Open the front shell and inspect buffers, refuge volume and lower service zone.',
      cutaway: 0.72,
      carPositionPercent: 8,
    },
    {
      id: 'mid',
      label: 'Mid Travel',
      description: 'Use the central travel position to inspect cabin exterior, guide rails and shaft spacing.',
      cutaway: 0.45,
      carPositionPercent: 50,
    },
    {
      id: 'headroom',
      label: 'Headroom',
      description: 'Push the cabin upward and widen the opening to review top clearance and roof equipment.',
      cutaway: 0.78,
      carPositionPercent: 90,
    },
  ] as const;

  const complianceStates = [
    { id: 'pit', label: 'Pit Refuge', ok: pitRefugeHeight * 1000 >= 500 },
    { id: 'wall', label: 'Wall Clearance', ok: actualWallGap * 1000 <= 150 },
    { id: 'sill', label: 'Landing Sill Gap', ok: sillGap * 1000 <= 35 },
    { id: 'cwt', label: projectType === 'hydraulic' ? 'Hydraulic Service Zone' : 'Car vs Counterweight', ok: carToCwtDistance * 1000 >= 50 },
    { id: 'lighting', label: 'Shaft Lighting', ok: shaftLightingLux >= 200 },
  ];

  return (
    <div className="relative h-[600px] w-full overflow-hidden rounded-sm border border-outline-variant/20 bg-slate-900 shadow-inner">
      <div className="absolute left-4 top-4 z-10 flex max-w-[320px] flex-col gap-3">
        <div className="rounded border border-white/10 bg-black/80 p-4 shadow-xl backdrop-blur-md">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-primary">
              {projectType === 'hydraulic' ? 'Hydraulic Shaft Telemetry' : 'Shaft Telemetry'}
            </h4>
            <div className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-1 text-[9px] font-black uppercase tracking-[0.18em] text-emerald-300">
              {projectType === 'hydraulic' ? 'hydraulic geometry' : 'live geometry'}
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

        <div className="rounded border border-white/10 bg-black/60 p-4 shadow-xl backdrop-blur-md">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-white">Inspection Cutaway</h4>
            <span className="text-[10px] font-mono text-primary">{(frontCutaway * 100).toFixed(0)}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            step={1}
            value={frontCutaway * 100}
            onChange={(e) => setFrontCutaway(Number(e.target.value) / 100)}
            className="w-full accent-orange-500"
          />
            <p className="mt-2 text-[10px] leading-relaxed text-white/45">
              Open the front shell to inspect the pit, cabin exterior, ram and safety zones without changing the camera.
            </p>
            <div className="mt-4 border-t border-white/10 pt-3">
              <div className="mb-2 flex items-center justify-between gap-3">
                <span className="text-[10px] font-bold uppercase text-white/45">Car travel</span>
                <span className="font-mono text-[10px] text-primary">{Math.round(carPos * 100)}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                step={1}
                value={carPos * 100}
                onChange={(e) => onPresetSelect?.({ carPositionPercent: Number(e.target.value) })}
                className="w-full accent-orange-500"
              />
            </div>
          </div>

        <div className="rounded border border-white/10 bg-black/60 p-4 shadow-xl backdrop-blur-md">
          <div className="mb-3 flex items-center gap-2">
            <ShieldCheck size={12} className="text-primary" />
            <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-white">Inspection Presets</h4>
          </div>
          <div className="space-y-2">
            {inspectionPresets.map((preset) => (
              <button
                key={preset.id}
                onClick={() => {
                  setFrontCutaway(preset.cutaway);
                  onPresetSelect?.({ carPositionPercent: preset.carPositionPercent });
                }}
                className="w-full rounded border border-white/10 bg-white/[0.03] p-3 text-left transition-colors hover:border-primary/40 hover:bg-primary/10"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[10px] font-black uppercase tracking-[0.18em] text-white">{preset.label}</span>
                  <span className="text-[9px] font-mono text-primary">{Math.round(preset.cutaway * 100)}%</span>
                </div>
                <p className="mt-2 text-[10px] leading-relaxed text-white/45">{preset.description}</p>
              </button>
            ))}
          </div>
          <p className="mt-3 text-[10px] leading-relaxed text-white/45">
            Presets open the shaft shell here. Cabin travel itself should still be tuned in the geometry controls below.
          </p>
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
        className={`absolute right-4 top-4 z-10 rounded border border-white/10 bg-slate-950/75 shadow-2xl backdrop-blur-md transition-all duration-300 ${
          isInspectorCollapsed ? 'w-16 p-2' : 'w-[300px] p-4'
        } ${hoveredZone ? 'translate-x-0 opacity-100' : 'translate-x-3 opacity-90'}`}
      >
        <div className={`flex items-center ${isInspectorCollapsed ? 'justify-center' : 'justify-between'} gap-3`}>
          {isInspectorCollapsed ? (
            <button
              onClick={() => setIsInspectorCollapsed(false)}
              className="rounded border border-white/10 p-2 text-primary"
              title="Expand clearance inspector"
            >
              <Layers3 size={14} />
            </button>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <Layers3 size={12} className="text-primary" />
                <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-white">Clearance Inspector</h4>
              </div>
              <div className="flex items-center gap-2">
                <div className="rounded-full border border-white/10 px-2 py-1 text-[9px] font-black uppercase tracking-[0.16em] text-white/60">
                  {projectType === 'hydraulic' ? 'Hydraulic shaft' : 'ISO 8100-1'}
                </div>
                <button
                  onClick={() => setIsInspectorCollapsed(true)}
                  className="rounded border border-white/10 p-1.5 text-white/60 transition-colors hover:text-primary"
                  title="Collapse clearance inspector"
                >
                  <Layers3 size={12} />
                </button>
              </div>
            </>
          )}
        </div>
        {!isInspectorCollapsed && (
          <>
            <div className="mt-4 space-y-3">
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
            <div className="mt-4 rounded border border-primary/20 bg-primary/10 p-3">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-primary">Scene coverage</p>
              <p className="mt-2 text-xs leading-relaxed text-white/70">
                Pit buffers, landing doors, machine layout, travelling cable, shaft lighting and inspection stations are now controlled from this scene.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-2 border-t border-white/10 pt-4 text-[10px] text-white/45">
              <ArrowRightLeft size={12} />
              {projectType === 'hydraulic'
                ? 'Hydraulic mode reuses the shaft envelope but tracks service-zone spacing instead of traction-specific counterweight intent.'
                : 'Hover any clearance block in the scene to pin its normative reading.'}
            </div>
          </>
        )}
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
            <ShaftStructure width={w} depth={d} height={h} pitDepth={pD} frontCutaway={frontCutaway} />
            <GuideRails shaftHeight={h} shaftWidth={w} />
            <ElevatorCar width={carWidth} depth={carDepth} height={carHeight} position={[0, carY, carZ]} projectType={projectType} />
            <ShaftLightingRun shaftHeight={h} shaftWidth={w} shaftDepth={d} count={shaftLuminaireCount} lux={shaftLightingLux} />
            <TravellingCableRun shaftHeight={h} carY={carY} carHeight={carHeight} shaftWidth={w} shaftDepth={d} routing={travellingCableRouting} />
            <ControlCabinet shaftWidth={w} shaftDepth={d} shaftHeight={h} location={controlCabinetLocation} />
            <InspectionStations
              shaftWidth={w}
              shaftDepth={d}
              shaftHeight={h}
              roofInspectionStation={roofInspectionStation}
              pitInspectionStation={pitInspectionStation}
              cabinetInspectionEnabled={cabinetInspectionEnabled}
            />
            {projectType === 'electric' ? (
              <>
                <SuspensionRopes shaftHeight={h} carY={carY} shaftWidth={w} carZ={carZ} />
                {driveArrangement === 'machine-room'
                  ? machineRoomPosition !== 'none' && <MachineRoomPod shaftHeight={h} shaftWidth={w} shaftDepth={d} position={machineRoomPosition as 'overhead' | 'adjacent' | 'basement'} />
                  : <MachineDeck shaftHeight={h} shaftWidth={w} shaftDepth={d} />}
              </>
            ) : (
              <>
                <HydraulicRamAssembly shaftHeight={h} carY={carY} carHeight={carHeight} shaftDepth={d} />
                {driveArrangement === 'machine-room' && machineRoomPosition !== 'none' && (
                  <MachineRoomPod shaftHeight={h} shaftWidth={w} shaftDepth={d} position={machineRoomPosition as 'overhead' | 'adjacent' | 'basement'} />
                )}
              </>
            )}
            <LandingMarkers shaftHeight={h} shaftDepth={d} />
            <LandingDoors shaftHeight={h} shaftWidth={w} shaftDepth={d} frontCutaway={frontCutaway} activeLandingIndex={currentLandingIndex} carPositionPercent={carPos * 100} />

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
            <mesh position={[-w * 0.34, -pD + 0.28, -d * 0.3]}>
              <boxGeometry args={[0.22, 0.08, 0.22]} />
              <meshStandardMaterial color="#111827" metalness={0.5} roughness={0.35} />
            </mesh>
            <mesh position={[w * 0.34, -pD + 0.28, -d * 0.3]}>
              <boxGeometry args={[0.22, 0.08, 0.22]} />
              <meshStandardMaterial color="#1e293b" metalness={0.5} roughness={0.35} />
            </mesh>
            <group position={[-w / 2 + 0.12, -pD + 0.75, -d / 2 + 0.05]}>
              <mesh position={[-0.04, 0, 0]}>
                <boxGeometry args={[0.02, 1.5, 0.02]} />
                <meshStandardMaterial color="#cbd5e1" metalness={0.8} roughness={0.18} />
              </mesh>
              <mesh position={[0.04, 0, 0]}>
                <boxGeometry args={[0.02, 1.5, 0.02]} />
                <meshStandardMaterial color="#cbd5e1" metalness={0.8} roughness={0.18} />
              </mesh>
              {Array.from({ length: 6 }).map((_, i) => (
                <mesh key={i} position={[0, -0.62 + i * 0.25, 0]}>
                  <boxGeometry args={[0.12, 0.015, 0.02]} />
                  <meshStandardMaterial color="#94a3b8" metalness={0.75} roughness={0.22} />
                </mesh>
              ))}
            </group>

            {projectType === 'electric' ? (
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
            ) : hydraulicPowerUnitScene && (
              <group position={hydraulicPowerUnitScene.position}>
                <mesh>
                  <boxGeometry args={hydraulicPowerUnitScene.box} />
                  <meshStandardMaterial color="#0f172a" metalness={0.65} roughness={0.24} />
                </mesh>
                <mesh position={[0, hydraulicPowerUnitScene.box[1] / 2 + 0.08, 0]}>
                  <boxGeometry args={[hydraulicPowerUnitScene.box[0] * 0.82, 0.045, hydraulicPowerUnitScene.box[2] * 0.7]} />
                  <meshStandardMaterial color="#f97316" metalness={0.55} roughness={0.24} />
                </mesh>
                <Html position={[0, 0.22, 0]} center>
                  <div className="whitespace-nowrap rounded bg-black/60 px-2 py-0.5 text-[10px] text-orange-300">{hydraulicPowerUnitScene.label}</div>
                </Html>
              </group>
            )}

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
                <group
                  position={[-w / 2 + 0.08, h / 2, d / 2 - 0.08]}
                  onPointerOver={(e) => {
                    e.stopPropagation();
                    setHoveredZone('lighting');
                  }}
                  onPointerOut={() => setHoveredZone(null)}
                >
                  <Box args={[0.16, h, 0.08]}>
                    <meshStandardMaterial color={hoveredZone === 'lighting' ? '#fde68a' : '#facc15'} transparent opacity={hoveredZone === 'lighting' ? 0.3 : 0.16} />
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
        <div className="font-mono text-[8px] uppercase text-white/30">ILATE shaft scene v1.0</div>
      </div>
    </div>
  );
};

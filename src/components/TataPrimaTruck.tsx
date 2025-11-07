import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, RoundedBox, Text } from '@react-three/drei';
import * as THREE from 'three';
import { Group } from "three";

// Interface updated to include 'load'
export interface TataPrimaTruckProps {
  engineOn: boolean;
  rainActive: boolean;
  speed: number;
  load: number;
}

/**
 * Component to render text curved along a circular path.
 */
function TireBranding({
  text,
  radius,
  position,
  rotation
}: {
  text: string,
  radius: number,
  position: [number, number, number],
  rotation: [number, number, number]
}) {
  const letters = text.split('');
  const arc = 1.2; // Total arc in radians (approx 68 degrees)
  const angleStep = arc / (letters.length - 1 || 1);

  return (
    <group position={position} rotation={rotation}>
      {letters.map((char, index) => {
        const angle = -arc / 2 + index * angleStep;
        const x = radius * Math.sin(angle);
        const y = radius * Math.cos(angle);

        return (
          <Text
            key={index}
            position={[x, y, 0]} // Position letter on the arc
            rotation={[0, 0, -angle]} // Rotate letter to be upright
            fontSize={0.08}
            color="white"
            anchorX="center"
            anchorY="middle"
          >
            {char}
          </Text>
        );
      })}
    </group>
  );
}

/**
 * New component for a detailed wheel.
 */
function DetailedWheel({
  wheelRef,
  position,
  side,
  tireWidth = 0.35,
  showBranding = false
}: {
  wheelRef: (el: THREE.Group | null) => void,
  position: [number, number, number],
  side: 'left' | 'right',
  tireWidth: number,
  showBranding?: boolean
}) {
  const brandingPosition: [number, number, number] = [side === 'left' ? -tireWidth / 2 - 0.01 : tireWidth / 2 + 0.01, 0, 0];
  const brandingRotation: [number, number, number] = [0, side === 'left' ? -Math.PI / 2 : Math.PI / 2, 0];
  const holeFacePositionX = side === 'left' ? -tireWidth / 2 : tireWidth / 2;
  const numHoles = 5;
  const holeRingRadius = 0.12;

  return (
    <group ref={wheelRef} position={position} rotation={[0, 0, Math.PI / 2]}>
      {/* 1. The Tire */}
      <mesh castShadow>
        <cylinderGeometry args={[0.4, 0.4, tireWidth, 32]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.7} roughness={0.4} />
      </mesh>

      {/* 2. The Rim */}
      <mesh>
        <cylinderGeometry args={[0.25, 0.25, tireWidth + 0.02, 16]} />
        <meshStandardMaterial color="#C0C0C0" metalness={0.95} roughness={0.05} />
      </mesh>

      {/* 3. The 5 Holes (simulated) */}
      {Array.from({ length: numHoles }).map((_, i) => {
        const angle = (i / numHoles) * Math.PI * 2;
        const y = Math.cos(angle) * holeRingRadius;
        const z = Math.sin(angle) * holeRingRadius;
        return (
          <mesh
            key={i}
            // Position holes on the outer face of the rim
            position={[holeFacePositionX, y, z]}
            rotation={[0, 0, -angle]}
          >
            <cylinderGeometry args={[0.04, 0.04, 0.03, 12]} />
            <meshStandardMaterial color="#111" metalness={0.8} roughness={0.2} />
          </mesh>
        );
      })}

      {/* 4. The Branding (Conditional) */}
      {showBranding && (
        <>
          <TireBranding
            text="MRF"
            radius={0.32}
            position={brandingPosition}
            rotation={brandingRotation}
          />
          <TireBranding
            text="SAVARI LUG"
            radius={0.25}
            position={brandingPosition}
            rotation={brandingRotation}
          />
        </>
      )}
    </group>
  );
}


// TruckModel component updated to accept 'load' prop
const TruckModel = ({ engineOn, speed, rainActive, load }: TataPrimaTruckProps) => {
  const truckRef = useRef<Group>(null);
  // Array to hold all wheel groups
  const wheelsRef = useRef<THREE.Group[]>([]);
  // Refs for the spotlight targets
  const leftTargetRef = useRef<THREE.Object3D>(null);
  const rightTargetRef = useRef<THREE.Object3D>(null);
  // Refs for the new top roof gates
  const leftRoofRef = useRef<THREE.Group>(null);
  const rightRoofRef = useRef<THREE.Group>(null);
  // Ref for the dynamic load mesh
  const loadRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    // Bobbing animation
    if (truckRef.current) {
      truckRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.03;
    }

    // Wheel spin animation
    if (engineOn && speed > 0) {
      wheelsRef.current.forEach((wheel) => {
        if (wheel) {
          // Rotate on the X-axis (the axle)
          wheel.rotation.x += speed * 0.01;
        }
      });
    }

    // Top roof gate animation (for rain protection)
    const targetRoofAngle = rainActive ? 0 : Math.PI / 2; // 0 = closed, 90 deg = open
    const lerpSpeed = 0.05;

    if (leftRoofRef.current) {
      // Left roof opens outwards (positive Z rotation)
      leftRoofRef.current.rotation.z = THREE.MathUtils.lerp(
        leftRoofRef.current.rotation.z,
        targetRoofAngle,
        lerpSpeed
      );
    }
    if (rightRoofRef.current) {
      // Right roof opens outwards (negative Z rotation)
      rightRoofRef.current.rotation.z = THREE.MathUtils.lerp(
        rightRoofRef.current.rotation.z,
        -targetRoofAngle,
        lerpSpeed
      );
    }

    // Load level animation (Cargo Fill)
    if (loadRef.current) {
      const maxLoad = 30; // Max tons from ControlPanel
      // Calculate target vertical scale (0.01 min scale, 1 max scale)
      const targetScaleY = Math.max(0.01, load / maxLoad);
      // Smoothly interpolate to the target scale
      loadRef.current.scale.y = THREE.MathUtils.lerp(
        loadRef.current.scale.y,
        targetScaleY,
        lerpSpeed
      );
    }
  });

  return (
    <group ref={truckRef} position={[0, 0, 0]} castShadow>
      {/* === DETAILED CABIN === */}

      {/* Main Cabin Lower Body - White with rounded edges */}
      <RoundedBox args={[2.2, 1.2, 1.5]} radius={0.08} smoothness={4} position={[0, 0.9, 0.75]} castShadow receiveShadow>
        <meshStandardMaterial color="#f5f5f5" metalness={0.65} roughness={0.35} />
      </RoundedBox>

      {/* Cabin Upper Body - Slightly narrower */}
      <RoundedBox args={[2.15, 0.6, 1.4]} radius={0.06} smoothness={4} position={[0, 1.65, 0.8]} castShadow receiveShadow>
        <meshStandardMaterial color="#f5f5f5" metalness={0.65} roughness={0.35} />
      </RoundedBox>

      {/* Cabin Roof with curve */}
      <RoundedBox args={[2.2, 0.15, 1.55]} radius={0.07} smoothness={4} position={[0, 2.05, 0.8]} castShadow receiveShadow>
        <meshStandardMaterial color="#f0f0f0" metalness={0.6} roughness={0.4} />
      </RoundedBox>

      {/* Sun Visor */}
      <RoundedBox args={[2.25, 0.08, 0.25]} radius={0.03} smoothness={4} position={[0, 2.13, 1.55]} castShadow>
        <meshStandardMaterial color="#e8e8e8" metalness={0.5} roughness={0.5} />
      </RoundedBox>

      {/* === WINDSHIELD - Multi-piece realistic glass === */}
      {/* Main Windshield - Curved */}
      <mesh position={[0, 1.5, 1.5]} rotation={[0.18, 0, 0]} castShadow>
        <boxGeometry args={[1.85, 1.1, 0.05]} />
        <meshStandardMaterial color="#1a2833" metalness={0.95} roughness={0.05} transparent opacity={0.3} />
      </mesh>

      {/* Windshield Frame - Top */}
      <RoundedBox args={[2, 0.08, 0.06]} radius={0.02} smoothness={4} position={[0, 2.05, 1.52]} rotation={[0.18, 0, 0]} castShadow>
        <meshStandardMaterial color="#2c2c2c" metalness={0.8} roughness={0.3} />
      </RoundedBox>

      {/* Windshield Frame - Bottom */}
      <RoundedBox args={[2, 0.08, 0.06]} radius={0.02} smoothness={4} position={[0, 0.95, 1.48]} rotation={[0.18, 0, 0]} castShadow>
        <meshStandardMaterial color="#2c2c2c" metalness={0.8} roughness={0.3} />
      </RoundedBox>

      {/* Windshield Wiper */}
      <mesh position={[-0.4, 1.0, 1.52]} rotation={[0.18, 0, -0.3]} castShadow>
        <boxGeometry args={[0.7, 0.02, 0.02]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* === FRONT BUMPER - Multi-layered === */}
      {/* Lower Bumper */}
      <RoundedBox args={[2.2, 0.25, 0.3]} radius={0.05} smoothness={4} position={[0, 0.3, 1.62]} castShadow receiveShadow>
        <meshStandardMaterial color="#1a1a1a" metalness={0.75} roughness={0.35} />
      </RoundedBox>

      {/* Bumper Step Plate */}
      <RoundedBox args={[2.1, 0.08, 0.15]} radius={0.02} smoothness={4} position={[0, 0.18, 1.7]} castShadow>
        <meshStandardMaterial color="#2c2c2c" metalness={0.85} roughness={0.25} />
      </RoundedBox>

      {/* === DETAILED GRILLE === */}
      {/* Grille Frame */}
      <RoundedBox args={[1.8, 0.7, 0.12]} radius={0.04} smoothness={4} position={[0, 0.75, 1.58]} castShadow>
        <meshStandardMaterial color="#2c2c2c" metalness={0.8} roughness={0.3} />
      </RoundedBox>

      {/* Grille Horizontal Slats */}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <RoundedBox
          key={`grille-slat-${i}`}
          args={[1.7, 0.04, 0.08]}
          radius={0.01}
          smoothness={2}
          position={[0, 0.45 + i * 0.1, 1.61]}
          castShadow
        >
          <meshStandardMaterial color="#1a1a1a" metalness={0.9} roughness={0.2} />
        </RoundedBox>
      ))}

      {/* Tata Logo Badge Position */}
      <mesh position={[0, 1.05, 1.63]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.15, 0.15, 0.04, 32]} />
        <meshStandardMaterial color="#c0c0c0" metalness={0.95} roughness={0.1} />
      </mesh>

      {/* === DETAILED HEADLIGHTS === */}
      {/* Left Headlight Assembly */}
      <group position={[-0.85, 0.65, 1.64]}>
        {/* Headlight Housing */}
        <RoundedBox args={[0.35, 0.28, 0.12]} radius={0.05} smoothness={4} castShadow>
          <meshStandardMaterial color="#1a1a1a" metalness={0.8} roughness={0.3} />
        </RoundedBox>
        {/* Main Beam */}
        <mesh position={[0, 0.05, 0.04]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.08, 0.08, 0.08, 32]} />
          <meshStandardMaterial color="#ffeb3b" emissive="#ffeb3b" emissiveIntensity={engineOn ? 1 : 0} />
        </mesh>
        {/* Low Beam */}
        <mesh position={[0, -0.05, 0.04]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.06, 0.06, 0.08, 32]} />
          <meshStandardMaterial color="#fff8dc" emissive="#fff8dc" emissiveIntensity={engineOn ? 0.8 : 0} />
        </mesh>
        {/* Chrome Ring */}
        <mesh position={[0, 0.05, 0.06]} rotation={[0, 0, Math.PI / 2]}>
          <torusGeometry args={[0.09, 0.01, 16, 32]} />
          <meshStandardMaterial color="#c0c0c0" metalness={0.95} roughness={0.05} />
        </mesh>
      </group>

      {/* Right Headlight Assembly */}
      <group position={[0.85, 0.65, 1.64]}>
        {/* Headlight Housing */}
        <RoundedBox args={[0.35, 0.28, 0.12]} radius={0.05} smoothness={4} castShadow>
          <meshStandardMaterial color="#1a1a1a" metalness={0.8} roughness={0.3} />
        </RoundedBox>
        {/* Main Beam */}
        <mesh position={[0, 0.05, 0.04]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.08, 0.08, 0.08, 32]} />
          <meshStandardMaterial color="#ffeb3b" emissive="#ffeb3b" emissiveIntensity={engineOn ? 1 : 0} />
        </mesh>
        {/* Low Beam */}
        <mesh position={[0, -0.05, 0.04]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.06, 0.06, 0.08, 32]} />
          <meshStandardMaterial color="#fff8dc" emissive="#fff8dc" emissiveIntensity={engineOn ? 0.8 : 0} />
        </mesh>
        {/* Chrome Ring */}
        <mesh position={[0, 0.05, 0.06]} rotation={[0, 0, Math.PI / 2]}>
          <torusGeometry args={[0.09, 0.01, 16, 32]} />
          <meshStandardMaterial color="#c0c0c0" metalness={0.95} roughness={0.05} />
        </mesh>
      </group>

      {/* Turn Signal Indicators */}
      <RoundedBox args={[0.15, 0.1, 0.08]} radius={0.02} smoothness={4} position={[-0.95, 0.5, 1.63]} castShadow>
        <meshStandardMaterial color="#ff9800" emissive="#ff9800" emissiveIntensity={engineOn ? 0.5 : 0} />
      </RoundedBox>
      <RoundedBox args={[0.15, 0.1, 0.08]} radius={0.02} smoothness={4} position={[0.95, 0.5, 1.63]} castShadow>
        <meshStandardMaterial color="#ff9800" emissive="#ff9800" emissiveIntensity={engineOn ? 0.5 : 0} />
      </RoundedBox>

      {/* === DETAILED SIDE MIRRORS === */}
      {/* Left Mirror Assembly */}
      <group position={[-1.15, 1.65, 1]}>
        {/* Mirror Arm */}
        <RoundedBox args={[0.35, 0.06, 0.06]} radius={0.02} smoothness={4} position={[-0.15, 0, 0]} castShadow>
          <meshStandardMaterial color="#1a1a1a" metalness={0.85} roughness={0.25} />
        </RoundedBox>
        {/* Mirror Housing */}
        <RoundedBox args={[0.18, 0.35, 0.12]} radius={0.04} smoothness={4} position={[-0.35, 0, 0]} castShadow>
          <meshStandardMaterial color="#2c2c2c" metalness={0.75} roughness={0.3} />
        </RoundedBox>
        {/* Mirror Glass */}
        <mesh position={[-0.41, 0, 0]} rotation={[0, -0.1, 0]} castShadow>
          <boxGeometry args={[0.02, 0.28, 0.22]} />
          <meshStandardMaterial color="#88ccff" metalness={0.95} roughness={0.05} />
        </mesh>
        {/* Turn Signal on Mirror */}
        <RoundedBox args={[0.08, 0.04, 0.08]} radius={0.01} smoothness={4} position={[-0.35, 0.2, 0]} castShadow>
          <meshStandardMaterial color="#ff9800" emissive="#ff9800" emissiveIntensity={engineOn ? 0.4 : 0} />
        </RoundedBox>
      </group>

      {/* Right Mirror Assembly */}
      <group position={[1.15, 1.65, 1]}>
        {/* Mirror Arm */}
        <RoundedBox args={[0.35, 0.06, 0.06]} radius={0.02} smoothness={4} position={[0.15, 0, 0]} castShadow>
          <meshStandardMaterial color="#1a1a1a" metalness={0.85} roughness={0.25} />
        </RoundedBox>
        {/* Mirror Housing */}
        <RoundedBox args={[0.18, 0.35, 0.12]} radius={0.04} smoothness={4} position={[0.35, 0, 0]} castShadow>
          <meshStandardMaterial color="#2c2c2c" metalness={0.75} roughness={0.3} />
        </RoundedBox>
        {/* Mirror Glass */}
        <mesh position={[0.41, 0, 0]} rotation={[0, 0.1, 0]} castShadow>
          <boxGeometry args={[0.02, 0.28, 0.22]} />
          <meshStandardMaterial color="#88ccff" metalness={0.95} roughness={0.05} />
        </mesh>
        {/* Turn Signal on Mirror */}
        <RoundedBox args={[0.08, 0.04, 0.08]} radius={0.01} smoothness={4} position={[0.35, 0.2, 0]} castShadow>
          <meshStandardMaterial color="#ff9800" emissive="#ff9800" emissiveIntensity={engineOn ? 0.4 : 0} />
        </RoundedBox>
      </group>

      {/* === DETAILED EXHAUST STACKS === */}
      {/* Left Exhaust Stack */}
      <group position={[-0.9, 1.75, 0.5]}>
        <mesh position={[0, 0.4, 0]} castShadow>
          <cylinderGeometry args={[0.09, 0.09, 0.8, 24]} />
          <meshStandardMaterial color="#2c3e50" metalness={0.9} roughness={0.15} />
        </mesh>
        {/* Exhaust Top Cap */}
        <mesh position={[0, 0.82, 0]} castShadow>
          <cylinderGeometry args={[0.11, 0.09, 0.08, 24]} />
          <meshStandardMaterial color="#1a1a1a" metalness={0.85} roughness={0.25} />
        </mesh>
        {/* Chrome Ring */}
        <mesh position={[0, 0.78, 0]}>
          <torusGeometry args={[0.095, 0.008, 16, 32]} />
          <meshStandardMaterial color="#c0c0c0" metalness={0.95} roughness={0.05} />
        </mesh>
      </group>

      {/* Right Exhaust Stack */}
      <group position={[-0.7, 1.75, 0.5]}>
        <mesh position={[0, 0.4, 0]} castShadow>
          <cylinderGeometry args={[0.09, 0.09, 0.8, 24]} />
          <meshStandardMaterial color="#2c3e50" metalness={0.9} roughness={0.15} />
        </mesh>
        {/* Exhaust Top Cap */}
        <mesh position={[0, 0.82, 0]} castShadow>
          <cylinderGeometry args={[0.11, 0.09, 0.08, 24]} />
          <meshStandardMaterial color="#1a1a1a" metalness={0.85} roughness={0.25} />
        </mesh>
        {/* Chrome Ring */}
        <mesh position={[0, 0.78, 0]}>
          <torusGeometry args={[0.095, 0.008, 16, 32]} />
          <meshStandardMaterial color="#c0c0c0" metalness={0.95} roughness={0.05} />
        </mesh>
      </group>

      {/* === CABIN DOORS === */}
      {/* Left Door */}
      <group position={[-1.08, 1.15, 0.6]}>
        <RoundedBox args={[0.08, 1.35, 1]} radius={0.03} smoothness={4} castShadow receiveShadow>
          <meshStandardMaterial color="#f5f5f5" metalness={0.65} roughness={0.35} />
        </RoundedBox>
        {/* Door Window */}
        <mesh position={[-0.02, 0.35, 0.1]} castShadow>
          <boxGeometry args={[0.03, 0.6, 0.6]} />
          <meshStandardMaterial color="#1a2833" metalness={0.95} roughness={0.05} transparent opacity={0.3} />
        </mesh>
        {/* Door Handle */}
        <RoundedBox args={[0.05, 0.03, 0.12]} radius={0.01} smoothness={4} position={[-0.05, -0.1, 0.4]} castShadow>
          <meshStandardMaterial color="#c0c0c0" metalness={0.95} roughness={0.1} />
        </RoundedBox>
      </group>

      {/* Right Door */}
      <group position={[1.08, 1.15, 0.6]}>
        <RoundedBox args={[0.08, 1.35, 1]} radius={0.03} smoothness={4} castShadow receiveShadow>
          <meshStandardMaterial color="#f5f5f5" metalness={0.65} roughness={0.35} />
        </RoundedBox>
        {/* Door Window */}
        <mesh position={[0.02, 0.35, 0.1]} castShadow>
          <boxGeometry args={[0.03, 0.6, 0.6]} />
          <meshStandardMaterial color="#1a2833" metalness={0.95} roughness={0.05} transparent opacity={0.3} />
        </mesh>
        {/* Door Handle */}
        <RoundedBox args={[0.05, 0.03, 0.12]} radius={0.01} smoothness={4} position={[0.05, -0.1, 0.4]} castShadow>
          <meshStandardMaterial color="#c0c0c0" metalness={0.95} roughness={0.1} />
        </RoundedBox>
      </group>

      {/* === SIDE STEPS WITH GRIP === */}
      {/* Left Step */}
      <group position={[-1.15, 0.35, 0.8]}>
        <RoundedBox args={[0.18, 0.08, 1.3]} radius={0.02} smoothness={4} castShadow>
          <meshStandardMaterial color="#1a1a1a" metalness={0.8} roughness={0.35} />
        </RoundedBox>
        {/* Grip Pattern */}
        {[0, 1, 2, 3, 4].map((i) => (
          <mesh key={`grip-left-${i}`} position={[0, 0.05, -0.5 + i * 0.25]}>
            <boxGeometry args={[0.12, 0.02, 0.08]} />
            <meshStandardMaterial color="#2c2c2c" metalness={0.7} roughness={0.5} />
          </mesh>
        ))}
      </group>

      {/* Right Step */}
      <group position={[1.15, 0.35, 0.8]}>
        <RoundedBox args={[0.18, 0.08, 1.3]} radius={0.02} smoothness={4} castShadow>
          <meshStandardMaterial color="#1a1a1a" metalness={0.8} roughness={0.35} />
        </RoundedBox>
        {/* Grip Pattern */}
        {[0, 1, 2, 3, 4].map((i) => (
          <mesh key={`grip-right-${i}`} position={[0, 0.05, -0.5 + i * 0.25]}>
            <boxGeometry args={[0.12, 0.02, 0.08]} />
            <meshStandardMaterial color="#2c2c2c" metalness={0.7} roughness={0.5} />
          </mesh>
        ))}
      </group>

      {/* Antenna */}
      <mesh position={[0.6, 2.15, 0.6]} castShadow>
        <cylinderGeometry args={[0.015, 0.015, 0.4, 16]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* === CHASSIS === */}
      <mesh position={[0, 0.5, -0.5]} castShadow receiveShadow>
        <boxGeometry args={[0.4, 0.15, 4]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.9} roughness={0.3} />
      </mesh>

      {/* === FIFTH WHEEL (Connection point) === */}
      <mesh position={[0, 0.65, -0.3]} castShadow>
        <cylinderGeometry args={[0.35, 0.35, 0.1, 32]} />
        <meshStandardMaterial color="#2c3e50" metalness={0.85} roughness={0.25} />
      </mesh>

      {/* === SEMI-TRAILER (HOLLOW BOX) === */}

      {/* Trailer Frame / Base */}
      <mesh position={[0, 0.45, -3.5]} castShadow receiveShadow>
        <boxGeometry args={[2.3, 0.2, 6]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.9} roughness={0.3} />
      </mesh>

      {/* Container Floor (sits on top of frame) */}
      <mesh position={[0, 0.575, -3.5]} castShadow receiveShadow>
        <boxGeometry args={[2.25, 0.05, 6]} />
        <meshStandardMaterial color="#a06b4a" metalness={0.4} roughness={0.6} />
      </mesh>

      {/* Container Front Wall */}
      <mesh position={[0, 1.9, -0.525]} castShadow receiveShadow>
        <boxGeometry args={[2.25, 2.7, 0.05]} />
        <meshStandardMaterial color="#8b5e3c" metalness={0.5} roughness={0.6} />
      </mesh>

      {/* Container Back Wall */}
      <mesh position={[0, 1.9, -6.475]} castShadow receiveShadow>
        <boxGeometry args={[2.25, 2.7, 0.05]} />
        <meshStandardMaterial color="#8b5e3c" metalness={0.5} roughness={0.6} />
      </mesh>

      {/* Container Left Wall */}
      <mesh position={[-1.15, 1.9, -3.5]} castShadow receiveShadow>
        <boxGeometry args={[0.05, 2.7, 6]} />
        <meshStandardMaterial color="#8b5e3c" metalness={0.5} roughness={0.6} />
      </mesh>

      {/* Container Right Wall */}
      <mesh position={[1.15, 1.9, -3.5]} castShadow receiveShadow>
        <boxGeometry args={[0.05, 2.7, 6]} />
        <meshStandardMaterial color="#8b5e3c" metalness={0.5} roughness={0.6} />
      </mesh>

      {/* DYNAMIC CARGO LOAD MESH (Centered at 0.6 + 2.6/2 = 1.9) */}
      {/* The geometry height is 2.6 (container internal height) */}
      <mesh ref={loadRef} position={[0, 1.9, -3.5]} scale={[1, 0.01, 1]} castShadow>
        <boxGeometry args={[2.2, 2.6, 5.9]} />
        <meshStandardMaterial color="#6B4226" metalness={0.1} roughness={0.8} />
      </mesh>


      {/* === TOP GATES (Hinged to side walls) === */}
      {/* Left Roof Panel */}
      <group ref={leftRoofRef} position={[-1.15, 3.25, -3.5]}>
        <mesh position={[1.15 / 2, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.15, 0.05, 6]} />
          <meshStandardMaterial color="#8b5e3c" metalness={0.5} roughness={0.5} />
        </mesh>
      </group>
      {/* Right Roof Panel */}
      <group ref={rightRoofRef} position={[1.15, 3.25, -3.5]}>
        <mesh position={[-1.15 / 2, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.15, 0.05, 6]} />
          <meshStandardMaterial color="#8b5e3c" metalness={0.5} roughness={0.5} />
        </mesh>
      </group>


      {/* === WHEELS === */}
      {/* Left Front Wheel */}
      <DetailedWheel
        wheelRef={(el) => { if (el) wheelsRef.current[0] = el; }}
        position={[-1.15, 0.4, 1.2]}
        side="left"
        tireWidth={0.35}
        showBranding={true}
      />
      {/* Right Front Wheel */}
      <DetailedWheel
        wheelRef={(el) => { if (el) wheelsRef.current[1] = el; }}
        position={[1.15, 0.4, 1.2]}
        side="right"
        tireWidth={0.35}
        showBranding={true}
      />

      {/* Left Rear Cabin - Outer */}
      <DetailedWheel
        wheelRef={(el) => { if (el) wheelsRef.current[2] = el; }}
        position={[-1.25, 0.4, -0.8]}
        side="left"
        tireWidth={0.25}
        showBranding={true}
      />
      {/* Left Rear Cabin - Inner */}
      <DetailedWheel
        wheelRef={(el) => { if (el) wheelsRef.current[3] = el; }}
        position={[-0.95, 0.4, -0.8]}
        side="left"
        tireWidth={0.25}
      />
      {/* Right Rear Cabin - Inner */}
      <DetailedWheel
        wheelRef={(el) => { if (el) wheelsRef.current[4] = el; }}
        position={[0.95, 0.4, -0.8]}
        side="right"
        tireWidth={0.25}
      />
      {/* Right Rear Cabin - Outer */}
      <DetailedWheel
        wheelRef={(el) => { if (el) wheelsRef.current[5] = el; }}
        position={[1.25, 0.4, -0.8]}
        side="right"
        tireWidth={0.25}
        showBranding={true}
      />

      {/* Trailer Wheels - First Axle */}
      {/* Left - Outer */}
      <DetailedWheel
        wheelRef={(el) => { if (el) wheelsRef.current[6] = el; }}
        position={[-1.25, 0.4, -4.5]}
        side="left"
        tireWidth={0.25}
        showBranding={true}
      />
      {/* Left - Inner */}
      <DetailedWheel
        wheelRef={(el) => { if (el) wheelsRef.current[7] = el; }}
        position={[-0.95, 0.4, -4.5]}
        side="left"
        tireWidth={0.25}
      />
      {/* Right - Inner */}
      <DetailedWheel
        wheelRef={(el) => { if (el) wheelsRef.current[8] = el; }}
        position={[0.95, 0.4, -4.5]}
        side="right"
        tireWidth={0.25}
      />
      {/* Right - Outer */}
      <DetailedWheel
        wheelRef={(el) => { if (el) wheelsRef.current[9] = el; }}
        position={[1.25, 0.4, -4.5]}
        side="right"
        tireWidth={0.25}
        showBranding={true}
      />

      {/* Trailer Wheels - Second Axle */}
      {/* Left - Outer */}
      <DetailedWheel
        wheelRef={(el) => { if (el) wheelsRef.current[10] = el; }}
        position={[-1.25, 0.4, -5.5]}
        side="left"
        tireWidth={0.25}
        showBranding={true}
      />
      {/* Left - Inner */}
      <DetailedWheel
        wheelRef={(el) => { if (el) wheelsRef.current[11] = el; }}
        position={[-0.95, 0.4, -5.5]}
        side="left"
        tireWidth={0.25}
      />
      {/* Right - Inner */}
      <DetailedWheel
        wheelRef={(el) => { if (el) wheelsRef.current[12] = el; }}
        position={[0.95, 0.4, -5.5]}
        side="right"
        tireWidth={0.25}
      />
      {/* Right - Outer */}
      <DetailedWheel
        wheelRef={(el) => { if (el) wheelsRef.current[13] = el; }}
        position={[1.25, 0.4, -5.5]}
        side="right"
        tireWidth={0.25}
        showBranding={true}
      />

      {/* Rear Lights */}
      <mesh position={[-0.9, 0.8, -6.5]} castShadow>
        <boxGeometry args={[0.25, 0.15, 0.08]} />
        <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={engineOn ? 0.6 : 0} />
      </mesh>
      <mesh position={[0.9, 0.8, -6.5]} castShadow>
        <boxGeometry args={[0.25, 0.15, 0.08]} />
        <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={engineOn ? 0.6 : 0} />
      </mesh>

      {/* Define the targets for the spotlights */}
      <object3D ref={leftTargetRef} position={[-2, 0, 8]} />
      <object3D ref={rightTargetRef} position={[2, 0, 8]} />

      {/* Ground plane with reflection (from original file) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial
          color="#444444"
          metalness={0.2}
          roughness={0.8}
        />
      </mesh>

      {/* Headlight beams when engine is on (from original file) */}
      {engineOn && leftTargetRef.current && rightTargetRef.current && (
        <>
          <spotLight
            // Position adjusted to match new headlight model
            position={[-0.85, 0.7, 1.7]}
            angle={0.6}
            penumbra={0.5}
            intensity={2}
            color="#FFFFCC"
            target={leftTargetRef.current}
          />
          <spotLight
            // Position adjusted to match new headlight model
            position={[0.85, 0.7, 1.7]}
            angle={0.6}
            penumbra={0.5}
            intensity={2}
            color="#FFFFCC"
            target={rightTargetRef.current}
          />
        </>
      )}
    </group>
  );
};

// RainParticles remains the same
function RainParticles({ active }: { active: boolean }) {
  const particlesRef = useRef<THREE.Points>(null);

  useFrame((state) => {
    if (particlesRef.current && active) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.05;
      const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;

      for (let i = 0; i < positions.length; i += 3) {
        positions[i + 1] -= 0.1;
        if (positions[i + 1] < 0) {
          positions[i + 1] = 10;
        }
      }

      particlesRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  if (!active) return null;

  const count = 1000;
  const positions = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 20;
    positions[i * 3 + 1] = Math.random() * 10;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
  }

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.05} color="#00BFFF" transparent opacity={0.6} />
    </points>
  );
}

// Main component export remains the same
export function TataPrimaTruck(props: TataPrimaTruckProps) {
  return (
    <div className="w-full h-full">
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[5, 3, 8]} fov={50} />
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={5}
          maxDistance={20}
          maxPolarAngle={Math.PI / 2}
        />

        {/* Lighting */}
        <ambientLight intensity={1.0} />
        <directionalLight
          position={[10, 15, 10]}
          intensity={1.5}
          castShadow
          shadow-mapSize-width={4096}
          shadow-mapSize-height={4096}
          shadow-camera-far={50}
          shadow-camera-left={-20}
          shadow-camera-right={20}
          shadow-camera-top={20}
          shadow-camera-bottom={-20}
        />
        <directionalLight
          position={[-10, 10, -5]}
          intensity={0.8}
          color="#4a90e2"
        />
        <spotLight
          position={[0, 20, 0]}
          angle={0.3}
          penumbra={1}
          intensity={0.5}
          castShadow
        />
        <hemisphereLight intensity={1.0} groundColor="#0a0f18" color="#ffffff" />

        {/* Pass all props to the new TruckModel */}
        <TruckModel {...props} />

        {/* Pass the rainActive prop to RainParticles */}
        <RainParticles active={props.rainActive} />

        {/* Grid helper */}
        <gridHelper args={[50, 50, '#888888', '#444444']} position={[0, 0.01, 0]} />
      </Canvas>
    </div>
  );
}
import { useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';

interface TataPrimaTruckProps {
  engineOn: boolean;
  rainActive: boolean;
  speed: number;
}

function TruckModel({ engineOn, rainActive, speed }: TataPrimaTruckProps) {
  const groupRef = useRef<THREE.Group>(null);
  const wheelsRef = useRef<THREE.Group[]>([]);
  const tarpaulinRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    // Rotate wheels when moving
    if (engineOn && speed > 0) {
      wheelsRef.current.forEach((wheel) => {
        if (wheel) {
          wheel.rotation.x += speed * 0.01;
        }
      });
    }

    // Smooth tarpaulin deployment animation
    if (tarpaulinRef.current) {
      const targetY = rainActive ? 1.4 : 2.5; // Deploy down to 1.4, retract up to 2.5
      const currentY = tarpaulinRef.current.position.y;
      const lerpSpeed = 0.05;
      tarpaulinRef.current.position.y += (targetY - currentY) * lerpSpeed;
      
      // Add gentle wave effect when deployed
      if (rainActive && Math.abs(currentY - 1.4) < 0.1) {
        tarpaulinRef.current.position.y += Math.sin(state.clock.elapsedTime * 2) * 0.02;
      }
    }
  });

  // Cabin body with rounded edges
  const CabinBody = () => (
    <group>
      {/* Main cabin body */}
      <mesh position={[0, 1.2, 0]}>
        <boxGeometry args={[2.2, 2, 3]} />
        <meshStandardMaterial 
          color="#E8EEF2" 
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      {/* Cabin roof */}
      <mesh position={[0, 2.4, -0.2]} rotation={[-0.1, 0, 0]}>
        <boxGeometry args={[2.2, 0.3, 2.6]} />
        <meshStandardMaterial color="#E8EEF2" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Sun visor */}
      <mesh position={[0, 2.5, 1.2]}>
        <boxGeometry args={[2.2, 0.1, 0.4]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>

      {/* Windshield */}
      <mesh position={[0, 1.5, 1.48]}>
        <boxGeometry args={[2, 1.2, 0.05]} />
        <meshStandardMaterial 
          color="#00BFFF" 
          transparent 
          opacity={0.6}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>

      {/* Side windows */}
      <mesh position={[-1.1, 1.5, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[2.5, 1, 0.05]} />
        <meshStandardMaterial color="#00BFFF" transparent opacity={0.5} />
      </mesh>
      <mesh position={[1.1, 1.5, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[2.5, 1, 0.05]} />
        <meshStandardMaterial color="#00BFFF" transparent opacity={0.5} />
      </mesh>
    </group>
  );

  // Front grille with detailed slats
  const FrontGrille = () => (
    <group position={[0, 0.9, 1.6]}>
      {/* Grille frame */}
      <mesh>
        <boxGeometry args={[1.8, 0.8, 0.1]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.9} />
      </mesh>
      
      {/* Chrome slats */}
      {[...Array(6)].map((_, i) => (
        <mesh key={i} position={[0, 0.3 - i * 0.12, 0.05]}>
          <boxGeometry args={[1.6, 0.08, 0.02]} />
          <meshStandardMaterial color="#C0C0C0" metalness={1} roughness={0.1} />
        </mesh>
      ))}

      {/* TATA badge */}
      <mesh position={[0, 0, 0.1]}>
        <boxGeometry args={[0.4, 0.15, 0.05]} />
        <meshStandardMaterial color="#00BFFF" emissive="#00BFFF" emissiveIntensity={engineOn ? 0.5 : 0} />
      </mesh>
    </group>
  );

  // Realistic headlights
  const Headlights = () => (
    <group>
      {/* Left headlight */}
      <group position={[-0.7, 0.9, 1.55]}>
        <mesh>
          <cylinderGeometry args={[0.15, 0.15, 0.1, 16]} />
          <meshStandardMaterial 
            color={engineOn ? "#FFFFCC" : "#CCCCCC"} 
            emissive={engineOn ? "#FFFF00" : "#000000"}
            emissiveIntensity={engineOn ? 0.8 : 0}
          />
        </mesh>
        <mesh position={[0, 0, 0.05]}>
          <cylinderGeometry args={[0.18, 0.18, 0.05, 16]} />
          <meshStandardMaterial color="#C0C0C0" metalness={1} />
        </mesh>
      </group>

      {/* Right headlight */}
      <group position={[0.7, 0.9, 1.55]}>
        <mesh>
          <cylinderGeometry args={[0.15, 0.15, 0.1, 16]} />
          <meshStandardMaterial 
            color={engineOn ? "#FFFFCC" : "#CCCCCC"} 
            emissive={engineOn ? "#FFFF00" : "#000000"}
            emissiveIntensity={engineOn ? 0.8 : 0}
          />
        </mesh>
        <mesh position={[0, 0, 0.05]}>
          <cylinderGeometry args={[0.18, 0.18, 0.05, 16]} />
          <meshStandardMaterial color="#C0C0C0" metalness={1} />
        </mesh>
      </group>

      {/* Turn signals */}
      <mesh position={[-0.9, 0.9, 1.5]}>
        <boxGeometry args={[0.12, 0.12, 0.08]} />
        <meshStandardMaterial color="#FFBF00" emissive={engineOn ? "#FFBF00" : "#000000"} emissiveIntensity={0.3} />
      </mesh>
      <mesh position={[0.9, 0.9, 1.5]}>
        <boxGeometry args={[0.12, 0.12, 0.08]} />
        <meshStandardMaterial color="#FFBF00" emissive={engineOn ? "#FFBF00" : "#000000"} emissiveIntensity={0.3} />
      </mesh>
    </group>
  );

  // Side mirrors with details
  const Mirrors = () => (
    <group>
      {/* Left mirror */}
      <group position={[-1.2, 1.8, 1]}>
        <mesh rotation={[0, -0.3, 0]}>
          <boxGeometry args={[0.15, 0.25, 0.08]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
        <mesh position={[-0.1, 0, 0]} rotation={[0, -0.3, 0]}>
          <boxGeometry args={[0.3, 0.25, 0.05]} />
          <meshStandardMaterial color="#00BFFF" transparent opacity={0.7} metalness={0.9} />
        </mesh>
        {/* Turn signal on mirror */}
        <mesh position={[-0.15, -0.15, 0]}>
          <boxGeometry args={[0.08, 0.05, 0.05]} />
          <meshStandardMaterial color="#FFBF00" />
        </mesh>
      </group>

      {/* Right mirror */}
      <group position={[1.2, 1.8, 1]}>
        <mesh rotation={[0, 0.3, 0]}>
          <boxGeometry args={[0.15, 0.25, 0.08]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
        <mesh position={[0.1, 0, 0]} rotation={[0, 0.3, 0]}>
          <boxGeometry args={[0.3, 0.25, 0.05]} />
          <meshStandardMaterial color="#00BFFF" transparent opacity={0.7} metalness={0.9} />
        </mesh>
        <mesh position={[0.15, -0.15, 0]}>
          <boxGeometry args={[0.08, 0.05, 0.05]} />
          <meshStandardMaterial color="#FFBF00" />
        </mesh>
      </group>
    </group>
  );

  // Bumper with details
  const Bumper = () => (
    <group position={[0, 0.3, 1.7]}>
      {/* Main bumper */}
      <mesh>
        <boxGeometry args={[2.4, 0.3, 0.2]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.7} />
      </mesh>
      {/* Step plate */}
      <mesh position={[0, -0.2, 0]}>
        <boxGeometry args={[2.4, 0.05, 0.25]} />
        <meshStandardMaterial color="#C0C0C0" metalness={0.9} />
      </mesh>
    </group>
  );

  // Exhaust stacks
  const ExhaustStacks = () => (
    <group>
      {/* Left exhaust */}
      <group position={[-0.9, 2.3, -0.5]}>
        <mesh rotation={[0, 0, 0]}>
          <cylinderGeometry args={[0.08, 0.08, 1, 16]} />
          <meshStandardMaterial color="#1a1a1a" metalness={0.8} />
        </mesh>
        <mesh position={[0, 0.5, 0]}>
          <cylinderGeometry args={[0.1, 0.08, 0.1, 16]} />
          <meshStandardMaterial color="#C0C0C0" metalness={1} />
        </mesh>
      </group>

      {/* Right exhaust */}
      <group position={[0.9, 2.3, -0.5]}>
        <mesh rotation={[0, 0, 0]}>
          <cylinderGeometry args={[0.08, 0.08, 1, 16]} />
          <meshStandardMaterial color="#1a1a1a" metalness={0.8} />
        </mesh>
        <mesh position={[0, 0.5, 0]}>
          <cylinderGeometry args={[0.1, 0.08, 0.1, 16]} />
          <meshStandardMaterial color="#C0C0C0" metalness={1} />
        </mesh>
      </group>
    </group>
  );

  // Wheels
  const Wheels = () => {
    const wheels: JSX.Element[] = [];
    const positions: [number, number, number][] = [
      [-0.9, 0.4, 1.2],   // Front left
      [0.9, 0.4, 1.2],    // Front right
      [-0.9, 0.4, -1.2],  // Rear left
      [0.9, 0.4, -1.2],   // Rear right
    ];

    positions.forEach((pos, i) => {
      wheels.push(
        <group 
          key={i} 
          position={pos} 
          rotation={[0, 0, Math.PI / 2]}
          ref={(el) => { if (el) wheelsRef.current[i] = el; }}
        >
          {/* Tire */}
          <mesh>
            <cylinderGeometry args={[0.4, 0.4, 0.3, 32]} />
            <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
          </mesh>
          {/* Rim */}
          <mesh>
            <cylinderGeometry args={[0.25, 0.25, 0.32, 6]} />
            <meshStandardMaterial color="#C0C0C0" metalness={1} />
          </mesh>
        </group>
      );
    });

    return <>{wheels}</>;
  };

  // Cargo section
  const CargoSection = () => (
    <group position={[0, 1.5, -3.5]}>
      {/* Cargo bed */}
      <mesh position={[0, -0.3, 0]}>
        <boxGeometry args={[2.2, 0.2, 4]} />
        <meshStandardMaterial color="#4a4a4a" metalness={0.7} />
      </mesh>

      {/* Side walls */}
      <mesh position={[-1.1, 0.5, 0]}>
        <boxGeometry args={[0.05, 1.8, 4]} />
        <meshStandardMaterial color="#E8EEF2" metalness={0.6} />
      </mesh>
      <mesh position={[1.1, 0.5, 0]}>
        <boxGeometry args={[0.05, 1.8, 4]} />
        <meshStandardMaterial color="#E8EEF2" metalness={0.6} />
      </mesh>

      {/* Back wall */}
      <mesh position={[0, 0.5, -2]}>
        <boxGeometry args={[2.2, 1.8, 0.05]} />
        <meshStandardMaterial color="#E8EEF2" metalness={0.6} />
      </mesh>

      {/* Tarpaulin cover - Always visible but starts retracted */}
      <mesh 
        ref={tarpaulinRef} 
        position={[0, 2.5, 0]}
      >
        <boxGeometry args={[2.2, 0.05, 4]} />
        <meshStandardMaterial 
          color="#2a5a7a" 
          side={THREE.DoubleSide}
          transparent
          opacity={0.85}
        />
      </mesh>

      {/* Support bars */}
      {[-1, 0, 1].map((z) => (
        <mesh key={z} position={[0, 1.3, z * 1.3]}>
          <cylinderGeometry args={[0.03, 0.03, 1.8, 8]} />
          <meshStandardMaterial color="#C0C0C0" metalness={0.9} />
        </mesh>
      ))}
    </group>
  );

  // Chassis
  const Chassis = () => (
    <group>
      {/* Main chassis */}
      <mesh position={[0, 0.5, -1]}>
        <boxGeometry args={[0.4, 0.3, 6]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.8} />
      </mesh>
      
      {/* Fuel tank */}
      <mesh position={[-0.7, 0.5, -1]}>
        <boxGeometry args={[0.4, 0.6, 1.2]} />
        <meshStandardMaterial color="#E8EEF2" metalness={0.7} />
      </mesh>
    </group>
  );

  return (
    <group ref={groupRef}>
      <CabinBody />
      <FrontGrille />
      <Headlights />
      <Mirrors />
      <Bumper />
      <ExhaustStacks />
      <Wheels />
      <CargoSection />
      <Chassis />

      {/* Ground plane with reflection */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial 
          color="#0a0f18" 
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      {/* Headlight beams when engine is on */}
      {engineOn && (
        <>
          <spotLight
            position={[-0.7, 0.9, 1.6]}
            angle={0.6}
            penumbra={0.5}
            intensity={2}
            color="#FFFFCC"
            target-position={[-2, 0, 8]}
          />
          <spotLight
            position={[0.7, 0.9, 1.6]}
            angle={0.6}
            penumbra={0.5}
            intensity={2}
            color="#FFFFCC"
            target-position={[2, 0, 8]}
          />
        </>
      )}
    </group>
  );
}

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
        <ambientLight intensity={0.4} />
        <directionalLight 
          position={[10, 10, 5]} 
          intensity={1} 
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <hemisphereLight intensity={0.3} groundColor="#0a0f18" />
        
        <TruckModel {...props} />
        <RainParticles active={props.rainActive} />
        
        {/* Grid floor */}
        <gridHelper args={[50, 50, '#1a3a4a', '#0a1a2a']} position={[0, 0.01, 0]} />
      </Canvas>
    </div>
  );
}

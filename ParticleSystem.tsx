import React, { useMemo, useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '../store';

const COUNT = 8000;

// Helper to generate points on a sphere
const getSpherePoints = (count: number, radius: number) => {
  const points = [];
  for (let i = 0; i < count; i++) {
    const phi = Math.acos(-1 + (2 * i) / count);
    const theta = Math.sqrt(count * Math.PI) * phi;
    points.push(
      radius * Math.cos(theta) * Math.sin(phi),
      radius * Math.sin(theta) * Math.sin(phi),
      radius * Math.cos(phi)
    );
  }
  return points;
};

const getHeartPoints = (count: number) => {
  const points = [];
  for (let i = 0; i < count; i++) {
    const t = Math.random() * Math.PI * 2;
    // Heart formula
    const x = 16 * Math.pow(Math.sin(t), 3);
    const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
    const scale = 0.15;
    
    // Add some volume/depth
    const z = (Math.random() - 0.5) * 4;
    
    points.push(x * scale, y * scale, z);
  }
  return points;
};

const getFlowerPoints = (count: number) => {
  const points = [];
  for (let i = 0; i < count; i++) {
    const theta = Math.random() * Math.PI * 2;
    const r = Math.sin(5 * theta) + 2; // Flower shape
    const height = (Math.random() - 0.5) * 1;
    
    const x = r * Math.cos(theta);
    const z = r * Math.sin(theta);
    const y = height + Math.cos(r * 5) * 0.5; // wavy petals
    
    points.push(x, y, z);
  }
  return points;
};

const getSaturnPoints = (count: number) => {
  const points = [];
  const sphereCount = Math.floor(count * 0.4);
  const ringCount = count - sphereCount;
  
  // Planet
  const sphere = getSpherePoints(sphereCount, 1.5);
  points.push(...sphere);
  
  // Ring
  for (let i = 0; i < ringCount; i++) {
    const angle = Math.random() * Math.PI * 2;
    const dist = 2.2 + Math.random() * 1.5;
    const x = Math.cos(angle) * dist;
    const z = Math.sin(angle) * dist;
    const y = (Math.random() - 0.5) * 0.1;
    points.push(x, y, z);
  }
  return points;
};

const getBuddhaPoints = (count: number) => {
  // Rough approximation using spheres
  const points = [];
  
  // Head
  const headCount = Math.floor(count * 0.15);
  const head = getSpherePoints(headCount, 0.6);
  head.forEach((p, i) => {
    if (i % 3 === 0) points.push(p + 0, p + 1.8, p); // x, y+offset, z
    else if (i % 3 === 1) points.push(p + 0, head[i] + 1.8, head[i+1]); // fix indexing
    else points.push(head[i-2], head[i-1] + 1.8, head[i]);
  });
  // Simple push loop
  for(let i=0; i<head.length; i+=3) {
      points.push(head[i], head[i+1] + 1.8, head[i+2]);
  }
  
  // Body
  const bodyCount = Math.floor(count * 0.35);
  // Ellipsoid
  for (let i = 0; i < bodyCount; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * Math.PI;
    const r = 1.1;
    points.push(
      r * Math.cos(theta) * Math.sin(phi) * 0.9,
      r * Math.cos(phi) * 1.2 + 0.5, // shift up
      r * Math.sin(theta) * Math.sin(phi) * 0.8
    );
  }

  // Base/Legs (Flat ellipsoid)
  const baseCount = count - headCount - bodyCount;
  for (let i = 0; i < baseCount; i++) {
     const theta = Math.random() * Math.PI * 2;
     const r = Math.random() * 2.0;
     const y = (Math.random() * 0.8) - 0.8;
     points.push(
         r * Math.cos(theta),
         y,
         r * Math.sin(theta)
     );
  }

  return points;
};

const getFireworksPoints = (count: number) => {
   // Just a sphere but we will handle the "explosion" via the tension/scale mechanic
   // Actually, fireworks usually look like trails.
   // Let's make a dense sphere that explodes outward.
   return getSpherePoints(count, 0.2);
};

const ParticleSystem: React.FC = () => {
  const { currentTemplate, particleColor, handTension } = useStore();
  const pointsRef = useRef<THREE.Points>(null);
  
  // Store target positions
  const targetPositions = useMemo(() => {
    return new Float32Array(COUNT * 3);
  }, []);

  // Initialize current positions
  const currentPositions = useMemo(() => {
     return new Float32Array(COUNT * 3);
  }, []);

  // Generate target shapes based on template
  useEffect(() => {
    let pts: number[] = [];
    switch (currentTemplate) {
      case 'heart':
        pts = getHeartPoints(COUNT);
        break;
      case 'flower':
        pts = getFlowerPoints(COUNT);
        break;
      case 'saturn':
        pts = getSaturnPoints(COUNT);
        break;
      case 'buddha':
        pts = getBuddhaPoints(COUNT);
        break;
      case 'fireworks':
        pts = getFireworksPoints(COUNT);
        break;
      default:
        pts = getSpherePoints(COUNT, 2);
    }
    
    // Fill target array
    for (let i = 0; i < COUNT * 3; i++) {
      targetPositions[i] = pts[i] || 0;
    }
  }, [currentTemplate, targetPositions]);

  useFrame((state, delta) => {
    if (!pointsRef.current) return;

    const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;
    const damp = 3 * delta;

    // Expand based on hand tension
    // Tension 0 -> scale 1.0
    // Tension 1 -> scale 2.0 (Expansion)
    const expansionFactor = 1 + handTension * 2.0;
    
    // Fireworks special behavior: extreme expansion
    const isFireworks = currentTemplate === 'fireworks';
    const activeExpansion = isFireworks ? (0.5 + handTension * 8) : expansionFactor;

    for (let i = 0; i < COUNT; i++) {
      const ix = i * 3;
      const iy = i * 3 + 1;
      const iz = i * 3 + 2;

      // Lerp towards target
      // We store the "base" shape in targetPositions
      // But we render the "expanded" shape
      
      const tx = targetPositions[ix] * activeExpansion;
      const ty = targetPositions[iy] * activeExpansion;
      const tz = targetPositions[iz] * activeExpansion;

      // Current pos lerp
      positions[ix] += (tx - positions[ix]) * damp;
      positions[iy] += (ty - positions[iy]) * damp;
      positions[iz] += (tz - positions[iz]) * damp;
      
      // Add some noise/movement
      const time = state.clock.getElapsedTime();
      positions[ix] += Math.sin(time + positions[iy]) * 0.005;
      positions[iy] += Math.cos(time + positions[ix]) * 0.005;
    }

    pointsRef.current.geometry.attributes.position.needsUpdate = true;
    
    // Rotate the whole system slowly
    pointsRef.current.rotation.y += delta * 0.1;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={COUNT}
          array={currentPositions}
          itemSize={3}
          args={[currentPositions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        color={particleColor}
        sizeAttenuation={true}
        transparent={true}
        opacity={0.8}
        blending={THREE.AdditiveBlending}
        toneMapped={false}
      />
    </points>
  );
};

export default ParticleSystem;

import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import ParticleSystem from './components/ParticleSystem';
import HandTracker from './components/HandTracker';
import UI from './components/UI';

export function App() {
  return (
    <div className="relative h-screen w-screen overflow-hidden bg-black">
      <Suspense fallback={<div className="flex h-full items-center justify-center text-white">Loading...</div>}>
        <Canvas camera={{ position: [0, 0, 5], fov: 60 }}>
          <color attach="background" args={['#050505']} />
          <ambientLight intensity={0.5} />
          
          <ParticleSystem />
          
          <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
          
          <OrbitControls 
            enableZoom={true} 
            enablePan={false} 
            autoRotate 
            autoRotateSpeed={0.5}
            maxDistance={10}
            minDistance={2}
          />
          
          <EffectComposer>
            <Bloom luminanceThreshold={0.2} luminanceSmoothing={0.9} height={300} intensity={1.5} />
          </EffectComposer>
        </Canvas>
      </Suspense>
      
      <HandTracker />
      <UI />
    </div>
  );
}

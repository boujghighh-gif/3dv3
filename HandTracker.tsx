import React, { useEffect, useRef, useState } from 'react';
import { Hands, Results } from '@mediapipe/hands';
import { Camera } from '@mediapipe/camera_utils';
import { useStore } from '../store';

const HandTracker: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { setHandTension, setHandDetected } = useStore();
  const [cameraError, setCameraError] = useState<string | null>(null);

  useEffect(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    
    const hands = new Hands({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
      },
    });

    hands.setOptions({
      maxNumHands: 2,
      modelComplexity: 1,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    hands.onResults(onResults);

    let camera: Camera | null = null;
    
    try {
        camera = new Camera(video, {
        onFrame: async () => {
          if (videoRef.current) {
            await hands.send({ image: videoRef.current });
          }
        },
        width: 640,
        height: 480,
      });
      camera.start().catch(err => {
        console.error("Camera start error:", err);
        setCameraError("Could not access camera. Please allow camera permissions.");
      });
    } catch (error) {
       console.error("Camera setup error:", error);
       setCameraError("Camera initialization failed.");
    }

    return () => {
      // Cleanup if needed (Camera class doesn't have a stop method that is easily accessible in all versions but we can try)
      // hands.close(); 
    };
  }, []);

  const onResults = (results: Results) => {
    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
      setHandDetected(true);
      
      // Calculate tension
      // We will define tension as the inverse of how open the hand is.
      // We check distance from fingertips to wrist (landmark 0)
      
      let totalTension = 0;

      for (const landmarks of results.multiHandLandmarks) {
        const wrist = landmarks[0];
        
        // Fingertips: 4 (Thumb), 8 (Index), 12 (Middle), 16 (Ring), 20 (Pinky)
        const tips = [4, 8, 12, 16, 20];
        let avgDist = 0;
        
        tips.forEach(tipIdx => {
          const tip = landmarks[tipIdx];
          const dist = Math.sqrt(
            Math.pow(tip.x - wrist.x, 2) + 
            Math.pow(tip.y - wrist.y, 2) + 
            Math.pow(tip.z - wrist.z, 2)
          );
          avgDist += dist;
        });
        
        avgDist /= tips.length;
        
        // Normalize: Open hand approx 0.3-0.4, Closed fist approx 0.1-0.15 (depending on Z depth but roughly)
        // Let's assume max extension is 0.4 and closed is 0.1
        // Tension = 1 - ((avgDist - min) / (max - min))
        
        const minClosed = 0.1;
        const maxOpen = 0.4;
        
        let tension = 1 - Math.min(Math.max((avgDist - minClosed) / (maxOpen - minClosed), 0), 1);
        totalTension += tension;
      }
      
      // Average tension if two hands
      const finalTension = totalTension / results.multiHandLandmarks.length;
      setHandTension(finalTension);

    } else {
      setHandDetected(false);
      setHandTension(0);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 overflow-hidden rounded-xl border-2 border-white/20 bg-black/50 shadow-lg backdrop-blur-sm transition-opacity duration-300 hover:opacity-100 opacity-80">
      {cameraError && <div className="p-2 text-xs text-red-400">{cameraError}</div>}
      <video
        ref={videoRef}
        className="h-32 w-48 -scale-x-100 object-cover"
        playsInline
      />
      {/* We are not drawing landmarks to keep it clean, but video is shown for feedback */}
      <canvas ref={canvasRef} className="hidden" /> 
      <div className="absolute bottom-1 left-2 text-[10px] text-white/70 font-mono">
        Hand Tracker Active
      </div>
    </div>
  );
};

export default HandTracker;

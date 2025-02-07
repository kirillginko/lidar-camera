"use client";

import { useState, useEffect } from "react";
import FaceMesh from "@/components/FaceMesh";
import FaceVisualization from "@/components/FaceVisualization";
import { Canvas } from "@react-three/fiber";
import LoadingBar from "@/components/LoadingBar";

export default function Home() {
  const [landmarks, setLandmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [faceMeshLoaded, setFaceMeshLoaded] = useState(false);

  // Handle FaceMesh loading
  useEffect(() => {
    let currentTimeout;

    const startLoading = async () => {
      // Start from 0 with shorter initial delay
      setProgress(0);
      await new Promise((resolve) => setTimeout(resolve, 200));

      const incrementProgress = async (startValue, targetProgress) => {
        let currentProgress = startValue;

        while (currentProgress < targetProgress) {
          await new Promise((resolve) => {
            currentTimeout = setTimeout(() => {
              currentProgress += 5;
              setProgress(currentProgress);
              resolve();
            }, 50); // Reduced from 100ms to 50ms
          });

          // Shorter random pause between increments
          await new Promise((resolve) => {
            setTimeout(resolve, Math.random() * 100 + 50); // Random pause between 50-150ms
          });
        }
      };

      try {
        // Progress in chunks to 40%
        await incrementProgress(0, 40);

        // Shorter pause before MediaPipe load
        await new Promise((resolve) => setTimeout(resolve, 200));

        // Load MediaPipe while progressing to 80%
        await import("@mediapipe/face_mesh");
        await incrementProgress(40, 80);

        // Shorter pause before final progress
        await new Promise((resolve) => setTimeout(resolve, 150));

        // Final progress to 100%
        await incrementProgress(80, 100);

        setLoading(false);
        setFaceMeshLoaded(true);
      } catch (error) {
        console.error("Error loading components:", error);
      }
    };

    startLoading();

    return () => {
      if (currentTimeout) clearTimeout(currentTimeout);
    };
  }, []);

  const handleFaceMeshResults = (results) => {
    if (results.multiFaceLandmarks) {
      const landmarks = results.multiFaceLandmarks[0];
      setLandmarks(landmarks);
    }
  };

  return (
    <main>
      {loading ? (
        <div style={{ width: "100vw", height: "100vh" }}>
          <Canvas
            camera={{
              position: [3, 2, 5],
              fov: 75,
              near: 0.1,
              far: 1000,
            }}
          >
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={0.2} />
            <LoadingBar progress={progress} />
          </Canvas>
        </div>
      ) : (
        <>
          <FaceMesh onResults={handleFaceMeshResults} />
          <FaceVisualization landmarks={landmarks} />
        </>
      )}
    </main>
  );
}

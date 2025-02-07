"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { useMemo, useRef } from "react";
import styles from "../styles/FaceVisualization.module.css";
import { EffectComposer, Bloom } from "@react-three/postprocessing";

const RotatingPoints = ({ pointCloud }) => {
  const pointsRef = useRef();

  // Rotate points horizontally
  useFrame((state, delta) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += delta * 0.05;
    }
  });

  return (
    <points ref={pointsRef} geometry={pointCloud}>
      <pointsMaterial vertexColors={true} size={0.01} />
    </points>
  );
};

const FaceVisualization = ({ pixelData }) => {
  const pointCloud = useMemo(() => {
    if (!pixelData) return null;

    const points = [];
    const colors = [];
    const width = pixelData.width;
    const height = pixelData.height;
    const data = pixelData.data;

    for (let y = 0; y < height; y += 5) {
      for (let x = 0; x < width; x += 5) {
        const index = (y * width + x) * 4;
        const r = data[index] / 255;
        const g = data[index + 1] / 255;
        const b = data[index + 2] / 255;

        // Calculate brightness
        const brightness = (r + g + b) / 3;

        const exponent = 2;
        const depth = Math.pow(brightness, exponent) * 5;

        // Map pixel position to 3D space
        const point = new THREE.Vector3(
          (x / width - 0.5) * 5,
          -(y / height - 0.5) * 5,
          depth
        );
        points.push(point);

        // Enhanced color gradient based on depth
        const color = new THREE.Color();
        // This will create a rainbow gradient from red (0) through green (0.33), blue (0.66), to purple (1.0)
        color.setHSL(brightness, 0.8, 0.5 + brightness * 0.3);
        colors.push(color.r, color.g, color.b);
      }
    }

    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
    return geometry;
  }, [pixelData]);

  return (
    <Canvas
      className={styles.canvas}
      camera={{
        position: [-2, -1, 5], // Changed from [0, 0, 5] to add an offset
        fov: 60,
        near: 0.1,
        far: 1000,
      }}
      dpr={[1, 2]}
      touch="true"
    >
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={0.2} />
      {pointCloud && <RotatingPoints pointCloud={pointCloud} />}
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={2}
        maxDistance={50}
        touchAction="none"
        enableDamping={true}
        dampingFactor={0.05}
        defaultPosition={[-2, -1, 5]} // Added default position
      />
      <EffectComposer>
        <Bloom
          intensity={5}
          luminanceThreshold={0.1}
          luminanceSmoothing={0.9}
          kernelSize={2}
          radius={3}
        />
      </EffectComposer>
    </Canvas>
  );
};

export default FaceVisualization;

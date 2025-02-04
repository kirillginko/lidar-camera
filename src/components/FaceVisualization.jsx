"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { useMemo, useRef } from "react";
import styles from "../styles/FaceVisualization.module.css";

const RotatingPoints = ({ pointCloud }) => {
  const pointsRef = useRef();

  // Change rotation from z-axis to y-axis for horizontal rotation
  useFrame((state, delta) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += delta * 0.05; // Changed from rotation.z to rotation.y
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
    const colors = []; // Array to store colors for each point
    const width = pixelData.width;
    const height = pixelData.height;
    const data = pixelData.data;

    for (let y = 0; y < height; y += 4) {
      for (let x = 0; x < width; x += 4) {
        const index = (y * width + x) * 4;
        const r = data[index] / 255;
        const g = data[index + 1] / 255;
        const b = data[index + 2] / 255;

        // Calculate brightness (average of RGB values)
        const brightness = (r + g + b) / 3;

        // Map pixel position to 3D space with depth
        const point = new THREE.Vector3(
          (x / width - 0.5) * 5, // X coordinate
          -(y / height - 0.5) * 5, // Y coordinate
          brightness * 5 // Z coordinate (depth based on brightness)
        );
        points.push(point);

        // Calculate heatmap color based on brightness
        const color = new THREE.Color();
        color.setHSL(0.7 - brightness * 0.7, 1, 0.5); // Hue ranges from blue (0.7) to red (0)
        colors.push(color.r, color.g, color.b); // Add color to the colors array
      }
    }

    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    geometry.setAttribute(
      "color",
      new THREE.Float32BufferAttribute(colors, 3) // Add color attribute to geometry
    );
    return geometry;
  }, [pixelData]);

  return (
    <Canvas
      className={styles.canvas}
      camera={{
        position: [0, 0, 7],
        fov: 75,
        near: 0.1,
        far: 1000,
      }}
    >
      <ambientLight intensity={0.8} />
      <pointLight position={[10, 10, 10]} intensity={0.5} />
      {pointCloud && <RotatingPoints pointCloud={pointCloud} />}
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={2}
        maxDistance={50}
      />
    </Canvas>
  );
};

export default FaceVisualization;

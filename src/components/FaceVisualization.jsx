"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import styles from "../styles/FaceVisualization.module.css";

const FaceVisualization = ({ landmarks = [] }) => {
  const createFaceMesh = () => {
    if (landmarks.length === 0) return null;

    const points = landmarks.map(
      (point) =>
        new THREE.Vector3(
          (point.x - 0.5) * 5,
          -(point.y - 0.5) * 5,
          point.z * 3
        )
    );

    return (
      <>
        {points.map((point, index) => (
          <mesh key={`point-${index}`} position={point}>
            <sphereGeometry args={[0.02, 16, 16]} />
            <meshStandardMaterial color="blue" />
          </mesh>
        ))}
      </>
    );
  };

  return (
    <Canvas
      className={styles.canvas}
      camera={{
        position: [0, 0, 5],
        fov: 45,
        near: 0.1,
        far: 1000,
      }}
    >
      <ambientLight intensity={0.8} />
      <pointLight position={[10, 10, 10]} intensity={0.5} />
      <group position={[0, 0, 0]}>{createFaceMesh()}</group>
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={2}
        maxDistance={10}
      />
    </Canvas>
  );
};

export default FaceVisualization;

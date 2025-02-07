import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { Text } from "@react-three/drei";

const LoadingBar = ({ progress = 0 }) => {
  const cubes = useMemo(() => {
    const totalCubes = 20;
    // Calculate how many cubes should be active based on progress
    const activeCubes = Math.floor((progress / 100) * totalCubes);

    return Array.from({ length: totalCubes }, (_, i) => {
      const x = (i - totalCubes / 2) * 0.4;
      return {
        position: [x, 0, 0],
        isActive: i < activeCubes,
      };
    });
  }, [progress]);

  return (
    <group position={[0, 0, 0]}>
      {cubes.map((cube, i) => (
        <group key={i} position={cube.position}>
          {/* Main cube */}
          {cube.isActive ? (
            <mesh scale={[1.2, 1.2, 1.2]}>
              <boxGeometry args={[0.3, 0.3, 0.3]} />
              <meshStandardMaterial
                color="#00ff88"
                emissive="#00ff88"
                emissiveIntensity={0.5}
              />
            </mesh>
          ) : (
            <>
              {/* Edges only for inactive cubes */}
              <lineSegments scale={[1.05, 1.05, 1.05]}>
                <edgesGeometry args={[new THREE.BoxGeometry(0.3, 0.3, 0.3)]} />
                <lineBasicMaterial
                  color="#00ff88"
                  transparent={true}
                  opacity={0.3}
                  linewidth={1}
                />
              </lineSegments>
            </>
          )}
        </group>
      ))}
      <Text
        position={[0, -0.8, 0]}
        fontSize={0.3}
        color="#00ff88"
        anchorX="center"
        anchorY="middle"
      >
        {`${Math.round(progress)}%`}
      </Text>
    </group>
  );
};

export default LoadingBar;

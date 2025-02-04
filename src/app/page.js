"use client";

import { useState } from "react";
import FaceMesh from "@/components/FaceMesh";
import FaceVisualization from "@/components/FaceVisualization";

export default function Home() {
  const [landmarks, setLandmarks] = useState([]);

  const handleFaceMeshResults = (results) => {
    if (results.multiFaceLandmarks) {
      const landmarks = results.multiFaceLandmarks[0]; // Get the first face
      console.log("Landmarks:", landmarks); // Log the landmarks
      setLandmarks(landmarks);
    }
  };

  return (
    <main>
      <FaceMesh onResults={handleFaceMeshResults} />
      <FaceVisualization landmarks={landmarks} />
    </main>
  );
}

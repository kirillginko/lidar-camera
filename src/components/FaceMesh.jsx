"use client";

import { useRef, useEffect, useState } from "react";
import { Camera } from "@mediapipe/camera_utils";
import { FaceMesh } from "@mediapipe/face_mesh";
import FaceVisualization from "./FaceVisualization";
import styles from "../styles/FaceMesh.module.css";

const FaceMeshComponent = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [landmarks, setLandmarks] = useState([]);
  const [pixelData, setPixelData] = useState(null);

  useEffect(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const faceMesh = new FaceMesh({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
      },
    });

    faceMesh.setOptions({
      maxNumFaces: 1,
      refineLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    faceMesh.onResults((results) => {
      if (results.multiFaceLandmarks) {
        setLandmarks(results.multiFaceLandmarks[0] || []);
      }
    });

    const camera = new Camera(videoRef.current, {
      onFrame: async () => {
        if (videoRef.current) {
          await faceMesh.send({ image: videoRef.current });

          // Capture video frame and extract pixel data
          const canvas = canvasRef.current;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          setPixelData(imageData);
        }
      },
      width: 640,
      height: 480,
    });

    camera.start().catch((err) => {
      console.error("Error starting camera:", err);
    });

    return () => {
      camera.stop();
    };
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.videoContainer}>
        <video
          ref={videoRef}
          className={styles.video}
          style={{ display: "none" }}
        />
        <canvas
          ref={canvasRef}
          width={640}
          height={480}
          style={{ display: "none" }}
        />
      </div>
      <div className={styles.visualizationContainer}>
        <FaceVisualization landmarks={landmarks} pixelData={pixelData} />
      </div>
    </div>
  );
};

export default FaceMeshComponent;

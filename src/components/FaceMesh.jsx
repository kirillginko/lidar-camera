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
      refineLandmarks: false,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    faceMesh.onResults((results) => {
      try {
        if (results.multiFaceLandmarks) {
          setLandmarks(results.multiFaceLandmarks[0] || []);
        }
      } catch (error) {
        console.error("Error processing face mesh results:", error);
      }
    });

    const camera = new Camera(videoRef.current, {
      onFrame: async () => {
        try {
          if (videoRef.current) {
            await faceMesh.send({ image: videoRef.current });

            if (canvasRef.current) {
              const canvas = canvasRef.current;
              const ctx = canvas.getContext("2d");
              ctx.drawImage(
                videoRef.current,
                0,
                0,
                canvas.width,
                canvas.height
              );
              const imageData = ctx.getImageData(
                0,
                0,
                canvas.width,
                canvas.height
              );
              setPixelData(imageData);
            }
          }
        } catch (error) {
          console.error("Error in camera frame processing:", error);
        }
      },
      width: 320,
      height: 240,
      video: {
        facingMode: "user",
        width: 320,
        height: 240,
        frameRate: { ideal: 30, max: 30 },
      },
    });

    let retryCount = 0;
    const maxRetries = 3;

    const startCamera = async () => {
      try {
        await camera.start();
      } catch (err) {
        console.error("Camera start error:", err);
        if (retryCount < maxRetries) {
          retryCount++;
          console.log(`Retrying camera start (${retryCount}/${maxRetries})...`);
          setTimeout(startCamera, 1000);
        } else {
          console.error("Failed to start camera after multiple attempts");
        }
      }
    };

    startCamera();

    return () => {
      try {
        camera.stop();
        faceMesh.close();
      } catch (error) {
        console.error("Error cleaning up:", error);
      }
    };
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.videoContainer}>
        <video
          ref={videoRef}
          className={styles.video}
          style={{ display: "none" }}
          playsInline
          muted
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

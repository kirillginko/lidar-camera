import { useRef, useEffect, useState } from "react";
import { Camera } from "@mediapipe/camera_utils";
import { FaceMesh } from "@mediapipe/face_mesh";
import FaceVisualization from "./FaceVisualization";
import styles from "../styles/FaceMesh.module.css";

const FaceMeshComponent = () => {
  const videoRef = useRef(null);
  const [landmarks, setLandmarks] = useState([]);

  useEffect(() => {
    if (!videoRef.current) return;

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
        <video ref={videoRef} className={styles.video} />
      </div>
      <div className={styles.visualizationContainer}>
        <FaceVisualization landmarks={landmarks} />
      </div>
    </div>
  );
};

export default FaceMeshComponent;

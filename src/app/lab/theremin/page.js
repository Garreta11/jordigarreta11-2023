'use client';
import styles from './page.module.scss';
import React, { useEffect, useRef, useState } from 'react';
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';
import Output from './Output';

const Page = () => {
  const modelPath = '/theremin/models/hand_landmarker.task';

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const outputRef = useRef(null);
  const [handPresence, setHandPresence] = useState(null);

  useEffect(() => {
    let handLandmarker;
    let animationFrameId;

    // Handle window resize
    const handleResize = () => {
      if (outputRef.current) {
        outputRef.current.onResize();
      }
    };

    // Init Hand Detection
    const initializeHandDetection = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
        );
        handLandmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: { modelAssetPath: modelPath },
          numHands: 2,
          runningMode: 'video',
        });
        detectHands();
      } catch (error) {
        console.error('Error initializing hand detection:', error);
      }
    };

    // Draw Hand Points
    const drawLandmarks = (landmarksArray) => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'white';

      landmarksArray.forEach((landmarks) => {
        if (landmarks.length === 0) return;

        // Calculate the average position
        let sumX = 0,
          sumY = 0;
        landmarks.forEach((landmark) => {
          sumX += landmark.x;
          sumY += landmark.y;
        });

        const avgX = (sumX / landmarks.length) * canvas.width;
        const avgY = (sumY / landmarks.length) * canvas.height;

        // Draw a single circle at the average position
        ctx.beginPath();
        ctx.arc(avgX, avgY, 5, 0, 2 * Math.PI); // Increased size for better visibility
        ctx.fill();

        outputRef.current.controlTheremin(avgX, avgY);
      });
    };

    // Detect Hands
    const detectHands = () => {
      if (videoRef.current && videoRef.current.readyState >= 2) {
        const detections = handLandmarker.detectForVideo(
          videoRef.current,
          performance.now()
        );

        setHandPresence(detections.handednesses.length > 0);

        // Assuming detections.landmarks is an array of landmark objects
        if (detections.landmarks) {
          drawLandmarks(detections.landmarks);
          //outputRef.current.moveHand(detections.landmarks);
        }
      }
      requestAnimationFrame(detectHands);
    };

    // Start Webcam
    const startWebcam = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        videoRef.current.srcObject = stream;
        // Ensure the canvas matches the video resolution
        const video = videoRef.current;
        video.onloadedmetadata = () => {
          if (canvasRef.current) {
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
          }
        };
        await initializeHandDetection();
      } catch (error) {
        console.error('Error accessing webcam:', error);
      }
    };

    // Start ThreeJS
    const initExperience = () => {
      outputRef.current = new Output({
        window: window,
        targetElement: containerRef.current,
      });
    };

    startWebcam();
    initExperience();

    // Add event listener for resize
    window.addEventListener('resize', handleResize);

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      }
      if (handLandmarker) {
        handLandmarker.close();
      }
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }

      // Remove resize event listener
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <>
      <div ref={containerRef} className={styles.theremin}>
        <video
          className={styles.theremin__video}
          ref={videoRef}
          autoPlay
          playsInline
        ></video>
        <canvas ref={canvasRef} className={styles.theremin__canvas}></canvas>
      </div>
    </>
  );
};

export default Page;

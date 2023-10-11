'use client'
import { useEffect, useRef } from 'react';

function MotionDetector() {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    let lastFrame = null;

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
    
        const startCapture = () => {
          canvas.width = videoRef.current.videoWidth;
          canvas.height = videoRef.current.videoHeight;
    
          const captureFrame = () => {
            ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
            if (lastFrame) {
              const motionData = detectMotion(imageData, lastFrame);
              displayMotionDetection(ctx, motionData);
            }
    
            lastFrame = imageData;
            requestAnimationFrame(captureFrame);
          };
    
          captureFrame();
        };
    
        navigator.mediaDevices
          .getUserMedia({ video: true })
          .then((stream) => {
            videoRef.current.srcObject = stream;
            videoRef.current.play().then(startCapture);
          })
          .catch((error) => {
            console.error('Error accessing webcam:', error);
          });
      }, []);
    
    const detectMotion = (currentFrame, lastFrame, threshold = 30) => {
        const diff = new Uint8ClampedArray(currentFrame.data.length);
        for (let i = 0; i < currentFrame.data.length; i += 4) {
            const r1 = currentFrame.data[i];
            const g1 = currentFrame.data[i + 1];
            const b1 = currentFrame.data[i + 2];
            
            const r2 = lastFrame.data[i];
            const g2 = lastFrame.data[i + 1];
            const b2 = lastFrame.data[i + 2];
            
            const brightness1 = (r1 + g1 + b1) / 3;
            const brightness2 = (r2 + g2 + b2) / 3;
            
            const difference = Math.abs(brightness1 - brightness2);
            if (difference > threshold) {
                // Motion detected at this pixel
                diff[i] = 255;
                diff[i + 1] = 255;
                diff[i + 2] = 255;
            }
        }
        return diff;
    };
    
    const displayMotionDetection = (ctx, result) => {
        const resultImageData = new ImageData(result, canvasRef.current.width, canvasRef.current.height);
        ctx.putImageData(resultImageData, 0, 0);
        console.log(resultImageData)
    };
    
    return (
        <div>
            <video ref={videoRef} />
            <canvas ref={canvasRef} />
        </div>
    );
}

export default MotionDetector;
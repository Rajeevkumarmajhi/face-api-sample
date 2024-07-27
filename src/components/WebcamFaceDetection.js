'use client';
import React, { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js/dist/face-api.min.js';
import './WebcamFaceDetection.css';

const WebcamFaceDetection = ( { imagePath } ) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [maskImage, setMaskImage] = useState(null);

  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = '/models';
      await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
      await faceapi.nets.faceLandmark68TinyNet.loadFromUri(MODEL_URL);
      await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
      setModelsLoaded(true);
    };

    const startVideo = () => {
      navigator.mediaDevices
        .getUserMedia({ video: {} })
        .then(stream => {
          videoRef.current.srcObject = stream;
          // videoRef.current.style.transform = 'scaleX(-1)';
        })
        .catch(err => console.error('Error accessing webcam: ', err));
    };

    loadModels();
    startVideo();
  }, []);

  useEffect(() => {
    // Load the mask image
    const image = new Image();
    image.src = `/${imagePath}?t=${new Date().getTime()}`;
    image.onload = () => {
      setMaskImage(image);
    };
    image.onerror = (error) => {
      console.error('Error loading mask image:', error);
    };
  }, [imagePath]);

  const handleVideoPlay = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const displaySize = { width: video.videoWidth, height: video.videoHeight };
    faceapi.matchDimensions(canvas, displaySize);

    setInterval(async () => {
      const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
                                      .withFaceLandmarks(true)
                                      .withFaceDescriptors();

      const resizedDetections = faceapi.resizeResults(detections, displaySize);

      canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas

      // faceapi.draw.drawDetections(canvas, resizedDetections);
      // faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);

      // Draw the mask image
      if (maskImage) {
        const ctx = canvas.getContext('2d');

        resizedDetections.forEach(detection => {
          const { landmarks } = detection;

          // Get landmarks for the left and right eyes
          const leftEye = landmarks.getLeftEye(); // Array of 6 points for left eye
          const rightEye = landmarks.getRightEye(); // Array of 6 points for right eye

          const drawMask = (leftEyeLandmarks, rightEyeLandmarks) => {
            if (leftEyeLandmarks.length > 0 && rightEyeLandmarks.length > 0) {
              // Get bounding box coordinates
              const leftEyeX = leftEyeLandmarks[0].x;
              const leftEyeY = leftEyeLandmarks[0].y;
              const rightEyeX = rightEyeLandmarks[3].x;
              const rightEyeY = rightEyeLandmarks[1].y;
          
              const x = leftEyeX-50;
              const y = (Math.min(leftEyeY, rightEyeY))-15; // Start from the topmost point
              const eyeWidth = (rightEyeX - leftEyeX)+ 100; // Width of the area covering both eyes
              // const eyeHeight = Math.max(leftEyeLandmarks[5].y, rightEyeLandmarks[1].y) - y; // Height of the area covering both eyes
              const eyeHeight = 50;
          
              // Ensure that the mask image is drawn in a way that makes sense for the size of both eyes
              if (eyeWidth > 0 && eyeHeight > 0) {
                ctx.drawImage(
                  maskImage,
                  x, // X position of the mask
                  y, // Y position of the mask
                  eyeWidth,  // Width of the mask
                  eyeHeight  // Height of the mask
                );
              }
            }
          };

          drawMask(leftEye,rightEye);
          
        });
      }
    }, 100);
  };

  return (
    <div style={{ position: 'relative', display: 'inline-block' }} className='flip-horizontal'>
      <video
        ref={videoRef}
        autoPlay
        muted
        onPlay={handleVideoPlay}
        style={{ display: modelsLoaded ? 'block' : 'none', width: '100%' }}
      />
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: '0',
          left: '0',
          width: '100%',
          height: '100%',
        }}
      />
      {!modelsLoaded && <p>Loading models...</p>}
    </div>
  );
};

export default WebcamFaceDetection;

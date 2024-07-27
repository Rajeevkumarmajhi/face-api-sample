'use client';
import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import WebcamFaceDetection from '@/components/WebcamFaceDetection';

const HomePage = () => {

  const [googleImage, setGoogleImage] = useState('eyegoogle.png');

  return (
    <div className='flex items-center justify-center'>
      <div className='flex flex-col items-center justify-center'>
        <h1 className='text-3xl'>Webcam Face Detection</h1>
        <div className='image-container'>
          <img onClick={() => setGoogleImage('eyegoogle.png')} className='h-40' src='/eyegoogle.png' alt='eyegoogle' />
          <img onClick={() => setGoogleImage('eyegoogle2.png')} className='h-40' src='/eyegoogle2.png' alt='eyemask' />
        </div>
      </div>
      <WebcamFaceDetection key={googleImage} imagePath={googleImage} />
    </div>
  );
};

export default HomePage;

'use client';

import styles from './page.module.scss';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { isMobile, isTablet, isDesktop } from 'react-device-detect';
import Particles from './components/Particles/Particles';

import BackgroundVideo from './components/BackgroundVideo/BackgroundVideo';
import GPGPUParticles from './components/GPGPUParticles/GPGPUParticles';

export default function Home() {
  const [zoomParticles, setZoomParticles] = useState(false);
  const [videoLoad, setVideoLoad] = useState(false);

  const videoLoaded = () => {
    setVideoLoad(true);
  };

  return (
    <motion.main className={styles.main}>
      <BackgroundVideo videoLoaded={videoLoaded} />
      <Particles zoom={zoomParticles} />
    </motion.main>
  );
}

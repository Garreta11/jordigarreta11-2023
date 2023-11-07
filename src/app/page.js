'use client'

import styles from './page.module.scss'

import { useState } from 'react'
import { motion } from "framer-motion"
import Particles from './components/Particles/Particles'

import BackgroundVideo from './components/BackgroundVideo/BackgroundVideo'

export default function Home() {

  const [zoomParticles, setZoomParticles] = useState(false)
  const [videoLoad, setVideoLoad] = useState(false);

  const videoLoaded = () => {
    setVideoLoad(true)
  }

  return (
    <motion.main
      className={styles.main}
    >

      <BackgroundVideo videoLoaded={videoLoaded} />
    
      {videoLoad && (
        <Particles zoom={zoomParticles} />
      )}
        
      </motion.main>
  )
}

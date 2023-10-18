'use client'

import styles from './page.module.scss'
import Link from 'next/link'

import PageWrapper from './components/PageWrapper/PageWrapper'

import { useState } from 'react'
import { motion, AnimatePresence } from "framer-motion"
import Particles from './components/Particles/Particles'

const transitionWork = { delay: 1.5, duration: 1, ease: [0.43, 0.13, 0.23, 0.96] };
const transitionLab = { delay: 1.5, duration: 1, ease: [0.43, 0.13, 0.23, 0.96] };

export default function Home() {

  const [zoomParticles, setZoomParticles] = useState(false)

  const handleClick = () => {
    setZoomParticles(true)
  }

  return (
    <motion.main
      className={styles.main}
    >
    
      <Particles zoom={zoomParticles} />

      <div className={styles['home--wrapper']}>
          <motion.div
            className={styles['home--wrapper--item']}
            initial={{opacity: 0, x: -20}}
            animate={{opacity: 1, x: 0}}
            transition={transitionWork}
          >
            <Link onClick={handleClick} href="/work">Work</Link>
          </motion.div>
          <motion.div
            className={styles['home--wrapper--item']}
            initial={{opacity: 0, x: 20}}
            animate={{opacity: 1, x: 0}}
            transition={transitionLab}
          >
            <Link onClick={handleClick} href="/lab">Lab</Link>
          </motion.div>

      </div>
        
      </motion.main>
  )
}

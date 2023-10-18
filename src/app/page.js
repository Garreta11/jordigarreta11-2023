'use client'

import styles from './page.module.scss'
import Link from 'next/link'

import PageWrapper from './components/PageWrapper/PageWrapper'

import { useState } from 'react'
import { motion, AnimatePresence } from "framer-motion"
import Particles from './components/Particles/Particles'

const links = [
  {
    label: "Work",
    route: "/work"
  },
  {
    label: "Lab",
    route: "/lab"
  },
]

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
          {links.map(({label, route}) => {
            return(
              <div key={route} className={styles['home--wrapper--item']}>
                  <Link onClick={handleClick} href={route}>{label}</Link>
              </div>
            )
          })}
      </div>
        
      </motion.main>
  )
}

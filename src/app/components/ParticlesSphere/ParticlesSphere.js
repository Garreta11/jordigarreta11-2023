'use client';
import React, { useEffect, useRef } from 'react';
import styles from './ParticlesSphere.module.scss';
import Output from './Output.js';

const ParticlesSphere = () => {
  const containerRef = useRef(null);
  const outputRef = useRef(null);

  useEffect(() => {
    outputRef.current = new Output({
      targetElement: containerRef.current,
    });
  }, []);

  return <div ref={containerRef} className={styles.particles} />;
};

export default ParticlesSphere;

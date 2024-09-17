import React, { useEffect, useRef } from 'react';
import styles from './GPGPUParticles.module.scss';
import Output from './Output.js';

const GPGPUParticles = () => {
  const containerRef = useRef(null);
  const outputRef = useRef(null);

  useEffect(() => {
    outputRef.current = new Output({
      targetElement: containerRef.current,
    });
  }, []);

  return <div ref={containerRef} className={styles.canvas} />;
};

export default GPGPUParticles;

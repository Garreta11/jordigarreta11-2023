'use client';
import React, { useEffect, useRef } from 'react';
import styles from './Presentation.module.scss';
import Output from './Output.js';

const Presentation = () => {
  const containerRef = useRef(null);
  const outputRef = useRef(null);

  useEffect(() => {
    outputRef.current = new Output({
      targetElement: containerRef.current,
    });
  }, []);

  return <div ref={containerRef} className={styles.presentation} />;
};

export default Presentation;
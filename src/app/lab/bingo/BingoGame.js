'use client';
import React, { useState, useEffect, useRef, useContext } from 'react';
import styles from './BingoGame.module.scss';
import { DataContext } from './context';
import Output from './Output';

const BingoGame = () => {
  const outputRef = useRef(null);
  const containerRef = useRef(null);
  const audioRef = useRef(null);

  const { start } = useContext(DataContext);

  const [number, setNumber] = useState(null);
  const [availableValues, setAvailableValues] = useState(
    Array.from({ length: 75 }, (_, i) => i)
  ); // Store available values in state

  useEffect(() => {
    if (typeof window !== 'undefined') {
      outputRef.current = new Output({
        targetElement: containerRef.current,
        window: window,
      });
    }
  }, []);

  useEffect(() => {
    if (start) {
      outputRef.current.startExperience();
    }
  }, [start]);

  const handleSelectSphere = () => {
    if (availableValues.length === 0) {
      console.log('All values have been selected.');
      return; // Stop if all values are used
    }

    // Select a random index from the available values array
    const randomIndex = Math.floor(Math.random() * availableValues.length);
    const value = availableValues[randomIndex];
    let val = value;
    if (val === 0) {
      val = 75;
    }
    outputRef.current.selectMesh(val);
    setNumber(val);

    if (audioRef.current) {
      if (!audioRef.current.isPlaying) {
        audioRef.current.play();
      }
    }

    // Remove the selected value from the available values
    const updatedValues = availableValues.filter((v) => v !== value);
    setAvailableValues(updatedValues);
  };

  return (
    <div ref={containerRef} className={styles.bingo}>
      <p key={number} className={`${styles.bingo__number} number`}>
        {number}
      </p>
      <button
        className='play-btn'
        onClick={handleSelectSphere}
        style={{ zIndex: 0 }}
      >
        PLAY
      </button>

      <audio ref={audioRef} src='/bingo/bingo-spinner.wav' />
    </div>
  );
};

export default BingoGame;

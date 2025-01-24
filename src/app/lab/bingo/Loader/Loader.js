'use client';
import { useEffect, useRef, useState, useContext } from 'react';
import { DataContext } from '../context';
import styles from './Loader.module.scss';
import gsap from 'gsap';

const Loader = () => {
  const loaderRef = useRef(null);
  const { setStart } = useContext(DataContext);
  const [startButton, setStartButton] = useState(false);

  useEffect(() => {
    if (startButton) {
      gsap.to(loaderRef.current, {
        autoAlpha: 0,
      });
    }
  }, [startButton]);

  const handleStart = () => {
    setStart(true);
    setStartButton(true);
  };

  return (
    <div
      ref={loaderRef}
      className={styles.loader}
      style={{ backgroundImage: `url(/bingo/wall.jpg)` }}
    >
      <img
        className={styles.loader__img}
        src='/bingo/jt.png'
        alt='jordi-tatiana'
      />
      <div className={styles.loader__wrapper}>
        <img
          className={styles.loader__wrapper__text}
          src='/bingo/welcome.svg'
          alt='welcome-text'
        />

        <button onClick={handleStart}>START</button>
      </div>
    </div>
  );
};

export default Loader;

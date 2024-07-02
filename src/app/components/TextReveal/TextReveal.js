import { useEffect, useRef } from 'react';

import styles from './TextReveal.module.scss';

import SplitType from 'split-type';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/all';
gsap.registerPlugin(ScrollTrigger);

const TextReveal = ({ text }) => {
  const textRef = useRef(null);
  useEffect(() => {
    const text = new SplitType(textRef.current, { types: 'chars,words' });

    gsap.from(text.chars, {
      scrollTrigger: {
        trigger: textRef.current,
        start: 'top 90%',
        end: 'top 10%',
        scrub: false,
        markers: false,
      },
      opacity: 0.0,
      delay: 1,
      stagger: 0.004,
    });
  }, []);

  return (
    <div ref={textRef} className={styles.textreveal}>
      {text}
    </div>
  );
};

export default TextReveal;

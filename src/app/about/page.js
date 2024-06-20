'use client';
import styles from './About.module.scss';
import { useEffect, useState, useRef, useInsertionEffect } from 'react';
import { motion } from 'framer-motion';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Mousewheel, Autoplay, FreeMode } from 'swiper/modules';
import 'swiper/css';

const transition = { duration: 1, ease: [0.43, 0.13, 0.23, 0.96] };
const transitionFriends = { delay: 1.0, ease: [0.43, 0.13, 0.23, 0.96] };
const transitionMarquee = { delay: 0.5, ease: [0.43, 0.13, 0.23, 0.96] };

const AboutPage = () => {
  const [aboutPage, setAbouPage] = useState();
  const [cvPage, setCvPage] = useState();

  // fetch data from wordpress
  useEffect(() => {
    async function fetchData() {
      const res = await fetch(
        'https://dashboard.jordigarreta.com/wp-json/wp/v2/pages'
      )
        .then((res) => res.json())
        .then((data) => {
          data.forEach((page) => {
            if (page.title.rendered === 'About me') {
              setAbouPage(page);
            }
            if (page.title.rendered === 'cv') {
              setCvPage(page);
            }
          });
        });
    }
    fetchData();
  }, []);

  return (
    <main className={styles.about}>
      <div className={styles.about__wrapper}>
        {aboutPage && (
          <div className={styles.about_about}>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={transition}
              className={styles.about_about_description}
              dangerouslySetInnerHTML={{ __html: aboutPage.acf.description }}
            />
          </div>
        )}

        {aboutPage && <Friends aboutPage={aboutPage} />}
      </div>
      {cvPage && <Marquee cvPage={cvPage} />}
    </main>
  );
};

const Marquee = ({ cvPage }) => {
  const [skills, setSkills] = useState([]);

  useEffect(() => {
    let s = cvPage.acf.skills.replaceAll('<p>', '');
    s = s.replaceAll('</p>', '');

    setSkills(s.split('\n'));
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={transitionMarquee}
      className={styles.about__marquee}
    >
      <div className={styles.about__marquee__content}>
        <span className={styles.about__marquee__content__1}>
          {skills.map((skill, index) => (
            <span key={index} className={styles.about__marquee__content__skill}>
              {skill}
            </span>
          ))}
        </span>
        <span className={styles.about__marquee__content__2}>
          {skills.map((skill, index) => (
            <span key={index} className={styles.about__marquee__content__skill}>
              {skill}
            </span>
          ))}
        </span>
      </div>
    </motion.div>
  );
};

const Friends = ({ aboutPage }) => {
  return (
    <motion.div
      className={styles.about__friends}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={transitionFriends}
    >
      <h3>FRIENDS</h3>

      <div dangerouslySetInnerHTML={{ __html: aboutPage.acf.friends }} />
    </motion.div>
  );
};

export default AboutPage;

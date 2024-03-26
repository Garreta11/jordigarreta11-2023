'use client';
import styles from './cv.module.scss';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const transition = { duration: 1, ease: [0.43, 0.13, 0.23, 0.96] };

const CV = () => {
  const [cvPage, setCvPage] = useState();

  useEffect(() => {
    async function fetchData() {
      const res = await fetch(
        'https://dashboard.jordigarreta.com/wp-json/wp/v2/pages'
      )
        .then((res) => res.json())
        .then((data) => {
          data.forEach((page) => {
            if (page.title.rendered === 'cv') {
              setCvPage(page);
              console.log(page);
            }
          });
        });
    }
    fetchData();
  }, []);

  return (
    <div className={styles.cv}>
      {cvPage && (
        <div className={styles.cv__wrapper}>
          <div>
            <h2>Work Experience</h2>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={transition}
              className={styles.cv__section}
              dangerouslySetInnerHTML={{ __html: cvPage.acf.work_experience }}
            />
          </div>
          <div>
            <h2>Education</h2>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={transition}
              className={styles.cv__section}
              dangerouslySetInnerHTML={{ __html: cvPage.acf.education }}
            />
          </div>
          <div>
            <h2>Skills</h2>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={transition}
              className={`${styles.cv__section} ${styles.cv__section__skills}`}
              dangerouslySetInnerHTML={{ __html: cvPage.acf.skills }}
            />
          </div>
          <div>
            <h2>Languages</h2>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={transition}
              className={styles.cv__section}
              dangerouslySetInnerHTML={{ __html: cvPage.acf.languages }}
            />
          </div>
          <div>
            <h2>Contact</h2>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={transition}
              className={styles.cv__section}
              dangerouslySetInnerHTML={{ __html: cvPage.acf.contact }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default CV;

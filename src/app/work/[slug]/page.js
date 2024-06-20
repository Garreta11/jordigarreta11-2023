'use client';
import Link from 'next/link';
import styles from './project.module.scss';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const transitionTitle = {
  duration: 1,
  duration: 1,
  ease: [0.43, 0.13, 0.23, 0.96],
};
const transitionDescription = {
  delay: 0.5,
  duration: 1,
  ease: [0.43, 0.13, 0.23, 0.96],
};
const transitionCredits = {
  delay: 1,
  duration: 1,
  ease: [0.43, 0.13, 0.23, 0.96],
};

const ProjectPage = ({ params }) => {
  const [project, setProject] = useState();
  const [projectTitle, setProjectTitle] = useState();
  const [nextProject, setNextProject] = useState();
  const [prevProject, setPrevProject] = useState();

  useEffect(() => {
    async function fetchData() {
      const res = await fetch(
        'https://dashboard.jordigarreta.com/wp-json/wp/v2/posts'
      )
        .then((res) => res.json())
        .then((data) => {
          data.forEach((d) => {
            if (d.slug === params.slug) {
              setProject(d);

              const parser = new DOMParser();
              const parsedEntity = parser.parseFromString(
                d.title.rendered,
                'text/html'
              );
              const t = parsedEntity.documentElement.textContent;

              setProjectTitle(t);

              console.log(d);

              if (d.next !== null) {
                setNextProject(d.next.slug);
              } else {
                setNextProject('oggetti-fanno-musica');
              }
              if (d.previous !== null) {
                setPrevProject(d.previous.slug);
              } else {
                setPrevProject('starmax');
              }
            }
          });
        });
    }
    fetchData();
  }, []);

  return (
    <section className={styles.project}>
      {project && (
        <>
          <motion.h1
            className={styles.project_title}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={transitionTitle}
          >
            {projectTitle}
          </motion.h1>

          <div className={styles.project_info}>
            <motion.div
              className={styles.project_info_description}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={transitionDescription}
            >
              <p>{project.acf.description}</p>
              <div
                className={styles.project_images}
                dangerouslySetInnerHTML={{ __html: project.content.rendered }}
              />
            </motion.div>

            <motion.div
              className={styles.project_info_right}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={transitionCredits}
            >
              <h2 style={{ marginBottom: '20px' }}>CREDITS</h2>
              <div
                className={styles.project_info_credits}
                dangerouslySetInnerHTML={{ __html: project.acf.credits }}
              />
              {project.acf.project_link && (
                <Link
                  target='_blank'
                  href={project.acf.project_link}
                  className={styles.project_link}
                >
                  Visit project
                </Link>
              )}
            </motion.div>
          </div>

          <div className={styles.project_next}>
            <Link
              className={styles.project_next_link}
              href={`/work/${prevProject}`}
            >
              Prev Project
            </Link>
            <Link
              className={styles.project_next_link}
              href={`/work/${nextProject}`}
            >
              Next Project
            </Link>
          </div>
        </>
      )}
    </section>
  );
};

export default ProjectPage;

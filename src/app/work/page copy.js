'use client';

import Link from 'next/link';

// css
import styles from './Work.module.scss';

// react
import { useEffect, useState, useRef, Suspense } from 'react';

// react three fiber / drei
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import {
  ScrollControls,
  Plane,
  useTexture,
  useScroll,
  Environment,
} from '@react-three/drei';

// gsap
import gsap from 'gsap';

import { motion } from 'framer-motion';

// loader
import Loader from '../components/Loader/Loader';

const DISTANCE = 20;

const transitionSwipe = {
  duration: 1,
  delay: 3,
  ease: [0.43, 0.13, 0.23, 0.96],
};

// WorkPage
const WorkPage = () => {
  const [projects, setProjects] = useState();
  const [projectTitle, setProjectTitle] = useState();
  const [projectCat, setProjectCat] = useState();
  const [projectSlug, setProjectSlug] = useState();
  const [isListOpen, setIsListOpen] = useState(false);

  const swipeRef = useRef();

  useEffect(() => {
    async function fetchData() {
      const res = await fetch(
        'https://dashboard.jordigarreta.com/wp-json/wp/v2/posts?_embed&per_page=100'
      )
        .then((res) => res.json())
        .then((data) => {
          setProjects(data);
        });
    }
    fetchData();
  }, []);

  const sendIndex = (index) => {
    projects.forEach((project, i) => {
      if (i === index) {
        const parser = new DOMParser();
        const parsedEntity = parser.parseFromString(
          project.title.rendered,
          'text/html'
        );
        const t = parsedEntity.documentElement.textContent;
        setProjectTitle(t);
        setProjectCat(project.acf.category);
        setProjectSlug(project.slug);
      }
    });
  };
  const handleClickList = () => {
    const b = isListOpen;
    setIsListOpen(!b);
  };

  return (
    <main
      className={`${
        isListOpen
          ? `${styles.main} ${styles.main_open}`
          : `${styles.main} ${styles.main_close}`
      }`}
    >
      {projects && (
        <>
          <div
            className={`${
              isListOpen
                ? `${styles.main_list_container} ${styles.main_list_container_open}`
                : `${styles.main_list_container} ${styles.main_list_container_close}`
            }`}
          >
            <div className={styles.main_list_container_group}>
              {projects.map((project, index) => {
                const parser = new DOMParser();
                const parsedEntity = parser.parseFromString(
                  project.title.rendered,
                  'text/html'
                );
                const t = parsedEntity.documentElement.textContent;
                return (
                  <div
                    key={index}
                    className={styles.main_list_container_element}
                  >
                    <Link href={`/work/${project.slug}`}>
                      <p className={styles.main_list_container_title}>{t}</p>
                      {project.acf.category && (
                        <p className={styles.main_list_container_category}>
                          {project.acf.category}
                        </p>
                      )}
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>

          <div className={styles.main_list}>
            <svg
              className={styles.main_list_icon}
              onClick={handleClickList}
              width='420'
              height='420'
              viewBox='0 0 420 420'
              fill='none'
              xmlns='http://www.w3.org/2000/svg'
            >
              {isListOpen ? (
                <>
                  <path
                    d='M144.968 267.52L267.597 144.89'
                    stroke='white'
                    strokeWidth='17.3859'
                    strokeLinecap='square'
                  />
                  <path
                    d='M151.422 144.89L274.051 267.52'
                    stroke='white'
                    strokeWidth='17.3859'
                    strokeLinecap='square'
                  />
                </>
              ) : (
                <>
                  <path
                    d='M123.156 250.678H297.408'
                    stroke='white'
                    strokeWidth='17.4689'
                    strokeLinecap='square'
                  />
                  <path
                    d='M123.156 161.15H297.408'
                    stroke='white'
                    strokeWidth='17.4689'
                    strokeLinecap='square'
                  />
                  <path
                    d='M123.156 205.696H297.408'
                    stroke='white'
                    strokeWidth='17.4689'
                    strokeLinecap='square'
                  />
                </>
              )}
            </svg>
          </div>

          <Canvas linear flat shadows className={styles.main_canvas}>
            <Suspense fallback={<Loader />}>
              <Scene
                sendIndex={sendIndex}
                projects={projects}
                swipeEl={swipeRef}
              />
            </Suspense>
          </Canvas>

          <div className={styles.main_info}>
            <Link
              className={styles.main_info_title}
              href={`/work/${projectSlug}`}
            >
              {projectTitle}
              <p className={styles.main_info_category}>{projectCat}</p>
            </Link>
          </div>

          <motion.div className={styles.main_swipe_text} ref={swipeRef}>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={transitionSwipe}
            >
              Swipe up
            </motion.p>
          </motion.div>
        </>
      )}
    </main>
  );
};

// Scene
const Scene = ({ sendIndex, projects, swipeEl }) => {
  const getIndex = (index) => {
    sendIndex(index);
  };

  return (
    <>
      {/* <OrbitControls /> */}
      <Environment files='./hdri/warehouse.exr' />
      <ambientLight intensity={1} />
      <directionalLight
        castShadow
        position={[1, 1, 1]}
        intensity={1}
        shadow-mapSize-height={1024}
        shadow-mapSize-width={1024}
      />
      <directionalLight
        castShadow
        position={[-1, -1, -1]}
        intensity={1}
        shadow-mapSize-height={1024}
        shadow-mapSize-width={1024}
      />

      {/* <fog attach="fog" color="white" near={1} far={DISTANCE + 10} /> */}

      <Suspense fallback={null}>
        <ScrollControls
          damping={0.1}
          pages={projects.length}
          distance={1}
          infinite
        >
          <Projects getIndex={getIndex} projects={projects} swipeEl={swipeEl} />
        </ScrollControls>
      </Suspense>
    </>
  );
};

// All Projects
const Projects = ({ getIndex, projects, swipeEl }) => {
  const projectsRef = useRef();
  const scroll = useScroll();
  const { camera, mouse } = useThree();
  const [index, setIndex] = useState(0);

  let oldscrolloffset = scroll.offset;

  useEffect(() => {
    getIndex(index);
  }, [index]);

  useFrame(() => {
    // move projects
    const moveZ =
      scroll.scroll.current * projectsRef.current.children.length * DISTANCE;
    projectsRef.current.position.set(0, 0, moveZ);

    const i = Math.floor(1 + moveZ / DISTANCE - 0.25);
    setIndex(i);

    // camera rotation
    const speed = window.innerWidth < 921 ? 0.1 : 0.9;
    gsap.to(camera.rotation, {
      x: mouse.y * speed,
      y: -mouse.x * speed,
      z: 0,
    });

    // hide swipe up
    if (oldscrolloffset != scroll.offset) {
      swipeEl.current.classList.add('hide');
    }
    oldscrolloffset = scroll.offset;
  });

  return (
    <group ref={projectsRef} position={[0, -1.5, 0]}>
      {projects.map((project, index) => {
        return <Project key={index} project={project} index={index} />;
      })}
    </group>
  );
};

// Project
const Project = ({ project, index }) => {
  const [preview, setPreview] = useState('');

  useEffect(() => {
    setPreview(project.acf.video.preview.url);
  }, [project]);

  return (
    <group position={[0, 0, -index * DISTANCE]}>
      {preview && (
        <>
          <Plane receiveShadow args={[3, 3]} position={[0, 0, 0]}>
            <PreviewMaterial url={preview} />
          </Plane>
        </>
      )}
    </group>
  );
};

const PreviewMaterial = ({ url }) => {
  const [texture, setTexture] = useState();
  const _texture = useTexture(url);
  useEffect(() => {
    setTexture(_texture);
  }, []);
  return (
    <>
      {texture && (
        <meshBasicMaterial
          map={texture}
          transparent
          toneMapped={false}
          opacity={1.0}
        />
      )}
    </>
  );
};

export default WorkPage;

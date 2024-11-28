'use client';
import Sketch from './module';
import Link from 'next/link';
import Image from 'next/image';
import gsap from 'gsap';
import * as THREE from 'three';

import { useRouter } from 'next/navigation';

// css
import styles from './Work.module.scss';

// react
import { useEffect, useState, useRef } from 'react';

// WorkPage
const WorkPage = () => {
  const [projects, setProjects] = useState(null);
  const [categories, setCategories] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const [state, setState] = useState('horizontal');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [url, setUrl] = useState('');
  const [list, setList] = useState(false);

  const projectsRef = useRef();
  const sceneRef = useRef();
  const router = useRouter();
  const stateRef = useRef(state);
  const sketchRef = useRef();
  const infoRef = useRef();

  const elemRef = useRef();
  const objsRef = useRef();

  // Sync state with ref
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch posts
        const postsRes = await fetch(
          'https://dashboard.jordigarreta.com/wp-json/wp/v2/posts?_embed&per_page=100'
        );
        const postsData = await postsRes.json();

        // Fetch categories
        const categoriesRes = await fetch(
          'https://dashboard.jordigarreta.com/wp-json/wp/v2/categories'
        );
        const categoriesData = await categoriesRes.json();

        setCategories(categoriesData);

        // Update state
        projectsRef.current = postsData;
        setProjects(postsData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }

    fetchData();
  }, []);

  useEffect(() => {
    if (!projects) return;

    let sketch = new Sketch({
      dom: sceneRef.current,
      router: router,
    });

    sketchRef.current = sketch;

    let speed = 0;
    let position = 0;
    let rounded = 0;

    objsRef.current = Array(projects.length).fill({ dist: 0 });

    let wrap = document.getElementById('wrap');
    elemRef.current = [...document.querySelectorAll('.n')];

    const debounce = (fn, delay) => {
      let timer;
      return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), delay);
      };
    };

    const handleWheel = debounce((e) => {
      speed += e.deltaY * 0.0003;
    }, 10);

    let touchStartY = 0;
    let touchMoveY = 0;

    const handleTouchStart = (e) => {
      touchStartY = e.touches[0].clientY;
    };

    const handleTouchMove = (e) => {
      touchMoveY = e.touches[0].clientY;
      let touchDelta = touchStartY - touchMoveY;
      speed += touchDelta * 0.003;
      touchStartY = touchMoveY;
      e.preventDefault(); // Prevents the default touch behavior
    };

    const handleMouseMove = (e) => {
      const mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      const mouseY = -(e.clientY / window.innerHeight) * 2 + 1;

      // Update camera position based on mouse coordinates
      sketchRef.current.camera.position.x = mouseX * 1; // adjust multiplier as needed
      sketchRef.current.camera.position.y = mouseY * 1; // adjust multiplier as needed

      // Make the camera look at the center of the scene
      sketchRef.current.camera.lookAt(new THREE.Vector3(0, 0, 0));

      // Update info position
      // Update div position
      if (infoRef.current) {
        infoRef.current.style.left = `${mouseX * 10}px`;
        infoRef.current.style.top = `${mouseY * 10}px`;
      }
    };

    function raf() {
      position += speed;
      speed *= 0.8;

      // Clamp position so we don't have infinite scroll
      position = Math.min(Math.max(position, 0), objsRef.current.length - 1);

      rounded = Math.round(position);
      let diff = rounded - position;

      position += Math.sign(diff) * Math.pow(Math.abs(diff), 0.7) * 0.015;

      const currentState = stateRef.current;

      if (currentState === 'vertical') {
        objsRef.current.forEach((o, i) => {
          o.dist = Math.min(Math.abs(position - i), 1);
          o.dist = 1 - o.dist ** 2;

          // div elements
          elemRef.current[i].style.transform = `scale(${1 + 0.4 * o.dist})`;

          // webgl elements
          let scale = 0.3 + 1 * o.dist;
          if (sketch.meshes[i]) {
            gsap.to(sketch.meshes[i].scale, {
              x: scale,
              y: scale,
              z: scale,
            });

            gsap.to(sketch.meshes[i].position, {
              x: 0,
              y: i * 1.2 - position * 1.2,
              z: 0,
            });

            sketch.meshes[i].material.uniforms.distanceFromCenter.value =
              o.dist;
          }
        });
        wrap.style.transform = `translate(0, ${-position * 50 + 25}px)`;
      } else if (currentState === 'horizontal') {
        objsRef.current.forEach((o, i) => {
          o.dist = Math.min(Math.abs(position - i), 1);
          o.dist = 1 - o.dist ** 2;

          // div elements
          elemRef.current[i].style.transform = `scale(${1 + 0.4 * o.dist})`;

          // webgl elements
          let scale = 0.3 + 1 * o.dist;

          if (sketch.meshes[i]) {
            gsap.to(sketch.meshes[i].scale, {
              x: scale,
              y: scale,
              z: scale,
            });

            gsap.to(sketch.meshes[i].position, {
              x: i * 1.7 - position * 1.7,
              y: 0,
              z: 0,
            });

            sketch.meshes[i].material.uniforms.distanceFromCenter.value =
              o.dist;
          }
        });
        wrap.style.transform = `translate(${-position * 50 + 25}px, 0)`;
      } else if (currentState === 'circle') {
        let radius = 1.5;
        let scale = 1;
        let initScale = 0.1;

        objsRef.current.forEach((o, i) => {
          o.dist = Math.min(Math.abs(position - i), 1);
          o.dist = 1 - o.dist ** 2;

          // Circle Slider
          let angle = ((i - position) / objsRef.current.length) * Math.PI * 2;

          gsap.to(sketch.meshes[i].position, {
            x: radius * Math.cos(angle + Math.PI / 2),
            y: radius * Math.sin(angle + Math.PI / 2) - o.dist * 1.5,
            z: o.dist,
          });

          gsap.to(sketch.meshes[i].scale, {
            x: initScale + scale * o.dist,
            y: initScale + scale * o.dist,
            z: initScale + scale * o.dist,
          });

          sketch.meshes[i].material.uniforms.distanceFromCenter.value = o.dist;
        });
      } else if (currentState === 'depth') {
        objsRef.current.forEach((o, i) => {
          o.dist = Math.min(Math.abs(position - i), 1);
          o.dist = 1 - o.dist ** 2;

          // div elements
          elemRef.current[i].style.transform = `scale(${1 + 0.4 * o.dist})`;

          // webgl elements
          // let scale = 0.3 + 1 * o.dist;
          let scale = 1 + 0.5 * o.dist;

          gsap.to(sketch.meshes[i].scale, {
            x: scale,
            y: scale,
            z: scale,
          });

          gsap.to(sketch.meshes[i].position, {
            x: i * 0.5 - position * 0.5,
            y: -1 + (i * 0.5 - position * 0.5) + o.dist * 1,
            z: -i * 0.2 + position * 0.2,
          });

          sketch.meshes[i].material.uniforms.distanceFromCenter.value = o.dist;
        });
        wrap.style.transform = `translate(${-position * 50 + 25}px, 0)`;
      }

      // Set Title Project
      const parser = new DOMParser();
      const parsedEntity = parser.parseFromString(
        projects[Math.round(position)].title.rendered,
        'text/html'
      );
      const t = parsedEntity.documentElement.textContent;
      setTitle(t);

      // Set Category Project
      const parsedEntityCategory = parser.parseFromString(
        projects[Math.round(position)].acf.category,
        'text/html'
      );
      const c = parsedEntityCategory.documentElement.textContent;
      setCategory(c);

      // Set URL Project
      const parsedEntityUrl = parser.parseFromString(
        projects[Math.round(position)].slug,
        'text/html'
      );
      const u = parsedEntityUrl.documentElement.textContent;
      setUrl(`/work/${u}`);

      window.requestAnimationFrame(raf);
    }

    raf();

    window.addEventListener('wheel', handleWheel);
    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('mousemove', handleMouseMove);
    // Cleanup function
    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('mousemove', handleMouseMove);
      sketchRef.current?.dispose();
    };
  }, [projects, router]);

  const handleMode = (e, _mode) => {
    const settingsMode = document.querySelectorAll('.settings-mode');
    settingsMode.forEach((s, i) => {
      s.classList.remove('mode-selected');
    });

    const settingsSelected = e.target;
    settingsSelected.classList.add('mode-selected');

    setState(_mode);
  };

  const handleList = () => {
    setList(!list);
  };

  const handleCategory = (_cat) => {
    setSelectedCategory(_cat);

    if (_cat === 'all') {
      setProjects(projectsRef.current);
    } else {
      const newProjects = [];
      projectsRef.current.forEach((proj) => {
        const categoryId = proj.categories[0];
        const category = categories.find((cat) => cat.id === categoryId);

        if (category.slug === _cat) {
          newProjects.push(proj);
        }
      });

      setProjects(newProjects);
    }
  };

  const getCategoryName = (post, categories) => {
    const categoryId = post.categories[0]; // Assuming the post has only one category
    const category = categories.find((cat) => cat.id === categoryId);
    return category ? category.slug : 'no-category';
  };

  return (
    <main className={styles.main}>
      <div id='wrap' className={styles.main__wrap}>
        {projects?.map((project, i) => {
          return (
            <div
              key={i}
              className={`n ${styles.main__n} ${styles[`main__n__${i}`]}`}
            >
              <Image
                loading='lazy'
                className='gallery-images'
                src={`${project.acf.video.preview.url}`}
                alt={String(i)}
                width={800}
                height={800 / 1.5}
                data-url={`/work/${project.slug}`}
                data-name={project.slug}
                data-category={getCategoryName(project, categories)}
              />
            </div>
          );
        })}
      </div>

      <div className={styles.main__canvas} ref={sceneRef}></div>

      <div className={styles.main__info}>
        <div ref={infoRef} className={styles.main__info__wrapper}>
          <p className={styles.main__info__title}>{title}</p>
          <p className={styles.main__info__category}>{category}</p>
          <Link href={url} className={styles.main__info__link}>
            View project
          </Link>
        </div>
      </div>

      {categories && (
        <div className={styles.main__categories}>
          <div
            className={`${styles.main__categories__item} ${
              selectedCategory === 'all'
                ? styles.main__categories__item__selected
                : ''
            }`}
            onClick={() => handleCategory('all')}
          >
            <p>ALL</p>
          </div>
          {categories
            .sort((a, b) => b.count - a.count)
            .filter((cat) => cat.count > 0)
            .map((cat, index) => (
              <div
                key={index}
                className={`${styles.main__categories__item} ${
                  selectedCategory === cat.slug
                    ? styles.main__categories__item__selected
                    : ''
                }`}
                onClick={() => handleCategory(cat.slug)}
              >
                <p>{cat.name}</p>
              </div>
            ))}

          <div
            className={`${styles.main__categories__bg} ${
              selectedCategory
                ? styles[
                    `main__categories__bg__${selectedCategory.toLowerCase()}`
                  ]
                : ''
            }`}
          ></div>
        </div>
      )}

      {projectsRef.current && (
        <>
          <div className={styles.main__burger} onClick={handleList}>
            <Image
              src={list ? './svg/close.svg' : './svg/burger.svg'}
              width={25}
              height={14}
              alt='burger'
            />
          </div>

          <div
            className={`${styles.main__list} ${
              list ? styles.main__list__open : styles.main__list__close
            }`}
          >
            <div className={styles.main__list__container}>
              <div className={styles.main__list__container__header}>
                <h3>Projects</h3>
                <h3>{projectsRef.current.length}</h3>
              </div>
              <div>
                {projectsRef.current.map((project, index) => {
                  const parser = new DOMParser();
                  const parsedEntity = parser.parseFromString(
                    project.title.rendered,
                    'text/html'
                  );
                  const t = parsedEntity.documentElement.textContent;
                  return (
                    <div
                      key={index}
                      className={styles.main__list__container__element}
                    >
                      <Link href={`/work/${project.slug}`}>
                        <p
                          className={
                            styles.main__list__container__element__title
                          }
                        >
                          {t}
                        </p>
                        {project.acf.category && (
                          <p
                            className={
                              styles.main__list__container__element__category
                            }
                          >
                            {project.acf.category}
                          </p>
                        )}

                        <Image
                          className={
                            styles.main__list__container__element__image
                          }
                          src={`${project.acf.video.preview.url}`}
                          alt={String(index)}
                          width={200}
                          height={200 / 1.5}
                        />
                      </Link>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className={styles.main__settings}>
            <ul className={styles.main__settings__list}>
              <li onClick={(e) => handleMode(e, 'horizontal')}>
                <Image
                  className='settings-mode mode-selected'
                  src='./svg/horizontal.svg'
                  width={24}
                  height={24}
                  alt='horizontal'
                />
              </li>
              <li onClick={(e) => handleMode(e, 'vertical')}>
                <Image
                  className='settings-mode'
                  src='./svg/vertical.svg'
                  width={24}
                  height={24}
                  alt='vertical'
                />
              </li>
              <li onClick={(e) => handleMode(e, 'circle')}>
                <Image
                  className='settings-mode'
                  src='./svg/rounded.svg'
                  width={24}
                  height={24}
                  alt='circle'
                />
              </li>
              <li onClick={(e) => handleMode(e, 'depth')}>
                <Image
                  className='settings-mode'
                  src='./svg/depth.svg'
                  width={24}
                  height={24}
                  alt='depth'
                />
              </li>
            </ul>
          </div>
        </>
      )}

      <div id='block' className={styles.main__block} />
    </main>
  );
};
export default WorkPage;

'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

// css
import styles from './Work.module.scss'

// react
import { useEffect, useState, useRef, Suspense } from 'react';

// react three fiber / drei
import { Canvas, useFrame, useThree, useLoader } from '@react-three/fiber';
import { ScrollControls, Plane, useTexture, useVideoTexture, useScroll, Environment, Html, Center} from '@react-three/drei';

// gsap
import gsap from "gsap";

import { motion } from 'framer-motion'

// sources
import sources from '../sources';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { TextureLoader } from 'three/src/loaders/TextureLoader'

import * as THREE from 'three'


// loader
import Loader from '../components/Loader/Loader'

const DISTANCE = 20

const transitionSwipe = { duration: 1, delay: 3, ease: [0.43, 0.13, 0.23, 0.96] };

const decode = (str) => {
    return str.replace(/&#(\d+);/g, function(match, dec) {
        return String.fromCharCode(dec);
    });
}

// WorkPage
const WorkPage = () => {

    const router = useRouter()

    const [projects, setProjects] = useState();
    const [categories, setCategories] = useState();
    const [isLoaded, setIsLoaded] = useState(false)

    const [column, setColumn] = useState()
    const [tunnel, setTunnel] = useState()

    const [projectTitle, setProjectTitle] = useState()
    const [projectCategories, setProjectCategories] = useState()
    const [projectSlug, setProjectSlug] = useState()

    const [isListOpen, setIsListOpen] = useState(false);

    let loaders
    let toLoad
    let items = {}
    let loaded = 0

    const scroll = useScroll()

    useEffect(() => {
        async function fetchData() {
            const res = await fetch(
                'https://dashboard.jordigarreta.com/wp-json/wp/v2/posts?_embed&per_page=100',
            )
            .then(res => res.json())
            .then(data => {
                setProjects(data);

                fetchCat()
            })
        }
        fetchData()

        async function fetchCat() {
            const res = await fetch(
                'https://dashboard.jordigarreta.com/wp-json/wp/v2/categories?_embed&per_page=100',
            )
            .then(res => res.json())
            .then(data => {
                setCategories(data);

                // load models
                toLoad = sources.length;
                setLoaders()
                startLoading(sources)
            })
        }
    }, [])

    const setLoaders = () => {
        loaders = {};
        loaders.gltfLoader = new GLTFLoader();
        loaders.textureLoader = new TextureLoader();
    }

    const startLoading = (allSources) => {
    
        for (const source of allSources) {
            if (source.type === "gltfModel") {
              loaders.gltfLoader.load(source.path, (model) => {
                sourceLoaded(source, model);
                if (source.name === 'column') {
                    setColumn(model)
                }
                if (source.name === 'tunnel') {
                    setTunnel(model)
                }
              });
            } else if (source.type === "textureModel") {
              loaders.textureLoader.load(source.path, (texture) => {
                sourceLoaded(source, texture);
              });
            }
        }     
    }

    const sourceLoaded = (source, file) => {
        items[source.name] = file;
        loaded++;
        if (loaded === toLoad) {
          console.log('** READY **')
          setIsLoaded(true)
        }
    }

    const sendIndex = (index) => {
        projects.forEach((project, i) => {
            if (i === index) {
                const parser = new DOMParser();
                const parsedEntity = parser.parseFromString(project.title.rendered, "text/html");
                const t = parsedEntity.documentElement.textContent;
                setProjectTitle(t)
                setProjectSlug(project.slug)

                let cats = ""
                
                if (categories) {
                    project.categories.forEach((cat, index) => {
                        categories.forEach(c => {
                            if (cat === c.id) {
                                cats += (index === project.categories.length - 1) ? c.name : (c.name + " / ");
                            }
                        })
                        setProjectCategories(cats)
                    })
                }

            }
        })
    }

    const Redirect = (e) => {
        e.preventDefault();
        router.push( `/work/${projectSlug}`, { name: 'Jordi' });
    }

    const handleClickList = () => {
        const b = isListOpen;
        setIsListOpen(!b)
    }

    return(
        <main className={`${isListOpen ? `${styles.main} ${styles.main_open}` : `${styles.main} ${styles.main_close}`}`}>

            {projects && (
                <>
                    <div
                        className={`${isListOpen ? `${styles.main_list_container} ${styles.main_list_container_open}` : `${styles.main_list_container} ${styles.main_list_container_close}`}`}
                    >
                        <div className={styles.main_list_container_group}>
                            {projects.map((project, index) => {
                                const parser = new DOMParser();
                                const parsedEntity = parser.parseFromString(project.title.rendered, "text/html");
                                const t = parsedEntity.documentElement.textContent;
                                return(
                                    <div key={index} className={styles.main_list_container_element}>
                                        <Link href={`/work/${project.slug}`}>
                                            <p className={styles.main_list_container_title}>{t}</p>
                                        </Link>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    <div className={styles.main_list}>
                        <svg className={styles.main_list_icon} onClick={handleClickList} width="420" height="420" viewBox="0 0 420 420" fill="none" xmlns="http://www.w3.org/2000/svg">
                            {isListOpen ? (
                                <>
                                    <path d="M144.968 267.52L267.597 144.89" stroke="white" strokeWidth="17.3859" strokeLinecap="square"/>
                                    <path d="M151.422 144.89L274.051 267.52" stroke="white" strokeWidth="17.3859" strokeLinecap="square"/>
                                </>
                            ) : (
                                <>
                                    <path d="M123.156 250.678H297.408" stroke="white" strokeWidth="17.4689" strokeLinecap="square"/>
                                    <path d="M123.156 161.15H297.408" stroke="white" strokeWidth="17.4689" strokeLinecap="square"/>
                                    <path d="M123.156 205.696H297.408" stroke="white" strokeWidth="17.4689" strokeLinecap="square"/>
                                </>
                            )}
                        </svg>
                    </div>

                    <Canvas
                        linear
                        flat
                        shadows
                        className={styles.main_canvas}
                    >
                        <Suspense fallback={<Loader />}>
                            <Scene sendIndex={sendIndex} categories={categories} projects={projects} tunnel={tunnel}/>
                        </Suspense>
                    </Canvas>

                    <div className={styles.main_info}>
                        <Link className={styles.main_info_title} href={`/work/${projectSlug}`}>
                            {projectTitle}
                        </Link>                  
                    </div>

                    <motion.div
                        className={styles.main_swipe_text}
                    >
                        <motion.p
                            initial={{opacity: 0, y: 20}}
                            animate={{opacity: 1, y: 0}}
                            transition={transitionSwipe}
                        >
                            Swipe up
                        </motion.p>
                    </motion.div>
                </>
            )}

        </main>
    )
}

// Scene
const Scene = ({sendIndex, categories, projects, tunnel}) => {

    const getIndex = (index) => {
        sendIndex(index)
    }

    return(
        <>
            {/* <OrbitControls /> */}
            <Environment files="./hdri/warehouse.exr" />
            <ambientLight intensity={1.} />
            <directionalLight
                castShadow
                position={[1, 1, 1]}
                intensity={1.}
                shadow-mapSize-height={1024}
                shadow-mapSize-width={1024}
            />
            <directionalLight
                castShadow
                position={[-1, -1, -1]}
                intensity={1.}
                shadow-mapSize-height={1024}
                shadow-mapSize-width={1024}
            />

            {/* <fog attach="fog" color="white" near={1} far={DISTANCE + 10} /> */}
            
            <Suspense fallback={null}>
                <ScrollControls damping={0.1} pages={projects.length} distance={1} infinite>
                    <Projects getIndex={getIndex} categories={categories} projects={projects} tunnel={tunnel}/>
                </ScrollControls>
            </Suspense>
        </>
    )
}

// All Projects
const Projects =({ getIndex, categories, projects, tunnel, sendScroll}) => {
    const projectsRef = useRef()
    const scroll = useScroll()
    const { camera, mouse } = useThree()
    const [index, setIndex] = useState(0)

    let oldscrolloffset = scroll.offset

    useEffect(() => {
        getIndex(index)
    }, [index])
    
    useFrame(() => {
        // move projects
        const moveZ = scroll.scroll.current * projectsRef.current.children.length * DISTANCE
        projectsRef.current.position.set(0, 0, moveZ);

        const i = Math.floor(1 + (moveZ / DISTANCE) - 0.25)
        setIndex(i)
        
        // camera rotation
        const speed = (window.innerWidth < 921) ? 0.1 : 0.9;
        gsap.to(camera.rotation, {
            x: mouse.y * speed,
            y: -mouse.x * speed,
            z: 0
        })        

    })

    return(
        <group ref={projectsRef} position={[0, -1.5, 0]}>
            {projects.map((project, index) => {
                return (
                    <Project key={index} categories={categories} project={project} index={index} tunnel={tunnel}/>
                )
            })}
        </group>
    )
} 

// Project
const Project = ({categories, project, index, tunnel}) => {
    const [title, setTitle] = useState("");
    const [video, setVideo] = useState("");
    const [videoAspectRatio, setVideoAspectRatio] = useState("");
    const [preview, setPreview] = useState("");
    const [videoPreview, setVideoPreview] = useState("");
    const [category, setCategory] = useState("");

    const [isMobile, setIsMobile] = useState(false)

    useEffect(() => {
        // title
        setTitle(project.title.rendered)
        // video
        setVideo(project.acf.video.video.url)
        // video aspect ratio
        setVideoAspectRatio(project.acf.video.imatge_preview.width / project.acf.video.imatge_preview.height)
        // video preview
        setVideoPreview(project.acf.video.imatge_preview.url)
        // preview
        setPreview(project.acf.video.preview.url)

        if (categories && project) {
            for (let i = 0; i < project.categories.length; i++) {
                for (let j = 0; j < categories.length; j++) {
                    if (project.categories[i] == categories[j].id) {
                        setCategory(categories[j].name);
                    }
                }
            }
        }
    }, [project, categories])

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 921) {
                setIsMobile(true)
            } else {
                setIsMobile(false)
            }
        }

        handleResize()

        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return(
        <group
            position={[0, 0, -index * DISTANCE]}
        >

            { video && (
                <>
                    <Plane receiveShadow args={[3, 3]} position={[0, 0, 0]}>
                        <PreviewMaterial url={preview} />
                    </Plane>
                    {/* <Plane receiveShadow args={[3, 3]} position={[0, 0, -0.5]}>
                        <PreviewMaterial url={preview} />
                    </Plane> */}
                </>
            )}
        </group>
    )
}

const PreviewMaterial = ({url}) => {
    const [texture, setTexture] = useState()
    const _texture = useTexture(url)
    useEffect(() => {
        setTexture(_texture)
    }, [])
    return(
        <>
            {texture && (
                <meshBasicMaterial map={texture} transparent toneMapped={false} opacity={1.0}/>
            )}
        </>
    )
}

export default WorkPage;
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

// sources
import sources from '../sources';
import { TextureLoader } from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'

// loader
import Loader from '../components/Loader/Loader'

const DISTANCE = 20

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

    useEffect(() => {
        async function fetchData() {
            const res = await fetch(
                'https://dashboard.jordigarreta.com/wp-json/wp/v2/posts'
            )
            .then(res => res.json())
            .then(data => {
                setProjects(data);
            })
        }
        fetchData()

        async function fetchCat() {
            const res = await fetch(
                'https://dashboard.jordigarreta.com/wp-json/wp/v2/categories'
            )
            .then(res => res.json())
            .then(data => {
                setCategories(data);
            })
        }
        fetchCat()



        // load models
        toLoad = sources.length;
        setLoaders()
        startLoading(sources)

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
        <main className={styles.main}>

            {projects && (
                <>
                    <div
                        className={`${isListOpen ? `${styles.main_list_container} ${styles.main_list_container_open}` : `${styles.main_list_container} ${styles.main_list_container_close}`}`}
                    >
                        <div className={styles.main_list_container_group}>
                            <h6 className={styles.main_list_container_all}>All projects</h6>
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
                        <svg className={styles.main_list_icon} onClick={handleClickList} width="964" height="964" viewBox="0 0 964 964" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="482" cy="482" r="463" stroke="#2F2F2F" strokeWidth="38"/>
                            {isListOpen ? (
                                <>
                                    <path d="M374.541 365.423L598.566 589.449" stroke="#2F2F2F" stroke-width="40" stroke-linecap="round"/>
                                    <path d="M365.423 589.449L589.449 365.423" stroke="#2F2F2F" stroke-width="40" stroke-linecap="round"/>
                                </>
                            ) : (
                                <>
                                    <path d="M235 597H751" stroke="#2F2F2F" stroke-width="40" stroke-linecap="round"/>
                                    <path d="M235 392H751" stroke="#2F2F2F" stroke-width="40" stroke-linecap="round"/>
                                    <path d="M235 494H751" stroke="#2F2F2F" stroke-width="40" stroke-linecap="round"/>
                                </>
                            )}
                        </svg>

                        <p className={styles.main_list_text}>{isListOpen ? '' : 'All projects'}</p>
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
                        <div>
                            <p className={styles.main_info_title}>{projectTitle}</p>
                            <p className={styles.main_info_categories}> - {projectCategories} -</p>
                        </div>
                        <button className={styles.main_info_button} onClick={Redirect}>
                            View project
                        </button>
                        
                    </div>
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

            <fog attach="fog" color="white" near={1} far={DISTANCE + 10} />
            
            <Suspense fallback={null}>
                <ScrollControls damping={0.1} pages={projects.length} distance={1} infinite>
                    <Projects getIndex={getIndex} categories={categories} projects={projects} tunnel={tunnel}/>
                </ScrollControls>
            </Suspense>
        </>
    )
}

// All Projects
const Projects =({ getIndex, categories, projects, tunnel }) => {
    const projectsRef = useRef()
    const scroll = useScroll()
    const { camera, mouse } = useThree()
    const [index, setIndex] = useState(0)

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
        const speed = 0.1;
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
    const [videoPreview, setVideoPreview] = useState("");
    const [category, setCategory] = useState("");

    useEffect(() => {
        // title
        setTitle(project.title.rendered)
        // video
        setVideo(project.acf.video.video.url)
        // video aspect ratio
        setVideoAspectRatio(project.acf.video.imatge_preview.width / project.acf.video.imatge_preview.height)
        // video preview
        setVideoPreview(project.acf.video.imatge_preview.url)

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

    return(
        <group
            position={[0, 0, -index * DISTANCE]}
        >

            { video && (
                <Plane receiveShadow args={[3*videoAspectRatio, 3]} position={[0, 0, 0]}>
                    <Suspense fallback={<FallbackMaterial url={videoPreview}/>}>
                        <VideoMaterial url={video} />
                    </Suspense>
                </Plane>
            )}

        </group>
    )
}

// Fallback material
const FallbackMaterial = ({url}) => {
    const texture = useTexture(url)
    return (
        <>
            {texture && (
                <meshBasicMaterial map={texture} toneMapped={false} />
            )}
        </>
    )
}

// Video material
const VideoMaterial = ({url}) => {
    const texture = useVideoTexture(url)
    return (
        <>
            {texture && (
                <meshBasicMaterial map={texture} toneMapped={false} />
            )}
        </>
    )
}

export default WorkPage;
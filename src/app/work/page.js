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
                            <path d="M841.169 473.038L841.169 468.371C839.344 460.273 834.767 453.057 828.217 447.951C821.666 442.846 813.548 440.166 805.243 440.369L158.568 440.369C149.039 440.369 139.901 444.151 133.164 450.884C126.426 457.617 122.641 466.748 122.641 476.269C122.641 485.79 126.426 494.922 133.164 501.654C139.901 508.387 149.039 512.169 158.568 512.169L805.243 512.169C814.771 512.169 823.909 508.387 830.647 501.654C837.384 494.922 841.169 485.79 841.169 476.269L841.169 473.038Z" fill="#2F2F2F"/>
                            <path d="M744 341.664L744 338.285C742.669 332.421 739.331 327.195 734.554 323.498C729.777 319.801 723.856 317.861 717.8 318.008L246.2 318.008C239.251 318.008 232.587 320.747 227.674 325.622C222.76 330.497 220 337.109 220 344.004C220 350.898 222.76 357.511 227.674 362.386C232.587 367.261 239.251 370 246.2 370L717.8 370C724.749 370 731.413 367.261 736.326 362.386C741.24 357.511 744 350.898 744 344.004L744 341.664Z" fill="#2F2F2F"/>
                            <path d="M744 606.664L744 603.285C742.669 597.421 739.331 592.195 734.554 588.498C729.777 584.801 723.856 582.861 717.8 583.008L246.2 583.008C239.251 583.008 232.587 585.747 227.674 590.622C222.76 595.497 220 602.109 220 609.004C220 615.898 222.76 622.511 227.674 627.386C232.587 632.261 239.251 635 246.2 635L717.8 635C724.749 635 731.413 632.261 736.326 627.386C741.24 622.511 744 615.898 744 609.004L744 606.664Z" fill="#2F2F2F"/>
                            <circle cx="482" cy="482" r="463" stroke="#2F2F2F" strokeWidth="38"/>
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
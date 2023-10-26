'use client'
import { Swiper, SwiperSlide } from 'swiper/react';
import { Mousewheel, Autoplay, FreeMode} from 'swiper/modules';
import 'swiper/css';
import styles from './Lab.module.scss'
import { useEffect, useRef, useState } from 'react';

import { motion } from 'framer-motion';

const LabPage = () => {

    const swiperRef = useRef()
    const [experiments, setExperiments] = useState();

    useEffect(() => {
        async function fetchData() {
            const res = await fetch(
                'https://dashboard.jordigarreta.com/wp-json/wp/v2/experiments?_embed&per_page=100'
            )
            .then(res => res.json())
            .then(data => {
                setExperiments(data);
            })
        }
        fetchData()
    }, [])

    const [isMobile, setIsMobile] = useState(false);
    useEffect(() => {
        function handleResize() {
            if (window.innerWidth < 921) {
                setIsMobile(true);
            } else {
                setIsMobile(false);
            }
        }

        handleResize(); // Check initial size
        window.addEventListener('resize', handleResize); // Attach event listener

        return () => {
            window.removeEventListener('resize', handleResize); // Remove event listener on unmount
        };
    }, []);

    const [tech, setTech] = useState("");

    const handleTech = (_tech) => {
        setTech(_tech);
    }

    return(
        <motion.main className={styles.labpage}>     
            {experiments && (
                <Swiper
                    ref={swiperRef}
                    slidesPerView={isMobile ? 2 : "auto"}
                    spaceBetween={0}
                    loop={true}
                    freeMode={true}
                    mousewheel={true}
                    modules={[Autoplay, Mousewheel, FreeMode]}
                    className={styles.myswiper}
                >
                    {experiments.map((experiment, index) => {
                        return(
                            <SwiperSlide
                                className={styles.swiperslide}
                                key={index}
                            >
                                <Experiment experiment={experiment} isMobile={isMobile} handleTech={handleTech}/>
                            </SwiperSlide>
                        )
                    })}
                </Swiper>
            )}
            
            <p className={styles.labpage_tech}>{tech}</p>
        
        </motion.main>
    )
}

const Experiment = ({ experiment, isMobile, handleTech }) => {

    const infoRef = useRef()
    const [showInfo, setShowInfo] = useState(false)

    const fileType = experiment.acf.file.type 

    const handlePointerEnter = (event, _tech) => {
        const targetElement = event.currentTarget
        const video = targetElement.querySelector('video')
        if (video !== null) {
            video.play()
        }

        setShowInfo(true)

        handleTech(_tech)
    }

    const handlePointerLeave = (event) => {
        const targetElement = event.currentTarget
        const video = targetElement.querySelector('video')

        if (video !== null) {
            video.pause()
        }

        setShowInfo(false)

        handleTech("")
    }

    return(
        <>
            <div
                className={styles.experiment}
                onMouseOver={(e) => handlePointerEnter(e, experiment.acf.info.technology)}
                onMouseLeave={(e) => handlePointerLeave(e)}
            >
                {fileType === 'video' ? (
                    <video
                        className={styles.experiment_videoElement}
                        src={experiment.acf.file.url}
                        loop
                        muted
                        autoPlay={isMobile ? true : false}
                    >
                        <source src={experiment.acf.file.url} type="video/mp4" />
                    </video>
                ) : (
                    <img className={styles.experiment_videoElement} src={experiment.acf.file.url} />
                )}
            </div>
        </>
    )
}

export default LabPage;
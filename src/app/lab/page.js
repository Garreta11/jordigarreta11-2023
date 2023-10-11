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

    return(
        <motion.main className={styles.labpage}>     
            {experiments && (
                <Swiper
                    ref={swiperRef}
                    slidesPerView={8}
                    spaceBetween={30}
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
                                <Experiment experiment={experiment} />
                            </SwiperSlide>
                        )
                    })}
                </Swiper>
            )}
        
        </motion.main>
    )
}

const Experiment = ({ experiment }) => {

    const infoRef = useRef()
    const [showInfo, setShowInfo] = useState(false)

    const handlePointerEnter = (event) => {
        const targetElement = event.currentTarget
        const video = targetElement.querySelector('video')
        video.play()

        setShowInfo(true)
    }

    const handlePointerLeave = (event) => {
        const targetElement = event.currentTarget
        const video = targetElement.querySelector('video')
        video.pause()

        setShowInfo(false)
    }

    return(
        <div
            className={styles.experiment}
            onMouseOver={(e) => handlePointerEnter(e)}
            onMouseLeave={(e) => handlePointerLeave(e)}
        >
            <video
                className={styles.experiment_videoElement}
                src={experiment.acf.file.url}
                loop
                muted
            >
                <source src={experiment.acf.file.url} type="video/mp4" />
            </video>
            <div
                ref={infoRef}
                className={showInfo ? `${styles.experiment_infoElement} ${styles.experiment_infoElement_show}` : styles.experiment_infoElement}
            >
                <p>{experiment.acf.info.technology}</p>
            </div>
        </div>
    )
}

export default LabPage;
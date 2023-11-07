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

    const [tech, setTech] = useState("");

    return(
        <motion.main className={styles.labpage}>     
            {experiments && (
                <Swiper
                    ref={swiperRef}
                    slidesPerView={"auto"}
                    spaceBetween={0}
                    loop={true}
                    freeMode={true}
                    mousewheel={true}
                    modules={[Autoplay, Mousewheel, FreeMode]}
                    className={styles.myswiper}
                    onSlideChange={(_swiper) => {
                        const currentSlide = _swiper.slides[_swiper.activeIndex];
                        const t = currentSlide.children[0].dataset.tech;
                        setTech(t)

                        _swiper.slides.forEach((slide, index) => {
                            if (index === _swiper.activeIndex) {
                                const video = slide.querySelector('video')
                                if (video !== null) {
                                    video.play()
                                }
                            } else {
                                const video = slide.querySelector('video')
                                if (video !== null) {
                                    video.pause()
                                }
                            }
                        })
                    }}
                >
                    {experiments.map((experiment, index) => {
                        return(
                            <SwiperSlide
                                className={styles.swiperslide}
                                key={index}
                            >
                                <Experiment experiment={experiment}/>
                            </SwiperSlide>
                        )
                    })}
                </Swiper>
            )}
            
            <p className={styles.labpage_tech}>{tech}</p>
        
        </motion.main>
    )
}

const Experiment = ({ experiment }) => {

    const fileType = experiment.acf.file.type 

    return(
        <>
            <div
                className={styles.experiment}
                data-tech={experiment.acf.info.technology}
            >
                {fileType === 'video' ? (
                    <video
                        className={styles.experiment_videoElement}
                        src={experiment.acf.file.url}
                        loop
                        muted
                        autoPlay={false}
                        playsInline={true}
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
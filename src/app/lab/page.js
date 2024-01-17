'use client'

import styles from './Lab.module.scss'
import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import { motion, useInView, useAnimation } from 'framer-motion'

gsap.registerPlugin(ScrollTrigger);

const transition = { delay: 0, duration: 1, ease: [0.43, 0.13, 0.23, 0.96] };

const LabPage = () => {

    const [experiments, setExperiments] = useState([]);

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

    return (
        <section className={styles.lab}>
            <div className={styles.lab__items}>
                {experiments.map((experiment, index) => (
                    <LabItem key={index} experiment={experiment} index={index} />
                ))}
            </div>
        </section>
    )
}

const LabItem = ({ experiment, index }) => {

    const ref = useRef(null)

    const [fromLeft, setFromLeft] = useState(0)

    const aspectRatio = experiment.acf.file.width > experiment.acf.file.height ? 'horizontal' : 'vertical';

    useEffect(() => {
        gsap.utils.toArray(".parallax-image").forEach((section, i) => {
            const heightDiff = section.offsetHeight - section.parentElement.offsetHeight;

            gsap.fromTo(section, {
                y: -heightDiff
            }, {
                scrollTrigger: {
                    trigger: section.parentElement,
                    scrub: true
                },
                y: 0,
                ease: "none"
            });
        });
    }, [])


    let move = 0
    if (index % 8 === 0 || index % 8 === 3 || index % 8 === 6) {
        move = -75
    } else {
        move = 75
    }

    const isInView = useInView(ref, { once: false })
    const mainControls = useAnimation()

    useEffect(() => {
        if (isInView) {
            mainControls.start("visible")
        } else {
            mainControls.start("hidden")
        }
    }, [isInView])

    return (
        <motion.div
            ref={ref}
            className={styles.lab__items__item}
            variants={{
                hidden: { opacity: 0, x: move },
                visible: { opacity: 1, x: 0 }
            }}
            initial="hidden"
            animate={mainControls}
            transition={transition}
        >
            <div
                className={`${styles.lab__items__item__wrapper} ${aspectRatio === 'horizontal' ? styles.lab__items__item__wrapper__horizontal : styles.lab__items__item__wrapper__vertical
                    }`}
            >
                <div className={`parallax-image ${styles.lab__items__item__media}`}>
                    <Experiment experiment={experiment} />
                </div>
            </div>
            <p className={styles.lab__items__item__tech}>{experiment.acf.info.technology}</p>
        </motion.div>
    )
}

const Experiment = ({ experiment }) => {
    const fileType = experiment.acf.file.type

    const [isPlaying, setIsPlaying] = useState(false);
    const videoRef = useRef(null);

    const handleMouseOver = () => {
        if (videoRef.current) {
            videoRef.current.play();
            setIsPlaying(true);
        }
    };

    const handleMouseLeave = () => {
        if (videoRef.current) {
            videoRef.current.pause();
            setIsPlaying(false);
        }
    };

    useEffect(() => {
        const handleResize = () => {
            const autoPlayValue = window.innerWidth < 921;
            if (videoRef.current) {
                videoRef.current.autoplay = autoPlayValue;
                setIsPlaying(autoPlayValue);
            }
        };

        // Initial setup
        handleResize();

        // Add event listener for window resize
        window.addEventListener('resize', handleResize);

        // Cleanup event listener on component unmount
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return (
        <>
            {fileType === 'video' ? (
                <video
                    ref={videoRef}
                    className={styles.lab__items__item__media__video}
                    src={experiment.acf.file.url}
                    loop
                    muted
                    autoPlay={window.innerWidth < 921}
                    playsInline={true}
                    onMouseOver={handleMouseOver}
                    onMouseLeave={handleMouseLeave}
                >
                    <source src={experiment.acf.file.url} type="video/mp4" />
                </video>
            ) : (
                <img className={styles.lab__items__item__media__img} src={experiment.acf.file.url} />
            )}
        </>
    )
}

export default LabPage
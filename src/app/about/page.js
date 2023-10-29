'use client'
import styles from './About.module.scss'
import { useEffect, useState, useRef, useInsertionEffect } from 'react'
import { motion } from 'framer-motion'

import { Swiper, SwiperSlide } from 'swiper/react';
import { Mousewheel, Autoplay, FreeMode} from 'swiper/modules';
import 'swiper/css';

const transition = { duration: 1, ease: [0.43, 0.13, 0.23, 0.96] };
const transitionCV = { delay: 2, duration: 1, ease: [0.43, 0.13, 0.23, 0.96] };
const transitionMake = { delay: 1, ease: [0.43, 0.13, 0.23, 0.96] };
const transitionFriends = { delay: 0.5, ease: [0.43, 0.13, 0.23, 0.96] };

const AboutPage = () => {

    const [aboutPage, setAbouPage] = useState()
    const [cvPage, setCvPage] = useState()

    // fetch data from wordpress
    useEffect(() => {
        async function fetchData() {
            const res = await fetch(
                'https://dashboard.jordigarreta.com/wp-json/wp/v2/pages'
            )
            .then(res => res.json())
            .then(data => {
                data.forEach(page => {
                    if (page.title.rendered === 'About me') {
                        setAbouPage(page)
                    }
                    if (page.title.rendered === 'cv') {
                        setCvPage(page)
                    }
                })

            })
        }
        fetchData()
    }, [])

    return(
        <main
            className={styles.about}
        >
            {aboutPage && (
                <div className={styles.about_about}>
                    <motion.p
                        initial={{opacity: 0, x: -20}}
                        animate={{opacity: 1, x: 0}}
                        transition={transition}
                        className={styles.about_about_description}
                    >
                        {aboutPage.acf.description}
                    </motion.p>
                </div>
            )}
            {cvPage && (
                <Marquee cvPage={cvPage} />
            )}
            {aboutPage && (
                <Friends aboutPage={aboutPage} />
            )}
        </main>
    )
}



const Marquee = ({cvPage}) => {

    const [skills, setSkills] = useState([])
    const swiperRef = useRef();

    useEffect(() => {
        let s = cvPage.acf.skills.replaceAll('<p>', '')
        s = s.replaceAll('</p>', '')
        
        setSkills(s.split('\n'))

        if (swiperRef) {
            swiperRef.current.children[0].style.transitionTimingFunction = 'linear'
        }

    }, [])


    return(
        <>
            <Swiper
                ref={swiperRef}
                slidesPerView='auto'
                autoplay={{
                    delay: 1,
                    disableOnInteraction: false,
                }}
                loop={true}
                speed={3000}
                freeModeMomentum={false}
                freeMode={true}
                mousewheel={false}
                modules={[Autoplay, Mousewheel, FreeMode]}
                className={styles.about__marquee}
            >
                {
                    skills.map((skill, index) => (
                        <SwiperSlide
                            className={styles.about__marquee__slide}
                            key={index}
                        >
                            <p >{skill} / </p>
                        </SwiperSlide>
                    ))
                }
            </Swiper>
        </>
    )
}

const Friends = ({aboutPage}) => {
    const [friends, setFriends] = useState([])

    useEffect(() => {
        let s = aboutPage.acf.friends.replaceAll('<p>', '')
        s = s.replaceAll('</p>', '')
        
        // setFriends(s.split('\n'))
        console.log(aboutPage.acf.friends)

    }, [])
    return(
        <div className={styles.about__friends}>
            <h3>FRIENDS</h3>
            {friends && (
                <div dangerouslySetInnerHTML={{__html: aboutPage.acf.friends}} />
            )}
        </div>
    )
}

export default AboutPage;
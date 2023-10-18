'use client'
import styles from './About.module.scss'
import { useEffect, useState, useRef } from 'react'
import { motion } from 'framer-motion'

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
                    <div className={styles.about_about_info}>
                        <motion.div
                            className={styles.about_about_make}
                            initial={{opacity: 0, x: -20}}
                            animate={{opacity: 1, x: 0}}
                            transition={transitionMake}
                        >
                            <p>MAKE.</p>
                            <p>MAKE.</p>
                            <p>MAKE.</p>
                        </motion.div>
                        <motion.div
                            className={styles.about_about_friends}
                            initial={{opacity: 0, x: 20}}
                            animate={{opacity: 1, x: 0}}
                            transition={transitionFriends}
                        >
                            <h2 className={styles.about_about_friends_title}>FRIENDS</h2>
                            <div dangerouslySetInnerHTML={{__html: aboutPage.acf.friends}} />
                        </motion.div>
                    </div>
                </div>
            )}
            {cvPage && (
                <motion.div
                    id='curriculum'
                    className={styles.about_cv}
                    initial={{opacity: 0, x: -20}}
                    animate={{opacity: 1, x: 0}}
                    transition={transitionCV}
                >
                    <h1 className={styles.about_cv_title}>Curriculum</h1>
                    <div className={styles.about_cv_top}>
                        <div className={styles.about_cv_workexperience}>
                            <h2>work experience</h2>
                            <div dangerouslySetInnerHTML={{__html: cvPage.acf.work_experience}} />
                        </div>

                        <div className={styles.about_cv_education}>
                            <h2>education</h2>
                            <div dangerouslySetInnerHTML={{__html: cvPage.acf.education}} />
                        </div>

                        <div className={styles.about_cv_skills}>
                            <h2>skills</h2>
                            <div dangerouslySetInnerHTML={{__html: cvPage.acf.skills}} />
                        </div>

                        <div className={styles.about_cv_languages}>
                            <h2>languages</h2>
                            <div dangerouslySetInnerHTML={{__html: cvPage.acf.languages}} />
                        </div>
                    </div>
                    <div className={styles.about_cv_bottom}>
                        <div className={styles.about_cv_contact}>
                            <h2>contact</h2>
                            <div dangerouslySetInnerHTML={{__html: cvPage.acf.contact}} />
                        </div>
                    </div>
                </motion.div>
            )}
        </main>
    )
}

export default AboutPage;
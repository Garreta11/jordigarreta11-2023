'use client'
import styles from './About.module.scss'
import { useEffect, useState, useRef } from 'react'

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
                    <p className={styles.about_about_description}>
                        {aboutPage.acf.description}
                    </p>
                    <div className={styles.about_about_info}>
                        <div
                            className={styles.about_about_make}
                        >
                            <p>MAKE.</p>
                            <p>MAKE.</p>
                            <p>MAKE.</p>
                        </div>
                        <div className={styles.about_about_friends}>
                            <h2 className={styles.about_about_friends_title}>FRIENDS</h2>
                            <div dangerouslySetInnerHTML={{__html: aboutPage.acf.friends}} />
                        </div>
                    </div>
                </div>
            )}
            {cvPage && (
                <div
                    id='curriculum'
                    className={styles.about_cv}
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
                </div>
            )}
        </main>
    )
}

export default AboutPage;
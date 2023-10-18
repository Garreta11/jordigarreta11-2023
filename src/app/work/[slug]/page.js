'use client'
import Link from 'next/link'
import styles from './project.module.scss'
import { useEffect, useState } from "react";

const ProjectPage = ({params}) => {

    const [project, setProject] = useState()

    useEffect(() => {
        async function fetchData() {
            const res = await fetch(
                'https://dashboard.jordigarreta.com/wp-json/wp/v2/posts'
            )
            .then(res => res.json())
            .then(data => {
                // console.log(data);
                data.forEach(d => {
                    if (d.slug === params.slug) {
                        setProject(d)
                        console.log(d)
                    }
                })
            })
        }
        fetchData()
    }, [])


    return(
        <section className={styles.project}>
            {project && (
                <>
                    <Link className={styles.project_arrow} href="/work/">
                        {/* <img src="/svg/arrow.svg" /> */}
                        Go back
                    </Link>
                    <h1 className={styles.project_title}>{project.title.rendered}</h1>
                    
                    <div className={styles.project_info}>
                        <div className={styles.project_info_description}>
                            <p>{project.acf.description}</p>
                            <div className={styles.project_images} dangerouslySetInnerHTML={{__html: project.content.rendered}}/>
                        </div>
                        
                        <div className={styles.project_info_right}>
                            <div className={styles.project_info_credits} dangerouslySetInnerHTML={{__html: project.acf.credits}}/>
                            {project.acf.project_link && (
                                <Link target="_blank" href={project.acf.project_link}>
                                    <button className={styles.project_link}>
                                        Project Link
                                    </button>
                                </Link>
                            )}
                        </div>
                    </div>
                </>
            )}
            
        </section>
    )

}

export default ProjectPage;
'use client'

import { useEffect, useState } from "react"
import styles from './BackgroundVideo.module.scss'

const BackgroundVideo = ({videoLoaded}) => {

    const [videoBG, setVideoBG] = useState()

    useEffect(() => {
        async function fetchData() {
            const res = await fetch(
                'https://dashboard.jordigarreta.com/wp-json/wp/v2/pages/14',
            )
            .then(res => res.json())
            .then(data => {
                setVideoBG(data.acf.video_bg.url);
                console.log(data.acf.video_bg.url)

                videoLoaded();
            })
        }
        fetchData()
    }, [])



    return (
        <>
        {videoBG && (
            <video
                className={styles.video}
                controls={false}
                muted
                autoPlay
                loop
            >
                <source src={videoBG} type="video/mp4" />
                Your browser does not support the video tag.
            </video>
        )}
        </>
    )
}

export default BackgroundVideo
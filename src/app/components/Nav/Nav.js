"use client"
import styles from './Nav.module.scss'
import Link from "next/link"
import { motion } from "framer-motion"

const transitionWork = { delay: 1.5, duration: 1, ease: [0.43, 0.13, 0.23, 0.96] };
const transitionLab = { delay: 1.5, duration: 1, ease: [0.43, 0.13, 0.23, 0.96] };

const Nav = () => {

    return (
        <div className={styles.nav}>
            {/* header */}
            <div className={styles.nav__header}>
                <Link href="/" className={styles.nav__header__title}>
                    Jordi Garreta
                </Link>

                <div className={styles.nav__header__job}>
                    <p>creative developer</p>
                </div>

                <Link className={styles.nav__header__about} href="/about">
                    About
                </Link>
            </div>

            {/* footer */}
            <div className={styles.nav__footer}>
                <div className={styles.nav__footer__top}>
                    <Link href="/work">WORK</Link>
                    <Link href="/lab">LAB</Link>
                </div>
                <div className={styles.nav__footer__bottom}>
                    <Link href="https://www.instagram.com/garreta11/">Instagram</Link>
                    <Link href="mailto:jordigarreta11@gmail.com">jordigarreta11@gmail.com</Link>
                </div>
            </div>
        </div>
    )

}

export default Nav
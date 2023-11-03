"use client"
import styles from './Nav.module.scss'
import Link from "next/link"
import { motion } from "framer-motion"

const transition = { delay: 1.5, duration: 1, ease: [0.43, 0.13, 0.23, 0.96] };
const transition2 = { delay: 2, duration: 1, ease: [0.43, 0.13, 0.23, 0.96] };

const Nav = () => {

    return (
        <div className={styles.nav}>
            {/* header */}
            <div className={styles.nav__header}>
                <motion.div
                    initial={{opacity: 0, x: -20}}
                    animate={{opacity: 1, x: 0}}
                    transition={transition}
                >
                    <Link href="/" className={styles.nav__header__title}>
                        Jordi Garreta
                    </Link>
                </motion.div>

                <motion.div
                    className={styles.nav__header__job}
                    initial={{opacity: 0, y: -20}}
                    animate={{opacity: 1, y: 0}}
                    transition={transition2}
                >
                    <p>creative developer</p>
                </motion.div>

                <motion.div
                    initial={{opacity: 0, x: 20}}
                    animate={{opacity: 1, x: 0}}
                    transition={transition}
                >
                    <Link className={styles.nav__header__about} href="/about">
                        About
                    </Link>
                </motion.div>
            </div>

            {/* footer */}
            <div className={styles.nav__footer}>
                <div className={styles.nav__footer__top}>
                    <motion.div
                        initial={{opacity: 0, x: -20}}
                        animate={{opacity: 1, x: 0}}
                        transition={transition}
                    >
                        <Link href="/work">WORK</Link>
                    </motion.div>
                    <motion.div
                        initial={{opacity: 0, x: 20}}
                        animate={{opacity: 1, x: 0}}
                        transition={transition}
                    >
                        <Link href="/lab">LAB</Link>
                    </motion.div>
                </div>
                <motion.div
                    className={styles.nav__footer__bottom}
                    initial={{opacity: 0, y: 20}}
                    animate={{opacity: 1, y: 0}}
                    transition={transition2}
                >
                    <Link href="https://www.instagram.com/garreta11/">Instagram</Link>
                    <Link href="mailto:jordigarreta11@gmail.com">jordigarreta11@gmail.com</Link>
                </motion.div>
            </div>
        </div>
    )

}

export default Nav
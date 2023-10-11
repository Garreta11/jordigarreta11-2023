"use client"

import styles from './Navigation.module.scss'
import Link from "next/link"
import { useState, useEffect } from "react"

import { useRouter } from 'next/navigation'

const links = [
    {
      label: "About",
      route: "/about"
    }
]

export default function Navigation() {

    const router = useRouter()

    const [isDarkMode, setIsDarkMode] = useState(false);
    
    useEffect(() => {
        // Check if the user has previously set a preference for dark mode in localStorage
        const storedDarkMode = localStorage.getItem('darkMode');
        if (storedDarkMode !== null) {
          setIsDarkMode(storedDarkMode === 'true');
        }
    }, []);
    
    useEffect(() => {
        // Update the document class when isDarkMode changes
        if (isDarkMode) {
          document.body.classList.add('dark-mode');
        } else {
          document.body.classList.remove('dark-mode');
        }
    
        // Save the user's preference for dark mode in localStorage
        localStorage.setItem('darkMode', isDarkMode);
    }, [isDarkMode]);

    const toggleTheme = () => {
        setIsDarkMode((prev) => !prev);
    };

    return(
        <header className={styles.header}>
            <Link className={styles.header_logo} href="/">
                <h1 className={styles.header_title}>Jordi Garreta</h1>
                <p className={styles.header_logo_job}>Creative Developer</p>
            </Link>
            <div className={styles.header_right}>
                <nav>
                    <ul className={styles.header_navigation}>
                        {links.map(({label, route}) => {
                        return(
                            <li key={route}>
                                {/* <Link className={styles.header_navigation_textstroke} href={route}>{label}</Link> */}
                                <p
                                    className={styles.header_navigation_textstroke}
                                    onClick={() => {router.push(route)}}
                                >
                                    {label}
                                </p>
                            </li>
                        )
                        })}
                    </ul>
                </nav>
                <button onClick={toggleTheme} className={styles.header_btn}>
                    <svg className={isDarkMode ? styles.header_btn_img : `${styles.header_btn_img} ${styles.header_btn_img_dark}`} width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M47.6284 90.5C-3.09619 87.9697 -3.09619 12.0293 47.6284 9.5C104.677 10.082 104.677 89.917 47.6284 90.5ZM52.1304 14.0449V85.9551C97.1909 83.7363 97.1909 16.2637 52.1304 14.0449Z" fill="#2F2F2F"/>
                    </svg>
                </button>
            </div>
        </header>
    )
}

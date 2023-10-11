'use client'

import { motion, AnimatePresence } from "framer-motion"

import { usePathname } from 'next/navigation';

const PageWrapper = ({ children }) => {

    const pathname = usePathname();
    console.log(pathname)

    return (
        <AnimatePresence>
            <motion.div
                key={pathname}
                initial={{ opacity: 0}}
                animate={{ opacity: 1}}
            >
                {children}
            </motion.div>
        </AnimatePresence>
    )
}

export default PageWrapper
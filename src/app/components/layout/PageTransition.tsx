'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { usePathname } from '@/i18n/navigation'
import { ReactNode } from 'react'

interface PageTransitionProps {
  children: ReactNode
}

const fadeVariants = {
  initial: {
    opacity: 0,
    scale: 0.98,
  },
  animate: {
    opacity: 1,
    scale: 1,
  },
  exit: {
    opacity: 0,
    scale: 1.02,
  },
}

export function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname()

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={fadeVariants}
        transition={{
          duration: 0.25,
          ease: 'easeInOut',
        }}
        style={{
          width: '100%',
          minHeight: '100vh',
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

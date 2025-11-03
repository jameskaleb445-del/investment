'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { usePathname } from 'next/navigation'
import { ReactNode } from 'react'

interface PageTransitionProps {
  children: ReactNode
}

const slideVariants = {
  initial: {
    x: '100%',
    opacity: 0.8,
  },
  animate: {
    x: 0,
    opacity: 1,
  },
  exit: {
    x: '-30%',
    opacity: 0.8,
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
        variants={slideVariants}
        transition={{
          type: 'tween',
          ease: [0.25, 0.46, 0.45, 0.94],
          duration: 0.3,
        }}
        style={{
          width: '100%',
          height: '100%',
          position: 'absolute',
          top: 0,
          left: 0,
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

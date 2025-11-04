'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { AiOutlineClose } from 'react-icons/ai'
import { ReactNode, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'

interface BottomSheetProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  maxHeight?: string
}

// Optimized animation variants - memoized to prevent recreation
const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
}

const sheetVariants = {
  hidden: { y: '100%' },
  visible: { y: 0 },
  exit: { y: '100%' },
}

const backdropTransition = {
  duration: 0.2,
  ease: 'easeOut' as const,
}

const sheetTransition = {
  type: 'tween' as const,
  ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
  duration: 0.35,
}

export function BottomSheet({ 
  isOpen, 
  onClose, 
  title,
  children,
  maxHeight = '90vh'
}: BottomSheetProps) {
  // Prevent background scroll when modal is open - optimized
  useEffect(() => {
    if (!isOpen) return
    
    // Save current scroll position
    const scrollY = window.scrollY
    const body = document.body
    const html = document.documentElement
    
    // Apply scroll lock
    body.style.position = 'fixed'
    body.style.top = `-${scrollY}px`
    body.style.width = '100%'
    body.style.overflow = 'hidden'
    
    return () => {
      // Restore scroll position when modal closes
      body.style.position = ''
      body.style.top = ''
      body.style.width = ''
      body.style.overflow = ''
      window.scrollTo(0, scrollY)
    }
  }, [isOpen])

  // Memoize close handler to prevent unnecessary re-renders
  const handleBackdropClick = useCallback(() => {
    onClose()
  }, [onClose])

  const handleContentClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
  }, [])

  // Render to portal for better performance and z-index management
  if (typeof window === 'undefined') {
    return null
  }

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop - Optimized with will-change */}
          <motion.div
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={backdropTransition}
            onClick={handleBackdropClick}
            className="fixed inset-0 bg-black/80 z-[100] cursor-pointer"
            style={{ willChange: 'opacity' }}
          />

          {/* Modal - Optimized with will-change and transform */}
          <motion.div
            variants={sheetVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={sheetTransition}
            className="fixed bottom-0 left-0 right-0 z-[101] theme-bg-primary rounded-t-3xl border-t theme-border shadow-2xl overflow-hidden flex flex-col"
            style={{ 
              maxHeight,
              willChange: 'transform',
            }}
            onClick={handleContentClick}
          >
            {/* Header */}
            {title && (
              <div className="flex items-center justify-between p-5 border-b theme-border flex-shrink-0">
                <h2 className="text-xl font-bold theme-text-primary">{title}</h2>
                <button
                  onClick={onClose}
                  className="w-9 h-9 rounded-full flex items-center justify-center theme-text-secondary hover:theme-text-primary hover:theme-bg-tertiary transition-colors cursor-pointer"
                  aria-label="Close"
                >
                  <AiOutlineClose className="w-5 h-5" />
                </button>
              </div>
            )}

            {/* Content - Scrollable */}
            <div className="flex-1 overflow-y-auto overscroll-contain">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  )
}


'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { AiOutlineClose } from 'react-icons/ai'
import { ReactNode, useEffect } from 'react'

interface BottomSheetProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  maxHeight?: string
}

export function BottomSheet({ 
  isOpen, 
  onClose, 
  title,
  children,
  maxHeight = '90vh'
}: BottomSheetProps) {
  // Prevent background scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      // Save current scroll position
      const scrollY = window.scrollY
      document.body.style.position = 'fixed'
      document.body.style.top = `-${scrollY}px`
      document.body.style.width = '100%'
      document.body.style.overflow = 'hidden'
      
      return () => {
        // Restore scroll position when modal closes
        document.body.style.position = ''
        document.body.style.top = ''
        document.body.style.width = ''
        document.body.style.overflow = ''
        window.scrollTo(0, scrollY)
      }
    }
  }, [isOpen])

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 0.2,
            }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 z-[100] backdrop-blur-sm cursor-pointer"
          />

          {/* Modal */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{
              type: 'tween',
              ease: [0.16, 1, 0.3, 1],
              duration: 0.35,
            }}
            className="fixed bottom-0 left-0 right-0 z-[101] bg-[#1a1a1f] rounded-t-3xl border-t border-[#2d2d35] shadow-2xl overflow-hidden flex flex-col"
            style={{ maxHeight }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            {title && (
              <div className="flex items-center justify-between p-5 border-b border-[#2d2d35] flex-shrink-0">
                <h2 className="text-xl font-bold text-white">{title}</h2>
                <button
                  onClick={onClose}
                  className="w-9 h-9 rounded-full flex items-center justify-center text-[#a0a0a8] hover:text-white hover:bg-[#2d2d35] transition-colors cursor-pointer"
                >
                  <AiOutlineClose className="w-5 h-5" />
                </button>
              </div>
            )}

            {/* Content - Scrollable */}
            <div className="flex-1 overflow-y-auto">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}


'use client'

import { useState, useEffect } from 'react'
import { HiSun, HiMoon } from 'react-icons/hi'
import { useTheme } from '@/app/contexts/ThemeContext'
import { cn } from '@/app/lib/utils'

interface ThemeToggleProps {
  variant?: 'default' | 'compact'
  className?: string
}

export function ThemeToggle({ variant = 'default', className }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className={cn(
        "w-10 h-10 rounded-lg bg-transparent border border-white/20 animate-pulse",
        variant === 'compact' && "w-8 h-8",
        className
      )} />
    )
  }

  if (variant === 'compact') {
    return (
      <button
        onClick={toggleTheme}
        className={cn(
          "flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200 cursor-pointer",
          "bg-transparent border border-white/20 hover:bg-white/10",
          "text-white hover:text-white",
          "dark:bg-transparent dark:border-white/20 dark:hover:bg-white/10",
          "dark:text-white dark:hover:text-white",
          "light:bg-transparent light:border-black/20 light:hover:bg-black/10",
          "light:text-black light:hover:text-black",
          className
        )}
        title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
      >
        {theme === 'light' ? (
          <HiMoon className="w-4 h-4" />
        ) : (
          <HiSun className="w-4 h-4" />
        )}
      </button>
    )
  }

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        "flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-200 cursor-pointer",
        "bg-[#2d2d35] border border-[#3a3a44] hover:bg-[#35353d] hover:border-[#4a4a54]",
        "text-white hover:text-white",
        "dark:bg-[#2d2d35] dark:border-[#3a3a44] dark:hover:bg-[#35353d] dark:hover:border-[#4a4a54]",
        "dark:text-white dark:hover:text-white",
        "light:bg-white light:border-gray-300 light:hover:bg-gray-50 light:hover:border-gray-400",
        "light:text-black light:hover:text-black",
        className
      )}
      title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
    >
      {theme === 'light' ? (
        <HiMoon className="w-5 h-5" />
      ) : (
        <HiSun className="w-5 h-5" />
      )}
    </button>
  )
}

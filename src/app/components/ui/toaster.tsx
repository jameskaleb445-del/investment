'use client'

import { Toaster as HotToaster } from 'react-hot-toast'

export function Toaster() {
  return (
    <HotToaster
      position="top-center"
      toastOptions={{
        duration: 4000,
        style: {
          background: '#2d2d35',
          color: '#ffffff',
          border: '1px solid #3a3a44',
          borderRadius: '0.5rem',
          padding: '12px 16px',
          fontSize: '14px',
          fontWeight: '500',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.2)',
        },
        success: {
          iconTheme: {
            primary: '#10b981',
            secondary: '#ffffff',
          },
          style: {
            borderColor: '#10b981',
          },
        },
        error: {
          iconTheme: {
            primary: '#ef4444',
            secondary: '#ffffff',
          },
          style: {
            borderColor: '#ef4444',
          },
        },
        loading: {
          iconTheme: {
            primary: '#8b5cf6',
            secondary: '#ffffff',
          },
          style: {
            borderColor: '#8b5cf6',
          },
        },
      }}
    />
  )
}


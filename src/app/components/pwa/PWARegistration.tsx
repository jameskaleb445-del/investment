'use client';

import { useEffect, useRef } from 'react';

export function PWARegistration() {
  const registeredRef = useRef(false);

  useEffect(() => {
    // Prevent double registration
    if (registeredRef.current) return;
    
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      // Check if service worker is already registered
      navigator.serviceWorker.getRegistration().then((existingRegistration) => {
        if (existingRegistration) {
          console.log('Service Worker already registered:', existingRegistration);
          registeredRef.current = true;
          return;
        }

        // Register service worker only if not already registered
        navigator.serviceWorker
          .register('/sw.js', { scope: '/' })
          .then((registration) => {
            console.log('Service Worker registered:', registration);
            registeredRef.current = true;
          })
          .catch((error) => {
            console.error('Service Worker registration failed:', error);
          });
      });

      // Handle PWA install prompt
      const handleBeforeInstallPrompt = (e: Event) => {
        // Prevent the mini-infobar from appearing
        e.preventDefault();
        // Show your own install UI if needed
        console.log('PWA install prompt available');
      };

      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

      // Cleanup event listener
      return () => {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      };
    }
  }, []);

  return null;
}


'use client';

import { useEffect } from 'react';

export function PWARegistration() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      // Register service worker
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .then((registration) => {
          console.log('Service Worker registered:', registration);
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error);
        });

      // Handle PWA install prompt
      let deferredPrompt: any;
      window.addEventListener('beforeinstallprompt', (e) => {
        // Prevent the mini-infobar from appearing
        e.preventDefault();
        // Stash the event so it can be triggered later
        deferredPrompt = e;
        // Show your own install UI if needed
        console.log('PWA install prompt available');
      });
    }
  }, []);

  return null;
}


'use client';

import { useEffect, useRef } from 'react';

export function PWARegistration() {
  const registeredRef = useRef(false);

  useEffect(() => {
    // Prevent double registration
    if (registeredRef.current) return;
    
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      // First, clear all old caches and unregister old service workers
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        // Unregister all existing service workers first
        registrations.forEach((registration) => {
          registration.unregister();
          console.log('Old Service Worker unregistered');
        });

        // Clear all caches
        if ('caches' in window) {
          caches.keys().then((cacheNames) => {
            cacheNames.forEach((cacheName) => {
              // Delete old version caches (v1 or anything that's not v2)
              if (cacheName.includes('v1') || (cacheName !== 'investment-app-v2' && cacheName !== 'investment-static-v2')) {
                caches.delete(cacheName);
                console.log('Old cache deleted:', cacheName);
              }
            });
          });
        }

        // Wait a moment, then register new service worker
        setTimeout(() => {
          navigator.serviceWorker
            .register('/sw.js?v=2', { scope: '/' })
            .then((registration) => {
              console.log('Service Worker registered (v2):', registration);
              registeredRef.current = true;

              // Force update on next reload
              if (registration.waiting) {
                registration.waiting.postMessage({ type: 'SKIP_WAITING' });
              }
            })
            .catch((error) => {
              console.error('Service Worker registration failed:', error);
            });
        }, 500);
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


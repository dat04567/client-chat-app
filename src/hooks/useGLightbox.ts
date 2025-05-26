'use client';

import { useEffect, useState } from 'react';

// Define the GLightbox interface based on the library's API
interface GLightbox {
  open: () => void;
  close: () => void;
  destroy: () => void;
  reload: () => void;
}

// Define the options interface based on GLightbox documentation
interface GLightboxOptions {
  selector?: string;
  elements?: any[];
  skin?: string;
  openEffect?: string;
  closeEffect?: string;
  slideEffect?: string;
  moreText?: string;
  moreLength?: number;
  cssEfects?: Record<string, any>;
  touchNavigation?: boolean;
  touchFollowAxis?: boolean;
  keyboardNavigation?: boolean;
  closeOnOutsideClick?: boolean;
  startAt?: number;
  width?: string | number;
  height?: string | number;
  videosWidth?: string | number;
  descPosition?: 'top' | 'bottom' | 'left' | 'right';
  loop?: boolean;
  zoomable?: boolean;
  draggable?: boolean;
  dragToleranceX?: number;
  dragToleranceY?: number;
  dragAutoSnap?: boolean;
  preload?: boolean;
  autoplayVideos?: boolean;
  autofocusVideos?: boolean;
  plyr?: Record<string, any>;
}

/**
 * Custom hook to initialize GLightbox with options
 * @param selector CSS selector for the elements to apply GLightbox to
 * @param options GLightbox initialization options
 * @param dependencies Array of dependencies that will trigger re-initialization
 * @returns Object with glightbox instance and reload function
 */
export default function useGLightbox(
  selector: string = '.glightbox',
  options: GLightboxOptions = {},
  dependencies: any[] = []
) {
  const [glightbox, setGlightbox] = useState<GLightbox | null>(null);

  useEffect(() => {
    // Ensure GLightbox is available in the client environment
    if (typeof window !== 'undefined') {
      // Dynamic import for GLightbox to avoid server-side rendering issues
      import('glightbox').then(({ default: GLightbox }) => {
        // Destroy previous instance if it exists
        if (glightbox) {
          glightbox.destroy();
        }

        // Set default options with our preferred settings
        const defaultOptions: GLightboxOptions = {
          touchNavigation: true,
          loop: true,
          autoplayVideos: true,
          ...options
        };

        // Initialize GLightbox with the selector and options
        const lightbox = GLightbox({ selector, ...defaultOptions });
        setGlightbox(lightbox);
      }).catch(err => {
        console.error('Error loading GLightbox:', err);
      });
    }

    // Cleanup function
    return () => {
      if (glightbox) {
        glightbox.destroy();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selector, ...dependencies]);

  // Function to manually reload GLightbox
  const reload = () => {
    if (glightbox) {
      glightbox.reload();
    }
  };

  return { glightbox, reload };
}

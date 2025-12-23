import { useRef, useState } from 'react';
import styles from './useHeightAnimation.module.css';

export function useHeightAnimation(duration: number = 400) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [lockedHeight, setLockedHeight] = useState<number | null>(null);
  const [shouldAnimate, setShouldAnimate] = useState(false);
  const animationTimeoutRef = useRef<number | null>(null);

  const lockHeight = () => {
    // Clear any pending animation cleanup
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
      animationTimeoutRef.current = null;
    }

    if (containerRef.current) {
      const height = containerRef.current.offsetHeight;
      console.log('[useHeightAnimation] Locking height to:', height);
      setLockedHeight(height);
      setShouldAnimate(false);
    }
  };

  const animateToAuto = () => {
    console.log('[useHeightAnimation] Starting animation');
    setShouldAnimate(true);
    
    // Clear any existing timeout
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
    }
    
    // Reset after animation completes
    animationTimeoutRef.current = window.setTimeout(() => {
      console.log('[useHeightAnimation] Animation complete');
      setLockedHeight(null);
      setShouldAnimate(false);
      animationTimeoutRef.current = null;
    }, duration + 50);
  };

  const getContainerProps = () => ({
    ref: containerRef,
    className: shouldAnimate ? styles.animateHeight : '',
    style: {
      height: lockedHeight !== null ? `${lockedHeight}px` : undefined,
      transitionDuration: shouldAnimate ? `${duration}ms` : undefined,
    },
  });

  return {
    lockHeight,
    animateToAuto,
    getContainerProps,
  };
}

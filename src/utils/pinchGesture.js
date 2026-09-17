import { cycleFontSize } from '../data/settingsStore';

/**
 * Attaches a 2-finger pinch gesture and trackpad pinch handler
 * to scale the recitation font size up or down.
 *
 * @param {HTMLElement|Window} target
 * @param {(newSize: string) => void} onFontChange - Callback when font size changes
 * @returns {() => void} Cleanup function
 */
export function usePinchFontResize(target, onFontChange) {
  if (typeof window === 'undefined' || !target) {
    return () => {};
  }

  let startDist = 0;
  let hasTriggered = false;
  let trackpadAccumulator = 0;
  let trackpadTimer = null;

  function getTouchDistance(touches) {
    if (touches.length < 2) return 0;
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.hypot(dx, dy);
  }

  function handleTouchStart(e) {
    if (e.touches.length === 2) {
      startDist = getTouchDistance(e.touches);
      hasTriggered = false;
    }
  }

  function handleTouchMove(e) {
    if (e.touches.length === 2 && startDist > 0) {
      const currentDist = getTouchDistance(e.touches);
      if (currentDist === 0) return;

      const ratio = currentDist / startDist;

      // Pinch outward: increase size
      if (ratio > 1.22 && !hasTriggered) {
        hasTriggered = true;
        const newSize = cycleFontSize(1);
        if (onFontChange) onFontChange(newSize);
        startDist = currentDist;
      }
      // Pinch inward: decrease size
      else if (ratio < 0.82 && !hasTriggered) {
        hasTriggered = true;
        const newSize = cycleFontSize(-1);
        if (onFontChange) onFontChange(newSize);
        startDist = currentDist;
      }
    }
  }

  function handleTouchEnd(e) {
    if (e.touches.length < 2) {
      startDist = 0;
      hasTriggered = false;
    }
  }

  function handleWheel(e) {
    if (!e.ctrlKey) return;
    // Trackpad pinch-to-zoom sends wheel events with ctrlKey=true
    e.preventDefault();
    trackpadAccumulator += e.deltaY;

    if (trackpadTimer) clearTimeout(trackpadTimer);
    trackpadTimer = setTimeout(() => {
      trackpadAccumulator = 0;
    }, 200);

    if (trackpadAccumulator < -40) {
      trackpadAccumulator = 0;
      const newSize = cycleFontSize(1);
      if (onFontChange) onFontChange(newSize);
    } else if (trackpadAccumulator > 40) {
      trackpadAccumulator = 0;
      const newSize = cycleFontSize(-1);
      if (onFontChange) onFontChange(newSize);
    }
  }

  const el = target === window ? window : target;

  el.addEventListener('touchstart', handleTouchStart, { passive: true });
  el.addEventListener('touchmove', handleTouchMove, { passive: true });
  el.addEventListener('touchend', handleTouchEnd, { passive: true });
  el.addEventListener('touchcancel', handleTouchEnd, { passive: true });
  el.addEventListener('wheel', handleWheel, { passive: false });

  return () => {
    el.removeEventListener('touchstart', handleTouchStart);
    el.removeEventListener('touchmove', handleTouchMove);
    el.removeEventListener('touchend', handleTouchEnd);
    el.removeEventListener('touchcancel', handleTouchEnd);
    el.removeEventListener('wheel', handleWheel);
    if (trackpadTimer) clearTimeout(trackpadTimer);
  };
}

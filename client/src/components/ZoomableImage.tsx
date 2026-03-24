import { useEffect, useRef, useState } from 'react';

interface Props {
  src: string;
  alt?: string;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
}

const ZoomableImage = ({ src, alt = '', onSwipeLeft, onSwipeRight }: Props) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  // All zoom/pan state in refs so event handlers don't stale-close
  const stateRef = useRef({ scale: 1, tx: 0, ty: 0 });
  const lastTap = useRef(0);
  const pinchDist = useRef<number | null>(null);
  const dragStart = useRef({ x: 0, y: 0, tx: 0, ty: 0 });
  const swipeStart = useRef({ x: 0, y: 0 });
  const isHoriz = useRef<boolean | null>(null);

  // Force re-render when transform changes
  const [, forceRender] = useState(0);

  const applyTransform = (scale: number, tx: number, ty: number, animated = false) => {
    if (!imgRef.current || !containerRef.current) return;
    const cw = containerRef.current.offsetWidth;
    const ch = containerRef.current.offsetHeight;
    const maxTx = (cw * (scale - 1)) / 2;
    const maxTy = (ch * (scale - 1)) / 2;
    const clampedTx = Math.max(-maxTx, Math.min(maxTx, tx));
    const clampedTy = Math.max(-maxTy, Math.min(maxTy, ty));
    stateRef.current = { scale, tx: clampedTx, ty: clampedTy };
    imgRef.current.style.transition = animated ? 'transform 0.25s ease' : 'none';
    imgRef.current.style.transform = `translate(${clampedTx}px, ${clampedTy}px) scale(${scale})`;
  };

  const resetZoom = (animated = false) => applyTransform(1, 0, 0, animated);

  const getTouchDist = (t: TouchList) => {
    const dx = t[0].clientX - t[1].clientX;
    const dy = t[0].clientY - t[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  useEffect(() => {
    resetZoom(false);
    stateRef.current = { scale: 1, tx: 0, ty: 0 };
  }, [src]);

  useEffect(() => {
    const handleResize = () => resetZoom(false);
    window.addEventListener('orientationchange', handleResize);
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('orientationchange', handleResize);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        const t = e.touches[0];
        swipeStart.current = { x: t.clientX, y: t.clientY };
        isHoriz.current = null;
        dragStart.current = { x: t.clientX, y: t.clientY, tx: stateRef.current.tx, ty: stateRef.current.ty };

        const now = Date.now();
        if (now - lastTap.current < 280) {
          e.preventDefault();
          if (stateRef.current.scale > 1) {
            resetZoom(true);
          } else {
            applyTransform(2.5, 0, 0, true);
          }
          lastTap.current = 0;
        } else {
          lastTap.current = now;
        }
      } else if (e.touches.length === 2) {
        e.preventDefault();
        pinchDist.current = getTouchDist(e.touches);
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        if (pinchDist.current === null) return;
        const newDist = getTouchDist(e.touches);
        const ratio = newDist / pinchDist.current;
        const newScale = Math.max(1, Math.min(5, stateRef.current.scale * ratio));
        pinchDist.current = newDist;
        applyTransform(newScale, stateRef.current.tx, stateRef.current.ty, false);
      } else if (e.touches.length === 1) {
        const t = e.touches[0];
        const dx = t.clientX - swipeStart.current.x;
        const dy = t.clientY - swipeStart.current.y;

        if (isHoriz.current === null && (Math.abs(dx) > 6 || Math.abs(dy) > 6)) {
          isHoriz.current = Math.abs(dx) > Math.abs(dy);
        }

        if (stateRef.current.scale > 1) {
          e.preventDefault();
          const newTx = dragStart.current.tx + (t.clientX - dragStart.current.x);
          const newTy = dragStart.current.ty + (t.clientY - dragStart.current.y);
          applyTransform(stateRef.current.scale, newTx, newTy, false);
        }
      }
    };

    const onTouchEnd = (e: TouchEvent) => {
      pinchDist.current = null;
      if (stateRef.current.scale <= 1 && e.changedTouches.length > 0) {
        const dx = e.changedTouches[0].clientX - swipeStart.current.x;
        const dy = e.changedTouches[0].clientY - swipeStart.current.y;
        if (isHoriz.current && Math.abs(dx) > 50 && Math.abs(dy) < 80) {
          if (dx < 0 && onSwipeLeft) onSwipeLeft();
          else if (dx > 0 && onSwipeRight) onSwipeRight();
        }
      }
      // Snap scale back to 1 if it went below (shouldn't happen but safety)
      if (stateRef.current.scale < 1) resetZoom(true);
    };

    el.addEventListener('touchstart', onTouchStart, { passive: false });
    el.addEventListener('touchmove', onTouchMove, { passive: false });
    el.addEventListener('touchend', onTouchEnd, { passive: true });

    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', onTouchEnd);
    };
  }, [src, onSwipeLeft, onSwipeRight]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full flex items-center justify-center overflow-hidden"
      style={{ touchAction: 'pan-y' }}
    >
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        draggable={false}
        style={{
          maxWidth: '100%',
          maxHeight: '100%',
          objectFit: 'contain',
          transformOrigin: 'center center',
          userSelect: 'none',
          pointerEvents: 'none',
        }}
      />
      <p className="absolute bottom-2 left-1/2 -translate-x-1/2 text-white/40 text-xs pointer-events-none select-none">
        Pinch to zoom · Double-tap to reset
      </p>
    </div>
  );
};

export default ZoomableImage;

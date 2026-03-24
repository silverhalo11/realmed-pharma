import { useEffect, useRef } from 'react';

interface Props {
  src: string;
  alt?: string;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  hint?: boolean;
}

const ZoomableImage = ({ src, alt = '', onSwipeLeft, onSwipeRight, hint = true }: Props) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const stateRef = useRef({ scale: 1, tx: 0, ty: 0 });
  const lastTap = useRef(0);
  const pinchDist = useRef<number | null>(null);
  const dragStart = useRef({ x: 0, y: 0, tx: 0, ty: 0 });
  const swipeStart = useRef({ x: 0, y: 0 });
  const isHoriz = useRef<boolean | null>(null);

  const applyTransform = (scale: number, tx: number, ty: number, animated = false) => {
    const img = imgRef.current;
    const el = containerRef.current;
    if (!img || !el) return;
    const cw = el.offsetWidth;
    const ch = el.offsetHeight;
    const maxTx = (cw * (scale - 1)) / 2;
    const maxTy = (ch * (scale - 1)) / 2;
    const cx = Math.max(-maxTx, Math.min(maxTx, tx));
    const cy = Math.max(-maxTy, Math.min(maxTy, ty));
    stateRef.current = { scale, tx: cx, ty: cy };
    img.style.transition = animated ? 'transform 0.22s ease' : 'none';
    img.style.transform = `translate(${cx}px, ${cy}px) scale(${scale})`;
  };

  const resetZoom = (animated = false) => applyTransform(1, 0, 0, animated);

  const dist = (t: TouchList) => {
    const dx = t[0].clientX - t[1].clientX;
    const dy = t[0].clientY - t[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  // Reset when slide changes
  useEffect(() => {
    stateRef.current = { scale: 1, tx: 0, ty: 0 };
    if (imgRef.current) {
      imgRef.current.style.transition = 'none';
      imgRef.current.style.transform = 'translate(0px, 0px) scale(1)';
    }
  }, [src]);

  // Reset on orientation change / resize so image always re-fits
  useEffect(() => {
    const onResize = () => resetZoom(true);
    window.addEventListener('orientationchange', onResize);
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('orientationchange', onResize);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  // Touch handlers (non-passive so we can preventDefault)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        const t = e.touches[0];
        swipeStart.current = { x: t.clientX, y: t.clientY };
        isHoriz.current = null;
        dragStart.current = {
          x: t.clientX, y: t.clientY,
          tx: stateRef.current.tx, ty: stateRef.current.ty,
        };
        const now = Date.now();
        if (now - lastTap.current < 280) {
          e.preventDefault();
          stateRef.current.scale > 1 ? resetZoom(true) : applyTransform(2.5, 0, 0, true);
          lastTap.current = 0;
        } else {
          lastTap.current = now;
        }
      } else if (e.touches.length === 2) {
        e.preventDefault();
        pinchDist.current = dist(e.touches);
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        if (pinchDist.current === null) return;
        const nd = dist(e.touches);
        const newScale = Math.max(1, Math.min(6, stateRef.current.scale * (nd / pinchDist.current)));
        pinchDist.current = nd;
        applyTransform(newScale, stateRef.current.tx, stateRef.current.ty);
      } else if (e.touches.length === 1) {
        const t = e.touches[0];
        const dx = t.clientX - swipeStart.current.x;
        const dy = t.clientY - swipeStart.current.y;
        if (isHoriz.current === null && (Math.abs(dx) > 6 || Math.abs(dy) > 6)) {
          isHoriz.current = Math.abs(dx) > Math.abs(dy);
        }
        if (stateRef.current.scale > 1) {
          e.preventDefault();
          applyTransform(
            stateRef.current.scale,
            dragStart.current.tx + (t.clientX - dragStart.current.x),
            dragStart.current.ty + (t.clientY - dragStart.current.y),
          );
        }
      }
    };

    const onTouchEnd = (e: TouchEvent) => {
      pinchDist.current = null;
      if (stateRef.current.scale < 1) resetZoom(true);
      if (stateRef.current.scale <= 1 && e.changedTouches.length > 0) {
        const dx = e.changedTouches[0].clientX - swipeStart.current.x;
        const dy = e.changedTouches[0].clientY - swipeStart.current.y;
        if (isHoriz.current && Math.abs(dx) > 45 && Math.abs(dy) < 90) {
          if (dx < 0) onSwipeLeft?.();
          else onSwipeRight?.();
        }
      }
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
      style={{ position: 'absolute', inset: 0, overflow: 'hidden', touchAction: 'none', background: '#000' }}
    >
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        draggable={false}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          transformOrigin: 'center center',
          userSelect: 'none',
          pointerEvents: 'none',
        }}
      />
      {hint && (
        <p
          style={{
            position: 'absolute',
            bottom: 10,
            left: '50%',
            transform: 'translateX(-50%)',
            color: 'rgba(255,255,255,0.35)',
            fontSize: 11,
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            userSelect: 'none',
          }}
        >
          Pinch to zoom · Double-tap to reset
        </p>
      )}
    </div>
  );
};

export default ZoomableImage;

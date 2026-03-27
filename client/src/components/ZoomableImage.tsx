import { useEffect, useRef } from 'react';

interface Props {
  src: string;
  alt?: string;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  hint?: boolean;
  fitMode?: 'contain' | 'cover';
}

/**
 * ZoomableImage — supports pinch-to-zoom, double-tap, pan, swipe navigation,
 * and auto-resets on orientation change.
 */
const ZoomableImage = ({
  src,
  alt = '',
  onSwipeLeft,
  onSwipeRight,
  hint = true,
  fitMode = 'contain',
}: Props) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  // scale=1 means "fit to container" (image at natural rendered size, no transform)
  const stateRef = useRef({ scale: 1, tx: 0, ty: 0 });
  // Base rendered size of the image before any CSS transform (measured after load/resize)
  const baseSizeRef = useRef({ w: 0, h: 0 });
  // Natural source image size (for sharpness-aware zoom limits)
  const naturalSizeRef = useRef({ w: 0, h: 0 });

  const lastTap = useRef(0);
  const pinchDist = useRef<number | null>(null);
  const dragStart = useRef({ x: 0, y: 0, tx: 0, ty: 0 });
  const swipeStart = useRef({ x: 0, y: 0 });
  const isHoriz = useRef<boolean | null>(null);

  /** Measure the image's rendered size (without transform applied). */
  const measureBase = () => {
    const img = imgRef.current;
    if (!img) return;
    // Temporarily clear transform to get real layout size
    const prev = img.style.transform;
    img.style.transform = 'none';
    baseSizeRef.current = { w: img.offsetWidth, h: img.offsetHeight };
    img.style.transform = prev;
  };

  const applyTransform = (scale: number, tx: number, ty: number, animated = false) => {
    const img = imgRef.current;
    const el = containerRef.current;
    if (!img || !el) return;

    const bw = baseSizeRef.current.w || el.offsetWidth;
    const bh = baseSizeRef.current.h || el.offsetHeight;

    // How much the scaled image overflows the container on each side
    const maxTx = Math.max(0, (bw * scale - el.offsetWidth) / 2);
    const maxTy = Math.max(0, (bh * scale - el.offsetHeight) / 2);

    const cx = Math.max(-maxTx, Math.min(maxTx, tx));
    const cy = Math.max(-maxTy, Math.min(maxTy, ty));

    stateRef.current = { scale, tx: cx, ty: cy };
    img.style.transition = animated ? 'transform 0.22s ease' : 'none';
    img.style.transform =
      scale === 1 && cx === 0 && cy === 0
        ? 'none'
        : `translate(${cx}px, ${cy}px) scale(${scale})`;
  };

  const resetZoom = (animated = false) => applyTransform(1, 0, 0, animated);

  const getMaxSharpScale = () => {
    const bw = baseSizeRef.current.w;
    const bh = baseSizeRef.current.h;
    const nw = naturalSizeRef.current.w;
    const nh = naturalSizeRef.current.h;
    if (!bw || !bh || !nw || !nh) return 8;
    const maxScaleByPixels = Math.min(nw / bw, nh / bh);
    return Math.max(1, Math.min(8, maxScaleByPixels));
  };

  const getTouchDist = (t: TouchList) => {
    const dx = t[0].clientX - t[1].clientX;
    const dy = t[0].clientY - t[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  // Re-measure and reset when src changes
  useEffect(() => {
    stateRef.current = { scale: 1, tx: 0, ty: 0 };
    baseSizeRef.current = { w: 0, h: 0 };
    naturalSizeRef.current = { w: 0, h: 0 };
    if (imgRef.current) {
      imgRef.current.style.transition = 'none';
      imgRef.current.style.transform = 'none';
    }
  }, [src]);

  // Reset on orientation change / window resize
  useEffect(() => {
    const onResize = () => {
      measureBase();
      resetZoom(false);
    };
    window.addEventListener('orientationchange', onResize);
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('orientationchange', onResize);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  // Touch handlers (non-passive to allow preventDefault)
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
          const targetScale = Math.min(2.5, getMaxSharpScale());
          stateRef.current.scale > 1 ? resetZoom(true) : applyTransform(targetScale, 0, 0, true);
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
        const nd = getTouchDist(e.touches);
        const maxSharpScale = getMaxSharpScale();
        const newScale = Math.max(1, Math.min(maxSharpScale, stateRef.current.scale * (nd / pinchDist.current)));
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
      style={{
        position: 'absolute',
        top: 0, right: 0, bottom: 0, left: 0,
        overflow: 'hidden',
        touchAction: 'none',
        background: '#000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        draggable={false}
        onLoad={() => {
          naturalSizeRef.current = {
            w: imgRef.current?.naturalWidth || 0,
            h: imgRef.current?.naturalHeight || 0,
          };
          measureBase();
          resetZoom(false);
        }}
        style={{
          /*
           * contain mode preserves full image inside viewport.
           * cover mode fills viewport and may crop edges.
           */
          ...(fitMode === 'cover'
            ? { position: 'absolute' as const, top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' as const }
            : { maxWidth: '100%', maxHeight: '100%', width: 'auto', height: 'auto', objectFit: 'contain' as const }
          ),
          display: 'block',
          transformOrigin: 'center center',
          imageRendering: 'auto',
          userSelect: 'none',
          pointerEvents: 'none',
        }}
      />
      {hint && (
        <p
          style={{
            position: 'absolute',
            bottom: 12,
            left: '50%',
            transform: 'translateX(-50%)',
            color: 'rgba(255,255,255,0.3)',
            fontSize: 12,
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

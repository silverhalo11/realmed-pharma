import { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight, Maximize, Minimize } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ZoomableImage from '@/components/ZoomableImage';

const TOTAL_SLIDES = 90;

const catalogSlides = Array.from({ length: TOTAL_SLIDES }, (_, i) => {
  const num = String(i + 1).padStart(2, '0');
  return `/catalog/slide-${num}.png`;
});

const requestFS = () => {
  const el = document.documentElement as any;
  (el.requestFullscreen || el.webkitRequestFullscreen || el.mozRequestFullScreen || el.msRequestFullscreen)?.call(el);
};

const exitFS = () => {
  const d = document as any;
  (d.exitFullscreen || d.webkitExitFullscreen || d.mozCancelFullScreen || d.msExitFullscreen)?.call(d);
};

const isFullscreen = () => !!(
  document.fullscreenElement ||
  (document as any).webkitFullscreenElement ||
  (document as any).mozFullScreenElement
);

const CatalogPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get('from') || '/products';

  const customImage = searchParams.get('image') ? decodeURIComponent(searchParams.get('image')!) : null;
  const productName = searchParams.get('productName') ? decodeURIComponent(searchParams.get('productName')!) : null;

  const rawSlide = Number(searchParams.get('slide') || 1);
  const initialSlide = Number.isFinite(rawSlide) ? Math.max(0, Math.min(TOTAL_SLIDES - 1, rawSlide - 1)) : 0;

  const [current, setCurrent] = useState(initialSlide);
  const [exiting, setExiting] = useState(false);
  const [fsActive, setFsActive] = useState(false);

  useEffect(() => {
    requestFS();
    const onFsChange = () => setFsActive(isFullscreen());
    document.addEventListener('fullscreenchange', onFsChange);
    document.addEventListener('webkitfullscreenchange', onFsChange);
    return () => {
      exitFS();
      document.removeEventListener('fullscreenchange', onFsChange);
      document.removeEventListener('webkitfullscreenchange', onFsChange);
    };
  }, []);

  const toggleFS = () => {
    isFullscreen() ? exitFS() : requestFS();
  };

  const goTo = useCallback((idx: number) => {
    if (idx < 0 || idx >= TOTAL_SLIDES) return;
    setCurrent(idx);
  }, []);

  const goNext = useCallback(() => goTo(current + 1), [current, goTo]);
  const goPrev = useCallback(() => goTo(current - 1), [current, goTo]);

  useEffect(() => {
    if (customImage) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === 'Escape') { exitFS(); setTimeout(() => navigate(returnTo), 50); }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [goNext, goPrev, navigate, returnTo, customImage]);

  const handleClose = () => {
    if (exiting) return;
    setExiting(true);
    exitFS();
    setTimeout(() => navigate(returnTo), 50);
  };

  if (customImage) {
    return (
      <div
        data-testid="catalog-fullscreen"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 100,
          background: '#000',
          display: 'flex',
          flexDirection: 'column',
          userSelect: 'none',
        }}
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 16px',
          height: 56,
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.85), rgba(0,0,0,0.5))',
          flexShrink: 0,
          zIndex: 10,
        }}>
          <button
            onClick={handleClose}
            data-testid="button-close-catalog"
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              height: 44, padding: '0 16px',
              borderRadius: 999, background: 'rgba(255,255,255,0.15)',
              color: '#fff', fontSize: 15, fontWeight: 600, border: 'none',
              cursor: 'pointer',
            }}
          >
            <ArrowLeft size={20} />
            Back
          </button>
          {productName && (
            <span style={{
              color: '#fff', fontSize: 14, fontWeight: 600,
              background: 'rgba(255,255,255,0.15)',
              padding: '4px 14px', borderRadius: 999,
              maxWidth: '50%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {productName}
            </span>
          )}
          <button
            onClick={toggleFS}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              height: 44, padding: '0 16px',
              borderRadius: 999, background: 'rgba(255,255,255,0.15)',
              color: '#fff', fontSize: 14, border: 'none', cursor: 'pointer',
            }}
          >
            {fsActive ? <Minimize size={20} /> : <Maximize size={20} />}
          </button>
        </div>

        <div style={{ flex: 1, position: 'relative' }}>
          <ZoomableImage
            src={customImage}
            alt={productName || 'Product catalogue image'}
            fitMode="contain"
          />
        </div>
      </div>
    );
  }

  return (
    <div
      data-testid="catalog-fullscreen"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        background: '#000',
        display: 'flex',
        flexDirection: 'column',
        userSelect: 'none',
      }}
    >
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
        height: 56,
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.85), rgba(0,0,0,0.5))',
        flexShrink: 0,
        zIndex: 10,
      }}>
        <button
          onClick={handleClose}
          data-testid="button-close-catalog"
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            height: 44, padding: '0 16px',
            borderRadius: 999, background: 'rgba(255,255,255,0.15)',
            color: '#fff', fontSize: 15, fontWeight: 600, border: 'none',
            cursor: 'pointer',
          }}
        >
          <ArrowLeft size={20} />
          Back
        </button>

        <span
          data-testid="text-slide-counter"
          style={{
            color: '#fff', fontSize: 15, fontWeight: 600,
            background: 'rgba(255,255,255,0.15)',
            padding: '4px 14px', borderRadius: 999,
          }}
        >
          {current + 1} / {TOTAL_SLIDES}
        </span>

        <button
          onClick={toggleFS}
          title={fsActive ? 'Exit fullscreen' : 'Enter fullscreen'}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            height: 44, padding: '0 16px',
            borderRadius: 999, background: 'rgba(255,255,255,0.15)',
            color: '#fff', fontSize: 14, border: 'none', cursor: 'pointer',
          }}
        >
          {fsActive ? <Minimize size={20} /> : <Maximize size={20} />}
        </button>
      </div>

      {/* Slide area */}
      <div style={{ flex: 1, position: 'relative' }}>
        <ZoomableImage
          key={current}
          src={catalogSlides[current]}
          alt={`Slide ${current + 1}`}
          onSwipeLeft={goNext}
          onSwipeRight={goPrev}
          fitMode="contain"
        />

        {current > 0 && (
          <button
            onClick={goPrev}
            data-testid="button-prev-slide"
            style={{
              position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)',
              width: 52, height: 52, borderRadius: '50%',
              background: 'rgba(0,0,0,0.45)', border: 'none',
              color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', zIndex: 20,
            }}
          >
            <ChevronLeft size={28} />
          </button>
        )}

        {current < TOTAL_SLIDES - 1 && (
          <button
            onClick={goNext}
            data-testid="button-next-slide"
            style={{
              position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)',
              width: 52, height: 52, borderRadius: '50%',
              background: 'rgba(0,0,0,0.45)', border: 'none',
              color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', zIndex: 20,
            }}
          >
            <ChevronRight size={28} />
          </button>
        )}
      </div>

    </div>
  );
};

export default CatalogPage;

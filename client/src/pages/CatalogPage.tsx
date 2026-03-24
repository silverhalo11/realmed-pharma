import { useState, useRef, useEffect, useCallback } from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ZoomableImage from '@/components/ZoomableImage';

const TOTAL_SLIDES = 90;

const slides = Array.from({ length: TOTAL_SLIDES }, (_, i) => {
  const num = String(i + 1).padStart(2, '0');
  return `/catalog/slide-${num}.png`;
});

const CatalogPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const rawSlide = Number(searchParams.get('slide') || 1);
  const initialSlide = Number.isFinite(rawSlide) ? Math.max(0, Math.min(TOTAL_SLIDES - 1, rawSlide - 1)) : 0;
  const returnTo = searchParams.get('from') || '/products';
  const [current, setCurrent] = useState(initialSlide);
  const [exiting, setExiting] = useState(false);
  const thumbsRef = useRef<HTMLDivElement>(null);

  const goTo = useCallback((idx: number) => {
    if (idx < 0 || idx >= TOTAL_SLIDES) return;
    setCurrent(idx);
  }, []);

  const goNext = useCallback(() => goTo(current + 1), [current, goTo]);
  const goPrev = useCallback(() => goTo(current - 1), [current, goTo]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === 'Escape') navigate(returnTo);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [goNext, goPrev, navigate, returnTo]);

  useEffect(() => {
    if (!thumbsRef.current) return;
    const btn = thumbsRef.current.children[current] as HTMLElement;
    if (btn) btn.scrollIntoView({ inline: 'center', behavior: 'smooth', block: 'nearest' });
  }, [current]);

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col select-none" data-testid="catalog-fullscreen">
      <div className="flex items-center justify-between px-3 h-14 bg-gradient-to-b from-black/90 to-black/60 backdrop-blur-sm z-10 flex-shrink-0">
        <button
          onClick={() => {
            if (exiting) return;
            setExiting(true);
            setTimeout(() => navigate(returnTo), 50);
          }}
          className="flex items-center gap-1.5 h-10 px-3 rounded-full bg-white/15 text-white font-medium text-sm hover:bg-white/25 active:scale-95 transition-all"
          data-testid="button-close-catalog"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>
        <span className="text-white text-sm font-semibold bg-white/15 px-3 py-1 rounded-full" data-testid="text-slide-counter">
          {current + 1} / {TOTAL_SLIDES}
        </span>
        <div className="w-[72px]" />
      </div>

      <div className="flex-1 relative overflow-hidden">
        <ZoomableImage
          key={current}
          src={slides[current]}
          alt={`Slide ${current + 1}`}
          onSwipeLeft={goNext}
          onSwipeRight={goPrev}
        />
        {current > 0 && (
          <button
            onClick={goPrev}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/40 flex items-center justify-center text-white transition-all active:scale-90 z-20"
            data-testid="button-prev-slide"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}
        {current < TOTAL_SLIDES - 1 && (
          <button
            onClick={goNext}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/40 flex items-center justify-center text-white transition-all active:scale-90 z-20"
            data-testid="button-next-slide"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}
      </div>

      <div className="bg-black/80 backdrop-blur-sm py-2 px-2 flex-shrink-0">
        <div ref={thumbsRef} className="flex gap-1 overflow-x-auto pb-1 snap-x scrollbar-hide">
          {slides.map((src, idx) => (
            <button
              key={idx}
              onClick={() => goTo(idx)}
              className={`flex-shrink-0 rounded-md overflow-hidden transition-all duration-200 ${
                idx === current
                  ? 'w-14 h-10 ring-2 ring-white opacity-100'
                  : 'w-12 h-8 opacity-40 hover:opacity-70'
              }`}
              data-testid={`thumbnail-${idx + 1}`}
            >
              {Math.abs(idx - current) <= 10 && (
                <img src={src} alt={`Thumb ${idx + 1}`} className="w-full h-full object-cover" loading="lazy" />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CatalogPage;

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Stethoscope, Package, ShoppingCart, MapPin, Bell, BookOpen, ChevronLeft, ChevronRight, UserCircle } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import logoPath from '@assets/realmed_bird_logo_white.png';

const Dashboard = () => {
  const navigate = useNavigate();
  const { doctors, products, orders, visits, reminders, userName } = useAppStore();

  const today = new Date().toISOString().split('T')[0];
  const todayVisits = visits.filter((v) => v.date === today);
  const activeReminders = reminders.filter((r) => !r.done);

  const cards = [
    { label: 'Doctors', count: doctors.length, icon: Stethoscope, path: '/doctors', color: 'bg-primary' },
    { label: 'Products', count: products.length, icon: Package, path: '/products', color: 'bg-accent' },
    { label: 'Orders', count: orders.length, icon: ShoppingCart, path: '/orders', color: 'bg-warning' },
    { label: 'Visits', count: todayVisits.length, icon: MapPin, path: '/visits', color: 'bg-info' },
    { label: 'Reminders', count: activeReminders.length, icon: Bell, path: '/reminders', color: 'bg-destructive' },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="px-4 pt-6 pb-3 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <img src={logoPath} alt="RealMed" className="w-12 h-12 rounded-xl object-contain" data-testid="img-logo" />
          <div>
            <p className="text-sm text-muted-foreground" data-testid="text-welcome">Welcome back, {userName}</p>
            <h1 className="text-xl font-bold text-foreground">RealMed Pharma</h1>
            <p className="text-[10px] text-muted-foreground tracking-wide">Serving & Preserving Eye Health</p>
          </div>
        </div>
        <button
          onClick={() => navigate('/profile')}
          data-testid="button-profile"
          className="p-2 rounded-lg hover:bg-secondary transition-colors mt-1"
        >
          <UserCircle className="w-6 h-6 text-primary" />
        </button>
      </div>

      <div className="px-4 pb-6 grid grid-cols-2 gap-3">
        {cards.map((c) => (
          <button
            key={c.label}
            onClick={() => navigate(c.path)}
            className="flex flex-col items-start gap-3 rounded-xl bg-card p-4 shadow-sm border active:scale-[0.97] transition-transform text-left"
          >
            <div className={`${c.color} w-10 h-10 rounded-lg flex items-center justify-center`}>
              <c.icon className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold text-card-foreground">{c.count}</p>
              <p className="text-sm text-muted-foreground">{c.label}</p>
            </div>
          </button>
        ))}
      </div>

      <div className="px-4 pb-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Product Catalog
          </h2>
          <button
            onClick={() => navigate('/catalog')}
            className="text-xs text-primary font-medium"
            data-testid="link-view-full-catalog"
          >
            View All 90 Slides
          </button>
        </div>
        <CatalogSlideshow onSlideClick={(slide) => navigate(`/catalog?slide=${slide}&from=/`)} />
      </div>

      {activeReminders.length > 0 && (
        <div className="px-4 pb-6">
          <h2 className="text-sm font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Upcoming Reminders</h2>
          <div className="flex gap-3 overflow-x-auto pb-2 snap-x">
            {activeReminders.slice(0, 5).map((r) => {
              const doc = doctors.find((d) => d.id === r.doctorId);
              return (
                <div key={r.id} className="min-w-[200px] snap-start rounded-xl bg-card border p-3 shadow-sm">
                  <p className="text-sm font-semibold text-card-foreground truncate">{r.text}</p>
                  <p className="text-xs text-muted-foreground mt-1">{doc?.name || 'Unknown'}</p>
                  <p className="text-xs text-muted-foreground">{r.date}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

const TOTAL_SLIDES = 90;
const catalogSlides = Array.from({ length: TOTAL_SLIDES }, (_, i) => {
  const num = String(i + 1).padStart(2, '0');
  return `/catalog/slide-${num}.png`;
});

const CatalogSlideshow = ({ onSlideClick }: { onSlideClick: (slide: number) => void }) => {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  const goNext = useCallback(() => setCurrent((c) => (c + 1) % TOTAL_SLIDES), []);
  const goPrev = useCallback(() => setCurrent((c) => (c - 1 + TOTAL_SLIDES) % TOTAL_SLIDES), []);

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(goNext, 3000);
    return () => clearInterval(timer);
  }, [paused, goNext]);

  return (
    <div
      className="relative rounded-xl overflow-hidden border shadow-sm bg-black"
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
    >
      <div
        className="cursor-pointer"
        onClick={() => onSlideClick(current + 1)}
        data-testid="catalog-slideshow"
      >
        <img
          src={catalogSlides[current]}
          alt={`Catalog Slide ${current + 1}`}
          className="w-full aspect-[16/10] object-contain bg-white"
          draggable={false}
          data-testid={`slideshow-image-${current + 1}`}
        />
      </div>
      <button
        onClick={(e) => { e.stopPropagation(); goPrev(); setPaused(true); }}
        className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 flex items-center justify-center text-white hover:bg-black/60"
        data-testid="button-slideshow-prev"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); goNext(); setPaused(true); }}
        className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 flex items-center justify-center text-white hover:bg-black/60"
        data-testid="button-slideshow-next"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
      <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full" data-testid="text-slideshow-counter">
        {current + 1} / {TOTAL_SLIDES}
      </div>
    </div>
  );
};

export default Dashboard;

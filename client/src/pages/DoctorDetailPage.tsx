import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Phone, MapPin, GraduationCap, Calendar, Building2, Stethoscope, StickyNote, Plus, X, Pill, BookOpen, ChevronLeft, ChevronRight, ArrowLeft, Store } from 'lucide-react';
import ZoomableImage from '@/components/ZoomableImage';
import PageHeader from '@/components/PageHeader';
import { useAppStore, Product } from '@/store/useAppStore';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
const API_BASE = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '');

const resolveImageUrl = (url?: string | null) => {
  if (!url) return '';
  if (/^https?:\/\//i.test(url)) return url;
  const path = url.startsWith('/') ? url : `/${url}`;
  return `${API_BASE}${path}`;
};

const fsRequest = () => {
  const el = document.documentElement as any;
  (el.requestFullscreen || el.webkitRequestFullscreen || el.mozRequestFullScreen)?.call(el);
};
const fsExit = () => {
  const d = document as any;
  (d.exitFullscreen || d.webkitExitFullscreen || d.mozCancelFullScreen)?.call(d);
};

const PrescribedCatalogViewer = ({ slides, initialIndex, onClose }: { slides: { product: Product; src: string }[]; initialIndex: number; onClose: () => void }) => {
  const [current, setCurrent] = useState(initialIndex);
  const [showControls, setShowControls] = useState(true);

  useEffect(() => {
    fsRequest();
    return () => { fsExit(); };
  }, []);

  useEffect(() => {
    if (!showControls) return;
    const timer = window.setTimeout(() => setShowControls(false), 2200);
    return () => window.clearTimeout(timer);
  }, [showControls, current]);

  const goTo = (idx: number) => {
    if (idx >= 0 && idx < slides.length) setCurrent(idx);
  };

  const handleClose = () => { fsExit(); onClose(); };

  return (
    <div
      data-testid="prescribed-catalog-viewer"
      onClick={() => setShowControls((s) => !s)}
      style={{ position: 'fixed', inset: 0, zIndex: 100, background: '#000', display: 'flex', flexDirection: 'column', userSelect: 'none' }}
    >
      {showControls && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 30, pointerEvents: 'none' }}>
          <button
            onClick={(e) => { e.stopPropagation(); handleClose(); }}
            data-testid="button-close-prescribed-catalog"
            style={{
              position: 'absolute',
              left: 12,
              top: 12,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              height: 40,
              padding: '0 14px',
              borderRadius: 999,
              background: 'rgba(0,0,0,0.45)',
              color: '#fff',
              fontSize: 14,
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              pointerEvents: 'auto',
            }}
          >
            <ArrowLeft size={18} />
            Back
          </button>
          <span
            data-testid="text-prescribed-slide-counter"
            style={{
              position: 'absolute',
              left: '50%',
              top: 12,
              transform: 'translateX(-50%)',
              color: '#fff',
              fontSize: 14,
              fontWeight: 600,
              background: 'rgba(0,0,0,0.45)',
              padding: '6px 14px',
              borderRadius: 999,
              pointerEvents: 'none',
            }}
          >
            {current + 1} / {slides.length}
          </span>
        </div>
      )}

      {/* Product name label */}
      <div style={{ position: 'absolute', top: showControls ? 58 : 12, left: 0, right: 0, zIndex: 20, display: 'flex', justifyContent: 'center', padding: '8px 0', pointerEvents: 'none' }}>
        <span data-testid="text-prescribed-product-name" style={{ background: 'rgba(var(--primary), 0.9)', color: '#fff', fontSize: 13, fontWeight: 700, padding: '4px 14px', borderRadius: 999 }}>
          {slides[current]?.product.name}
        </span>
      </div>

      {/* Slide area */}
      <div style={{ flex: 1, position: 'relative' }}>
        <ZoomableImage
          key={current}
          src={slides[current]?.src}
          alt={slides[current]?.product.name}
          onSwipeLeft={() => goTo(current + 1)}
          onSwipeRight={() => goTo(current - 1)}
          fitMode="cover"
        />
        {current > 0 && (
          <button
            onClick={(e) => { e.stopPropagation(); goTo(current - 1); }}
            data-testid="button-prev-prescribed-slide"
            style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', width: 52, height: 52, borderRadius: '50%', background: 'rgba(0,0,0,0.45)', border: 'none', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 20 }}
          >
            <ChevronLeft size={28} />
          </button>
        )}
        {current < slides.length - 1 && (
          <button
            onClick={(e) => { e.stopPropagation(); goTo(current + 1); }}
            data-testid="button-next-prescribed-slide"
            style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', width: 52, height: 52, borderRadius: '50%', background: 'rgba(0,0,0,0.45)', border: 'none', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 20 }}
          >
            <ChevronRight size={28} />
          </button>
        )}
      </div>

    </div>
  );
};

const DoctorDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { doctors, products, togglePrescribedProduct } = useAppStore();
  const [prescribeOpen, setPrescribeOpen] = useState(false);
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [catalogStartIdx, setCatalogStartIdx] = useState(0);
  const [search, setSearch] = useState('');

  const doctor = doctors.find((d) => d.id === id);

  if (!doctor) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <PageHeader title="Doctor" backTo="/doctors" />
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
          <p className="text-muted-foreground">Doctor not found</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate('/doctors')}>Back to Doctors</Button>
        </div>
      </div>
    );
  }

  const prescribed = (doctor.prescribedProducts || [])
    .map((pid) => products.find((p) => p.id === pid))
    .filter((p): p is Product => !!p);

  const prescribedSlides = prescribed
    .map((p) => ({
      product: p,
      src: p.catalogImage
        ? resolveImageUrl(p.catalogImage)
        : (p.catalogSlide && p.catalogSlide > 0
          ? `/catalog/slide-${String(p.catalogSlide).padStart(2, '0')}.png`
          : ''),
    }))
    .filter((s) => !!s.src);

  const filteredProducts = search.trim()
    ? products.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.composition || '').toLowerCase().includes(search.toLowerCase()) ||
        (p.category || '').toLowerCase().includes(search.toLowerCase())
      )
    : [];

  const openCatalogForProduct = (productId: string) => {
    const idx = prescribedSlides.findIndex((s) => s.product.id === productId);
    setCatalogStartIdx(idx >= 0 ? idx : 0);
    setCatalogOpen(true);
  };

  const details = [
    { icon: GraduationCap, label: 'Degree', value: doctor.degree },
    { icon: Calendar, label: 'Date of Birth', value: doctor.dob },
    { icon: Building2, label: 'Clinic', value: doctor.clinic },
    { icon: Phone, label: 'Phone', value: doctor.phone },
    { icon: MapPin, label: 'Address', value: doctor.address },
    { icon: Stethoscope, label: 'Specialty', value: doctor.specialty },
    { icon: Store, label: 'Medical Store', value: doctor.medicalStore },
    { icon: StickyNote, label: 'Notes', value: doctor.notes },
  ].filter((d) => d.value);

  return (
    <div className="min-h-screen bg-background pb-20">
      <PageHeader title="Doctor Details" backTo="/doctors" />

      <div className="px-4 py-4">
        <div className="rounded-xl bg-card border p-5 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <span className="text-xl font-bold text-primary" data-testid="text-doctor-initial">
                {doctor.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="min-w-0">
              <h2 className="text-xl font-bold text-card-foreground truncate" data-testid="text-doctor-name">
                {doctor.name}
              </h2>
              {doctor.degree && (
                <p className="text-sm text-muted-foreground" data-testid="text-doctor-degree">{doctor.degree}</p>
              )}
              {doctor.specialty && (
                <Badge variant="secondary" className="mt-1" data-testid="text-doctor-specialty">{doctor.specialty}</Badge>
              )}
            </div>
          </div>

          <div className="space-y-3">
            {details.map((d) => (
              <div key={d.label} className="flex items-start gap-3">
                <d.icon className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">{d.label}</p>
                  <p className="text-sm text-card-foreground" data-testid={`text-doctor-${d.label.toLowerCase().replace(/\s/g, '-')}`}>
                    {d.label === 'Phone' ? (
                      <a href={`tel:${d.value}`} className="text-primary underline">{d.value}</a>
                    ) : d.value}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
              <Pill className="w-4 h-4" />
              Prescribed Medicines
            </h3>
            <Button size="sm" variant="outline" onClick={() => setPrescribeOpen(true)} data-testid="button-add-medicine">
              <Plus className="w-4 h-4 mr-1" />Add
            </Button>
          </div>

          {prescribed.length === 0 ? (
            <div className="rounded-xl bg-card border p-6 text-center shadow-sm">
              <Pill className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No medicines assigned yet</p>
              <p className="text-xs text-muted-foreground mt-1">Tap "Add" to assign products from the catalogue</p>
            </div>
          ) : (
            <div className="space-y-2">
              {prescribed.map((p) => (
                <div key={p.id} className="flex items-center gap-3 rounded-xl bg-card border p-3 shadow-sm" data-testid={`prescribed-${p.id}`}>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-card-foreground truncate">{p.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{p.composition || p.category}</p>
                  </div>
                  {(p.catalogSlide > 0 || !!p.catalogImage) && (
                    <button
                      onClick={() => openCatalogForProduct(p.id)}
                      className="p-2 rounded-lg hover:bg-primary/10"
                      data-testid={`button-view-catalog-${p.id}`}
                    >
                      <BookOpen className="w-4 h-4 text-primary" />
                    </button>
                  )}
                  <button
                    onClick={() => togglePrescribedProduct(doctor.id, p.id)}
                    className="p-2 rounded-lg hover:bg-destructive/10"
                    data-testid={`button-remove-medicine-${p.id}`}
                  >
                    <X className="w-4 h-4 text-destructive" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {catalogOpen && prescribedSlides.length > 0 && (
        <PrescribedCatalogViewer
          slides={prescribedSlides}
          initialIndex={catalogStartIdx}
          onClose={() => setCatalogOpen(false)}
          key={catalogStartIdx}
        />
      )}

      <Dialog open={prescribeOpen} onOpenChange={(open) => { setPrescribeOpen(open); if (!open) setSearch(''); }}>
        <DialogContent className="max-w-[95vw] rounded-xl">
          <DialogHeader><DialogTitle>Assign Medicines</DialogTitle></DialogHeader>
          <Input
            placeholder="Type to search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            data-testid="input-search-medicine"
            autoFocus
          />
          <div className="space-y-2 max-h-[50vh] overflow-y-auto mt-2">
            {products.length === 0 ? (
              <p className="text-center text-muted-foreground py-4 text-sm">No products added yet. Add products first.</p>
            ) : !search.trim() ? (
              <p className="text-center text-muted-foreground py-4 text-sm">Type a product name to search ({products.length} products available)</p>
            ) : filteredProducts.length === 0 ? (
              <p className="text-center text-muted-foreground py-4 text-sm">No matches found</p>
            ) : (
              filteredProducts.slice(0, 20).map((p) => {
                const isAssigned = (doctor.prescribedProducts || []).includes(p.id);
                return (
                  <button
                    key={p.id}
                    onClick={() => togglePrescribedProduct(doctor.id, p.id)}
                    className={`w-full flex items-center gap-3 rounded-xl border p-3 transition-colors text-left ${
                      isAssigned ? 'bg-primary/10 border-primary/30' : 'bg-card hover:bg-secondary/50'
                    }`}
                    data-testid={`toggle-medicine-${p.id}`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-card-foreground truncate">{p.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{p.composition || p.category}</p>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      isAssigned ? 'bg-primary border-primary' : 'border-muted-foreground'
                    }`}>
                      {isAssigned && <span className="text-white text-xs font-bold">✓</span>}
                    </div>
                  </button>
                );
              })
            )}
            {search.trim() && filteredProducts.length > 20 && (
              <p className="text-center text-xs text-muted-foreground py-2">Showing 20 of {filteredProducts.length} results. Refine your search.</p>
            )}
          </div>
          <Button onClick={() => { setPrescribeOpen(false); setSearch(''); }} className="w-full mt-2" data-testid="button-done-medicine">Done</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DoctorDetailPage;

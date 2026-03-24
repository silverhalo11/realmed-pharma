import { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Phone, MapPin, GraduationCap, Calendar, Building2, Stethoscope, StickyNote, Plus, X, Pill, BookOpen, ChevronLeft, ChevronRight, ArrowLeft, Store } from 'lucide-react';
import ZoomableImage from '@/components/ZoomableImage';
import PageHeader from '@/components/PageHeader';
import { useAppStore, Product } from '@/store/useAppStore';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

const PrescribedCatalogViewer = ({ slides, initialIndex, onClose }: { slides: { product: Product; src: string }[]; initialIndex: number; onClose: () => void }) => {
  const [current, setCurrent] = useState(initialIndex);

  const goTo = (idx: number) => {
    if (idx >= 0 && idx < slides.length) setCurrent(idx);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col select-none" data-testid="prescribed-catalog-viewer">
      <div className="flex items-center justify-between px-3 h-14 bg-gradient-to-b from-black/90 to-black/60 backdrop-blur-sm z-10 flex-shrink-0">
        <button
          onClick={onClose}
          className="flex items-center gap-1.5 h-10 px-3 rounded-full bg-white/15 text-white font-medium text-sm hover:bg-white/25 active:scale-95 transition-all"
          data-testid="button-close-prescribed-catalog"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>
        <span className="text-white text-sm font-semibold bg-white/15 px-3 py-1 rounded-full" data-testid="text-prescribed-slide-counter">
          {current + 1} / {slides.length}
        </span>
        <div className="w-[72px]" />
      </div>

      <div className="absolute top-14 left-0 right-0 z-20 flex items-center justify-center py-2 pointer-events-none">
        <span className="bg-primary/90 text-white text-xs font-semibold px-3 py-1 rounded-full" data-testid="text-prescribed-product-name">
          {slides[current]?.product.name}
        </span>
      </div>

      <div className="flex-1 relative overflow-hidden">
        <ZoomableImage
          key={current}
          src={slides[current]?.src}
          alt={slides[current]?.product.name}
          onSwipeLeft={() => goTo(current + 1)}
          onSwipeRight={() => goTo(current - 1)}
        />
        {current > 0 && (
          <button
            onClick={() => goTo(current - 1)}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/40 flex items-center justify-center text-white transition-all active:scale-90 z-20"
            data-testid="button-prev-prescribed-slide"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}
        {current < slides.length - 1 && (
          <button
            onClick={() => goTo(current + 1)}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/40 flex items-center justify-center text-white transition-all active:scale-90 z-20"
            data-testid="button-next-prescribed-slide"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}
      </div>

      <div className="bg-black/80 backdrop-blur-sm py-2 px-3 flex-shrink-0">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {slides.map((s, idx) => (
            <button
              key={idx}
              onClick={() => goTo(idx)}
              className={`flex-shrink-0 rounded-lg overflow-hidden transition-all ${
                idx === current ? 'ring-2 ring-white opacity-100' : 'opacity-40 hover:opacity-70'
              }`}
            >
              <img src={s.src} alt={s.product.name} className="w-16 h-10 object-cover" loading="lazy" />
              <p className="text-[9px] text-white text-center truncate px-1 bg-black/60">{s.product.name}</p>
            </button>
          ))}
        </div>
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
    .filter((p) => p.catalogSlide > 0)
    .map((p) => ({
      product: p,
      src: `/catalog/slide-${String(p.catalogSlide).padStart(2, '0')}.png`,
    }));

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
                  {p.catalogSlide > 0 && (
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

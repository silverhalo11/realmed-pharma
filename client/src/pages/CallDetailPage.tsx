import { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ZoomableImage from '@/components/ZoomableImage';
import {
  Phone,
  Package,
  ThumbsUp,
  ThumbsDown,
  CheckCircle,
  MapPin,
  Building,
  MessageSquare,
  Trash2,
  BookOpen,
  X,
  ChevronLeft,
  ChevronRight,
  Save,
} from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import { useAppStore } from '@/store/useAppStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

const API_BASE = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '');

const resolveImageUrl = (url?: string | null) => {
  if (!url) return '';
  if (/^https?:\/\//i.test(url)) return url;
  const path = url.startsWith('/') ? url : `/${url}`;
  return `${API_BASE}${path}`;
};

const getSlideUrl = (slide: number | null | undefined) => {
  if (!slide) return null;
  return `/catalog/slide-${String(slide).padStart(2, '0')}.png`;
};

const fsRequest = () => {
  const el = document.documentElement as any;
  (el.requestFullscreen || el.webkitRequestFullscreen || el.mozRequestFullScreen)?.call(el);
};
const fsExit = () => {
  const d = document as any;
  (d.exitFullscreen || d.webkitExitFullscreen || d.mozCancelFullScreen)?.call(d);
};

const CatalogModal = ({
  slides,
  initialIndex,
  onClose,
}: {
  slides: { name: string; url: string }[];
  initialIndex: number;
  onClose: () => void;
}) => {
  const [current, setCurrent] = useState(initialIndex);

  useEffect(() => {
    fsRequest();
    return () => { fsExit(); };
  }, []);

  const handleClose = () => { fsExit(); onClose(); };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: '#000', display: 'flex', flexDirection: 'column', userSelect: 'none' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', height: 56, background: 'rgba(0,0,0,0.85)', flexShrink: 0 }}>
        <button
          onClick={handleClose}
          style={{ display: 'flex', alignItems: 'center', gap: 6, height: 44, padding: '0 16px', borderRadius: 999, background: 'rgba(255,255,255,0.15)', color: '#fff', fontSize: 15, fontWeight: 600, border: 'none', cursor: 'pointer' }}
        >
          <X size={20} /> Close
        </button>
        <span style={{ color: '#fff', fontSize: 15, fontWeight: 600 }}>{slides[current]?.name}</span>
        <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14 }}>{current + 1}/{slides.length}</span>
      </div>
      <div style={{ flex: 1, position: 'relative' }}>
        <ZoomableImage
          key={current}
          src={slides[current]?.url}
          alt={slides[current]?.name}
          onSwipeLeft={() => current < slides.length - 1 && setCurrent((c) => c + 1)}
          onSwipeRight={() => current > 0 && setCurrent((c) => c - 1)}
        />
        {current > 0 && (
          <button
            onClick={() => setCurrent((c) => c - 1)}
            style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', width: 52, height: 52, borderRadius: '50%', background: 'rgba(0,0,0,0.45)', border: 'none', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 20 }}
          >
            <ChevronLeft size={28} />
          </button>
        )}
        {current < slides.length - 1 && (
          <button
            onClick={() => setCurrent((c) => c + 1)}
            style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', width: 52, height: 52, borderRadius: '50%', background: 'rgba(0,0,0,0.45)', border: 'none', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 20 }}
          >
            <ChevronRight size={28} />
          </button>
        )}
      </div>
    </div>
  );
};

const CallDetailPage = () => {
  const { callId } = useParams<{ callId: string }>();
  const navigate = useNavigate();
  const { doctors, products, calls, updateCall, deleteCall, updateDoctor } = useAppStore();

  const call = calls.find((c) => c.id === callId);
  const doctor = doctors.find((d) => d.id === call?.doctorId);
  const [notes, setNotes] = useState(call?.notes || '');
  const [saving, setSaving] = useState(false);
  const [catalogModal, setCatalogModal] = useState<{ slides: { name: string; url: string }[]; index: number } | null>(null);

  const callProducts = useMemo(() => {
    if (!call?.products) return [];
    return call.products.map((cp) => ({
      ...cp,
      product: products.find((p) => p.id === cp.productId),
    }));
  }, [call, products]);

  const likedCount = callProducts.filter((p) => p.status === 'liked').length;
  const productCount = callProducts.length;

  const slidesWithUrls = useMemo(() => {
    return callProducts
      .map((cp) => {
        const url = cp.product?.catalogImage
          ? resolveImageUrl(cp.product.catalogImage)
          : getSlideUrl(cp.product?.catalogSlide);
        if (!url) return null;
        return { name: cp.product?.name || '', url };
      })
      .filter(Boolean) as { name: string; url: string }[];
  }, [callProducts]);

  const openCatalog = (productId: string) => {
    const idx = slidesWithUrls.findIndex((s) => {
      const cp = callProducts.find((c) => c.productId === productId);
      return s.name === cp?.product?.name;
    });
    if (slidesWithUrls.length > 0) {
      setCatalogModal({ slides: slidesWithUrls, index: Math.max(0, idx) });
    }
  };

  const updateProductStatus = async (productId: string, status: 'pending' | 'liked' | 'removed') => {
    if (!call) return;
    const newProducts = call.products?.map((p) =>
      p.productId === productId ? { ...p, status } : p
    );
    await updateCall({ ...call, products: newProducts || [] });

    // Sync prescribed products on doctor
    if (doctor) {
      const prods = doctor.prescribedProducts || [];
      let newPresc: string[];
      if (status === 'liked') {
        newPresc = prods.includes(productId) ? prods : [...prods, productId];
      } else {
        newPresc = prods.filter((p) => p !== productId);
      }
      if (newPresc.length !== prods.length || newPresc.some((p, i) => p !== prods[i])) {
        await updateDoctor({ ...doctor, prescribedProducts: newPresc });
      }
    }
  };

  const saveNotes = async () => {
    if (!call) return;
    setSaving(true);
    try {
      await updateCall({ ...call, notes });
      toast.success('Notes saved');
    } catch {
      toast.error('Failed to save notes');
    } finally {
      setSaving(false);
    }
  };

  const markCompleted = async () => {
    if (!call) return;
    await updateCall({ ...call, status: 'completed', notes });
    toast.success('Call marked as completed');
    navigate('/calls');
  };

  const handleDelete = async () => {
    if (!call) return;
    await deleteCall(call.id);
    navigate('/calls');
  };

  if (!call || !doctor) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Call not found</p>
      </div>
    );
  }

  const isCompleted = call.status === 'completed';

  return (
    <div className="min-h-screen bg-background pb-24">
      {catalogModal && (
        <CatalogModal
          slides={catalogModal.slides}
          initialIndex={catalogModal.index}
          onClose={() => setCatalogModal(null)}
        />
      )}

      <PageHeader
        title={isCompleted ? 'Call Summary' : 'Call Details'}
        back={() => navigate('/calls')}
        action={
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon">
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Call</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this call record? This cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        }
      />

      {/* Doctor Info */}
      <div className="px-4 pb-4">
        <div className="rounded-xl bg-card border p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
              <Phone className="w-6 h-6 text-primary-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-card-foreground">
                {doctor.name}
                {doctor.degree && <span className="text-muted-foreground font-normal text-sm"> ({doctor.degree})</span>}
              </p>
              {doctor.specialty && (
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> {doctor.specialty}
                </p>
              )}
              {doctor.clinic && (
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Building className="w-3 h-3" /> {doctor.clinic}
                </p>
              )}
            </div>
            <div className="text-right">
              <Badge variant={isCompleted ? 'default' : 'secondary'}>
                {isCompleted ? 'Completed' : 'Pending'}
              </Badge>
              <p className="text-xs text-muted-foreground mt-1">{call.date}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="px-4 pb-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-card border p-3 text-center">
            <p className="text-2xl font-bold text-card-foreground">{productCount}</p>
            <p className="text-xs text-muted-foreground">Products Shown</p>
          </div>
          <div className="rounded-xl bg-card border p-3 text-center">
            <p className="text-2xl font-bold text-green-500">{likedCount}</p>
            <p className="text-xs text-muted-foreground">Products Liked</p>
          </div>
        </div>
      </div>

      {/* Products with Catalog */}
      <div className="px-4 pb-4">
        <h2 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide flex items-center gap-2">
          <Package className="w-4 h-4" />
          Products Showcased ({productCount})
        </h2>
        <div className="space-y-3">
          {callProducts.map((cp) => {
            const slideUrl = getSlideUrl(cp.product?.catalogSlide);
            return (
              <div key={cp.productId} className="rounded-xl bg-card border overflow-hidden shadow-sm">
                <div className="flex items-center gap-3 p-3">
                  {/* Catalog Thumbnail */}
                  {slideUrl ? (
                    <button
                      onClick={() => openCatalog(cp.productId)}
                      className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 border bg-muted hover:opacity-80 transition-opacity"
                      title="View catalog"
                    >
                      <img
                        src={slideUrl}
                        alt={cp.product?.name}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ) : (
                    <div className="w-14 h-14 rounded-lg flex-shrink-0 bg-muted flex items-center justify-center border">
                      <Package className="w-6 h-6 text-muted-foreground" />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-card-foreground truncate">{cp.product?.name || 'Unknown'}</p>
                    <p className="text-xs text-muted-foreground">{cp.product?.category}</p>
                    {cp.product?.composition && (
                      <p className="text-xs text-muted-foreground truncate">{cp.product.composition}</p>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <Badge
                      variant={cp.status === 'liked' ? 'default' : cp.status === 'removed' ? 'destructive' : 'secondary'}
                      className="text-xs"
                    >
                      {cp.status === 'liked' ? '👍 Liked' : cp.status === 'removed' ? '👎 Removed' : 'Pending'}
                    </Badge>
                    {slideUrl && (
                      <button
                        onClick={() => openCatalog(cp.productId)}
                        className="text-xs text-primary flex items-center gap-1 mt-1"
                      >
                        <BookOpen className="w-3 h-3" /> Catalog
                      </button>
                    )}
                  </div>
                </div>

                {/* Reaction buttons */}
                <div className="flex border-t">
                    <button
                      onClick={() => updateProductStatus(cp.productId, cp.status === 'liked' ? 'pending' : 'liked')}
                      className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium transition-colors ${
                        cp.status === 'liked' ? 'bg-green-500/10 text-green-600' : 'text-muted-foreground hover:bg-muted'
                      }`}
                    >
                      <ThumbsUp className="w-4 h-4" /> Like
                    </button>
                    <div className="w-px bg-border" />
                    <button
                      onClick={() => updateProductStatus(cp.productId, cp.status === 'removed' ? 'pending' : 'removed')}
                      className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium transition-colors ${
                        cp.status === 'removed' ? 'bg-red-500/10 text-red-600' : 'text-muted-foreground hover:bg-muted'
                      }`}
                    >
                      <ThumbsDown className="w-4 h-4" /> Remove
                    </button>
                  </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Notes */}
      <div className="px-4 pb-4">
        <h2 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide flex items-center gap-2">
          <MessageSquare className="w-4 h-4" />
          Notes
        </h2>
        <Textarea
          placeholder="Add notes about this call..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="min-h-[100px]"
          disabled={isCompleted}
        />
        {!isCompleted && (
          <Button variant="outline" size="sm" className="mt-2 gap-1" onClick={saveNotes} disabled={saving}>
            <Save className="w-3 h-3" /> {saving ? 'Saving...' : 'Save Notes'}
          </Button>
        )}
      </div>

      {/* Mark Completed Button */}
      {!isCompleted && (
        <div className="fixed bottom-0 left-0 right-0 px-4 pb-6 pt-4 bg-gradient-to-t from-background via-background to-transparent">
          <Button className="w-full h-12 text-base gap-2" onClick={markCompleted}>
            <CheckCircle className="w-5 h-5" />
            Mark as Completed
          </Button>
        </div>
      )}
    </div>
  );
};

export default CallDetailPage;

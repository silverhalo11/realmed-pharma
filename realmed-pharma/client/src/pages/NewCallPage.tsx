import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Phone,
  Package,
  Check,
  Search,
  Save,
} from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import { useAppStore } from '@/store/useAppStore';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';

type SelectedProduct = {
  productId: string;
  status: 'pending' | 'liked' | 'removed';
};

const NewCallPage = () => {
  const { doctorId } = useParams<{ doctorId: string }>();
  const navigate = useNavigate();
  const { doctors, products, addCall } = useAppStore();

  const doctor = doctors.find((d) => d.id === doctorId);
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>([]);
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(false);

  const filteredProducts = useMemo(() => {
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.category || '').toLowerCase().includes(search.toLowerCase())
    );
  }, [products, search]);

  const toggleProduct = (productId: string) => {
    setSelectedProducts((prev) => {
      const exists = prev.find((p) => p.productId === productId);
      if (exists) return prev.filter((p) => p.productId !== productId);
      return [...prev, { productId, status: 'pending' }];
    });
  };

  const isSelected = (productId: string) =>
    selectedProducts.some((p) => p.productId === productId);

  const saveCall = async () => {
    if (!doctorId || selectedProducts.length === 0) return;
    setSaving(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      await addCall({
        doctorId,
        date: today,
        status: 'completed',
        products: selectedProducts,
        notes: '',
      });
      toast.success('Call saved successfully');
      navigate('/calls');
    } catch {
      toast.error('Failed to save call');
    } finally {
      setSaving(false);
    }
  };

  if (!doctor) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Doctor not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-36">
      <PageHeader title="New Call" back={() => navigate('/calls')} />

      {/* Doctor Info */}
      <div className="px-4 pb-4">
        <div className="rounded-xl bg-card border p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
              <Phone className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <p className="font-semibold text-card-foreground">
                {doctor.name}
                {doctor.degree && (
                  <span className="text-muted-foreground font-normal text-sm"> ({doctor.degree})</span>
                )}
              </p>
              <p className="text-sm text-muted-foreground">{doctor.specialty}</p>
              <p className="text-xs text-muted-foreground">{doctor.clinic}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Product Selection */}
      <div className="px-4 pb-4">
        <h2 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide flex items-center gap-2">
          <Package className="w-4 h-4" />
          Select Products to Showcase ({selectedProducts.length} selected)
        </h2>

        {selectedProducts.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {selectedProducts.map((sp) => {
              const p = products.find((x) => x.id === sp.productId);
              return (
                <span
                  key={sp.productId}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium cursor-pointer"
                  onClick={() => toggleProduct(sp.productId)}
                >
                  {p?.name}
                  <span className="ml-1 text-primary/70">×</span>
                </span>
              );
            })}
          </div>
        )}

        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="space-y-2 max-h-[50vh] overflow-y-auto">
          {filteredProducts.length === 0 && (
            <p className="text-center text-muted-foreground py-6">No products found.</p>
          )}
          {filteredProducts.map((product) => (
            <button
              key={product.id}
              onClick={() => toggleProduct(product.id)}
              className={`w-full rounded-lg border p-3 text-left flex items-center gap-3 transition-colors ${
                isSelected(product.id)
                  ? 'bg-primary/10 border-primary/30'
                  : 'bg-card hover:bg-muted/50'
              }`}
            >
              <Checkbox
                checked={isSelected(product.id)}
                onCheckedChange={() => toggleProduct(product.id)}
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-card-foreground truncate">{product.name}</p>
                <p className="text-xs text-muted-foreground">
                  {product.category}{product.composition ? ` - ${product.composition}` : ''}
                </p>
              </div>
              {isSelected(product.id) && <Check className="w-5 h-5 text-primary flex-shrink-0" />}
            </button>
          ))}
        </div>
      </div>

      {/* Save Call Button */}
      <div className="fixed bottom-14 left-0 right-0 px-4 pb-4 pt-4 bg-gradient-to-t from-background via-background to-transparent">
        <Button
          className="w-full h-12 text-base gap-2"
          onClick={saveCall}
          disabled={selectedProducts.length === 0 || saving}
        >
          <Save className="w-5 h-5" />
          {saving ? 'Saving...' : `Save Call with ${selectedProducts.length} Product${selectedProducts.length !== 1 ? 's' : ''}`}
        </Button>
      </div>
    </div>
  );
};

export default NewCallPage;

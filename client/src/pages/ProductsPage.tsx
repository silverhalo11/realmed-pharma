import { useState } from 'react';
import { Plus, Trash2, ChevronLeft, ChevronRight, BookOpen, Search, FlaskConical } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '@/components/PageHeader';
import { useAppStore } from '@/store/useAppStore';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

const ProductsPage = () => {
  const navigate = useNavigate();
  const { products, categories, addProduct, deleteProduct, addCategory } = useAppStore();
  const [open, setOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const [newCat, setNewCat] = useState('');
  const [form, setForm] = useState({ name: '', category: '', composition: '', description: '', catalogSlide: 0 });
  const [slideIdx, setSlideIdx] = useState(0);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');

  const filtered = products
    .filter((p) => filter === 'All' || p.category === filter)
    .filter((p) => !search || p.name.toLowerCase().includes(search.toLowerCase()) || (p.composition || '').toLowerCase().includes(search.toLowerCase()));

  const save = () => {
    if (!form.name.trim()) return;
    addProduct(form);
    setOpen(false);
    setForm({ name: '', category: '', composition: '', description: '', catalogSlide: 0 });
  };

  const saveCat = () => {
    if (!newCat.trim()) return;
    addCategory(newCat.trim());
    setNewCat('');
    setCatOpen(false);
  };

  const openCatalogSlide = (slide: number) => {
    if (slide > 0) {
      navigate(`/catalog?slide=${slide}`);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <PageHeader
        title="Products"
        action={
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => setCatOpen(true)} data-testid="button-add-category">+ Category</Button>
            <Button size="sm" onClick={() => setOpen(true)} data-testid="button-add-product"><Plus className="w-4 h-4 mr-1" />Add</Button>
          </div>
        }
      />

      <div className="px-4 pb-2">
        <button
          onClick={() => navigate('/catalog')}
          data-testid="button-view-catalog"
          className="w-full flex items-center gap-3 rounded-xl bg-primary/10 border border-primary/20 p-4 transition-colors active:scale-[0.98]"
        >
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-primary-foreground" />
          </div>
          <div className="text-left">
            <p className="font-semibold text-foreground">Product Catalog</p>
            <p className="text-xs text-muted-foreground">View full product catalog (90 pages)</p>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground ml-auto" />
        </button>
      </div>

      <div className="px-4 pb-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search products or composition..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setSlideIdx(0); }}
            className="pl-9"
            data-testid="input-search-products"
          />
        </div>
      </div>

      <div className="px-4 py-2 flex gap-2 overflow-x-auto">
        {['All', ...categories].map((c) => (
          <button
            key={c}
            onClick={() => { setFilter(c); setSlideIdx(0); }}
            data-testid={`filter-category-${c.replace(/\s+/g, '-').toLowerCase()}`}
            className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${filter === c ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}`}
          >
            {c} {c === 'All' ? `(${products.length})` : `(${products.filter(p => p.category === c).length})`}
          </button>
        ))}
      </div>

      {filtered.length > 0 ? (
        <div className="px-4 pb-6">
          <div className="relative rounded-xl bg-card border shadow-sm overflow-hidden">
            <div className="p-5 min-h-[220px] flex flex-col items-center justify-center text-center">
              <Badge variant="secondary" className="mb-2">{filtered[slideIdx]?.category}</Badge>
              <h3 className="text-xl font-bold text-card-foreground" data-testid="text-product-name">{filtered[slideIdx]?.name}</h3>
              <div className="flex items-center gap-1.5 mt-2 text-xs text-primary font-medium">
                <FlaskConical className="w-3.5 h-3.5" />
                <span data-testid="text-product-composition">{filtered[slideIdx]?.composition}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2 max-w-xs" data-testid="text-product-description">{filtered[slideIdx]?.description}</p>
              {filtered[slideIdx]?.catalogSlide > 0 && (
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-3"
                  onClick={() => openCatalogSlide(filtered[slideIdx].catalogSlide)}
                  data-testid="button-view-in-catalog"
                >
                  <BookOpen className="w-3.5 h-3.5 mr-1.5" />
                  View in Catalog (Slide {filtered[slideIdx].catalogSlide})
                </Button>
              )}
            </div>
            <div className="flex items-center justify-between p-3 border-t">
              <button
                onClick={() => setSlideIdx((i) => Math.max(0, i - 1))}
                disabled={slideIdx === 0}
                className="p-2 rounded-lg hover:bg-secondary disabled:opacity-30"
                data-testid="button-prev-product"
              >
                <ChevronLeft className="w-5 h-5 text-foreground" />
              </button>
              <span className="text-sm text-muted-foreground" data-testid="text-product-counter">{slideIdx + 1} / {filtered.length}</span>
              <button
                onClick={() => setSlideIdx((i) => Math.min(filtered.length - 1, i + 1))}
                disabled={slideIdx === filtered.length - 1}
                className="p-2 rounded-lg hover:bg-secondary disabled:opacity-30"
                data-testid="button-next-product"
              >
                <ChevronRight className="w-5 h-5 text-foreground" />
              </button>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            {filtered.map((p, idx) => (
              <div
                key={p.id}
                onClick={() => setSlideIdx(idx)}
                className={`flex items-center gap-3 rounded-xl bg-card border p-3 shadow-sm cursor-pointer transition-colors ${slideIdx === idx ? 'ring-2 ring-primary' : ''}`}
                data-testid={`card-product-${p.id}`}
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-card-foreground truncate">{p.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{p.composition || p.description}</p>
                  <Badge variant="outline" className="mt-1 text-[10px]">{p.category}</Badge>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); deleteProduct(p.id); if (slideIdx >= filtered.length - 1) setSlideIdx(Math.max(0, slideIdx - 1)); }}
                  className="p-2 rounded-lg hover:bg-destructive/10"
                  data-testid={`button-delete-product-${p.id}`}
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-center text-muted-foreground py-8" data-testid="text-no-products">
          {search ? 'No products match your search.' : 'No products. Add your first!'}
        </p>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-[95vw] rounded-xl">
          <DialogHeader><DialogTitle>Add Product</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} data-testid="input-product-name" /></div>
            <div>
              <Label>Category</Label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                data-testid="select-product-category"
              >
                <option value="">Select category</option>
                {categories.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div><Label>Composition</Label><Input value={form.composition} onChange={(e) => setForm({ ...form, composition: e.target.value })} placeholder="Active ingredients" data-testid="input-product-composition" /></div>
            <div><Label>Description</Label><Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} data-testid="input-product-description" /></div>
          </div>
          <Button onClick={save} className="w-full mt-2" data-testid="button-save-product">Add Product</Button>
        </DialogContent>
      </Dialog>

      <Dialog open={catOpen} onOpenChange={setCatOpen}>
        <DialogContent className="max-w-[95vw] rounded-xl">
          <DialogHeader><DialogTitle>New Category</DialogTitle></DialogHeader>
          <Input value={newCat} onChange={(e) => setNewCat(e.target.value)} placeholder="Category name" data-testid="input-category-name" />
          <Button onClick={saveCat} className="w-full" data-testid="button-save-category">Add Category</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductsPage;

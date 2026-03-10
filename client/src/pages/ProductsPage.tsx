import { useState } from 'react';
import { Plus, Trash2, BookOpen, Search, Pencil } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '@/components/PageHeader';
import { useAppStore, Product } from '@/store/useAppStore';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

const emptyForm = { name: '', category: '', composition: '', description: '', catalogSlide: 0 };

const ProductsPage = () => {
  const navigate = useNavigate();
  const { products, categories, addProduct, updateProduct, deleteProduct, addCategory } = useAppStore();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [catOpen, setCatOpen] = useState(false);
  const [newCat, setNewCat] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');

  const filtered = products
    .filter((p) => filter === 'All' || p.category === filter)
    .filter((p) => !search || p.name.toLowerCase().includes(search.toLowerCase()) || (p.composition || '').toLowerCase().includes(search.toLowerCase()));

  const openNew = () => { setEditing(null); setForm(emptyForm); setOpen(true); };
  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({ name: p.name, category: p.category, composition: p.composition || '', description: p.description, catalogSlide: p.catalogSlide });
    setOpen(true);
  };

  const save = () => {
    if (!form.name.trim()) return;
    if (editing) {
      updateProduct({ ...form, id: editing.id });
    } else {
      addProduct(form);
    }
    setOpen(false);
    setEditing(null);
    setForm(emptyForm);
  };

  const saveCat = () => {
    if (!newCat.trim()) return;
    addCategory(newCat.trim());
    setNewCat('');
    setCatOpen(false);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <PageHeader
        title="Products"
        action={
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => setCatOpen(true)} data-testid="button-add-category">+ Category</Button>
            <Button size="sm" onClick={openNew} data-testid="button-add-product"><Plus className="w-4 h-4 mr-1" />Add</Button>
          </div>
        }
      />

      <div className="px-4 pb-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search products or composition..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
            data-testid="input-search-products"
          />
        </div>
      </div>

      <div className="px-4 py-2 flex gap-2 overflow-x-auto">
        {['All', ...categories].map((c) => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            data-testid={`filter-category-${c.replace(/\s+/g, '-').toLowerCase()}`}
            className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${filter === c ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}`}
          >
            {c} {c === 'All' ? `(${products.length})` : `(${products.filter(p => p.category === c).length})`}
          </button>
        ))}
      </div>

      {filtered.length > 0 ? (
        <div className="px-4 py-2 space-y-2">
          {filtered.map((p) => (
            <div
              key={p.id}
              className="flex items-center gap-3 rounded-xl bg-card border p-3 shadow-sm"
              data-testid={`card-product-${p.id}`}
            >
              <div className="flex-1 min-w-0">
                <p className="font-medium text-card-foreground truncate">{p.name}</p>
                <p className="text-xs text-muted-foreground truncate">{p.composition || p.description}</p>
                <Badge variant="outline" className="mt-1 text-[10px]">{p.category}</Badge>
              </div>
              {p.catalogSlide > 0 && (
                <button
                  onClick={() => navigate(`/catalog?slide=${p.catalogSlide}&from=/products`)}
                  className="p-2 rounded-lg hover:bg-primary/10"
                  data-testid={`button-view-catalog-${p.id}`}
                >
                  <BookOpen className="w-4 h-4 text-primary" />
                </button>
              )}
              <button
                onClick={() => openEdit(p)}
                className="p-2 rounded-lg hover:bg-secondary"
                data-testid={`button-edit-product-${p.id}`}
              >
                <Pencil className="w-4 h-4 text-muted-foreground" />
              </button>
              <button
                onClick={() => deleteProduct(p.id)}
                className="p-2 rounded-lg hover:bg-destructive/10"
                data-testid={`button-delete-product-${p.id}`}
              >
                <Trash2 className="w-4 h-4 text-destructive" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-muted-foreground py-8" data-testid="text-no-products">
          {search ? 'No products match your search.' : 'No products. Add your first!'}
        </p>
      )}

      <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setEditing(null); setForm(emptyForm); } }}>
        <DialogContent className="max-w-[95vw] rounded-xl">
          <DialogHeader><DialogTitle>{editing ? 'Edit Product' : 'Add Product'}</DialogTitle></DialogHeader>
          <div className="space-y-3 max-h-[60vh] overflow-y-auto">
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
            <div>
              <Label>Catalogue Slide Number</Label>
              <Input
                type="number"
                min={0}
                max={90}
                value={form.catalogSlide || ''}
                onChange={(e) => setForm({ ...form, catalogSlide: parseInt(e.target.value) || 0 })}
                placeholder="Enter slide number (1-90), 0 = none"
                data-testid="input-product-catalog-slide"
              />
              <p className="text-xs text-muted-foreground mt-1">Slide number from the product catalogue (1-90). Set to 0 for no catalogue image.</p>
            </div>
          </div>
          <Button onClick={save} className="w-full mt-2" data-testid="button-save-product">{editing ? 'Update Product' : 'Add Product'}</Button>
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

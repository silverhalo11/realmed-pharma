import { useState } from 'react';
import { Plus, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import { useAppStore } from '@/store/useAppStore';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

const ProductsPage = () => {
  const { products, categories, addProduct, deleteProduct, addCategory } = useAppStore();
  const [open, setOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const [newCat, setNewCat] = useState('');
  const [form, setForm] = useState({ name: '', category: '', description: '', image: '' });
  const [slideIdx, setSlideIdx] = useState(0);
  const [filter, setFilter] = useState('All');

  const filtered = filter === 'All' ? products : products.filter((p) => p.category === filter);

  const save = () => {
    if (!form.name.trim()) return;
    addProduct(form);
    setOpen(false);
    setForm({ name: '', category: '', description: '', image: '' });
  };

  const saveCat = () => {
    if (!newCat.trim()) return;
    addCategory(newCat.trim());
    setNewCat('');
    setCatOpen(false);
  };

  return (
    <div className="min-h-screen bg-background safe-bottom">
      <PageHeader
        title="Products"
        action={
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => setCatOpen(true)}>+ Category</Button>
            <Button size="sm" onClick={() => setOpen(true)}><Plus className="w-4 h-4 mr-1" />Add</Button>
          </div>
        }
      />

      {/* Category filter */}
      <div className="px-4 py-3 flex gap-2 overflow-x-auto">
        {['All', ...categories].map((c) => (
          <button
            key={c}
            onClick={() => { setFilter(c); setSlideIdx(0); }}
            className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${filter === c ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Slide view */}
      {filtered.length > 0 ? (
        <div className="px-4 pb-6">
          <div className="relative rounded-xl bg-card border shadow-sm overflow-hidden">
            <div className="p-6 min-h-[280px] flex flex-col items-center justify-center text-center">
              {filtered[slideIdx]?.image && (
                <img src={filtered[slideIdx].image} alt={filtered[slideIdx].name} className="w-32 h-32 object-cover rounded-lg mb-4" />
              )}
              <Badge variant="secondary" className="mb-2">{filtered[slideIdx]?.category}</Badge>
              <h3 className="text-xl font-bold text-card-foreground">{filtered[slideIdx]?.name}</h3>
              <p className="text-sm text-muted-foreground mt-2 max-w-xs">{filtered[slideIdx]?.description}</p>
            </div>
            <div className="flex items-center justify-between p-3 border-t">
              <button
                onClick={() => setSlideIdx((i) => Math.max(0, i - 1))}
                disabled={slideIdx === 0}
                className="p-2 rounded-lg hover:bg-secondary disabled:opacity-30"
              >
                <ChevronLeft className="w-5 h-5 text-foreground" />
              </button>
              <span className="text-sm text-muted-foreground">{slideIdx + 1} / {filtered.length}</span>
              <button
                onClick={() => setSlideIdx((i) => Math.min(filtered.length - 1, i + 1))}
                disabled={slideIdx === filtered.length - 1}
                className="p-2 rounded-lg hover:bg-secondary disabled:opacity-30"
              >
                <ChevronRight className="w-5 h-5 text-foreground" />
              </button>
            </div>
          </div>

          {/* List below */}
          <div className="mt-4 space-y-2">
            {filtered.map((p) => (
              <div key={p.id} className="flex items-center gap-3 rounded-xl bg-card border p-3 shadow-sm">
                {p.image && <img src={p.image} alt={p.name} className="w-12 h-12 object-cover rounded-lg" />}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-card-foreground truncate">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{p.category}</p>
                </div>
                <button onClick={() => deleteProduct(p.id)} className="p-2 rounded-lg hover:bg-destructive/10">
                  <Trash2 className="w-4 h-4 text-destructive" />
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-center text-muted-foreground py-8">No products. Add your first!</p>
      )}

      {/* Add product dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-[95vw] rounded-xl">
          <DialogHeader><DialogTitle>Add Product</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div>
              <Label>Category</Label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Select category</option>
                {categories.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div><Label>Description</Label><Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
            <div><Label>Image URL</Label><Input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} placeholder="https://..." /></div>
          </div>
          <Button onClick={save} className="w-full mt-2">Add Product</Button>
        </DialogContent>
      </Dialog>

      {/* Add category dialog */}
      <Dialog open={catOpen} onOpenChange={setCatOpen}>
        <DialogContent className="max-w-[95vw] rounded-xl">
          <DialogHeader><DialogTitle>New Category</DialogTitle></DialogHeader>
          <Input value={newCat} onChange={(e) => setNewCat(e.target.value)} placeholder="Category name" />
          <Button onClick={saveCat} className="w-full">Add Category</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductsPage;

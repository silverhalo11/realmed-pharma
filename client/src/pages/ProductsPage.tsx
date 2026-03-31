import { useState, useRef } from 'react';
import { Plus, Trash2, BookOpen, Search, Pencil, ImagePlus, X, Image } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '@/components/PageHeader';
import { useAppStore, Product } from '@/store/useAppStore';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const emptyForm = { name: '', category: '', composition: '', description: '', catalogSlide: 0, catalogImage: '' };
const API_BASE = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '');

const resolveImageUrl = (url?: string | null) => {
  if (!url) return '';
  if (url.startsWith('data:') || /^https?:\/\//i.test(url)) return url;
  const path = url.startsWith('/') ? url : `/${url}`;
  return `${API_BASE}${path}`;
};


  const compressImage = (file: File, maxDim = 1400, quality = 0.8): Promise<Blob> =>
    new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('Image took too long — try a smaller photo')), 10000);
      const done = (fn: () => void) => { clearTimeout(timer); fn(); };
      const reader = new FileReader();
      reader.onerror = () => done(() => reject(new Error('Could not read image file')));
      reader.onload = (ev) => {
        const img = new window.Image();
        img.onerror = () => done(() => reject(new Error('Could not decode image')));
        img.onload = () => {
          try {
            let { width, height } = img;
            if (width > maxDim || height > maxDim) {
              if (width > height) { height = Math.round((height * maxDim) / width); width = maxDim; }
              else { width = Math.round((width * maxDim) / height); height = maxDim; }
            }
            const canvas = document.createElement('canvas');
            canvas.width = width; canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (!ctx) { done(() => reject(new Error('Canvas unavailable'))); return; }
            ctx.drawImage(img, 0, 0, width, height);
            canvas.toBlob((blob) => {
              if (!blob) {
                done(() => reject(new Error('Compression failed')));
                return;
              }
              done(() => resolve(blob));
            }, 'image/jpeg', quality);
          } catch (err) { done(() => reject(err)); }
        };
        img.src = ev.target!.result as string;
      };
      reader.readAsDataURL(file);
    });

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
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filtered = products
    .filter((p) => filter === 'All' || p.category === filter)
    .filter((p) => !search || p.name.toLowerCase().includes(search.toLowerCase()) || (p.composition || '').toLowerCase().includes(search.toLowerCase()));

  const openNew = () => {
    setEditing(null);
    setForm(emptyForm);
    setImagePreview('');
    setUploading(false);
    setOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({
      name: p.name,
      category: p.category || '',
      composition: p.composition || '',
      description: p.description || '',
      catalogSlide: p.catalogSlide || 0,
      catalogImage: p.catalogImage || '',
    });
    setImagePreview(resolveImageUrl(p.catalogImage));
    setUploading(false);
    setOpen(true);
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const compressedBlob = await compressImage(file);
      const uploadFile = new File([compressedBlob], `${file.name.replace(/\.[^/.]+$/, '') || 'product'}.jpg`, { type: 'image/jpeg' });
      const data = new FormData();
      data.append('image', uploadFile);

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 20000);
      const response = await fetch(`${API_BASE}/api/uploads/product-image`, {
        method: 'POST',
        body: data,
        credentials: 'include',
        signal: controller.signal,
      }).finally(() => clearTimeout(timeout));

      if (!response.ok) {
        const err = await response.json().catch(() => ({ message: 'Upload failed' }));
        throw new Error(err.message || 'Upload failed');
      }
      const result = await response.json() as { url: string };
      setForm((f) => ({ ...f, catalogImage: result.url, catalogSlide: 0 }));
      setImagePreview(result.url);
      toast.success('Image uploaded successfully');
    } catch (err: any) {
      toast.error(err?.name === 'AbortError' ? 'Upload timed out. Please try again.' : (err.message || 'Failed to upload image'));
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeImage = () => {
    setForm((f) => ({ ...f, catalogImage: '' }));
    setImagePreview('');
  };

  const save = () => {
    if (!form.name.trim()) return;
    if (editing) {
      updateProduct({ ...form, id: editing.id, userId: editing.userId, isSeeded: editing.isSeeded });
    } else {
      addProduct(form);
    }
    setOpen(false);
    setEditing(null);
    setForm(emptyForm);
    setImagePreview('');
    setUploading(false);
  };

  const saveCat = () => {
    if (!newCat.trim()) return;
    addCategory(newCat.trim());
    setNewCat('');
    setCatOpen(false);
  };

  const openCatalog = (p: Product) => {
    if (p.catalogImage) {
      const imageUrl = resolveImageUrl(p.catalogImage);
      navigate(`/catalog?image=${encodeURIComponent(imageUrl)}&productName=${encodeURIComponent(p.name)}&from=/products`);
    } else if (p.catalogSlide && p.catalogSlide > 0) {
      navigate(`/catalog?slide=${p.catalogSlide}&from=/products`);
    }
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
              {p.catalogImage ? (
                <div
                  className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 cursor-pointer border"
                  onClick={() => openCatalog(p)}
                >
                  <img src={resolveImageUrl(p.catalogImage)} alt={p.name} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Image className="w-5 h-5 text-primary/40" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-card-foreground truncate">{p.name}</p>
                <p className="text-xs text-muted-foreground truncate">{p.composition || p.description}</p>
                <Badge variant="outline" className="mt-1 text-[10px]">{p.category}</Badge>
              </div>
              {(p.catalogImage || (p.catalogSlide && p.catalogSlide > 0)) && (
                <button
                  onClick={() => openCatalog(p)}
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

      <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setEditing(null); setForm(emptyForm); setImagePreview(''); setUploading(false); } }}>
        <DialogContent className="max-w-[95vw] rounded-xl">
          <DialogHeader><DialogTitle>{editing ? 'Edit Product' : 'Add Product'}</DialogTitle></DialogHeader>
          <div className="space-y-3 max-h-[65vh] overflow-y-auto pr-1">
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
              <Label>Catalogue Image</Label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleImageSelect}
              />
              {imagePreview ? (
                <div className="relative mt-2 rounded-xl overflow-hidden border bg-muted">
                  <img src={imagePreview} alt="Product catalogue" className="w-full max-h-48 object-contain" />
                  <button
                    onClick={removeImage}
                    className="absolute top-2 right-2 p-1 bg-background/80 rounded-full border shadow"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="mt-2 w-full flex flex-col items-center gap-2 py-6 border-2 border-dashed rounded-xl text-muted-foreground hover:border-primary hover:text-primary transition-colors disabled:opacity-50"
                >
                  <ImagePlus className="w-6 h-6" />
                  <span className="text-sm font-medium">{uploading ? 'Uploading...' : 'Tap to upload catalogue image'}</span>
                  <span className="text-xs">JPG, PNG, WEBP up to 10MB</span>
                </button>
              )}
              {imagePreview && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="mt-1 text-xs text-primary underline"
                >
                  {uploading ? 'Uploading...' : 'Change image'}
                </button>
              )}
            </div>

            {!form.catalogImage && (
              <div>
                <Label>Or Link Catalogue Slide</Label>
                <Input
                  type="number"
                  min={0}
                  max={90}
                  value={form.catalogSlide || ''}
                  onChange={(e) => setForm({ ...form, catalogSlide: parseInt(e.target.value) || 0 })}
                  placeholder="Slide number (1-90), 0 = none"
                  data-testid="input-product-catalog-slide"
                />
                <p className="text-xs text-muted-foreground mt-1">Link to an existing catalogue slide (1-90).</p>
              </div>
            )}
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

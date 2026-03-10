import { useState } from 'react';
import { Plus, Trash2, Share2, X } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import { useAppStore } from '@/store/useAppStore';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

const getUnit = (category: string) => {
  const cat = category.toLowerCase();
  if (cat.includes('tablet') || cat.includes('capsule')) return 'strips';
  return 'pcs';
};

const OrdersPage = () => {
  const { orders, doctors, products, addOrder, deleteOrder } = useAppStore();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ doctorId: '', items: [{ productId: '', quantity: '' as string }] });

  const save = () => {
    if (!form.doctorId || form.items.every((i) => !i.productId || !i.quantity)) return;
    addOrder({
      ...form,
      items: form.items
        .filter((i) => i.productId && parseInt(i.quantity) > 0)
        .map((i) => ({ productId: i.productId, quantity: parseInt(i.quantity) || 1 })),
      date: new Date().toISOString().split('T')[0],
    });
    setOpen(false);
    setForm({ doctorId: '', items: [{ productId: '', quantity: '' }] });
  };

  const addItem = () => setForm({ ...form, items: [...form.items, { productId: '', quantity: '' }] });
  const removeItem = (idx: number) => setForm({ ...form, items: form.items.filter((_, i) => i !== idx) });
  const updateItem = (idx: number, key: string, val: string) =>
    setForm({ ...form, items: form.items.map((item, i) => (i === idx ? { ...item, [key]: val } : item)) });

  const sendWhatsApp = (orderId: string) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return;
    const doc = doctors.find((d) => d.id === order.doctorId);
    const lines = (order.items || []).map((item) => {
      const prod = products.find((p) => p.id === item.productId);
      const unit = prod ? getUnit(prod.category || '') : 'pcs';
      return `• ${prod?.name || 'Unknown'} — ${item.quantity} ${unit}`;
    });
    const storeLine = doc?.medicalStore ? `\n*Medical Store:* ${doc.medicalStore}` : '';
    const addressLine = doc?.address ? `\n*Delivery Address:* ${doc.address}` : '';
    const msg = `*Order for Dr. ${doc?.name || 'Unknown'}*\nDate: ${order.date}${storeLine}${addressLine}\n\n${lines.join('\n')}\n\nPlease confirm availability.`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <PageHeader title="Orders" action={<Button size="sm" onClick={() => setOpen(true)} data-testid="button-add-order"><Plus className="w-4 h-4 mr-1" />Add</Button>} />

      <div className="px-4 py-3 space-y-3">
        {orders.length === 0 && <p className="text-center text-muted-foreground py-8" data-testid="text-no-orders">No orders yet</p>}
        {orders.map((o) => {
          const doc = doctors.find((d) => d.id === o.doctorId);
          return (
            <div key={o.id} className="rounded-xl bg-card border p-4 shadow-sm" data-testid={`order-card-${o.id}`}>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-semibold text-card-foreground" data-testid={`text-order-doctor-${o.id}`}>Dr. {doc?.name || 'Unknown'}</p>
                  <p className="text-xs text-muted-foreground">{o.date}</p>
                  {doc?.medicalStore && (
                    <p className="text-xs text-primary font-medium mt-0.5" data-testid={`text-order-store-${o.id}`}>📦 {doc.medicalStore}</p>
                  )}
                  {doc?.address && (
                    <p className="text-xs text-muted-foreground" data-testid={`text-order-address-${o.id}`}>📍 {doc.address}</p>
                  )}
                </div>
                <div className="flex gap-1">
                  <button onClick={() => sendWhatsApp(o.id)} className="p-2 rounded-lg hover:bg-secondary" data-testid={`button-share-order-${o.id}`}>
                    <Share2 className="w-4 h-4 text-accent" />
                  </button>
                  <button onClick={() => deleteOrder(o.id)} className="p-2 rounded-lg hover:bg-destructive/10" data-testid={`button-delete-order-${o.id}`}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </button>
                </div>
              </div>
              <div className="space-y-1">
                {(o.items || []).map((item, idx) => {
                  const prod = products.find((p) => p.id === item.productId);
                  const unit = prod ? getUnit(prod.category || '') : 'pcs';
                  return (
                    <div key={idx} className="flex justify-between text-sm">
                      <span className="text-card-foreground">{prod?.name || 'Unknown'}</span>
                      <span className="text-muted-foreground">{item.quantity} {unit}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-[95vw] rounded-xl">
          <DialogHeader><DialogTitle>New Order</DialogTitle></DialogHeader>
          <div className="space-y-3 max-h-[60vh] overflow-y-auto">
            <div>
              <Label>Doctor</Label>
              <select value={form.doctorId} onChange={(e) => setForm({ ...form, doctorId: e.target.value })} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" data-testid="select-doctor">
                <option value="">Select doctor</option>
                {doctors.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <Label>Products</Label>
            {form.items.map((item, idx) => {
              const selectedProduct = products.find((p) => p.id === item.productId);
              const unit = selectedProduct ? getUnit(selectedProduct.category || '') : '';
              return (
                <div key={idx} className="flex gap-2 items-end">
                  <div className="flex-1">
                    <select value={item.productId} onChange={(e) => updateItem(idx, 'productId', e.target.value)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" data-testid={`select-product-${idx}`}>
                      <option value="">Product</option>
                      {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </div>
                  <div className="relative">
                    <Input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={(e) => updateItem(idx, 'quantity', e.target.value)}
                      placeholder="Qty"
                      className="w-20 pr-1"
                      data-testid={`input-quantity-${idx}`}
                    />
                  </div>
                  {unit && (
                    <span className="text-xs text-muted-foreground whitespace-nowrap pb-2.5 font-medium">{unit}</span>
                  )}
                  {form.items.length > 1 && (
                    <button onClick={() => removeItem(idx)} className="p-2" data-testid={`button-remove-item-${idx}`}><X className="w-4 h-4 text-destructive" /></button>
                  )}
                </div>
              );
            })}
            <Button variant="outline" size="sm" onClick={addItem} className="w-full" data-testid="button-add-item">+ Add Item</Button>
          </div>
          <Button onClick={save} className="w-full mt-2" data-testid="button-create-order">Create Order</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrdersPage;

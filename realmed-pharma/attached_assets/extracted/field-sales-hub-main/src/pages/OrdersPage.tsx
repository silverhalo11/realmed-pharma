import { useState } from 'react';
import { Plus, Trash2, Share2, X } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import { useAppStore } from '@/store/useAppStore';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

const OrdersPage = () => {
  const { orders, doctors, products, addOrder, deleteOrder } = useAppStore();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ doctorId: '', items: [{ productId: '', quantity: 1 }] });

  const save = () => {
    if (!form.doctorId || form.items.every((i) => !i.productId)) return;
    addOrder({ ...form, items: form.items.filter((i) => i.productId), date: new Date().toISOString().split('T')[0] });
    setOpen(false);
    setForm({ doctorId: '', items: [{ productId: '', quantity: 1 }] });
  };

  const addItem = () => setForm({ ...form, items: [...form.items, { productId: '', quantity: 1 }] });
  const removeItem = (idx: number) => setForm({ ...form, items: form.items.filter((_, i) => i !== idx) });
  const updateItem = (idx: number, key: string, val: string | number) =>
    setForm({ ...form, items: form.items.map((item, i) => (i === idx ? { ...item, [key]: val } : item)) });

  const sendWhatsApp = (orderId: string) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return;
    const doc = doctors.find((d) => d.id === order.doctorId);
    const lines = order.items.map((item) => {
      const prod = products.find((p) => p.id === item.productId);
      return `• ${prod?.name || 'Unknown'} x ${item.quantity}`;
    });
    const msg = `*Order for Dr. ${doc?.name || 'Unknown'}*\nDate: ${order.date}\n\n${lines.join('\n')}\n\nPlease confirm availability.`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-background safe-bottom">
      <PageHeader title="Orders" action={<Button size="sm" onClick={() => setOpen(true)}><Plus className="w-4 h-4 mr-1" />Add</Button>} />

      <div className="px-4 py-3 space-y-3">
        {orders.length === 0 && <p className="text-center text-muted-foreground py-8">No orders yet</p>}
        {orders.map((o) => {
          const doc = doctors.find((d) => d.id === o.doctorId);
          return (
            <div key={o.id} className="rounded-xl bg-card border p-4 shadow-sm">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-semibold text-card-foreground">Dr. {doc?.name || 'Unknown'}</p>
                  <p className="text-xs text-muted-foreground">{o.date}</p>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => sendWhatsApp(o.id)} className="p-2 rounded-lg hover:bg-secondary">
                    <Share2 className="w-4 h-4 text-accent" />
                  </button>
                  <button onClick={() => deleteOrder(o.id)} className="p-2 rounded-lg hover:bg-destructive/10">
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </button>
                </div>
              </div>
              <div className="space-y-1">
                {o.items.map((item, idx) => {
                  const prod = products.find((p) => p.id === item.productId);
                  return (
                    <div key={idx} className="flex justify-between text-sm">
                      <span className="text-card-foreground">{prod?.name || 'Unknown'}</span>
                      <span className="text-muted-foreground">x{item.quantity}</span>
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
              <select value={form.doctorId} onChange={(e) => setForm({ ...form, doctorId: e.target.value })} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="">Select doctor</option>
                {doctors.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <Label>Products</Label>
            {form.items.map((item, idx) => (
              <div key={idx} className="flex gap-2 items-end">
                <div className="flex-1">
                  <select value={item.productId} onChange={(e) => updateItem(idx, 'productId', e.target.value)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                    <option value="">Product</option>
                    {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <Input type="number" min={1} value={item.quantity} onChange={(e) => updateItem(idx, 'quantity', parseInt(e.target.value) || 1)} className="w-20" />
                {form.items.length > 1 && (
                  <button onClick={() => removeItem(idx)} className="p-2"><X className="w-4 h-4 text-destructive" /></button>
                )}
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={addItem} className="w-full">+ Add Item</Button>
          </div>
          <Button onClick={save} className="w-full mt-2">Create Order</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrdersPage;

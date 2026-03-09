import { useState } from 'react';
import { Plus, Pencil, Trash2, Search, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '@/components/PageHeader';
import { useAppStore, Doctor } from '@/store/useAppStore';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

const emptyDoctor = { name: '', degree: '', dob: '', clinic: '', phone: '', address: '', specialty: '', notes: '', prescribedProducts: [] as string[] };

const DoctorsPage = () => {
  const navigate = useNavigate();
  const { doctors, addDoctor, updateDoctor, deleteDoctor } = useAppStore();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Doctor | null>(null);
  const [form, setForm] = useState(emptyDoctor);
  const [search, setSearch] = useState('');

  const filtered = doctors.filter(
    (d) =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.specialty.toLowerCase().includes(search.toLowerCase())
  );

  const openNew = () => { setEditing(null); setForm(emptyDoctor); setOpen(true); };
  const openEdit = (d: Doctor) => { setEditing(d); setForm(d); setOpen(true); };

  const save = () => {
    if (!form.name.trim()) return;
    if (editing) updateDoctor({ ...form, id: editing.id });
    else addDoctor(form);
    setOpen(false);
  };

  const set = (key: string, val: string) => setForm((f) => ({ ...f, [key]: val }));

  return (
    <div className="min-h-screen bg-background pb-20">
      <PageHeader title="Doctors" action={<Button size="sm" onClick={openNew}><Plus className="w-4 h-4 mr-1" />Add</Button>} />

      <div className="px-4 py-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search doctors..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
      </div>

      <div className="px-4 pb-6 space-y-3">
        {filtered.length === 0 && <p className="text-center text-muted-foreground py-8">No doctors yet. Add your first!</p>}
        {filtered.map((d) => (
          <div key={d.id} className="rounded-xl bg-card border p-4 shadow-sm">
            <div className="flex items-start justify-between">
              <button
                onClick={() => navigate(`/doctors/${d.id}`)}
                className="flex-1 min-w-0 text-left"
                data-testid={`doctor-card-${d.id}`}
              >
                <p className="font-semibold text-card-foreground truncate">{d.name}{d.degree && <span className="text-muted-foreground font-normal text-sm"> ({d.degree})</span>}</p>
                <p className="text-sm text-muted-foreground">{d.specialty}</p>
                <p className="text-sm text-muted-foreground truncate">{d.clinic}</p>
              </button>
              <div className="flex items-center gap-1 ml-2">
                <button onClick={() => openEdit(d)} className="p-2 rounded-lg hover:bg-secondary"><Pencil className="w-4 h-4 text-muted-foreground" /></button>
                <button onClick={() => deleteDoctor(d.id)} className="p-2 rounded-lg hover:bg-destructive/10"><Trash2 className="w-4 h-4 text-destructive" /></button>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-[95vw] rounded-xl">
          <DialogHeader><DialogTitle>{editing ? 'Edit Doctor' : 'Add Doctor'}</DialogTitle></DialogHeader>
          <div className="space-y-3 max-h-[60vh] overflow-y-auto">
            {(['name', 'degree', 'clinic', 'phone', 'address', 'specialty', 'notes'] as const).map((key) => (
              <div key={key}>
                <Label className="capitalize text-sm">{key === 'degree' ? 'Degree (e.g. MBBS, MD)' : key}</Label>
                <Input value={form[key]} onChange={(e) => set(key, e.target.value)} placeholder={`Enter ${key}`} />
              </div>
            ))}
            <div>
              <Label className="text-sm">Date of Birth</Label>
              <Input type="date" value={form.dob} onChange={(e) => set('dob', e.target.value)} data-testid="input-dob" />
            </div>
          </div>
          <Button onClick={save} className="w-full mt-2">{editing ? 'Update' : 'Add Doctor'}</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DoctorsPage;

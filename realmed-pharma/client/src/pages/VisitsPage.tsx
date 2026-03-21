import { useState } from 'react';
import { Plus, Check, Trash2, Calendar, CheckCircle2 } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import { useAppStore } from '@/store/useAppStore';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const VisitsPage = () => {
  const { visits, doctors, addVisit, toggleVisit, deleteVisit } = useAppStore();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ doctorId: '', date: '' });

  const today = new Date().toISOString().split('T')[0];
  const todayVisits = visits.filter((v) => v.date === today);
  const futureVisits = visits.filter((v) => (v.date || '') > today);

  const save = () => {
    if (!form.doctorId || !form.date) return;
    addVisit({ ...form, completed: false });
    setOpen(false);
    setForm({ doctorId: '', date: '' });
  };

  const VisitCard = ({ v }: { v: typeof visits[0] }) => {
    const doc = doctors.find((d) => d.id === v.doctorId);
    return (
      <div className={`rounded-xl bg-card border p-4 shadow-sm flex items-center gap-3 ${v.completed ? 'opacity-60' : ''}`}>
        <button
          onClick={() => toggleVisit(v.id)}
          className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors ${v.completed ? 'bg-accent border-accent' : 'border-muted-foreground'}`}
        >
          {v.completed && <Check className="w-4 h-4 text-accent-foreground" />}
        </button>
        <div className="flex-1 min-w-0">
          <p className={`font-medium text-card-foreground ${v.completed ? 'line-through' : ''}`}>{doc?.name || 'Unknown'}</p>
          <p className="text-xs text-muted-foreground">{doc?.clinic} • {v.date}</p>
        </div>
        <button onClick={() => deleteVisit(v.id)} className="p-2 rounded-lg hover:bg-destructive/10">
          <Trash2 className="w-4 h-4 text-destructive" />
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <PageHeader title="Visits" action={<Button size="sm" onClick={() => setOpen(true)}><Plus className="w-4 h-4 mr-1" />Add</Button>} />

      <div className="px-4 py-3">
        <Tabs defaultValue="today">
          <TabsList className="w-full">
            <TabsTrigger value="today" className="flex-1 gap-1">
              <CheckCircle2 className="w-4 h-4" />Today ({todayVisits.length})
            </TabsTrigger>
            <TabsTrigger value="plan" className="flex-1 gap-1">
              <Calendar className="w-4 h-4" />Tour Plan ({futureVisits.length})
            </TabsTrigger>
          </TabsList>
          <TabsContent value="today" className="mt-3 space-y-3">
            {todayVisits.length === 0 && <p className="text-center text-muted-foreground py-8">No visits scheduled today</p>}
            {todayVisits.map((v) => <VisitCard key={v.id} v={v} />)}
          </TabsContent>
          <TabsContent value="plan" className="mt-3 space-y-3">
            {futureVisits.length === 0 && <p className="text-center text-muted-foreground py-8">No upcoming visits planned</p>}
            {futureVisits.map((v) => <VisitCard key={v.id} v={v} />)}
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-[95vw] rounded-xl">
          <DialogHeader><DialogTitle>Schedule Visit</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Doctor</Label>
              <select value={form.doctorId} onChange={(e) => setForm({ ...form, doctorId: e.target.value })} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="">Select doctor</option>
                {doctors.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div><Label>Date</Label><Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
          </div>
          <Button onClick={save} className="w-full mt-2">Schedule Visit</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VisitsPage;

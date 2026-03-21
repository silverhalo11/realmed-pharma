import { useState } from 'react';
import { Plus, Trash2, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import { useAppStore } from '@/store/useAppStore';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

const RemindersPage = () => {
  const { reminders, doctors, addReminder, deleteReminder, toggleReminder } = useAppStore();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ doctorId: '', text: '', date: '' });
  const [slideIdx, setSlideIdx] = useState(0);

  const active = reminders.filter((r) => !r.done);
  const completed = reminders.filter((r) => r.done);

  const save = () => {
    if (!form.text.trim() || !form.doctorId) return;
    addReminder({ ...form, done: false });
    setOpen(false);
    setForm({ doctorId: '', text: '', date: '' });
  };

  return (
    <div className="min-h-screen bg-background safe-bottom">
      <PageHeader title="Reminders" action={<Button size="sm" onClick={() => setOpen(true)}><Plus className="w-4 h-4 mr-1" />Add</Button>} />

      {/* Slide view for active reminders */}
      {active.length > 0 && (
        <div className="px-4 py-3">
          <div className="relative rounded-xl bg-card border shadow-sm overflow-hidden">
            <div className="p-6 min-h-[160px] flex flex-col justify-center">
              <p className="text-lg font-bold text-card-foreground">{active[slideIdx]?.text}</p>
              <p className="text-sm text-muted-foreground mt-1">
                Dr. {doctors.find((d) => d.id === active[slideIdx]?.doctorId)?.name || 'Unknown'}
              </p>
              <p className="text-sm text-muted-foreground">{active[slideIdx]?.date}</p>
              <div className="flex gap-2 mt-3">
                <Button size="sm" variant="outline" onClick={() => toggleReminder(active[slideIdx].id)}>
                  <Check className="w-4 h-4 mr-1" />Done
                </Button>
                <Button size="sm" variant="destructive" onClick={() => deleteReminder(active[slideIdx].id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 border-t">
              <button onClick={() => setSlideIdx((i) => Math.max(0, i - 1))} disabled={slideIdx === 0} className="p-2 rounded-lg hover:bg-secondary disabled:opacity-30">
                <ChevronLeft className="w-5 h-5 text-foreground" />
              </button>
              <span className="text-sm text-muted-foreground">{slideIdx + 1} / {active.length}</span>
              <button onClick={() => setSlideIdx((i) => Math.min(active.length - 1, i + 1))} disabled={slideIdx === active.length - 1} className="p-2 rounded-lg hover:bg-secondary disabled:opacity-30">
                <ChevronRight className="w-5 h-5 text-foreground" />
              </button>
            </div>
          </div>
        </div>
      )}

      {active.length === 0 && <p className="text-center text-muted-foreground py-8">No active reminders</p>}

      {completed.length > 0 && (
        <div className="px-4 pb-6">
          <h2 className="text-sm font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Completed</h2>
          <div className="space-y-2">
            {completed.map((r) => (
              <div key={r.id} className="rounded-xl bg-card border p-3 shadow-sm opacity-60 flex items-center gap-3">
                <Check className="w-4 h-4 text-accent" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-card-foreground line-through truncate">{r.text}</p>
                  <p className="text-xs text-muted-foreground">{doctors.find((d) => d.id === r.doctorId)?.name}</p>
                </div>
                <button onClick={() => deleteReminder(r.id)} className="p-2"><Trash2 className="w-4 h-4 text-destructive" /></button>
              </div>
            ))}
          </div>
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-[95vw] rounded-xl">
          <DialogHeader><DialogTitle>Add Reminder</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Doctor</Label>
              <select value={form.doctorId} onChange={(e) => setForm({ ...form, doctorId: e.target.value })} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="">Select doctor</option>
                {doctors.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div><Label>Reminder</Label><Input value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} placeholder="What to remember?" /></div>
            <div><Label>Date</Label><Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
          </div>
          <Button onClick={save} className="w-full mt-2">Add Reminder</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RemindersPage;

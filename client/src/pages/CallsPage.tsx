import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, Search, ChevronRight, Plus, Package, Trash2, MapPin } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import { useAppStore } from '@/store/useAppStore';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const CallsPage = () => {
  const navigate = useNavigate();
  const { doctors, calls, products, deleteCall } = useAppStore();
  const [showDoctorPicker, setShowDoctorPicker] = useState(false);
  const [pickerSearch, setPickerSearch] = useState('');
    const [pickerCity, setPickerCity] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
    const [cityFilter, setCityFilter] = useState('');
    const [callSearch, setCallSearch] = useState('');

  const today = new Date().toISOString().split('T')[0];
  const todayCalls = calls.filter((c) => c.date === today);

  const sortedCalls = useMemo(
    () => [...calls].sort((a, b) => (b.date || '').localeCompare(a.date || '')),
    [calls]
  );

    const callCities = useMemo(() => {
      const seen = new Set<string>();
      sortedCalls.forEach((c) => {
        const city = doctors.find((d) => d.id === c.doctorId)?.city;
        if (city) seen.add(city);
      });
      return Array.from(seen).sort();
    }, [sortedCalls, doctors]);

    const filteredCalls = useMemo(() => {
      return sortedCalls.filter((c) => {
        const doctor = doctors.find((d) => d.id === c.doctorId);
        const matchCity = !cityFilter || (doctor?.city || '') === cityFilter;
        const q = callSearch.toLowerCase();
        const matchSearch = !q ||
          (doctor?.name || '').toLowerCase().includes(q) ||
          (doctor?.specialty || '').toLowerCase().includes(q) ||
          (doctor?.city || '').toLowerCase().includes(q) ||
          (c.date || '').includes(q);
        return matchCity && matchSearch;
      });
    }, [sortedCalls, doctors, cityFilter, callSearch]);

  const allDoctorCities = useMemo(() => {
      const seen = new Set<string>();
      doctors.forEach((d) => { if (d.city) seen.add(d.city); });
      return Array.from(seen).sort();
    }, [doctors]);

    const pickerDoctors = useMemo(() => {
      const q = pickerSearch.toLowerCase();
      return doctors.filter(
        (d) =>
          (!pickerCity || (d.city || '') === pickerCity) &&
          (
            d.name.toLowerCase().includes(q) ||
            (d.specialty || '').toLowerCase().includes(q) ||
            (d.clinic || '').toLowerCase().includes(q) ||
            (d.city || '').toLowerCase().includes(q)
          )
      );
    }, [doctors, pickerSearch, pickerCity]);

  const handleDelete = async () => {
    if (!deleteId) return;
    await deleteCall(deleteId);
    setDeleteId(null);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <PageHeader
        title="Calls"
        action={
          <Button size="sm" onClick={() => { setPickerSearch(''); setPickerCity(''); setShowDoctorPicker(true); }}>
            <Plus className="w-4 h-4 mr-1" /> New Call
          </Button>
        }
      />

      {/* Doctor Picker Dialog */}
      <Dialog open={showDoctorPicker} onOpenChange={setShowDoctorPicker}>
        <DialogContent className="max-w-[95vw] rounded-xl">
          <DialogHeader>
            <DialogTitle>Select Doctor</DialogTitle>
          </DialogHeader>
          <div className="relative mb-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search doctors..."
                value={pickerSearch}
                onChange={(e) => setPickerSearch(e.target.value)}
                className="pl-9"
                autoFocus
              />
            </div>
            {allDoctorCities.length > 0 && (
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                <button
                  onClick={() => setPickerCity('')}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                    !pickerCity ? 'bg-primary text-primary-foreground border-primary' : 'bg-card text-muted-foreground border-border hover:bg-muted'
                  }`}
                >
                  All Cities
                </button>
                {allDoctorCities.map((city) => (
                  <button
                    key={city}
                    onClick={() => setPickerCity(pickerCity === city ? '' : city)}
                    className={`flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                      pickerCity === city ? 'bg-primary text-primary-foreground border-primary' : 'bg-card text-muted-foreground border-border hover:bg-muted'
                    }`}
                  >
                    <MapPin className="w-3 h-3" />
                    {city}
                  </button>
                ))}
              </div>
            )}
            <div className="space-y-2 max-h-[45vh] overflow-y-auto">
            {pickerDoctors.length === 0 && (
              <p className="text-center text-muted-foreground py-6 text-sm">No doctors found</p>
            )}
            {pickerDoctors.map((d) => (
              <button
                key={d.id}
                onClick={() => { setShowDoctorPicker(false); navigate(`/calls/new/${d.id}`); }}
                className="w-full rounded-lg border bg-card p-3 text-left flex items-center gap-3 hover:bg-muted/50 transition-colors"
              >
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Phone className="w-4 h-4 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-card-foreground truncate">
                    {d.name}
                    {d.degree && <span className="text-muted-foreground font-normal text-sm"> ({d.degree})</span>}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {d.specialty}{d.city ? ` · ${d.city}` : ''}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Call</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this call record? This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Stats */}
      <div className="px-4 pb-4">
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl bg-card border p-3 text-center">
            <p className="text-2xl font-bold text-card-foreground">{todayCalls.length}</p>
            <p className="text-xs text-muted-foreground">Today</p>
          </div>
          <div className="rounded-xl bg-card border p-3 text-center">
            <p className="text-2xl font-bold text-green-500">
              {calls.filter((c) => c.status === 'completed').length}
            </p>
            <p className="text-xs text-muted-foreground">Completed</p>
          </div>
          <div className="rounded-xl bg-card border p-3 text-center">
            <p className="text-2xl font-bold text-amber-500">
              {calls.filter((c) => c.status === 'pending').length}
            </p>
            <p className="text-xs text-muted-foreground">Pending</p>
          </div>
        </div>
      </div>

      {/* Saved Calls List */}
        {sortedCalls.length === 0 ? (
        <div className="px-4 py-16 text-center">
          <Phone className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground font-medium">No calls yet</p>
          <p className="text-sm text-muted-foreground mt-1">Tap "+ New Call" to get started</p>
        </div>
      ) : (
        <div className="px-4 pb-6 space-y-3">
          {sortedCalls.map((call) => {
            const doctor = doctors.find((d) => d.id === call.doctorId);
            const callProducts = (call.products || []).map((cp) => ({
              ...cp,
              product: products.find((p) => p.id === cp.productId),
            }));
            const likedCount = callProducts.filter((p) => p.status === 'liked').length;

            return (
              <div key={call.id} className="rounded-xl bg-card border shadow-sm overflow-hidden">
                {/* Doctor info + action buttons */}
                <div className="flex items-center gap-3 p-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-card-foreground truncate">
                      {doctor?.name || 'Unknown'}
                      {doctor?.degree && (
                        <span className="text-muted-foreground font-normal text-sm"> ({doctor.degree})</span>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {doctor?.specialty}{doctor?.city ? ` · ${doctor.city}` : ''}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">{call.date}</p>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {/* Blue phone — start new call with same doctor */}
                    <button
                      onClick={() => navigate(`/calls/new/${call.doctorId}`)}
                      className="w-9 h-9 rounded-full bg-primary flex items-center justify-center hover:bg-primary/90 transition-colors"
                      title="Start new call"
                    >
                      <Phone className="w-4 h-4 text-primary-foreground" />
                    </button>
                    {/* Delete */}
                    <button
                      onClick={() => setDeleteId(call.id)}
                      className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-destructive/10 transition-colors"
                      title="Delete call"
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </button>
                    {/* View details */}
                    <button
                      onClick={() => navigate(`/calls/${call.id}`)}
                      className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-muted transition-colors"
                    >
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </div>
                </div>

                {/* Products showcased in this call */}
                {callProducts.length > 0 && (
                  <div className="border-t px-3 py-2 bg-muted/30">
                    <p className="text-xs text-muted-foreground mb-1.5 flex items-center gap-1">
                      <Package className="w-3 h-3" />
                      {callProducts.length} product{callProducts.length !== 1 ? 's' : ''} showcased
                      {likedCount > 0 && (
                        <span className="text-green-600 ml-1">· {likedCount} liked</span>
                      )}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {callProducts.map((cp) => (
                        <span
                          key={cp.productId}
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            cp.status === 'liked'
                              ? 'bg-green-500/15 text-green-700'
                              : cp.status === 'removed'
                              ? 'bg-red-500/15 text-red-700'
                              : 'bg-muted text-muted-foreground border'
                          }`}
                        >
                          {cp.product?.name || 'Unknown'}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CallsPage;

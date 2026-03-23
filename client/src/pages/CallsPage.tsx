import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, Search, ChevronRight, Plus, Clock, CheckCircle, X, MapPin } from 'lucide-react';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const CallsPage = () => {
  const navigate = useNavigate();
  const { doctors, calls } = useAppStore();
  const [cityFilter, setCityFilter] = useState<string>('all');
  const [showDoctorPicker, setShowDoctorPicker] = useState(false);
  const [pickerSearch, setPickerSearch] = useState('');

  // Get unique cities
  const cities = useMemo(() => {
    const s = new Set<string>();
    doctors.forEach((d) => { if (d.city) s.add(d.city); });
    return Array.from(s).sort();
  }, [doctors]);

  // Doctors that already have calls — shown with phone button
  const doctorsWithCalls = useMemo(() => {
    const ids = new Set(calls.map((c) => c.doctorId));
    return doctors.filter((d) => {
      if (!ids.has(d.id)) return false;
      const matchesCity = cityFilter === 'all' || d.city === cityFilter;
      return matchesCity;
    });
  }, [doctors, calls, cityFilter]);

  // Get call stats for each doctor
  const getDoctorCallStats = (doctorId: string) => {
    const doctorCalls = calls.filter((c) => c.doctorId === doctorId);
    const completed = doctorCalls.filter((c) => c.status === 'completed').length;
    return { total: doctorCalls.length, completed };
  };

  // Today's calls
  const today = new Date().toISOString().split('T')[0];
  const todayCalls = calls.filter((c) => c.date === today);

  // Recent calls sorted newest first
  const recentCalls = [...calls].sort((a, b) => (b.date || '').localeCompare(a.date || ''));

  // Doctor picker filtered list
  const pickerDoctors = useMemo(() => {
    const q = pickerSearch.toLowerCase();
    return doctors.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        (d.specialty || '').toLowerCase().includes(q) ||
        (d.clinic || '').toLowerCase().includes(q)
    );
  }, [doctors, pickerSearch]);

  return (
    <div className="min-h-screen bg-background pb-20">
      <PageHeader
        title="Calls"
        action={
          <Button size="sm" onClick={() => { setPickerSearch(''); setShowDoctorPicker(true); }}>
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
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search doctors..."
              value={pickerSearch}
              onChange={(e) => setPickerSearch(e.target.value)}
              className="pl-9"
              autoFocus
            />
          </div>
          <div className="space-y-2 max-h-[55vh] overflow-y-auto">
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
                  <p className="text-xs text-muted-foreground">{d.specialty}{d.city ? ` · ${d.city}` : ''}</p>
                </div>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Stats */}
      <div className="px-4 pb-4">
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl bg-card border p-3 text-center">
            <p className="text-2xl font-bold text-card-foreground">{todayCalls.length}</p>
            <p className="text-xs text-muted-foreground">Today</p>
          </div>
          <div className="rounded-xl bg-card border p-3 text-center">
            <p className="text-2xl font-bold text-green-500">{calls.filter((c) => c.status === 'completed').length}</p>
            <p className="text-xs text-muted-foreground">Completed</p>
          </div>
          <div className="rounded-xl bg-card border p-3 text-center">
            <p className="text-2xl font-bold text-amber-500">{calls.filter((c) => c.status === 'pending').length}</p>
            <p className="text-xs text-muted-foreground">Pending</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      {(cities.length > 0 || doctorsWithCalls.length > 0) && (
        <div className="px-4 pb-4">
          <Select value={cityFilter} onValueChange={setCityFilter}>
            <SelectTrigger className="w-40">
              <MapPin className="w-4 h-4 mr-1" />
              <SelectValue placeholder="All Cities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Cities</SelectItem>
              {cities.map((city) => (
                <SelectItem key={city} value={city}>{city}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Doctors with existing calls */}
      {doctorsWithCalls.length > 0 && (
        <div className="px-4 pb-4">
          <h2 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
            Call Again
          </h2>
          <div className="space-y-2">
            {doctorsWithCalls.map((d) => {
              const stats = getDoctorCallStats(d.id);
              return (
                <div key={d.id} className="rounded-xl bg-card border p-4 shadow-sm flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="font-semibold text-card-foreground truncate">
                      {d.name}
                      {d.degree && <span className="text-muted-foreground font-normal text-sm"> ({d.degree})</span>}
                    </p>
                    <p className="text-sm text-muted-foreground">{d.specialty}</p>
                    {d.city && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <MapPin className="w-3 h-3" />{d.city}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                    <span className="text-xs text-muted-foreground">{stats.completed}/{stats.total} calls</span>
                    <button
                      onClick={() => navigate(`/calls/new/${d.id}`)}
                      className="w-10 h-10 rounded-full bg-primary flex items-center justify-center hover:bg-primary/90 transition-colors"
                    >
                      <Phone className="w-5 h-5 text-primary-foreground" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent Calls */}
      {recentCalls.length > 0 && (
        <div className="px-4 pb-6">
          <h2 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
            Recent Calls
          </h2>
          <div className="space-y-2">
            {recentCalls.map((call) => {
              const doctor = doctors.find((d) => d.id === call.doctorId);
              const productCount = call.products?.length || 0;
              const likedCount = call.products?.filter((p) => p.status === 'liked').length || 0;
              return (
                <button
                  key={call.id}
                  onClick={() => navigate(`/calls/${call.id}`)}
                  className="w-full rounded-lg bg-card border p-3 text-left flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        call.status === 'completed'
                          ? 'bg-green-500/20 text-green-600'
                          : 'bg-amber-500/20 text-amber-600'
                      }`}
                    >
                      {call.status === 'completed' ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        <Clock className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-card-foreground">
                        {doctor?.name || 'Unknown'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {call.date} · {likedCount}/{productCount} products liked
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </button>
              );
            })}
          </div>
        </div>
      )}

      {calls.length === 0 && (
        <div className="px-4 py-16 text-center">
          <Phone className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground font-medium">No calls yet</p>
          <p className="text-sm text-muted-foreground mt-1">Tap "+ New Call" to get started</p>
        </div>
      )}
    </div>
  );
};

export default CallsPage;

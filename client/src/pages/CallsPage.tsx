import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, Search, MapPin, Filter, ChevronRight, Plus, Clock, CheckCircle, X } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import { useAppStore, type Doctor, type Call } from '@/store/useAppStore';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const CallsPage = () => {
  const navigate = useNavigate();
  const { doctors, calls, products } = useAppStore();
  const [search, setSearch] = useState('');
  const [cityFilter, setCityFilter] = useState<string>('all');

  // Get unique cities from doctors
  const cities = useMemo(() => {
    const citySet = new Set<string>();
    doctors.forEach((d) => {
      if (d.city) citySet.add(d.city);
    });
    return Array.from(citySet).sort();
  }, [doctors]);

  // Filter doctors by city and search
  const filteredDoctors = useMemo(() => {
    return doctors.filter((d) => {
      const matchesSearch =
        d.name.toLowerCase().includes(search.toLowerCase()) ||
        (d.specialty || '').toLowerCase().includes(search.toLowerCase()) ||
        (d.clinic || '').toLowerCase().includes(search.toLowerCase());
      const matchesCity = cityFilter === 'all' || d.city === cityFilter;
      return matchesSearch && matchesCity;
    });
  }, [doctors, search, cityFilter]);

  // Get call stats for each doctor
  const getDoctorCallStats = (doctorId: string) => {
    const doctorCalls = calls.filter((c) => c.doctorId === doctorId);
    const completed = doctorCalls.filter((c) => c.status === 'completed').length;
    const inProgress = doctorCalls.filter((c) => c.status === 'in-progress').length;
    const pending = doctorCalls.filter((c) => c.status === 'pending').length;
    return { total: doctorCalls.length, completed, inProgress, pending };
  };

  // Get today's calls
  const today = new Date().toISOString().split('T')[0];
  const todayCalls = calls.filter((c) => c.date === today);
  const activeCall = calls.find((c) => c.status === 'in-progress');

  return (
    <div className="min-h-screen bg-background pb-20">
      <PageHeader title="Calls" />

      {/* Active Call Banner */}
      {activeCall && (
        <div className="mx-4 mb-4 p-4 rounded-xl bg-primary/10 border border-primary/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                <Phone className="w-5 h-5 text-primary-foreground animate-pulse" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Call in Progress</p>
                <p className="text-xs text-muted-foreground">
                  {doctors.find((d) => d.id === activeCall.doctorId)?.name || 'Unknown Doctor'}
                </p>
              </div>
            </div>
            <Button
              size="sm"
              onClick={() => navigate(`/calls/${activeCall.id}`)}
            >
              Continue
            </Button>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="px-4 pb-4">
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl bg-card border p-3 text-center">
            <p className="text-2xl font-bold text-card-foreground">{todayCalls.length}</p>
            <p className="text-xs text-muted-foreground">Today</p>
          </div>
          <div className="rounded-xl bg-card border p-3 text-center">
            <p className="text-2xl font-bold text-accent">{calls.filter((c) => c.status === 'completed').length}</p>
            <p className="text-xs text-muted-foreground">Completed</p>
          </div>
          <div className="rounded-xl bg-card border p-3 text-center">
            <p className="text-2xl font-bold text-warning">{calls.filter((c) => c.status === 'pending').length}</p>
            <p className="text-xs text-muted-foreground">Pending</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="px-4 pb-4">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search doctors..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={cityFilter} onValueChange={setCityFilter}>
            <SelectTrigger className="w-[140px]">
              <MapPin className="w-4 h-4 mr-1" />
              <SelectValue placeholder="City" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Cities</SelectItem>
              {cities.map((city) => (
                <SelectItem key={city} value={city}>
                  {city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Doctor List */}
      <div className="px-4 pb-6">
        <h2 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide flex items-center gap-2">
          <Filter className="w-4 h-4" />
          Select Doctor to Start Call
        </h2>

        <div className="space-y-3">
          {filteredDoctors.length === 0 && (
            <p className="text-center text-muted-foreground py-8">
              {doctors.length === 0
                ? 'No doctors yet. Add doctors first!'
                : 'No doctors match your filters.'}
            </p>
          )}
          {filteredDoctors.map((doctor) => {
            const stats = getDoctorCallStats(doctor.id);
            return (
              <button
                key={doctor.id}
                onClick={() => navigate(`/calls/new/${doctor.id}`)}
                className="w-full rounded-xl bg-card border p-4 shadow-sm text-left active:scale-[0.98] transition-transform"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-card-foreground truncate">
                      {doctor.name}
                      {doctor.degree && (
                        <span className="text-muted-foreground font-normal text-sm">
                          {' '}
                          ({doctor.degree})
                        </span>
                      )}
                    </p>
                    <p className="text-sm text-muted-foreground">{doctor.specialty}</p>
                    {doctor.city && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3" />
                        {doctor.city}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground truncate">{doctor.clinic}</p>
                  </div>
                  <div className="flex items-center gap-2 ml-3">
                    {stats.total > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {stats.completed}/{stats.total} calls
                      </Badge>
                    )}
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                      <Phone className="w-4 h-4 text-primary-foreground" />
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Recent Calls */}
      {calls.length > 0 && (
        <div className="px-4 pb-6">
          <h2 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
            Recent Calls
          </h2>
          <div className="space-y-2">
            {calls.slice(0, 5).map((call) => {
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
                          ? 'bg-accent/20 text-accent'
                          : call.status === 'in-progress'
                          ? 'bg-warning/20 text-warning'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {call.status === 'completed' ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : call.status === 'in-progress' ? (
                        <Phone className="w-4 h-4" />
                      ) : (
                        <Clock className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-card-foreground">
                        {doctor?.name || 'Unknown'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {call.date} - {likedCount}/{productCount} products liked
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
    </div>
  );
};

export default CallsPage;

import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Phone, MapPin, GraduationCap, Calendar, Building2, Stethoscope, StickyNote, Plus, X, Pill } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import { useAppStore } from '@/store/useAppStore';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

const DoctorDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { doctors, products, togglePrescribedProduct } = useAppStore();
  const [prescribeOpen, setPrescribeOpen] = useState(false);
  const [search, setSearch] = useState('');

  const doctor = doctors.find((d) => d.id === id);

  if (!doctor) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <PageHeader title="Doctor" backTo="/doctors" />
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
          <p className="text-muted-foreground">Doctor not found</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate('/doctors')}>Back to Doctors</Button>
        </div>
      </div>
    );
  }

  const prescribed = (doctor.prescribedProducts || [])
    .map((pid) => products.find((p) => p.id === pid))
    .filter(Boolean);

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  const details = [
    { icon: GraduationCap, label: 'Degree', value: doctor.degree },
    { icon: Calendar, label: 'Date of Birth', value: doctor.dob },
    { icon: Building2, label: 'Clinic', value: doctor.clinic },
    { icon: Phone, label: 'Phone', value: doctor.phone },
    { icon: MapPin, label: 'Address', value: doctor.address },
    { icon: Stethoscope, label: 'Specialty', value: doctor.specialty },
    { icon: StickyNote, label: 'Notes', value: doctor.notes },
  ].filter((d) => d.value);

  return (
    <div className="min-h-screen bg-background pb-20">
      <PageHeader title="Doctor Details" backTo="/doctors" />

      <div className="px-4 py-4">
        <div className="rounded-xl bg-card border p-5 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <span className="text-xl font-bold text-primary" data-testid="text-doctor-initial">
                {doctor.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="min-w-0">
              <h2 className="text-xl font-bold text-card-foreground truncate" data-testid="text-doctor-name">
                {doctor.name}
              </h2>
              {doctor.degree && (
                <p className="text-sm text-muted-foreground" data-testid="text-doctor-degree">{doctor.degree}</p>
              )}
              {doctor.specialty && (
                <Badge variant="secondary" className="mt-1" data-testid="text-doctor-specialty">{doctor.specialty}</Badge>
              )}
            </div>
          </div>

          <div className="space-y-3">
            {details.map((d) => (
              <div key={d.label} className="flex items-start gap-3">
                <d.icon className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">{d.label}</p>
                  <p className="text-sm text-card-foreground" data-testid={`text-doctor-${d.label.toLowerCase().replace(/\s/g, '-')}`}>
                    {d.label === 'Phone' ? (
                      <a href={`tel:${d.value}`} className="text-primary underline">{d.value}</a>
                    ) : d.value}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
              <Pill className="w-4 h-4" />
              Prescribed Medicines
            </h3>
            <Button size="sm" variant="outline" onClick={() => setPrescribeOpen(true)} data-testid="button-add-medicine">
              <Plus className="w-4 h-4 mr-1" />Add
            </Button>
          </div>

          {prescribed.length === 0 ? (
            <div className="rounded-xl bg-card border p-6 text-center shadow-sm">
              <Pill className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No medicines assigned yet</p>
              <p className="text-xs text-muted-foreground mt-1">Tap "Add" to assign products from the catalogue</p>
            </div>
          ) : (
            <div className="space-y-2">
              {prescribed.map((p) => p && (
                <div key={p.id} className="flex items-center gap-3 rounded-xl bg-card border p-3 shadow-sm" data-testid={`prescribed-${p.id}`}>
                  {p.image && <img src={p.image} alt={p.name} className="w-10 h-10 object-cover rounded-lg" />}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-card-foreground truncate">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.category}</p>
                  </div>
                  <button
                    onClick={() => togglePrescribedProduct(doctor.id, p.id)}
                    className="p-2 rounded-lg hover:bg-destructive/10"
                    data-testid={`button-remove-medicine-${p.id}`}
                  >
                    <X className="w-4 h-4 text-destructive" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Dialog open={prescribeOpen} onOpenChange={setPrescribeOpen}>
        <DialogContent className="max-w-[95vw] rounded-xl">
          <DialogHeader><DialogTitle>Assign Medicines</DialogTitle></DialogHeader>
          <Input
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            data-testid="input-search-medicine"
          />
          <div className="space-y-2 max-h-[50vh] overflow-y-auto mt-2">
            {filteredProducts.length === 0 && (
              <p className="text-center text-muted-foreground py-4 text-sm">
                {products.length === 0 ? 'No products added yet. Add products first.' : 'No matches found'}
              </p>
            )}
            {filteredProducts.map((p) => {
              const isAssigned = (doctor.prescribedProducts || []).includes(p.id);
              return (
                <button
                  key={p.id}
                  onClick={() => togglePrescribedProduct(doctor.id, p.id)}
                  className={`w-full flex items-center gap-3 rounded-xl border p-3 transition-colors text-left ${
                    isAssigned ? 'bg-primary/10 border-primary/30' : 'bg-card hover:bg-secondary/50'
                  }`}
                  data-testid={`toggle-medicine-${p.id}`}
                >
                  {p.image && <img src={p.image} alt={p.name} className="w-10 h-10 object-cover rounded-lg" />}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-card-foreground truncate">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.category}</p>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    isAssigned ? 'bg-primary border-primary' : 'border-muted-foreground'
                  }`}>
                    {isAssigned && <span className="text-white text-xs font-bold">✓</span>}
                  </div>
                </button>
              );
            })}
          </div>
          <Button onClick={() => setPrescribeOpen(false)} className="w-full mt-2">Done</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DoctorDetailPage;

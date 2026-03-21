import { useNavigate } from 'react-router-dom';
import { Stethoscope, Package, ShoppingCart, MapPin, Bell } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

const Dashboard = () => {
  const navigate = useNavigate();
  const { doctors, products, orders, visits, reminders } = useAppStore();

  const today = new Date().toISOString().split('T')[0];
  const todayVisits = visits.filter((v) => v.date === today);
  const activeReminders = reminders.filter((r) => !r.done);

  const cards = [
    { label: 'Doctors', count: doctors.length, icon: Stethoscope, path: '/doctors', color: 'bg-primary' },
    { label: 'Products', count: products.length, icon: Package, path: '/products', color: 'bg-accent' },
    { label: 'Orders', count: orders.length, icon: ShoppingCart, path: '/orders', color: 'bg-warning' },
    { label: 'Visits', count: todayVisits.length, icon: MapPin, path: '/visits', color: 'bg-info' },
    { label: 'Reminders', count: activeReminders.length, icon: Bell, path: '/reminders', color: 'bg-destructive' },
  ];

  return (
    <div className="min-h-screen bg-background safe-bottom">
      <div className="px-4 pt-6 pb-3">
        <p className="text-sm text-muted-foreground">Welcome back</p>
        <h1 className="text-2xl font-bold text-foreground">MedRep Dashboard</h1>
      </div>

      <div className="px-4 pb-6 grid grid-cols-2 gap-3">
        {cards.map((c) => (
          <button
            key={c.label}
            onClick={() => navigate(c.path)}
            className="flex flex-col items-start gap-3 rounded-xl bg-card p-4 shadow-sm border active:scale-[0.97] transition-transform text-left"
          >
            <div className={`${c.color} w-10 h-10 rounded-lg flex items-center justify-center`}>
              <c.icon className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold text-card-foreground">{c.count}</p>
              <p className="text-sm text-muted-foreground">{c.label}</p>
            </div>
          </button>
        ))}
      </div>

      {activeReminders.length > 0 && (
        <div className="px-4 pb-6">
          <h2 className="text-sm font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Upcoming Reminders</h2>
          <div className="flex gap-3 overflow-x-auto pb-2 snap-x">
            {activeReminders.slice(0, 5).map((r) => {
              const doc = doctors.find((d) => d.id === r.doctorId);
              return (
                <div key={r.id} className="min-w-[200px] snap-start rounded-xl bg-card border p-3 shadow-sm">
                  <p className="text-sm font-semibold text-card-foreground truncate">{r.text}</p>
                  <p className="text-xs text-muted-foreground mt-1">{doc?.name || 'Unknown'}</p>
                  <p className="text-xs text-muted-foreground">{r.date}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

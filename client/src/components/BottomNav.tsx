import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Stethoscope, Package, ShoppingCart, Bell, Phone } from 'lucide-react';
import { cn } from '@/lib/utils';

const tabs = [
  { label: 'Home', icon: LayoutDashboard, path: '/' },
  { label: 'Doctors', icon: Stethoscope, path: '/doctors' },
  { label: 'Products', icon: Package, path: '/products' },
  { label: 'Orders', icon: ShoppingCart, path: '/orders' },
  { label: 'Reminders', icon: Bell, path: '/reminders' },
  { label: 'Calls', icon: Phone, path: '/calls' },
];

const BottomNav = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const activeIndex = tabs.findIndex((tab) => {
    if (tab.path === '/') return pathname === '/';
    return pathname === tab.path || pathname.startsWith(`${tab.path}/`);
  });
  const activeTabIndex = activeIndex >= 0 ? activeIndex : 0;
  const indicatorPosition = `calc((100% / ${tabs.length}) * ${activeTabIndex} + (100% / ${tabs.length}) / 2)`;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 px-3 pb-2 safe-bottom" data-testid="nav-bottom">
      <div className="relative h-[80px] max-w-lg mx-auto">
        <div className="absolute inset-x-0 bottom-0 h-16 rounded-[22px] bg-card border border-border/80 shadow-[0_18px_30px_-24px_hsl(var(--foreground)/0.7)]" />
        <div
          className="pointer-events-none absolute top-0 h-[54px] w-[54px] -translate-x-1/2 rounded-full border-4 border-background bg-card shadow-[0_10px_20px_-12px_hsl(var(--foreground)/0.65)] transition-all duration-300 ease-out"
          style={{ left: indicatorPosition }}
        >
          <div className="absolute inset-[6px] rounded-full border-2 border-primary/35 bg-primary/5" />
        </div>

        <div className="relative z-10 flex items-end justify-around h-full pt-1">
          {tabs.map((tab) => {
            const active = tabs[activeTabIndex]?.path === tab.path;
            return (
              <button
                key={tab.path}
                onClick={() => navigate(tab.path)}
                data-testid={`nav-${tab.label.toLowerCase()}`}
                className={cn(
                  'group flex flex-col items-center justify-center gap-1 flex-1 h-full pb-3 transition-all duration-300',
                  active ? '-translate-y-2.5 text-primary' : 'text-muted-foreground/90 hover:text-foreground',
                )}
              >
                <tab.icon className={cn('w-5 h-5 transition-transform duration-300', active && 'scale-105')} />
                <span
                  className={cn(
                    'text-[10px] font-semibold leading-none transition-opacity duration-200',
                    active ? 'opacity-100' : 'opacity-80',
                  )}
                >
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default BottomNav;

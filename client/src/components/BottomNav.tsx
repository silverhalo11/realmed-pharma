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
  const tabWidthPct = 100 / tabs.length;
  const bubbleLeft = `${tabWidthPct * activeTabIndex + tabWidthPct / 2}%`;

  const ActiveIcon = tabs[activeTabIndex].icon;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 px-3 pb-3 safe-bottom"
      data-testid="nav-bottom"
    >
      <div className="relative max-w-lg mx-auto" style={{ height: '86px' }}>

        {/* Floating bubble — active icon lifts above the bar */}
        <div
          className="absolute top-0 z-20 -translate-x-1/2 transition-all duration-300 ease-out"
          style={{ left: bubbleLeft }}
        >
          {/* Outer ring (white border matching background) */}
          <div className="w-[60px] h-[60px] rounded-full bg-background flex items-center justify-center">
            {/* Inner bubble */}
            <div className="w-[52px] h-[52px] rounded-full bg-card border-[3px] border-primary shadow-[0_6px_20px_-4px_hsl(var(--primary)/0.55)] flex items-center justify-center">
              <ActiveIcon className="w-[22px] h-[22px] text-primary" strokeWidth={2.2} />
            </div>
          </div>
        </div>

        {/* Pill nav bar */}
        <nav className="absolute bottom-0 inset-x-0 h-[62px] rounded-[40px] bg-card border border-border/50 shadow-[0_8px_30px_-10px_hsl(var(--foreground)/0.18)] flex items-center overflow-hidden">
          {tabs.map((tab, i) => {
            const active = i === activeTabIndex;
            const Icon = tab.icon;
            return (
              <button
                key={tab.path}
                onClick={() => navigate(tab.path)}
                data-testid={`nav-${tab.label.toLowerCase()}`}
                className={cn(
                  'flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-all duration-200',
                  active
                    ? 'opacity-0 pointer-events-none'
                    : 'text-muted-foreground hover:text-foreground active:scale-90'
                )}
              >
                <Icon className="w-[18px] h-[18px]" strokeWidth={1.8} />
                <span className="text-[8.5px] font-semibold tracking-tight">{tab.label}</span>
              </button>
            );
          })}
        </nav>

      </div>
    </div>
  );
};

export default BottomNav;

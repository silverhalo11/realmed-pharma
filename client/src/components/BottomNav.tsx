import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { bottomNavTabs, isBottomNavTabActive } from './bottom-nav.config';

const BottomNav = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const activeIndex = bottomNavTabs.findIndex((tab) => isBottomNavTabActive(tab.path, pathname));
  const activeTabIndex = activeIndex >= 0 ? activeIndex : 0;
  const indicatorPosition = `calc((100% / ${bottomNavTabs.length}) * ${activeTabIndex} + (100% / ${bottomNavTabs.length}) / 2)`;
  const activeTab = bottomNavTabs[activeTabIndex];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-3 safe-bottom" data-testid="nav-bottom">
      <div className="relative h-[84px] max-w-lg mx-auto">
        <div className="absolute inset-x-0 bottom-0 h-[66px] rounded-[20px] bg-card border border-border/70 shadow-[0_14px_28px_-18px_hsl(var(--foreground)/0.45)]" />

        <div
          className="pointer-events-none absolute -top-1 h-[58px] w-[58px] -translate-x-1/2 rounded-full border-[6px] border-background bg-primary/10 shadow-[0_10px_24px_-14px_hsl(var(--primary)/0.8)] transition-all duration-300 ease-out"
          style={{ left: indicatorPosition }}
        >
          <div className="absolute inset-[4px] rounded-full bg-card ring-2 ring-primary/40" />
        </div>

        <div className="relative z-10 flex items-end justify-around h-full pt-1">
          {bottomNavTabs.map((tab) => {
            const active = activeTab?.path === tab.path;
            return (
              <button
                key={tab.path}
                onClick={() => navigate(tab.path)}
                data-testid={`nav-${tab.label.toLowerCase()}`}
                className={cn(
                  'group flex flex-col items-center justify-center gap-1 flex-1 h-full pb-3 transition-all duration-300',
                  active ? '-translate-y-3 text-primary' : 'text-muted-foreground/80 hover:text-foreground',
                )}
              >
                <tab.icon className={cn('w-5 h-5 transition-transform duration-300', active && 'scale-110')} />
                <span
                  className={cn(
                    'text-[10px] font-semibold leading-none transition-all duration-200',
                    active ? 'opacity-100 text-primary' : 'opacity-70',
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

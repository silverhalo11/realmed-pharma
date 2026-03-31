import { Bell, LayoutDashboard, Package, Phone, ShoppingCart, Stethoscope } from 'lucide-react';

export const bottomNavTabs = [
  { label: 'Home', icon: LayoutDashboard, path: '/' },
  { label: 'Doctors', icon: Stethoscope, path: '/doctors' },
  { label: 'Products', icon: Package, path: '/products' },
  { label: 'Orders', icon: ShoppingCart, path: '/orders' },
  { label: 'Reminders', icon: Bell, path: '/reminders' },
  { label: 'Calls', icon: Phone, path: '/calls' },
] as const;

export const isBottomNavTabActive = (tabPath: string, pathname: string) => {
  if (tabPath === '/') return pathname === '/';
  return pathname === tabPath || pathname.startsWith(`${tabPath}/`);
};

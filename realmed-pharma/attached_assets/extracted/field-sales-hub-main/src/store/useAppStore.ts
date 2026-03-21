import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Doctor {
  id: string;
  name: string;
  clinic: string;
  phone: string;
  address: string;
  specialty: string;
  notes: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  description: string;
  image: string;
}

export interface Reminder {
  id: string;
  doctorId: string;
  text: string;
  date: string;
  done: boolean;
}

export interface Visit {
  id: string;
  doctorId: string;
  date: string;
  completed: boolean;
}

export interface Order {
  id: string;
  doctorId: string;
  items: { productId: string; quantity: number }[];
  date: string;
}

interface AppState {
  doctors: Doctor[];
  products: Product[];
  categories: string[];
  reminders: Reminder[];
  visits: Visit[];
  orders: Order[];
  addDoctor: (d: Omit<Doctor, 'id'>) => void;
  updateDoctor: (d: Doctor) => void;
  deleteDoctor: (id: string) => void;
  addProduct: (p: Omit<Product, 'id'>) => void;
  deleteProduct: (id: string) => void;
  addCategory: (c: string) => void;
  addReminder: (r: Omit<Reminder, 'id'>) => void;
  deleteReminder: (id: string) => void;
  toggleReminder: (id: string) => void;
  addVisit: (v: Omit<Visit, 'id'>) => void;
  toggleVisit: (id: string) => void;
  deleteVisit: (id: string) => void;
  addOrder: (o: Omit<Order, 'id'>) => void;
  deleteOrder: (id: string) => void;
}

const uid = () => crypto.randomUUID();

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      doctors: [],
      products: [],
      categories: ['Tablet', 'Syrup', 'Injection', 'Cream', 'Capsule'],
      reminders: [],
      visits: [],
      orders: [],
      addDoctor: (d) => set((s) => ({ doctors: [...s.doctors, { ...d, id: uid() }] })),
      updateDoctor: (d) => set((s) => ({ doctors: s.doctors.map((doc) => (doc.id === d.id ? d : doc)) })),
      deleteDoctor: (id) => set((s) => ({ doctors: s.doctors.filter((d) => d.id !== id) })),
      addProduct: (p) => set((s) => ({ products: [...s.products, { ...p, id: uid() }] })),
      deleteProduct: (id) => set((s) => ({ products: s.products.filter((p) => p.id !== id) })),
      addCategory: (c) => set((s) => ({ categories: [...new Set([...s.categories, c])] })),
      addReminder: (r) => set((s) => ({ reminders: [...s.reminders, { ...r, id: uid() }] })),
      deleteReminder: (id) => set((s) => ({ reminders: s.reminders.filter((r) => r.id !== id) })),
      toggleReminder: (id) => set((s) => ({ reminders: s.reminders.map((r) => (r.id === id ? { ...r, done: !r.done } : r)) })),
      addVisit: (v) => set((s) => ({ visits: [...s.visits, { ...v, id: uid() }] })),
      toggleVisit: (id) => set((s) => ({ visits: s.visits.map((v) => (v.id === id ? { ...v, completed: !v.completed } : v)) })),
      deleteVisit: (id) => set((s) => ({ visits: s.visits.filter((v) => v.id !== id) })),
      addOrder: (o) => set((s) => ({ orders: [...s.orders, { ...o, id: uid() }] })),
      deleteOrder: (id) => set((s) => ({ orders: s.orders.filter((o) => o.id !== id) })),
    }),
    { name: 'medrep-storage' }
  )
);

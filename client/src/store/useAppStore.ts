import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from '@/lib/api';

export interface Doctor {
  id: string;
  userId: string;
  name: string;
  degree: string | null;
  dob: string | null;
  clinic: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  specialty: string | null;
  notes: string | null;
  medicalStore: string | null;
  prescribedProducts: string[] | null;
}

export interface Product {
  id: string;
  userId: string;
  name: string;
  category: string | null;
  composition: string | null;
  description: string | null;
  catalogSlide: number | null;
  catalogImage: string | null;
  isSeeded: boolean | null;
}

export interface Reminder {
  id: string;
  userId: string;
  doctorId: string;
  text: string | null;
  date: string | null;
  done: boolean | null;
}

export interface Visit {
  id: string;
  userId: string;
  doctorId: string;
  date: string | null;
  completed: boolean | null;
}

export interface Order {
  id: string;
  userId: string;
  doctorId: string;
  items: { productId: string; quantity: number }[] | null;
  date: string | null;
}

export interface Call {
  id: string;
  userId: string;
  doctorId: string;
  date: string | null;
  status: string | null;
  products: { productId: string; status: 'pending' | 'liked' | 'removed' }[] | null;
  notes: string | null;
}

const DEFAULT_CATEGORIES = ['Eye Drops', 'Eye Ointment', 'Eye Gel', 'Tablets', 'Capsules'];

interface AppState {
  isLoggedIn: boolean;
  userName: string;
  userEmail: string;
  userPhone: string;
  doctors: Doctor[];
  products: Product[];
  categories: string[];
  reminders: Reminder[];
  visits: Visit[];
  orders: Order[];
  calls: Call[];
  _loading: boolean;
  _authChecked: boolean;

  register: (name: string, email: string, phone: string, password: string) => Promise<{ success: boolean; error?: string }>;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  checkAuth: () => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (name: string, phone: string) => Promise<void>;

  fetchAll: () => Promise<void>;

  addDoctor: (d: Omit<Doctor, 'id' | 'userId'>) => Promise<void>;
  updateDoctor: (d: Doctor) => Promise<void>;
  deleteDoctor: (id: string) => Promise<void>;
  togglePrescribedProduct: (doctorId: string, productId: string) => Promise<void>;

  addProduct: (p: Omit<Product, 'id' | 'userId' | 'isSeeded'>) => Promise<void>;
  updateProduct: (p: Product) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  addCategory: (c: string) => void;

  addReminder: (r: Omit<Reminder, 'id' | 'userId'>) => Promise<void>;
  deleteReminder: (id: string) => Promise<void>;
  toggleReminder: (id: string) => Promise<void>;

  addVisit: (v: Omit<Visit, 'id' | 'userId'>) => Promise<void>;
  toggleVisit: (id: string) => Promise<void>;
  deleteVisit: (id: string) => Promise<void>;

  addOrder: (o: Omit<Order, 'id' | 'userId'>) => Promise<void>;
  deleteOrder: (id: string) => Promise<void>;

  addCall: (c: Omit<Call, 'id' | 'userId'>) => Promise<Call | null>;
  updateCall: (c: Call) => Promise<void>;
  deleteCall: (id: string) => Promise<void>;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      isLoggedIn: false,
      userName: '',
      userEmail: '',
      userPhone: '',
      doctors: [],
      products: [],
      categories: DEFAULT_CATEGORIES,
      reminders: [],
      visits: [],
      orders: [],
      calls: [],
      _loading: false,
      _authChecked: false,

      register: async (name, email, phone, password) => {
        try {
          const user = await api.post<{ id: string; username: string; email: string; phone: string }>('/api/auth/register', { username: name, email, phone, password });
          set({ isLoggedIn: true, userName: user.username, userEmail: user.email, userPhone: user.phone || '' });
          await get().fetchAll();
          return { success: true };
        } catch (err: any) {
          return { success: false, error: err.message };
        }
      },

      login: async (email, password) => {
        try {
          const user = await api.post<{ id: string; username: string; email: string; phone: string }>('/api/auth/login', { email, password });
          set({ isLoggedIn: true, userName: user.username, userEmail: user.email, userPhone: user.phone || '' });
          await get().fetchAll();
          return { success: true };
        } catch (err: any) {
          return { success: false, error: err.message };
        }
      },

      checkAuth: async () => {
        try {
          const user = await api.get<{ id: string; username: string; email: string; phone: string }>('/api/auth/me');
          set({ isLoggedIn: true, userName: user.username, userEmail: user.email, userPhone: user.phone || '', _authChecked: true });
          await get().fetchAll();
        } catch {
          set({ isLoggedIn: false, userName: '', userEmail: '', userPhone: '', _authChecked: true });
        }
      },

      logout: async () => {
        try { await api.post('/api/auth/logout'); } catch {}
        set({ isLoggedIn: false, userName: '', userEmail: '', userPhone: '', doctors: [], products: [], orders: [], visits: [], reminders: [], calls: [] });
      },

      updateProfile: async (name, phone) => {
        try {
          const user = await api.patch<{ username: string; email: string; phone: string }>('/api/auth/profile', { username: name, phone });
          set({ userName: user.username, userPhone: user.phone || '' });
        } catch {}
      },

      fetchAll: async () => {
        set({ _loading: true });
        try {
          const results = await Promise.allSettled([
            api.get<Doctor[]>('/api/doctors'),
            api.get<Product[]>('/api/products'),
            api.get<Order[]>('/api/orders'),
            api.get<Visit[]>('/api/visits'),
            api.get<Reminder[]>('/api/reminders'),
            api.get<Call[]>('/api/calls'),
          ]);
          const doctorsList = results[0].status === 'fulfilled' ? results[0].value : [];
          const productsList = results[1].status === 'fulfilled' ? results[1].value : [];
          const ordersList = results[2].status === 'fulfilled' ? results[2].value : [];
          const visitsList = results[3].status === 'fulfilled' ? results[3].value : [];
          const remindersList = results[4].status === 'fulfilled' ? results[4].value : [];
          const callsList = results[5].status === 'fulfilled' ? results[5].value : [];
          const productCategories = [...new Set(productsList.map((p) => p.category || '').filter(Boolean))];
          const allCategories = [...new Set([...DEFAULT_CATEGORIES, ...productCategories])];
          set({ doctors: doctorsList, products: productsList, orders: ordersList, visits: visitsList, reminders: remindersList, calls: callsList, categories: allCategories, _loading: false });
        } catch {
          set({ _loading: false });
        }
      },

      addDoctor: async (d) => {
        try {
          const doc = await api.post<Doctor>('/api/doctors', d);
          set((s) => ({ doctors: [...s.doctors, doc] }));
        } catch {}
      },
      updateDoctor: async (d) => {
        try {
          const doc = await api.put<Doctor>(`/api/doctors/${d.id}`, d);
          set((s) => ({ doctors: s.doctors.map((x) => x.id === d.id ? doc : x) }));
        } catch {}
      },
      deleteDoctor: async (id) => {
        try {
          await api.delete(`/api/doctors/${id}`);
          set((s) => ({ doctors: s.doctors.filter((d) => d.id !== id) }));
        } catch {}
      },
      togglePrescribedProduct: async (doctorId, productId) => {
        const doctor = get().doctors.find((d) => d.id === doctorId);
        if (!doctor) return;
        const prods = doctor.prescribedProducts || [];
        const newProds = prods.includes(productId) ? prods.filter((p) => p !== productId) : [...prods, productId];
        try {
          const updated = await api.put<Doctor>(`/api/doctors/${doctorId}`, { ...doctor, prescribedProducts: newProds });
          set((s) => ({ doctors: s.doctors.map((d) => d.id === doctorId ? updated : d) }));
        } catch {}
      },

      addProduct: async (p) => {
        try {
          const prod = await api.post<Product>('/api/products', p);
          set((s) => ({ products: [...s.products, prod] }));
        } catch {}
      },
      updateProduct: async (p) => {
        try {
          const prod = await api.put<Product>(`/api/products/${p.id}`, p);
          set((s) => ({ products: s.products.map((x) => x.id === p.id ? prod : x) }));
        } catch {}
      },
      deleteProduct: async (id) => {
        try {
          await api.delete(`/api/products/${id}`);
          set((s) => ({ products: s.products.filter((p) => p.id !== id) }));
        } catch {}
      },
      addCategory: (c) => set((s) => ({ categories: [...new Set([...s.categories, c])] })),

      addReminder: async (r) => {
        try {
          const reminder = await api.post<Reminder>('/api/reminders', r);
          set((s) => ({ reminders: [...s.reminders, reminder] }));
        } catch {}
      },
      deleteReminder: async (id) => {
        try {
          await api.delete(`/api/reminders/${id}`);
          set((s) => ({ reminders: s.reminders.filter((r) => r.id !== id) }));
        } catch {}
      },
      toggleReminder: async (id) => {
        try {
          const updated = await api.patch<Reminder>(`/api/reminders/${id}/toggle`);
          set((s) => ({ reminders: s.reminders.map((r) => r.id === id ? updated : r) }));
        } catch {}
      },

      addVisit: async (v) => {
        try {
          const visit = await api.post<Visit>('/api/visits', v);
          set((s) => ({ visits: [...s.visits, visit] }));
        } catch {}
      },
      toggleVisit: async (id) => {
        try {
          const updated = await api.patch<Visit>(`/api/visits/${id}/toggle`);
          set((s) => ({ visits: s.visits.map((v) => v.id === id ? updated : v) }));
        } catch {}
      },
      deleteVisit: async (id) => {
        try {
          await api.delete(`/api/visits/${id}`);
          set((s) => ({ visits: s.visits.filter((v) => v.id !== id) }));
        } catch {}
      },

      addOrder: async (o) => {
        try {
          const order = await api.post<Order>('/api/orders', o);
          set((s) => ({ orders: [...s.orders, order] }));
        } catch {}
      },
      deleteOrder: async (id) => {
        try {
          await api.delete(`/api/orders/${id}`);
          set((s) => ({ orders: s.orders.filter((o) => o.id !== id) }));
        } catch {}
      },

      addCall: async (c) => {
        try {
          const call = await api.post<Call>('/api/calls', c);
          set((s) => ({ calls: [...s.calls, call] }));
          return call;
        } catch {
          return null;
        }
      },
      updateCall: async (c) => {
        try {
          const call = await api.put<Call>(`/api/calls/${c.id}`, c);
          set((s) => ({ calls: s.calls.map((x) => x.id === c.id ? call : x) }));
        } catch {}
      },
      deleteCall: async (id) => {
        try {
          await api.delete(`/api/calls/${id}`);
          set((s) => ({ calls: s.calls.filter((c) => c.id !== id) }));
        } catch {}
      },
    }),
    {
      name: 'medrep-storage',
      partialize: (state) => ({
        isLoggedIn: state.isLoggedIn,
        userName: state.userName,
        userEmail: state.userEmail,
        userPhone: state.userPhone,
        categories: state.categories,
      }),
    }
  )
);

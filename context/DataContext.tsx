import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { Doctor, Order, OrderItem, Product, Reminder, Visit } from '@/types';
import { SEED_PRODUCTS } from '@/constants/seedData';
import { scheduleVisitNotification, cancelVisitNotification } from '@/utils/notifications';

function genId() {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

function getKeys(userId: string) {
  return {
    doctors: `@realmed/doctors/${userId}`,
    products: `@realmed/products/${userId}`,
    orders: `@realmed/orders/${userId}`,
    visits: `@realmed/visits/${userId}`,
    reminders: `@realmed/reminders/${userId}`,
    seeded: `@realmed/seeded/${userId}`,
  };
}

interface DataContextType {
  doctors: Doctor[];
  products: Product[];
  orders: Order[];
  visits: Visit[];
  reminders: Reminder[];
  // Doctors
  addDoctor: (data: Omit<Doctor, 'id' | 'userId' | 'createdAt'>) => Promise<Doctor>;
  updateDoctor: (id: string, data: Partial<Doctor>) => Promise<void>;
  deleteDoctor: (id: string) => Promise<void>;
  // Products
  addProduct: (data: Omit<Product, 'id' | 'userId' | 'isSeeded'>) => Promise<Product>;
  updateProduct: (id: string, data: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  // Orders
  addOrder: (data: { doctorId: string; doctorName: string; items: OrderItem[] }) => Promise<Order>;
  deleteOrder: (id: string) => Promise<void>;
  // Visits
  addVisit: (data: { doctorId: string; doctorName: string; doctorClinic: string; date: string; time: string; showProducts: string[] }) => Promise<Visit>;
  toggleVisit: (id: string) => Promise<void>;
  deleteVisit: (id: string) => Promise<void>;
  toggleAcceptedProduct: (visitId: string, productId: string) => Promise<void>;
  // Reminders
  addReminder: (data: { doctorId: string; doctorName: string; text: string; date: string }) => Promise<Reminder>;
  toggleReminder: (id: string) => Promise<void>;
  deleteReminder: (id: string) => Promise<void>;
}

const DataContext = createContext<DataContextType | null>(null);

export function DataProvider({ userId, children }: { userId: string; children: React.ReactNode }) {
  const keys = getKeys(userId);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);

  useEffect(() => {
    async function load() {
      const [docRaw, prodRaw, ordRaw, visRaw, remRaw, seeded] = await Promise.all([
        AsyncStorage.getItem(keys.doctors),
        AsyncStorage.getItem(keys.products),
        AsyncStorage.getItem(keys.orders),
        AsyncStorage.getItem(keys.visits),
        AsyncStorage.getItem(keys.reminders),
        AsyncStorage.getItem(keys.seeded),
      ]);
      setDoctors(docRaw ? JSON.parse(docRaw) : []);
      setOrders(ordRaw ? JSON.parse(ordRaw) : []);

      // Migrate old visits without showProducts/acceptedProducts/time
      const rawVisits: Visit[] = visRaw ? JSON.parse(visRaw) : [];
      setVisits(rawVisits.map(v => ({
        showProducts: [],
        acceptedProducts: [],
        time: '',
        ...v,
      })));

      setReminders(remRaw ? JSON.parse(remRaw) : []);

      if (!seeded) {
        const seededProducts: Product[] = SEED_PRODUCTS.map(p => ({
          id: genId(),
          userId,
          name: p.name,
          category: p.category,
          composition: p.composition,
          description: p.description,
          catalogSlide: p.catalogSlide,
          isSeeded: true,
        }));
        await AsyncStorage.setItem(keys.products, JSON.stringify(seededProducts));
        await AsyncStorage.setItem(keys.seeded, '1');
        setProducts(seededProducts);
      } else {
        setProducts(prodRaw ? JSON.parse(prodRaw) : []);
      }
    }
    load();
  }, [userId]);

  const saveAndSet = useCallback(async <T>(key: string, data: T[], setter: (d: T[]) => void) => {
    await AsyncStorage.setItem(key, JSON.stringify(data));
    setter(data);
  }, []);

  // Doctors
  const addDoctor = useCallback(async (data: Omit<Doctor, 'id' | 'userId' | 'createdAt'>) => {
    const doc: Doctor = { ...data, id: genId(), userId, createdAt: new Date().toISOString() };
    const next = [...doctors, doc];
    await saveAndSet(keys.doctors, next, setDoctors);
    return doc;
  }, [doctors, userId, keys.doctors, saveAndSet]);

  const updateDoctor = useCallback(async (id: string, data: Partial<Doctor>) => {
    const next = doctors.map(d => d.id === id ? { ...d, ...data } : d);
    await saveAndSet(keys.doctors, next, setDoctors);
  }, [doctors, keys.doctors, saveAndSet]);

  const deleteDoctor = useCallback(async (id: string) => {
    const next = doctors.filter(d => d.id !== id);
    await saveAndSet(keys.doctors, next, setDoctors);
  }, [doctors, keys.doctors, saveAndSet]);

  // Products
  const addProduct = useCallback(async (data: Omit<Product, 'id' | 'userId' | 'isSeeded'>) => {
    const prod: Product = { ...data, id: genId(), userId, isSeeded: false };
    const next = [...products, prod];
    await saveAndSet(keys.products, next, setProducts);
    return prod;
  }, [products, userId, keys.products, saveAndSet]);

  const updateProduct = useCallback(async (id: string, data: Partial<Product>) => {
    const next = products.map(p => p.id === id ? { ...p, ...data } : p);
    await saveAndSet(keys.products, next, setProducts);
  }, [products, keys.products, saveAndSet]);

  const deleteProduct = useCallback(async (id: string) => {
    const next = products.filter(p => p.id !== id);
    await saveAndSet(keys.products, next, setProducts);
  }, [products, keys.products, saveAndSet]);

  // Orders
  const addOrder = useCallback(async (data: { doctorId: string; doctorName: string; items: OrderItem[] }) => {
    const order: Order = {
      id: genId(), userId, ...data,
      date: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
    };
    const next = [order, ...orders];
    await saveAndSet(keys.orders, next, setOrders);
    return order;
  }, [orders, userId, keys.orders, saveAndSet]);

  const deleteOrder = useCallback(async (id: string) => {
    const next = orders.filter(o => o.id !== id);
    await saveAndSet(keys.orders, next, setOrders);
  }, [orders, keys.orders, saveAndSet]);

  // Visits
  const addVisit = useCallback(async (data: { doctorId: string; doctorName: string; doctorClinic: string; date: string; time: string; showProducts: string[] }) => {
    const notificationId = await scheduleVisitNotification(
      genId(),
      data.doctorName,
      data.doctorClinic,
      data.date,
      data.time,
    );
    const visit: Visit = {
      id: genId(), userId, ...data,
      completed: false,
      acceptedProducts: [],
      notificationId: notificationId ?? undefined,
      createdAt: new Date().toISOString(),
    };
    const next = [visit, ...visits];
    await saveAndSet(keys.visits, next, setVisits);
    return visit;
  }, [visits, userId, keys.visits, saveAndSet]);

  const toggleVisit = useCallback(async (id: string) => {
    const next = visits.map(v => v.id === id ? { ...v, completed: !v.completed } : v);
    await saveAndSet(keys.visits, next, setVisits);
  }, [visits, keys.visits, saveAndSet]);

  const deleteVisit = useCallback(async (id: string) => {
    const visit = visits.find(v => v.id === id);
    if (visit?.notificationId) await cancelVisitNotification(visit.notificationId);
    const next = visits.filter(v => v.id !== id);
    await saveAndSet(keys.visits, next, setVisits);
  }, [visits, keys.visits, saveAndSet]);

  // Toggle a product as accepted/rejected during a visit.
  // Also syncs the doctor's prescribedProducts accordingly.
  const toggleAcceptedProduct = useCallback(async (visitId: string, productId: string) => {
    const visit = visits.find(v => v.id === visitId);
    if (!visit) return;

    const alreadyAccepted = (visit.acceptedProducts ?? []).includes(productId);
    const newAccepted = alreadyAccepted
      ? (visit.acceptedProducts ?? []).filter(id => id !== productId)
      : [...(visit.acceptedProducts ?? []), productId];

    const newVisits = visits.map(v => v.id === visitId ? { ...v, acceptedProducts: newAccepted } : v);
    await saveAndSet(keys.visits, newVisits, setVisits);

    // Sync doctor's prescribedProducts
    const doctor = doctors.find(d => d.id === visit.doctorId);
    if (doctor) {
      let prescribed = [...(doctor.prescribedProducts ?? [])];
      if (alreadyAccepted) {
        prescribed = prescribed.filter(id => id !== productId);
      } else {
        if (!prescribed.includes(productId)) prescribed.push(productId);
      }
      const newDoctors = doctors.map(d => d.id === doctor.id ? { ...d, prescribedProducts: prescribed } : d);
      await saveAndSet(keys.doctors, newDoctors, setDoctors);
    }
  }, [visits, doctors, keys.visits, keys.doctors, saveAndSet]);

  // Reminders
  const addReminder = useCallback(async (data: { doctorId: string; doctorName: string; text: string; date: string }) => {
    const reminder: Reminder = { id: genId(), userId, ...data, done: false, createdAt: new Date().toISOString() };
    const next = [reminder, ...reminders];
    await saveAndSet(keys.reminders, next, setReminders);
    return reminder;
  }, [reminders, userId, keys.reminders, saveAndSet]);

  const toggleReminder = useCallback(async (id: string) => {
    const next = reminders.map(r => r.id === id ? { ...r, done: !r.done } : r);
    await saveAndSet(keys.reminders, next, setReminders);
  }, [reminders, keys.reminders, saveAndSet]);

  const deleteReminder = useCallback(async (id: string) => {
    const next = reminders.filter(r => r.id !== id);
    await saveAndSet(keys.reminders, next, setReminders);
  }, [reminders, keys.reminders, saveAndSet]);

  return (
    <DataContext.Provider value={{
      doctors, products, orders, visits, reminders,
      addDoctor, updateDoctor, deleteDoctor,
      addProduct, updateProduct, deleteProduct,
      addOrder, deleteOrder,
      addVisit, toggleVisit, deleteVisit, toggleAcceptedProduct,
      addReminder, toggleReminder, deleteReminder,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}

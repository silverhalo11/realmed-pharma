import { eq, and } from "drizzle-orm";
import { db } from "./db";
import {
  users, doctors, products, orders, visits, reminders,
  type User, type InsertUser,
  type Doctor, type Product, type Order, type Visit, type Reminder,
} from "@shared/schema";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, data: Partial<Pick<User, 'username' | 'phone'>>): Promise<User | undefined>;

  getDoctors(userId: string): Promise<Doctor[]>;
  addDoctor(userId: string, data: Omit<Doctor, 'id' | 'userId'>): Promise<Doctor>;
  updateDoctor(userId: string, id: string, data: Partial<Doctor>): Promise<Doctor | undefined>;
  deleteDoctor(userId: string, id: string): Promise<void>;

  getProducts(userId: string): Promise<Product[]>;
  addProduct(userId: string, data: Omit<Product, 'id' | 'userId'>): Promise<Product>;
  updateProduct(userId: string, id: string, data: Partial<Product>): Promise<Product | undefined>;
  deleteProduct(userId: string, id: string): Promise<void>;
  seedProducts(userId: string, productList: Omit<Product, 'id' | 'userId'>[]): Promise<void>;

  getOrders(userId: string): Promise<Order[]>;
  addOrder(userId: string, data: Omit<Order, 'id' | 'userId'>): Promise<Order>;
  deleteOrder(userId: string, id: string): Promise<void>;

  getVisits(userId: string): Promise<Visit[]>;
  addVisit(userId: string, data: Omit<Visit, 'id' | 'userId'>): Promise<Visit>;
  toggleVisit(userId: string, id: string): Promise<Visit | undefined>;
  deleteVisit(userId: string, id: string): Promise<void>;

  getReminders(userId: string): Promise<Reminder[]>;
  addReminder(userId: string, data: Omit<Reminder, 'id' | 'userId'>): Promise<Reminder>;
  toggleReminder(userId: string, id: string): Promise<Reminder | undefined>;
  deleteReminder(userId: string, id: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string) {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string) {
    const [user] = await db.select().from(users).where(eq(users.email, email.toLowerCase()));
    return user;
  }

  async createUser(data: InsertUser) {
    const [user] = await db.insert(users).values({ ...data, email: data.email.toLowerCase() }).returning();
    return user;
  }

  async updateUser(id: string, data: Partial<Pick<User, 'username' | 'phone'>>) {
    const [user] = await db.update(users).set(data).where(eq(users.id, id)).returning();
    return user;
  }

  async getDoctors(userId: string) {
    return db.select().from(doctors).where(eq(doctors.userId, userId));
  }

  async addDoctor(userId: string, data: Omit<Doctor, 'id' | 'userId'>) {
    const [doc] = await db.insert(doctors).values({ ...data, userId }).returning();
    return doc;
  }

  async updateDoctor(userId: string, id: string, data: Partial<Doctor>) {
    const { id: _id, userId: _uid, ...rest } = data;
    const [doc] = await db.update(doctors).set(rest).where(and(eq(doctors.id, id), eq(doctors.userId, userId))).returning();
    return doc;
  }

  async deleteDoctor(userId: string, id: string) {
    await db.delete(doctors).where(and(eq(doctors.id, id), eq(doctors.userId, userId)));
  }

  async getProducts(userId: string) {
    return db.select().from(products).where(eq(products.userId, userId));
  }

  async addProduct(userId: string, data: Omit<Product, 'id' | 'userId'>) {
    const [prod] = await db.insert(products).values({ ...data, userId }).returning();
    return prod;
  }

  async updateProduct(userId: string, id: string, data: Partial<Product>) {
    const { id: _id, userId: _uid, ...rest } = data;
    const [prod] = await db.update(products).set(rest).where(and(eq(products.id, id), eq(products.userId, userId))).returning();
    return prod;
  }

  async deleteProduct(userId: string, id: string) {
    await db.delete(products).where(and(eq(products.id, id), eq(products.userId, userId)));
  }

  async seedProducts(userId: string, productList: Omit<Product, 'id' | 'userId'>[]) {
    const existing = await db.select().from(products).where(and(eq(products.userId, userId), eq(products.isSeeded, true)));
    if (existing.length > 0) return;
    const values = productList.map((p) => ({ ...p, userId, isSeeded: true }));
    if (values.length > 0) {
      await db.insert(products).values(values);
    }
  }

  async getOrders(userId: string) {
    return db.select().from(orders).where(eq(orders.userId, userId));
  }

  async addOrder(userId: string, data: Omit<Order, 'id' | 'userId'>) {
    const [order] = await db.insert(orders).values({ ...data, userId }).returning();
    return order;
  }

  async deleteOrder(userId: string, id: string) {
    await db.delete(orders).where(and(eq(orders.id, id), eq(orders.userId, userId)));
  }

  async getVisits(userId: string) {
    return db.select().from(visits).where(eq(visits.userId, userId));
  }

  async addVisit(userId: string, data: Omit<Visit, 'id' | 'userId'>) {
    const [visit] = await db.insert(visits).values({ ...data, userId }).returning();
    return visit;
  }

  async toggleVisit(userId: string, id: string) {
    const [existing] = await db.select().from(visits).where(and(eq(visits.id, id), eq(visits.userId, userId)));
    if (!existing) return undefined;
    const [updated] = await db.update(visits).set({ completed: !existing.completed }).where(eq(visits.id, id)).returning();
    return updated;
  }

  async deleteVisit(userId: string, id: string) {
    await db.delete(visits).where(and(eq(visits.id, id), eq(visits.userId, userId)));
  }

  async getReminders(userId: string) {
    return db.select().from(reminders).where(eq(reminders.userId, userId));
  }

  async addReminder(userId: string, data: Omit<Reminder, 'id' | 'userId'>) {
    const [reminder] = await db.insert(reminders).values({ ...data, userId }).returning();
    return reminder;
  }

  async toggleReminder(userId: string, id: string) {
    const [existing] = await db.select().from(reminders).where(and(eq(reminders.id, id), eq(reminders.userId, userId)));
    if (!existing) return undefined;
    const [updated] = await db.update(reminders).set({ done: !existing.done }).where(eq(reminders.id, id)).returning();
    return updated;
  }

  async deleteReminder(userId: string, id: string) {
    await db.delete(reminders).where(and(eq(reminders.id, id), eq(reminders.userId, userId)));
  }
}

export const storage = new DatabaseStorage();

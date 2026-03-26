import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone").default(""),
});

export const doctors = pgTable("doctors", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  degree: text("degree").default(""),
  dob: text("dob").default(""),
  clinic: text("clinic").default(""),
  phone: text("phone").default(""),
  address: text("address").default(""),
  specialty: text("specialty").default(""),
  notes: text("notes").default(""),
  medicalStore: text("medical_store").default(""),
  prescribedProducts: text("prescribed_products").array().default(sql`'{}'::text[]`),
});

export const products = pgTable("products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  category: text("category").default(""),
  composition: text("composition").default(""),
  description: text("description").default(""),
  catalogSlide: integer("catalog_slide").default(0),
  isSeeded: boolean("is_seeded").default(false),
  imageUrl: text("image_url").default(""),
});

export const orders = pgTable("orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  doctorId: varchar("doctor_id").notNull(),
  items: json("items").$type<{ productId: string; quantity: number }[]>().default([]),
  date: text("date").default(""),
});

export const visits = pgTable("visits", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  doctorId: varchar("doctor_id").notNull(),
  date: text("date").default(""),
  completed: boolean("completed").default(false),
});

export const reminders = pgTable("reminders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  doctorId: varchar("doctor_id").notNull(),
  text: text("text").default(""),
  date: text("date").default(""),
  done: boolean("done").default(false),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  phone: true,
});

export const insertDoctorSchema = createInsertSchema(doctors).omit({ id: true, userId: true });
export const insertProductSchema = createInsertSchema(products).omit({ id: true, userId: true, isSeeded: true });
export const insertOrderSchema = createInsertSchema(orders).omit({ id: true, userId: true });
export const insertVisitSchema = createInsertSchema(visits).omit({ id: true, userId: true });
export const insertReminderSchema = createInsertSchema(reminders).omit({ id: true, userId: true });

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Doctor = typeof doctors.$inferSelect;
export type Product = typeof products.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type Visit = typeof visits.$inferSelect;
export type Reminder = typeof reminders.$inferSelect;

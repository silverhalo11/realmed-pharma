import type { Express, Request, Response } from "express";
import { type Server } from "http";
import { storage } from "./storage";
import bcrypt from "bcryptjs";
import { DEFAULT_PRODUCTS } from "./seedProducts";

declare module "express-session" {
  interface SessionData {
    userId: string;
  }
}

function requireAuth(req: Request, res: Response, next: Function) {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  next();
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  app.post("/api/auth/register", async (req, res) => {
    try {
      const { username, email, phone, password } = req.body;
      if (!username || !email || !password) {
        return res.status(400).json({ message: "Username, email, and password are required" });
      }
      const existingEmail = await storage.getUserByEmail(email);
      if (existingEmail) {
        return res.status(400).json({ message: "An account with this email already exists" });
      }
      const existingUsername = await storage.getUserByUsername(username);
      if (existingUsername) {
        return res.status(400).json({ message: "Username already taken" });
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await storage.createUser({ username, email, phone: phone || "", password: hashedPassword });
      await storage.seedProducts(user.id, DEFAULT_PRODUCTS);
      req.session.userId = user.id;
      res.json({ id: user.id, username: user.username, email: user.email, phone: user.phone });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      const valid = await bcrypt.compare(password, user.password);
      if (!valid) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      req.session.userId = user.id;
      res.json({ id: user.id, username: user.username, email: user.email, phone: user.phone });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy(() => {
      res.json({ ok: true });
    });
  });

  app.get("/api/auth/me", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user) return res.status(401).json({ message: "User not found" });
      res.json({ id: user.id, username: user.username, email: user.email, phone: user.phone });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.patch("/api/auth/profile", requireAuth, async (req, res) => {
    try {
      const { username, phone } = req.body;
      const user = await storage.updateUser(req.session.userId!, { username, phone });
      if (!user) return res.status(404).json({ message: "User not found" });
      res.json({ id: user.id, username: user.username, email: user.email, phone: user.phone });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.get("/api/doctors", requireAuth, async (req, res) => {
    const data = await storage.getDoctors(req.session.userId!);
    res.json(data);
  });

  app.post("/api/doctors", requireAuth, async (req, res) => {
    const doc = await storage.addDoctor(req.session.userId!, req.body);
    res.json(doc);
  });

  app.put("/api/doctors/:id", requireAuth, async (req, res) => {
    const doc = await storage.updateDoctor(req.session.userId!, req.params.id, req.body);
    if (!doc) return res.status(404).json({ message: "Doctor not found" });
    res.json(doc);
  });

  app.delete("/api/doctors/:id", requireAuth, async (req, res) => {
    await storage.deleteDoctor(req.session.userId!, req.params.id);
    res.json({ ok: true });
  });

  app.get("/api/products", requireAuth, async (req, res) => {
    const data = await storage.getProducts(req.session.userId!);
    res.json(data);
  });

  app.post("/api/products", requireAuth, async (req, res) => {
    const prod = await storage.addProduct(req.session.userId!, req.body);
    res.json(prod);
  });

  app.put("/api/products/:id", requireAuth, async (req, res) => {
    const prod = await storage.updateProduct(req.session.userId!, req.params.id, req.body);
    if (!prod) return res.status(404).json({ message: "Product not found" });
    res.json(prod);
  });

  app.delete("/api/products/:id", requireAuth, async (req, res) => {
    await storage.deleteProduct(req.session.userId!, req.params.id);
    res.json({ ok: true });
  });

  app.get("/api/orders", requireAuth, async (req, res) => {
    const data = await storage.getOrders(req.session.userId!);
    res.json(data);
  });

  app.post("/api/orders", requireAuth, async (req, res) => {
    const order = await storage.addOrder(req.session.userId!, req.body);
    res.json(order);
  });

  app.delete("/api/orders/:id", requireAuth, async (req, res) => {
    await storage.deleteOrder(req.session.userId!, req.params.id);
    res.json({ ok: true });
  });

  app.get("/api/visits", requireAuth, async (req, res) => {
    const data = await storage.getVisits(req.session.userId!);
    res.json(data);
  });

  app.post("/api/visits", requireAuth, async (req, res) => {
    const visit = await storage.addVisit(req.session.userId!, req.body);
    res.json(visit);
  });

  app.patch("/api/visits/:id/toggle", requireAuth, async (req, res) => {
    const visit = await storage.toggleVisit(req.session.userId!, req.params.id);
    if (!visit) return res.status(404).json({ message: "Visit not found" });
    res.json(visit);
  });

  app.delete("/api/visits/:id", requireAuth, async (req, res) => {
    await storage.deleteVisit(req.session.userId!, req.params.id);
    res.json({ ok: true });
  });

  app.get("/api/reminders", requireAuth, async (req, res) => {
    const data = await storage.getReminders(req.session.userId!);
    res.json(data);
  });

  app.post("/api/reminders", requireAuth, async (req, res) => {
    const reminder = await storage.addReminder(req.session.userId!, req.body);
    res.json(reminder);
  });

  app.patch("/api/reminders/:id/toggle", requireAuth, async (req, res) => {
    const reminder = await storage.toggleReminder(req.session.userId!, req.params.id);
    if (!reminder) return res.status(404).json({ message: "Reminder not found" });
    res.json(reminder);
  });

  app.delete("/api/reminders/:id", requireAuth, async (req, res) => {
    await storage.deleteReminder(req.session.userId!, req.params.id);
    res.json({ ok: true });
  });

  return httpServer;
}

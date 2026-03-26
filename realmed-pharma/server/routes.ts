import express from "express";
import type { Express, Request, Response } from "express";
import { type Server } from "http";
import { storage } from "./storage";
import bcrypt from "bcryptjs";
import { DEFAULT_PRODUCTS } from "./seedProducts";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadsDir),
    filename: (_req, file, cb) => {
      const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      cb(null, `${unique}${path.extname(file.originalname)}`);
    },
  }),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only image files are allowed"));
  },
});

declare module "express-session" {
  interface SessionData {
    userId: string;
  }
}

function requireAuth(req: Request, res: Response, next: Function) {
  if (!req.session.userId) {
    console.log("requireAuth FAILED:", req.method, req.path, "sessionID:", req.sessionID, "cookie:", req.headers.cookie ? "present" : "missing");
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
      try {
        await storage.seedProducts(user.id, DEFAULT_PRODUCTS);
      } catch (seedErr: any) {
        console.error("seedProducts error (non-fatal):", seedErr.message);
      }
      req.session.userId = user.id;
      await new Promise<void>((resolve, reject) => {
        req.session.save((err) => {
          if (err) {
            console.error("Session save error:", err);
            reject(err);
          } else {
            console.log("Session saved successfully for userId:", user.id);
            resolve();
          }
        });
      });
      res.json({ id: user.id, username: user.username, email: user.email, phone: user.phone });
    } catch (err: any) {
      console.error("Register error:", err.message);
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
      try {
        await storage.seedProducts(user.id, DEFAULT_PRODUCTS);
      } catch (seedErr: any) {
        console.error("seedProducts error (non-fatal):", seedErr.message);
      }
      await new Promise<void>((resolve, reject) => {
        req.session.save((err) => {
          if (err) {
            console.error("Session save error:", err);
            reject(err);
          } else {
            console.log("Session saved successfully for userId:", user.id);
            resolve();
          }
        });
      });
      res.json({ id: user.id, username: user.username, email: user.email, phone: user.phone });
    } catch (err: any) {
      console.error("Login error:", err.message);
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

  app.use("/uploads", express.static(uploadsDir));

  app.post("/api/upload-image", requireAuth, upload.single("image"), async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ message: "No image provided" });
      const imageUrl = `/uploads/${req.file.filename}`;
      res.json({ imageUrl });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.get("/api/doctors", requireAuth, async (req, res) => {
    try {
      const data = await storage.getDoctors(req.session.userId!);
      res.json(data);
    } catch (err: any) { console.error("GET /api/doctors error:", err.message); res.status(500).json({ message: err.message }); }
  });

  app.post("/api/doctors", requireAuth, async (req, res) => {
    try {
      const doc = await storage.addDoctor(req.session.userId!, req.body);
      res.json(doc);
    } catch (err: any) { console.error("POST /api/doctors error:", err.message); res.status(500).json({ message: err.message }); }
  });

  app.put("/api/doctors/:id", requireAuth, async (req, res) => {
    try {
      const doc = await storage.updateDoctor(req.session.userId!, req.params.id, req.body);
      if (!doc) return res.status(404).json({ message: "Doctor not found" });
      res.json(doc);
    } catch (err: any) { console.error("PUT /api/doctors error:", err.message); res.status(500).json({ message: err.message }); }
  });

  app.delete("/api/doctors/:id", requireAuth, async (req, res) => {
    try {
      await storage.deleteDoctor(req.session.userId!, req.params.id);
      res.json({ ok: true });
    } catch (err: any) { console.error("DELETE /api/doctors error:", err.message); res.status(500).json({ message: err.message }); }
  });

  app.get("/api/products", requireAuth, async (req, res) => {
    try {
      const data = await storage.getProducts(req.session.userId!);
      res.json(data);
    } catch (err: any) { console.error("GET /api/products error:", err.message); res.status(500).json({ message: err.message }); }
  });

  app.post("/api/products", requireAuth, async (req, res) => {
    try {
      const prod = await storage.addProduct(req.session.userId!, req.body);
      res.json(prod);
    } catch (err: any) { console.error("POST /api/products error:", err.message); res.status(500).json({ message: err.message }); }
  });

  app.put("/api/products/:id", requireAuth, async (req, res) => {
    try {
      const prod = await storage.updateProduct(req.session.userId!, req.params.id, req.body);
      if (!prod) return res.status(404).json({ message: "Product not found" });
      res.json(prod);
    } catch (err: any) { console.error("PUT /api/products error:", err.message); res.status(500).json({ message: err.message }); }
  });

  app.delete("/api/products/:id", requireAuth, async (req, res) => {
    try {
      await storage.deleteProduct(req.session.userId!, req.params.id);
      res.json({ ok: true });
    } catch (err: any) { console.error("DELETE /api/products error:", err.message); res.status(500).json({ message: err.message }); }
  });

  app.get("/api/orders", requireAuth, async (req, res) => {
    try {
      const data = await storage.getOrders(req.session.userId!);
      res.json(data);
    } catch (err: any) { console.error("GET /api/orders error:", err.message); res.status(500).json({ message: err.message }); }
  });

  app.post("/api/orders", requireAuth, async (req, res) => {
    try {
      const order = await storage.addOrder(req.session.userId!, req.body);
      res.json(order);
    } catch (err: any) { console.error("POST /api/orders error:", err.message); res.status(500).json({ message: err.message }); }
  });

  app.delete("/api/orders/:id", requireAuth, async (req, res) => {
    try {
      await storage.deleteOrder(req.session.userId!, req.params.id);
      res.json({ ok: true });
    } catch (err: any) { console.error("DELETE /api/orders error:", err.message); res.status(500).json({ message: err.message }); }
  });

  app.get("/api/visits", requireAuth, async (req, res) => {
    try {
      const data = await storage.getVisits(req.session.userId!);
      res.json(data);
    } catch (err: any) { console.error("GET /api/visits error:", err.message); res.status(500).json({ message: err.message }); }
  });

  app.post("/api/visits", requireAuth, async (req, res) => {
    try {
      const visit = await storage.addVisit(req.session.userId!, req.body);
      res.json(visit);
    } catch (err: any) { console.error("POST /api/visits error:", err.message); res.status(500).json({ message: err.message }); }
  });

  app.patch("/api/visits/:id/toggle", requireAuth, async (req, res) => {
    try {
      const visit = await storage.toggleVisit(req.session.userId!, req.params.id);
      if (!visit) return res.status(404).json({ message: "Visit not found" });
      res.json(visit);
    } catch (err: any) { console.error("PATCH /api/visits error:", err.message); res.status(500).json({ message: err.message }); }
  });

  app.delete("/api/visits/:id", requireAuth, async (req, res) => {
    try {
      await storage.deleteVisit(req.session.userId!, req.params.id);
      res.json({ ok: true });
    } catch (err: any) { console.error("DELETE /api/visits error:", err.message); res.status(500).json({ message: err.message }); }
  });

  app.get("/api/reminders", requireAuth, async (req, res) => {
    try {
      const data = await storage.getReminders(req.session.userId!);
      res.json(data);
    } catch (err: any) { console.error("GET /api/reminders error:", err.message); res.status(500).json({ message: err.message }); }
  });

  app.post("/api/reminders", requireAuth, async (req, res) => {
    try {
      const reminder = await storage.addReminder(req.session.userId!, req.body);
      res.json(reminder);
    } catch (err: any) { console.error("POST /api/reminders error:", err.message); res.status(500).json({ message: err.message }); }
  });

  app.patch("/api/reminders/:id/toggle", requireAuth, async (req, res) => {
    try {
      const reminder = await storage.toggleReminder(req.session.userId!, req.params.id);
      if (!reminder) return res.status(404).json({ message: "Reminder not found" });
      res.json(reminder);
    } catch (err: any) { console.error("PATCH /api/reminders error:", err.message); res.status(500).json({ message: err.message }); }
  });

  app.delete("/api/reminders/:id", requireAuth, async (req, res) => {
    try {
      await storage.deleteReminder(req.session.userId!, req.params.id);
      res.json({ ok: true });
    } catch (err: any) { console.error("DELETE /api/reminders error:", err.message); res.status(500).json({ message: err.message }); }
  });

  return httpServer;
}

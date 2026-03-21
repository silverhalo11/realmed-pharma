import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { pool } from "./db";
import { runMigrations } from "./migrate";

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

(async () => {
  try {
    console.log("=== RealMed Pharma Server Starting ===");
    console.log("NODE_ENV:", process.env.NODE_ENV);
    console.log("DATABASE_URL set:", !!process.env.DATABASE_URL);
    console.log("SESSION_SECRET set:", !!process.env.SESSION_SECRET);

    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL environment variable is not set");
    }
    if (!process.env.SESSION_SECRET) {
      throw new Error("SESSION_SECRET environment variable is not set");
    }

    console.log("Testing database connection...");
    try {
      const testResult = await pool.query("SELECT 1 as test");
      console.log("Database connection successful:", testResult.rows[0]);
    } catch (dbErr: any) {
      console.error("=== DATABASE CONNECTION FAILED ===");
      console.error("Error:", dbErr.message);
      console.error("Make sure DATABASE_URL is correct and the database is accessible.");
      process.exit(1);
    }

    console.log("Running database migrations...");
    await runMigrations();

    const app = express();
    app.set("trust proxy", 1);
    const httpServer = createServer(app);

    app.use(
      express.json({
        verify: (req, _res, buf) => {
          req.rawBody = buf;
        },
      }),
    );

    app.use(express.urlencoded({ extended: false }));

    console.log("Setting up sessions...");
    const PgSession = connectPgSimple(session);
    app.use(
      session({
        store: new PgSession({
          pool: pool,
          createTableIfMissing: true,
        }),
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
          maxAge: 30 * 24 * 60 * 60 * 1000,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
        },
      })
    );

    app.use((req, res, next) => {
      const start = Date.now();
      const path = req.path;
      let capturedJsonResponse: Record<string, any> | undefined = undefined;

      const originalResJson = res.json;
      res.json = function (bodyJson, ...args) {
        capturedJsonResponse = bodyJson;
        return originalResJson.apply(res, [bodyJson, ...args]);
      };

      res.on("finish", () => {
        const duration = Date.now() - start;
        if (path.startsWith("/api")) {
          let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
          if (capturedJsonResponse) {
            logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
          }

          log(logLine);
        }
      });

      next();
    });

    console.log("Registering routes...");
    await registerRoutes(httpServer, app);

    app.use((err: any, _req: Request, res: Response, next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";

      console.error("Internal Server Error:", err);

      if (res.headersSent) {
        return next(err);
      }

      return res.status(status).json({ message });
    });

    if (process.env.NODE_ENV === "production") {
      serveStatic(app);
    } else {
      const { setupVite } = await import("./vite");
      await setupVite(httpServer, app);
    }

    const port = parseInt(process.env.PORT || "5000", 10);
    httpServer.listen(
      {
        port,
        host: "0.0.0.0",
        reusePort: true,
      },
      () => {
        log(`serving on port ${port}`);
      },
    );
  } catch (err) {
    console.error("=== FATAL STARTUP ERROR ===");
    console.error(err);
    process.exit(1);
  }
})();

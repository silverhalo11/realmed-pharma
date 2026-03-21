# Field Sales Hub (MedRep Dashboard) — RealMed Pharma

## Overview
A mobile-first Progressive Web App (PWA) for pharmaceutical field sales representatives. Installable on Android/iOS. Data persists online via PostgreSQL cloud database with server-side sessions.

## Architecture
- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Express server with REST API + express-session (connect-pg-simple)
- **Database**: PostgreSQL (Drizzle ORM)
- **Routing**: react-router-dom v6
- **State Management**: Zustand (API-backed, only persists auth state + categories locally)
- **Styling**: Tailwind CSS with shadcn/ui components
- **Toasts**: Sonner
- **PWA**: Service worker + manifest.json for offline support & installability

## Auth
- Server sessions via express-session + connect-pg-simple (30-day cookies)
- Login: `POST /api/auth/login` with `{email, password}`
- Register: `POST /api/auth/register` with `{username, email, phone, password}`
- Session check: `GET /api/auth/me`
- Passwords hashed with bcryptjs (pure JS, no native bindings)

## Database Schema (shared/schema.ts)
- **users**: id (UUID), username, email, phone, password
- **doctors**: id (UUID), userId, name, degree, dob, clinic, phone, address, specialty, notes, medicalStore, prescribedProducts (text[])
- **products**: id (UUID), userId, name, category, composition, description, catalogSlide, isSeeded
- **orders**: id (UUID), userId, doctorId, items (JSON), date
- **visits**: id (UUID), userId, doctorId, date, completed
- **reminders**: id (UUID), userId, doctorId, text, date, done

## API Endpoints
All data endpoints require auth (session cookie):
- `GET/POST /api/doctors`, `PUT/DELETE /api/doctors/:id`
- `GET/POST /api/products`, `PUT/DELETE /api/products/:id`
- `GET/POST /api/orders`, `DELETE /api/orders/:id`
- `GET/POST /api/visits`, `PATCH /api/visits/:id/toggle`, `DELETE /api/visits/:id`
- `GET/POST /api/reminders`, `PATCH /api/reminders/:id/toggle`, `DELETE /api/reminders/:id`

## Key Features
- **Dashboard**: Overview with counts for doctors, products, orders, visits, reminders
- **Doctors**: CRUD management with search, prescribed products tracking
- **Products**: 90+ pre-seeded RealMed products with category filtering, search, catalog deep-linking
- **Product Catalog**: Full 90-page visual catalog with swipe navigation
- **Orders**: Create orders linked to doctors/products, share via WhatsApp
- **Visits**: Schedule and track daily visits with today/tour plan tabs
- **Reminders**: Track reminders with slide view and completion status

## Product Data
- Products are auto-seeded on registration via `storage.seedProducts()` (server/seedProducts.ts)
- Categories: Eye Drops, Eye Ointment, Eye Gel, Tablets, Capsules
- Unit logic: Tablets/Capsules = "strips", everything else = "pcs"
- Catalog slides stored at `client/public/catalog/slide-01.png` through `slide-90.png`

## File Structure
```
shared/schema.ts           # Drizzle schema + types
server/
├── index.ts               # Express app + session middleware
├── db.ts                  # PostgreSQL pool + Drizzle instance
├── storage.ts             # DatabaseStorage class (all CRUD)
├── routes.ts              # API routes with auth middleware
├── seedProducts.ts        # Default product catalog data
├── vite.ts                # Vite dev server setup
└── static.ts              # Static file serving (production)
client/src/
├── App.tsx                # Routes + checkAuth on mount
├── store/useAppStore.ts   # Zustand store (API-backed)
├── lib/api.ts             # Fetch helper for API calls
├── pages/                 # All page components
├── components/            # Shared components + shadcn/ui
└── hooks/                 # Custom hooks
client/public/
├── manifest.json          # PWA manifest
├── sw.js                  # Service worker (realmed-v5 cache, API calls bypass cache)
├── catalog/               # 90 product catalog slides
└── icon-*.png, favicon.png
```

## Branding
- Company: "RealMed Pharma"
- Tagline: "Serving & Preserving Eye Health"
- Logo: Bird in flight at `attached_assets/realmed_bird_logo.png`
- Primary color: Teal/sky blue (#0ea5e9)
- Accent: Amber/gold (#f59e0b)

## Dependencies
- react-router-dom, zustand, sonner, lucide-react, shadcn/ui, recharts, date-fns
- express-session, connect-pg-simple, bcryptjs (server auth)
- drizzle-orm, drizzle-kit, pg (database)

## Railway Deployment
- **URL**: https://respectful-dedication-production-15cb.up.railway.app/
- **Build**: `npm run build` (esbuild bundles server, Vite builds client)
- **Start**: `npm start` → `NODE_ENV=production node dist/index.cjs`
- **Build script** copies `table.sql` to `dist/` for connect-pg-simple session table creation
- **Runtime migrations** in `server/migrate.ts` — creates all tables (including session) on startup
- **SSL**: `ssl: { rejectUnauthorized: false }` for production DB connections
- **Required env vars**: DATABASE_URL, SESSION_SECRET, PORT (8080), NODE_ENV (production)
- `app.set("trust proxy", 1)` required for secure cookies behind Railway's reverse proxy

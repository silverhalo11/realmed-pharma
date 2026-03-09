# Field Sales Hub (MedRep Dashboard) — RealMed Pharma

## Overview
A mobile-first Progressive Web App (PWA) for pharmaceutical field sales representatives. Works offline as an installable Android app — no hosting required after initial install. All data is stored locally via Zustand/localStorage.

## Architecture
- **Frontend**: React 18 + TypeScript + Vite
- **Routing**: react-router-dom v6
- **State Management**: Zustand with localStorage persistence (`medrep-storage` key)
- **Styling**: Tailwind CSS with shadcn/ui components
- **Toasts**: Sonner
- **PWA**: Service worker + manifest.json for offline support & Android install
- **Backend**: Express server (serves the frontend, no API routes used)

## Key Features
- **Auth**: Local sign up/login with email & password (stored in localStorage)
- **Dashboard**: Overview with counts for doctors, products, orders, visits, reminders
- **Doctors**: CRUD management with search, degree/DOB, prescribed products tracking
- **Products**: 90+ pre-seeded RealMed products with category filtering, search by name/composition, slide view with catalog deep-linking
- **Product Catalog**: Full 90-page visual catalog with swipe navigation, thumbnails, and deep-linking from product cards
- **Orders**: Create orders linked to doctors/products, share via WhatsApp
- **Visits**: Schedule and track daily visits with today/tour plan tabs
- **Reminders**: Track reminders with slide view and completion status
- **Bottom Navigation**: Native-style tab bar for quick page switching
- **PWA Install**: Can be installed on Android via "Add to Home Screen"

## Product Data
- Products are auto-seeded on first load via `_seeded` flag in Zustand store
- Product model: id, name, category, composition, description, catalogSlide
- Categories: Eye Drops, Eye Ointment, Eye Gel, Tablets, Capsules
- Each product links to its catalog slide number for visual reference
- Catalog slides stored at `client/public/catalog/slide-01.png` through `slide-90.png`

## File Structure
```
client/src/
├── App.tsx              # Main app with BrowserRouter routes + AppLayout
├── main.tsx             # Entry point + service worker registration
├── index.css            # Tailwind + CSS variables + mobile optimizations
├── store/
│   └── useAppStore.ts   # Zustand store with User auth + all data models
├── pages/
│   ├── LoginPage.tsx    # Email/password login
│   ├── SignUpPage.tsx   # Registration with name/email/password
│   ├── Dashboard.tsx
│   ├── DoctorsPage.tsx
│   ├── DoctorDetailPage.tsx  # Doctor detail with prescribed products management
│   ├── ProductsPage.tsx     # Product list with search, filter, slide view
│   ├── CatalogPage.tsx      # Full-screen 90-page catalog viewer
│   ├── OrdersPage.tsx
│   ├── VisitsPage.tsx
│   ├── RemindersPage.tsx
│   └── NotFound.tsx
├── components/
│   ├── BottomNav.tsx    # Fixed bottom navigation bar
│   ├── NavLink.tsx
│   ├── PageHeader.tsx
│   └── ui/              # shadcn/ui components
├── hooks/
│   ├── use-mobile.tsx
│   └── use-toast.ts
└── lib/
    ├── queryClient.ts
    └── utils.ts

client/public/
├── manifest.json        # PWA manifest
├── sw.js                # Service worker for offline caching
├── icon-192.png         # PWA icon 192x192
├── icon-512.png         # PWA icon 512x512
└── favicon.png
```

## Branding
- Company: "RealMed Pharma"
- Tagline: "Serving & Preserving Eye Health"
- Logo: Bird in flight (orange/amber wings, teal blue body) at `attached_assets/realmed_bird_logo.png`
- Primary color: Teal/sky blue (#0ea5e9)
- Accent: Amber/gold (#f59e0b)

## Dependencies
- react-router-dom (routing)
- zustand (state management)
- sonner (toast notifications)
- lucide-react (icons)
- shadcn/ui (UI components)
- recharts (charts)
- date-fns (date utilities)

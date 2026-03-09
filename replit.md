# Field Sales Hub (MedRep Dashboard)

## Overview
A mobile-first field sales management application for medical representatives. Built as a frontend-only React app with local storage persistence via Zustand.

## Architecture
- **Frontend**: React 18 + TypeScript + Vite
- **Routing**: react-router-dom v6
- **State Management**: Zustand with localStorage persistence (`medrep-storage` key)
- **Styling**: Tailwind CSS with shadcn/ui components
- **Toasts**: Sonner
- **Backend**: Express server (serves the frontend, no API routes used)

## Key Features
- **Dashboard**: Overview with counts for doctors, products, orders, visits, reminders
- **Doctors**: CRUD management with search
- **Products**: Category-based product management with slide view
- **Orders**: Create orders linked to doctors/products, share via WhatsApp
- **Visits**: Schedule and track daily visits with today/tour plan tabs
- **Reminders**: Track reminders with slide view and completion status

## File Structure
```
client/src/
├── App.tsx              # Main app with BrowserRouter routes
├── main.tsx             # Entry point
├── index.css            # Tailwind + CSS variables
├── store/
│   └── useAppStore.ts   # Zustand store with all data models
├── pages/
│   ├── Dashboard.tsx
│   ├── DoctorsPage.tsx
│   ├── ProductsPage.tsx
│   ├── OrdersPage.tsx
│   ├── VisitsPage.tsx
│   ├── RemindersPage.tsx
│   └── NotFound.tsx
├── components/
│   ├── NavLink.tsx
│   ├── PageHeader.tsx
│   └── ui/              # shadcn/ui components
├── hooks/
│   ├── use-mobile.tsx
│   └── use-toast.ts
└── lib/
    ├── queryClient.ts
    └── utils.ts
```

## Dependencies
- react-router-dom (routing)
- zustand (state management)
- sonner (toast notifications)
- lucide-react (icons)
- shadcn/ui (UI components)
- recharts (charts)
- date-fns (date utilities)

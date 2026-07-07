# Meridian Health - Hospital Management System (Frontend Skeleton)

A production-quality **frontend-only** skeleton for a Hospital Management System, built with React + Vite + Tailwind CSS. All data is dummy/mock - there is no backend, database, or authentication logic. It is structured so a backend team can wire up real APIs without touching the UI layer.

## Stack
- React 18 (Vite)
- React Router DOM v6
- Tailwind CSS
- React Icons
- Recharts (charts)
- Framer Motion (animation)
- React Hook Form
- Context API for global UI/auth state (no Redux)

## Getting started
```bash
npm install
npm run dev
```
Then open the printed local URL. Log in with any email/password on the login screen - it's a dummy auth flow that just unlocks the dashboard.

Do not use VS Code Live Server / Go Live for this project. This is a Vite React app, so opening `index.html` directly will show a blank page because the browser cannot bundle React imports by itself.

## Team setup
Clone the project and install dependencies:

```bash
git clone https://github.com/Sujal-mankotia/hospital-managment-system.git
cd hospital-managment-system/hospital-ui
npm install
npm run dev
```

If you are testing login and admin user creation, also run the backend from another terminal:

```bash
cd hospital-managment-system/hospital-api
npm install
copy .env.example .env
npm run dev
```

Before starting new work, pull the latest code:

```bash
git pull origin main
```

Create a separate branch for your task:

```bash
git checkout -b feature/your-feature-name
```

After making changes:

```bash
npm run build
git status
git add .
git commit -m "Describe your change"
git push origin feature/your-feature-name
```

Open a pull request into `main` from GitHub. Do not commit `node_modules` or `dist`; they are ignored and can be recreated locally.

## Structure
```
src/
  components/
    common/     Button, Input, Modal, Badge, Avatar, Pagination, Toast, etc.
    layout/     Navbar, Sidebar, Footer, MobileDrawer, MainLayout
    cards/      StatCard, ChartCard, DoctorCard, MiniCalendar, QuickActions, ActivityFeed
    charts/     Recharts wrappers (area, bar, pie, line)
    tables/     DataTable, MedicalTimeline, QueuePanels
    forms/      PatientForm, DoctorForm, AppointmentForm (React Hook Form)
  pages/
    Login/ Dashboard/ Patients/ Doctors/ Appointments/ NotFound/
  routes/       ProtectedRoute
  context/      AuthContext, UIContext
  hooks/        useCountUp
  utils/        format helpers
  constants/    nav config
  data/         dummy JSON-like data (patients, doctors, appointments, dashboard, notifications, activities)
```

## Design notes
- Palette: clinical blue (`primary`), teal for stable/success states, amber for pending, rose for critical/emergency.
- Typography: Lexend (display/headings), Inter (body), IBM Plex Mono (record IDs, timestamps) - for a "real hospital chart" feel.
- Signature motif: an ECG/pulse-line divider used on the login screen, loader, and 404 page.

## Notes for backend integration
- Authentication calls live in `src/api/authApi.js` and connect to `http://localhost:5000/api` by default.
- The auth state lives in `src/context/AuthContext.jsx`, which stores the JWT and logged-in user.
- All dummy dashboard data lives in `src/data/*.js` - replace these with API calls (e.g. via a `services/` layer) without changing component props.
- Forms (`components/forms/*`) already use React Hook Form and emit plain objects via `onSubmit`, ready to be POSTed to real endpoints.
- Login, signup, forgot password, and reset password are now connected to the backend auth API.

## Auth pages
```text
/                  Login
/admin/users/new    Admin create user
/forgot-password   Forgot password
/reset-password/:token
```

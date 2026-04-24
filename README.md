# 🏥 MediCare HMS — Hospital Management System

A modern, full-stack hospital management web application with real-time patient monitoring, role-based access control, and premium UX.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB running locally on port 27017

### 1. Backend
```bash
cd backend
npm install
npm run seed     # Populate demo data
npm run dev      # Start on http://localhost:5000
```

### 2. Frontend
```bash
cd frontend
npm install
npm run dev      # Start on http://localhost:5173
```

---

## 🔐 Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| 👑 Chief Doctor | chief@hospital.com | chief123 |
| 🩺 Doctor 1 | doctor1@hospital.com | doctor123 |
| 🩺 Doctor 2 | doctor2@hospital.com | doctor123 |
| 🩺 Doctor 3 | doctor3@hospital.com | doctor123 |
| 👩‍⚕️ Nurse 1 | nurse1@hospital.com | nurse123 |
| 👩‍⚕️ Nurse 2 | nurse2@hospital.com | nurse123 |
| 👩‍⚕️ Nurse 3 | nurse3@hospital.com | nurse123 |
| 🧑 Patient 1 | patient1@hospital.com | patient123 |
| 🧑 Patient 2 | patient2@hospital.com | patient123 |

> 💡 Credentials are auto-filled when you click a role button on the login page.

---

## 🎯 Features

### 👑 Chief Doctor
- Global overview of all patients
- Live stats: Total / Critical / Moderate / Stable counts
- Staff directory (doctors + nurses on duty)
- Assign doctors to any patient
- Click any patient card for full detail view

### 🩺 Doctor
- Personalized dashboard with assigned patients
- Assign nurses to patients
- View vitals history with pulse line chart
- Real-time alert notifications for critical patients

### 👩‍⚕️ Nurse
- Assigned patients with inline vitals update cards
- Update: Pulse, Blood Pressure, Temperature, SpO₂
- Alerts automatically trigger if pulse is abnormal

### 🧑 Patient
- Personal vitals dashboard with animated heartbeat
- Pulse history chart with normal range reference lines
- View assigned doctor + nurse
- Color-coded health status banner

---

## 🚨 Real-Time Alert System

Alerts fire automatically via **Socket.io** when:
- Pulse < 50 or > 120 bpm → 🔴 **CRITICAL** alert (slide-in notification)
- Pulse 50–60 or 100–120 bpm → 🟠 **WARNING** alert

Alerts:
- Appear as animated slide-in cards (top-right)
- Have an auto-dismiss progress bar (8 seconds)
- Show patient name and alert type
- Trigger cache invalidation for live data refresh

---

## 🎨 Design System

| Token | Value |
|-------|-------|
| Primary | Blue (#2563EB) |
| Critical | Red (#DC2626) |
| Moderate | Orange (#EA580C) |
| Stable | Green (#16A34A) |
| Font | Inter (Google Fonts) |
| Cards | Glassmorphism (bg-white/80 + backdrop-blur) |
| Grid | 8px base unit |
| Radius | 12–16px consistent |

---

## 🗂️ Project Structure

```
RCR/
├── backend/
│   ├── src/
│   │   ├── config/db.js          # MongoDB connection
│   │   ├── models/
│   │   │   ├── User.js           # Auth model (bcrypt)
│   │   │   ├── Patient.js        # Patient + vitals history
│   │   │   └── AuditLog.js       # Action audit trail
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── patientController.js
│   │   │   └── userController.js
│   │   ├── middleware/auth.js     # JWT + RBAC
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── patients.js
│   │   │   └── users.js
│   │   └── utils/seed.js         # Demo data seeder
│   └── server.js                 # Express + Socket.io
│
├── frontend/
│   └── src/
│       ├── api/
│       │   ├── axios.js          # JWT interceptor
│       │   └── services.js       # API service layer
│       ├── store/
│       │   ├── authStore.js      # Zustand auth + persistence
│       │   └── alertStore.js     # Real-time alert state
│       ├── context/
│       │   └── SocketContext.jsx # Socket.io provider
│       ├── components/
│       │   ├── layout/           # Sidebar, Topbar, DashboardLayout
│       │   ├── patients/         # PatientCard, SkeletonCard
│       │   └── alerts/           # AlertPanel
│       └── pages/
│           ├── auth/LoginPage.jsx
│           ├── chief/ChiefDashboard.jsx
│           ├── doctor/DoctorDashboard.jsx
│           ├── nurse/NurseDashboard.jsx
│           ├── patient/PatientDashboard.jsx
│           └── shared/PatientDetail.jsx
│
└── docker-compose.yml
```

---

## ⚙️ API Endpoints

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/auth/login` | Public | Login, returns JWT |
| GET | `/api/auth/me` | Any | Get current user |
| GET | `/api/patients` | Any* | List patients (role-filtered) |
| POST | `/api/patients` | Chief | Create patient |
| GET | `/api/patients/:id` | Any* | Patient details |
| PATCH | `/api/patients/:id/assign-doctor` | Chief | Assign doctor |
| PATCH | `/api/patients/:id/assign-nurse` | Chief, Doctor | Assign nurse |
| PATCH | `/api/patients/:id/vitals` | Chief, Doctor, Nurse | Update vitals |
| GET | `/api/patients/:id/audit` | Chief, Doctor | Audit trail |
| GET | `/api/patients/stats` | Chief, Doctor | Counts by status |
| GET | `/api/users?role=doctor` | Chief, Doctor | List staff |

---

## 🐳 Docker Deployment

```bash
docker-compose up --build
```

Services:
- **MongoDB** → port 27017
- **Backend** → port 5000
- **Frontend** → port 5173 (via nginx)

---

## 📊 Status Auto-Computation

Patient status is automatically computed from pulse:

| Pulse Range | Status |
|-------------|--------|
| < 50 or > 120 bpm | 🔴 Critical |
| 50–60 or 100–120 bpm | 🟠 Moderate |
| 60–100 bpm | 🟢 Stable |

---

## 🧰 Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18 + Vite |
| Styling | Tailwind CSS v3 |
| Animations | Framer Motion |
| Charts | Recharts |
| State | Zustand (persisted) |
| Data Fetching | TanStack Query |
| Routing | React Router v6 |
| Backend | Node.js + Express |
| Database | MongoDB + Mongoose |
| Real-time | Socket.io |
| Auth | JWT + bcryptjs |
| Containerization | Docker + nginx |

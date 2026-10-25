# 🏥 Smart Medical Services Platform - Backend API

Robust REST API built with **Node.js**, **Express.js**, **MongoDB (Mongoose)**, and **JWT Authentication** to power the Smart Medical Flutter application.

---

## 🚀 Quick Start

### 1. Configure MongoDB URI
Open `backend/.env` and insert your **MongoDB Atlas** connection string or use local MongoDB:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/smart_medical_db?retryWrites=true&w=majority
JWT_SECRET=smart_medical_super_secret_jwt_key_2026_sdp
JWT_EXPIRE=30d
```

### 2. Seed Database with Demo Accounts
Populate patients, doctors, specializations, appointments, and admins:
```bash
npm run seed
```

### 3. Start Backend Server
```bash
# Production mode
npm start

# Development mode (with auto-reload)
npm run dev
```

Server will start on `http://localhost:5000` (or `http://10.0.2.2:5000` from Android Emulator).

---

## 🔑 Pre-Configured Demo Credentials

| Role | Email | Password | Details |
| :--- | :--- | :--- | :--- |
| **Patient** | `patient@smartmedical.com` | `patient123` | John Doe (A+) |
| **Doctor** | `doctor@smartmedical.com` | `doctor123` | Dr. Michael Lee (Cardiologist) |
| **Admin** | `admin@smartmedical.com` | `admin123` | System Administrator |

---

## 📡 Complete REST API Reference

### 🔐 Authentication (`/api/auth`)
* `POST /api/auth/register` — Register a new Patient or Doctor account
* `POST /api/auth/login` — Sign in and receive JWT token + role profile
* `POST /api/auth/verify-otp` — Verify 6-digit OTP code
* `GET /api/auth/me` — Get current logged-in user details `[Protected]`
* `PUT /api/auth/profile` — Update user profile details `[Protected]`

### 👨‍⚕️ Doctors (`/api/doctors`)
* `GET /api/doctors` — Search and filter doctors by specialization, rating, fee
* `GET /api/doctors/:id` — Get full doctor profile & available time slots
* `GET /api/doctors/specializations` — List all specializations with doctor counts
* `PUT /api/doctors/profile` — Update schedule and available days `[Doctor only]`
* `GET /api/doctors/patient-registry` — Get all patients who visited this doctor `[Doctor only]`

### 📅 Appointments (`/api/appointments`)
* `POST /api/appointments` — Book a new appointment `[Patient only]`
* `GET /api/appointments/my-appointments` — Get patient appointment history `[Patient only]`
* `GET /api/appointments/doctor-appointments` — Get doctor's schedule & incoming requests `[Doctor only]`
* `PUT /api/appointments/:id/status` — Accept, reject, or complete appointment `[Doctor / Admin]`
* `PUT /api/appointments/:id/cancel` — Cancel appointment with reason `[Patient only]`

### 👤 Patient Dashboard (`/api/patients`)
* `GET /api/patients/dashboard` — Aggregated dashboard data (upcoming appt, top doctors) `[Patient only]`
* `GET /api/patients/notifications` — In-app alerts & appointment status updates `[Protected]`

### 🛡️ Admin Management (`/api/admin`)
* `GET /api/admin/stats` — Platform metrics (counts, revenue, pending approvals) `[Admin only]`
* `GET /api/admin/doctors` — List all doctors with approval statuses `[Admin only]`
* `PUT /api/admin/doctors/:id/approval` — Approve / reject doctor license `[Admin only]`
* `GET /api/admin/patients` — List registered patient accounts `[Admin only]`

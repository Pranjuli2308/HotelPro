# 🏨 HotelPro — Luxury Hotel & Reservation Management Platform

HotelPro is a responsive, full-stack **MERN** (MongoDB, Express, React, Node.js) web application built according to the **HotelPro Product Requirements Document (PRD)**. It centralizes guest discovery and bookings, front-desk operations (check-in/checkout & room readiness), housekeeping task dispatches, payment gateway processing in sandbox/test mode, and executive administrative analytics.

---

## 🌟 Key Features by Role

### 🧳 1. Guest Experience
- **Curated Property Catalogue:** Discover luxury resorts, beachside retreats, and urban suites with high-definition galleries, ratings, amenities, and starting prices.
- **Authoritative Date & Rate Calculation:** Real-time nights, occupancy tax (12%), resort fees (5%), and total stay calculations.
- **Zero Double-Bookings Guarantee:** Server-side date overlap verification preventing overbooking.
- **Simulated Payment Verification:** Razorpay sandbox test-mode flow with instant booking confirmation.
- **Reservation Lifecycle:** Track stays, access printable digital invoices/receipts, and cancel eligible reservations.
- **Guest Profiles:** Update profile details and change account passwords.

### 🛎️ 2. Front Desk & Staff Operations
- **Arrivals & Departures Hub:** Real-time visibility into today's guest arrivals and departures.
- **Streamlined Check-In:** Select ready/clean rooms from available inventory, assign to guest, and register check-in timestamp.
- **Checkout Workflow:** Review stay, record checkout, and automatically cycle room status to `dirty` while creating a housekeeping task.
- **Room Readiness Board:** Live inventory matrix toggling room states: `clean`, `dirty`, `cleaning`, `inspected`, `occupied`, and `maintenance`.
- **Housekeeping Task Dispatch:** Schedule cleaning and maintenance tickets by room, track progress, and update status from `pending` to `in_progress` to `completed`.

### 👑 3. Executive Administration & Reporting
- **Operational KPIs:** Gross revenue, occupancy rate %, total reservations, active room count, and property rosters.
- **Role-Based Access Control (RBAC):** Promote or reassign user roles (`guest`, `staff`, `admin`) and activate/disable accounts.
- **Compliance & Security Audit Trails:** Logged records of sensitive actions (`actor`, `action`, `resource`, `status`, and `timestamp`).
- **Property Management:** Oversee hotel properties, room categories, and base pricing structures.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, Vite, React Router v7, Lucide Icons, Vanilla CSS Design System with Glassmorphism & Micro-animations |
| **Backend** | Node.js, Express.js, Helmet, CORS, Morgan, Express Rate-Limit |
| **Database** | MongoDB & Mongoose ODM |
| **Authentication** | JWT (JSON Web Tokens with access & refresh token rotation), Bcrypt.js password hashing |
| **Payment Gateway** | Razorpay SDK / Sandbox Test Mode with webhook signature validation |

---

## 🚀 Quick Start Guide

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [MongoDB](https://www.mongodb.com/) running locally on port 27017 or a MongoDB Atlas URI

### 1. Environment Configuration
The server configuration is located in `server/.env`. A template is provided in `.env.example`:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/hotelpro
JWT_SECRET=hotelpro_super_secret_jwt_key_2026_dev
JWT_EXPIRES_IN=7d
REFRESH_TOKEN_SECRET=hotelpro_super_secret_refresh_key_2026_dev
REFRESH_TOKEN_EXPIRES_IN=30d
CLIENT_URL=http://localhost:3000
```

### 2. Populate Sample Data (Seed Database)
Run the automated seed script to populate sample luxury resorts, 7 room types, 62 rooms, demo users, and test bookings:

```bash
npm run seed
```

### 3. Run Development Servers

**Run Server (Port 5000):**
```bash
npm run server
```

**Run Client (Port 3000):**
```bash
npm run client
```

Open your browser at **[http://localhost:3000](http://localhost:3000)**.

---

## 🔑 Demo Login Accounts

For immediate evaluation, the sign-in page (`/login`) includes **1-click quick fill buttons** for all three roles:

| Role | Email | Password | Access Highlights |
|---|---|---|---|
| **👑 Administrator** | `admin@hotelpro.com` | `admin123` | Full Admin Portal (`/admin`), KPI reports, User management, Audit logs |
| **🛎️ Hotel Staff** | `staff@hotelpro.com` | `staff123` | Front Desk Operations (`/operations`), Check-in/out, Room status toggling, Housekeeping |
| **🧳 Guest** | `guest@hotelpro.com` | `guest123` | Room Discovery (`/hotels`), Booking Flow, My Reservations (`/bookings`), Digital Receipts |

---

## 📡 API Endpoints Overview

| Group | Route | Method | Access | Description |
|---|---|---|---|---|
| **Auth** | `/api/v1/auth/register` | POST | Public | Register new guest account |
| | `/api/v1/auth/login` | POST | Public | User authentication & token issuance |
| | `/api/v1/auth/me` | GET | Protected | Retrieve authenticated user profile |
| | `/api/v1/auth/profile` | PUT | Protected | Update name and phone number |
| | `/api/v1/auth/change-password` | PUT | Protected | Update account password |
| **Hotels** | `/api/v1/hotels` | GET | Public | List all active hotels with filters |
| | `/api/v1/hotels/:hotelId` | GET | Public | Detailed property profile |
| | `/api/v1/hotels/:hotelId/room-types` | GET | Public | Room categories for hotel |
| | `/api/v1/hotels/:hotelId/rooms` | GET | Staff/Admin | Room inventory list |
| **Bookings** | `/api/v1/bookings` | POST | Guest | Create pending reservation |
| | `/api/v1/bookings/me` | GET | Protected | Retrieve user's booking history |
| | `/api/v1/bookings/all` | GET | Staff/Admin | View all hotel bookings |
| | `/api/v1/bookings/:id/cancel` | POST | Protected | Cancel reservation |
| **Payments** | `/api/v1/payments/create-order` | POST | Protected | Initiate Razorpay order |
| | `/api/v1/payments/verify` | POST | Protected | Verify signature & confirm booking |
| **Operations** | `/api/v1/operations/arrivals` | GET | Staff/Admin | View today's arrivals |
| | `/api/v1/operations/departures` | GET | Staff/Admin | View today's departures |
| | `/api/v1/operations/check-in` | POST | Staff/Admin | Check in guest & assign room |
| | `/api/v1/operations/check-out` | POST | Staff/Admin | Check out guest & flag room dirty |
| | `/api/v1/operations/tasks` | GET/POST | Staff/Admin | View & schedule housekeeping tickets |
| **Admin** | `/api/v1/admin/dashboard` | GET | Admin | Retrieve operational KPIs & metrics |
| | `/api/v1/admin/users` | GET/PUT | Admin | Manage user roles & access status |
| | `/api/v1/admin/audit-logs` | GET | Admin | Searchable audit trail logs |

---

## 📂 Architecture Directory Structure

```
HotelPro/
├── package.json              # Root workspace scripts
├── HotelPro_PRD.md           # Product Requirements Document
├── server/                   # Express.js API backend
│   ├── config/               # Database & env config
│   ├── controllers/          # Business logic handlers
│   ├── middleware/           # Auth, RBAC, validators, error handlers
│   ├── models/               # Mongoose schemas (User, Hotel, Room, Booking, Payment, AuditLog, Task)
│   ├── routes/               # Express REST route definitions
│   ├── seed.js               # Database seeder with sample resorts & users
│   └── index.js              # Server entry point
└── client/                   # React 19 + Vite frontend
    ├── public/               # Static assets
    ├── src/
    │   ├── api/              # Axios instance & token interceptors
    │   ├── context/          # AuthContext & ToastContext
    │   ├── components/       # Navbar, Footer, BookingModal, Badge, ProtectedRoute
    │   ├── pages/            # Home, Hotels, HotelDetails, Bookings, Profile, Login, Register
    │   │   ├── staff/        # Operations (Front Desk, Housekeeping)
    │   │   └── admin/        # Dashboard (KPIs, Users, Audit)
    │   ├── index.css         # Custom luxury design system & responsive styling
    │   ├── App.jsx           # Routing & layout setup
    │   └── main.jsx          # Client entry point
    └── vite.config.js        # Vite dev server configuration with /api proxy
```

---

© 2026 HotelPro Engineering. Built in compliance with PRD specifications.

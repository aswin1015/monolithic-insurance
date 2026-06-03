# 🛡️ Mono Insurance Application

A full-stack monolithic insurance claims management platform built with **Node.js (Express)**, **Vite (Vanilla JS)**, and **MongoDB**.

## ✨ Features

- 🔐 **JWT Authentication** – Register, login, role-based access (user/admin)
- 📋 **Insurance Policies** – Browse 9 pre-seeded plans (3 Car, 3 Health, 3 Life)
- 📤 **PDF Claim Filing** – 3-step claim flow with drag-and-drop PDF upload
- 📊 **User Dashboard** – Real-time claim stats and history
- ⚙️ **Admin Panel** – Review all claims, update status with notes, paginated
- 🐳 **Docker Ready** – Full Docker Compose setup with MongoDB, Backend, Frontend

---

## 🚀 Quick Start

### Option 1: Docker Compose (Recommended)

```bash
docker-compose up --build
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api
- MongoDB: localhost:27017

The seeder runs automatically and creates:
| Account | Email | Password |
|---|---|---|
| Admin | admin@monoinsurance.com | Admin@123 |

### Option 2: Local Development

**Prerequisites:** Node.js 18+, MongoDB running locally

**Backend:**
```bash
cd backend
npm install
npm run seed      # Seed policies and admin account
npm run dev       # Starts on http://localhost:5000
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev       # Starts on http://localhost:3000
```

---

## 📁 Project Structure

```
mono-insurance/
├── backend/
│   ├── src/
│   │   ├── config/         # DB + Multer config
│   │   ├── controllers/    # Business logic
│   │   ├── middleware/     # JWT auth + admin guard
│   │   ├── models/         # Mongoose schemas
│   │   ├── routes/         # API endpoints
│   │   └── seeders/        # DB seed script
│   ├── uploads/            # Uploaded PDFs (auto-created)
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/            # Axios service
│   │   ├── components/     # Navbar, Sidebar, Toast
│   │   ├── pages/          # All page components
│   │   ├── styles/         # CSS design system
│   │   ├── router.js       # Hash-based SPA router
│   │   └── main.js
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
└── docker-compose.yml
```

---

## 🔌 API Endpoints

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Register |
| POST | `/api/auth/login` | Public | Login |
| GET | `/api/auth/me` | User | Profile |
| GET | `/api/policies` | Public | All policies |
| GET | `/api/policies/type/:type` | Public | By type |
| POST | `/api/claims` | User | Submit claim + PDF |
| GET | `/api/claims/my` | User | My claims |
| GET | `/api/admin/stats` | Admin | Dashboard stats |
| GET | `/api/admin/claims` | Admin | All claims |
| PATCH | `/api/admin/claims/:id` | Admin | Update status |

---

## 🎨 Tech Stack

| Layer | Tech |
|---|---|
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| File Upload | Multer (PDF only, 10MB) |
| Auth | JWT + bcrypt |
| Frontend | Vite, Vanilla JS |
| Styling | Custom CSS (dark glassmorphism) |
| Proxy | Nginx |
| Container | Docker, Docker Compose |

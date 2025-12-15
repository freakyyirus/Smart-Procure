<div align="center">

# 🚀 Smart Procure

### AI-Powered Procurement Platform for Modern Enterprises

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?logo=next.js)](https://nextjs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-10.0-red?logo=nestjs)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![Google Gemini](https://img.shields.io/badge/Google-Gemini%20AI-4285F4?logo=google)](https://ai.google.dev/)

**Replace WhatsApp & Excel chaos with intelligent, automated procurement workflows**

[Features](#-features) • [Screenshots](#-screenshots) • [Quick Start](#-quick-start) • [API Docs](#-api-documentation)

---

</div>

## ✨ Overview

**Smart Procure** is a full-stack procurement management system that transforms how SMEs handle their vendor relationships, quotations, and purchase orders. Powered by Google Gemini AI, it brings enterprise-grade intelligence to your procurement workflow.

### Why Smart Procure?

| ❌ Before | ✅ After |
|-----------|----------|
| Scattered WhatsApp conversations | Centralized vendor portal |
| Manual Excel quote comparisons | AI-powered price analysis |
| Lost email threads | Full audit trail |
| Delayed approvals | Instant PO generation |
| Inconsistent pricing | AI anomaly detection |

---

## 🎯 Features

### 📦 Core Procurement Modules

| Module | Description |
|--------|-------------|
| 📋 **RFQ Management** | Create and send Request for Quotations to multiple vendors simultaneously |
| 💰 **Quote Comparison** | Side-by-side comparison with AI-powered recommendations |
| 📄 **Purchase Orders** | One-click PO generation from approved quotes with tracking |
| 🤝 **Vendor Portal** | Complete vendor database with performance tracking |
| 📦 **Items Catalog** | Centralized materials and SKU management |
| 📜 **Mandates** | Digital signature-ready payment mandates |
| 🔔 **Notifications** | Real-time alerts for approvals and updates |

### 🤖 AI-Powered Features

| Feature | Description |
|---------|-------------|
| 🔍 **OCR Extraction** | Upload quote PDFs → Auto-extract line items using AI |
| ⚠️ **Price Anomaly Detection** | Flag unusual pricing with AI reasoning |
| 📊 **Vendor Scoring** | AI-calculated vendor performance scores |
| 💡 **Smart Recommendations** | AI suggests best vendor for each item |
| 🗣️ **Negotiation Copilot** | AI-assisted counter-offer suggestions |
| 📈 **Price Forecasting** | Predict future price trends |
| 🤖 **AI Chatbot** | Natural language assistant for procurement queries |

---

## 📸 Screenshots

### 🏠 Landing Page
> Modern, professional landing page with trust-building elements and feature showcase

<img src="https://placehold.co/1200x700/1a1a2e/ffffff?text=Smart+Procure%0ALanding+Page&font=roboto" alt="Landing Page" width="100%"/>

---

### 🔐 Login Page
> Secure JWT-based authentication with clean, modern design

<img src="https://placehold.co/1200x700/16213e/ffffff?text=Secure+Login%0AJWT+Authentication&font=roboto" alt="Login Page" width="100%"/>

---

### 📊 Dashboard
> Real-time overview of RFQs, POs, vendor activity, and key metrics

<img src="https://placehold.co/1200x700/0f3460/ffffff?text=Dashboard%0AReal-time+Analytics&font=roboto" alt="Dashboard" width="100%"/>

---

### 🤝 Vendors Management
> Complete vendor database with contact info, performance metrics, and status tracking

<img src="https://placehold.co/1200x700/533483/ffffff?text=Vendor+Management%0AComplete+Database&font=roboto" alt="Vendors" width="100%"/>

---

### 📦 Items Catalog
> Centralized materials and SKU management with pricing history

<img src="https://placehold.co/1200x700/e94560/ffffff?text=Items+Catalog%0ASKU+Management&font=roboto" alt="Items" width="100%"/>

---

### 📋 RFQ Management
> Create and send RFQs to multiple vendors with item selection

<img src="https://placehold.co/1200x700/ff6b35/ffffff?text=RFQ+Management%0AMulti-Vendor+Quotes&font=roboto" alt="RFQs" width="100%"/>

---

### 💰 Quotes Comparison
> Side-by-side quote comparison with AI analysis and recommendations

<img src="https://placehold.co/1200x700/f7c873/1a1a2e?text=Quote+Comparison%0AAI+Analysis&font=roboto" alt="Quotes" width="100%"/>

---

### 📄 Purchase Orders
> Complete PO lifecycle management with delivery tracking

<img src="https://placehold.co/1200x700/2ec4b6/ffffff?text=Purchase+Orders%0ALifecycle+Management&font=roboto" alt="Purchase Orders" width="100%"/>

---

### 🧠 AI Hub
> Central dashboard for all AI-powered procurement features

<img src="https://placehold.co/1200x700/9b5de5/ffffff?text=AI+Hub%0APowered+by+Gemini&font=roboto" alt="AI Hub" width="100%"/>

---

### 🔍 OCR Extraction
> Upload PDF quotes and auto-extract line items using Google Gemini AI

<img src="https://placehold.co/1200x700/00bbf9/ffffff?text=OCR+Extraction%0APDF+to+Data&font=roboto" alt="OCR Extraction" width="100%"/>

---

### ⚠️ Price Anomaly Detection
> AI flags unusual pricing with detailed explanations

<img src="https://placehold.co/1200x700/f15bb5/ffffff?text=Anomaly+Detection%0AAI+Price+Analysis&font=roboto" alt="Anomaly Detection" width="100%"/>

---

### 💬 AI Chatbot
> Natural language assistant for procurement queries and insights

<img src="https://placehold.co/1200x700/00f5d4/1a1a2e?text=AI+Chatbot%0ANatural+Language&font=roboto" alt="AI Chatbot" width="100%"/>

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ 
- **PostgreSQL** 14+
- **pnpm** (for frontend)
- **Google Gemini API Key** ([Get one here](https://aistudio.google.com/))

### 1. Clone & Install

```bash
# Clone the repository
git clone https://github.com/freakyyirus/Smart-Procure.git
cd Smart-Procure

# Install backend dependencies
cd apps/backend
npm install

# Install frontend dependencies
cd ../frontend
pnpm install
```

### 2. Environment Setup

**Backend** (`apps/backend/.env`):
```env
DATABASE_URL="postgresql://user:password@localhost:5432/smartprocure"
JWT_SECRET="your-super-secret-jwt-key-min-32-chars"
GEMINI_API_KEY="your-google-gemini-api-key"
```

**Frontend** (`apps/frontend/.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

### 3. Database Setup

```bash
cd apps/backend

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Seed demo data
npx prisma db seed
```

### 4. Start Servers

```bash
# Terminal 1 - Backend (port 3001)
cd apps/backend
npm run dev

# Terminal 2 - Frontend (port 3000)
cd apps/frontend
pnpm run dev
```

### 5. Access Application

| Service | URL |
|---------|-----|
| 🖥️ Frontend | http://localhost:3000 |
| 🔌 Backend API | http://localhost:3001/api |
| 🗄️ Prisma Studio | `npx prisma studio` |

### 🔑 Demo Login

```
Email: admin@smartprocure.com
Password: Admin@123
```

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend                              │
│                    Next.js 14 + Tailwind                     │
│                    http://localhost:3000                     │
└─────────────────────────┬───────────────────────────────────┘
                          │ REST API
┌─────────────────────────▼───────────────────────────────────┐
│                        Backend                               │
│                    NestJS + Prisma                           │
│                    http://localhost:3001                     │
├─────────────────────────────────────────────────────────────┤
│  Modules:                                                    │
│  ├── Auth (JWT)        ├── RFQs          ├── AI Services    │
│  ├── Vendors           ├── Quotes        ├── Notifications  │
│  ├── Items             ├── POs           ├── Audit Logs     │
│  └── Mandates          └── Integrations  └── Prisma ORM     │
└─────────────────────────┬───────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────┐
│                      PostgreSQL                              │
│                    Database                                  │
└─────────────────────────────────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────┐
│                    External Services                         │
│  ├── Google Gemini AI (OCR, Chatbot, Analysis)              │
│  ├── Email Service (SMTP)                                   │
│  └── WhatsApp Integration                                    │
└─────────────────────────────────────────────────────────────┘
```

---

## 📚 API Documentation

### Authentication
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/login` | POST | User login |
| `/api/auth/register` | POST | User registration |
| `/api/auth/me` | GET | Get current user |

### Vendors
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/vendors` | GET | List all vendors |
| `/api/vendors` | POST | Create vendor |
| `/api/vendors/:id` | GET | Get vendor details |
| `/api/vendors/:id` | PUT | Update vendor |
| `/api/vendors/:id` | DELETE | Delete vendor |

### RFQs
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/rfqs` | GET | List all RFQs |
| `/api/rfqs` | POST | Create RFQ |
| `/api/rfqs/:id` | GET | Get RFQ details |
| `/api/rfqs/:id/send` | POST | Send RFQ to vendors |

### AI Endpoints
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/ai/chat` | POST | AI chatbot |
| `/api/ai/ocr` | POST | Extract from PDF |
| `/api/ai/anomalies` | POST | Detect price anomalies |
| `/api/ai/vendor-scores` | POST | Get AI vendor scores |
| `/api/ai/recommendations` | POST | Get vendor recommendations |
| `/api/ai/forecast` | POST | Price forecasting |
| `/api/ai/negotiate` | POST | Negotiation suggestions |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 14, React 18, TypeScript, Tailwind CSS, Zustand |
| **Backend** | NestJS 10, Prisma ORM, PostgreSQL, JWT |
| **AI** | Google Gemini 2.0 Flash |
| **Auth** | JWT + bcrypt |
| **Styling** | Tailwind CSS + shadcn/ui |

---

## 📂 Project Structure

```
Smart-Procure/
├── apps/
│   ├── backend/              # NestJS API
│   │   ├── src/
│   │   │   ├── ai/           # AI services (Gemini)
│   │   │   ├── auth/         # Authentication
│   │   │   ├── vendors/      # Vendor management
│   │   │   ├── items/        # Items catalog
│   │   │   ├── rfqs/         # RFQ management
│   │   │   ├── quotes/       # Quote management
│   │   │   ├── purchase-orders/
│   │   │   ├── mandates/
│   │   │   └── notifications/
│   │   └── prisma/           # Database schema
│   │
│   └── frontend/             # Next.js App
│       ├── app/              # Pages (App Router)
│       ├── components/       # React components
│       └── lib/              # Utilities
│
└── README.md
```

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

<div align="center">

**Built with ❤️ for Modern Procurement**

[⬆ Back to Top](#-smart-procure)

</div>

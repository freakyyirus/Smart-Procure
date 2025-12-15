<p align="center">
  <img src="docs/screenshots/logo.png" alt="Smart Procure Logo" width="120" />
</p>

<h1 align="center">🚀 Smart Procure</h1>

<p align="center">
  <strong>AI-Powered Procurement Platform for Modern Enterprises</strong>
</p>

<p align="center">
  Replace WhatsApp & Excel chaos with intelligent, automated procurement workflows
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#screenshots">Screenshots</a> •
  <a href="#quick-start">Quick Start</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#api-docs">API Docs</a>
</p>

---

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

### Core Procurement

| Feature | Description |
|---------|-------------|
| 📋 **RFQ Management** | Create and send RFQs to multiple vendors simultaneously |
| 💰 **Quote Comparison** | Side-by-side comparison with AI recommendations |
| 📄 **Purchase Orders** | One-click PO generation from approved quotes |
| 🤝 **Vendor Portal** | Complete vendor database with performance tracking |
| 📦 **Items Catalog** | Centralized materials and SKU management |
| 📜 **Mandates** | Digital signature-ready payment mandates |

### AI-Powered Features

| Feature | Description |
|---------|-------------|
| 🔍 **OCR Extraction** | Upload quote PDFs → Auto-extract line items |
| ⚠️ **Price Anomaly Detection** | Flag unusual pricing with AI reasoning |
| 📊 **Vendor Scoring** | AI-calculated vendor performance scores |
| 💡 **Smart Recommendations** | AI suggests best vendor for each item |
| 🗣️ **Negotiation Copilot** | AI-assisted counter-offer suggestions |
| 📈 **Price Forecasting** | Predict future price trends |
| 🤖 **AI Chatbot** | Natural language assistant for procurement queries |

---

## 📸 Screenshots

### Landing Page
<p align="center">
  <img src="docs/screenshots/01-landing.png" alt="Landing Page" width="800" />
</p>

*Modern, professional landing page with trust-building elements*

---

### Dashboard
<p align="center">
  <img src="docs/screenshots/02-dashboard.png" alt="Dashboard" width="800" />
</p>

*Real-time overview of RFQs, POs, and vendor activity*

---

### Vendor Management
<p align="center">
  <img src="docs/screenshots/03-vendors.png" alt="Vendor Management" width="800" />
</p>

*Complete vendor database with contact info and performance metrics*

---

### RFQ Creation
<p align="center">
  <img src="docs/screenshots/04-rfqs.png" alt="RFQ Management" width="800" />
</p>

*Create RFQs and send to multiple vendors with one click*

---

### Quote Comparison
<p align="center">
  <img src="docs/screenshots/05-quotes.png" alt="Quote Comparison" width="800" />
</p>

*Side-by-side quote comparison with AI price analysis*

---

### Purchase Orders
<p align="center">
  <img src="docs/screenshots/06-purchase-orders.png" alt="Purchase Orders" width="800" />
</p>

*Complete PO lifecycle with delivery tracking and audit logs*

---

### AI Hub
<p align="center">
  <img src="docs/screenshots/07-ai-hub.png" alt="AI Hub" width="800" />
</p>

*Central dashboard for all AI-powered features*

---

### OCR Quote Extraction
<p align="center">
  <img src="docs/screenshots/08-ocr.png" alt="OCR Extraction" width="800" />
</p>

*Upload PDF quotes and auto-extract line items with AI*

---

### Price Anomaly Detection
<p align="center">
  <img src="docs/screenshots/09-anomalies.png" alt="Price Anomalies" width="800" />
</p>

*AI flags unusual pricing with explanations*

---

### Vendor Scores
<p align="center">
  <img src="docs/screenshots/10-vendor-scores.png" alt="Vendor Scores" width="800" />
</p>

*AI-calculated vendor performance rankings*

---

### AI Chatbot
<p align="center">
  <img src="docs/screenshots/11-chatbot.png" alt="AI Chatbot" width="800" />
</p>

*Natural language assistant for procurement queries*

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ 
- **PostgreSQL** 14+
- **pnpm** (for frontend)

### 1. Clone & Install

```bash
# Clone the repository
git clone https://github.com/yourusername/smart-procure.git
cd smart-procure

# Install backend dependencies
cd apps/backend
npm install

# Install frontend dependencies
cd ../frontend
pnpm install
```

### 2. Configure Environment

**Backend** (`apps/backend/.env`):
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/smartprocure"

# JWT
JWT_SECRET="your-super-secret-jwt-key-min-32-chars"

# AI (Get free key from https://aistudio.google.com/app/apikey)
GEMINI_API_KEY="your-gemini-api-key"
```

**Frontend** (`apps/frontend/.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

### 3. Setup Database

```bash
cd apps/backend

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Seed demo data
npx prisma db seed
```

### 4. Start Development Servers

```bash
# Terminal 1 - Backend
cd apps/backend
npm run dev

# Terminal 2 - Frontend
cd apps/frontend
pnpm run dev
```

### 5. Access the App

| Service | URL |
|---------|-----|
| 🌐 Frontend | http://localhost:3000 |
| 🔧 Backend API | http://localhost:3001/api |
| 📚 API Docs (Swagger) | http://localhost:3001/api/docs |

### Demo Credentials

```
Email: admin@smartprocure.com
Password: Admin@123
```

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| Next.js 14 | React framework with App Router |
| TypeScript | Type safety |
| Tailwind CSS | Utility-first styling |
| Zustand | State management |
| Axios | HTTP client |
| Lucide React | Icons |

### Backend
| Technology | Purpose |
|------------|---------|
| NestJS | Enterprise Node.js framework |
| Prisma | Type-safe ORM |
| PostgreSQL | Database |
| JWT + Passport | Authentication |
| Google Gemini | AI features |
| Swagger | API documentation |

### AI Features
| Feature | Powered By |
|---------|-----------|
| OCR Extraction | Gemini Vision |
| Price Analysis | Gemini 2.0 Flash |
| Recommendations | Gemini 2.0 Flash |
| Chatbot | Gemini 2.0 Flash |

---

## 📚 API Documentation

Full API documentation available at: **http://localhost:3001/api/docs**

### Key Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | User login |
| GET | `/api/vendors` | List vendors |
| POST | `/api/rfqs` | Create RFQ |
| GET | `/api/quotes` | List quotes |
| POST | `/api/purchase-orders` | Create PO |
| POST | `/api/ai/chat` | AI chatbot |
| POST | `/api/ai/ocr/extract` | OCR extraction |
| GET | `/api/ai/vendor-scores` | Vendor scores |

---

## 📁 Project Structure

```
smart-procure/
├── apps/
│   ├── backend/                 # NestJS API
│   │   ├── src/
│   │   │   ├── ai/              # AI services (OCR, scoring, etc.)
│   │   │   ├── auth/            # JWT authentication
│   │   │   ├── vendors/         # Vendor management
│   │   │   ├── items/           # Items catalog
│   │   │   ├── rfqs/            # RFQ management
│   │   │   ├── quotes/          # Quote management
│   │   │   ├── purchase-orders/ # PO management
│   │   │   └── prisma/          # Database service
│   │   └── prisma/
│   │       └── schema.prisma    # Database schema
│   │
│   └── frontend/                # Next.js App
│       ├── app/                 # App Router pages
│       │   ├── dashboard/       # Main dashboard
│       │   ├── vendors/         # Vendor pages
│       │   ├── rfqs/            # RFQ pages
│       │   ├── quotes/          # Quote pages
│       │   ├── purchase-orders/ # PO pages
│       │   └── ai/              # AI feature pages
│       ├── components/          # Reusable components
│       └── lib/                 # Utilities & API client
│
└── docs/
    └── screenshots/             # App screenshots
```

---

## 🔐 Security Features

- ✅ JWT-based authentication
- ✅ Bcrypt password hashing
- ✅ Helmet security headers
- ✅ CORS configuration
- ✅ Rate limiting
- ✅ Input validation with class-validator
- ✅ Prisma parameterized queries (SQL injection prevention)

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [Google Gemini](https://ai.google.dev/) - AI capabilities
- [NestJS](https://nestjs.com/) - Backend framework
- [Next.js](https://nextjs.org/) - Frontend framework
- [Prisma](https://prisma.io/) - Database ORM
- [Tailwind CSS](https://tailwindcss.com/) - Styling

---

<p align="center">
  Made with ❤️ for modern procurement teams
</p>

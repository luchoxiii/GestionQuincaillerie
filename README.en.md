# 🛠️ GestionQuincaillerie — Hardware Store ERP & POS

[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg?logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18%2F19-61DAFB.svg?logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF.svg?logo=vite)](https://vitejs.dev/)
[![NestJS](https://img.shields.io/badge/NestJS-10.0-E0234E.svg?logo=nestjs)](https://nestjs.com/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC.svg?logo=tailwind-css)](https://tailwindcss.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16.0-336791.svg?logo=postgresql)](https://www.postgresql.org/)
[![Prisma ORM](https://img.shields.io/badge/Prisma-5.0-2D3748.svg?logo=prisma)](https://www.prisma.io/)
[![Redis](https://img.shields.io/badge/Redis-7.0-DC382D.svg?logo=redis)](https://redis.io/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED.svg?logo=docker)](https://www.docker.com/)
[![Podman](https://img.shields.io/badge/Podman-Rootless%20Ready-892CA0.svg?logo=podman)](https://podman.io/)
[![Tests](https://img.shields.io/badge/Tests-186%20Passing-brightgreen.svg)](https://vitest.dev/)

[![WCAG 2.1](https://img.shields.io/badge/WCAG%202.1-AA%20%2F%20AAA-success.svg)](https://www.w3.org/WAI/standards-guidelines/wcag/)
[![A11y Voice](https://img.shields.io/badge/A11y-Voice%20%26%20Audio-blueviolet.svg)](https://developer.mozilla.org/es/docs/Web/API/Web_Speech_API)
[![OWASP Top 10](https://img.shields.io/badge/OWASP%20Top%2010-Compliant-success.svg)](https://owasp.org/)

> **Comprehensive Commercial Management System, Multi-Warehouse Stock Control, Dual AFIP Fiscal Invoicing, Ultra-Fast Point of Sale (POS) Counter Terminal, and Omnichannel Synchronization for Hardware Stores, Building Supply Yards, and Material Distributors.**  
> Official Repository: [https://github.com/luchoxiii/GestionQuincaillerie](https://github.com/luchoxiii/GestionQuincaillerie)

---

## 📑 Table of Contents

1. [📸 Visual Demonstration](#-visual-demonstration)
2. [⚡ Complete Installation & Deployment Guide](#-complete-installation--deployment-guide)
   - [🖥️ Mode 1: Local Bare-Metal (No Docker / Offline-First)](#mode-1-local-bare-metal-no-docker--offline-first)
     - [1.1. Autonomous Offline-First Mode (Frontend Only / Local Persistence)](#11-autonomous-offline-first-mode-frontend-only--local-persistence)
     - [1.2. Full-Stack Bare-Metal Mode (Frontend + NestJS Backend + Local PostgreSQL)](#12-full-stack-bare-metal-mode-frontend--nestjs-backend--local-postgresql)
   - [🐳 Mode 2: Deployment with Docker & Docker Compose](#mode-2-deployment-with-docker--docker-compose)
   - [🦭 Mode 3: Deployment with Podman & Podman Compose (Rootless & Enterprise)](#mode-3-deployment-with-podman--podman-compose-rootless--enterprise)
3. [🏛️ Functional System Modules](#️-functional-system-modules)
   - [🛒 1. Counter Terminal & Point of Sale (POS)](#1-counter-terminal--point-of-sale-pos)
   - [🏛️ 2. Dual Invoicing & Tax Regime](#2-dual-invoicing--tax-regime)
   - [📦 3. Catalog, Multi-Warehouse Inventory & Purchasing](#3-catalog-multi-warehouse-inventory--purchasing)
   - [👥 4. CRM, Customer Intelligence & 360° Churn Scoring](#4-crm-customer-intelligence--360-churn-scoring)
   - [🎟️ 5. Loyalty Coupons & Dual-Currency Quotes (USD / ARS)](#5-loyalty-coupons--dual-currency-quotes-usd--ars)
   - [🌐 6. E-Commerce Center & Mercado Libre API](#6-e-commerce-center--mercado-libre-api)
     - [🟡 Connection Guide: Mercado Libre API (MELI)](#meli-guide)
   - [💾 7. Bulk Upload (Excel / Sheets) & Google Drive Backup](#7-bulk-upload-excel--sheets--google-drive-backup)
     - [☁️ Setup Guide: Google Sheets & Google Drive](#google-sheets-guide)
   - [♿ 8. Universal Accessibility, Voice Assistant & WCAG 2.1 (AA/AAA)](#8-universal-accessibility-voice-assistant--wcag-21-aaaa)
   - [⚙️ 9. Comprehensive Graphical Settings Panel](#9-comprehensive-graphical-settings-panel)
   - [🏪 10. Multi-Store & Commercial Branches](#10-multi-store--commercial-branches)
   - [🔍 11. Multi-Field Natural Language Search Engine](#11-multi-field-natural-language-search-engine)
   - [💵 12. Cash Register Control, Real-Time Balancing & Daily Z-Closing](#12-cash-register-control-real-time-balancing--daily-z-closing)
4. [🛡️ Security, Audit & OWASP Top 10 Standards](#️-security-audit--owasp-top-10-standards)
   - [Granular Role-Based Access Control Matrix (RBAC)](#granular-role-based-access-control-matrix-rbac)
   - [OWASP Top 10 Security Compliance](#owasp-top-10-security-compliance)
   - [Tamper-Evident SHA-256 Cryptographic Forensic Ledger](#tamper-evident-sha-256-cryptographic-forensic-ledger)
5. [🧪 Test, Stress & Performance Suite (186 Tests)](#-test-stress--performance-suite-186-tests)
6. [⌨️ POS & Accessibility Keyboard Shortcuts](#️-pos--accessibility-keyboard-shortcuts)
7. [🧭 Application Route Map](#-application-route-map)
8. [🏗️ Technology Stack & Architecture](#️-technology-stack--architecture)
9. [⚙️ Environment Variables](#️-environment-variables)
10. [📄 License](#-license)

---

## 📸 Visual Demonstration

### 🎬 Dynamic System Walkthrough (Animation)
![System Walkthrough](docs/screenshots/demo.gif)

---

### 📊 Main Control Panel (Dashboard)
Real-time sales performance metrics with **time horizon selector** (*Today*, *Yesterday*, *Last 7 Days*, *This Month*, *Last 30 Days*, *This Year*, or *Custom Range*), Recharts revenue vs. cost breakdown, gross profit margins, recent transactions by fiscal regime, and reorder alerts.
![Main Dashboard](docs/screenshots/dashboard_view_1788544828180.jpg)

---

### 💵 Cash Register Control, Real-Time Balancing & Daily Z-Closing
Live register shift management: automatic **Theoretical Cash Balance** calculation (`Opening Fund + Payments - Outflows`), chronological petty cash logging, and blind/assisted reconciliation detecting **cash overages and shortages**.
![Cash Register & Z-Closing](docs/screenshots/cash_register_view.jpg)

---

### 🛒 POS Counter Terminal with Dual Invoicing & Cash Discounts
High-velocity checkout: interactive switcher between **Official Invoice (AFIP White)** and **Internal Receipt X (Black)** with automatic **10% OFF cash discount**, instantaneous change calculator, and direct email receipt dispatch.
![POS Terminal and Dual Invoicing](docs/screenshots/pos_checkout_view.jpg)

---

### 🛡️ Tamper-Evident SHA-256 Cryptographic Forensic Ledger
Blockchain-grade chained event log: immutable audit recording of user registration, permission shifts, checkout transactions, inventory adjustments, and cash register closings with cryptographic hashes for legal and tax auditing.
![SHA-256 Forensic Ledger](docs/screenshots/audit_bitacora_view.jpg)

---

### 📑 Dual-Currency Quotes (USD / ARS) & Live Exchange Rate
Issue quotes in Pesos or US Dollars with customizable agreed exchange rate, live official and parallel exchange tracking, price freezing with validity periods (24h, 48h, 7d), and 1-click POS checkout conversion.
![Dual-Currency Quotes](docs/screenshots/quotes_dollar_view.jpg)

---

### 🏪 Multi-Store, Branch & Stock Transfer Management
Centralized administration of branches, physical stores, and logistics warehouses: assignment of fiscal POS endpoints, store switcher in top navbar, and atomic stock transfers.
![Multi-Store & Branches](docs/screenshots/multistore_view.jpg)

---

### 📦 Product Catalog & Multi-Warehouse Inventory
High-density counter view: SKU codes, EAN-13 barcodes, stock alerts, real-time margin adjustments, and mass price update tools.
![Catalog and Inventory](docs/screenshots/inventory_catalog_view_1788544850147.jpg)

---

### 🔐 Secure Sign-In & RBAC Access Control
Secure access powered by JSON Web Tokens (JWT), HttpOnly refresh cookies, and strict role permission profiles (`Admin`, `Supervisor`, `Cashier`, `Warehouse`).
![Login Page](docs/screenshots/login_page_1788544319949.jpg)

---

## ⚡ Complete Installation & Deployment Guide

The platform provides three flexible deployment modes:

```
                               ┌─────────────────────────────────┐
                               │       ERP Deployment Modes      │
                               └────────────────┬────────────────┘
                                                │
         ┌──────────────────────────────────────┼──────────────────────────────────────┐
         ▼                                      ▼                                      ▼
  🖥️ MODE 1: Bare-Metal                 🐳 MODE 2: Docker                      🦭 MODE 3: Podman
  • No container engine needed          • docker compose up -d                 • podman-compose up -d
  • Offline-First or Local              • Docker Containers                    • Rootless & Daemonless
  • Node.js 20+ and pnpm                • Desktop or Server                    • Enterprise / RHEL / Fedora
```

---

<a id="mode-1-local-bare-metal-no-docker--offline-first"></a>
### 🖥️ Mode 1: Local Bare-Metal (No Docker / Offline-First)

Ideal for standalone computers, counter netbooks without internet connectivity, or low-spec hardware.

#### Prerequisites:
- **Node.js** v20.x LTS or higher ([nodejs.org](https://nodejs.org/))
- **pnpm** v9.x or higher (`npm install -g pnpm`)
- **Git** ([git-scm.com](https://git-scm.com/))

---

#### 1.1. Autonomous Offline-First Mode (Frontend Only / Local Persistence)
Runs without external databases or backend services. The entire system operates in the browser using high-speed `localStorage` data stores.

```bash
# 1. Clone the repository
git clone https://github.com/luchoxiii/GestionQuincaillerie.git
cd GestionQuincaillerie

# 2. Install monorepo dependencies
pnpm install

# 3. Start the frontend development server
pnpm --filter @ferreteria/web run dev
```

- **Web URL:** [http://localhost:5173](http://localhost:5173)
- **Master Credentials:** Username: `admin` | Password: `admin123` (or `admin`)

---

#### 1.2. Full-Stack Bare-Metal Mode (Frontend + NestJS Backend + Local PostgreSQL)

##### 1. Local Services Setup:
- **PostgreSQL 16**: Install locally. Create database `ferreteria_db` and user `ferreteria`.
- **Redis 7** *(optional cache)*: Install locally or run via WSL2/Memurai.

##### 2. Environment Setup:
```bash
cp .env.example .env
```
Configure your database connection:
```env
DATABASE_URL="postgresql://ferreteria:your_password@localhost:5432/ferreteria_db?schema=public"
REDIS_HOST=localhost
REDIS_PORT=6379
API_PORT=4000
FRONTEND_URL=http://localhost:5173
```

##### 3. Database Migration and Seeding:
```bash
# Run Prisma ORM migrations (48 relational tables)
pnpm --filter @ferreteria/api exec prisma migrate dev --name init

# Seed master catalog, roles, permissions and test accounts
pnpm --filter @ferreteria/api exec ts-node prisma/seed.ts
```

##### 4. Launch Services:
```bash
# Terminal 1: Backend API (port 4000)
pnpm --filter @ferreteria/api run start:dev

# Terminal 2: Frontend Web (port 5173)
pnpm --filter @ferreteria/web run dev
```

- **Frontend:** [http://localhost:5173](http://localhost:5173)
- **API REST:** [http://localhost:4000/api](http://localhost:4000/api)
- **Swagger Docs:** [http://localhost:4000/api/docs](http://localhost:4000/api/docs)
- **Prisma Studio:** `pnpm --filter @ferreteria/api exec prisma studio` ([http://localhost:5555](http://localhost:5555))

---

<a id="mode-2-deployment-with-docker--docker-compose"></a>
### 🐳 Mode 2: Deployment with Docker & Docker Compose

Standard recommended environment with automated health checks and persistent volumes.

```bash
# 1. Clone repository
git clone https://github.com/luchoxiii/GestionQuincaillerie.git
cd GestionQuincaillerie

# 2. Install dependencies
pnpm install

# 3. Launch background containers
docker compose up -d

# 4. Run Prisma database migrations
pnpm --filter @ferreteria/api exec prisma migrate dev --name init

# 5. Seed initial data
pnpm --filter @ferreteria/api exec ts-node prisma/seed.ts

# 6. Launch services
# In Terminal 1:
pnpm --filter @ferreteria/api run start:dev
# In Terminal 2:
pnpm --filter @ferreteria/web run dev
```

---

<a id="mode-3-deployment-with-podman--podman-compose-rootless--enterprise"></a>
### 🦭 Mode 3: Deployment with Podman & Podman Compose (Rootless & Enterprise)

Fully daemonless and rootless container orchestration for enterprise Linux environments (RHEL, Fedora, Rocky, Alma, Debian, Ubuntu).

```bash
# 1. Clone repository and install dependencies
git clone https://github.com/luchoxiii/GestionQuincaillerie.git
cd GestionQuincaillerie
pnpm install

# 2. Launch rootless containers
podman-compose up -d

# 3. Apply migrations and seed data
pnpm --filter @ferreteria/api exec prisma migrate dev --name init
pnpm --filter @ferreteria/api exec ts-node prisma/seed.ts

# 4. Start applications
pnpm --filter @ferreteria/api run start:dev
pnpm --filter @ferreteria/web run dev
```

---

## 🏛️ Functional System Modules

### 1. Counter Terminal & Point of Sale (POS)
- **100% Keyboard Driven**: Quick sale shortcuts (`F2` search article, `F3` price checker, `F4` checkout, `Escape` cancel/clear).
- **USB Barcode Scanner Support**: `useBarcodeScanner` captures hardware optical/laser scans without requiring text field focus.
- **Fast Price & Financing Checker (`F3`)**: Modal accessible system-wide displaying retail pricing, installment plans (3 interest-free / 6 fixed), multi-warehouse stock, and 1-click cart addition.
- **Split & Flexible Payments**: Cash with live change calculation, debit/credit cards with batch tracking, bank transfer, customer credit account, and mixed payments.
- **Cash Discount Support**: Instant 5%, 10%, 15%, or 20% discount on cash sales.
- **Automatic Email Receipts**: Direct PDF/HTML receipt delivery to customer email upon checkout completion.
- **Thermal Receipt Printing**: 80mm and 58mm printer-ready layouts with 1-click print (`Ctrl+P`).

---

### 2. Dual Invoicing & Tax Regime
- **Fiscal Selection at Checkout**:
  - **Official AFIP Invoice (White)**: Electronic Invoice A / B issuance with official **CAE code**, expiration date, and tax rate breakdown (21%, 10.5%, 27%).
  - **Internal Receipt X (Black)**: Unofficial delivery receipt deducting physical warehouse stock and recording shift cash inflow without reporting to tax authorities.
- **VAT Sales Book Export**: Standard semicolon-delimited CSV (`UTF-8 with BOM`) containing strictly official transactions for accounting.
- **Internal Receipt Export**: Independent CSV export for internal physical audit and stock reconciliation.

---

### 3. Catalog, Multi-Warehouse Inventory & Purchasing
- **Comprehensive Catalog**: Auto-generated SKU, EAN-13 barcodes, markup margins, and hierarchical categories.
- **Multi-Warehouse Stock & Immutable Kardex**: Track stock across central warehouses, showrooms, and branches with chronological ledger entries (`StockMovement`).
- **Supplier Purchasing**: Inbound merchandise receipt, automatic stock increments, and cost recalculation.

---

### 4. CRM, Customer Intelligence & 360° Churn Scoring
- **Algorithmic RFM Segmentation**: VIP/Champions, B2B Contractors, Potential Loyal, At-Risk, Dormant/Churned, Promising New, and Occasional Buyers.
- **Predictive Churn Risk**: Machine learning-ready 0-100% abandonment score with explicit risk factors.
- **Direct Commercial Actions**: 1-click POS checkout with coupon and direct WhatsApp Web campaign triggers (`wa.me/549...`).
- **Data Science Exports**: Machine learning datasets (`exportMLDatasetCsv`) with 22 behavioral attributes and target churn flag.

---

### 5. Loyalty Coupons & Dual-Currency Quotes (USD / ARS)
- **Promotional Coupons**: Percentage (`% OFF`) and fixed amount (`$ OFF`) discounts with expiration dates and minimal purchase amounts.
- **Dual Currency Quotes**: Issue quotes in ARS ($) or USD (US$) with customizable agreed exchange rate and automatic equivalent calculation.
- **Price Validity & WhatsApp Dispatch**: Freeze prices for 24h, 48h, 7d, 15d, or 30d, and dispatch formatted WhatsApp messages with dual totals.
- **1-Click POS Conversion**: Direct quote-to-sale transformation loading locked prices into the counter cart.

---

<a id="meli-guide"></a>
### 6. E-Commerce Center & Mercado Libre API
- **Omnichannel Hub**: Integrate counter sales, Mercado Libre, custom online store, and telephone orders.
- **Shipping Logistics Center (`/ecommerce`)**: Print 10x15 cm thermal shipping labels with tracking barcodes.
- **Automated Webhook Sync**: Incoming orders automatically reserve catalog stock, record buyer usernames, and calculate sales fees.

---

<a id="google-sheets-guide"></a>
### 7. Bulk Upload (Excel / Sheets) & Google Drive Backup
- **Bulk Product & Customer Import**: Support for `.xlsx`, `.xls`, and `.csv` files with intelligent column header matching and live row-by-row validation.
- **Complete JSON Snapshots**: Export and restore all 15 system data collections.
- **Cloud Google Drive Backup**: OAuth2 direct multipart upload to `Ferreteria_ERP_Backups` folder without intermediate servers.

---

### 8. Universal Accessibility, Voice Assistant & WCAG 2.1 (AA/AAA)
- Accessible system-wide via **`Alt + A`**.
- **High-Contrast Yellow on Black**: 21:1 contrast ratio compliant with WCAG 2.1 AAA for low-vision operators.
- **Colorblindness Matrix Filters**: Protanopia, Deuteranopia, Tritanopia, and Achromatopsia calibrations.
- **Dyslexia Support**: OpenDyslexic font toggling, expanded letter spacing, and horizontal reading guide rule.
- **Tactical Audio & Voice Assistant**: Native Web Audio tone synthesis (laser beep, success triad, descending alert) and Spanish Web Speech synthesis for counter product scanning and checkout announcements.

---

### 9. Comprehensive Graphical Settings Panel
- **Mercado Libre Credentials & Sandbox Switcher**.
- **SMTP Corporate Email Parameters & Live Delivery Tester**.
- **Google Drive Client ID Management**.
- **Multi-Currency & Regional Formatting**: Presets for ARS, USD, EUR, CLP, UYU, BRL, PYG, COP, MXN, PEN, and custom formats.

---

### 10. Multi-Store & Commercial Branches
- Multi-branch administration with dedicated AFIP point-of-sale numbers (`0001`, `0002`).
- Global store switcher in navigation header.

---

### 11. Multi-Field Natural Language Search Engine
- Spanish lemmatization (plurals/singulars: *"tornillos"* ⇄ *"tornillo"*).
- Diacritic-insensitive matching (*"eléctrico"* = *"electrico"*).
- Multi-token search matching across code, name, brand, description, and category.

---

### 12. Cash Register Control, Real-Time Balancing & Daily Z-Closing
- Opening cash fund recording.
- Real-time theoretical cash balance calculation (`Opening Fund + Payments - Outflows`).
- Blind/assisted cash counts with automated discrepancy warnings (exact, overage, shortage).
- Daily transaction CSV exports.

---

## 🛡️ Security, Audit & OWASP Top 10 Standards

### Granular Role-Based Access Control Matrix (RBAC)
Strict permission enforcement across POS, Sales, Inventory, Customers, Cash, and Audit endpoints. The Audit module is restricted strictly to administrators (`ADMIN`).

### OWASP Top 10 Security Compliance
- **A01 Broken Access Control**: Global `JwtAuthGuard` and `PermissionsGuard`.
- **A02 Cryptographic Failures**: `bcryptjs` password hashing, HttpOnly secure cookies, and secret redaction (`[REDACTED]`) in logs.
- **A03 Injection & Mass Assignment**: Parameterized queries via Prisma ORM and strict NestJS `ValidationPipe` with `forbidNonWhitelisted: true`.
- **A05 Security Misconfiguration**: Fastify Helmet security headers, restricted CORS, and disabled Swagger in production.
- **A07 Identification Failures**: Fastify rate limiter (300 requests/minute per IP) preventing brute-force attacks.

### Tamper-Evident SHA-256 Cryptographic Forensic Ledger
Every administrative event, customer status change, and checkout payment is sequentially hashed using SHA-256 with the hash of the preceding block (`previousHash`). Any retroactive data modification breaks the hash chain and triggers instant tampering alerts.

---

## 🧪 Test, Stress & Performance Suite (186 Tests)

All 186 unit and stress tests pass with 100% success rate:

```bash
# Run all tests across the monorepo
pnpm -r run test
```

| Environment | Framework | Files / Suites | Executed Tests | Status |
| :--- | :---: | :---: | :---: | :---: |
| **Frontend Web (`apps/web`)** | Vitest 2.1.9 + JSDOM | 20 files | **138 tests** | ✅ **138/138 Passed** |
| **Backend API (`apps/api`)** | Jest 29 + ts-jest | 8 files | **48 tests** | ✅ **48/48 Passed** |
| **TOTAL MONOREPO** | pnpm Workspaces | **28 files** | **186 tests** | 🏆 **186 Passed / 0 Failures** |

---

## ⌨️ POS & Accessibility Keyboard Shortcuts

| Key / Shortcut | Scope | Action |
| :--- | :---: | :--- |
| **`F2`** | POS | Focus product catalog search input. |
| **`F3`** | Global | Open Fast Price & Financing Checker modal. |
| **`F4`** | POS | Open checkout modal with payment method selection. |
| **`Escape`** | POS / Modals | Cancel sale, clear cart, or close active modal. |
| **`Enter` (Scanner)** | POS | Add scanned barcode item to cart with audio beep. |
| **`Ctrl + P`** | POS / Invoice | Print thermal ticket (80mm) or official A4 invoice with QR code. |
| **`Alt + A`** | Global | Toggle Universal Accessibility Center. |
| **`Alt + S`** | Global | Voice Assistant: Read current screen summary aloud. |
| **`Alt + V` / 🔊** | F3 Checker | Announce product name, price, and available stock. |

---

## 🧭 Application Route Map

| Icon | Module | Path | Description |
| :---: | :--- | :--- | :--- |
| 📊 | **Dashboard** | `/` | Commercial KPI cards, Recharts trends, and alerts. |
| 📦 | **Products** | `/productos` | Catalog, SKU/barcode search, mass price updates, and Excel import. |
| ➕ | **New Product** | `/productos/nuevo` | Product form with markup calculators and tax rates. |
| 🏷️ | **Categories** | `/categorias` | Category and subcategory management. |
| 🏭 | **Inventory** | `/inventario` | Multi-warehouse stock, Kardex ledger, and transfers. |
| 🛒 | **Point of Sale** | `/pos` | Counter terminal with shortcuts `F2`, `F3`, `F4`, and scanner support. |
| 🔍 | **Price Checker** | Modal (`F3`) | Instant price, financing, and stock inspector. |
| 🧾 | **Sales** | `/ventas` | Historical sales, fiscal regime filtering, and void actions. |
| 👥 | **Customers** | `/clientes` | Customer accounts, credit limits, and banning. |
| 🧠 | **Profiles & Churn** | `/clientes/perfiles`| RFM analytics, 0-100% churn scoring, and ML dataset exports. |
| 🚚 | **Suppliers** | `/proveedores` | Supplier directory and outstanding balances. |
| 📑 | **Purchases** | `/compras` | Inbound purchase orders and stock reception. |
| 📄 | **Invoicing** | `/facturacion` | AFIP electronic invoices and VAT sales book export. |
| 💰 | **Cash Register** | `/caja` | Shift opening, cash movements, balancing, and daily Z-closing. |
| 📈 | **Reports** | `/reportes` | Digital VAT book, gross profit margins, and stock valuation. |
| 🛡️ | **Audit** | `/auditoria` | Forensic SHA-256 audit ledger (Admin only). |
| ⚙️ | **Settings** | `/configuracion` | Business tax data, Mercado Libre, SMTP, and Drive backups. |
| 👤 | **Users** | `/usuarios` | Employee accounts, roles, and granular permissions. |

---

## 🏗️ Technology Stack & Architecture

- **Frontend SPA**: React 18/19, Vite 5.4, Tailwind CSS 3.4, TypeScript.
- **UI Components**: shadcn/ui, Radix UI, Lucide Icons.
- **State & Data**: Zustand 4.5, TanStack Query 5 (React Query).
- **Charts & Visualization**: Recharts.
- **Spreadsheets**: SheetJS (`xlsx`).
- **Backend API**: NestJS 10, Fastify, TypeScript.
- **Database & ORM**: PostgreSQL 16, Prisma ORM 5 (48 relational models).
- **Cache & Message Queue**: Redis 7.
- **Monorepo Manager**: pnpm Workspaces.

---

## ⚙️ Environment Variables

Reference template available in `.env.example`:

```env
# Database & Cache
DATABASE_URL="postgresql://ferreteria:ferreteria_dev_2026@localhost:5432/ferreteria_db?schema=public"
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT Security
JWT_SECRET=super-secret-key-change-in-production-2026
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# Server & URLs
API_PORT=4000
API_HOST=0.0.0.0
FRONTEND_URL=http://localhost:5173

# Mercado Libre API
MELI_APP_ID=
MELI_CLIENT_SECRET=
MELI_REDIRECT_URI=http://localhost:4000/api/ecommerce/meli/callback
MELI_WEBHOOK_SECRET=
MELI_SELLER_ID=

# Google Drive Client ID
VITE_GOOGLE_CLIENT_ID=

# Email Notifications (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=invoicing@hardwarestore.com
SMTP_PASS=your_app_password
SMTP_FROM_NAME="Central Hardware Store"
SMTP_FROM_EMAIL=invoicing@hardwarestore.com
SMTP_BCC=admin@hardwarestore.com
```

---

## 🛠️ Maintenance & Quality Commands

```bash
# Run all tests across the monorepo
pnpm -r run test

# Run frontend tests only (Vitest)
pnpm --filter @ferreteria/web run test

# Run backend tests only (Jest)
pnpm --filter @ferreteria/api run test

# Strict TypeScript type check across monorepo (0 errors)
pnpm -r run lint

# Production build (Frontend code-split + Backend NestJS)
pnpm -r run build

# Launch Prisma Studio database GUI
pnpm --filter @ferreteria/api exec prisma studio

# Manage Docker / Podman containers
docker compose up -d    # or: podman-compose up -d
docker compose down     # or: podman-compose down
```

---

## 📄 License

Developed for **GestionQuincaillerie**. All rights reserved.

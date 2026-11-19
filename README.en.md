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
[![Tests](https://img.shields.io/badge/Tests-190%20Passing-brightgreen.svg)](https://vitest.dev/)
[![Audit Report](https://img.shields.io/badge/Audit-Comprehensive%20Report-blue.svg)](./AUDIT_REPORT.en.md)

[![WCAG 2.1](https://img.shields.io/badge/WCAG%202.1-AA%20%2F%20AAA-success.svg)](https://www.w3.org/WAI/standards-guidelines/wcag/)
[![A11y Voice](https://img.shields.io/badge/A11y-Voice%20%26%20Audio-blueviolet.svg)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)
[![OWASP Top 10](https://img.shields.io/badge/OWASP%20Top%2010-Compliant-success.svg)](https://owasp.org/)

> **Comprehensive Commercial Management System, Multi-Warehouse Stock Control, Dual AFIP Fiscal Invoicing, Ultra-Fast Point of Sale (POS) Counter Terminal, and Omnichannel Synchronization for Hardware Stores, Building Supply Yards, and Material Distributors.**  
> Official Repository: [https://github.com/luchoxiii/GestionQuincaillerie](https://github.com/luchoxiii/GestionQuincaillerie)  
> 🌐 **Languages / Idiomas / Langues:** [🇪🇸 Español](./README.md) • [🇺🇸 English](./README.en.md) • [🇧🇷 Português](./README.pt.md) • [🇫🇷 Français](./README.fr.md)  
> 📋 **Audit & Security Reports / Informes Técnicos:** [🇪🇸 Español (AUDIT_REPORT.md)](./AUDIT_REPORT.md) • [🇺🇸 English (AUDIT_REPORT.en.md)](./AUDIT_REPORT.en.md) • [🇧🇷 Português (AUDIT_REPORT.pt.md)](./AUDIT_REPORT.pt.md) • [🇫🇷 Français (AUDIT_REPORT.fr.md)](./AUDIT_REPORT.fr.md)

---

## 📑 Table of Contents

1. [📸 Visual Demonstration](#-visual-demonstration)
2. [⚡ Complete Installation & Deployment Guide](#-complete-installation--deployment-guide)
   - [🖥️ Mode 1: Local Bare-Metal (No Docker / Offline-First)](#modo-1-instalación-local-bare-metal-sin-docker--offline-first)
     - [1.1. Autonomous Offline-First Mode (Frontend Only / Local Persistence)](#11-autonomous-offline-first-mode-frontend-only--local-persistence)
     - [1.2. Full-Stack Bare-Metal Mode (Frontend + NestJS Backend + Local PostgreSQL)](#12-full-stack-bare-metal-mode-frontend--nestjs-backend--local-postgresql)
   - [🐳 Mode 2: Deployment with Docker & Docker Compose](#modo-2-despliegue-con-docker--docker-compose)
   - [🦭 Mode 3: Deployment with Podman & Podman Compose (Rootless & Enterprise)](#modo-3-despliegue-con-podman--podman-compose-rootless--enterprise)
3. [🏛️ Functional System Modules](#️-functional-system-modules)
   - [🛒 1. Counter Terminal & Point of Sale (POS)](#1-counter-terminal--point-of-sale-pos)
   - [🏛️ 2. Dual Invoicing & Tax Regime](#2-dual-invoicing--tax-regime)
   - [📦 3. Catalog, Multi-Warehouse Inventory & Purchasing](#3-catalog-multi-warehouse-inventory--purchasing)
   - [👥 4. CRM, Customer Intelligence & 360° Churn Scoring](#4-crm-customer-intelligence--360-churn-scoring)
   - [🎟️ 5. Loyalty Coupons & Dual-Currency Quotes (USD / ARS)](#5-loyalty-coupons--dual-currency-quotes-usd--ars)
   - [🌐 6. E-Commerce Center & Mercado Libre API](#6-e-commerce-center--mercado-libre-api)
     - [🟡 Connection Guide: Mercado Libre API (MELI)](#guia-meli)
   - [💾 7. Bulk Upload (Excel / Sheets) & Google Drive Backup](#7-bulk-upload-excel--sheets--google-drive-backup)
     - [☁️ Setup Guide: Google Sheets & Google Drive](#guia-google-sheets)
   - [♿ 8. Universal Accessibility, Voice Assistant & WCAG 2.1 (AA/AAA)](#8-universal-accessibility-voice-assistant--wcag-21-aaaa)
   - [⚙️ 9. Comprehensive Graphical Settings Panel](#9-comprehensive-graphical-settings-panel)
   - [🏪 10. Multi-Store & Commercial Branches](#10-multi-store--commercial-branches)
   - [🔍 11. Multi-Field Natural Language Search Engine](#11-multi-field-natural-language-search-engine)
   - [💵 12. Cash Register Control, Real-Time Balancing & Daily Z-Closing](#12-cash-register-control-real-time-balancing--daily-z-closing)
4. [🛡️ Security, Audit & OWASP Top 10 Standards](#️-security-audit--owasp-top-10-standards)
   - [Role-Based Access Control Matrix (RBAC)](#role-based-access-control-matrix-rbac)
   - [OWASP Top 10 Compliance Verification](#owasp-top-10-compliance-verification)
   - [SHA-256 Tamper-Evident Forensic Ledger](#sha-256-tamper-evident-forensic-ledger)
5. [🧪 Automated Test Suite, Stress & Performance (190 Tests)](#-automated-test-suite-stress--performance-190-tests)
6. [⌨️ Keyboard Shortcuts & Accessibility Quick Guide](#️-keyboard-shortcuts--accessibility-quick-guide)
7. [🧭 Application Route Map](#-application-route-map)
8. [🏗️ Technology Stack & Monorepo Architecture](#️-technology-stack--monorepo-architecture)
9. [⚙️ Environment Variables](#️-environment-variables)
10. [🛠️ Maintenance & Quality Commands](#️-maintenance--quality-commands)
11. [📄 License](#-license)

---

## 📸 Visual Demonstration

### Full Interactive Walkthrough (ERP + POS)
![Full System Walkthrough](docs/screenshots/walkthrough.gif)

### Key Screens & Architecture Highlights

| Counter POS Terminal | Multi-Currency Quotes (USD / ARS) |
| :---: | :---: |
| ![Counter POS Terminal](docs/screenshots/pos_checkout_view.jpg) | ![Multi-Currency Quotes](docs/screenshots/quotes_dollar_view.jpg) |
| *Keyboard shortcuts (F2/F3/F4), barcode scanning, cash discount & live change calculation.* | *Real-time conversion, locked exchange rates, validity countdown & WhatsApp dispatch.* |

| Cash Register & Daily Z-Closing | Multi-Store & Branches |
| :---: | :---: |
| ![Cash Register & Z-Closing](docs/screenshots/cash_register_view.jpg) | ![Multi-Store Management](docs/screenshots/multistore_view.jpg) |
| *Real-time theoretical balance, cash in/out tracking, physical discrepancy alerts & CSV export.* | *Multi-branch administration, AFIP fiscal point of sale, and branch switcher.* |

| Universal Accessibility & High Contrast | SHA-256 Cryptographic Audit Ledger |
| :---: | :---: |
| ![Accessibility & WCAG](docs/screenshots/a11y_high_contrast_view.jpg) | ![SHA-256 Forensic Ledger](docs/screenshots/audit_bitacora_view.jpg) |
| *Yellow on black (21:1 AAA), dyslexia fonts, synthetic voice assistant & Web Audio laser beeps.* | *Blockchain-grade hash chaining, tamper detection, integrity verification & signed JSON.* |

---

## ⚡ Complete Installation & Deployment Guide

<a id="modo-1-instalación-local-bare-metal-sin-docker--offline-first"></a>
### 🖥️ Mode 1: Local Bare-Metal (No Docker / Offline-First)

#### 1.1. Autonomous Offline-First Mode (Frontend Only / Local Persistence)
Requires no external database and no active backend service. The entire ERP (product catalog, counter POS, mixed payments, cash discounts, dual-currency quotes, discount coupons, audit ledger, reports, and bulk Excel import) functions autonomously inside the browser using ultra-fast indexed `localStorage`.

```bash
# 1. Clone the repository
git clone https://github.com/luchoxiii/GestionQuincaillerie.git
cd GestionQuincaillerie

# 2. Install monorepo dependencies
pnpm install

# 3. Start the frontend development server
pnpm --filter @ferreteria/web run dev
```

- **Web Access:** [http://localhost:5173](http://localhost:5173)
- **Master Credentials:** Username: `admin` | Password: `admin123` (or `admin`)

---

#### 1.2. Full-Stack Bare-Metal Mode (Frontend + NestJS Backend + Local PostgreSQL)
Designed to run relational disk persistence without container virtualization.

##### 1. Install Operating System Prerequisites:
- **PostgreSQL 16**: Download and install for your OS (Windows, macOS, Ubuntu/Debian). Create database `ferreteria_db` and user `ferreteria`.
- **Redis 7** *(optional cache)*: On Windows use [Memurai](https://www.memurai.com/) or WSL2; on Linux `sudo apt install redis-server`.

##### 2. Configure Environment File:
Copy `.env.example` in the root directory:
```bash
cp .env.example .env
```
Edit `.env` with your local PostgreSQL connection string:
```env
DATABASE_URL="postgresql://ferreteria:your_local_password@localhost:5432/ferreteria_db?schema=public"
REDIS_HOST=localhost
REDIS_PORT=6379
API_PORT=4000
FRONTEND_URL=http://localhost:5173
```

##### 3. Migrate Database & Seed Initial Master Data:
```bash
# Run Prisma ORM migrations (48 relational models)
pnpm --filter @ferreteria/api exec prisma migrate dev --name init

# Seed base catalog, price lists, categories, and test users
pnpm --filter @ferreteria/api exec ts-node prisma/seed.ts
```

##### 4. Launch Services:
```bash
# Terminal 1: Launch NestJS API (port 4000)
pnpm --filter @ferreteria/api run start:dev

# Terminal 2: Launch Vite Frontend (port 5173)
pnpm --filter @ferreteria/web run dev
```

- **Frontend SPA:** [http://localhost:5173](http://localhost:5173)
- **Backend API REST:** [http://localhost:4000/api](http://localhost:4000/api)
- **Swagger OpenAPI Docs:** [http://localhost:4000/api/docs](http://localhost:4000/api/docs)
- **Prisma Studio (GUI Database Browser):** `pnpm --filter @ferreteria/api exec prisma studio` (access at [http://localhost:5555](http://localhost:5555))

---

<a id="modo-2-despliegue-con-docker--docker-compose"></a>
### 🐳 Mode 2: Deployment with Docker & Docker Compose

Standard recommended option for containerized developer environments. Launches **PostgreSQL 16 Alpine** and **Redis 7 Alpine** with automated persistent storage volumes and healthchecks.

#### Prerequisites:
- **Docker Engine** v24+ and **Docker Compose v2** (or **Docker Desktop** on Windows/macOS)
- **Node.js** v20+ and **pnpm** v9+

#### Setup Steps:

```bash
# 1. Clone repository and navigate to folder
git clone https://github.com/luchoxiii/GestionQuincaillerie.git
cd GestionQuincaillerie

# 2. Install project dependencies
pnpm install

# 3. Launch infrastructure containers in background
docker compose up -d

# 4. Verify containers are healthy
docker compose ps

# 5. Apply Prisma database migrations
pnpm --filter @ferreteria/api exec prisma migrate dev --name init

# 6. Seed system master records
pnpm --filter @ferreteria/api exec ts-node prisma/seed.ts

# 7. Start ERP services
# Terminal 1 (Backend):
pnpm --filter @ferreteria/api run start:dev

# Terminal 2 (Frontend):
pnpm --filter @ferreteria/web run dev
```

#### Useful Docker Commands:
```bash
# Stream PostgreSQL logs in real time
docker compose logs -f postgres

# Stop containers preserving data volumes
docker compose stop

# Destroy containers preserving persistent volumes
docker compose down

# Restart containerized services
docker compose restart
```

---

<a id="modo-3-despliegue-con-podman--podman-compose-rootless--enterprise"></a>
### 🦭 Mode 3: Deployment with Podman & Podman Compose (Rootless & Enterprise)

**Podman** is the standard container engine in enterprise Linux distributions (Red Hat Enterprise Linux, Fedora, Rocky Linux, AlmaLinux, CentOS Stream, Debian, and Ubuntu), operating **100% daemonless** and running **entirely rootless** for maximum infrastructure security.

#### Prerequisites:
- **Podman** v4.x or v5.x ([podman.io](https://podman.io/))
- **podman-compose** (`pip install podman-compose` or package manager: `sudo dnf install podman-compose` / `sudo apt install podman-compose`)
- **Node.js** v20+ and **pnpm** v9+

#### Setup Steps with Podman:

```bash
# 1. Clone and enter project folder
git clone https://github.com/luchoxiii/GestionQuincaillerie.git
cd GestionQuincaillerie

# 2. Install Node.js packages
pnpm install

# 3. Launch services with podman-compose
podman-compose up -d

# (Or with the native Podman 4+ compose plugin):
# podman compose up -d
```

#### 🛡️ Podman Technical Highlights & Best Practices:
1. **Rootless Security (No Root Required):**
   - Containers run under your operating system user account without `sudo`, eliminating privilege escalation attack surfaces on the host.
   - Ports `5432` and `6379` exceed 1024, binding immediately without kernel adjustments.
2. **SELinux Compatibility (RHEL / Fedora / CentOS):**
   - If SELinux is set to `Enforcing`, Podman handles volumes with container isolation automatically. When mounting host directories, add `:Z` in `docker-compose.yml` for context relabeling.
3. **Transparent Alias Usage:**
   Add official aliases to your `~/.bashrc` or `~/.zshrc`:
   ```bash
   alias docker=podman
   alias docker-compose=podman-compose
   ```
4. **Prisma Migrations & Service Startup:**
   ```bash
   pnpm --filter @ferreteria/api exec prisma migrate dev --name init
   pnpm --filter @ferreteria/api exec ts-node prisma/seed.ts
   pnpm --filter @ferreteria/api run start:dev
   pnpm --filter @ferreteria/web run dev
   ```

---

## 🏛️ Functional System Modules

### 1. Counter Terminal & Point of Sale (POS)

![Counter POS Terminal](docs/screenshots/pos_checkout_view.jpg)

Engineered for high-volume customer queues with lightning-fast operational ergonomics:

- **100% Keyboard-Driven Workflow**: Universal hotkeys (`F2` product lookup, `F3` price checker, `F4` checkout, `Esc` cancel/clear).
- **USB Laser/Optical Barcode Scanner**: Global `useBarcodeScanner` hook detecting hardware scans instantly without requiring focus on any input field.
- **Fast Price & Installment Checker (`F3`)**:
  - Global modal accessible from any screen in the system.
  - High-contrast giant typography readable by counter customers.
  - Automatic **10% OFF** cash/debit discount preview.
  - Credit installment simulator (3 interest-free and 6 fixed payments).
  - Per-warehouse stock breakdown (Sales Counter vs Central Warehouse).
  - Single-click *"Add to Cart (POS)"* action.
- **Flexible & Split Payments**:
  - Cash with live change calculation.
  - Credit & Debit cards with voucher/batch tracking.
  - Bank transfer and customer credit accounts.
  - Split payments (e.g., 50% Cash, 50% Bank Transfer).
- **💰 Internal Ticket Mode with Instant Cash Discount**:
  - When selecting **Internal Receipt / Remito X (Internal Mode)**, cash discounts can be activated instantly.
  - Quick percentage selectors: **`5%`**, **`10%`** *(default)*, **`15%`**, and **`20% OFF`**.
  - Dynamic recalculation displaying the exact monetary savings, updated remaining balance, and live change owed.
- **📧 Automated Customer Email Delivery**:
  - If a customer profile has an email address registered (or an ad-hoc address is typed), digital receipts are emailed automatically upon sale completion.
  - Clean HTML email template featuring company fiscal data, itemized lines, unit prices, discounts, taxes, and payment breakdown.
- **Credit Limit & Banned Customer Enforcement**:
  - Real-time customer balance checks preventing overdrafts beyond credit limits.
  - **Banned Customer Protection**: Prevents processing sales for blacklisted customers with outstanding debts or bounced checks.
- **Thermal Receipt Printing**: 80mm and 58mm POS receipt layout optimized for single-click printing (`Ctrl+P`).

---

### 2. Dual Invoicing & Tax Regime

Reflects real commercial operations in retail and building supply yards with administrative rigor:

- **Dual Invoicing Mode at Checkout**:
  - **🏛️ Official Fiscal Invoicing (AFIP CAE)**: Electronic generation of **Invoice A** (for VAT registered businesses with Tax ID) or **Invoice B** (Final Consumers / Simplified Taxpayers) with official **CAE Code**, expiration date, and itemized VAT rates (21%, 10.5%, 27%).
  - **📋 Internal Receipt / Delivery Note (Remito X)**: Non-fiscal sales receipt for immediate counter delivery. Updates inventory and cash register while permitting counter cash discounts.
- **Sales Tax Book Export for Accountants (Libro IVA Ventas)**:
  - Formatted CSV with `UTF-8 with BOM` encoding and semicolon `;` delimiter containing strictly fiscal operations with approved CAE.
  - Fiscal columns: Date, Document Type, Point of Sale, Number, Tax ID (CUIT/DNI), Business Name, Net Amount, VAT Rate, Fiscal Tax, Exempt Amount, Total, CAE, and CAE Expiry.
- **Internal Voucher Export**: Separate CSV download for internal cash balancing and physical inventory reconciliations.
- **Invoicing Dashboard (`/facturacion`)**: Segregated metrics by regime, date filtering, and A4 PDF printing with official QR verification code.

---

### 3. Catalog, Multi-Warehouse Inventory & Purchasing

- **Complete Product Catalog**:
  - Automatic SKU generation (`ART-XXXX`), EAN-13 barcodes, brands, measurement units, and hierarchical categories.
  - Bidirectional links between **Replacement Cost**, **Profit Margin (%)**, and **Public Retail Price**.
  - Multi-rate VAT support (21%, 10.5%, 27%, Exempt 0%).
  - **Mass Price Updates**: Single-click percentage price markups or discounts by category or brand.
- **Multi-Warehouse Stock & Immutable Kardex**:
  - Inventory allocated across Central Warehouse, Counter Showroom, and secondary locations.
  - Immutable chronological ledger (`StockMovement`): Purchase Receipts (`IN`), Sales Deliveries (`OUT`), Manual Adjustments (`ADJUST`), and Inter-Warehouse Transfers (`TRANSFER`).
  - Mandatory audit notes for manual stock discrepancies.
  - Atomic stock balance adjustments across source and target warehouses.
- **Supplier Purchasing & Procurement**:
  - Goods receipt automatically updating on-hand stock.
  - Automatic retail price recalculation based on updated supplier replacement costs.
  - Supplier credit account tracking and payment order management.

---

### 4. CRM, Customer Intelligence & 360° Churn Scoring

Advanced behavioral analytics combining **RFM Segmentation (Recency, Frequency, Monetary Value)**, **Predictive Churn Risk Scoring (0% to 100%)**, and automated retention actions:

#### RFM Behavioral Segments:
| Segment | Algorithmic Rule | Business Profile | Tactical Recommendation |
| :--- | :--- | :--- | :--- |
| **🌟 VIP / Champion** | LTV $\ge \$100,000$, $\ge 3$ orders, last purchase $\le 35$ days | Highest commercial value. Frequent buyers with clean payment history. | VIP concierge, early stock access, premium rebates. |
| **🏗️ Commercial Contractors (B2B)** | Credit limit $\ge \$300,000$ or Corp with LTV $> \$150,000$ | Construction firms, trade accounts with Invoice A and credit terms. | Trade discounts, scheduled deliveries, dedicated rep. |
| **💎 Loyal Potential** | LTV $\ge \$40,000$, last purchase $\le 45$ days | Trade pros (plumbers, electricians) with consistent buying habits. | Volume tiers, reward points, trade promotions. |
| **⚠️ At Churn Risk** | High churn risk or LTV $> \$30,000$ with $> 45$ days idle | Regular accounts deviating from normal purchase frequency. | Proactive WhatsApp outreach, discounted freight. |
| **💤 Inactive / Dormant** | $> 90$ days without orders (confirmed churn) | Disengaged accounts at risk of permanent attrition. | Aggressive reactivation campaign with clearance pricing. |
| **🌱 Promising New** | Age $\le 45$ days with 1-2 orders | Recent onboarding within the retention evaluation window. | Welcome kit, product line introduction. |
| **🛒 Casual Buyer** | Sporadic purchases without pattern | Retail consumers purchasing DIY emergency supplies. | Counter upsells, promotional bundles. |

#### 360° Customer Profile Capabilities:
- **Predictive Churn Thermometer**: Score from 0 to 100% with progress bar and explicit underlying risk drivers.
- **Direct Commercial Actions**:
  - *"Charge in POS with Coupon"*: Opens POS with the customer selected and promotional coupon preloaded.
  - *"Activate WhatsApp Campaign"*: Opens WhatsApp Web (`wa.me/549...`) with an individualized greeting and exclusive discount code.
- **Machine Learning Dataset Export (`exportMLDatasetCsv`)**: 22 structured features with target variable `is_churned_target` (0/1) prepared for Scikit-Learn or XGBoost model training.
- **Marketing Audience Export (`exportMarketingAudienceCsv`)**: Contact list with phone, email, preferred product category, and tactical advice.

---

### 5. Loyalty Coupons & Dual-Currency Quotes (USD / ARS)

#### Promotional Coupon Engine (`/clientes/perfiles` - Coupons Tab):
- Percentage (`% OFF`) and fixed amount (`$ OFF`) discounts.
- Granular RFM targeting (*VIP*, *Contractors*, *New*, *At Risk*, *All*).
- Redemption restrictions: minimum spend, maximum discount cap, usage limits, and expiration dates.
- Exact tax-proportional discount allocation in POS preserving VAT integrity.

#### Dual-Currency Quotes (`/presupuestos`):

![Multi-Currency Quotes](docs/screenshots/quotes_dollar_view.jpg)

- **💵 Dual Currency Quoting (USD and ARS)**:
  - Toggle between base currency (`ARS ($)` vs `USD (US$)`) during quote generation.
  - **Editable Agreed Exchange Rate**: Auto-loads configured benchmark rate (e.g., `$1,350 / USD`) while allowing customized project negotiations.
  - Real-time catalog conversion displaying totals in USD alongside exact ARS equivalents.
- **🔍 Customer Quote Search & History**:
  - Multi-field search across customer name, Tax ID, phone, or quote number.
  - **Single-Click Access from Customer Profile (`/clientes`)**: Direct button navigating to historical quotes.
  - Visual badges distinguishing `USD` vs `ARS` with primary and secondary converted totals (`Equiv. $434,511 (FX: $1,350)`).
- **⏳ Locked Prices with Expiration Presets**: 24h, 48h, 7 days, 15 days, or 30 days.
- **🚦 Smart Status Indicator**: Green (active with countdown), Yellow (expires today, < 12 hrs), Red (expired), Blue (converted to sale).
- **📲 Direct WhatsApp Dispatch**: Structured message displaying itemized lines, negotiated exchange rate, and dual currency totals.
- **📄 Formal A4 Print Layout**: Header with currency equivalence table, validity clause, terms, and signature/stamp box.
- **⚡ Direct 1-Click POS Conversion**: Converts quote into an active POS cart at the agreed exchange rate without manual retyping.

---

### 6. E-Commerce Center & Mercado Libre API

Omnichannel hub for online sales processing, inventory synchronization, and shipping fulfillment:

- **Integrated Channels**: Counter POS, Mercado Libre, Online Store, WhatsApp, and phone orders.
- **Logistics Dispatch Center (`/ecommerce`)**:
  - Channel filters and dedicated **Pending Shipments** queue.
  - **Thermal Shipping Label Generator (10x15 cm)** with barcode, tracking number, and recipient data.
  - Logistics lifecycle tracking: *Processing*, *Ready to Ship*, *In Transit*, *Delivered*.

```
[ Mercado Libre Buyer ]
          │ (Places order & pays)
          ▼
[ Mercado Libre API ]
          │ (Instant Webhook IPN notification)
          ▼
[ ERP Backend: POST /api/ecommerce/meli/webhook ]
          │ (Order query: GET /orders/{id})
          ▼
[ Order Processing Pipeline ]
  ├─ 1. SKU / Barcode catalog mapping
  ├─ 2. Atomic physical warehouse stock deduction
  ├─ 3. Mercado Libre marketplace fee & net amount calculation
  ├─ 4. External order creation (#MELI-XXXXXXXX)
  └─ 5. Database commit & real-time broadcast
          │
          ▼
[ ERP Web Frontend ]
  ├─ 📦 E-Commerce Hub (/ecommerce): Pending dispatch queue
  ├─ 🏷️ 10x15 cm Thermal Shipping Label printing
  ├─ 🧾 Single-click Official Fiscal Invoice generation with CAE
  └─ 📊 Main Dashboard: Pending shipment alert notification
```

<a id="guia-meli"></a>
#### 🟡 Step-by-Step Connection Guide: Mercado Libre API (MELI)

To enable live sales synchronization, automatic warehouse deductions, and thermal label printing:

##### Step 1: Create an Application in Mercado Libre Developers
1. Access the developer portal: **[developers.mercadolibre.com.ar](https://developers.mercadolibre.com.ar/)** (or local country portal).
2. Sign in with the merchant account.
3. Open **"My Applications"** and click **"Create Application"**.
4. Complete application parameters:
   - **Name**: `Hardware-Store-ERP`
   - **Short Name**: `ferreteria-erp`
   - **Description**: *Multi-warehouse stock, fiscal invoicing, and omnichannel sales sync.*
   - **Category**: *ERP / Business Management*
   - **Redirect URI**:
     - Local development: `http://localhost:4000/api/ecommerce/meli/callback`
     - Production: `https://erp.yourdomain.com/api/ecommerce/meli/callback`
   - **Required Permissions / Scopes**:
     - ✅ `read`: Access listings, orders, buyers, and messages.
     - ✅ `write`: Modify inventory, pause listings, answer inquiries.
     - ✅ `offline_access`: Retrieve permanent `refresh_token` for background renewal.
   - **IPN Webhook Topics**:
     - Select `orders_v2` (paid purchases), `shipments` (shipping updates), and `items` (catalog updates).
     - **Webhook URL**: `https://your-tunnel.app/api/ecommerce/meli/webhook` (or production URL).
5. Copy generated **App ID** and **Client Secret**.

##### Step 2: Configure Environment Credentials
Add to root `.env` or `apps/api/.env`:
```env
MELI_APP_ID=1234567890123456
MELI_CLIENT_SECRET=your_meli_client_secret
MELI_REDIRECT_URI=http://localhost:4000/api/ecommerce/meli/callback
MELI_WEBHOOK_SECRET=your_webhook_signature_secret
MELI_SELLER_ID=987654321
```

##### Step 3: Authorize Application (Single-Click OAuth 2.0)
1. Open authorization URL in your browser:
   ```text
   https://auth.mercadolibre.com.ar/authorization?response_type=code&client_id=YOUR_MELI_APP_ID&redirect_uri=YOUR_MELI_REDIRECT_URI
   ```
2. Grant permission on the Mercado Libre confirmation dialog.
3. Callback exchanges code for `access_token` and `refresh_token`, storing credentials securely with background renewal.

---

### 7. Bulk Upload (Excel / Sheets) & Google Drive Backup

Rapid onboarding tools and sovereign cloud backup storage without third-party dependencies:

#### 📦 Bulk Import for Products & Customers:
- **Supported File Types**: `.xlsx`, `.xls`, and `.csv`.
- **Pre-Formatted Spreadsheet Templates**: Single-click downloads for `plantilla_productos_ferreteria.xlsx` and `plantilla_clientes_ferreteria.xlsx`.
- **Intelligent Header Parsing**: Automatic mapping of column variants (*Code*, *SKU*, *Name*, *Cost*, *Margin %*, *Sale Price*, *Stock*, *Barcode*, *Tax ID*).
- **Interactive Live Validation**: Real-time traffic light row validation (green: valid, red: specific error notes) without aborting valid rows.
- **Duplicate Handling**: Option switch to update existing prices/stock or insert new items exclusively.

#### 💾 Local & Google Drive Backups:
- **Full ERP Snapshot**: Signed JSON archive encompassing all **15 data collections** (Products, Customers, Sales, Quotes, Cash Sessions, Movements, Suppliers, Purchases, Categories, Brands, Warehouses, Audit Ledger, Company Settings, Taxes, and Units).
- **Direct Offline Snapshot**: Downloadable file `ferreteria_erp_backup_YYYY-MM-DD.json` with single-click restore verification.
- **Google Drive Cloud Synchronization**:
  - Secure OAuth2 connection limited to scope `https://www.googleapis.com/auth/drive.file`.
  - Automated directory creation: `Ferreteria_ERP_Backups`.
  - Direct RFC 2387 multipart upload without intermediary servers.
  - Remote snapshot listing and single-click cloud restoration.

```
[ ERP Browser / Counter ]
           │
           ├─► 📥 Download Official Template (.xlsx / .csv)
           │        │
           │        ▼
           │   [ Google Sheets ] ◄── Collaborative pricing & catalog management
           │        │
           │        ▼ (Export as .xlsx or .csv)
           ├─► 📤 Bulk Import in /productos or /clientes (validation & 1-click load)
           │
           └─► ☁️ Cloud Backup via OAuth 2.0
                    │
                    ▼ (Google Drive REST API v3 - Multipart Upload)
               [ Folder: Ferreteria_ERP_Backups ]
                    ├─ backup_ferreteria_2026-09-10.json
                    ├─ backup_ferreteria_2026-09-11.json
                    └─ Versioned snapshots with 1-click remote restore
```

<a id="guia-google-sheets"></a>
#### ☁️ Setup Guide: Google Sheets & Google Drive for Backup & Bulk Import

##### Step 1: Create a Project in Google Cloud Console
1. Navigate to **[console.cloud.google.com](https://console.cloud.google.com/)**.
2. Sign in with the organization Google account.
3. Click project dropdown and select **"New Project"** (e.g. `Hardware-Store-ERP`).

##### Step 2: Enable Google Drive & Google Sheets APIs
1. In the sidebar menu, open **"APIs & Services" > "Library"**.
2. Search and enable **Google Drive API**.
3. Search and enable **Google Sheets API**.

##### Step 3: Configure OAuth Consent Screen
1. Open **"APIs & Services" > "OAuth consent screen"**.
2. Select User Type: **External** and click **Create**.
3. Complete app name (`Hardware Store ERP Backup`) and support email.
4. Add Scope: `https://www.googleapis.com/auth/drive.file`.
5. Add your Google account under **Test Users** and save.

##### Step 4: Create OAuth 2.0 Client ID (Web Application)
1. Go to **"APIs & Services" > "Credentials"** > **"+ Create Credentials"** > **"OAuth client ID"**.
2. Application type: **Web application**.
3. Authorized JavaScript Origins:
   - `http://localhost:5173` (Local dev)
   - `https://your-domain.com` (Production)
4. Authorized Redirect URIs:
   - `http://localhost:5173/configuracion`
   - `https://your-domain.com/configuracion`
5. Copy your **Client ID** (`XXXXXXXXXXXX-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX.apps.googleusercontent.com`).

##### Step 5: Link Client ID in ERP
- Enter Client ID in **Settings (`/configuracion`) > "Backups & Google Drive"** tab, or set in `apps/web/.env`:
  ```env
  VITE_GOOGLE_CLIENT_ID=XXXXXXXXXXXX-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX.apps.googleusercontent.com
  ```
- Click **"Connect with Google"** and authorize the scope.

---

### 8. Universal Accessibility, Voice Assistant & WCAG 2.1 (AA/AAA)

Comprehensive accessibility architecture guaranteeing workplace inclusion for operators with visual, auditory, motor, or neurodevelopmental conditions (dyslexia, ADHD), conforming to **WCAG 2.1 AA and AAA** guidelines.

Global access via the **"Accessibility"** header button or hotkey **`Alt + A`**. Preferences persist immediately in browser `localStorage`.

```
        [ Universal Accessibility & Inclusion Center — Alt + A ]
                               │
       ┌───────────────────────┼───────────────────────┬───────────────────────┐
       ▼                       ▼                       ▼                       ▼
👁️ Visual               📖 Reading,             🔊 Audio & Voice        ⌨️ Keyboard Mobility
   Adaptations             Cognitive & Calm        Assistant (Offline)     & Navigation
  ├─ Yellow on Black      ├─ OpenDyslexic Font    ├─ Laser beep (C6)      ├─ Ultra-visible focus
  │  (WCAG AAA 21:1)      │  (anti-rotation)      ├─ Harmonic triad       │  ring (yellow/black)
  ├─ High-Contrast Dark   ├─ Horizontal Reading   │  (C5-E5-G5 success)   ├─ Skip to content
  ├─ Dynamic Zoom (150%)  │  Guide Ruler          ├─ Descending warning   │  anchor link
  ├─ Color Blindness      ├─ Reduced motion mode  ├─ Spoken price quotes  └─ 1-Key hotkeys
  │  (4 SVG matrices)     └─ Extended spacing     │  (F3 checker)            (F2, F3, F4, Esc)
  └─ Giant 32px Pointer                           └─ Screen narration
                                                     (Alt + S)
```

#### 👁️ 1. High-Contrast & Color Vision Adaptations:
- **Yellow on Black Mode (WCAG AAA)**: Contrast ratio exceeding 21:1 for low-vision and photophobia operators (`#facc15` text over `#000000` deep black).
- **High-Contrast Dark & Clean Light Themes**: Zero low-contrast gray gradients.
- **Dynamic Typographic Zoom**: 4 scalar zoom levels (`100% Normal`, `115% Large`, `130% Extra Large`, `150% Giant`) via CSS custom properties without horizontal layout overflow.
- **Color Blindness SVG Filters**:
  - **Protanopia**: Red-cone deficiency adjustment.
  - **Deuteranopia**: Green-cone deficiency adjustment (most common).
  - **Tritanopia**: Blue/yellow cone deficiency adjustment.
  - **Achromatopsia**: Calibrated monochromatic grayscale.
- **High-Visibility Cursor**: Replaces default cursor with a 32x32px giant yellow-bordered pointer.

#### 📖 2. Cognitive Comfort & Dyslexia Support:
- **Dyslexia Font Mode**: Enables heavily weighted base glyphs preventing involuntary character rotation (`b/d`, `p/q`, `n/u`) with `0.06em` letter spacing and `1.75` line height.
- **Horizontal Reading Guide**: Floating ruler tracking vertical cursor position to assist in scanning dense invoicing and stock tables.
- **Reduced Motion & Calm Mode**: Disables transitions and animations (`prefers-reduced-motion`) preventing vestibular discomfort.

#### 🔊 3. Pure Synthetic Audio & Voice Assistant (100% Offline):
- **Web Audio API Pure Synthesis**: Generates clean oscillator soundwaves without external MP3 files:
  - **Laser Beep (1046.5 Hz - C6)**: Sharp feedback upon scanning barcodes.
  - **Success Triad (C5-E5-G5 / 523Hz, 659Hz, 784Hz)**: Harmonic chord on completed sale.
  - **Descending Dual Tone (440Hz to 330Hz)**: Warning on banned customers or validation errors.
- **Offline Voice Assistant (Web Speech API)**:
  - **F3 Price Checker**: Vocalizes item name, price, and stock (*"Bosch Angle Grinder 750W. Price: $45,000. In stock: 12 units"*).
  - **POS Checkout Completion**: Announces total charged and cash change owed.
  - **Screen Narration (`Alt + S`)**: Reads active module title and state for visually impaired users.

---

### 9. Comprehensive Graphical Settings Panel

Centralized settings screen (`/configuracion`) structured into 4 administrative management tabs:

#### 🟡 1. Mercado Libre Tab (`MeliSettingsTab.tsx`):
- API credentials: `App ID`, `Client Secret`, `Seller ID`, `Webhook Secret`, and `Redirect URI`.
- Environment toggle: **Sandbox Mode** vs **Production Mode**, and auto-sync switch.
- Connectivity tests: Single-click **"Test MELI Connection"** and **"Link Account (OAuth)"**.

#### 📧 2. Corporate Email & Notifications Tab (`EmailSettingsTab.tsx`):
- SMTP parameters: Host, Port (`587`, `465`, `25`), Encryption (`STARTTLS`, `SSL/TLS`), credentials, and BCC email.
- Automation: Auto-email receipts upon sale confirmation, responsive HTML templates.
- Live test tool: Single-click **"Send Test Email"** and dispatch history log.

#### ☁️ 3. Google Drive & Backups Tab (`BackupSettingsTab.tsx`):
- OAuth Client ID configuration (`VITE_GOOGLE_CLIENT_ID`), single-click popup authorization, and instant backup upload.

#### 🏢 4. Company & Regional Currency Tab:
- Fiscal company data: Business Name, Tax ID (CUIT), Address, Fiscal Point of Sale, and company logo.
- **🪙 Global Commercial Currency Engine**:
  - Live active currency switcher affecting POS, receipts, invoices, thermal printers, reports, and voice narration.
  - **Preconfigured Currency Presets**:
    - **ARS ($)** — Argentine Peso (`es-AR`, 2 decimals).
    - **USD (US$)** — US Dollar (`en-US`, 2 decimals).
    - **EUR (€)** — Euro (`es-ES`, 2 decimals).
    - **CLP ($)** — Chilean Peso (`es-CL`, 0 decimals).
    - **UYU ($U)** — Uruguayan Peso (`es-UY`, 2 decimals).
    - **BRL (R$)** — Brazilian Real (`pt-BR`, 2 decimals).
    - **PYG (Gs.)** — Paraguayan Guaraní (`es-PY`, 0 decimals).
    - **COP ($)** — Colombian Peso (`es-CO`, 0 decimals).
    - **MXN ($)** — Mexican Peso (`es-MX`, 2 decimals).
    - **PEN (S/)** — Peruvian Sol (`es-PE`, 2 decimals).
    - **Custom**: ISO code, counter symbol, regional locale, and decimal precision (`0` to `4`).
  - **Live Preview Widget**: Displays instant rendering changes (e.g. `$ 12,450.50` vs `US$ 12,450.50`).
  - **Hot Cache Synchronization**: In-memory sync (`syncCurrencyCache()`) without page reloads.

---

### 10. Multi-Store & Commercial Branches

![Multi-Store Management](docs/screenshots/multistore_view.jpg)

- **Branch Administration (`StoresSettingsTab.tsx`)**:
  - Rapid creation, editing, and deactivation of retail branches and outlets.
  - Per-store **AFIP Fiscal Point of Sale** (4 digits, e.g. `0001`, `0002`).
  - Main Branch definition (`isMain`), store manager, address, phone, and contact email.
- **Header Store Switcher**:
  - Single-click dropdown in the global navigation bar to switch operational branches.
  - Visual display of active branch and assigned fiscal point of sale (`PV:0001`).
  - Automatic inventory link to location-specific warehouse stock.

---

### 11. Multi-Field Natural Language Search Engine

Enables operators to locate products, customers, and staff through colloquial, everyday terminology:

- **Spanish & Multi-Language Stemming (Plurals & Inflections)**:
  - Resolves plural/singular variations automatically (*"nails"* ⇄ *"nail"*, *"screws"* ⇄ *"screw"*, *"paints"* ⇄ *"paint"*).
- **Phonetic & Unaccented Normalization**:
  - Strips diacritics and unifies case (*"eléctrico"* = *"electrico"*, *"gómez"* = *"gomez"*).
- **Multi-Token Field Matching**:
  - Multi-word phrases like *"bosch 700w hammer drill"* split into tokens matching across Name, Brand, SKU, Barcode, Category, or Description.
- **Universal Customer Search**:
  - Searches Company Name, DBA, Tax ID, National ID, Address, City, Phone, Email, or Tax Classification.
- **Offline In-Memory Speed**:
  - 100% native execution (`packages/shared/src/utils/natural-search.ts`), yielding sub-millisecond query responses in both browser and backend.

---

### 12. Cash Register Control, Real-Time Balancing & Daily Z-Closing

![Cash Register & Z-Closing](docs/screenshots/cash_register_view.jpg)

Full cash drawer auditing and balancing suite for counter retail (`/caja`):

- **Shift Opening & Session Setup**:
  - Register assignment (e.g. *Main Counter 01*, *Trade Counter 02*).
  - **Opening Change Fund** recording.
  - Opening timestamp and operator identity lock.
- **Live Real-Time Monitoring**:
  - **4 Live Status Cards**: Shift Status, Opening Fund, Total Cash In/Out, and **Theoretical Cash Drawer Balance** (`Opening Fund + Cash Sales - Manual Cash Outflows`).
  - Second-by-second chronological audit ledger of every cash transaction.
- **Petty Cash Outflows & Security Pickups**:
  - Quick logging of non-commercial expenses (freight, advances, minor supplier payouts).
  - Security cash drops during high-volume trading hours.
- **Physical Count & Daily Z-Closing**:
  - Blind physical cash count entry by cashiers.
  - **Automated Discrepancy Reconciliation**:
    - *Balanced:* Zero variance against system theoretical balance.
    - *Over:* Flags exact surplus found in drawer.
    - *Short:* Highlights cash deficits in red.
  - Mandatory justification note required to close sessions with discrepancies.
- **CSV / Excel Shift Export**:
  - Single-click download of daily shift transactions for bookkeeping.
- **Cryptographic Immutability**:
  - Every session open, transaction, and closure is sealed into the SHA-256 Forensic Ledger.

---

## 🛡️ Security, Audit & OWASP Top 10 Standards

### Role-Based Access Control Matrix (RBAC)

Operational capabilities are strictly partitioned into granular privileges:

| Module | Permission Key | Authorized Capability | Risk Tier |
| :--- | :--- | :--- | :--- |
| **POS** | `pos:access` | Operate sales counter terminal | Standard |
| | `pos:discount` | Apply discretionary discounts & coupons | ⚠️ High Risk |
| | `pos:price_check` | Open F3 price & installment checker | Low |
| **Sales** | `sales:read` | View historical sales receipts | Low |
| | `sales:create` | Process counter tickets and invoices | Standard |
| | `sales:void` | Void transactions & issue Credit Notes | ⚠️ High Risk |
| | `invoicing:emit_fiscal`| Generate official AFIP Invoice A/B with CAE | High |
| **Inventory** | `products:read` | View catalog and stock levels | Low |
| | `products:create` | Create/edit catalog items | Medium |
| | `products:edit_price` | Modify replacement costs and retail prices | ⚠️ High Risk |
| | `products:mass_price` | Execute bulk supplier markups | ⚠️ High Risk |
| | `stock:adjust` | Log physical stock adjustments | ⚠️ High Risk |
| | `stock:transfer` | Transfer stock between warehouses | Medium |
| **Customers** | `customers:read` | View customer database & balances | Low |
| | `customers:write` | Create/edit fiscal profiles & addresses | Medium |
| | `customers:credit_limit`| Alter customer account credit limits | High |
| | `customers:ban` | Blacklist customers due to non-payment | ⚠️ High Risk |
| **Cash** | `cash:open` / `cash:close`| Shift opening & blind Z-closing | High |
| | `cash:movements` | Manual cash receipts and payouts | High |
| **Audit** | `audit:read` | Inspect forensic audit ledger (**Admin Only**) | ⚠️ High Risk (Admin) |

> [!IMPORTANT]
> **Strict Audit Confidentiality**: The Audit module and operator activity logs are strictly confidential and **restricted solely to users with the `ADMIN` role** (`audit:read`). The section is invisible in navigation sidebars and forbidden on route guards for cashiers and store supervisors.

---

### OWASP Top 10 Compliance Verification

Active defenses implemented against the top 10 web application vulnerabilities:

| OWASP Standard | Implemented Defensive Measure | Protection Level |
| :--- | :--- | :---: |
| **A01: Broken Access Control** | Global `JwtAuthGuard` on all endpoints + granular `PermissionsGuard`. Audit routes restricted to Admin. | 🟢 **100% Secured** |
| **A02: Cryptographic Failures** | Passwords hashed with `bcryptjs` (salt rounds = 10). Cookies: `HttpOnly`, `SameSite: strict`, `Secure`. Automatic credential redaction (`[REDACTED]`) in logs. | 🟢 **100% Secured** |
| **A03: Injection & Mass Assignment** | Parameterized Prisma ORM queries. NestJS `ValidationPipe` with `forbidNonWhitelisted: true`. Zero usage of `dangerouslySetInnerHTML`. CSV cell sanitization (`sanitizeCsvCell`). | 🟢 **100% Secured** |
| **A04: Insecure Design** | 10 MB payload limits. Counter blocks on blacklisted customers and strict credit limit enforcement. | 🟢 **100% Secured** |
| **A05: Security Misconfiguration** | `@fastify/helmet` headers (CSP, anti-Clickjacking, anti-MIME sniffing, HSTS). Strict CORS origin validation. Swagger disabled in production. | 🟢 **100% Secured** |
| **A06: Vulnerable Components** | Strict pnpm lockfile scanning. `proxy-addr >= 2.0.8` override. Zero critical dependency alerts. | 🟢 **100% Secured** |
| **A07: Identification Failures** | `@fastify/rate-limit` (300 req/min per IP). `tokenVersion` in database for instant session invalidation. Minimum 8 to maximum 128 character password constraints. | 🟢 **100% Secured** |
| **A08: Software & Data Integrity** | Strict TypeScript compilation (`tsc --noEmit`, 0 errors). Class-validator decorated DTOs on all endpoints. | 🟢 **100% Secured** |
| **A09: Logging Failures** | Immutable transactional PostgreSQL audit ledger (`AuditLog`) tracking user, action, entity, timestamp, and IP with sanitized payloads. | 🟢 **100% Secured** |
| **A10: Server-Side Request Forgery (SSRF)**| Strict egress URL validator (`isValidSafeUrl`) blocking cloud metadata ranges (`169.254.169.254`, `metadata.google.internal`), private CIDRs, and abnormal ports. | 🟢 **100% Secured** |

---

### SHA-256 Tamper-Evident Forensic Ledger

![SHA-256 Forensic Ledger](docs/screenshots/audit_bitacora_view.jpg)

For legal disputes, tax examinations, or judicial investigations, the system embeds an immutable **SHA-256 Tamper-Evident Ledger**:

```
[ Genesis Block (SHA-256) ]
           │
           ▼
[ Block #1: User Created  ] ─── Hash #1 = SHA256(#1 | Timestamp | User | Action | Entity | Data | PrevHash )
           │
           ▼
[ Block #2: POS Checkout  ] ─── Hash #2 = SHA256(#2 | Timestamp | User | Action | Entity | Data | Hash #1   )
           │
           ▼
[ Block #3: Stock Adjust  ] ─── Hash #3 = SHA256(#3 | Timestamp | User | Action | Entity | Data | Hash #2   )
```

#### 🔒 Cryptographic Proofs:
1. **Blockchain-Grade Hash Chaining**: Every log event computes a digest binding sequence number, timestamp, user ID, action, entity, JSON payload, and the prior block's hash (`previousHash`).
2. **Mathematical Tampering Detection**:
   - If an unauthorized party alters a database record, the recalculated hash diverges immediately: `Alert: Block #N Tampered`.
   - If a record is purged, a sequence gap is detected.
   - If a bogus record is inserted, the downstream cryptographic chain breaks.
3. **Mandatory Audited Events**:
   - User creation, permission revisions, credential changes, and deactivations.
   - Customer creation, credit limit updates, and debt blacklisting.
   - POS receipts, invoices, discretionary discounts, and cancellations (`VOID`).
   - Physical inventory adjustments, warehouse transfers, and cash drawer closings.
4. **Live Forensic Tools in `/auditoria`**:
   - **"Verify SHA-256 Integrity"**: Instant full-ledger recalculation with visual certification.
   - **Download Signed JSON Forensic Dossier**: Exports entire cryptographically signed audit package for inspectors.
   - **Certified CSV Export**: Includes sequence, SHA-256 hash, and previous hash for spreadsheet review.

---

## 🧪 Automated Test Suite, Stress & Performance (190 Tests)

The test architecture ensures rock-solid operational stability and zero UI freeze under heavy sales pressure:

```bash
# Run complete monorepo test suite (Frontend + Backend)
pnpm -r run test
```

### 📊 Automated Test Execution Summary:

| Layer / Package | Test Framework | Test Files | Total Tests | Outcome |
| :--- | :---: | :---: | :---: | :---: |
| **Frontend Web (`apps/web`)** | Vitest 2.1.9 + JSDOM | 20 files | **141 tests** | ✅ **141/141 Passing (100%)** |
| **Backend API (`apps/api`)** | Jest 29 + ts-jest | 8 files | **49 tests** | ✅ **49/49 Passing (100%)** |
| **TOTAL MONOREPO** | Monorepo pnpm | **28 files** | **190 tests** | 🏆 **190 Passing / 0 Failures (100%)** |

### 🔥 Included Stress & High-Concurrency Test Scenarios:
- **SHA-256 Forensic Ledger (`audit-ledger.spec.ts`)**: Avalanche effect, chain integrity, tampering detection, deletion detection.
- **Natural Language Search (`natural-search.spec.ts`)**: Stemming, phonetic normalization, multi-token matching across products, customers, and users.
- **Multi-Currency Engine (`utils.spec.ts`)**: Formatting in ARS, USD, EUR, CLP (0 decimals), BRL, custom symbols, negative values, and localStorage synchronization.
- **Massive POS Cart (`pos.store.stress.spec.ts`)**: 500 distinct catalog items with instant VAT, discount, and subtotal recalculation in < 500ms.
- **Quantity Rapid-Fire**: 1,000 consecutive quantity adjustments with zero memory leaks.
- **Quote Expiration Engine (`quotes.service.stress.spec.ts`)**: Evaluation of 10,000 quotes in < 200ms.
- **Bulk Spreadsheet Import (`excel-import.service.stress.spec.ts`)**: Parsing and validating 3,000 product rows and 3,000 customer rows with Tax IDs in < 2.5s.
- **Customer Intelligence & Churn Scoring (`customer-analytics.service.stress.spec.ts`)**: RFM profiling, predictive risk score, and ML dataset generation across 5,000 customer records in < 1.5s.
- **JSON Backup Engine (`backup.service.stress.spec.ts`)**: Serialization and restoration of 20,000 entities in < 1s.
- **High-Volume Catalog Backend (`products.service.stress.spec.ts`)**: Multi-warehouse stock calculation over 100 pages and 200 concurrent searches in < 1s.
- **Concurrent Logins (`auth.service.stress.spec.ts`)**: 100 concurrent logins processing bcrypt hashing in parallel.
- **Extreme Payload Audit (`audit.interceptor.stress.spec.ts`)**: Recursive sanitization of 12-level nested JSON trees and 2,000 keys in < 100ms.
- **Email Notifications & Receipts (`email-notification.service.stress.spec.ts`)**: 500 concurrent queue jobs, 10,000 cash discount calculations (< 300ms), and 1,000 HTML receipt renders (< 1.5s).

---

## ⌨️ Keyboard Shortcuts & Accessibility Quick Guide

| Key / Shortcut | Module | Action |
| :--- | :---: | :--- |
| **`F2`** | POS | Focuses quick product search input. |
| **`F3`** | Global | Opens **Fast Price & Installment Checker** from anywhere in the system. |
| **`F4`** | POS | Opens checkout modal, payment method selector, and fiscal mode toggle. |
| **`Escape`** | POS / Modals | Clears cart (when at POS root) or closes the active modal dialog. |
| **`Enter` (Scanner)**| POS | Adds scanned barcode item directly to sales cart with confirmation beep. |
| **`Ctrl + P`** | POS / Invoices | Prints 80mm thermal receipt or official A4 invoice with AFIP QR code. |
| **`Alt + A`** | Global | **Opens / Closes Universal Accessibility Center** (Contrast, zoom, voice). |
| **`Alt + S`** | Global | **Voice Assistant**: Narrates active module title and summary aloud. |
| **`Alt + V` / 🔊** | F3 Checker | **Vocalizes** product name, unit price, and on-hand stock. |
| **Initial `Tab`** | Global | **Skip to main content** anchor link (WCAG 2.4.1). |

---

## 🧭 Application Route Map

| Icon | Module | Route | Purpose |
| :---: | :--- | :--- | :--- |
| 📊 | **Dashboard** | `/` | Commercial KPI metrics, Recharts charts, pending dispatch alerts, CSV summary export. |
| 📦 | **Products** | `/productos` | Catalog, SKU/EAN search, filters, bulk price updates, Excel import/export. |
| ➕ | **New Product** | `/productos/nuevo` | Product creation with commercial margin and VAT calculators. |
| 🏷️ | **Categories** | `/categorias` | Hierarchical department and category taxonomy. |
| 🏭 | **Inventory** | `/inventario` | Multi-warehouse stock, Kardex ledger, inter-warehouse transfers, CSV export. |
| 🛒 | **Point of Sale** | `/pos` | Counter terminal: hotkeys `F2`, `F3`, `F4`, mixed tenders, barcode scanning. |
| 🔍 | **Price Checker** | Modal (`F3`) | Instant price, stock by warehouse, installment simulation, 10% cash discount. |
| 🧾 | **Sales** | `/ventas` | Sales supervisor, fiscal regime filter, receipt reprinting, voiding, CSV export. |
| 👥 | **Customers** | `/clientes` | Fiscal customer profiles, credit accounts, blacklist toggle, Excel import/export. |
| 🧠 | **Profiles & Churn** | `/clientes/perfiles`| RFM segmentation, Churn Scoring (0-100%), 360° cards, ML/marketing dataset export. |
| 🚚 | **Suppliers** | `/proveedores` | Vendor directory, Tax ID, balance tracking, purchase orders, CSV export. |
| 📑 | **Purchases** | `/compras` | Vendor invoice history, automatic stock intake, CSV export. |
| ➕ | **Receive Purchase**| `/compras/nueva` | Goods receipt form with cost markup and retail price recalculation. |
| 📄 | **Invoicing** | `/facturacion` | Official AFIP Invoices A/B with CAE, Internal Receipts, **Accountant Sales Tax Book CSV**. |
| 💰 | **Cash Register** | `/caja` | Shift open, petty cash receipts/payouts, blind Z-closing count, CSV export. |
| 📈 | **Reports** | `/reportes` | Digital Sales Tax Book, gross margins, multi-warehouse inventory valuation. |
| 🛡️ | **Audit** | `/auditoria` | Forensic activity ledger with SHA-256 validation and signed JSON export (**Admin Only**). |
| ⚙️ | **Settings** | `/configuracion` | Company details, currency selector, Google Drive backups, MELI & SMTP email. |
| 👤 | **Users** | `/usuarios` | Employee accounts, granular RBAC roles and permissions. |

---

## 🏗️ Technology Stack & Monorepo Architecture

| Architectural Layer | Core Technologies | Purpose |
| :--- | :--- | :--- |
| **Frontend SPA** | React 18/19, Vite 5.4, Tailwind CSS 3.4, TypeScript | High-performance reactive web application with strict typing. |
| **UI Components** | shadcn/ui, Radix UI, Lucide Icons | Accessible components, focus management, modal dialogs. |
| **State & Cache** | Zustand 4.5, TanStack Query (React Query 5) | In-memory POS cart and server-state caching. |
| **Charts & Metrics** | Recharts | Adaptive sales trends, margin distribution, and turnover visualizations. |
| **Spreadsheets** | SheetJS (`xlsx`) | Native client-side parsing and generation of `.xlsx`, `.xls`, and `.csv`. |
| **Backend REST API** | NestJS 10, Fastify, TypeScript | Modular REST backend, class-validator DTOs, Swagger OpenAPI. |
| **Database & ORM** | PostgreSQL 16, Prisma ORM 5 | 48 relational models with foreign-key constraints and migrations. |
| **Cache & Queue** | Redis 7 | In-memory caching and background job processing. |
| **Monorepo Tooling** | pnpm Workspaces | Monorepo package sharing via `@ferreteria/shared`. |

### Monorepo Directory Layout:

```
GestionQuincaillerie/
├── apps/
│   ├── api/                     # Backend NestJS 10 + Fastify
│   │   ├── prisma/
│   │   │   ├── schema.prisma    # 48 Normalized relational models
│   │   │   └── seed.ts          # Master data seeding script
│   │   └── src/
│   │       ├── modules/         # Auth, Users, Products, Categories, Warehouses,
│   │       │                    # Inventory, Suppliers, Purchases, Sales,
│   │       │                    # CashRegister, Customers, Invoicing, Reports,
│   │       │                    # Audit, Settings, Telemetry
│   │       └── common/          # Guards, Interceptors, Decorators, Filters
│   └── web/                     # Frontend React 18/19 + Vite
│       └── src/
│           ├── components/
│           │   ├── ui/          # 21 reusable shadcn/ui components
│           │   ├── common/      # PriceCheckModal, DataTable, ConfirmDialog
│           │   ├── products/    # ProductExcelImportModal
│           │   ├── customers/   # CustomerExcelImportModal, CustomerProfileModal
│           │   ├── quotes/      # NewQuoteModal, QuotePrintModal, UpdateExchangeRateModal
│           │   ├── settings/    # BackupSettingsTab, MeliSettingsTab, EmailSettingsTab
│           │   └── layout/      # Sidebar, Header with F3, DashboardLayout
│           ├── pages/           # Main views (POS, Invoicing, Quotes, Cash, etc.)
│           ├── services/        # API clients, backup, excel-import, google-drive, quotes
│           ├── stores/          # Reactive Zustand stores (auth, pos, cash, accessibility)
│           └── hooks/           # useBarcodeScanner, useToast
├── packages/
│   └── shared/                  # Shared library: TypeScript types and Zod schemas
├── docs/
│   └── screenshots/             # Interface screenshots and animated demo GIF
├── docker-compose.yml           # PostgreSQL 16 & Redis 7 container orchestration
├── pnpm-workspace.yaml          # Monorepo configuration and package overrides
└── package.json                 # Monorepo root scripts
```

---

## ⚙️ Environment Variables

Configuration template available in `.env.example`:

```env
# ==========================================
# Database & Cache
# ==========================================
DATABASE_URL="postgresql://ferreteria:ferreteria_dev_2026@localhost:5432/ferreteria_db?schema=public"
REDIS_HOST=localhost
REDIS_PORT=6379

# ==========================================
# JWT Security & Authentication
# ==========================================
JWT_SECRET=super-secret-key-change-in-production-2026
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# ==========================================
# Server Ports & URLs
# ==========================================
API_PORT=4000
API_HOST=0.0.0.0
FRONTEND_URL=http://localhost:5173

# ==========================================
# Mercado Libre API (MELI)
# ==========================================
MELI_APP_ID=
MELI_CLIENT_SECRET=
MELI_REDIRECT_URI=http://localhost:4000/api/ecommerce/meli/callback
MELI_WEBHOOK_SECRET=
MELI_SELLER_ID=

# ==========================================
# Google Drive & Sheets Backup (OAuth 2.0)
# ==========================================
VITE_GOOGLE_CLIENT_ID=

# ==========================================
# Email Notifications & Receipts (SMTP)
# ==========================================
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
# Run all tests across the monorepo (Jest + Vitest)
pnpm -r run test

# Run frontend tests exclusively (Vitest)
pnpm --filter @ferreteria/web run test

# Run backend tests exclusively (Jest)
pnpm --filter @ferreteria/api run test

# Interactive test runner in watch mode
pnpm --filter @ferreteria/web run test:watch

# Strict TypeScript type check across monorepo (0 errors)
pnpm -r run lint

# Production build (Frontend code-splitting + Backend NestJS)
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

# 🛠️ GestionQuincaillerie — Ferretería ERP & POS

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

> **Sistema Integral de Gestión Comercial, Control de Stock Multidepósito, Facturación Dual AFIP, Terminal de Punto de Venta (POS) de Alta Velocidad y Sincronización Omnicanal para Ferreterías, Corralones y Distribuidores de Materiales.**  
> Repositorio oficial: [https://github.com/luchoxiii/GestionQuincaillerie](https://github.com/luchoxiii/GestionQuincaillerie)

---

## 📑 Tabla de Contenidos

1. [📸 Demostración Visual](#-demostración-visual)
2. [⚡ Guía Completa de Instalación y Despliegue](#-guía-completa-de-instalación-y-despliegue)
   - [🖥️ Modo 1: Instalación Local Bare-Metal (Sin Docker / Offline-First)](#modo-1-instalación-local-bare-metal-sin-docker--offline-first)
     - [1.1. Modo Autónomo Offline-First (Solo Frontend / Persistencia Local)](#11-modo-autónomo-offline-first-solo-frontend--persistencia-local)
     - [1.2. Modo Full-Stack Bare-Metal (Frontend + Backend NestJS + PostgreSQL Local)](#12-modo-full-stack-bare-metal-frontend--backend-nestjs--postgresql-local)
   - [🐳 Modo 2: Despliegue con Docker & Docker Compose](#modo-2-despliegue-con-docker--docker-compose)
   - [🦭 Modo 3: Despliegue con Podman & Podman Compose (Rootless & Enterprise)](#modo-3-despliegue-con-podman--podman-compose-rootless--enterprise)
3. [🏛️ Módulos Funcionales del Sistema](#️-módulos-funcionales-del-sistema)
   - [🛒 1. Terminal de Mostrador & Punto de Venta (POS)](#1-terminal-de-mostrador--punto-de-venta-pos)
   - [🏛️ 2. Facturación Dual & Régimen Impositivo AFIP](#2-facturación-dual--régimen-impositivo-afip)
   - [📦 3. Catálogo, Inventario Multidepósito y Compras](#3-catálogo-inventario-multidepósito-y-compras)
   - [👥 4. CRM, Inteligencia de Clientes & Churn Scoring 360°](#4-crm-inteligencia-de-clientes--churn-scoring-360)
   - [🎟️ 5. Cupones de Fidelización y Cotizaciones Bimoneda (USD / ARS)](#5-cupones-de-fidelización-y-cotizaciones-bimoneda-usd--ars)
   - [🌐 6. Centro E-Commerce & Mercado Libre API](#6-centro-e-commerce--mercado-libre-api)
     - [🟡 Guía de Conexión: Mercado Libre API (MELI)](#guia-meli)
   - [💾 7. Carga Masiva (Excel / Sheets) & Backup Google Drive](#7-carga-masiva-excel--sheets--backup-google-drive)
     - [☁️ Guía de Configuración: Google Sheets & Google Drive](#guia-google-sheets)
   - [♿ 8. Accesibilidad Universal, Asistente de Voz y Adaptaciones WCAG 2.1 (AA/AAA)](#8-accesibilidad-universal-asistente-de-voz-y-adaptaciones-wcag-21-aaaa)
   - [⚙️ 9. Panel de Configuración Gráfica Integral (Moneda, TC Dólar, Empresa, AFIP, SMTP)](#9-panel-de-configuración-gráfica-integral-moneda-tc-dólar-empresa-afip-smtp)
   - [🏪 10. Multi-Tienda y Sucursales Comerciales Simples](#10-multi-tienda-y-sucursales-comerciales-simples)
   - [🔍 11. Motor de Búsqueda Natural Multicampo](#11-motor-de-búsqueda-natural-multicampo)
   - [💵 12. Control de Caja, Paneo en Tiempo Real y Arqueo Diario Z](#12-control-de-caja-paneo-en-tiempo-real-y-arqueo-diario-z)
4. [🛡️ Seguridad, Auditoría y Estándares OWASP Top 10](#️-seguridad-auditoría-y-estándares-owasp-top-10)
   - [Matriz de Roles y Permisos Granulares (RBAC)](#matriz-de-roles-y-permisos-granulares-rbac)
   - [Cumplimiento de Seguridad OWASP Top 10](#cumplimiento-de-seguridad-owasp-top-10)
   - [Bitácora Forense Criptográfica Inalterable (SHA-256 Ledger)](#bitácora-forense-criptográfica-inalterable-sha-256-ledger)
5. [🧪 Suite de Pruebas, Estrés y Rendimiento (186 Tests)](#-suite-de-pruebas-estrés-y-rendimiento-186-tests)
6. [⌨️ Atajos de Teclado del POS & Accesibilidad](#️-atajos-de-teclado-del-pos--accesibilidad)
7. [🧭 Mapa de Rutas de la Aplicación](#-mapa-de-rutas-de-la-aplicación)
8. [🏗️ Stack Tecnológico & Arquitectura](#️-stack-tecnológico--arquitectura)
9. [⚙️ Variables de Entorno](#️-variables-de-entorno)
10. [📄 Licencia](#-licencia)


---

## 📸 Demostración Visual

### 🎬 Recorrido Dinámico del Sistema (Animación)
![Recorrido del Sistema](docs/screenshots/demo.gif)

---

### 📊 Panel de Control Principal (Dashboard)
Métricas comerciales en tiempo real con **selector de horizonte temporal** (*Hoy*, *Ayer*, *7 días*, *Este Mes*, *30 días*, *Este Año* o *Rango Personalizado*), gráficos Recharts de facturación vs costo, margen de ganancia bruta, transacciones recientes clasificadas por régimen fiscal y alertas de reposición.
![Dashboard Principal](docs/screenshots/dashboard_view_1788544828180.jpg)

---

### 💵 Control de Caja, Paneo en Tiempo Real y Cierre Z Diarios
Panel en vivo de apertura y cierre de jornada: cálculo automático de **Saldo Teórico en Caja** (`Fondo Inicial + Cobros - Egresos`), registro cronológico de movimientos de caja chica y arqueo ciego o asistido con detección inmediata de **sobrantes o faltantes de efectivo**.
![Control de Caja y Cierre Z](docs/screenshots/cash_register_view.jpg)

---

### 🛒 Terminal POS con Facturación Dual & Descuento en Efectivo
Mostrador de alta velocidad: selector interactivo entre **Factura Oficial AFIP (Blanco)** y **Ticket Interno X (Negro)** con cálculo automático de **descuento por pago en efectivo (10% OFF)**, calculadora de vuelto al instante y envío de comprobantes por email.
![Terminal POS y Facturación Dual](docs/screenshots/pos_checkout_view.jpg)

---

### 🛡️ Bitácora Forense Criptográfica Inalterable (SHA-256 Ledger)
Registro encadenado (*blockchain-grade*) a prueba de manipulaciones o borrados: auditoría estricta de altas/bajas de usuarios, modificaciones de permisos, cobros de ventas, ajustes de stock y cierres de caja con hash criptográfico SHA-256 inmutable para peritajes fiscales.
![Bitácora Forense SHA-256](docs/screenshots/audit_bitacora_view.jpg)

---

### 📑 Cotizaciones Bimonetarias (USD / ARS) & Tasa Dólar en Vivo
Emisión de presupuestos en pesos o dólares con tipo de cambio pactado editable, cotizaciones oficiales y paralelas en vivo, congelamiento de precio con vigencia temporal (24h, 48h, 7d) y conversión a venta en 1 clic.
![Cotizaciones Bimonetarias y Dólar](docs/screenshots/quotes_dollar_view.jpg)

---

### 🏪 Gestión Multitienda, Sucursales y Transferencias de Stock
Administración centralizada de múltiples sucursales, locales comerciales y depósitos logísticos: asignación de puntos de venta AFIP por local, conmutador de tienda activa en el encabezado y transferencias atómicas de existencias.
![Gestión Multitienda y Sucursales](docs/screenshots/multistore_view.jpg)

---

### 📦 Catálogo de Productos y Control de Inventario
Vista de alta densidad para mostrador: códigos SKU, códigos de barras EAN-13, indicadores semafóricos de stock bajo, recálculo de márgenes comerciales y herramientas de ajuste masivo de precios.
![Catálogo e Inventario](docs/screenshots/inventory_catalog_view_1788544850147.jpg)

---

### 🔐 Inicio de Sesión y Control de Acceso RBAC
Acceso seguro mediante JSON Web Tokens (JWT), Refresh Tokens en cookies HttpOnly y asignación de permisos según el perfil (`Admin`, `Encargado`, `Vendedor`, `Depósito`).
![Pantalla de Login](docs/screenshots/login_page_1788544319949.jpg)

---

## ⚡ Guía Completa de Instalación y Despliegue

La plataforma ofrece tres modalidades de ejecución flexibles para adaptarse a cualquier entorno operativo (desde una netbook de mostrador sin internet hasta servidores empresariales en la nube):

```
                               ┌─────────────────────────────────┐
                               │   Métodos de Despliegue ERP     │
                               └────────────────┬────────────────┘
                                                │
         ┌──────────────────────────────────────┼──────────────────────────────────────┐
         ▼                                      ▼                                      ▼
  🖥️ MODO 1: Bare-Metal                  🐳 MODO 2: Docker                      🦭 MODO 3: Podman
  • Sin contenedores                     • docker compose up -d                 • podman-compose up -d
  • Offline-First o Local                • Contenedores Docker                  • Rootless & Daemonless
  • Node.js 20+ y pnpm                   • Desktop o Server                     • Enterprise / RHEL / Fedora
```

---

<a id="modo-1-instalación-local-bare-metal-sin-docker--offline-first"></a>
### 🖥️ Modo 1: Instalación Local Bare-Metal (Sin Docker / Offline-First)

Ideal para entornos donde no se puede o no se desea instalar Docker, equipos con recursos limitados o mostradores comerciales que requieran operar de forma 100% independiente.

#### Requisitos Previos:
- **Node.js** v20.x LTS o superior ([nodejs.org](https://nodejs.org/))
- **pnpm** v9.x o superior (`npm install -g pnpm`)
- **Git** ([git-scm.com](https://git-scm.com/))

---

#### 1.1. Modo Autónomo Offline-First (Solo Frontend / Persistencia Local)
No requiere base de datos externa ni backend activo. Todo el ERP (catálogo de artículos, punto de venta POS, cobros mixtos, descuentos en efectivo, presupuestos bimoneda, cupones, auditoría, reportes e importador masivo de Excel) opera de forma autónoma en el navegador mediante `localStorage` de alta velocidad.

```bash
# 1. Clonar el repositorio
git clone https://github.com/luchoxiii/GestionQuincaillerie.git
cd GestionQuincaillerie

# 2. Instalar dependencias del monorepo
pnpm install

# 3. Iniciar el frontend en desarrollo
pnpm --filter @ferreteria/web run dev
```

- **Acceso Web:** [http://localhost:5173](http://localhost:5173)
- **Credenciales Maestras:** Usuario: `admin` | Contraseña: `admin123` (o `admin`)

---

#### 1.2. Modo Full-Stack Bare-Metal (Frontend + Backend NestJS + PostgreSQL Local)
Para operar con persistencia relacional en disco sin virtualización de contenedores.

##### 1. Instalar Servicios en el Sistema Operativo:
- **PostgreSQL 16**: Descargar e instalar para tu sistema operativo (Windows, macOS, Ubuntu/Debian). Crear una base de datos llamada `ferreteria_db` y un usuario `ferreteria`.
- **Redis 7** *(opcional para caché)*: En Windows se puede utilizar [Memurai](https://www.memurai.com/) o WSL2; en Linux `sudo apt install redis-server`.

##### 2. Configurar el Archivo de Entorno:
Copia la plantilla `.env.example` en la raíz del proyecto y configura tus credenciales:
```bash
cp .env.example .env
```
Edita `.env` con la cadena de conexión de tu PostgreSQL local:
```env
DATABASE_URL="postgresql://ferreteria:tu_password_local@localhost:5432/ferreteria_db?schema=public"
REDIS_HOST=localhost
REDIS_PORT=6379
API_PORT=4000
FRONTEND_URL=http://localhost:5173
```

##### 3. Migrar Base de Datos y Cargar Semilla de Datos:
```bash
# Ejecutar migraciones de Prisma ORM (48 tablas relacionales)
pnpm --filter @ferreteria/api exec prisma migrate dev --name init

# Cargar catálogo base, listas de precios, categorías y usuarios de prueba
pnpm --filter @ferreteria/api exec ts-node prisma/seed.ts
```

##### 4. Iniciar Ambos Servicios:
```bash
# Terminal 1: Iniciar API Backend NestJS (puerto 4000)
pnpm --filter @ferreteria/api run start:dev

# Terminal 2: Iniciar Aplicación Web Frontend Vite (puerto 5173)
pnpm --filter @ferreteria/web run dev
```

- **Frontend SPA:** [http://localhost:5173](http://localhost:5173)
- **Backend API REST:** [http://localhost:4000/api](http://localhost:4000/api)
- **Swagger Docs:** [http://localhost:4000/api/docs](http://localhost:4000/api/docs)
- **Prisma Studio (Visor GUI de Base de Datos):** `pnpm --filter @ferreteria/api exec prisma studio` (acceso en [http://localhost:5555](http://localhost:5555))

---

<a id="modo-2-despliegue-con-docker--docker-compose"></a>
### 🐳 Modo 2: Despliegue con Docker & Docker Compose

La opción estándar recomendada para entornos de desarrollo y servidores con Docker. Levanta la infraestructura de **PostgreSQL 16 Alpine** y **Redis 7 Alpine** con volúmenes de almacenamiento persistente y healthchecks automatizados.

#### Requisitos Previos:
- **Docker Engine** v24+ y **Docker Compose v2** (o **Docker Desktop** en Windows/macOS)
- **Node.js** v20+ y **pnpm** v9+ (para ejecutar la app conectada a los contenedores)

#### Pasos de Ejecución:

```bash
# 1. Clonar el repositorio y acceder a la carpeta
git clone https://github.com/luchoxiii/GestionQuincaillerie.git
cd GestionQuincaillerie

# 2. Instalar dependencias del proyecto
pnpm install

# 3. Levantar los contenedores de infraestructura en segundo plano
docker compose up -d
```

> [!NOTE]
> `docker-compose.yml` expone **PostgreSQL 16** en el puerto `5432` y **Redis 7** en el puerto `6379`, persistiendo la información en los volúmenes nombrados `postgres_data` y `redis_data`.

```bash
# 4. Verificar que los contenedores estén saludables (healthy)
docker compose ps

# 5. Aplicar migraciones iniciales de Prisma
pnpm --filter @ferreteria/api exec prisma migrate dev --name init

# 6. Sembrar datos maestros del sistema
pnpm --filter @ferreteria/api exec ts-node prisma/seed.ts

# 7. Iniciar los servicios del ERP
# En una terminal (Backend):
pnpm --filter @ferreteria/api run start:dev

# En otra terminal (Frontend):
pnpm --filter @ferreteria/web run dev
```

#### Comandos Útiles de Docker:
```bash
# Ver registros (logs) de la base de datos en tiempo real
docker compose logs -f postgres

# Detener los contenedores sin perder los datos
docker compose stop

# Detener y destruir los contenedores conservando los volúmenes de datos
docker compose down

# Reiniciar los servicios
docker compose restart
```

---

<a id="modo-3-despliegue-con-podman--podman-compose-rootless--enterprise"></a>
### 🦭 Modo 3: Despliegue con Podman & Podman Compose (Rootless & Enterprise)

**Podman** es el motor de contenedores estándar en distribuciones empresariales basadas en Linux (Red Hat Enterprise Linux, Fedora, Rocky Linux, AlmaLinux, CentOS Stream, Debian y Ubuntu) que destaca por ser **100% libre de demonios (daemonless)** y ejecutarse **completamente en modo sin privilegios de root (Rootless)** para máxima seguridad informática.

#### Requisitos Previos:
- **Podman** v4.x o v5.x ([podman.io](https://podman.io/))
- **podman-compose** (`pip install podman-compose` o vía gestor de paquetes de la distro: `sudo dnf install podman-compose` / `sudo apt install podman-compose`)
- **Node.js** v20+ y **pnpm** v9+

#### Pasos de Ejecución con Podman:

```bash
# 1. Clonar e ingresar al proyecto
git clone https://github.com/luchoxiii/GestionQuincaillerie.git
cd GestionQuincaillerie

# 2. Instalar paquetes de Node.js
pnpm install

# 3. Levantar los servicios con podman-compose
podman-compose up -d

# (O si utilizas el plugin integrado de Podman 4+):
# podman compose up -d
```

#### 🛡️ Consideraciones Técnicas y Buenas Prácticas con Podman:

1. **Seguridad Rootless (Sin Root):**
   - Los contenedores se ejecutan bajo tu usuario del sistema operativo sin requerir `sudo`, eliminando riesgos de elevación de privilegios en el host.
   - Los puertos `5432` y `6379` son mayores a 1024, por lo que Podman Rootless los enlaza de inmediato sin configuraciones especiales en el kernel.

2. **Soporte de SELinux (RHEL / Fedora / CentOS):**
   - Si tu sistema tiene SELinux en modo `Enforcing`, Podman gestiona los volúmenes con aislamiento seguro. Si montas volúmenes de host directos, puedes añadir el sufijo `:Z` en `docker-compose.yml` para etiquetado automático de contexto SELinux.

3. **Uso Transparente mediante Alias:**
   Si estás habituado a los comandos de Docker, puedes definir los alias oficiales en tu `~/.bashrc` o `~/.zshrc`:
   ```bash
   alias docker=podman
   alias docker-compose=podman-compose
   ```

4. **Migraciones y Puesta en Marcha con Podman Activo:**
   ```bash
   # Aplicar las migraciones de Prisma hacia PostgreSQL corriendo en Podman
   pnpm --filter @ferreteria/api exec prisma migrate dev --name init
   pnpm --filter @ferreteria/api exec ts-node prisma/seed.ts

   # Iniciar Frontend y Backend en paralelo
   pnpm --filter @ferreteria/api run start:dev
   pnpm --filter @ferreteria/web run dev
   ```

5. **Comandos Útiles de Podman:**
   ```bash
   # Inspeccionar contenedores podman activos
   podman ps

   # Ver consumo de memoria y CPU en tiempo real
   podman stats

   # Inspeccionar logs de PostgreSQL
   podman logs -f ferreteria-postgres

   # Detener servicios
   podman-compose down
   ```

---


## 🏛️ Módulos Funcionales del Sistema

### 1. Terminal de Mostrador & Punto de Venta (POS)

![Terminal POS y Facturación Dual](docs/screenshots/pos_checkout_view.jpg)

Diseñado para soportar alta afluencia de clientes en mostrador con máxima velocidad operativa:

- **Operación 100% por Teclado**: Atajos universales de venta (`F2` buscar artículo, `F3` consultor de precios, `F4` cobrar, `Esc` cancelar/limpiar).
- **Lector de Código de Barras USB**: Hook global `useBarcodeScanner` que detecta disparos de lector óptico/láser instantáneamente sin necesidad de hacer clic sobre ningún campo de texto.
- **Consultor Rápido de Precios y Financiación (`F3`)**:
  - Modal accesible desde cualquier sección del ERP.
  - Tipografía gigante de alto contraste para informar al cliente desde el mostrador.
  - Cálculo automático del **10% OFF** por pago en efectivo/débito.
  - Simulador de cuotas (3 cuotas sin interés y 6 cuotas fijas).
  - Stock desglosado por depósito (Salón de Ventas vs Depósito Central).
  - Botón *"Cargar al Carrito (POS)"* para enviar el producto directamente a la venta en 1 clic.
- **Cobro Flexible y Pagos Combinados**:
  - Efectivo con calculadora de vuelto en vivo.
  - Tarjetas de Débito y Crédito con registro de cupón/lote.
  - Transferencia bancaria y cuenta corriente.
  - Cobros mixtos (ej. 50% efectivo y 50% transferencia).
- **💰 Facturación en Negro con Descuento en Efectivo**:
  - Al seleccionar la modalidad **Ticket X / Remito Interno (En Negro)**, el sistema permite activar automáticamente el **Descuento por Pago en Efectivo**.
  - Selector ágil de alícuotas de mostrador: **`5%`**, **`10%`** *(predeterminado)*, **`15%`** y **`20% OFF`**.
  - Recálculo instantáneo: descuenta el porcentaje sobre el subtotal de artículos, visualiza el monto exacto ahorrado por el cliente y actualiza el saldo restante y vuelto a entregar.
- **📧 Envío Automático de Comprobante por Email al Cliente**:
  - Si el cliente seleccionado posee correo electrónico registrado en su ficha (o si el cajero ingresa un correo ocasional), se despacha automáticamente el **comprobante digital de compra** al confirmar la operación.
  - Plantilla HTML profesional y responsiva con la razón social de la empresa, desglose de artículos, cantidades, precios unitarios, descuentos de mostrador, impuestos y medio de pago empleado.
- **Control de Crédito y Prevención Antifraude**:
  - Monitoreo en tiempo real del saldo de cuenta corriente del cliente y alerta si supera su límite de crédito.
  - **Bloqueo de Clientes Vetados**: Rechazo preventivo de cobro si el cliente fue inhabilitado por mora o cheques rechazados.
- **Emisión de Comprobantes Térmicos**: Formato de 80mm y 58mm optimizado para comandera térmica con impresión en 1 clic (`Ctrl+P`).

---

### 2. Facturación Dual & Régimen Impositivo AFIP

Permite operar bajo la realidad comercial de ferreterías y corralones con total transparencia administrativa:

- **Selector de Régimen al Cobrar**:
  - **🏛️ Factura Oficial AFIP (En Blanco)**: Emisión electrónica de **Factura A** (a clientes con CUIT / Responsable Inscripto) o **Factura B** (Consumidores Finales y Monotributistas) con **Código CAE oficial**, fecha de vencimiento y liquidación de Débito Fiscal IVA (21%, 10.5%, 27%).
  - **📋 Ticket X / Remito Interno (En Negro)**: Comprobante no fiscal para entrega de mercadería de mostrador. Descuenta stock físico y asienta el dinero en la caja del turno, con soporte para **descuento por pago en efectivo**, sin transmitirse a AFIP.
- **Descarga del Libro IVA Ventas para el Contador**:
  - Archivo CSV con codificación `UTF-8 con BOM` y delimitador `;` que contiene **estrictamente las operaciones en blanco con CAE**.
  - Columnas fiscales: Fecha, Tipo Comprobante, Punto de Venta, Número, Documento (CUIT/DNI), Razón Social, Neto Gravado, Alícuota, Débito Fiscal, Exento, Total Facturado, CAE y Vencimiento CAE.
- **Descarga de Comprobantes Internos (Ticket X)**: Archivo CSV independiente para auditoría de cajas físicas y conciliación de inventario.
- **Panel de Facturación (`/facturacion`)**: Métricas discriminadas por régimen, filtro por rango de fechas e impresión en formato A4 con código QR oficial AFIP.


---

### 3. Catálogo, Inventario Multidepósito y Compras

- **Catálogo Integral de Artículos**:
  - Auto-generación de SKU (`ART-XXXX`), código de barras EAN-13, marcas, unidades de medida y categorías jerárquicas.
  - Vinculación bidireccional entre **Costo de Reposición**, **Margen de Ganancia (%)** y **Precio de Venta al Público**.
  - Soporte de múltiples alícuotas de IVA (21%, 10.5%, 27%, Exento 0%).
  - **Actualización Masiva de Precios**: Aplicación de incrementos o descuentos porcentuales por rubro o marca en 1 clic.
- **Inventario Multidepósito y Kardex Inmutable**:
  - Existencias distribuidas entre Depósito Central, Salón de Ventas y sucursales.
  - Kardex cronológico inmutable (`StockMovement`): registra Entradas por Compras, Salidas por Ventas, Ajustes manuales y Transferencias.
  - Ajustes de inventario con justificación obligatoria para auditoría.
  - Transferencias entre depósitos con actualización atómica de existencias.
- **Compras a Distribuidores y Proveedores**:
  - Recepción de mercadería con incremento automático de existencias.
  - Opción de recálculo automático de precios de venta al variar los costos de compra.
  - Seguimiento de saldos en cuenta corriente de proveedores y módulo de órdenes de pago.

---

### 4. CRM, Inteligencia de Clientes & Churn Scoring 360°

Motor analítico avanzado que combina **segmentación RFM (Recencia, Frecuencia, Valor Monetario)**, **cálculo predictivo de Churn (riesgo de abandono del 0 al 100%)** y **estrategias automatizadas de fidelización**:

#### Segmentos Conductuales del Motor RFM:
| Segmento | Criterio Algorítmico | Perfil Comercial | Estrategia Recomendada |
| :--- | :--- | :--- | :--- |
| **🌟 VIP / Campeón** | LTV $\ge \$100.000$, $\ge 3$ órdenes, última compra $\le 35$ días | Máximo valor comercial. Compran seguido y pagan al día. | Trato preferencial, acceso prioritario a stock y bonificaciones premium. |
| **🏗️ Grandes Obras (B2B)** | Límite crédito $\ge \$300.000$ o Resp. Inscripto con LTV $> \$150.000$ | Constructoras y corralones con Factura A y cuenta corriente. | Precios de gremio, fletes programados y atención técnica dedicada. |
| **💎 Potencial Leal** | LTV $\ge \$40.000$, última compra $\le 45$ días | Profesionales (plomeros, electricistas) con alta frecuencia. | Programa de puntos, beneficios de mostrador y descuentos por volumen. |
| **⚠️ En Riesgo de Churn** | Riesgo Churn Alto o LTV $> \$30.000$ con $> 45$ días inactivo | Compradores habituales con retraso severo respecto a su ciclo. | Contacto preventivo urgente vía WhatsApp, bonificación en flete. |
| **💤 Hibernando / Inactivo** | $> 90$ días sin compras (abandono confirmado) | Cuentas inactivas en riesgo de pérdida definitiva. | Campaña agresiva de rescate con liquidaciones de temporada. |
| **🌱 Nuevo Prometedor** | Antigüedad $\le 45$ días con 1 o 2 compras | Altas recientes en etapa crítica de retención. | Kit de bienvenida comercial y asesoramiento en líneas de producto. |
| **🛒 Comprador Ocasional** | Compras esporádicas sin patrón definido | Clientes particulares de barrio para urgencias del hogar. | Promociones cruzadas en mostrador y combos de oferta. |

#### Capacidades de la Ficha 360° del Cliente:
- **Termómetro Predictivo de Abandono**: Score de 0 a 100% con barra de progreso y factores determinantes explícitos.
- **Acciones Comerciales Directas**:
  - Botón *"Cobrar en POS con Cupón"*: Abre el mostrador con el cliente seleccionado y el beneficio precargado.
  - Botón *"Activar Campaña con Cliente"*: Abre directamente un chat de WhatsApp Web (`wa.me/549...`) con un mensaje estructurado con el nombre del cliente y su cupón exclusivo.
- **Exportación de Datasets Machine Learning (`exportMLDatasetCsv`)**: 22 variables estructuradas con columna target `is_churned_target` (0/1) lista para entrenar modelos predictivos en Scikit-Learn o XGBoost.
- **Exportación de Audiencias de Marketing (`exportMarketingAudienceCsv`)**: Listas de contacto con celular, email, categoría preferida y recomendación táctica de retención.

---

### 5. Cupones de Fidelización y Cotizaciones con Validez

#### Motor de Cupones (`/clientes/perfiles` - Pestaña Cupones):
- Creación de promociones en porcentaje (`% OFF`) o monto fijo en pesos (`$ OFF`).
- Segmentación por grupo RFM (*VIP*, *Grandes Obras*, *Nuevos*, *En Riesgo*, *Todos*).
- Restricciones: compra mínima, tope de bonificación, límite de canjes y fecha de vencimiento.
- Canje en el POS con prorrateo impositivo exacto respetando alícuotas de IVA.

#### Presupuestos y Cotizaciones Bimoneda (`/presupuestos`):

![Cotizaciones Bimonetarias y Dólar](docs/screenshots/quotes_dollar_view.jpg)

- **💵 Cotizaciones en Dólares (USD) y Pesos (ARS)**:
  - Selector ágil de moneda base (`ARS ($)` vs `USD (US$)`) al emitir una cotización.
  - **Tipo de Cambio Pactado Editable**: Precarga automáticamente el dólar de referencia configurado para la empresa (ej. `$1.350 / USD`) permitiendo negociar o congelar un tipo de cambio específico por cliente u obra.
  - Conversión de precios de catálogo a USD en tiempo real y cálculo del total en dólares con su equivalente exacto en pesos argentinos.
- **🔍 Inspección y Búsqueda de Cotizaciones por Cliente**:
  - Buscador universal por cliente, CUIT/DNI, teléfono o número de cotización.
  - **Acceso Directo desde la Ficha 360° del Cliente (`/clientes`)**: Botón *"Ver Cotizaciones"* en el perfil del cliente que navega directamente a sus presupuestos históricos y activos.
  - Distintivos visuales en la tabla de cotizaciones (`USD` vs `ARS`), total principal y total secundario con tasa de cambio (`Equiv. $434.511 (TC: $1.350)`).
- **⏳ Congelamiento de Precios con Validez Temporal**: Presets de 24h, 48h, 7 días, 15 días o 30 días.
- **🚦 Semáforo Inteligente de Vigencia**: Verde (vigente con horas restantes), Amarillo (vence hoy, &lt; 12 hs), Rojo (vencido), Azul (convertido a venta).
- **📲 Envío Directo por WhatsApp con Totales Duales**: Mensaje estructurado con emojis que detalla ítems, precios unitarios en dólares o pesos, tipo de cambio pactado y el doble total (USD y su equivalente en pesos).
- **📄 Impresión Formal A4 para Obras**: Membrete comercial con cuadro de equivalencia de divisas, tipo de cambio pactado, condiciones de obra y cuadro de conformidad para firma y sello.
- **⚡ Conversión Directa a Venta POS**: Botón *"Cobrar en POS"* que reconvierte automáticamente los precios acordados en dólares al equivalente en pesos según la tasa acordada y los carga al carrito de mostrador sin recálculos manuales.


---

### 6. Centro E-Commerce & Mercado Libre API

Módulo omnicanal para gestionar ventas digitales, sincronizar existencias y despachar paquetes:

- **Canales Integrados**: Mostrador POS, Mercado Libre, Tienda Web propia, WhatsApp y ventas telefónicas.
- **Centro Logístico (`/ecommerce`)**:
  - Filtro por canal y pestaña prioritaria de **Pendientes de Despacho**.
  - Generador de **Rótulos y Etiquetas Térmicas 10x15 cm** con código de barras, guía de seguimiento y datos del comprador.
  - Actualización de estados logísticos: *Preparando*, *Listo para despachar*, *En tránsito*, *Entregado*.

```
[ Comprador en Mercado Libre ]
              │ (Compra y abona)
              ▼
[ Mercado Libre API ]
              │ (Notificación instantánea Webhook IPN)
              ▼
[ ERP Backend: POST /api/ecommerce/meli/webhook ]
              │ (Consulta orden: GET /orders/{id})
              ▼
[ Procesamiento del Pedido ]
  ├─ 1. Mapeo con catálogo del ERP mediante SKU / Código de Barras
  ├─ 2. Descuento atómico de stock físico en Depósito
  ├─ 3. Cálculo de comisión de Mercado Libre (fee) e importe neto
  ├─ 4. Generación de orden externa (#MELI-XXXXXXXX)
  └─ 5. Impacto en tiempo real en base de datos
              │
              ▼
[ Frontend ERP ]
  ├─ 📦 Centro E-commerce (/ecommerce): Pestaña Mercado Libre y Envíos Pendientes
  ├─ 🏷️ Etiqueta Térmica 10x15 cm para el paquete
  ├─ 🧾 Factura Electrónica AFIP A / B oficial con CAE en 1 clic
  └─ 📊 Dashboard Principal: Alerta de paquetes pendientes por despachar
```

<a id="guia-meli"></a>
#### 🟡 Guía Paso a Paso: Cómo Conectar la Cuenta de Mercado Libre (MELI API)

Para que las ventas realizadas en tu cuenta de Mercado Libre ingresen automáticamente al ERP, descuenten existencias en tiempo real y se puedan facturar y despachar con etiqueta térmica, sigue este instructivo oficial:

##### Paso 1: Crear una Aplicación en Mercado Libre Developers
1. Ingresa al portal oficial: **[developers.mercadolibre.com.ar](https://developers.mercadolibre.com.ar/)** (o el dominio correspondiente a tu país: `.com.br`, `.com.mx`, `.com.co`, `.cl`, etc.).
2. Inicia sesión con la cuenta de Mercado Libre de la empresa o negocio.
3. Dirígete a **"Mis Aplicaciones"** y haz clic en **"Crear Aplicación"**.
4. Completa los datos requeridos:
   - **Nombre de la Aplicación**: `Ferreteria-ERP` (o el nombre comercial de tu negocio).
   - **Nombre Corto**: `ferreteria-erp`.
   - **Descripción**: *Sistema de gestión de inventario multidepósito, facturación AFIP y sincronización de ventas.*
   - **Categoría**: *ERP / Gestión Comercial*.
   - **URL de Redirección (Redirect URI)**:
     - En desarrollo local: `http://localhost:4000/api/ecommerce/meli/callback`
     - En producción: `https://erp.tuferreteria.com/api/ecommerce/meli/callback`
   - **Permisos / Scopes Requeridos**:
     - ✅ `read`: Permite leer publicaciones, preguntas, compradores y órdenes de venta.
     - ✅ `write`: Permite pausar publicaciones, modificar existencias y responder mensajes.
     - ✅ `offline_access`: Permite obtener un `refresh_token` permanente para renovar la sesión en segundo plano sin pedir login manual cada día.
   - **Tópicos de Notificación IPN (Webhooks en Vivo)**:
     - Selecciona: `orders_v2` (compras pagadas), `shipments` (etiquetas y envíos Flex/Mercado Envíos) e `items` (cambios de catálogo).
     - **URL de Notificaciones (Webhook Endpoint)**:
       - En desarrollo: `https://tu-tunel-ngrok.app/api/ecommerce/meli/webhook`
       - En producción: `https://erp.tuferreteria.com/api/ecommerce/meli/webhook`
5. Guarda la aplicación y copia los valores generados en pantalla:
   - **`App ID`** (Identificador numérico de la aplicación).
   - **`Client Secret`** (Clave secreta alfanumérica).

##### Paso 2: Configurar las Credenciales en el Archivo `.env`
En el archivo `.env` en la raíz (o en `apps/api/.env`):
```env
# ==========================================
# Integración Oficial con Mercado Libre API
# ==========================================
MELI_APP_ID=1234567890123456
MELI_CLIENT_SECRET=tu_clave_secreta_proporcionada_por_meli
MELI_REDIRECT_URI=http://localhost:4000/api/ecommerce/meli/callback
MELI_WEBHOOK_SECRET=tu_firma_secreta_para_validar_webhooks
MELI_SELLER_ID=987654321
```

> [!TIP]
> Para consultar tu `MELI_SELLER_ID`, inicia sesión en Mercado Libre y visita tu perfil de vendedor, o ejecuta una consulta autenticada a `GET https://api.mercadolibre.com/users/me`.

##### Paso 3: Autorizar la Aplicación (Vinculación OAuth 2.0 en 1 Clic)
Para otorgar acceso al ERP a tu cuenta de Mercado Libre por primera vez:
1. Abre en tu navegador la URL de autorización oficial (reemplazando `TU_MELI_APP_ID` y `TU_MELI_REDIRECT_URI`):
   ```text
   https://auth.mercadolibre.com.ar/authorization?response_type=code&client_id=TU_MELI_APP_ID&redirect_uri=TU_MELI_REDIRECT_URI
   ```
2. Mercado Libre solicitará confirmación: *"¿Deseas autorizar a Ferreteria-ERP a acceder a tu cuenta?"*.
3. Al hacer clic en **"Permitir"**, serás redirigido al callback de tu ERP:
   ```text
   http://localhost:4000/api/ecommerce/meli/callback?code=TG-64a1b2c3d4e5f6...
   ```
4. El backend del ERP intercambia automáticamente ese `code` por el `access_token` (vigencia de 6 horas) y el `refresh_token` permanente, almacenándolos de forma cifrada en la base de datos. Un worker en segundo plano renueva el token automáticamente antes de su vencimiento.

##### Paso 4: Cómo el Sistema Procesa y Sincroniza las Ventas
- **Recepción Automática en Tiempo Real**: Al momento exacto en que entra una venta en Mercado Libre, la plataforma envía un webhook IPN (`orders_v2`). El ERP consulta la orden, descuenta de inmediato las existencias físicas del catálogo y registra el pedido con el usuario comprador (`buyer_nickname`), comisiones y datos de entrega.
- **Sincronización Manual en 1 Clic**: Desde el **Centro E-Commerce (`/ecommerce`)**, haz clic en el botón superior **"Sincronizar Pedidos"** para consultar la API de MELI y traer cualquier venta realizada mientras el servidor estuvo sin conexión.

##### Paso 5: Gestión de Envíos y Facturación
- En **/ecommerce** (Pestaña *"🚚 Pendientes de Despacho"*), haz clic en el botón **"Rótulo"** para imprimir la **Etiqueta Térmica 10x15 cm** con código de barras y número de guía de seguimiento para pegar en el paquete.
- En **/ventas**, cada venta de Mercado Libre aparece distinguida con un badge amarillo `🟡 Mercado Libre` y permite emitir la **Factura Electrónica AFIP oficial (Factura A o B)** con CAE en 1 clic.

---

### 7. Carga Masiva (Excel / Sheets) & Backup Google Drive

Herramientas para puesta en marcha veloz y resguardo seguro de la información sin intermediarios:

#### 📦 Carga Masiva de Productos y Clientes:
- **Formatos Compatibles**: `.xlsx`, `.xls` y `.csv`.
- **Descarga de Plantillas Oficiales con Fórmulas**: Botones de 1 clic para descargar `plantilla_productos_ferreteria.xlsx` y `plantilla_clientes_ferreteria.xlsx`.
- **Reconocimiento Inteligente de Encabezados**: Mapea automáticamente variaciones de columnas en español (*Código*, *SKU*, *Nombre*, *Costo*, *Margen %*, *Precio Venta*, *Stock*, *Barras*, *CUIT/DNI*).
- **Previsualización con Semáforo**: Valida cada fila en tiempo real (verde: apto, rojo: detalle del error) sin trabar el procesamiento de las demás.
- **Control de Duplicados**: Opción mediante switch para actualizar precios/stock de registros existentes o agregar exclusivamente novedades.

#### 💾 Copias de Seguridad Locales y Google Drive:
- **Snapshot Completo del ERP**: Respaldo integral en archivo JSON firmado con las **15 colecciones de datos** (Productos, Clientes, Ventas, Cotizaciones, Cajas y Turnos, Movimientos, Proveedores, Compras, Categorías, Marcas, Depósitos, Auditoría, Configuración, Impuestos y Unidades).
- **Descarga & Restauración Offline**: Archivo descargable `ferreteria_erp_backup_YYYY-MM-DD.json` con restauración validada en 1 clic.
- **Sincronización en la Nube con Google Drive**:
  - Conexión OAuth2 segura restringida al scope `https://www.googleapis.com/auth/drive.file`.
  - Creación automática de la carpeta `Ferreteria_ERP_Backups` en la raíz de Google Drive.
  - Subida multipart directa (RFC 2387) sin servidores intermediarios.
  - Listado de copias en la nube y restauración remota directa.

```
[ Navegador / Mostrador ERP ]
             │
             ├─► 📥 Descarga de Plantilla Oficial (.xlsx / .csv)
             │        │
             │        ▼
             │   [ Google Sheets ] ◄── Edición colaborativa con proveedores y equipo
             │        │
             │        ▼ (Descargar como .xlsx o .csv)
             ├─► 📤 Importación Masiva en /productos o /clientes (validación y carga en 1 clic)
             │
             └─► ☁️ Copia de Seguridad en la Nube (OAuth 2.0)
                      │
                      ▼ (Google Drive REST API v3 - Subida Multipart)
                 [ Carpeta: Ferreteria_ERP_Backups ]
                      ├─ backup_ferreteria_2026-09-10.json
                      ├─ backup_ferreteria_2026-09-11.json
                      └─ Historial descargable y restauración remota con 1 clic
```

<a id="guia-google-sheets"></a>
#### ☁️ Guía Paso a Paso: Cómo Configurar Google Sheets y Google Drive para Backup y Carga Masiva

Para habilitar las copias de seguridad automáticas en la nube de Google Drive y trabajar de manera colaborativa con hojas de cálculo de **Google Sheets**, sigue este instructivo oficial de Google Cloud:

##### Paso 1: Crear un Proyecto en Google Cloud Console
1. Ingresa a la consola oficial de Google Cloud: **[console.cloud.google.com](https://console.cloud.google.com/)**.
2. Inicia sesión con la cuenta de Google de la empresa o negocio.
3. En la barra superior, haz clic en el selector de proyectos y presiona **"Nuevo Proyecto"**.
4. Asigna un nombre descriptivo (por ejemplo: `Ferreteria-ERP-Backup`) y haz clic en **Crear**.

##### Paso 2: Habilitar las APIs de Google Drive y Google Sheets
1. En el menú de navegación lateral (icono ☰), ingresa a **"APIs y servicios" > "Biblioteca"**.
2. En la barra de búsqueda escribe **Google Drive API**, selecciónala y haz clic en **Habilitar**.
3. Vuelve a la biblioteca, busca **Google Sheets API**, selecciónala y haz clic en **Habilitar**.

##### Paso 3: Configurar la Pantalla de Consentimiento OAuth
1. En el menú lateral, dirígete a **"APIs y servicios" > "Pantalla de consentimiento de OAuth"**.
2. Selecciona tipo de usuario: **Externo** y haz clic en **Crear**.
3. Completa los datos requeridos:
   - **Nombre de la aplicación**: `Ferretería ERP Backup`.
   - **Correo de asistencia al usuario**: Tu dirección de correo de Google.
   - **Correo de contacto del desarrollador**: Tu dirección de correo.
4. En el apartado **Permisos / Scopes**, presiona **"Agregar o quitar permisos"** e incorpora:
   - `https://www.googleapis.com/auth/drive.file` *(Permite que el ERP cree, lea y guarde únicamente sus propios respaldos en Drive, sin acceder a tus archivos privados)*.
5. En la sección **Usuarios de prueba**, agrega tu dirección de correo de Google (con la que autorizarás las copias) y guarda los cambios.

##### Paso 4: Crear el ID de Cliente OAuth 2.0 (Aplicación Web)
1. En el menú lateral, dirígete a **"APIs y servicios" > "Credenciales"**.
2. Haz clic en **"+ Crear credenciales"** y selecciona **"ID de cliente de OAuth"**.
3. En **Tipo de aplicación**, elige: **Aplicación web**.
4. Nombre: `Ferretería Web Client`.
5. En **Orígenes autorizados de JavaScript**, añade:
   - `http://localhost:5173` (Entorno de desarrollo local)
   - `https://tu-dominio.com` (Si tienes el sistema alojado en un dominio propio o VPS)
6. En **URIs de redireccionamiento autorizados**, añade:
   - `http://localhost:5173/configuracion`
   - `https://tu-dominio.com/configuracion`
7. Haz clic en **Crear**. Se mostrará una ventana con tu **ID de cliente** (formato: `XXXXXXXXXXXX-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX.apps.googleusercontent.com`). Cópialo.

##### Paso 5: Vincular el ID de Cliente en el ERP
Dispones de dos formas sencillas para configurarlo:
- **Desde la Pantalla de Configuración (Recomendada)**:
  1. En el ERP, ve a **Configuración (`/configuracion`)** y abre la pestaña **"Copias de Seguridad & Google Drive"**.
  2. Pega tu **ID de Cliente (Client ID)** en el campo correspondiente y haz clic en **"Guardar Configuración"**.
  3. Presiona el botón **"Conectar con Google"**: se abrirá la ventana oficial de Google para autorizar la vinculación en 1 clic.
  4. Al hacer clic en **"Subir Respaldo Ahora"**, el sistema creará automáticamente la carpeta `Ferreteria_ERP_Backups` en tu Google Drive y subirá el snapshot completo.
- **Desde el archivo de entorno (`.env`)**:
  En `apps/web/.env` (o `.env` en la raíz):
  ```env
  VITE_GOOGLE_CLIENT_ID=XXXXXXXXXXXX-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX.apps.googleusercontent.com
  ```

##### Paso 6: Cómo Trabajar y Sincronizar con Google Sheets
1. **Descargar Plantilla Oficial**: En **/productos** o **/clientes**, haz clic en el botón verde *"Importar Excel"* y descarga `plantilla_productos_ferreteria.xlsx` o `plantilla_clientes_ferreteria.xlsx`.
2. **Abrir en Google Sheets**: Sube la plantilla a tu Google Drive y ábrela como hoja de cálculo de Google Sheets.
3. **Edición Colaborativa**: Comparte la planilla con tu equipo o distribuidores para completar artículos, códigos de barra, alícuotas de IVA y márgenes de ganancia con fórmulas automáticas.
4. **Exportar y Cargar al ERP**:
   - En Google Sheets, ve a **Archivo > Descargar > Microsoft Excel (.xlsx)** o **Valores separados por comas (.csv)**.
   - Arrastra el archivo en el modal de importación del ERP: el sistema validará todas las filas con un semáforo interactivo (verde/rojo) y te permitirá actualizar artículos existentes o dar de alta únicamente los nuevos.

---

### 8. Accesibilidad Universal, Asistente de Voz y Adaptaciones WCAG 2.1 (AA/AAA)

El sistema incorpora un ecosistema integral de accesibilidad diseñado para garantizar la igualdad de oportunidades y la inclusión laboral plena de personas con discapacidades visuales, auditivas, motoras o del neurodesarrollo (dislexia, TDAH), cumpliendo las directrices internacionales **WCAG 2.1 niveles AA y AAA**.

Se accede de forma global en cualquier pantalla presionando el botón **"Accesibilidad"** en el encabezado o mediante el atajo de teclado **`Alt + A`**. Las preferencias se guardan de forma instantánea y persistente en el navegador del operador (`localStorage`).

```
       [ Centro de Accesibilidad & Inclusión — Alt + A ]
                             │
     ┌───────────────────────┼───────────────────────┬───────────────────────┐
     ▼                       ▼                       ▼                       ▼
👁️ Adaptaciones         📖 Lectura,             🔊 Audio & Asistente    ⌨️ Movilidad &
   Visuales                 Cognición & Calma       de Voz en Español       Navegación Teclado
  ├─ Amarillo s/Negro      ├─ Fuente OpenDyslexic   ├─ Bip láser (C6)       ├─ Foco ultra-visible
  │  (WCAG AAA 21:1)       │  (anti-rotación)       ├─ Éxito armónico       │  (amarillo/negro)
  ├─ Modo Oscuro Contraste ├─ Regla Guía de         │  (C5-E5-G5)           ├─ Enlace de salto
  ├─ Zoom (100% a 150%)    │  Lectura Horizontal    ├─ Alerta descendente   │  ("Skip to content")
  ├─ Daltonismo (4 filtros)├─ Reducción total de    ├─ Locución de precios  └─ Atajos de 1 tecla
  └─ Cursor Gigante 32px   │  animaciones           │  (Consultor F3)          (F2, F3, F4, Esc)
                           └─ Espaciado extendido   └─ Lectura de pantalla
                                                       (Alt + S)
```

#### 👁️ 1. Adaptaciones Visuales de Alto Contraste y Daltonismo
- **Modo Amarillo sobre Negro (WCAG AAA)**: Relación de contraste superior a 21:1, diseñada específicamente para personas con baja visión severa, cataratas o fotofobia. Los botones, bordes y datos numéricos se renderizan en amarillo puro `#facc15` sobre negro azabache `#000000`.
- **Modo Oscuro de Alto Contraste & Modo Claro Limpio**: Paletas optimizadas sin degradados tenues ni grises de baja legibilidad.
- **Escalado Tipográfico Dinámico**: 4 niveles de escala (`100% Normal`, `115% Grande`, `130% Muy Grande`, `150% Gigante`) aplicados mediante variables CSS escalares sin romper la disposición de columnas ni provocar desbordamientos horizontales.
- **Filtros Especializados para Daltonismo (Matrices SVG de Cono de Color)**:
  - **Protanopía**: Ajuste para deficiencia de conos rojos.
  - **Deuteranopía**: Ajuste para deficiencia de conos verdes (daltonismo más común).
  - **Tritanopía**: Ajuste para deficiencia de conos azules/amarillos.
  - **Acromatopsia**: Monocromatismo y escala de grises calibrada.
- **Puntero y Cursor de Alta Visibilidad**: Sustituye el cursor estándar por un puntero gigante de 32x32 píxeles con contorno amarillo de alto contraste para operadores con dificultades en el seguimiento del mouse.

#### 📖 2. Lectura, Soporte para Dislexia y Reducción de Fatiga Cognitiva
- **Tipografía para Dislexia**: Alterna la interfaz hacia una tipografía sans con mayor peso en la base de cada glifo, evitando la rotación visual involuntaria de caracteres como `b/d`, `p/q` y `n/u`, incrementando el espaciado entre letras (`0.06em`) e interlineado (`1.75`).
- **Regla Guía de Lectura Horizontal**: Herramienta interactiva flotante que sigue suavemente el movimiento vertical del mouse resaltando la fila activa y oscureciendo las filas periféricas, ideal para auditar tablas densas de facturación, compras y catálogo sin saltar de línea.
- **Modo de Calma y Reducción de Movimiento**: Inhabilita instantáneamente transiciones, rebotes y animaciones decorativas (`prefers-reduced-motion`), previniendo mareos, migrañas o sobrecarga vestibular.

#### 🔊 3. Audio Táctico y Asistente Vocal en Español (100% Offline)
- **Síntesis de Audio Pura (Web Audio API)**: Genera tonos puros en tiempo real utilizando osciladores del navegador sin descargar archivos MP3 ni depender de internet:
  - **Bip Láser (1046.5 Hz - Do6)**: Confirmación auditiva nítida idéntica a lectores de mostrador al escanear un código de barras en POS.
  - **Tríada de Éxito (Do-Mi-Sol / 523 Hz, 659 Hz, 784 Hz)**: Tono musical armónico al completar una venta o registrar un cobro.
  - **Alerta Doble Descendente (440 Hz a 330 Hz)**: Advertencia clara si un cliente está vetado, si el monto abonado es insuficiente o ante errores.
- **Asistente de Voz en Español (Web Speech API)**:
  - **Consultor F3**: Vocaliza de inmediato el nombre del artículo, el precio en Pesos Argentinos y el stock disponible (*"Amoladora Bosch 750W. Precio: $45.000 pesos. Stock disponible: 12 unidades"*). Incluye botón manual **"Escuchar"** para reproducción a demanda.
  - **Cierre de Venta POS**: Anuncia el total cobrado y el vuelto a entregar al comprador (*"Venta cobrada con éxito. Total: $12.500 pesos. Vuelto a entregar: $2.500 pesos"*).
  - **Resumen de Pantalla (`Alt + S`)**: Lee en voz alta el título del módulo actual y su estado para operadores invidentes.

---

### 9. Panel de Configuración Gráfica Integral (`/configuracion`)

Módulo administrativo centralizado con interfaz visual organizada en cuatro pestañas de gestión:

#### 🟡 1. Pestaña Mercado Libre (`MeliSettingsTab.tsx`)
- **Gestión Visual de Credenciales API**:
  - `App ID / Client ID` y `Client Secret` (con botón para alternar visibilidad de contraseña).
  - `Seller ID` oficial de la cuenta de vendedor en Mercado Libre.
  - `Webhook Secret` / Firma IPN para verificación criptográfica de notificaciones.
  - `Redirect URI` pre-configurada con botón de copiado al portapapeles en 1 clic.
- **Entorno Operativo**:
  - Switch interactivo para alternar entre **Modo Sandbox (Pruebas)** y **Modo Producción**.
  - Switch para **Sincronización Automática de Pedidos**.
- **Herramientas de Diagnóstico**:
  - Botón **"Probar Conexión con MELI"**: valida credenciales en tiempo real y muestra badge dinámico de estado.
  - Botón **"Vincular Cuenta (OAuth en 1 Clic)"**: inicia el flujo oficial de consentimiento y autorización de Mercado Libre.
  - Acceso directo integrado en el **Centro E-Commerce (`/ecommerce`)**.

#### 📧 2. Pestaña Correo Corporativo & Notificaciones (`EmailSettingsTab.tsx`)
- **Parámetros del Servidor SMTP**:
  - Host SMTP (ej. `smtp.gmail.com`, `smtp.office365.com` o servidor privado corporativo).
  - Puerto de conexión (`587`, `465`, `25`) y protocolo de seguridad (`STARTTLS`, `SSL/TLS`, `Ninguno`).
  - Usuario de autenticación y Contraseña de Aplicación / Token.
  - Nombre de remitente visible (*"Ferretería Central - Facturación"*) y correo de salida (*From Email*).
  - Casilla de Copia Oculta (*BCC*) para resguardo administrativo de cada comprobante emitido.
- **Automatización de Facturación**:
  - Switch para **envío automático de comprobantes a clientes** tras confirmar ventas en mostrador.
  - Generación de **plantillas HTML profesionales y responsivas** con detalle de artículos, alícuotas de IVA y descuentos de mostrador.
- **Herramientas en Vivo**:
  - Panel interactivo para **"Enviar Correo de Prueba"** a cualquier dirección para validar conectividad SMTP.
  - Historial de los últimos comprobantes despachados con fecha y estado de entrega.

#### ☁️ 3. Pestaña Google Drive & Backups (`BackupSettingsTab.tsx`)
- Carga y validación de `Client ID` OAuth de Google Cloud (`VITE_GOOGLE_CLIENT_ID`).
- Vinculación en 1 clic mediante ventana emergente OAuth2 segura (scope `drive.file`).
- Resguardo y restauración remota de snapshots integrales con las 15 colecciones de datos del ERP.

#### 🏢 4. Pestaña Empresa
- **Datos Fiscales del Negocio**: Razón Social, CUIT, Domicilio Comercial, Punto de Venta y logotipo corporativo.
- **🪙 Moneda Comercial & Formato Regional**:
  - Selector de moneda activa con impacto global en todo el sistema (mostrador POS, comprobantes, facturación, comanderas térmicas, reportes y síntesis de voz a11y).
  - **Presets Preconfigurados de Monedas**:
    - **ARS ($)** — Peso Argentino (`es-AR`, 2 decimales).
    - **USD (US$)** — Dólar Estadounidense (`en-US`, 2 decimales).
    - **EUR (€)** — Euro (`es-ES`, 2 decimales).
    - **CLP ($)** — Peso Chileno (`es-CL`, 0 decimales).
    - **UYU ($U)** — Peso Uruguayo (`es-UY`, 2 decimales).
    - **BRL (R$)** — Real Brasileño (`pt-BR`, 2 decimales).
    - **PYG (Gs.)** — Guaraní Paraguayo (`es-PY`, 0 decimales).
    - **COP ($)** — Peso Colombiano (`es-CO`, 0 decimales).
    - **MXN ($)** — Peso Mexicano (`es-MX`, 2 decimales).
    - **PEN (S/)** — Sol Peruano (`es-PE`, 2 decimales).
    - **Personalizada**: Permite especificar libremente el Código ISO (ej. `BOB`), Símbolo de Mostrador (ej. `Bs.`), Locale regional (`es-BO`) y cantidad de decimales (`0` a `4`).
  - **Caja de Vista Previa Interactiva en Vivo (Live Preview)**: Muestra en tiempo real cómo se renderizan los precios de ejemplo (ej. `$ 12.450,50` o `US$ 12,450.50`) al modificar cualquier parámetro.
  - **Sincronización en Caliente**: Actualización inmediata en memoria (`syncCurrencyCache()`) y persistencia local sin requerir reinicios de servidor ni recargar la pestaña del navegador.

#### 🏪 10. Multi-Tienda y Sucursales Comerciales Simples
- **Administración Sencilla de Sucursales (`StoresSettingsTab.tsx`)**:
  - Alta, edición y desactivación rápida de puntos de venta y sucursales comerciales.
  - Configuración de **Punto de Venta AFIP (4 dígitos)** por local (ej. `0001`, `0002`).
  - Definición de Casa Central / Sucursal Principal (`isMain`).
  - Asignación de Encargado, Dirección física, Teléfono y Email de contacto.
- **Selector de Tienda Activa en Barra Superior (Store Switcher)**:
  - Selector accesible en el encabezado global para conmutar de sucursal con un solo clic.
  - Muestra visual del local activo y su punto de venta de facturación (`PV:0001`).
  - Vinculación automática con depósitos de inventario para control de stock localizado.

![Gestión Multitienda y Sucursales](docs/screenshots/multistore_view.jpg)

#### 🔍 11. Motor de Búsqueda Natural Multicampo
Permite a cualquier operador buscar artículos, clientes y usuarios escribiendo de forma coloquial tal como habla o recuerda un dato:
- **Lematización en Español (Plurales y Flexiones)**:
  - Resuelve automáticamente equivalencias de plurales y singulares (*"clavos"* ⇄ *"clavo"*, *"tornillos"* ⇄ *"tornillo"*, *"pinturas"* ⇄ *"pintura"*, *"arandelas"* ⇄ *"arandela"*).
- **Normalización Fonética y Sin Tildes**:
  - Elimina diacríticos y homogeneíza mayúsculas/minúsculas (*"eléctrico"* = *"electrico"*, *"cañón"* = *"canon"*, *"gómez"* = *"gomez"*).
- **Emparejamiento Multicampo por Tokens (Multi-Token Matching)**:
  - Al escribir frases como *"taladro percutor 700w bosch"*, el motor tokeniza cada término y exige coincidencia en cualquier combinación de campos del artículo (Nombre, Marca, SKU, Código de Barras, Categoría o Descripción).
- **Búsqueda Natural de Clientes**:
  - Búsqueda simultánea por Razón Social, Nombre de Fantasía, CUIT/CUIL (con o sin guiones), DNI, Domicilio, Localidad, Teléfono, Correo o Condición Fiscal.
- **Búsqueda Natural de Usuarios y Operadores**:
  - Filtro ágil por Nombre, Apellido, Nombre de Usuario, Correo Corporativo o Rol asignado (`ADMIN`, `VENDEDOR`, `ENCARGADO`, `DEPOSITO`).
- **Autonomía Offline**:
  - Funciona de forma 100% nativa en memoria (`packages/shared/src/utils/natural-search.ts`), asegurando respuestas en microsegundos tanto en el navegador como en el backend.

#### 💵 12. Control de Caja, Paneo en Tiempo Real y Arqueo Diario Z
Módulo integral de control de efectivo para mostrador comercial (`/caja`):

![Control de Caja y Cierre Z](docs/screenshots/cash_register_view.jpg)

- **Apertura de Turno & Jornada**:
  - Asignación de la terminal/caja de cobro (ej. *Caja Principal 01*, *Caja Mostrador 02*).
  - Registro de **Fondo Inicial de Cambio** (efectivo base entregado al cajero para dar vuelto).
  - Sello temporal con fecha y hora de inicio de operaciones.
- **Paneo y Monitoreo en Tiempo Real**:
  - **4 Tarjetas de Control en Vivo**:
    - *Estado de Turno* (Abierto / Cerrado con cronómetro de actividad).
    - *Fondo Inicial* de cambio.
    - *Ingresos (+) y Egresos (-)* acumulados durante la jornada.
    - *Saldo Teórico en Caja*: Cálculo exacto `Fondo Inicial + Cobros POS - Salidas Manuales`. Indica al centavo cuánto efectivo debe existir en el cajón de dinero.
  - **Historial Cronológico de Movimientos**: Registro segundo a segundo con tipo de operación (`IN` / `OUT`), monto, concepto y operador responsable.
- **Movimientos Manuales de Caja Chica**:
  - Registro ágil de egresos no comerciales (adelantos, fletes, viáticos, pagos menores a proveedores en efectivo).
  - Retiros parciales de seguridad por acumulación de efectivo durante el día.
- **Arqueo y Cierre Z de Caja**:
  - Conteo físico de billetes y monedas ingresado por el operador.
  - **Cálculo Automático de Discrepancias**:
    - *Arqueo exacto:* Coincidencia matemática perfecta contra el sistema.
    - *Sobrante:* Alerta del excedente exacto registrado en el cajón.
    - *Faltante:* Alerta en color rojo con el faltante exacto de caja.
  - Campo obligatorio de observaciones para justificar diferencias antes del cierre.
- **Exportación de la Jornada a CSV / Excel**:
  - Botón *"Exportar Movimientos CSV"* que descarga la liquidación completa del día lista para administración y contaduría.
- **Trazabilidad y Respaldo Inalterable**:
  - Cada apertura, movimiento y cierre queda firmado y sellado criptográficamente en la Bitácora Forense SHA-256 para prevenir manipulaciones de fondos.

---

## 🛡️ Seguridad, Auditoría y Estándares OWASP

### Matriz de Roles y Permisos Granulares (RBAC)

El acceso a las funciones operativas está estrictamente segmentado para evitar privilegios excesivos:

| Módulo | Clave del Permiso | Acción Autorizada | Nivel de Riesgo |
| :--- | :--- | :--- | :--- |
| **POS** | `pos:access` | Operar terminal de mostrador | Estándar |
| | `pos:discount` | Aplicar descuentos discrecionales y cupones | ⚠️ Crítico |
| | `pos:price_check` | Consultor rápido F3 de precios y cuotas | Bajo |
| **Ventas** | `sales:read` | Consultar comprobantes emitidos | Bajo |
| | `sales:create` | Emitir tickets de mostrador y facturación | Estándar |
| | `sales:void` | Anular comprobantes y emitir Notas de Crédito | ⚠️ Crítico |
| | `invoicing:emit_fiscal` | Generar CAE oficial de Facturas AFIP A y B | Alto |
| **Inventario** | `products:read` | Consultar catálogo y existencias | Bajo |
| | `products:create` | Crear o modificar artículos y descripciones | Medio |
| | `products:edit_price` | Modificar costos de reposición y precios de venta | ⚠️ Crítico |
| | `products:mass_price` | Actualización masiva de precios por proveedor | ⚠️ Crítico |
| | `stock:adjust` | Asentar ajustes de sobrantes/faltantes físicos | ⚠️ Crítico |
| | `stock:transfer` | Transferir mercadería entre depósitos | Medio |
| **Clientes** | `customers:read` | Consultar base de clientes y cuentas | Bajo |
| | `customers:write` | Crear o editar datos fiscales y domicilios | Medio |
| | `customers:credit_limit`| Modificar límite de crédito en cuenta corriente | Alto |
| | `customers:ban` | Inhabilitar o vetar clientes por morosidad | ⚠️ Crítico |
| **Caja** | `cash:open` / `cash:close` | Apertura de turno y arqueo ciego / Cierre Z | Alto |
| | `cash:movements` | Movimientos manuales de ingresos y egresos | Alto |
| **Auditoría** | `audit:read` | Consultar bitácora de auditoría (**Solo Admin**) | ⚠️ Crítico (Admin) |

> [!IMPORTANT]
> **Confidencialidad Estricta de Auditoría**: El módulo de Auditoría y las bitácoras individuales de operadores son de carácter confidencial y **solo son visibles para usuarios con rol `ADMIN`** (`audit:read`). Quedan ocultas de la barra lateral, botones de acción y rutas protegidas para cajeros y encargados.

---

### Cumplimiento de Seguridad OWASP Top 10

El sistema implementa medidas activas contra los 10 principales riesgos de seguridad web:

| Criterio OWASP | Medida Implementada en el Código | Nivel de Blindaje |
| :--- | :--- | :---: |
| **A01: Broken Access Control** | `JwtAuthGuard` global en todos los endpoints + `PermissionsGuard` RBAC granular. Rutas de auditoría restringidas estrictamente a administradores. | 🟢 **100% Blindado** |
| **A02: Cryptographic Failures** | Hashing con `bcryptjs` (salt rounds = 10). Tokens en cookies `HttpOnly`, `SameSite: strict` y `Secure`. Sanitización automática en logs reemplazando credenciales por `[REDACTED]`. | 🟢 **100% Blindado** |
| **A03: Injection & Mass Assignment** | Consultas parametrizadas con **Prisma ORM**. `ValidationPipe` con `forbidNonWhitelisted: true` rechaza payloads con campos extraños. Cero uso de `dangerouslySetInnerHTML`. | 🟢 **100% Blindado** |
| **A04: Insecure Design** | Límite de carga HTTP fijado en 10 MB. Bloqueo en mostrador de clientes vetados y validación estricta de límites de cuenta corriente. | 🟢 **100% Blindado** |
| **A05: Security Misconfiguration** | Cabeceras de seguridad `@fastify/helmet` (CSP, anti-Clickjacking, anti-MIME sniffing, HSTS). CORS restringido a orígenes explícitos. Swagger deshabilitado en producción. | 🟢 **100% Blindado** |
| **A06: Vulnerable Components** | Monitoreo estricto con lockfile validado de pnpm. Cero vulnerabilidades críticas reportadas en dependencias. | 🟢 **100% Blindado** |
| **A07: Identification Failures** | Limitador de tasa `@fastify/rate-limit` (300 req/min por IP contra ataques de fuerza bruta). Campo `tokenVersion` en base de datos para revocación inmediata de sesiones. | 🟢 **100% Blindado** |
| **A08: Software & Data Integrity** | Tipado estricto en TypeScript sin errores de compilación (`tsc --noEmit`). DTOs validados con `class-validator`. | 🟢 **100% Blindado** |
| **A09: Logging Failures** | Bitácora transaccional inmutable en PostgreSQL (`AuditLog`) registrando usuario, acción, entidad, timestamp e IP, previa sanitización de secretos. | 🟢 **100% Blindado** |
| **A10: Server-Side Request Forgery (SSRF)** | Validación estricta en peticiones salientes bloqueando rangos de metadatos de nube (`169.254.169.254`, `metadata.google.internal`) y dominios internos. | 🟢 **100% Blindado** |

---

### Bitácora Forense Criptográfica Inalterable (SHA-256 Ledger)

![Bitácora Forense SHA-256](docs/screenshots/audit_bitacora_view.jpg)

Ante posibles **auditorías legales, peritajes fiscales (AFIP) o peritajes judiciales**, el ERP incorpora un motor de sellado inalterable con **encadenamiento criptográfico SHA-256 (Tamper-Evident Ledger)**:

```
[ Bloque Génesis (SHA-256) ]
           │
           ▼
[ Bloque #1: Alta Usuario ] ─── Hash #1 = SHA256(#1 | Timestamp | Usuario | Acción | Entidad | Datos | PrevHash )
           │
           ▼
[ Bloque #2: Cobro Venta  ] ─── Hash #2 = SHA256(#2 | Timestamp | Usuario | Acción | Entidad | Datos | Hash #1   )
           │
           ▼
[ Bloque #3: Ajuste Stock ] ─── Hash #3 = SHA256(#3 | Timestamp | Usuario | Acción | Entidad | Datos | Hash #2   )
```

#### 🔒 Garantías de Inalterabilidad Criptográfica:
1. **Encadenamiento Secuencial (Blockchain-Grade Hash Chaining)**: Cada evento generado calcula su hash digest combinando secuencia, timestamp, operador, acción, entidad, carga JSON y el hash del bloque previo (`previousHash`).
2. **Detección Matemática de Manipulación**:
   - Si un atacante o usuario intenta modificar un valor (por ejemplo, reducir el monto de una venta cobrada o cambiar el destinatario de un ajuste), el cálculo SHA-256 diverge y el validador reporta inmediatamente: `Alerta: Registro #N adulterado`.
   - Si se borra un registro para ocultar una acción, se detecta una **discontinuidad de secuencia**.
   - Si se inyecta un registro espurio, la **cadena de hashes queda rota**.
3. **Eventos de Registro Obligatorio**:
   - **Usuarios**: Altas, modificaciones de credenciales/permisos y desactivaciones.
   - **Clientes**: Altas, modificaciones comerciales, vetos/inhabilitaciones (`BAN`) por mora o cheques rechazados.
   - **Ventas & Mostrador**: Emisión de facturas A/B y tickets, aplicación de descuentos o cupones y anulaciones (`VOID`).
   - **Inventario & Caja**: Ajustes físicos de stock, transferencias entre depósitos y aperturas/cierres de caja.
4. **Herramientas de Peritaje en Vivo en `/auditoria`**:
   - **Botón "Verificar Integridad SHA-256"**: Recalcula y verifica la cadena completa en milisegundos con semáforo verde de certificación.
   - **Descarga de Acta Oficial Forense (JSON Firmado)**: Exporta el expediente completo con metadatos de certificación, algoritmos empleados y estructura de hashes para inspectores y peritos.
   - **Exportación CSV Certificada**: Incluye número de bloque, hash SHA-256 y hash previo para análisis en planillas de auditoría.

---

## 🧪 Suite de Pruebas, Estrés y Rendimiento (186 Tests)

El sistema cuenta con una arquitectura de pruebas automatizadas que previene regresiones y garantiza que la aplicación **no se tilde ni se congele** ante operaciones masivas de mostrador:

```bash
# Ejecutar todas las pruebas del monorepo (Frontend + Backend)
pnpm -r run test
```

### 📊 Matriz General de Pruebas Automatizadas:

| Entorno / Capa | Framework de Pruebas | Archivos / Suites | Tests Ejecutados | Estado |
| :--- | :---: | :---: | :---: | :---: |
| **Frontend Web (`apps/web`)** | Vitest 2.1.9 + JSDOM | 20 archivos | **138 tests** | ✅ **138/138 Pasados (100%)** |
| **Backend API (`apps/api`)** | Jest 29 + ts-jest | 8 archivos | **48 tests** | ✅ **48/48 Pasados (100%)** |
| **TOTAL MONOREPO** | Monorepo pnpm | **28 archivos** | **186 tests** | 🏆 **186 Pasados / 0 Fallos (100%)** |

### 🔥 Pruebas de Estrés y Alta Concurrencia Incluidas:
- **Bitácora Inalterable y Criptografía SHA-256 (`audit-ledger.spec.ts`)**: Validación del algoritmo SHA-256, efecto avalancha, encadenamiento secuencial, detección estricta de adulteración de datos, detección de rotura de cadena y detección de eliminación de registros intermedios.
- **Motor de Búsqueda Natural Multicampo (`natural-search.spec.ts`)**: Búsqueda en lenguaje natural con lematización en español para productos, clientes y usuarios.
- **Motor de Monedas y Formato Regional (`utils.spec.ts`)**: Validación de formateo numérico dinámico en ARS, USD, EUR, CLP (sin decimales), BRL, monedas personalizadas, números negativos y sincronización en tiempo real con `localStorage`.
- **Carrito Masivo POS (`pos.store.stress.spec.ts`)**: 500 artículos distintos con recálculo instantáneo de IVA, márgenes y subtotales en menos de 500ms.
- **Ráfaga de Cantidades**: 1,000 mutaciones consecutivas de cantidad sin pérdida de reactividad ni degradación de memoria.
- **Vencimiento de Cotizaciones (`quotes.service.stress.spec.ts`)**: Evaluación algorítmica de 10,000 presupuestos en menos de 200ms.
- **Importación Masiva Excel/CSV (`excel-import.service.stress.spec.ts`)**: Procesamiento y validación tolerante de 3,000 filas de artículos y 3,000 clientes con CUIT en < 2.5s.
- **Inteligencia de Clientes & Churn Scoring (`customer-analytics.service.stress.spec.ts`)**: Evaluación de perfiles RFM, score predictivo de abandono y matrices de Machine Learning sobre 5,000 clientes en < 1.5s.
- **Respaldos e Instantáneas JSON (`backup.service.stress.spec.ts`)**: Serialización, validación criptográfica y restauración de snapshots de 20,000 entidades en < 1s.
- **Catálogo Masivo Backend (`products.service.stress.spec.ts`)**: Paginación y cálculo de stock multidepósito de 100 páginas consecutivas y 200 búsquedas concurrentes en < 1s.
- **Logins Concurrentes (`auth.service.stress.spec.ts`)**: 100 inicios de sesión simultáneos procesando hashing `bcrypt` en paralelo.
- **Auditoría de Payloads Extremos (`audit.interceptor.stress.spec.ts`)**: Sanitización recursiva de estructuras JSON de 12 niveles de anidación y 2,000 propiedades en menos de 100ms.
- **Despacho y Notificaciones de Correo (`email-notification.service.stress.spec.ts`)**: 500 envíos concurrentes con simulación offline, 10,000 cálculos de descuento en efectivo en negro (<300ms) y generación masiva de 1,000 plantillas HTML de comprobantes (<1.5s).



---

## ⌨️ Atajos de Teclado del POS & Accesibilidad

| Tecla / Combinación | Módulo | Acción |
| :--- | :---: | :--- |
| **`F2`** | POS | Enfoca el buscador rápido del catálogo de productos en el mostrador. |
| **`F3`** | Global | Abre el **Consultor Rápido de Precios y Financiación** (Global en todo el sistema). |
| **`F4`** | POS | Abre el modal de cobro, selección de medios de pago y régimen fiscal (Blanco vs Negro). |
| **`Escape`** | POS / Modales | Cancela la venta actual, vacía el carrito del POS o cierra el modal activo. |
| **`Enter` (Lector)** | POS | Agrega automáticamente el producto escaneado con la pistola USB al ticket con sonido bip. |
| **`Ctrl + P`** | POS / Factura | Imprime el ticket térmico de 80mm o la factura oficial A4 con código QR AFIP. |
| **`Alt + A`** | Global | **Abre / Cierra el Centro de Accesibilidad Universal** (Ajustes visuales, contraste, voz). |
| **`Alt + S`** | Global | **Asistente de Voz**: Lee en voz alta el título y resumen de la pantalla actual en español. |
| **`Alt + V` / Botón 🔊** | Consultor F3 | **Vocaliza** nombre del artículo, precio en ARS y stock disponible. |
| **`Tab` inicial** | Global | **Salto al contenido principal** (Skip Link para lectores de pantalla WCAG 2.4.1). |

---


## 🧭 Mapa de Rutas de la Aplicación

| Icono | Módulo | Ruta | Descripción |
| :---: | :--- | :--- | :--- |
| 📊 | **Dashboard** | `/` | Indicadores de facturación, gráficos de Recharts, alertas y exportación de resumen a CSV. |
| 📦 | **Productos** | `/productos` | Catálogo general, buscador SKU/EAN, filtros, ajuste masivo, importación Excel y exportación CSV. |
| ➕ | **Nuevo Producto** | `/productos/nuevo` | Formulario con cálculo de márgenes comerciales y alícuotas de IVA. |
| 🏷️ | **Categorías** | `/categorias` | Gestión de rubros y subrubros jerárquicos. |
| 🏭 | **Inventario** | `/inventario` | Existencias multidepósito, Kardex de movimientos, transferencias y descarga CSV. |
| 🛒 | **Punto de Venta** | `/pos` | Terminal de mostrador: atajos `F2`, `F3`, `F4`, cobro mixto y lector de código de barras. |
| 🔍 | **Consultor Precios**| Modal (`F3`)| Verificador de precios, stock por almacén, financiación en cuotas y 10% OFF. |
| 🧾 | **Ventas** | `/ventas` | Supervisión por vendedor, filtro fiscal (blanco/negro), anulación y exportación CSV. |
| 👥 | **Clientes** | `/clientes` | Ficha impositiva, cuentas corrientes, veto de clientes, importación Excel y descarga CSV. |
| 🧠 | **Perfiles & Churn** | `/clientes/perfiles` | Inteligencia de clientes, RFM, Churn Scoring (0-100%), perfiles 360°, filtros de fecha y exportación de Dataset ML / Marketing. |
| 🚚 | **Proveedores** | `/proveedores` | Directorio de distribuidores, CUIT, saldo deudor, pagos y descarga CSV. |
| 📑 | **Compras** | `/compras` | Historial de facturas recibidas, impacto automático en stock y descarga CSV. |
| ➕ | **Registrar Compra** | `/compras/nueva` | Formulario de recepción con actualización de costos y márgenes de venta. |
| 📄 | **Facturación** | `/facturacion` | Facturas A/B con CAE AFIP, Tickets X y **Descarga del Libro IVA Ventas para el Contador**. |
| 💰 | **Caja** | `/caja` | Apertura de turno, movimientos manuales de mostrador, arqueo y exportación CSV. |
| 📈 | **Reportes** | `/reportes` | Libro IVA Digital, márgenes comerciales y valorización de inventario. |
| 🛡️ | **Auditoría** | `/auditoria` | Registro de trazabilidad y pista forense de acciones del personal con filtro de operador. |
| ⚙️ | **Configuración** | `/configuracion` | Datos fiscales del negocio, tab de Copias de Seguridad locales y Google Drive. |
| 👤 | **Usuarios** | `/usuarios` | Cuentas de empleados, asignación de roles y permisos. |

---

## 🏗️ Stack Tecnológico & Arquitectura

| Capa | Tecnologías | Propósito |
| :--- | :--- | :--- |
| **Frontend SPA** | React 18/19, Vite 5.4, Tailwind CSS 3.4, TypeScript | Aplicación web reactiva de alto rendimiento con tipado estricto. |
| **Componentes UI** | shadcn/ui, Radix UI, Lucide Icons | Componentes accesibles, diálogos modales y tablas optimizadas. |
| **Estado y Datos** | Zustand 4.5, TanStack Query (React Query 5) | Carrito POS en memoria y sincronización de datos con caché reactiva. |
| **Gráficos & Visualización** | Recharts | Gráficos adaptativos de tendencias de venta, costos y rentabilidad. |
| **Hojas de Cálculo** | SheetJS (`xlsx`) | Procesamiento nativo en navegador de archivos `.xlsx`, `.xls` y `.csv`. |
| **Backend REST API** | NestJS 10, Fastify, TypeScript | API REST modular, DTOs con validación estricta y Swagger OpenAPI. |
| **ORM y Base de Datos** | PostgreSQL 16, Prisma ORM 5 | 48 tablas relacionales con integridad referencial y migraciones versionadas. |
| **Caché y Colas** | Redis 7 | Almacenamiento rápido en memoria y colas asíncronas. |
| **Monorepo** | pnpm Workspaces | Arquitectura modular compartiendo `@ferreteria/shared`. |

### Estructura de Directorios del Monorepo:

```
GestionQuincaillerie/
├── apps/
│   ├── api/                     # Backend NestJS 10 + Fastify
│   │   ├── prisma/
│   │   │   ├── schema.prisma    # 48 Modelos relacionales normalizados
│   │   │   └── seed.ts          # Script de datos maestros iniciales
│   │   └── src/
│   │       ├── modules/         # Auth, Users, Products, Categories, Warehouses,
│   │       │                    # Inventory, Suppliers, Purchases, Sales,
│   │       │                    # CashRegister, Customers, Invoicing, Reports,
│   │       │                    # Audit, Settings
│   │       └── common/          # Guards, Interceptors, Decorators, Filters
│   └── web/                     # Frontend React 18/19 + Vite
│       └── src/
│           ├── components/
│           │   ├── ui/          # 21 componentes reutilizables shadcn/ui
│           │   ├── common/      # PriceCheckModal, DataTable, ConfirmDialog
│           │   ├── products/    # ProductExcelImportModal
│           │   ├── customers/   # CustomerExcelImportModal, CustomerProfileModal
│           │   ├── quotes/      # NewQuoteModal, QuotePrintModal, UpdateExchangeRateModal
│           │   ├── settings/    # BackupSettingsTab
│           │   └── layout/      # Sidebar, Header con F3, DashboardLayout
│           ├── pages/           # Vistas principales (POS, Facturación, Presupuestos, etc.)
│           ├── services/        # Clientes API, backup, excel-import, google-drive, quotes
│           ├── stores/          # Stores reactivos Zustand (auth, pos, cash)
│           └── hooks/           # useBarcodeScanner, useToast
├── packages/
│   └── shared/                  # Paquete compartido: tipos TypeScript y schemas Zod
├── docs/
│   └── screenshots/             # Capturas de pantalla y demo animada (GIF)
├── docker-compose.yml           # Configuración de contenedores PostgreSQL 16 y Redis 7 (Docker & Podman)
├── pnpm-workspace.yaml          # Orquestación del monorepo con pnpm
└── package.json                 # Scripts raíz del proyecto
```

---

## ⚙️ Variables de Entorno

Plantilla de configuración de referencia disponible en `.env.example`:

```env
# ==========================================
# Base de Datos y Caché
# ==========================================
DATABASE_URL="postgresql://ferreteria:ferreteria_dev_2026@localhost:5432/ferreteria_db?schema=public"
REDIS_HOST=localhost
REDIS_PORT=6379

# ==========================================
# Seguridad y Autenticación JWT
# ==========================================
JWT_SECRET=super-secret-key-change-in-production-2026
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# ==========================================
# Servidor y URLs
# ==========================================
API_PORT=4000
API_HOST=0.0.0.0
FRONTEND_URL=http://localhost:5173

# ==========================================
# Integración Mercado Libre API (MELI)
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
# Despacho de Comprobantes por Email (SMTP)
# ==========================================
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=facturacion@ferreteria.com
SMTP_PASS=tu_token_de_aplicacion
SMTP_FROM_NAME="Ferretería Central"
SMTP_FROM_EMAIL=facturacion@ferreteria.com
SMTP_BCC=administracion@ferreteria.com
```

---

## 🛠️ Comandos de Mantenimiento y Calidad

```bash
# Ejecutar todas las pruebas del monorepo (Jest + Vitest)
pnpm -r run test

# Ejecutar exclusivamente pruebas del Frontend (Vitest)
pnpm --filter @ferreteria/web run test

# Ejecutar exclusivamente pruebas del Backend (Jest)
pnpm --filter @ferreteria/api run test

# Modo interactivo en vivo de pruebas (Watch mode)
pnpm --filter @ferreteria/web run test:watch

# Verificación estricta de tipos TypeScript en todo el monorepo (0 errores)
pnpm -r run lint

# Compilación completa de producción (Backend NestJS + Frontend Vite)
pnpm -r run build

# Abrir el explorador visual de base de datos Prisma Studio
pnpm --filter @ferreteria/api exec prisma studio

# Detener los contenedores (Docker o Podman)
docker compose down    # o: podman-compose down

# Reiniciar o levantar los contenedores (Docker o Podman)
docker compose up -d   # o: podman-compose up -d
```

---

## 📄 Licencia

Desarrollado para **GestionQuincaillerie**. Todos los derechos reservados.

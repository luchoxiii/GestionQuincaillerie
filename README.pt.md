# 🛠️ GestionQuincaillerie — ERP & PDV para Loja de Ferragens e Materiais de Construção

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
[![Audit Report](https://img.shields.io/badge/Audit-Comprehensive%20Report-blue.svg)](./AUDIT_REPORT.md)

[![WCAG 2.1](https://img.shields.io/badge/WCAG%202.1-AA%20%2F%20AAA-success.svg)](https://www.w3.org/WAI/standards-guidelines/wcag/)
[![A11y Voice](https://img.shields.io/badge/A11y-Voice%20%26%20Audio-blueviolet.svg)](https://developer.mozilla.org/es/docs/Web/API/Web_Speech_API)
[![OWASP Top 10](https://img.shields.io/badge/OWASP%20Top%2010-Compliant-success.svg)](https://owasp.org/)

> **Sistema Integrado de Gestão Comercial, Controle de Estoque Multidepósito, Faturamento Fiscal Dual AFIP, Terminal de Ponto de Venda (PDV/POS) de Alta Velocidade e Sincronização Omnicanal para Lojas de Ferragens, Madeireiras e Distribuidores de Materiais de Construção.**  
> Repositório oficial: [https://github.com/luchoxiii/GestionQuincaillerie](https://github.com/luchoxiii/GestionQuincaillerie)  
> 🌐 **Documentação:** [Español (README.md)](./README.md) • [English (README.en.md)](./README.en.md) • [Português (README.pt.md)](./README.pt.md) • [Français (README.fr.md)](./README.fr.md) • [📋 Relatório de Auditoria & OWASP (AUDIT_REPORT.md)](./AUDIT_REPORT.md)

---

## 📑 Tabela de Conteúdos

1. [📸 Demonstração Visual](#-demonstração-visual)
2. [⚡ Guia Completo de Instalação e Implantação](#-guia-completo-de-instalação-e-implantação)
   - [🖥️ Modo 1: Instalação Local Bare-Metal (Sem Docker / Offline-First)](#modo-1-instalação-local-bare-metal-sem-docker--offline-first)
     - [1.1. Modo Autônomo Offline-First (Apenas Frontend / Persistência Local)](#11-modo-autônomo-offline-first-apenas-frontend--persistência-local)
     - [1.2. Modo Full-Stack Bare-Metal (Frontend + Backend NestJS + PostgreSQL Local)](#12-modo-full-stack-bare-metal-frontend--backend-nestjs--postgresql-local)
   - [🐳 Modo 2: Implantação com Docker & Docker Compose](#modo-2-implantação-com-docker--docker-compose)
   - [🦭 Modo 3: Implantação com Podman & Podman Compose (Rootless & Enterprise)](#modo-3-implantação-com-podman--podman-compose-rootless--enterprise)
3. [🏛️ Módulos Funcionais do Sistema](#️-módulos-funcionais-do-sistema)
   - [🛒 1. Terminal de Balcão & Ponto de Venda (PDV)](#1-terminal-de-balcão--ponto-de-venda-pdv)
   - [🏛️ 2. Faturamento Dual & Regime Fiscal](#2-faturamento-dual--regime-fiscal)
   - [📦 3. Catálogo, Estoque Multidepósito e Compras](#3-catálogo-estoque-multidepósito-e-compras)
   - [👥 4. CRM, Inteligência de Clientes & Churn Scoring 360°](#4-crm-inteligência-de-clientes--churn-scoring-360)
   - [🎟️ 5. Cupons de Fidelidade e Orçamentos Bimoeda (USD / ARS / BRL)](#5-cupons-de-fidelidade-e-orçamentos-bimoeda-usd--ars--brl)
   - [🌐 6. Central E-Commerce & Mercado Livre API](#6-central-e-commerce--mercado-livre-api)
     - [🟡 Guia de Conexão: Mercado Livre API (MELI)](#guia-meli)
   - [💾 7. Carga em Massa (Excel / Sheets) & Backup Google Drive](#7-carga-em-massa-excel--sheets--backup-google-drive)
     - [☁️ Guia de Configuração: Google Sheets & Google Drive](#guia-google-sheets)
   - [♿ 8. Acessibilidade Universal, Assistente de Voz e WCAG 2.1 (AA/AAA)](#8-acessibilidade-universal-assistente-de-voz-e-wcag-21-aaaa)
   - [⚙️ 9. Painel Gráfico de Configurações](#9-painel-gráfico-de-configurações)
   - [🏪 10. Multi-Lojas e Filiais Comerciais](#10-multi-lojas-e-filiais-comerciais)
   - [🔍 11. Motor de Busca em Linguagem Natural](#11-motor-de-busca-em-linguagem-natural)
   - [💵 12. Controle de Caixa, Fechamento em Tempo Real e Turno Z](#12-controle-de-caixa-fechamento-em-tempo-real-e-turno-z)
4. [🛡️ Segurança, Auditoria e Padrões OWASP Top 10](#️-segurança-auditoria-e-padrões-owasp-top-10)
   - [Matriz Granular de Controle de Acesso (RBAC)](#matriz-granular-de-controle-de-acesso-rbac)
   - [Conformidade com OWASP Top 10](#conformidade-com-owasp-top-10)
   - [Livro-Razão Forense Criptográfico SHA-256 (Tamper-Evident)](#livro-razão-forense-criptográfico-sha-256-tamper-evident)
5. [🧪 Suite de Testes, Estresse e Performance (186 Testes)](#-suite-de-testes-estresse-e-performance-186-testes)
6. [⌨️ Atalhos de Teclado do PDV & Acessibilidade](#️-atalhos-de-teclado-do-pdv--acessibilidade)
7. [🧭 Mapa de Rotas da Aplicação](#-mapa-de-rotas-da-aplicação)
8. [🏗️ Stack Tecnológico & Arquitetura](#️-stack-tecnológico--arquitetura)
9. [⚙️ Variáveis de Ambiente](#️-variáveis-de-ambiente)
10. [📄 Licença](#-licença)

---

## 📸 Demonstração Visual

### 🎬 Navegação Dinâmica pelo Sistema (Animação)
![Navegação pelo Sistema](docs/screenshots/demo.gif)

---

### 📊 Painel de Controle Principal (Dashboard)
Métricas em tempo real com **seletor de período** (*Hoje*, *Ontem*, *Últimos 7 dias*, *Este Mês*, *Últimos 30 dias*, *Este Ano* ou *Personalizado*), gráficos Recharts de faturamento versus custo, margem de lucro bruto e alertas de reposição.
![Painel Principal](docs/screenshots/dashboard_view_1788544828180.jpg)

---

### 💵 Controle de Caixa e Fechamento Z
Abertura e fechamento de turno em tempo real: cálculo automático do **Saldo Teórico em Caixa** (`Fundo Inicial + Entradas - Saídas`), registro cronológico de sangrias/suprimentos e reconciliação com detecção de sobras e faltas.
![Controle de Caixa e Fechamento Z](docs/screenshots/cash_register_view.jpg)

---

### 🛒 Terminal PDV com Faturamento Dual & Desconto à Vista
Balcão de atendimento de alta agilidade: seletor interativo entre **Fatura Oficial (Branco)** e **Cupom Interno X (Preto)** com cálculo automático de **desconto para pagamento em dinheiro**, cálculo instantâneo de troco e envio de recibos por email.
![Terminal PDV](docs/screenshots/pos_checkout_view.jpg)

---

### 🛡️ Livro-Razão Forense Criptográfico Inalterável (SHA-256)
Registro em cadeia inviolável (*blockchain-grade*): auditoria rigorosa de operadores, vendas, cancelamentos, ajustes de inventário e fechamentos de caixa com hash SHA-256 inalterável.
![Livro-Razão Forense SHA-256](docs/screenshots/audit_bitacora_view.jpg)

---

### 📑 Orçamentos Bimoeda (USD / ARS / BRL) & Câmbio em Tempo Real
Emissão de orçamentos com cotação acordada editável, congelamento de preços por período (24h, 48h, 7d) e conversão em venda com apenas 1 clique.
![Orçamentos Bimoeda](docs/screenshots/quotes_dollar_view.jpg)

---

## ⚡ Guia Completo de Instalação e Implantação

O sistema dispõe de três modalidades flexíveis de execução:

```
                               ┌─────────────────────────────────┐
                               │   Métodos de Implantação ERP    │
                               └────────────────┬────────────────┘
                                                │
         ┌──────────────────────────────────────┼──────────────────────────────────────┐
         ▼                                      ▼                                      ▼
  🖥️ MODO 1: Bare-Metal                 🐳 MODO 2: Docker                      🦭 MODO 3: Podman
  • Sem contêineres                     • docker compose up -d                 • podman-compose up -d
  • Offline-First ou Local              • Contêineres Docker                   • Rootless & Daemonless
  • Node.js 20+ e pnpm                  • Desktop ou Servidor                  • Enterprise / RHEL / Fedora
```

---

<a id="modo-1-instalação-local-bare-metal-sem-docker--offline-first"></a>
### 🖥️ Modo 1: Instalação Local Bare-Metal (Sem Docker / Offline-First)

Ideal para computadores isolados de balcão sem acesso contínuo à internet ou com recursos de hardware reduzidos.

#### Pré-requisitos:
- **Node.js** v20.x LTS ou superior ([nodejs.org](https://nodejs.org/))
- **pnpm** v9.x ou superior (`npm install -g pnpm`)
- **Git** ([git-scm.com](https://git-scm.com/))

---

#### 1.1. Modo Autônomo Offline-First (Apenas Frontend / Persistência Local)
Opera sem banco de dados externo ou backend ativo. Todo o ERP roda no navegador via `localStorage`.

```bash
# 1. Clonar repositório
git clone https://github.com/luchoxiii/GestionQuincaillerie.git
cd GestionQuincaillerie

# 2. Instalar dependências
pnpm install

# 3. Iniciar o frontend em desenvolvimento
pnpm --filter @ferreteria/web run dev
```

- **Acesso:** [http://localhost:5173](http://localhost:5173)
- **Credenciais Padrão:** Usuário: `admin` | Senha: `admin123` (ou `admin`)

---

#### 1.2. Modo Full-Stack Bare-Metal (Frontend + Backend NestJS + PostgreSQL Local)

##### 1. Configurar Serviços Locais:
- Instalar **PostgreSQL 16** e criar a base de dados `ferreteria_db` com usuário `ferreteria`.
- Instalar **Redis 7** *(opcional para cache)*.

##### 2. Configurar Arquivo de Ambiente:
```bash
cp .env.example .env
```

##### 3. Migrar e Popular Banco de Dados:
```bash
pnpm --filter @ferreteria/api exec prisma migrate dev --name init
pnpm --filter @ferreteria/api exec ts-node prisma/seed.ts
```

##### 4. Iniciar os Serviços:
```bash
# Terminal 1: Backend API (porta 4000)
pnpm --filter @ferreteria/api run start:dev

# Terminal 2: Frontend Web (porta 5173)
pnpm --filter @ferreteria/web run dev
```

---

<a id="modo-2-implantação-com-docker--docker-compose"></a>
### 🐳 Modo 2: Implantação com Docker & Docker Compose

```bash
# 1. Clonar repositório e instalar dependências
git clone https://github.com/luchoxiii/GestionQuincaillerie.git
cd GestionQuincaillerie
pnpm install

# 2. Subir contêineres de infraestrutura
docker compose up -d

# 3. Executar migrações do Prisma e dados iniciais
pnpm --filter @ferreteria/api exec prisma migrate dev --name init
pnpm --filter @ferreteria/api exec ts-node prisma/seed.ts

# 4. Iniciar Frontend e Backend
pnpm --filter @ferreteria/api run start:dev
pnpm --filter @ferreteria/web run dev
```

---

<a id="modo-3-implantação-com-podman--podman-compose-rootless--enterprise"></a>
### 🦭 Modo 3: Implantação com Podman & Podman Compose (Rootless & Enterprise)

```bash
# 1. Subir contêineres rootless com Podman
podman-compose up -d

# 2. Aplicar migrações
pnpm --filter @ferreteria/api exec prisma migrate dev --name init
pnpm --filter @ferreteria/api exec ts-node prisma/seed.ts

# 3. Iniciar serviços
pnpm --filter @ferreteria/api run start:dev
pnpm --filter @ferreteria/web run dev
```

---

## 🏛️ Módulos Funcionais do Sistema

### 1. Terminal de Balcão & Ponto de Venda (PDV)
- **Operação 100% por Teclado**: Atalhos universais (`F2` busca, `F3` consulta de preços, `F4` cobrança, `Esc` cancelamento).
- **Leitor de Código de Barras USB**: Captura instantânea via hook `useBarcodeScanner` sem necessidade de foco em campos de texto.
- **Consultor Rápido de Preços (`F3`)**: Modal com tipografia de alta visibilidade, cálculo de parcelas e estoque por depósito.
- **Pagamentos Flexíveis**: Dinheiro com calculadora de troco, cartões de crédito/débito, PIX / transferência e pagamentos mistos.
- **Desconto para Pagamento em Dinheiro**: Alíquotas de 5%, 10%, 15% e 20% com recálculo instantâneo.
- **Envio de Comprovante por Email**: Envio automático de recibo digital formatado em HTML para o cliente.

### 2. Faturamento Dual & Regime Fiscal
- **Fatura Oficial com CAE (AFIP)** para pessoas jurídicas ou físicas registradas.
- **Cupom Interno X (Preto)** para entregas internas de balcão sem transmissão tributária.
- **Exportação do Livro Fiscal de Vendas** em formato CSV delimitado por ponto e vírgula (`UTF-8 com BOM`).

### 3. Catálogo, Estoque Multidepósito e Compras
- Geração automática de SKU, códigos EAN-13 e margens comerciais.
- Kardex inalterável (`StockMovement`) para rastreamento de entradas, saídas, ajustes e transferências.
- Gestão de pedidos e faturas de fornecedores com atualização automática de estoque.

### 4. CRM, Inteligência de Clientes & Churn Scoring 360°
- Segmentação algorítmica RFM (Recência, Frequência e Valor Monetário).
- Termômetro preditivo de risco de abandono (0 a 100%).
- Ações comerciais imediatas: vendas com cupons e contato estruturado via WhatsApp Web.
- Exportação de dados para aprendizado de máquina (`exportMLDatasetCsv`).

### 5. Cupons de Fidelidade e Orçamentos Bimoeda
- Cupons percentuais (`% OFF`) ou de valor fixo.
- Orçamentos em Pesos ou Dólares com cotação negociada e congelamento temporal.
- Conversão de orçamentos em vendas no PDV com 1 clique.

<a id="guia-meli"></a>
### 6. Central E-Commerce & Mercado Libre API
- Sincronização em tempo real de pedidos, desconto automático de estoque e emissão de etiquetas térmicas de envio (10x15 cm).

<a id="guia-google-sheets"></a>
### 7. Carga em Massa (Excel / Sheets) & Backup Google Drive
- Importação rápida de arquivos `.xlsx`, `.xls` e `.csv` com semáforo interativo de validação.
- Backup completo do ERP em formato JSON e sincronização direta com Google Drive via OAuth2.

### 8. Acessibilidade Universal, Assistente de Voz e WCAG 2.1 (AA/AAA)
- Acesso global via **`Alt + A`**.
- Modo Alto Contraste Amarelo sobre Preto (relação de contraste 21:1).
- Filtros para daltonismo (Protanopia, Deuteranopia, Tritanopia, Acromatopsia).
- Suporte para dislexia com fonte adaptada e régua de leitura.
- Efeitos sonoros táteis via Web Audio API e leitura em voz alta via Web Speech API.

### 9. Painel Gráfico de Configurações
- Gerenciamento de credenciais do Mercado Libre, servidor corporativo SMTP, Google Drive e formatação de moeda regional.

### 10. Multi-Lojas e Filiais Comerciais
- Configuração de pontos de venda fiscais por filial e alternador de loja ativa no cabeçalho.

### 11. Motor de Busca em Linguagem Natural
- Lematização em espanhol e português, busca insensível a acentos e combinação de múltiplos campos.

### 12. Controle de Caixa, Fechamento em Tempo Real e Turno Z
- Registro de fundo de troco, cálculo automático do saldo teórico e reconciliação diária com registro de diferenças.

---

## 🛡️ Segurança, Auditoria e Padrões OWASP Top 10

- **A01: Broken Access Control**: Proteção global com `JwtAuthGuard` e `PermissionsGuard`.
- **A02: Cryptographic Failures**: Criptografia de senhas com `bcryptjs` e sanitização de segredos em logs (`[REDACTED]`).
- **A03: Injection**: Consultas parametrizadas com Prisma ORM e validação estrita com `ValidationPipe`.
- **A05: Security Misconfiguration**: Cabeçalhos seguros com Fastify Helmet e CORS restrito.
- **A07: Identification Failures**: Proteção contra força bruta com Fastify Rate Limit (300 req/min por IP).
- **Livro-Razão Forense SHA-256**: Cada ação transacional é encadeada matematicamente com o bloco anterior para detecção instantânea de adulterações.

---

## 🧪 Suite de Testes, Estresse e Performance (186 Testes)

Todos os 186 testes unitários e de estresse passam com 100% de sucesso:

```bash
pnpm -r run test
```

| Camada | Ferramenta | Arquivos / Suítes | Testes Executados | Status |
| :--- | :---: | :---: | :---: | :---: |
| **Frontend Web (`apps/web`)** | Vitest 2.1.9 + JSDOM | 20 arquivos | **138 testes** | ✅ **138/138 Aprovados** |
| **Backend API (`apps/api`)** | Jest 29 + ts-jest | 8 arquivos | **48 testes** | ✅ **48/48 Aprovados** |
| **TOTAL MONOREPO** | pnpm Workspaces | **28 arquivos** | **186 testes** | 🏆 **186 Aprovados / 0 Falhas** |

---

## ⌨️ Atalhos de Teclado do PDV & Acessibilidade

| Tecla | Escopo | Ação |
| :--- | :---: | :--- |
| **`F2`** | PDV | Focar no campo de busca de produtos. |
| **`F3`** | Global | Abrir Consultor Rápido de Preços e Parcelamento. |
| **`F4`** | PDV | Abrir modal de pagamento e emissão fiscal. |
| **`Escape`** | PDV / Modais | Cancelar venda, esvaziar carrinho ou fechar modal ativo. |
| **`Enter` (Leitor)** | PDV | Adicionar item lido por código de barras ao carrinho. |
| **`Ctrl + P`** | PDV / Fatura | Imprimir cupom térmico ou fatura A4. |
| **`Alt + A`** | Global | Abrir/Fechar Central de Acessibilidade Universal. |
| **`Alt + S`** | Global | Assistente de Voz: Ler resumo da tela atual. |
| **`Alt + V` / 🔊** | Consultor F3 | Vocalizar nome, preço e estoque do item pesquisado. |

---

## 🏗️ Stack Tecnológico & Arquitetura

- **Frontend SPA**: React 18/19, Vite 5.4, Tailwind CSS 3.4, TypeScript.
- **Componentes**: shadcn/ui, Radix UI, Lucide Icons.
- **Estado Global**: Zustand 4.5, TanStack Query 5 (React Query).
- **Gráficos**: Recharts.
- **Planilhas**: SheetJS (`xlsx`).
- **Backend API**: NestJS 10, Fastify, TypeScript.
- **Banco de Dados**: PostgreSQL 16 com Prisma ORM 5 (48 modelos relacionais).
- **Cache**: Redis 7.
- **Gerenciador de Monorepo**: pnpm Workspaces.

---

## 📄 Licença

Desenvolvido para **GestionQuincaillerie**. Todos os direitos reservados.

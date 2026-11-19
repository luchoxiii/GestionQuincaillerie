# 🛠️ GestionQuincaillerie — ERP & PDV para Loja de Ferragens

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
[![Audit Report](https://img.shields.io/badge/Audit-Comprehensive%20Report-blue.svg)](./AUDIT_REPORT.pt.md)

[![WCAG 2.1](https://img.shields.io/badge/WCAG%202.1-AA%20%2F%20AAA-success.svg)](https://www.w3.org/WAI/standards-guidelines/wcag/)
[![A11y Voice](https://img.shields.io/badge/A11y-Voice%20%26%20Audio-blueviolet.svg)](https://developer.mozilla.org/pt-BR/docs/Web/API/Web_Speech_API)
[![OWASP Top 10](https://img.shields.io/badge/OWASP%20Top%2010-Compliant-success.svg)](https://owasp.org/)

> **Sistema Integral de Gestão Comercial, Controle de Estoque Multidepósito, Faturamento Fiscal Duplo, Terminal de Ponto de Venda (PDV/POS) de Alta Velocidade e Sincronização Omnichannel para Lojas de Ferragens, Madeireiras e Depósitos de Materiais de Construção.**  
> Repositório oficial: [https://github.com/luchoxiii/GestionQuincaillerie](https://github.com/luchoxiii/GestionQuincaillerie)  
> 🌐 **Languages / Idiomas / Langues:** [🇪🇸 Español](./README.md) • [🇺🇸 English](./README.en.md) • [🇧🇷 Português](./README.pt.md) • [🇫🇷 Français](./README.fr.md)  
> 📋 **Audit & Security Reports / Informes Técnicos:** [🇪🇸 Español (AUDIT_REPORT.md)](./AUDIT_REPORT.md) • [🇺🇸 English (AUDIT_REPORT.en.md)](./AUDIT_REPORT.en.md) • [🇧🇷 Português (AUDIT_REPORT.pt.md)](./AUDIT_REPORT.pt.md) • [🇫🇷 Français (AUDIT_REPORT.fr.md)](./AUDIT_REPORT.fr.md)

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
   - [🛒 1. Terminal de Balcão & Ponto de Venda (PDV / POS)](#1-terminal-de-balcão--ponto-de-venda-pdv--pos)
   - [🏛️ 2. Faturamento Duplo & Regime Tributário](#2-faturamento-duplo--regime-tributário)
   - [📦 3. Catálogo, Estoque Multidepósito & Compras](#3-catálogo-estoque-multidepósito--compras)
   - [👥 4. CRM, Inteligência de Clientes & Churn Scoring 360°](#4-crm-inteligência-de-clientes--churn-scoring-360)
   - [🎟️ 5. Cupons de Fidelidade & Orçamentos Bimoeda (USD / ARS)](#5-cupons-de-fidelidade--orçamentos-bimoeda-usd--ars)
   - [🌐 6. Central E-Commerce & API do Mercado Livre](#6-central-e-commerce--api-do-mercado-livre)
     - [🟡 Guia de Conexão: Mercado Livre API (MELI)](#guia-meli)
   - [💾 7. Carga em Massa (Excel / Sheets) & Backup no Google Drive](#7-carga-em-massa-excel--sheets--backup-no-google-drive)
     - [☁️ Guia de Configuração: Google Sheets & Google Drive](#guia-google-sheets)
   - [♿ 8. Acessibilidade Universal, Assistente de Voz & WCAG 2.1 (AA/AAA)](#8-acessibilidade-universal-assistente-de-voz--wcag-21-aaaa)
   - [⚙️ 9. Painel de Configurações Gráficas Integrado](#9-painel-de-configurações-gráficas-integrado)
   - [🏪 10. Multi-Lojas & Filiais Comerciais](#10-multi-lojas--filiais-comerciais)
   - [🔍 11. Motor de Busca em Linguagem Natural Multicampos](#11-motor-de-busca-em-linguagem-natural-multicampos)
   - [💵 12. Controle de Caixa, Posição em Tempo Real & Fechamento Diário Z](#12-controle-de-caixa-posição-em-tempo-real--fechamento-diário-z)
4. [🛡️ Segurança, Auditoria & Normas OWASP Top 10](#️-segurança-auditoria--normas-owasp-top-10)
   - [Matriz de Papéis e Permissões Granulares (RBAC)](#matriz-de-papéis-e-permissões-granulares-rbac)
   - [Conformidade de Segurança OWASP Top 10](#conformidade-de-segurança-owasp-top-10)
   - [Livro-Razão Criptográfico Inalterável SHA-256](#livro-razão-criptográfico-inalterável-sha-256)
5. [🧪 Suíte de Testes Automatizados, Estresse & Performance (190 Testes)](#-suíte-de-testes-automatizados-estresse--performance-190-testes)
6. [⌨️ Atalhos de Teclado & Guia Rápido de Acessibilidade](#️-atalhos-de-teclado--guia-rápido-de-acessibilidade)
7. [🧭 Mapa de Rotas da Aplicação](#-mapa-de-rotas-da-aplicação)
8. [🏗️ Stack Tecnológico & Arquitetura do Monorepo](#️-stack-tecnológico--arquitetura-do-monorepo)
9. [⚙️ Variáveis de Ambiente](#️-variáveis-de-ambiente)
10. [🛠️ Comandos de Manutenção & Qualidade](#️-comandos-de-manutenção--qualidade)
11. [📄 Licença](#-licença)

---

## 📸 Demonstração Visual

### Demonstração Interativa Completa (ERP + PDV)
![Demonstração do Sistema](docs/screenshots/walkthrough.gif)

### Principais Telas & Destaques de Arquitetura

| Terminal PDV de Balcão | Orçamentos Bimoeda (USD / ARS) |
| :---: | :---: |
| ![Terminal PDV](docs/screenshots/pos_checkout_view.jpg) | ![Orçamentos Bimoeda](docs/screenshots/quotes_dollar_view.jpg) |
| *Atalhos (F2/F3/F4), leitor de código de barras, desconto em dinheiro e troco ao vivo.* | *Conversão em tempo real, taxa de câmbio fixada, contagem regressiva e envio por WhatsApp.* |

| Controle de Caixa e Fechamento Z | Gestão Multi-Lojas e Filiais |
| :---: | :---: |
| ![Controle de Caixa](docs/screenshots/cash_register_view.jpg) | ![Gestão Multi-Lojas](docs/screenshots/multistore_view.jpg) |
| *Saldo teórico em tempo real, sangrias, suprimentos, alerta de divergências e exportação CSV.* | *Administração de filiais, ponto de venda fiscal e seletor rápido no cabeçalho.* |

| Acessibilidade Universal e Alto Contraste | Livro-Razão Forense SHA-256 |
| :---: | :---: |
| ![Acessibilidade](docs/screenshots/a11y_high_contrast_view.jpg) | ![Auditoria SHA-256](docs/screenshots/audit_bitacora_view.jpg) |
| *Amarelo sobre preto (21:1 AAA), fonte para dislexia, voz sintética e bipes Web Audio.* | *Encadeamento de hashes tipo blockchain, detecção de adulteração e JSON assinado.* |

---

## ⚡ Guia Completo de Instalação e Implantação

<a id="modo-1-instalação-local-bare-metal-sem-docker--offline-first"></a>
### 🖥️ Modo 1: Instalação Local Bare-Metal (Sem Docker / Offline-First)

#### 1.1. Modo Autônomo Offline-First (Apenas Frontend / Persistência Local)
Não necessita de banco de dados externo nem de backend em execução. Todo o ERP (catálogo de produtos, ponto de venda PDV, pagamentos combinados, descontos em dinheiro, orçamentos bimoeda, cupons promocionais, trilha de auditoria, relatórios e importador de planilhas Excel) opera de forma autônoma no navegador via `localStorage` indexado de alta velocidade.

```bash
# 1. Clonar o repositório
git clone https://github.com/luchoxiii/GestionQuincaillerie.git
cd GestionQuincaillerie

# 2. Instalar dependências do monorepo
pnpm install

# 3. Iniciar o frontend em desenvolvimento
pnpm --filter @ferreteria/web run dev
```

- **Acesso Web:** [http://localhost:5173](http://localhost:5173)
- **Credenciais Mestras:** Usuário: `admin` | Senha: `admin123` (ou `admin`)

---

#### 1.2. Modo Full-Stack Bare-Metal (Frontend + Backend NestJS + PostgreSQL Local)
Projetado para operar com persistência relacional em disco sem virtualização de contêineres.

##### 1. Instalar Pré-requisitos no Sistema Operacional:
- **PostgreSQL 16**: Baixar e instalar para o seu sistema operacional (Windows, macOS, Ubuntu/Debian). Criar o banco de dados `ferreteria_db` e o usuário `ferreteria`.
- **Redis 7** *(opcional para cache)*: No Windows usar [Memurai](https://www.memurai.com/) ou WSL2; no Linux `sudo apt install redis-server`.

##### 2. Configurar o Arquivo de Ambiente:
Copie o modelo `.env.example` na raiz do projeto:
```bash
cp .env.example .env
```
Edite o arquivo `.env` com a sua string de conexão local do PostgreSQL:
```env
DATABASE_URL="postgresql://ferreteria:sua_senha_local@localhost:5432/ferreteria_db?schema=public"
REDIS_HOST=localhost
REDIS_PORT=6379
API_PORT=4000
FRONTEND_URL=http://localhost:5173
```

##### 3. Executar Migrações e Semear Dados Mestres:
```bash
# Executar migrações do Prisma ORM (48 tabelas relacionais)
pnpm --filter @ferreteria/api exec prisma migrate dev --name init

# Semear catálogo básico, listas de preços, categorias e usuários de teste
pnpm --filter @ferreteria/api exec ts-node prisma/seed.ts
```

##### 4. Iniciar Ambos os Serviços:
```bash
# Terminal 1: Iniciar API Backend NestJS (porta 4000)
pnpm --filter @ferreteria/api run start:dev

# Terminal 2: Iniciar Aplicação Frontend Vite (porta 5173)
pnpm --filter @ferreteria/web run dev
```

- **Frontend SPA:** [http://localhost:5173](http://localhost:5173)
- **Backend API REST:** [http://localhost:4000/api](http://localhost:4000/api)
- **Swagger Docs:** [http://localhost:4000/api/docs](http://localhost:4000/api/docs)
- **Prisma Studio (Visualizador GUI de Banco de Dados):** `pnpm --filter @ferreteria/api exec prisma studio` (acesso em [http://localhost:5555](http://localhost:5555))

---

<a id="modo-2-implantação-com-docker--docker-compose"></a>
### 🐳 Modo 2: Implantação com Docker & Docker Compose

Opção padrão recomendada para ambientes de desenvolvimento com Docker. Inicializa **PostgreSQL 16 Alpine** e **Redis 7 Alpine** com volumes de armazenamento persistente e verificações de integridade (*healthchecks*).

#### Pré-requisitos:
- **Docker Engine** v24+ e **Docker Compose v2** (ou **Docker Desktop** no Windows/macOS)
- **Node.js** v20+ e **pnpm** v9+

#### Passos de Execução:

```bash
# 1. Clonar repositório e acessar a pasta
git clone https://github.com/luchoxiii/GestionQuincaillerie.git
cd GestionQuincaillerie

# 2. Instalar dependências do projeto
pnpm install

# 3. Inicializar os contêineres em segundo plano
docker compose up -d

# 4. Verificar se os contêineres estão saudáveis
docker compose ps

# 5. Aplicar migrações do Prisma
pnpm --filter @ferreteria/api exec prisma migrate dev --name init

# 6. Semear dados mestres
pnpm --filter @ferreteria/api exec ts-node prisma/seed.ts

# 7. Iniciar os serviços do ERP
# Terminal 1 (Backend):
pnpm --filter @ferreteria/api run start:dev

# Terminal 2 (Frontend):
pnpm --filter @ferreteria/web run dev
```

#### Comandos Úteis do Docker:
```bash
# Acompanhar logs do PostgreSQL em tempo real
docker compose logs -f postgres

# Parar os contêineres preservando os dados dos volumes
docker compose stop

# Destruir contêineres mantendo os volumes persistentes
docker compose down

# Reiniciar serviços
docker compose restart
```

---

<a id="modo-3-implantação-com-podman--podman-compose-rootless--enterprise"></a>
### 🦭 Modo 3: Implantação com Podman & Podman Compose (Rootless & Enterprise)

O **Podman** é o motor de contêineres padrão em distribuições corporativas baseadas em Linux (Red Hat Enterprise Linux, Fedora, Rocky Linux, AlmaLinux, CentOS Stream, Debian e Ubuntu), destacando-se por ser **100% livre de daemons** e operar **totalmente em modo rootless (sem privilégios de root)** para máxima segurança de infraestrutura.

#### Pré-requisitos:
- **Podman** v4.x ou v5.x ([podman.io](https://podman.io/))
- **podman-compose** (`pip install podman-compose` ou via gerenciador: `sudo dnf install podman-compose` / `sudo apt install podman-compose`)
- **Node.js** v20+ e **pnpm** v9+

#### Passos de Execução com Podman:

```bash
# 1. Clonar e entrar na pasta do projeto
git clone https://github.com/luchoxiii/GestionQuincaillerie.git
cd GestionQuincaillerie

# 2. Instalar pacotes de dependência
pnpm install

# 3. Subir os serviços com podman-compose
podman-compose up -d

# (Ou com o plugin integrado do Podman 4+):
# podman compose up -d
```

#### 🛡️ Considerações Técnicas e Melhores Práticas com Podman:
1. **Segurança Rootless (Sem Root):**
   - Os contêineres executam sob o seu próprio usuário do sistema sem requerer `sudo`, anulando riscos de elevação de privilégios no servidor host.
   - As portas `5432` e `6379` são superiores a 1024, vinculando-se de imediato sem intervenções de kernel.
2. **Compatibilidade com SELinux (RHEL / Fedora / CentOS):**
   - Com o SELinux em modo `Enforcing`, o Podman gerencia volumes com isolamento rigoroso. Para volumes montados diretamente do host, acrescente `:Z` em `docker-compose.yml`.
3. **Uso Transparente via Alias:**
   Adicione os aliases oficiais em seu `~/.bashrc` ou `~/.zshrc`:
   ```bash
   alias docker=podman
   alias docker-compose=podman-compose
   ```
4. **Migrações e Execução com Podman:**
   ```bash
   pnpm --filter @ferreteria/api exec prisma migrate dev --name init
   pnpm --filter @ferreteria/api exec ts-node prisma/seed.ts
   pnpm --filter @ferreteria/api run start:dev
   pnpm --filter @ferreteria/web run dev
   ```

---

## 🏛️ Módulos Funcionais do Sistema

### 1. Terminal de Balcão & Ponto de Venda (PDV / POS)

![Terminal PDV](docs/screenshots/pos_checkout_view.jpg)

Projetado para suportar filas e alta intensidade de vendas no balcão com agilidade operacional máxima:

- **Operação 100% por Teclado**: Teclas de atalho universais (`F2` buscar produto, `F3` consulta rápida de preço, `F4` finalizar venda, `Esc` cancelar/limpar).
- **Leitor de Código de Barras USB**: Hook global `useBarcodeScanner` capturando disparos de leitores ópticos e lasers instantaneamente sem foco prévio em campos de texto.
- **Consultor Rápido de Preços & Financiamento (`F3`)**:
  - Modal global acessível a partir de qualquer tela do ERP.
  - Tipografia gigante de alto contraste visível para o cliente no balcão.
  - Pré-visualização automática de **10% OFF** no pagamento à vista em dinheiro/débito.
  - Simulador de parcelamento em até 3x sem juros e 6x fixas.
  - Estoque discriminado por depósito (Balcão de Vendas vs Depósito Central).
  - Botão de 1 clique *"Adicionar ao Carrinho (PDV)"*.
- **Pagamentos Flexíveis & Múltiplos**:
  - Dinheiro com cálculo de troco dinâmico em tempo real.
  - Cartões de Débito e Crédito com controle de lote e comprovante.
  - Pix/Transferência bancária e Conta Corrente (Crediário).
  - Pagamentos combinados (ex. 50% dinheiro e 50% transferência).
- **💰 Venda Interna com Desconto Dinâmico em Dinheiro**:
  - Ao optar pela emissão de **Comprovante Interno / Cupom Não-Fiscal (Modo Interno)**, é possível aplicar instantaneamente o **Desconto para Pagamento em Dinheiro**.
  - Seletores rápidos de porcentagem: **`5%`**, **`10%`** *(padrão)*, **`15%`** e **`20% OFF`**.
  - Recálculo automático: evidencia a economia em dinheiro obtida pelo cliente, recalcula o saldo devido e exibe o troco correto.
- **📧 Envio Automático de Comprovante por E-mail ao Cliente**:
  - Se o cliente possuir e-mail cadastrado (ou o operador informar um endereço avulso), o sistema despacha o **comprovante digital de venda** automaticamente.
  - Modelo HTML responsivo com cabeçalho da empresa, relação completa de itens, descontos, alíquotas tributárias e formas de pagamento.
- **Controle de Limite de Crédito & Bloqueio Preventivo**:
  - Monitoramento contínuo do saldo em conta corrente do cliente para evitar concessão de crédito além do limite autorizado.
  - **Bloqueio de Clientes Inadimplentes**: Rejeição automática de vendas a prazo para clientes com pendências financeiras.
- **Impressão de Comprovante Térmico**: Saída formatada para impressoras térmicas de 80mm e 58mm via comando `Ctrl+P`.

---

### 2. Faturamento Duplo & Regime Tributário

Permite atender à realidade operacional do comércio varejista de materiais com transparência e precisão:

- **Seletor de Modalidade na Finalização**:
  - **🏛️ Faturamento Fiscal Oficial (AFIP CAE)**: Geração eletrônica de **Nota Fiscal A** (empresas e pessoas jurídicas) ou **Nota Fiscal B** (consumidores finais e optantes simplificados) com **Código CAE oficial**, data de vencimento e cálculo discriminado de alíquotas de impostos (21%, 10.5%, 27%).
  - **📋 Comprovante Interno / Remito X (Não-Fiscal)**: Documento de controle interno para conferência e entrega de balcão. Desconta estoque e atualiza o saldo do caixa, oferecendo suporte a desconto em dinheiro.
- **Exportação do Livro Fiscal de Vendas para Contabilidade**:
  - Arquivo CSV em `UTF-8 com BOM` delimitado por ponto e vírgula `;` contendo **exclusivamente as transações fiscais aprovadas**.
  - Campos fiscais: Data, Tipo de Documento, Ponto de Venda, Número, CNPJ/CPF, Razão Social, Base de Cálculo, Alíquota, Valor do Imposto, Isento, Valor Total, CAE e Validade do CAE.
- **Exportação de Movimentos Internos**: Arquivo CSV separado para conferência de caixa físico e conciliação de inventário.
- **Painel de Faturamento (`/facturacion`)**: Indicadores segmentados por modalidade, filtros de data e impressão em papel A4 com QR Code oficial.

---

### 3. Catálogo, Estoque Multidepósito & Compras

- **Catálogo Abrangente de Mercadorias**:
  - Criação automática de SKU (`ART-XXXX`), código de barras EAN-13, marcas, unidades de medida e categorias hierárquicas.
  - Integração direta entre **Custo de Reposição**, **Margem de Lucro (%)** e **Preço de Venda**.
  - Suporte a múltiplas alíquotas tributárias (21%, 10.5%, 27%, Isento 0%).
  - **Atualização Coletiva de Preços**: Aplicação de reajustes percentuais em lote por categoria ou fornecedor.
- **Estoque Multidepósito & Kardex Inalterável**:
  - Distribuição de saldos entre Depósito Principal, Loja de Balcão e filiais.
  - Kardex cronológico inalterável (`StockMovement`): registra Entradas por Compras (`IN`), Saídas por Vendas (`OUT`), Ajustes manuais (`ADJUST`) e Transferências interdepósitos (`TRANSFER`).
  - Justificativa obrigatória registrada em auditoria para cada ajuste físico.
  - Transferências entre depósitos com atualização atômica de saldos.
- **Gestão de Compras e Fornecedores**:
  - Recebimento de cargas com incremento imediato no estoque.
  - Recálculo automático opcional dos preços de venda diante de oscilações no custo de reposição.
  - Acompanhamento de débitos com fornecedores e controle de ordens de pagamento.

---

### 4. CRM, Inteligência de Clientes & Churn Scoring 360°

Mecanismo preditivo que integra **Segmentação RFM (Recência, Frequência, Valor Monetário)**, **Cálculo de Risco de Churn (0 a 100%)** e ações automáticas de engajamento:

#### Perfis Comportamentais do Motor RFM:
| Segmento | Regra Algorítmica | Perfil do Cliente | Conduta Recomendada |
| :--- | :--- | :--- | :--- |
| **🌟 VIP / Campeão** | LTV $\ge \$100.000$, $\ge 3$ pedidos, última compra $\le 35$ dias | Clientes de maior receita com histórico financeiro exemplar. | Acesso prioritário a mercadorias, descontos diferenciados. |
| **🏗️ Grandes Construtoras (B2B)** | Limite crédito $\ge \$300.000$ ou PJ com LTV $> \$150.000$ | Empreiteiras, compras corporativas com nota fiscal e faturamento a prazo. | Tabela atacado, logística agendada, suporte dedicado. |
| **💎 Fiel em Potencial** | LTV $\ge \$40.000$, última compra $\le 45$ dias | Profissionais (eletricistas, encanadores) de compras frequentes. | Programa de vantagens, tabela profissional, bonificação por volume. |
| **⚠️ Em Risco de Churn** | Risco Churn Alto ou LTV $> \$30.000$ com $> 45$ dias sem compras | Clientes habituais com quebra anormal na frequência de pedidos. | Contato pró-ativo via WhatsApp, incentivo no frete. |
| **💤 Inativo / Hibernando** | $> 90$ dias sem compras (abandono confirmado) | Contas inativas em risco iminente de evasão permanente. | Ofertas de reativação com queima de estoque. |
| **🌱 Novo Promissor** | Cadastro $\le 45$ dias com 1 a 2 pedidos | Compradores novos no período crucial de retenção. | Acolhimento comercial, apresentação de linhas adicionais. |
| **🛒 Comprador Eventual** | Compras espaçadas sem constância | Consumidores residenciais atendendo a reparos pontuais. | Ofertas no balcão, itens de impulso. |

#### Recursos do Perfil 360° do Cliente:
- **Termômetro Preditivo de Abandono**: Medidor percentual de 0 a 100% com apresentação visual e causas do risco.
- **Ações Comerciais em 1 Clique**:
  - Botão *"Cobrar no PDV com Cupom"*: Abre o caixa com o cliente vinculado e o desconto aplicado.
  - Botão *"Acionar Campanha no WhatsApp"*: Abre conversa no WhatsApp Web com mensagem personalizada e cupom exclusivo.
- **Exportação de Datasets para Machine Learning (`exportMLDatasetCsv`)**: 22 variáveis estruturadas com a variável alvo `is_churned_target` (0/1) pronta para treinamento em Scikit-Learn ou XGBoost.
- **Exportação de Listas de Marketing (`exportMarketingAudienceCsv`)**: Listagem para campanhas contendo telefone, e-mail, grupo predileto e estratégia indicada.

---

### 5. Cupons de Fidelidade & Orçamentos Bimoeda (USD / ARS)

#### Gestão de Cupons (`/clientes/perfiles` - Aba Cupons):
- Configuração de cupons em porcentagem (`% OFF`) ou valor fixo (`$ OFF`).
- Filtro por grupos RFM (*VIP*, *Construtoras*, *Novos*, *Em Risco*, *Todos*).
- Regras de resgate: valor mínimo de pedido, teto de abatimento, limites de uso e validade.
- Distribuição proporcional de descontos no PDV garantindo exatidão no rateio tributário.

#### Orçamentos Bimoeda (`/presupuestos`):

![Orçamentos Bimoeda](docs/screenshots/quotes_dollar_view.jpg)

- **💵 Cotações em Dólar (USD) e Moeda Local (ARS)**:
  - Seleção ágil de moeda base (`ARS ($)` vs `USD (US$)`) na formulação do orçamento.
  - **Taxa de Câmbio Acordada Editável**: Carrega automaticamente a cotação oficial da empresa enquanto permite negociar cotações específicas por cliente ou projeto.
  - Conversão de catálogo em tempo real, calculando totais em dólares e seu valor convertido.
- **🔍 Histórico e Busca de Orçamentos por Cliente**:
  - Localização por nome, CPF/CNPJ, telefone ou código da cotação.
  - **Acesso Direto pelo Perfil do Cliente (`/clientes`)**: Botão para visualizar orçamentos ativos e históricos.
  - Badges visuais destacando `USD` e `ARS` com equivalência de conversão (`Equiv. $434.511 (Câmbio: $1.350)`).
- **⏳ Congelamento de Valores com Prazos**: Opções de 24h, 48h, 7 dias, 15 dias ou 30 dias.
- **🚦 Sinalização Inteligente de Vigência**: Verde (ativo), Amarelo (expira hoje, < 12h), Vermelho (vencido), Azul (convertido em venda).
- **📲 Envio Estruturado para WhatsApp**: Mensagem detalhando itens, cotação utilizada e totais bimoeda.
- **📄 Impressão A4 Formal para Obras**: Cabeçalho oficial com tabela de equivalência cambial, cláusula de validade e campo para assinatura.
- **⚡ Conversão Imediata em Venda no PDV**: Transforma a cotação aprovada em carrinho de vendas no PDV com a taxa de câmbio pactuada em 1 clique.

---

### 6. Central E-Commerce & API do Mercado Livre

Canal unificado para operação de vendas online, sincronia de estoque e logística de entrega:

- **Canais Conectados**: Balcão PDV, Mercado Livre, Loja Virtual, WhatsApp e Vendas Telefônicas.
- **Módulo Logístico (`/ecommerce`)**:
  - Visualização segregada por canal e fila de **Envios Pendentes de Despacho**.
  - Emissão de **Etiquetas Térmicas de Transporte 10x15 cm** com código de barras e dados do destinatário.
  - Controle de etapas de despacho: *Em separação*, *Pronto para envio*, *Em trânsito*, *Entregue*.

```
[ Comprador no Mercado Livre ]
              │ (Realiza o pedido e pagamento)
              ▼
[ Mercado Livre API ]
              │ (Notificação via Webhook IPN em tempo real)
              ▼
[ Backend ERP: POST /api/ecommerce/meli/webhook ]
              │ (Busca detalhes do pedido: GET /orders/{id})
              ▼
[ Processamento da Venda ]
  ├─ 1. Mapeamento de catálogo por SKU / Código de Barras
  ├─ 2. Baixa atômica de estoque no depósito físico
  ├─ 3. Apuração da taxa de comissão e valor líquido
  ├─ 4. Criação do pedido externo (#MELI-XXXXXXXX)
  └─ 5. Gravação no banco e difusão em tempo real
              │
              ▼
[ Frontend Web ERP ]
  ├─ 📦 Painel E-commerce (/ecommerce): Fila de despacho
  ├─ 🏷️ Impressão de Etiqueta Térmica 10x15 cm para a embalagem
  ├─ 🧾 Faturamento Fiscal Oficial com emissão de CAE em 1 clique
  └─ 📊 Dashboard Principal: Alerta de pedidos pendentes para envio
```

<a id="guia-meli"></a>
#### 🟡 Passo a Passo: Integração com a API do Mercado Livre (MELI)

Para habilitar a recepção automática de pedidos, baixa de estoque e emissão de etiquetas térmicas:

##### Passo 1: Criar Aplicação no Mercado Livre Developers
1. Acesse o portal: **[developers.mercadolibre.com.ar](https://developers.mercadolibre.com.ar/)** (ou o domínio do seu país: `.com.br`, etc.).
2. Autentique-se com a conta comercial da empresa.
3. Acesse **"Minhas Aplicações"** e selecione **"Criar Aplicação"**.
4. Preencha as informações:
   - **Nome**: `Ferreteria-ERP`
   - **Nome Curto**: `ferreteria-erp`
   - **Descrição**: *ERP multidepósito, controle de faturamento e integração omnichannel.*
   - **Categoria**: *ERP / Gestão Comercial*
   - **Redirect URI**:
     - Desenvolvimento: `http://localhost:4000/api/ecommerce/meli/callback`
     - Produção: `https://erp.seudominio.com/api/ecommerce/meli/callback`
   - **Permissões / Scopes**:
     - ✅ `read`: Acesso a pedidos, mensagens, compradores e publicações.
     - ✅ `write`: Alteração de estoque, respostas a mensagens e publicações.
     - ✅ `offline_access`: Obtenção do `refresh_token` permanente para renovação automática.
   - **Tópicos de Notificação IPN (Webhooks)**:
     - Marque: `orders_v2`, `shipments` e `items`.
     - **URL de Notificação**: `https://seu-tunel.app/api/ecommerce/meli/webhook` (ou produção).
5. Salve a aplicação e copie o **App ID** e o **Client Secret**.

##### Passo 2: Configurar o Arquivo `.env`
No arquivo `.env` na raiz ou em `apps/api/.env`:
```env
MELI_APP_ID=1234567890123456
MELI_CLIENT_SECRET=sua_chave_secreta_meli
MELI_REDIRECT_URI=http://localhost:4000/api/ecommerce/meli/callback
MELI_WEBHOOK_SECRET=seu_segredo_de_assinatura_webhook
MELI_SELLER_ID=987654321
```

##### Passo 3: Autorizar o Vínculo (OAuth 2.0 em 1 Clique)
1. Abra no navegador a URL oficial de consentimento:
   ```text
   https://auth.mercadolibre.com.ar/authorization?response_type=code&client_id=SEU_MELI_APP_ID&redirect_uri=SEU_MELI_REDIRECT_URI
   ```
2. Clique em **"Permitir"** para conceder os acessos.
3. O backend converte o código recebido em tokens com renovação automática em segundo plano.

---

### 7. Carga em Massa (Excel / Sheets) & Backup no Google Drive

Recursos para migração ágil de informações e proteção remota soberana de dados:

#### 📦 Importação em Massa de Produtos e Clientes:
- **Formatos Aceitos**: `.xlsx`, `.xls` e `.csv`.
- **Modelos de Planilha Prontos com Fórmulas**: Baixe `plantilla_productos_ferreteria.xlsx` e `plantilla_clientes_ferreteria.xlsx` em 1 clique.
- **Detecção Inteligente de Cabeçalhos**: Mapeia variações de colunas (*Código*, *SKU*, *Nome*, *Custo*, *Margem %*, *Preço Venda*, *Estoque*, *Barras*, *CPF/CNPJ*).
- **Semáforo Interativo de Validação**: Validação linha a linha em tempo real (verde: correto, vermelho: erro pontual) sem travar a importação das demais linhas.
- **Tratamento de Cadastros Existentes**: Chave seletora para atualizar preços/estoque de registros prévios ou incluir apenas novos cadastros.

#### 💾 Backups Locais e no Google Drive:
- **Snapshot Completo do Sistema**: Arquivo JSON assinado contendo as **15 coleções do ERP** (Produtos, Clientes, Vendas, Orçamentos, Caixas, Movimentos, Fornecedores, Compras, Categorias, Marcas, Depósitos, Auditoria, Configurações, Tributos e Unidades).
- **Exportação & Restauração Offline**: Arquivo `ferreteria_erp_backup_YYYY-MM-DD.json` com restauração validada em 1 clique.
- **Sincronização em Nuvem com Google Drive**:
  - Vínculo via OAuth2 limitado ao escopo `https://www.googleapis.com/auth/drive.file`.
  - Criação automática da pasta `Ferreteria_ERP_Backups`.
  - Envio multipart direto (RFC 2387) sem servidores intermediários.
  - Listagem remota e restauração em 1 clique a partir da nuvem.

```
[ Balcão / Navegador ERP ]
             │
             ├─► 📥 Download da Planilha Oficial (.xlsx / .csv)
             │        │
             │        ▼
             │   [ Google Sheets ] ◄── Atualização compartilhada com fornecedores
             │        │
             │        ▼ (Baixar como .xlsx ou .csv)
             ├─► 📤 Importação em Massa em /productos ou /clientes (validação em 1 clique)
             │
             └─► ☁️ Backup em Nuvem via OAuth 2.0
                      │
                      ▼ (Google Drive REST API v3 - Upload Multipart)
                 [ Pasta: Ferreteria_ERP_Backups ]
                      ├─ backup_ferreteria_2026-09-10.json
                      ├─ backup_ferreteria_2026-09-11.json
                      └─ Histórico acessível e restauração remota
```

<a id="guia-google-sheets"></a>
#### ☁️ Guia de Configuração: Google Sheets & Google Drive para Backup e Carga em Massa

##### Passo 1: Criar Projeto no Google Cloud Console
1. Acesse o console: **[console.cloud.google.com](https://console.cloud.google.com/)**.
2. Faça login com a conta Google empresarial.
3. Clique no seletor superior e crie um **"Novo Projeto"** (ex: `Ferreteria-ERP-Backup`).

##### Passo 2: Ativar as APIs do Google Drive e Sheets
1. No menu principal, vá em **"APIs e serviços" > "Biblioteca"**.
2. Pesquise e ative a **Google Drive API**.
3. Pesquise e ative a **Google Sheets API**.

##### Passo 3: Configurar Tela de Consentimento OAuth
1. Vá em **"APIs e serviços" > "Tela de consentimento OAuth"**.
2. Tipo de usuário: **Externo** e clique em **Criar**.
3. Defina o nome do aplicativo e e-mail de contato.
4. Em permissões, adicione o escopo `https://www.googleapis.com/auth/drive.file`.
5. Em **Usuários de teste**, adicione o e-mail da sua conta Google e salve.

##### Passo 4: Criar o ID de Cliente OAuth (Aplicativo Web)
1. Vá em **"APIs e serviços" > "Credenciais"** > **"+ Criar credenciais"** > **"ID do cliente OAuth"**.
2. Tipo: **Aplicativo da Web**.
3. Origens JavaScript autorizadas:
   - `http://localhost:5173` (Desenvolvimento)
   - `https://seu-dominio.com` (Produção)
4. URIs de redirecionamento autorizados:
   - `http://localhost:5173/configuracion`
   - `https://seu-dominio.com/configuracion`
5. Copie o **Client ID** gerado (`XXXXXXXXXXXX-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX.apps.googleusercontent.com`).

##### Passo 5: Vincular no ERP
- No ERP, acesse **Configuração (`/configuracion`) > Aba "Backups & Google Drive"**, insira o Client ID e clique em **"Conectar com Google"** (ou configure `VITE_GOOGLE_CLIENT_ID` no `.env`).

---

### 8. Acessibilidade Universal, Assistente de Voz & WCAG 2.1 (AA/AAA)

Arquitetura desenhada para garantir inclusão profissional irrestrita de operadores com deficiências visuais, auditivas, motoras ou neurodiversidades (dislexia, TDAH), em conformidade estrita com as normas **WCAG 2.1 nos níveis AA e AAA**.

Acesso global pelo botão **"Acessibilidade"** no topo da tela ou pelo atalho **`Alt + A`**. As configurações são persistidas imediatamente no `localStorage` do operador.

```
       [ Centro de Acessibilidade & Inclusão — Alt + A ]
                              │
      ┌───────────────────────┼───────────────────────┬───────────────────────┐
      ▼                       ▼                       ▼                       ▼
👁️ Adaptações          📖 Leitura,             🔊 Áudio Tático &       ⌨️ Acessibilidade
   Visuais                 Cognição & Calma        Voz Sintética           por Teclado
  ├─ Amarelo s/Preto      ├─ Fonte OpenDyslexic   ├─ Bipe laser (C6)      ├─ Anel de foco nítido
  │  (WCAG AAA 21:1)      │  (anti-rotação)       ├─ Tríade harmônica     │  (amarelo/preto)
  ├─ Alto Contraste Dark  ├─ Régua de Leitura     │  (C5-E5-G5 sucesso)   ├─ Link de salto
  ├─ Zoom Escalar (150%)  │  Horizontal           ├─ Alerta descendente   │  ("Skip to content")
  ├─ Daltonismo           ├─ Redução total de     ├─ Locução de preços    └─ Teclas diretas
  │  (4 matrizes SVG)     │  animações            │  (Consultor F3)          (F2, F3, F4, Esc)
  └─ Cursor Gigante 32px  └─ Espaçamento ampliado └─ Narração da tela
                                                     (Alt + S)
```

#### 👁️ 1. Adaptações Visuais de Alto Contraste & Daltonismo:
- **Modo Amarelo sobre Preto (WCAG AAA)**: Relação de contraste superior a 21:1 para baixa visão e fotofobia (amarelo `#facc15` sobre preto `#000000`).
- **Tema Escuro de Alto Contraste & Claro Limpo**: Sem gradientes tênues de baixa legibilidade.
- **Escala Tipográfica Dinâmica**: 4 níveis (`100% Normal`, `115% Grande`, `130% Muito Grande`, `150% Gigante`) via CSS sem quebra de leiaute.
- **Filtros SVG para Daltonismo**: Protanopia, Deuteranopia, Tritanopia e Acromatopsia calibrada.
- **Cursor de Alta Visibilidade**: Ponteiro aumentado de 32x32px com contorno amarelo de alto contraste.

#### 📖 2. Apoio à Leitura, Dislexia & Calma Cognitiva:
- **Fonte Especial para Dislexia**: Tipografia com peso na base dos glifos para prevenir rotação visual de caracteres (`b/d`, `p/q`, `n/u`), espaçamento de `0.06em` e entrelinhas de `1.75`.
- **Régua Guia de Leitura**: Destaque horizontal que acompanha o mouse ao auditar tabelas fiscais e de estoque densas.
- **Modo de Calma & Movimento Reduzido**: Bloqueia animações decorativas (`prefers-reduced-motion`) prevenindo desconforto vestibular.

#### 🔊 3. Áudio Sintético & Assistente de Voz (100% Offline):
- **Web Audio API Sintética Pura**: Emissão de ondas senoidais puras pelo navegador sem requisições externas:
  - **Bipe Laser (1046.5 Hz - Dó6)**: Confirmação nítida ao ler código de barras.
  - **Tríade de Sucesso (Dó-Mi-Sol / 523Hz, 659Hz, 784Hz)**: Acorde harmônico ao finalizar venda.
  - **Alerta Descendente (440Hz a 330Hz)**: Sinal sonoro em clientes bloqueados ou inconsistências.
- **Assistente Vocal Offline (Web Speech API)**:
  - **Consultor F3**: Vocalização de nome, preço e saldo em estoque.
  - **Conclusão de Venda no PDV**: Enunciado do total pago e do troco entregue.
  - **Narração da Tela (`Alt + S`)**: Leitura do título e contexto da tela ativa.

---

### 9. Painel de Configurações Gráficas Integrado

Painel administrativo centralizado (`/configuracion`) estruturado em 4 abas visuais:

#### 🟡 1. Aba Mercado Libre (`MeliSettingsTab.tsx`):
- Credenciais da API: `App ID`, `Client Secret`, `Seller ID`, `Webhook Secret` e `Redirect URI`.
- Seleção de ambiente: **Modo Sandbox** vs **Produção**, e alternador de sincronização automática.
- Diagnóstico: Botões de **"Testar Conexão MELI"** e **"Vincular Conta (OAuth)"**.

#### 📧 2. Aba E-mail Corporativo & Alertas (`EmailSettingsTab.tsx`):
- Parâmetros SMTP: Host, Porta (`587`, `465`, `25`), Criptografia (`STARTTLS`, `SSL/TLS`), credenciais e e-mail em cópia oculta (BCC).
- Automação: Envio automático de comprovantes na conclusão de vendas com modelos HTML elegantes.
- Ferramenta ao vivo: **"Enviar E-mail de Teste"** com log dos últimos disparos.

#### ☁️ 3. Aba Google Drive & Backups (`BackupSettingsTab.tsx`):
- Configuração do Client ID OAuth (`VITE_GOOGLE_CLIENT_ID`), autorização e upload instantâneo de snapshots.

#### 🏢 4. Aba Empresa & Moeda Regional:
- Dados fiscais da empresa: Razão Social, CNPJ/CUIT, Endereço, Ponto de Venda e logotipo.
- **🪙 Mecanismo de Moeda Comercial Global**:
  - Alternador de moeda com impacto simultâneo no PDV, comprovantes, relatórios e síntese de voz.
  - **Moedas Pré-configuradas**:
    - **ARS ($)** — Peso Argentino (`es-AR`, 2 decimais).
    - **USD (US$)** — Dólar Americano (`en-US`, 2 decimais).
    - **EUR (€)** — Euro (`es-ES`, 2 decimais).
    - **CLP ($)** — Peso Chileno (`es-CL`, 0 decimais).
    - **UYU ($U)** — Peso Uruguaio (`es-UY`, 2 decimais).
    - **BRL (R$)** — Real Brasileiro (`pt-BR`, 2 decimais).
    - **PYG (Gs.)** — Guarani Paraguaio (`es-PY`, 0 decimais).
    - **COP ($)** — Peso Colombiano (`es-CO`, 0 decimais).
    - **MXN ($)** — Peso Mexicano (`es-MX`, 2 decimais).
    - **PEN (S/)** — Sol Peruano (`es-PE`, 2 decimais).
    - **Personalizada**: Código ISO, símbolo, locale e número de casas decimais (`0` a `4`).
  - **Caixa de Pré-Visualização ao Vivo**: Exibe a formatação numérica instantaneamente ao ajustar parâmetros.
  - **Sincronização em Tempo Real**: Atualização imediata em memória (`syncCurrencyCache()`) dispensando recarregamento da página.

---

### 10. Multi-Lojas & Filiais Comerciais

![Gestão Multi-Lojas](docs/screenshots/multistore_view.jpg)

- **Gestão de Filiais (`StoresSettingsTab.tsx`)**:
  - Cadastro, alteração e desativação de filiais comerciais.
  - Ponto de venda fiscal associado (4 dígitos, ex. `0001`, `0002`).
  - Definição da Matriz (`isMain`), endereço, telefone, e-mail e responsável.
- **Seletor de Filial no Cabeçalho**:
  - Menu no cabeçalho permitindo alternar a loja ativa com um clique.
  - Exibição visual do estabelecimento corrente e de seu ponto de venda (`PV:0001`).
  - Associação com os depósitos físicos para atualização de estoque localizado.

---

### 11. Motor de Busca em Linguagem Natural Multicampos

Permite encontrar itens, clientes e colaboradores digitando de forma coloquial:

- **Lematização em Português e Espanhol**:
  - Reconhece plurais e singulares (*"pregos"* ⇄ *"prego"*, *"parafusos"* ⇄ *"parafuso"*, *"tintas"* ⇄ *"tinta"*).
- **Normalização Fonética e sem Acentos**:
  - Remove acentos e padroniza maiúsculas/minúsculas (*"elétrico"* = *"eletrico"*).
- **Casamento de Múltiplos Tokens**:
  - Expressões como *"furadeira impacto 700w bosch"* dividem-se em termos cruzados entre Nome, Marca, SKU, Código de Barras, Categoria ou Descrição.
- **Busca Global de Clientes**:
  - Pesquisa por Razão Social, Nome Fantasia, CPF/CNPJ, RG, Endereço, Cidade, Telefone ou E-mail.
- **Execução em Memória**:
  - 100% nativa (`packages/shared/src/utils/natural-search.ts`), propiciando respostas em microssegundos no navegador e no backend.

---

### 12. Controle de Caixa, Posição em Tempo Real & Fechamento Diário Z

![Controle de Caixa](docs/screenshots/cash_register_view.jpg)

Controle financeiro de balcão completo (`/caja`):

- **Abertura de Caixa & Início de Turno**:
  - Identificação do terminal (ex. *Caixa Principal 01*, *Balcão 02*).
  - Entrada do **Fundo de Troco Inicial**.
  - Marcação de data e hora com trava de operador.
- **Acompanhamento ao Vivo**:
  - **4 Indicadores Principais**: Situação do Turno, Fundo Inicial, Entradas/Saídas e **Saldo Teórico em Dinheiro** (`Fundo Inicial + Vendas em Dinheiro - Saídas Manuais`).
  - Histórico cronológico de cada lançamento financeiro.
- **Sangrias e Suprimentos**:
  - Registro de despesas menores (adiantamentos, fretes, pagamentos de despesas).
  - Retiradas de segurança por excesso de numerário em caixa.
- **Conferência Física & Fechamento Z**:
  - Apuração às cegas dos valores em cédulas e moedas pelo operador.
  - **Cálculo Automático de Divergências**:
    - *Exato:* Fechamento com precisão matemática perfeita.
    - *Sobra:* Aponta o valor excedente no caixa.
    - *Falta:* Destaca em vermelho a diferença em falta.
  - Justificativa obrigatória para encerramento com discrepâncias.
- **Exportação do Turno para CSV / Excel**:
  - Download das movimentações para conciliação contábil e administrativa.
- **Autenticidade Criptográfica**:
  - Todas as aberturas, lançamentos e fechamentos são selados no Livro-Razão Forense SHA-256.

---

## 🛡️ Segurança, Auditoria & Normas OWASP Top 10

### Matriz de Papéis e Permissões Granulares (RBAC)

O acesso a recursos operacionais é estritamente delimitado por papéis:

| Módulo | Chave de Permissão | Ação Autorizada | Nível de Risco |
| :--- | :--- | :--- | :--- |
| **PDV** | `pos:access` | Operar frente de caixa | Padrão |
| | `pos:discount` | Conceder descontos manuais e cupons | ⚠️ Crítico |
| | `pos:price_check` | Consultor rápido F3 de preços | Baixo |
| **Vendas** | `sales:read` | Visualizar histórico de vendas | Baixo |
| | `sales:create` | Emitir vendas e faturas | Padrão |
| | `sales:void` | Cancelar vendas e gerar Notas de Crédito | ⚠️ Crítico |
| | `invoicing:emit_fiscal`| Gerar faturamento fiscal com CAE | Alto |
| **Estoque** | `products:read` | Consultar catálogo e saldos | Baixo |
| | `products:create` | Cadastrar e editar produtos | Médio |
| | `products:edit_price` | Alterar custos e preços de venda | ⚠️ Crítico |
| | `products:mass_price` | Reajuste de preços em lote | ⚠️ Crítico |
| | `stock:adjust` | Lançar ajustes físicos de estoque | ⚠️ Crítico |
| | `stock:transfer` | Transferir itens entre depósitos | Médio |
| **Clientes**| `customers:read` | Consultar base de clientes | Baixo |
| | `customers:write` | Editar dados cadastrais e fiscais | Médio |
| | `customers:credit_limit`| Alterar limite de crédito da conta | Alto |
| | `customers:ban` | Inativar ou bloquear inadimplentes | ⚠️ Crítico |
| **Caixa** | `cash:open` / `cash:close`| Abertura e fechamento Z de caixa | Alto |
| | `cash:movements` | Lançamentos de sangrias e suprimentos | Alto |
| **Auditoria**| `audit:read` | Visualizar livro-razão forense (**Apenas Admin**) | ⚠️ Crítico (Admin) |

> [!IMPORTANT]
> **Confidencialidade Rigorosa de Auditoria**: O módulo de Auditoria e as trilhas dos operadores são estritamente confidenciais e **acessíveis unicamente para usuários com papel `ADMIN`** (`audit:read`). Ficam ocultos em menus laterais e rotas para operadores de caixa e supervisores.

---

### Conformidade de Segurança OWASP Top 10

Medidas ativas implementadas contra os 10 principais riscos de segurança na web:

| Critério OWASP | Medida Implementada no Código | Nível de Proteção |
| :--- | :--- | :---: |
| **A01: Broken Access Control** | `JwtAuthGuard` global em todos os endpoints + `PermissionsGuard` granular. Auditoria restrita ao Admin. | 🟢 **100% Blindado** |
| **A02: Cryptographic Failures** | Senhas com `bcryptjs` (salt rounds = 10). Cookies: `HttpOnly`, `SameSite: strict`, `Secure`. Anonimização de credenciais (`[REDACTED]`) em logs. | 🟢 **100% Blindado** |
| **A03: Injection & Mass Assignment** | Consultas parametrizadas com Prisma ORM. NestJS `ValidationPipe` com `forbidNonWhitelisted: true`. Zero uso de `dangerouslySetInnerHTML`. Sanitização de planilhas CSV (`sanitizeCsvCell`). | 🟢 **100% Blindado** |
| **A04: Insecure Design** | Limite de payload HTTP fixado em 10 MB. Bloqueio no balcão de inadimplentes e validação estrita de limite de crédito. | 🟢 **100% Blindado** |
| **A05: Security Misconfiguration** | Cabeçalhos de segurança `@fastify/helmet` (CSP, anti-Clickjacking, HSTS). Validação estrita de CORS. Swagger desligado em produção. | 🟢 **100% Blindado** |
| **A06: Vulnerable Components** | Varredura rigorosa com pnpm lockfile. Substituição forçada `proxy-addr >= 2.0.8`. Zero vulnerabilidades críticas em dependências. | 🟢 **100% Blindado** |
| **A07: Identification Failures** | Limitador de taxa `@fastify/rate-limit` (300 req/min por IP). Campo `tokenVersion` no banco para invalidação instantânea. Senhas de 8 a 128 caracteres. | 🟢 **100% Blindado** |
| **A08: Software & Data Integrity** | Verificação estrita com TypeScript (`tsc --noEmit`, 0 erros). DTOs validados via class-validator em todos os controladores. | 🟢 **100% Blindado** |
| **A09: Logging Failures** | Livro-razão transacional imutável no PostgreSQL (`AuditLog`) registrando usuário, ação, entidade, data e IP com dados anonimizados. | 🟢 **100% Blindado** |
| **A10: Server-Side Request Forgery (SSRF)**| Validador rígido de saídas (`isValidSafeUrl`) bloqueando metadados de nuvem (`169.254.169.254`, `metadata.google.internal`), redes privadas e portas atípicas. | 🟢 **100% Blindado** |

---

### Livro-Razão Criptográfico Inalterável SHA-256

![Auditoria SHA-256](docs/screenshots/audit_bitacora_view.jpg)

Para auditorias jurídicas, fiscais e perícias judiciais, o ERP possui um mecanismo inalterável de selagem com **encadeamento de hashes SHA-256 (Tamper-Evident Ledger)**:

```
[ Bloco Gênesis (SHA-256) ]
           │
           ▼
[ Bloco #1: Cadastro Usuário ] ─── Hash #1 = SHA256(#1 | Data | Usuário | Ação | Entidade | Dados | HashPrev )
           │
           ▼
[ Bloco #2: Venda no PDV     ] ─── Hash #2 = SHA256(#2 | Data | Usuário | Ação | Entidade | Dados | Hash #1   )
           │
           ▼
[ Bloco #3: Ajuste Estoque   ] ─── Hash #3 = SHA256(#3 | Data | Usuário | Ação | Entidade | Dados | Hash #2   )
```

#### 🔒 Garantias Criptográficas:
1. **Encadeamento Sequencial**: Cada lançamento calcula seu hash combinando sequência, data/hora, operador, ação, entidade, corpo JSON e o hash do bloco imediatamente anterior (`previousHash`).
2. **Identificação Matemática de Adulteração**:
   - Caso qualquer registro seja alterado no banco de dados, o recálculo diverge: `Alerta: Bloco #N Adulterado`.
   - Caso um registro seja excluído, uma quebra sequencial é detectada.
   - Caso um registro seja inserido sem a cadeia, o encadeamento é rompido.
3. **Eventos Rastreados Obrigatoriamente**:
   - Cadastros, permissões, alterações de senha e desativações de usuários.
   - Cadastros de clientes, ajustes de limite de crédito e bloqueios.
   - Vendas de balcão, notas fiscais, cupons aplicados e cancelamentos (`VOID`).
   - Ajustes manuais de estoque, transferências entre lojas e fechamentos de caixa.
4. **Instrumentos de Perícia em `/auditoria`**:
   - **"Verificar Integridade SHA-256"**: Recalcula a cadeia completa em milissegundos emitindo laudo visual.
   - **Download do Laudo Pericial Assinado (JSON)**: Exportação integral do processo pericial com metadados para auditorias externas.
   - **Exportação CSV Certificada**: Relação contendo identificador, hash corrente e hash anterior para análise em planilhas.

---

## 🧪 Suíte de Testes Automatizados, Estresse & Performance (190 Testes)

A infraestrutura de testes garante solidez nas operações e evita congelamento do sistema sob uso intensivo:

```bash
# Executar a suíte completa de testes (Frontend + Backend)
pnpm -r run test
```

### 📊 Painel de Execução de Testes:

| Camada / Pacote | Framework | Arquivos de Teste | Total de Testes | Resultado |
| :--- | :---: | :---: | :---: | :---: |
| **Frontend Web (`apps/web`)** | Vitest 2.1.9 + JSDOM | 20 arquivos | **141 testes** | ✅ **141/141 Aprovados (100%)** |
| **Backend API (`apps/api`)** | Jest 29 + ts-jest | 8 arquivos | **49 testes** | ✅ **49/49 Aprovados (100%)** |
| **TOTAL DO MONOREPO** | Monorepo pnpm | **28 arquivos** | **190 testes** | 🏆 **190 Aprovados / 0 Falhas (100%)** |

### 🔥 Cenários de Estresse e Alta Concorrência:
- **Livro-Razão SHA-256 (`audit-ledger.spec.ts`)**: Efeito avalanche, integridade da cadeia, detecção de adulteração e exclusão.
- **Busca em Linguagem Natural (`natural-search.spec.ts`)**: Lematização, normalização fonética e casamento de termos em produtos, clientes e usuários.
- **Motor de Moedas (`utils.spec.ts`)**: Formatação em ARS, USD, EUR, CLP (sem casas decimais), BRL, moedas customizadas e sincronização com localStorage.
- **Carrinho PDV Massivo (`pos.store.stress.spec.ts`)**: 500 produtos simultâneos com recálculo de impostos e subtotais em < 500ms.
- **Carga de Quantidades**: 1.000 alterações seguidas de quantidade sem perda de resposta ou acúmulo de memória.
- **Expiração de Orçamentos (`quotes.service.stress.spec.ts`)**: Avaliação algorítmica de 10.000 orçamentos em < 200ms.
- **Importação de Planilhas (`excel-import.service.stress.spec.ts`)**: Processamento de 3.000 linhas de produtos e 3.000 clientes com validação em < 2.5s.
- **Inteligência de Churn (`customer-analytics.service.stress.spec.ts`)**: Análise RFM, cálculo preditivo de churn e geração de datasets ML sobre 5.000 clientes em < 1.5s.
- **Snapshots JSON (`backup.service.stress.spec.ts`)**: Serialização e restauração de 20.000 entidades em < 1s.
- **Catálogo Backend sob Demanda (`products.service.stress.spec.ts`)**: Estoque multidepósito calculado em 100 páginas seguidas e 200 buscas simultâneas em < 1s.
- **Logins Concorrentes (`auth.service.stress.spec.ts`)**: 100 acessos simultâneos executando hashing bcrypt em paralelo.
- **Auditoria de Cargas Profundas (`audit.interceptor.stress.spec.ts`)**: Sanitização recursiva em estruturas JSON com 12 níveis e 2.000 chaves em < 100ms.
- **Envios de E-mail (`email-notification.service.stress.spec.ts`)**: 500 envios em fila, 10.000 cálculos de desconto (< 300ms) e 1.000 e-mails formatados (< 1.5s).

---

## ⌨️ Atalhos de Teclado & Guia Rápido de Acessibilidade

| Tecla / Combinação | Módulo | Ação Executada |
| :--- | :---: | :--- |
| **`F2`** | PDV | Posiciona o cursor no campo de pesquisa rápida de produtos. |
| **`F3`** | Global | Abre o **Consultor Rápido de Preços e Financiamento** em qualquer tela. |
| **`F4`** | PDV | Abre o modal de pagamento, seleção de meios e regime fiscal. |
| **`Escape`** | PDV / Modais | Limpa o carrinho de vendas ou fecha a caixa de diálogo aberta. |
| **`Enter` (Leitor)**| PDV | Inclui o item lido pelo código de barras diretamente na venda com bipe. |
| **`Ctrl + P`** | PDV / Faturas | Imprime o cupom térmico de 80mm ou a nota fiscal A4 com QR Code. |
| **`Alt + A`** | Global | **Abre / Fecha o Centro de Acessibilidade Universal** (Contraste, voz, zoom). |
| **`Alt + S`** | Global | **Assistente Vocal**: Sintetiza por áudio o título e o contexto da tela ativa. |
| **`Alt + V` / 🔊** | Consultor F3 | **Vocaliza** o nome do produto, valor em dinheiro e saldo em estoque. |
| **`Tab` inicial** | Global | **Salto para o conteúdo principal** (Skip Link para leitores de tela WCAG 2.4.1). |

---

## 🧭 Mapa de Rotas da Aplicação

| Ícone | Módulo | Rota | Descrição do Recurso |
| :---: | :--- | :--- | :--- |
| 📊 | **Dashboard** | `/` | Indicadores de receita, gráficos Recharts, envios pendentes e exportação CSV. |
| 📦 | **Produtos** | `/productos` | Catálogo de itens, busca por SKU/EAN, filtros, reajustes, importação e exportação. |
| ➕ | **Novo Produto** | `/productos/nuevo` | Cadastro de produto com cálculo de margens e alíquotas tributárias. |
| 🏷️ | **Categorias** | `/categorias` | Organização de categorias e subcategorias hierárquicas. |
| 🏭 | **Estoque** | `/inventario` | Saldos multidepósito, Kardex cronológico, transferências e exportação CSV. |
| 🛒 | **Ponto de Venda**| `/pos` | Terminal de balcão: atalhos `F2`, `F3`, `F4`, pagamentos múltiplos e leitor de barras. |
| 🔍 | **Consultor Preços**| Modal (`F3`)| Preço imediato, estoque por depósito, simulação de parcelas e 10% OFF à vista. |
| 🧾 | **Vendas** | `/ventas` | Auditoria de vendas, filtro de regime fiscal, reimpressão, estornos e exportação CSV. |
| 👥 | **Clientes** | `/clientes` | Cadastro fiscal, conta corrente, bloqueio de inadimplentes e planilhas Excel. |
| 🧠 | **Perfis & Churn** | `/clientes/perfiles`| Segmentação RFM, risco de abandono (0-100%), cartões 360° e exportação para ML. |
| 🚚 | **Fornecedores** | `/proveedores` | Diretório de distribuidores, CNPJ, saldo devedor, pagamentos e CSV. |
| 📑 | **Compras** | `/compras` | Histórico de notas de compra, entrada automática no estoque e exportação CSV. |
| ➕ | **Lançar Compra**| `/compras/nueva` | Recebimento com atualização de custo de reposição e margem de venda. |
| 📄 | **Faturamento** | `/facturacion` | Notas Fiscais A/B com CAE, Cupons Não-Fiscais e **Livro Fiscal de Vendas CSV**. |
| 💰 | **Caixa** | `/caja` | Abertura de turno, lançamentos manuais de sangria/suprimento e fechamento Z. |
| 📈 | **Relatórios** | `/reportes` | Livro fiscal digital, margens comerciais e valorização de inventário. |
| 🛡️ | **Auditoria** | `/auditoria` | Livro-razão forense com checagem SHA-256 e laudo JSON assinado (**Apenas Admin**). |
| ⚙️ | **Configurações**| `/configuracion` | Dados fiscais, seletor cambial, backups no Google Drive, MELI e SMTP. |
| 👤 | **Usuários** | `/usuarios` | Equipe, atribuição de perfis de acesso e permissões individuais. |

---

## 🏗️ Stack Tecnológico & Arquitetura do Monorepo

| Camada | Tecnologias | Função |
| :--- | :--- | :--- |
| **Frontend SPA** | React 18/19, Vite 5.4, Tailwind CSS 3.4, TypeScript | Aplicação web responsiva e veloz com tipagem estrita. |
| **Componentes UI** | shadcn/ui, Radix UI, Lucide Icons | Componentes acessíveis, diálogos modais e tabelas limpas. |
| **Estado e Cache** | Zustand 4.5, TanStack Query (React Query 5) | Carrinho do PDV em memória e cache sincronizado com a API. |
| **Métricas e Gráficos** | Recharts | Visualizações dinâmicas de faturamento, margens e rentabilidade. |
| **Planilhas** | SheetJS (`xlsx`) | Geração e leitura no navegador de arquivos `.xlsx`, `.xls` e `.csv`. |
| **API Backend REST** | NestJS 10, Fastify, TypeScript | Backend modular, validação com DTOs e Swagger OpenAPI. |
| **Banco de Dados & ORM** | PostgreSQL 16, Prisma ORM 5 | 48 modelos relacionais com chaves estrangeiras e migrações. |
| **Cache e Filas** | Redis 7 | Armazenamento temporário de alta velocidade e tarefas em fila. |
| **Estrutura Monorepo** | pnpm Workspaces | Compartilhamento do pacote comum `@ferreteria/shared`. |

### Estrutura de Pastas do Projeto:

```
GestionQuincaillerie/
├── apps/
│   ├── api/                     # Backend NestJS 10 + Fastify
│   │   ├── prisma/
│   │   │   ├── schema.prisma    # 48 Modelos relacionais normalizados
│   │   │   └── seed.ts          # Script de povoamento inicial de dados mestres
│   │   └── src/
│   │       ├── modules/         # Auth, Users, Products, Categories, Warehouses,
│   │       │                    # Inventory, Suppliers, Purchases, Sales,
│   │       │                    # CashRegister, Customers, Invoicing, Reports,
│   │       │                    # Audit, Settings, Telemetry
│   │       └── common/          # Guards, Interceptors, Decorators, Filters
│   └── web/                     # Frontend React 18/19 + Vite
│       └── src/
│           ├── components/
│           │   ├── ui/          # 21 componentes reaproveitáveis shadcn/ui
│           │   ├── common/      # PriceCheckModal, DataTable, ConfirmDialog
│           │   ├── products/    # ProductExcelImportModal
│           │   ├── customers/   # CustomerExcelImportModal, CustomerProfileModal
│           │   ├── quotes/      # NewQuoteModal, QuotePrintModal, UpdateExchangeRateModal
│           │   ├── settings/    # BackupSettingsTab, MeliSettingsTab, EmailSettingsTab
│           │   └── layout/      # Sidebar, Header com F3, DashboardLayout
│           ├── pages/           # Telas do sistema (PDV, Faturamento, Cotações, Caixa)
│           ├── services/        # Serviços API, backup, excel-import, google-drive, quotes
│           ├── stores/          # Armazenamento Zustand (auth, pos, cash, accessibility)
│           └── hooks/           # useBarcodeScanner, useToast
├── packages/
│   └── shared/                  # Biblioteca compartilhada: tipos TypeScript e esquemas Zod
├── docs/
│   └── screenshots/             # Imagens da interface e GIF demonstrativo
├── docker-compose.yml           # Configuração dos contêineres PostgreSQL 16 e Redis 7
├── pnpm-workspace.yaml          # Configuração do monorepo e substituições de pacotes
└── package.json                 # Scripts centrais do monorepo
```

---

## ⚙️ Variáveis de Ambiente

Modelo disponível em `.env.example`:

```env
# ==========================================
# Banco de Dados & Cache
# ==========================================
DATABASE_URL="postgresql://ferreteria:ferreteria_dev_2026@localhost:5432/ferreteria_db?schema=public"
REDIS_HOST=localhost
REDIS_PORT=6379

# ==========================================
# Autenticação e Segurança JWT
# ==========================================
JWT_SECRET=super-secret-key-change-in-production-2026
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# ==========================================
# Servidor e URLs
# ==========================================
API_PORT=4000
API_HOST=0.0.0.0
FRONTEND_URL=http://localhost:5173

# ==========================================
# Integração Mercado Livre API (MELI)
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
# Notificações e Comprovantes por E-mail (SMTP)
# ==========================================
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=faturamento@loja.com
SMTP_PASS=sua_senha_de_aplicativo
SMTP_FROM_NAME="Loja Central de Ferragens"
SMTP_FROM_EMAIL=faturamento@loja.com
SMTP_BCC=financeiro@loja.com
```

---

## 🛠️ Comandos de Manutenção & Qualidade

```bash
# Executar todos os testes do monorepo (Jest + Vitest)
pnpm -r run test

# Executar apenas testes do Frontend (Vitest)
pnpm --filter @ferreteria/web run test

# Executar apenas testes do Backend (Jest)
pnpm --filter @ferreteria/api run test

# Execução interativa contínua de testes (Watch mode)
pnpm --filter @ferreteria/web run test:watch

# Checagem rigorosa de tipos TypeScript (0 erros em todo o monorepo)
pnpm -r run lint

# Build completo de produção (Frontend em chunks + Backend NestJS)
pnpm -r run build

# Abrir o visualizador gráfico de banco de dados Prisma Studio
pnpm --filter @ferreteria/api exec prisma studio

# Parar os contêineres (Docker ou Podman)
docker compose down    # ou: podman-compose down

# Inicializar os contêineres (Docker ou Podman)
docker compose up -d   # ou: podman-compose up -d
```

---

## 📄 Licença

Desenvolvido para **GestionQuincaillerie**. Todos os direitos reservados.

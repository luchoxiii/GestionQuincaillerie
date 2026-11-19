# 🛠️ GestionQuincaillerie — ERP & Caisse POS pour Quincaillerie

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
[![Audit Report](https://img.shields.io/badge/Audit-Comprehensive%20Report-blue.svg)](./AUDIT_REPORT.fr.md)

[![WCAG 2.1](https://img.shields.io/badge/WCAG%202.1-AA%20%2F%20AAA-success.svg)](https://www.w3.org/WAI/standards-guidelines/wcag/)
[![A11y Voice](https://img.shields.io/badge/A11y-Voice%20%26%20Audio-blueviolet.svg)](https://developer.mozilla.org/fr/docs/Web/API/Web_Speech_API)
[![OWASP Top 10](https://img.shields.io/badge/OWASP%20Top%2010-Compliant-success.svg)](https://owasp.org/)

> **Système Intégral de Gestion Commerciale, Contrôle de Stock Multi-Dépôts, Double Facturation Fiscale, Terminal de Point de Vente (POS) Haute Vitesse et Synchronisation Omnicanale pour Quincailleries, Négoce de Matériaux et Bricolage.**  
> Dépôt officiel : [https://github.com/luchoxiii/GestionQuincaillerie](https://github.com/luchoxiii/GestionQuincaillerie)  
> 🌐 **Languages / Idiomas / Langues:** [🇪🇸 Español](./README.md) • [🇺🇸 English](./README.en.md) • [🇧🇷 Português](./README.pt.md) • [🇫🇷 Français](./README.fr.md)  
> 📋 **Audit & Security Reports / Informes Técnicos:** [🇪🇸 Español (AUDIT_REPORT.md)](./AUDIT_REPORT.md) • [🇺🇸 English (AUDIT_REPORT.en.md)](./AUDIT_REPORT.en.md) • [🇧🇷 Português (AUDIT_REPORT.pt.md)](./AUDIT_REPORT.pt.md) • [🇫🇷 Français (AUDIT_REPORT.fr.md)](./AUDIT_REPORT.fr.md)

---

## 📑 Sommaire

1. [📸 Démonstration Visuelle](#-démonstration-visuelle)
2. [⚡ Guide Complet d'Installation et de Déploiement](#-guide-complet-dinstallation-et-de-déploiement)
   - [🖥️ Mode 1 : Installation Locale Bare-Metal (Sans Docker / Offline-First)](#modo-1-installation-locale-bare-metal-sans-docker--offline-first)
     - [1.1. Mode Autonome Offline-First (Frontend Seul / Persistance Locale)](#11-mode-autonome-offline-first-frontend-seul--persistance-locale)
     - [1.2. Mode Full-Stack Bare-Metal (Frontend + Backend NestJS + PostgreSQL Local)](#12-mode-full-stack-bare-metal-frontend--backend-nestjs--postgresql-local)
   - [🐳 Mode 2 : Déploiement avec Docker & Docker Compose](#modo-2-déploiement-avec-docker--docker-compose)
   - [🦭 Mode 3 : Déploiement avec Podman & Podman Compose (Rootless & Entreprise)](#modo-3-déploiement-avec-podman--podman-compose-rootless--entreprise)
3. [🏛️ Modules Fonctionnels du Système](#️-modules-fonctionnels-du-système)
   - [🛒 1. Terminal de Comptoir & Point de Vente (POS)](#1-terminal-de-comptoir--point-de-vente-pos)
   - [🏛️ 2. Double Facturation & Régime Fiscal](#2-double-facturation--régime-fiscal)
   - [📦 3. Catalogue, Stock Multi-Dépôts & Achats](#3-catalogue-stock-multi-dépôts--achats)
   - [👥 4. CRM, Intelligence Client & Churn Scoring 360°](#4-crm-intelligence-client--churn-scoring-360)
   - [🎟️ 5. Bons de Fidélité & Devis Bidevise (USD / ARS)](#5-bons-de-fidélité--devis-bidevise-usd--ars)
   - [🌐 6. Centre E-Commerce & API Mercado Libre](#6-centre-e-commerce--api-mercado-libre)
     - [🟡 Guide de Connexion : Mercado Libre API (MELI)](#guia-meli)
   - [💾 7. Import Massif (Excel / Sheets) & Sauvegarde Google Drive](#7-import-massif-excel--sheets--sauvegarde-google-drive)
     - [☁️ Guide de Configuration : Google Sheets & Google Drive](#guia-google-sheets)
   - [♿ 8. Accessibilité Universelle, Assistant Vocal & WCAG 2.1 (AA/AAA)](#8-accessibilité-universelle-assistant-vocal--wcag-21-aaaa)
   - [⚙️ 9. Panneau de Configuration Graphique Intégré](#9-panneau-de-configuration-graphique-intégré)
   - [🏪 10. Multi-Magasins & Succursales Commerciales](#10-multi-magasins--succursales-commerciales)
   - [🔍 11. Moteur de Recherche en Langage Naturel Multi-Champs](#11-moteur-de-recherche-en-langage-naturel-multi-champs)
   - [💵 12. Gestion de Caisse, Position en Temps Réel & Clôture Z](#12-gestion-de-caisse-position-en-temps-réel--clôture-z)
4. [🛡️ Sécurité, Audit & Standards OWASP Top 10](#️-sécurité-audit--standards-owasp-top-10)
   - [Matrice des Rôles et Permissions Granulaires (RBAC)](#matrice-des-rôles-et-permissions-granulaires-rbac)
   - [Conformité de Sécurité OWASP Top 10](#conformité-de-sécurité-owasp-top-10)
   - [Registre Cryptographique Inaltérable SHA-256](#registre-cryptographique-inaltérable-sha-256)
5. [🧪 Suite de Tests Automatisés, Stress & Performance (190 Tests)](#-suite-de-tests-automatisés-stress--performance-190-tests)
6. [⌨️ Raccourcis Clavier & Guide Rapide d'Accessibilité](#️-raccourcis-clavier--guide-rapide-daccessibilité)
7. [🧭 Plan de Routage de l'Application](#-plan-de-routage-de-lapplication)
8. [🏗️ Stack Technologique & Architecture Monorepo](#️-stack-technologique--architecture-monorepo)
9. [⚙️ Variables d'Environnement](#️-variables-denvironnement)
10. [🛠️ Commandes de Maintenance & Qualité](#️-commandes-de-maintenance--qualité)
11. [📄 Licence](#-licence)

---

## 📸 Démonstration Visuelle

### Visite Guidée Complète du Système (ERP + POS)
![Démonstration du Système](docs/screenshots/walkthrough.gif)

### Écrans Majeurs & Points Forts d'Architecture

| Terminal de Vente au Comptoir | Devis Bidevise (USD / ARS) |
| :---: | :---: |
| ![Terminal POS](docs/screenshots/pos_checkout_view.jpg) | ![Devis Bidevise](docs/screenshots/quotes_dollar_view.jpg) |
| *Raccourcis (F2/F3/F4), lecteur de code-barres, remise espèces et rendu monnaie en direct.* | *Conversion en temps réel, taux bloqué, compte à rebours de validité et envoi WhatsApp.* |

| Gestion de Caisse et Clôture Z | Multi-Magasins et Succursales |
| :---: | :---: |
| ![Gestion de Caisse](docs/screenshots/cash_register_view.jpg) | ![Multi-Magasins](docs/screenshots/multistore_view.jpg) |
| *Solde théorique en temps réel, mouvements d'espèces, écarts de caisse et export CSV.* | *Gestion des dépôts, points de vente fiscaux et commutateur dans l'en-tête.* |

| Accessibilité Universelle et Haut Contraste | Registre Forensique SHA-256 |
| :---: | :---: |
| ![Accessibilité](docs/screenshots/a11y_high_contrast_view.jpg) | ![Audit SHA-256](docs/screenshots/audit_bitacora_view.jpg) |
| *Jaune sur noir (21:1 AAA), police pour dyslexie, assistant vocal et bips Web Audio.* | *Chaînage de hachages style blockchain, détection d'altération et export JSON signé.* |

---

## ⚡ Guide Complet d'Installation et de Déploiement

<a id="modo-1-installation-locale-bare-metal-sans-docker--offline-first"></a>
### 🖥️ Mode 1 : Installation Locale Bare-Metal (Sans Docker / Offline-First)

#### 1.1. Mode Autonome Offline-First (Frontend Seul / Persistance Locale)
Ne nécessite aucune base de données externe ni de serveur backend actif. L'ensemble de l'ERP (catalogue produits, point de vente POS, encaissements combinés, remises en espèces, devis bidevises, bons de réduction, journal d'audit, rapports financiers et import de fichiers Excel) opère de manière autonome dans le navigateur grâce à un stockage `localStorage` indexé haute vitesse.

```bash
# 1. Cloner le dépôt
git clone https://github.com/luchoxiii/GestionQuincaillerie.git
cd GestionQuincaillerie

# 2. Installer les dépendances du monorepo
pnpm install

# 3. Démarrer le frontend en développement
pnpm --filter @ferreteria/web run dev
```

- **Accès Web :** [http://localhost:5173](http://localhost:5173)
- **Identifiants Maîtres :** Utilisateur : `admin` | Mot de passe : `admin123` (ou `admin`)

---

#### 1.2. Mode Full-Stack Bare-Metal (Frontend + Backend NestJS + PostgreSQL Local)
Conçu pour opérer avec une persistance relationnelle sur disque sans virtualisation de conteneurs.

##### 1. Installer les Prérequis Système :
- **PostgreSQL 16** : Télécharger et installer pour votre système d'exploitation. Créer la base de données `ferreteria_db` et l'utilisateur `ferreteria`.
- **Redis 7** *(optionnel pour le cache)* : Sous Windows via [Memurai](https://www.memurai.com/) ou WSL2 ; sous Linux `sudo apt install redis-server`.

##### 2. Configurer les Variables d'Environnement :
Copiez le modèle `.env.example` à la racine du projet :
```bash
cp .env.example .env
```
Éditez le fichier `.env` avec votre chaîne de connexion PostgreSQL locale :
```env
DATABASE_URL="postgresql://ferreteria:votre_mot_de_passe@localhost:5432/ferreteria_db?schema=public"
REDIS_HOST=localhost
REDIS_PORT=6379
API_PORT=4000
FRONTEND_URL=http://localhost:5173
```

##### 3. Appliquer les Migrations et Injecter les Données Initiales :
```bash
# Exécuter les migrations Prisma ORM (48 tables relationnelles)
pnpm --filter @ferreteria/api exec prisma migrate dev --name init

# Charger le catalogue de base, les tarifs, catégories et utilisateurs de test
pnpm --filter @ferreteria/api exec ts-node prisma/seed.ts
```

##### 4. Lancer les Deux Services :
```bash
# Terminal 1 : Lancer l'API Backend NestJS (port 4000)
pnpm --filter @ferreteria/api run start:dev

# Terminal 2 : Lancer l'Application Frontend Vite (port 5173)
pnpm --filter @ferreteria/web run dev
```

- **Frontend SPA :** [http://localhost:5173](http://localhost:5173)
- **API REST Backend :** [http://localhost:4000/api](http://localhost:4000/api)
- **Documentation Swagger OpenAPI :** [http://localhost:4000/api/docs](http://localhost:4000/api/docs)
- **Prisma Studio (Navigateur Graphique de Base de Données) :** `pnpm --filter @ferreteria/api exec prisma studio` (accessible sur [http://localhost:5555](http://localhost:5555))

---

<a id="modo-2-déploiement-avec-docker--docker-compose"></a>
### 🐳 Mode 2 : Déploiement avec Docker & Docker Compose

Option standard recommandée pour les environnements équipés de Docker. Déploie **PostgreSQL 16 Alpine** et **Redis 7 Alpine** avec des volumes de stockage persistant et des vérifications de santé automatisées.

#### Prérequis :
- **Docker Engine** v24+ et **Docker Compose v2** (ou **Docker Desktop** sous Windows/macOS)
- **Node.js** v20+ et **pnpm** v9+

#### Procédure de Lancement :

```bash
# 1. Cloner le dépôt et se positionner dans le dossier
git clone https://github.com/luchoxiii/GestionQuincaillerie.git
cd GestionQuincaillerie

# 2. Installer les paquets du projet
pnpm install

# 3. Démarrer les conteneurs d'infrastructure en arrière-plan
docker compose up -d

# 4. Vérifier que les conteneurs sont sains (healthy)
docker compose ps

# 5. Appliquer les migrations Prisma
pnpm --filter @ferreteria/api exec prisma migrate dev --name init

# 6. Injecter les données de démonstration
pnpm --filter @ferreteria/api exec ts-node prisma/seed.ts

# 7. Démarrer les services de l'ERP
# Terminal 1 (Backend) :
pnpm --filter @ferreteria/api run start:dev

# Terminal 2 (Frontend) :
pnpm --filter @ferreteria/web run dev
```

#### Commandes Utiles Docker :
```bash
# Suivre les journaux de PostgreSQL en temps réel
docker compose logs -f postgres

# Arrêter les conteneurs en conservant les données
docker compose stop

# Supprimer les conteneurs en préservant les volumes
docker compose down

# Redémarrer les services
docker compose restart
```

---

<a id="modo-3-déploiement-avec-podman--podman-compose-rootless--entreprise"></a>
### 🦭 Mode 3 : Déploiement avec Podman & Podman Compose (Rootless & Entreprise)

**Podman** est le moteur de conteneurs de référence sur les distributions d'entreprise sous Linux (Red Hat Enterprise Linux, Fedora, Rocky Linux, AlmaLinux, CentOS Stream, Debian et Ubuntu), réputé pour être **100% sans démon (daemonless)** et opérer **totalement sans privilèges root (Rootless)** pour une sécurité d'infrastructure maximale.

#### Prérequis :
- **Podman** v4.x ou v5.x ([podman.io](https://podman.io/))
- **podman-compose** (`pip install podman-compose` ou via gestionnaire : `sudo dnf install podman-compose` / `sudo apt install podman-compose`)
- **Node.js** v20+ et **pnpm** v9+

#### Procédure avec Podman :

```bash
# 1. Cloner et entrer dans le dossier du projet
git clone https://github.com/luchoxiii/GestionQuincaillerie.git
cd GestionQuincaillerie

# 2. Installer les dépendances
pnpm install

# 3. Lancer l'infrastructure avec podman-compose
podman-compose up -d

# (Ou via le plugin natif Podman 4+) :
# podman compose up -d
```

#### 🛡️ Considérations Techniques et Bonnes Pratiques avec Podman :
1. **Sécurité Rootless (Sans Root) :**
   - Les conteneurs s'exécutent avec les droits de votre compte utilisateur sans recours à `sudo`, éliminant les risques d'élévation de privilèges sur le système hôte.
   - Les ports `5432` et `6379` étant supérieurs à 1024, ils s'associent directement sans configuration spécifique du noyau.
2. **Prise en Charge de SELinux (RHEL / Fedora / CentOS) :**
   - Lorsque SELinux est en mode `Enforcing`, Podman applique un cloisonnement strict. Pour les répertoires hôtes montés en volume, ajoutez l'étiquette `:Z` dans le fichier `docker-compose.yml`.
3. **Usage Transparent via Alias :**
   Définissez les alias recommandés dans votre `~/.bashrc` ou `~/.zshrc` :
   ```bash
   alias docker=podman
   alias docker-compose=podman-compose
   ```
4. **Migrations et Démarrage avec Podman :**
   ```bash
   pnpm --filter @ferreteria/api exec prisma migrate dev --name init
   pnpm --filter @ferreteria/api exec ts-node prisma/seed.ts
   pnpm --filter @ferreteria/api run start:dev
   pnpm --filter @ferreteria/web run dev
   ```

---

## 🏛️ Modules Fonctionnels du Système

### 1. Terminal de Comptoir & Point de Vente (POS)

![Terminal POS](docs/screenshots/pos_checkout_view.jpg)

Conçu pour faire face aux pics d'affluence en magasin avec une rapidité de saisie optimale :

- **Navigation 100% au Clavier** : Touches de fonction universelles (`F2` recherche d'article, `F3` consultation rapide de prix, `F4` encaissement, `Échap` annulation/nettoyage).
- **Scanner de Code-Barres USB** : Hook global `useBarcodeScanner` interceptant les flux laser instantanément sans exiger le focus préalable sur un champ.
- **Vérificateur Rapide de Prix & Financement (`F3`)** :
  - Fenêtre modale disponible depuis n'importe quelle section de l'ERP.
  - Typographie grand format à fort contraste lisible par le client au comptoir.
  - Calcul automatique de la remise de **10% OFF** pour règlement comptant en espèces/débit.
  - Simulateur d'échéances de paiement en 3 fois sans frais et 6 fois fixes.
  - Répartition du stock par dépôt (Comptoir Magasin vs Entrepôt Central).
  - Bouton *"Ajouter au Panier (POS)"* en 1 clic.
- **Modes de Paiement Mixtes & Échelonnés** :
  - Espèces avec rendu de monnaie recalculé en direct.
  - Cartes bancaires de débit et crédit avec enregistrement du lot.
  - Virement bancaire et Compte Client (Crédit).
  - Paiements combinés (ex. 50% espèces et 50% virement).
- **💰 Mode Ticket Interne avec Remise Immédiate Espèces** :
  - En choisissant le mode **Ticket Interne / Bon de Livraison (Mode Interne)**, l'option de **Remise pour Paiement Comptant** s'active immédiatement.
  - Boutons de pourcentage rapides : **`5%`**, **`10%`** *(par défaut)*, **`15%`** et **`20% OFF`**.
  - Recalcul dynamique : affiche l'économie exacte réalisée par l'acheteur, ajuste le solde dû et présente le rendu monnaie exact.
- **📧 Envoi Automatique du Reçu par E-mail au Client** :
  - Si la fiche client comporte une adresse électronique (ou si une adresse temporaire est saisie), le système expédie automatiquement le **reçu numérique de vente**.
  - Gabarit HTML soigné contenant les informations fiscales de l'entreprise, le détail des lignes, les remises, les taux de TVA et le moyen de paiement utilisé.
- **Plafond d'En-cours & Protection Anti-Impayés** :
  - Surveillance continue de l'en-cours client interdisant tout dépassement de crédit accordé.
  - **Blocage des Clients Interdits** : Refus systématique d'encaissement à crédit pour les clients fichés en contentieux.
- **Impression Thermique Directe** : Sortie configurée pour imprimantes de caisse 80mm et 58mm via `Ctrl+P`.

---

### 2. Double Facturation & Régime Fiscal

Répond fidèlement aux contraintes de gestion des quincailleries et négoces de matériaux :

- **Choix du Type de Document à l'Encaissement** :
  - **🏛️ Facturation Fiscale Officielle (AFIP CAE)** : Émission dématérialisée de **Facture A** (entreprises assujetties avec numéro fiscal) ou **Facture B** (consommateurs particuliers et indépendants) dotée du **Code CAE officiel**, de la date de validité et du calcul détaillé des taux de taxe (21%, 10.5%, 27%).
  - **📋 Ticket Interne / Bon de Livraison (Non Fiscal)** : Pièce justificative de gestion pour remise au comptoir. Déduit le stock physique et enregistre les fonds dans la caisse de session avec prise en charge des remises espèces.
- **Export du Livre des Ventes pour l'Expert-Comptable** :
  - Fichier CSV encodé en `UTF-8 avec BOM` séparé par point-virgule `;` regroupant **strictement les pièces officielles visées par le CAE**.
  - Données fiscales : Date, Type de Pièce, Point de Vente, Numéro, Numéro Fiscal (CUIT/DNI), Raison Sociale, Base Hors Taxe, Taux de TVA, Montant de Taxe, Exonéré, Montant TTC, CAE et Échéance du CAE.
- **Export des Mouvements Internes** : Fichier CSV indépendant pour le contrôle matériel des caisses et l'inventaire physique.
- **Tableau de Bord de Facturation (`/facturacion`)** : Synthèse ventilée par typologie, filtres chronologiques et impression A4 avec QR Code officiel.

---

### 3. Catalogue, Stock Multi-Dépôts & Achats

- **Catalogue Exhaustif des Articles** :
  - Attribution automatique de référence SKU (`ART-XXXX`), code-barres EAN-13, marques, unités et arborescence de catégories.
  - Formules couplées reliant **Coût d'Approvisionnement**, **Taux de Marge (%)** et **Prix de Vente TTC**.
  - Multi-taux de TVA (21%, 10.5%, 27%, Exonéré 0%).
  - **Ajustement Massif des Tarifs** : Révision globale des prix par pourcentage selon le rayon ou le fabricant.
- **Gestion Multi-Dépôts & Kardex Inaltérable** :
  - Emplacements répartis entre Dépôt Principal, Magasin Comptoir et réserves secondaires.
  - Kardex chronologique inaltérable (`StockMovement`) : Enregistre les Entrées Réception (`IN`), Ventes Comptoir (`OUT`), Ajustements Manuels (`ADJUST`) et Transferts Inter-Dépôts (`TRANSFER`).
  - Justification obligatoire conservée en audit pour chaque correction de stock.
  - Transferts de marchandises avec mise à jour simultanée des quantités de départ et d'arrivée.
- **Achats Fournisseurs & Approvisionnements** :
  - Réception de commandes avec réintégration immédiate en stock.
  - Option d'actualisation automatique des tarifs de vente lors de variations des prix d'achat.
  - Suivi des soldes dus aux fournisseurs et gestion des ordres de règlement.

---

### 4. CRM, Intelligence Client & Churn Scoring 360°

Moteur décisionnel combinant **Segmentation RFM (Récence, Fréquence, Montant)**, **Calcul Prédictif du Risque d'Attrition (0 à 100%)** et actions de relance ciblées :

#### Segments Comportementaux du Moteur RFM :
| Segment | Règle Algorithmique | Profil Commercial | Recommandation Stratégique |
| :--- | :--- | :--- | :--- |
| **🌟 VIP / Leader** | LTV $\ge 100 000 \$$, $\ge 3$ commandes, dernier achat $\le 35$ j | Chiffre d'affaires le plus élevé, règlements sans retard. | Suivi dédié, accès prioritaire aux arrivages, remises exclusives. |
| **🏗️ Entreprises du BTP (B2B)** | Crédit $\ge 300 000 \$$ ou Entr. avec LTV $> 150 000 \$$ | Artisans, constructeurs avec facturation pro et compte à terme. | Tarifs grossiste, livraisons programmées, interlocuteur attitré. |
| **💎 Fidèle Potentiel** | LTV $\ge 40 000 \$$, dernier achat $\le 45$ j | Professionnels réguliers (plombiers, électriciens). | Grilles artisans, cumul d'avantages, remises au volume. |
| **⚠️ En Risque d'Attrition** | Churn élevé ou LTV $> 30 000 \$$ avec $> 45$ j d'inactivité | Acheteurs assidus montrant un ralentissement anormal. | Relance préventive sur WhatsApp, frais de port offerts. |
| **💤 Inactif / Dormant** | $> 90$ jours sans commande (perte constatée) | Comptes en sommeil risquant de partir à la concurrence. | Déstockages ciblés et offres de réengagement. |
| **🌱 Nouveau Prometteur** | Inscription $\le 45$ jours avec 1 à 2 commandes | Clients récents en période critique de fidélisation. | Kit de bienvenue, conseil sur les gammes complémentaires. |
| **🛒 Acheteur Occasionnel** | Achats espacés sans régularité | Particuliers venant pour des dépannages de bricolage. | Ventes croisées en caisse, produits d'impulsion. |

#### Outils de la Fiche 360° Client :
- **Thermomètre Prédictif d'Attrition** : Score visuel de 0 à 100% avec jauge et détails explicatifs des causes de risque.
- **Interactions Directes en 1 Clic** :
  - *"Encaisser en POS avec Bon"* : Bascule sur le comptoir avec le client présélectionné et le bon de réduction inséré.
  - *"Lancer Campagne WhatsApp"* : Ouvre un échange WhatsApp Web avec un message contextualisé au nom du client.
- **Export de Jeu de Données pour Machine Learning (`exportMLDatasetCsv`)** : 22 variables normalisées intégrant la colonne cible `is_churned_target` (0/1) prête pour l'entraînement sous Scikit-Learn ou XGBoost.
- **Export des Audiences Marketing (`exportMarketingAudienceCsv`)** : Répértoire qualifié avec téléphone, messagerie, catégorie d'intérêt et recommandation opérationnelle.

---

### 5. Bons de Fidélité & Devis Bidevise (USD / ARS)

#### Gestion des Bons de Réduction (`/clientes/perfiles` - Onglet Bons) :
- Émission de remises en pourcentage (`% OFF`) ou en valeur nette (`$ OFF`).
- Filtrage par segmentation RFM (*VIP*, *BTP*, *Nouveaux*, *En Risque*, *Tous*).
- Paramétrage de restrictions : montant minimum de panier, plafond de remise, quotas et date limite.
- Ventilation fiscale exacte au centime près lors de l'encaissement en caisse.

#### Devis et Côtations Bidevises (`/presupuestos`) :

![Devis Bidevise](docs/screenshots/quotes_dollar_view.jpg)

- **💵 Chiffrage en Dollar (USD) et Monnaie Locale (ARS)** :
  - Sélection de la devise de base (`ARS ($)` vs `USD (US$)`) lors de la constitution du devis.
  - **Taux de Change Négocié Personnalisable** : Intègre le cours de référence de l'entreprise tout en permettant de bloquer un taux d'entente par chantier.
  - Conversion instantanée des références d'articles et calcul automatique de la contre-valeur.
- **🔍 Recherche Historique par Client** :
  - Recherche globale par nom, numéro fiscal, contact téléphonique ou référence de devis.
  - **Accès Direct depuis la Fiche Client (`/clientes`)** : Lien direct vers les devis en cours et clos.
  - Indicateurs distincts signalant `USD` et `ARS` avec affichage de la parité (`Équiv. 434 511 $ (Taux : 1 350 $)`).
- **⏳ Blocage des Tarifs avec Délais** : Options de 24h, 48h, 7 jours, 15 jours ou 30 jours.
- **🚦 Indicateur Visuel de Validité** : Vert (en cours), Jaune (expire aujourd'hui, < 12h), Rouge (échue), Bleu (transformée en vente).
- **📲 Envoi WhatsApp avec Détail Bidevise** : Synthèse claire présentant les postes, le taux négocié et les montants dans les deux devises.
- **📄 Impression A4 pour Chantiers** : En-tête professionnel avec tableau de concordance des devises, conditions de réalisation et zone pour signature et tampon.
- **⚡ Transformation Immédiate en Vente Caisse** : Charge l'intégralité du devis au panier avec le taux convenu en 1 clic.

---

### 6. Centre E-Commerce & API Mercado Libre

Module omnicanal pour la gestion des commandes numériques, la synchronisation des inventaires et la préparation logistique :

- **Canaux Raccordés** : Caisse POS, Mercado Libre, Boutique Web propre, WhatsApp et Vente par Téléphone.
- **Pôle Logistique (`/ecommerce`)** :
  - Vue segmentée par canal et tableau des **Colis en Attente d'Expédition**.
  - Génération d'**Étiquettes Thermiques d'Expédition 10x15 cm** avec code-barres et coordonnées de livraison.
  - Suivi d'acheminement : *En préparation*, *Prêt à expédier*, *Pris en charge*, *Livré*.

```
[ Acheteur sur Mercado Libre ]
              │ (Passe commande et règle)
              ▼
[ API Mercado Libre ]
              │ (Alerte instantanée Webhook IPN)
              ▼
[ Backend ERP : POST /api/ecommerce/meli/webhook ]
              │ (Récupération des données : GET /orders/{id})
              ▼
[ Traitement de la Commande ]
  ├─ 1. Rapprochement catalogue par SKU / Code-Barres
  ├─ 2. Déduction atomique du stock en magasin/dépôt
  ├─ 3. Calcul de la commission de plateforme et du net perçu
  ├─ 4. Création de la commande externe (#MELI-XXXXXXXX)
  └─ 5. Enregistrement en base et notification temps réel
              │
              ▼
[ Interface Web de l'ERP ]
  ├─ 📦 Centre E-Commerce (/ecommerce) : File des colis à traiter
  ├─ 🏷️ Impression d'Étiquette Thermique 10x15 cm pour le colis
  ├─ 🧾 Émission de la Facture Fiscale Officielle avec CAE en 1 clic
  └─ 📊 Tableau de Bord : Alerte des expéditions en attente
```

<a id="guia-meli"></a>
#### 🟡 Guide Pas à Pas : Connexion de l'API Mercado Libre (MELI)

Pour synchroniser en temps réel les ventes, décompter le stock physique et sortir les étiquettes de colis :

##### Étape 1 : Créer une Application sur Mercado Libre Developers
1. Rendez-vous sur le portail : **[developers.mercadolibre.com.ar](https://developers.mercadolibre.com.ar/)** (ou le domaine de votre pays).
2. Connectez-vous avec le compte vendeur de votre établissement.
3. Allez dans **"Mes Applications"** et cliquez sur **"Créer une Application"**.
4. Remplissez les critères :
   - **Nom de l'application** : `Ferreteria-ERP`
   - **Nom court** : `ferreteria-erp`
   - **Description** : *ERP multi-dépôts, facturation fiscale et synchronisation omnicanale.*
   - **Catégorie** : *ERP / Gestion Commerciale*
   - **URL de redirection (Redirect URI)** :
     - En local : `http://localhost:4000/api/ecommerce/meli/callback`
     - En production : `https://erp.votre-domaine.com/api/ecommerce/meli/callback`
   - **Permissions requises (Scopes)** :
     - ✅ `read` : Consultation des articles, ventes, questions et acheteurs.
     - ✅ `write` : Mise à jour du stock, réponse aux messages et annonces.
     - ✅ `offline_access` : Obtention du `refresh_token` permanent pour renouvellement en continu.
   - **Événements de Notification IPN (Webhooks)** :
     - Cochez : `orders_v2`, `shipments` et `items`.
     - **URL de Webhook** : `https://votre-tunnel.app/api/ecommerce/meli/webhook` (ou production).
5. Enregistrez et conservez précieusement l'**App ID** et le **Client Secret**.

##### Étape 2 : Renseigner les Identifiants dans `.env`
Ajoutez dans `.env` à la racine ou dans `apps/api/.env` :
```env
MELI_APP_ID=1234567890123456
MELI_CLIENT_SECRET=votre_cle_secrete_meli
MELI_REDIRECT_URI=http://localhost:4000/api/ecommerce/meli/callback
MELI_WEBHOOK_SECRET=votre_signature_secrete_webhook
MELI_SELLER_ID=987654321
```

##### Étape 3 : Valider le Raccordement OAuth 2.0
1. Ouvrez dans votre navigateur l'adresse d'autorisation :
   ```text
   https://auth.mercadolibre.com.ar/authorization?response_type=code&client_id=VOTRE_MELI_APP_ID&redirect_uri=VOTRE_MELI_REDIRECT_URI
   ```
2. Validez le consentement pour associer le compte.
3. Le serveur échange le jeton temporaire et prend en charge le rafraîchissement silencieux.

---

### 7. Import Massif (Excel / Sheets) & Sauvegarde Google Drive

Des solutions pour intégrer vos données sans barrière et garantir la sauvegarde souveraine de votre activité :

#### 📦 Traitement Massif d'Articles et Fiches Clients :
- **Formats Gérés** : `.xlsx`, `.xls` et `.csv`.
- **Modèles de Tableur Pré-Formatés avec Calculs** : Récupération en 1 clic de `plantilla_productos_ferreteria.xlsx` et `plantilla_clientes_ferreteria.xlsx`.
- **Interprétation Automatique des Colonnes** : Réconciliation des intitulés (*Code*, *SKU*, *Désignation*, *Coût*, *Marge %*, *Prix Vente*, *Stock*, *Code-Barres*, *Identifiant Fiscal*).
- **Contrôle en Temps Réel avec Témoins Colorés** : Validation ligne par ligne (vert : valide, rouge : anomalie identifiée) permettant d'importer les lignes saines sans blocage.
- **Option de Mise à Jour des Existants** : Interrupteur permettant d'ajuster les prix/quantités des fiches actuelles ou de n'intégrer que les nouveaux articles.

#### 💾 Sauvegardes Autonomes et Sauvegarde Cloud Google Drive :
- **Copie Intégrale du Système** : Fichier JSON structuré et certifié réunissant les **15 collections fondamentales** (Articles, Clients, Ventes, Devis, Caisses, Mouvements, Fournisseurs, Achats, Catégories, Marques, Dépôts, Audit, Paramètres, Taxes et Unités).
- **Restauration Hors-Ligne Immédiate** : Archive horodatée `ferreteria_erp_backup_YYYY-MM-DD.json` avec contrôle d'intégrité à l'import.
- **Liaison Déportée sur Google Drive** :
  - Protocole OAuth2 restreint au périmètre sécurisé `https://www.googleapis.com/auth/drive.file`.
  - Création dédiée du dossier `Ferreteria_ERP_Backups`.
  - Transfert multipart direct (RFC 2387) sans intermédiaire.
  - Consultation de l'historique cloud et restauration en 1 clic.

```
[ Navigateur / Comptoir ERP ]
             │
             ├─► 📥 Récupération du Fichier Modèle (.xlsx / .csv)
             │        │
             │        ▼
             │   [ Google Sheets ] ◄── Ajustements partagés en équipe
             │        │
             │        ▼ (Télécharger en .xlsx ou .csv)
             ├─► 📤 Import Massif dans /productos ou /clientes (contrôle en 1 clic)
             │
             └─► ☁️ Sauvegarde Cloud par OAuth 2.0
                      │
                      ▼ (API REST Google Drive v3 - Envoi Multipart)
                 [ Répertoire : Ferreteria_ERP_Backups ]
                      ├─ backup_ferreteria_2026-09-10.json
                      ├─ backup_ferreteria_2026-09-11.json
                      └─ Consultation et réinstallation en un clic
```

<a id="guia-google-sheets"></a>
#### ☁️ Guide de Configuration : Google Sheets & Google Drive

##### Étape 1 : Créer un Projet Google Cloud Console
1. Rendez-vous sur : **[console.cloud.google.com](https://console.cloud.google.com/)**.
2. Connectez-vous avec le compte Google de votre entreprise.
3. Cliquez sur la liste des projets et choisissez **"Nouveau projet"** (ex : `Ferreteria-ERP-Backup`).

##### Étape 2 : Activer les Bibliothèques Google Drive et Sheets
1. Rendez-vous dans **"APIs et services" > "Bibliothèque"**.
2. Activez l'**API Google Drive**.
3. Activez l'**API Google Sheets**.

##### Étape 3 : Définir l'Écran de Consentement OAuth
1. Ouvrez **"APIs et services" > "Écran de consentement OAuth"**.
2. Choisissez le mode **Externe** et validez.
3. Renseignez le nom de votre ERP et l'e-mail d'assistance.
4. Dans les champs de scopes, ajoutez `https://www.googleapis.com/auth/drive.file`.
5. Dans **Utilisateurs de test**, inscrivez votre adresse Google puis enregistrez.

##### Étape 4 : Générer les Clés de Client OAuth (Application Web)
1. Allez dans **"APIs et services" > "Identifiants"** > **"+ Créer des identifiants"** > **"ID client OAuth"**.
2. Type : **Application Web**.
3. Origines JavaScript autorisées :
   - `http://localhost:5173` (Local)
   - `https://votre-domaine.com` (Production)
4. URIs de redirection autorisés :
   - `http://localhost:5173/configuracion`
   - `https://votre-domaine.com/configuracion`
5. Notez votre identifiant **Client ID** (`XXXXXXXXXXXX-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX.apps.googleusercontent.com`).

##### Étape 5 : Lier la Clé dans l'Application
- Dans l'ERP, rendez-vous dans **Configuration (`/configuracion`) > Onglet "Sauvegardes & Google Drive"**, renseignez l'ID client et pressez **"Connecter avec Google"** (ou assignez `VITE_GOOGLE_CLIENT_ID` dans votre `.env`).

---

### 8. Accessibilité Universelle, Assistant Vocal & WCAG 2.1 (AA/AAA)

Un écosystème d'inclusion ergonomique élaboré pour garantir l'exercice professionnel des personnes en situation de handicap visuel, auditif, moteur ou cognitif (dyslexie, TDAH), répondant aux exigences **WCAG 2.1 niveaux AA et AAA**.

Accessible sur l'ensemble des pages via le bouton **"Accessibilité"** du bandeau ou avec le raccourci **`Alt + A`**. Les paramètres sont conservés sans latence dans le `localStorage`.

```
       [ Centre d'Accessibilité & Inclusion — Alt + A ]
                              │
      ┌───────────────────────┼───────────────────────┬───────────────────────┐
      ▼                       ▼                       ▼                       ▼
👁️ Adaptations         📖 Confort de           🔊 Retours Sonores      ⌨️ Navigation
   Visuelles               Lecture & Calme         & Synthèse Vocale       au Clavier
  ├─ Jaune sur Noir       ├─ Police OpenDyslexic  ├─ Bip laser (Do6)      ├─ Cadre de focus
  │  (WCAG AAA 21:1)      │  (anti-rotation)      ├─ Accord de succès     │  ultra-visible
  ├─ Contraste Élevé Sombre├─ Règle de Guidage    │  (Do5-Mi5-Sol5)       ├─ Lien d'évitement
  ├─ Zoom Échelonné (150%)│  Horizontal           ├─ Alerte descendante   │  ("Skip to content")
  ├─ Daltonisme           ├─ Suspension des       ├─ Énonciation des prix └─ Touches dédiées
  │  (4 matrices SVG)     │  animations           │  (Consultation F3)       (F2, F3, F4, Échap)
  └─ Pointeur Géant 32px  └─ Espacement aéré      └─ Lecture d'écran
                                                     (Alt + S)
```

#### 👁️ 1. Adaptations Visuelles & Daltonisme :
- **Palette Jaune sur Fond Noir (WCAG AAA)** : Ratio de contraste dépassant 21:1 pour les opérateurs atteints de photophobie ou de basse vision (éléments en jaune `#facc15` sur noir d'encre `#000000`).
- **Thème Sombre Contrasté & Thème Clair Épuré** : Absence de dégradés flous réduisant la lisibilité.
- **Agrandissement Typographique Continu** : 4 paliers (`100% Ordinaire`, `115% Confort`, `130% Spacieux`, `150% Géant`) sans débordement horizontal d'interface.
- **Filtres SVG Spécifiques pour Daltonisme** : Protanopie, Deutéranopie, Tritanopie et Achromatopsie étalonnée.
- **Curseur Visuel Rehaussé** : Pointeur redimensionné à 32x32px ceint d'une bordure jaune vive.

#### 📖 2. Facilité de Lecture & Dispositifs Dyslexie :
- **Typographie pour Personnes Dyslexiques** : Forme des lettres plus lourde à la base évitant les inversions involontaires (`b/d`, `p/q`, `n/u`), espacement de `0.06em` et interligne de `1.75`.
- **Régle Mobile de Guidage Visuel** : Surlignage horizontal suivant le curseur pour explorer sans saut de ligne les tableaux de stocks et de pièces comptables denses.
- **Ralentissement & Sérénité Graphique** : Arrêt complet des effets et transitions (`prefers-reduced-motion`) prévenant la fatigue vestibulaire.

#### 🔊 3. Synthèse Sonore & Assistant Parlant (100% Hors-Ligne) :
- **Web Audio API Purement Synthétique** : Oscillateurs internes du navigateur produisant des tonalités nettes sans fichier audio externe :
  - **Bip Laser (1046.5 Hz - Do6)** : Validation sonore lors du scan d'un code-barres.
  - **Trinité Harmonique (Do5-Mi5-Sol5 / 523Hz, 659Hz, 784Hz)** : Clôture réussie d'une vente.
  - **Double Ton Décroissant (440Hz vers 330Hz)** : Signal d'avertissement en cas d'impayé ou de rejet.
- **Assistant Vocal Autonome (Web Speech API)** :
  - **Vérificateur F3** : Lit à haute voix l'intitulé de l'article, son prix et sa disponibilité.
  - **Fin d'Encaissement Caisse** : Énonce le montant perçu et le rendu de monnaie dû à l'acheteur.
  - **Description Vocale (`Alt + S`)** : Résume la vue affichée pour les utilisateurs non-voyants.

---

### 9. Panneau de Configuration Graphique Intégré

Espace centralisé de paramétrage (`/configuracion`) agencé en 4 espaces de travail :

#### 🟡 1. Espace Mercado Libre (`MeliSettingsTab.tsx`) :
- Renseignement des clés : `App ID`, `Client Secret`, `Seller ID`, `Webhook Secret` et `Redirect URI`.
- Gestion des environnements : **Mode Bac à Sable** vs **Production**, et interrupteur de rafraîchissement d'ordres.
- Tests intégrés : **"Évaluer la Connexion MELI"** et **"Rattacher le Compte (OAuth)"**.

#### 📧 2. Espace Messagerie & Notifications (`EmailSettingsTab.tsx`) :
- Détails SMTP : Hôte, Port (`587`, `465`, `25`), Protocole (`STARTTLS`, `SSL/TLS`), identifiants et e-mail d'archivage discret (BCC).
- Automatismes : Expédition instantanée des reçus lors de l'encaissement et modèles HTML adaptatifs.
- Vérification en direct : Fonction **"Envoyer un Message de Test"** avec journal des envois récents.

#### ☁️ 3. Espace Google Drive & Sauvegardes (`BackupSettingsTab.tsx`) :
- Enregistrement du Client ID OAuth (`VITE_GOOGLE_CLIENT_ID`), authentification directe et transfert des instantanés.

#### 🏢 4. Espace Entreprise & Unités Monétaires :
- Identité fiscale : Dénomination sociale, Numéro d'enregistrement fiscal, Adresse postale, Point de caisse et logo.
- **🪙 Gestionnaire Global de Devises Commerciales** :
  - Modification de la devise opérationnelle répercutée en direct sur la caisse, les reçus, les devis et la synthèse vocale.
  - **Devises Pré-Configurées** :
    - **ARS ($)** — Peso Argentin (`es-AR`, 2 décimales).
    - **USD (US$)** — Dollar Américain (`en-US`, 2 décimales).
    - **EUR (€)** — Euro (`es-ES`, 2 décimales).
    - **CLP ($)** — Peso Chilien (`es-CL`, 0 décimale).
    - **UYU ($U)** — Peso Uruguayen (`es-UY`, 2 décimales).
    - **BRL (R$)** — Real Brésilien (`pt-BR`, 2 décimales).
    - **PYG (Gs.)** — Guarani Paraguayen (`es-PY`, 0 décimale).
    - **COP ($)** — Peso Colombien (`es-CO`, 0 décimale).
    - **MXN ($)** — Peso Mexicain (`es-MX`, 2 décimales).
    - **PEN (S/)** — Sol Péruvien (`es-PE`, 2 décimales).
    - **Sur Mesure** : Code ISO, symbole de caisse, convention régionale et précision de `0` à `4` chiffres après la virgule.
  - **Aperçu Instantané** : Visualisez le formatage monétaire en direct lors de la modification des réglages.
  - **Prise en Compte sans Rechargement** : Synchronisation immédiate en mémoire (`syncCurrencyCache()`).

---

### 10. Multi-Magasins & Succursales Commerciales

![Multi-Magasins](docs/screenshots/multistore_view.jpg)

- **Gestion des Établissements (`StoresSettingsTab.tsx`)** :
  - Création, mise à jour et suspension de points de vente ou dépôts.
  - Attribution du point de facturation fiscal (4 chiffres, ex : `0001`, `0002`).
  - Définition du Siège Principal (`isMain`), adresses, téléphones et responsables.
- **Commutateur de Boutique dans l'En-tête** :
  - Menu accessible depuis n'importe quelle vue pour basculer de magasin en 1 clic.
  - Indication visuelle de la succursale active et du point de vente associé (`PV:0001`).
  - Liaison automatique avec les inventaires locaux pour un suivi individualisé du stock.

---

### 11. Moteur de Recherche en Langage Naturel Multi-Champs

Permet de retrouver articles, clients et intervenants en tapant naturellement :

- **Lemmatisation Multi-Langues (Pluriels & Accords)** :
  - Fait correspondre formes plurielles et singulières (*"clous"* ⇄ *"clou"*, *"vis"* ⇄ *"vis"*, *"peintures"* ⇄ *"peinture"*).
- **Normalisation Phonétique & sans Accents** :
  - Efface les accents et unifie les minuscules (*"électrique"* = *"electrique"*).
- **Décomposition en Multi-Tokens** :
  - Une requête comme *"perforateur 700w bosch"* est découpée et recherchée sur les champs Nom, Marque, Référence SKU, Code-Barres, Catégorie et Description.
- **Recherche Client Polyvalente** :
  - Filtre par Raison Sociale, Nom Commercial, Numéro Fiscal, Pièce d'Identité, Adresse, Téléphone ou E-mail.
- **Exécution Native en Mémoire** :
  - Évalué sans latence (`packages/shared/src/utils/natural-search.ts`), fournissant des résultats sous la milliseconde sur le web et le serveur.

---

### 12. Gestion de Caisse, Position en Temps Réel & Clôture Z

![Gestion de Caisse](docs/screenshots/cash_register_view.jpg)

Contrôle rigoureux des espèces et des clôtures comptables (`/caja`) :

- **Ouverture de Shift & Démarrage de Session** :
  - Affectation du poste (ex : *Caisse Comptoir 01*, *Guichet Bâtiment 02*).
  - Saisie du **Fond de Roulement Initial**.
  - Horodatage strict et verrouillage de la session par opérateur.
- **Suivi des Soldes en Temps Réel** :
  - **4 Indicateurs Clés** : État de Session, Fond Initial, Total des Entrées/Sorties et **Solde Théorique en Espèces** (`Fond Initial + Encaissements Comptant - Prélèvements Manuels`).
  - Fil chronologique consignant chaque opération d'argent liquide.
- **Sorties et Apports Manuels** :
  - Enregistrement des frais de menue dépense (courses, avances, courses atelier).
  - Retraits de sécurité lors des fortes affluences.
- **Pointage Physique & Clôture Journalière Z** :
  - Comptage à l'aveugle des coupures et pièces par l'opérateur.
  - **Mise en Évidence Automatisée des Écarts** :
    - *Équilibré :* Concordance mathématique parfaite avec le logiciel.
    - *Excédent :* Révèle les sommes perçues en trop.
    - *Déficit :* Alerte en rouge sur les manques de caisse.
  - Champ de justification indispensable pour valider une clôture avec écart.
- **Exportation des Mouvements en CSV / Excel** :
  - Génération immédiate des états pour transmission au service comptable.
- **Certitude Cryptographique** :
  - Toute ouverture, opération et clôture est gravée dans le Registre Forensique SHA-256.

---

## 🛡️ Sécurité, Audit & Standards OWASP Top 10

### Matrice des Rôles et Permissions Granulaires (RBAC)

Les fonctionnalités du système sont délimitées par des privilèges précis :

| Module | Clé d'Autorisation | Pouvoir Accordé | Niveau d'Exposition |
| :--- | :--- | :--- | :--- |
| **POS** | `pos:access` | Conduire le poste de vente | Ordinaire |
| | `pos:discount` | Accorder remises libres et bons | ⚠️ Sensible |
| | `pos:price_check` | Vérifier prix et facilités via F3 | Faible |
| **Ventes** | `sales:read` | Examiner l'historique des ventes | Faible |
| | `sales:create` | Générer tickets et factures | Ordinaire |
| | `sales:void` | Annuler des ventes et émettre avoirs | ⚠️ Sensible |
| | `invoicing:emit_fiscal`| Générer la facturation AFIP avec CAE | Majeur |
| **Stock** | `products:read` | Examiner inventaires et tarifs | Faible |
| | `products:create` | Ajouter et ajuster les articles | Moyen |
| | `products:edit_price` | Rectifier prix d'achat et de vente | ⚠️ Sensible |
| | `products:mass_price` | Réviser les prix par groupe | ⚠️ Sensible |
| | `stock:adjust` | Valider des corrections de stock | ⚠️ Sensible |
| | `stock:transfer` | Conduire les transferts entre dépôts| Moyen |
| **Clients** | `customers:read` | Parcourir le fichier clientèle | Faible |
| | `customers:write` | Créer ou corriger les fiches | Moyen |
| | `customers:credit_limit`| Ajuster le plafond de crédit | Majeur |
| | `customers:ban` | Mettre en interdit financier | ⚠️ Sensible |
| **Caisse** | `cash:open` / `cash:close`| Ouvrir la caisse et valider le Z | Majeur |
| | `cash:movements` | Réaliser entrées/sorties manuelles | Majeur |
| **Audit** | `audit:read` | Consulter les pistes d'audit (**Admin Seul**) | ⚠️ Sensible (Admin) |

> [!IMPORTANT]
> **Confidentialité Totale du Journal d'Audit** : Le module d'Audit et les historiques de navigation du personnel sont confidentiels et **réservés exclusivement au profil `ADMIN`** (`audit:read`). Ces vues sont masquées dans la navigation et inaccessibles aux caissiers ou chefs d'équipe.

---

### Conformité de Sécurité OWASP Top 10

Actions protectrices en place pour neutraliser les 10 principales vulnérabilités web :

| Règle OWASP | Solution Technique Intégrée | Degré de Maîtrise |
| :--- | :--- | :---: |
| **A01: Broken Access Control** | Décorateur `JwtAuthGuard` étendu à chaque contrôleur avec `PermissionsGuard`. Audit restreint à l'Admin. | 🟢 **100% Verrouillé** |
| **A02: Cryptographic Failures** | Hachage avec `bcryptjs` (salt rounds = 10). Cookies paramétrés en `HttpOnly`, `SameSite: strict`, `Secure`. Remplacement automatique des secrets par `[REDACTED]` dans les logs. | 🟢 **100% Verrouillé** |
| **A03: Injection & Mass Assignment** | Requêtes paramétrées Prisma ORM. `ValidationPipe` NestJS avec `forbidNonWhitelisted: true`. Bannissement complet de `dangerouslySetInnerHTML`. Assainissement de cellules CSV (`sanitizeCsvCell`). | 🟢 **100% Verrouillé** |
| **A04: Insecure Design** | Taille maximale de requête fixée à 10 Mo. Verrouillage automatique au comptoir des clients débiteurs et contrôle d'encours. | 🟢 **100% Verrouillé** |
| **A05: Security Misconfiguration** | En-têtes sécurisés avec `@fastify/helmet` (CSP, anti-Clickjacking, HSTS). Filtrage CORS rigoureux. Console Swagger fermée en production. | 🟢 **100% Verrouillé** |
| **A06: Vulnerable Components** | Suivi strict par lockfile pnpm. Remplacement `proxy-addr >= 2.0.8`. 0 alerte critique sur les paquets. | 🟢 **100% Verrouillé** |
| **A07: Identification Failures** | Plafonnement de débit `@fastify/rate-limit` (300 req/min par IP). Champ `tokenVersion` en base pour invalidation immédiate de session. Mots de passe de 8 à 128 caractères. | 🟢 **100% Verrouillé** |
| **A08: Software & Data Integrity** | Compilation stricte avec TypeScript (`tsc --noEmit`, 0 erreur). Schémas DTO vérifiés sur l'ensemble des modules. | 🟢 **100% Verrouillé** |
| **A09: Logging Failures** | Registre d'audit immuable en base (`AuditLog`) retraçant intervenant, opération, ressource, horodatage et adresse IP. | 🟢 **100% Verrouillé** |
| **A10: Server-Side Request Forgery (SSRF)**| Validation stricte des flux sortants (`isValidSafeUrl`) excluant les métadonnées cloud (`169.254.169.254`, `metadata.google.internal`), sous-réseaux privés et ports atypiques. | 🟢 **100% Verrouillé** |

---

### Registre Cryptographique Inaltérable SHA-256

![Audit SHA-256](docs/screenshots/audit_bitacora_view.jpg)

En vue d'expertises juridictionnelles ou de contrôles fiscaux inopinés, le logiciel comprend un registre immuable doté d'un **chaînage cryptographique SHA-256 (Tamper-Evident Ledger)** :

```
[ Bloc d'Origine (SHA-256) ]
           │
           ▼
[ Bloc #1 : Création Utilisateur ] ─── Hachage #1 = SHA256(#1 | Horodatage | Acteur | Action | Entité | Données | HachagePréc )
           │
           ▼
[ Bloc #2 : Encaissement Vente   ] ─── Hachage #2 = SHA256(#2 | Horodatage | Acteur | Action | Entité | Données | Hachage #1   )
           │
           ▼
[ Bloc #3 : Ajustement de Stock  ] ─── Hachage #3 = SHA256(#3 | Horodatage | Acteur | Action | Entité | Données | Hachage #2   )
```

#### 🔒 Preuves d'Authenticité :
1. **Chaînage Continu** : Tout événement scelle son empreinte en combinant index séquentiel, date/heure, opérateur, nature de l'action, type d'entité, charge utile et l'empreinte du bloc précédent (`previousHash`).
2. **Détection Mathématique de la Moindre Falsification** :
   - Si une donnée est altérée sur le disque, le recalcul est discordant : `Alerte : Bloc #N Falsifié`.
   - Si une trace est supprimée, un trou séquentiel est relevé.
   - Si une fausse ligne est injectée, le chaînage mathématique est brisé.
3. **Mouvements Consignés sans Dérogation** :
   - Ajouts de comptes, altérations de droits, réinitialisations de mot de passe et blocages.
   - Fiches clients, modifications de limites de crédit et interdictions d'achat.
   - Ventes de caisse, facturations, applications de remises et annulations (`VOID`).
   - Mouvements d'inventaire, transferts entre magasins et clôtures journalières Z.
4. **Outils d'Évaluation dans `/auditoria`** :
   - **"Vérifier l'Intégrité SHA-256"** : Recalcule l'ensemble de la chaîne en quelques millisecondes et affiche le certificat d'intégrité.
   - **Télécharger le Dossier Signé (JSON)** : Exporte l'intégralité du registre signé pour présentation aux auditeurs.
   - **Export CSV Formaté** : Liste détaillée reprenant index, empreinte SHA-256 et empreinte précédente pour tableur.

---

## 🧪 Suite de Tests Automatisés, Stress & Performance (190 Tests)

L'ossature de tests prévient tout dysfonctionnement et garantit que l'interface ne gèle jamais lors des journées d'affluence :

```bash
# Lancer la totalité des tests (Frontend + Backend)
pnpm -r run test
```

### 📊 Tableau Récapitulatif des Tests :

| Étage / Paquet | Outil de Test | Fichiers de Test | Tests Validés | Bilan |
| :--- | :---: | :---: | :---: | :---: |
| **Frontend Web (`apps/web`)** | Vitest 2.1.9 + JSDOM | 20 fichiers | **141 tests** | ✅ **141/141 Réussis (100%)** |
| **Backend API (`apps/api`)** | Jest 29 + ts-jest | 8 fichiers | **49 tests** | ✅ **49/49 Réussis (100%)** |
| **TOTAL DU MONOREPO** | Monorepo pnpm | **28 fichiers** | **190 tests** | 🏆 **190 Réussis / 0 Échec (100%)** |

### 🔥 Épreuves d'Effort et de Haute Concurrence :
- **Registre Cryptographique SHA-256 (`audit-ledger.spec.ts`)** : Effet d'avalanche, pérennité de la chaîne, détection d'altérations et de disparitions.
- **Moteur de Recherche en Langage Naturel (`natural-search.spec.ts`)** : Lemmatisation, lissage d'accents et tokens croisés sur articles, clients et intervenants.
- **Conversion Monétaire (`utils.spec.ts`)** : Formatage en ARS, USD, EUR, CLP (sans centimes), BRL, symboles libres et mise à jour dynamique du stockage local.
- **Panier de Vente Volumineux (`pos.store.stress.spec.ts`)** : 500 références ajoutées avec recalcul des taxes et montants en moins de 500ms.
- **Rafale de Saisies de Quantités** : 1 000 ajustements consécutifs sans saturation de mémoire.
- **Calcul de Péremption des Devis (`quotes.service.stress.spec.ts`)** : Contrôle algorithmique de 10 000 devis en moins de 200ms.
- **Traitement de Tableurs Importants (`excel-import.service.stress.spec.ts`)** : Traitement de 3 000 articles et 3 000 clients avec contrôle des identifiants en moins de 2,5s.
- **Analyse d'Attrition & Scoring (`customer-analytics.service.stress.spec.ts`)** : Analyse RFM, score de risque et matrices ML sur 5 000 comptes en moins de 1,5s.
- **Génération d'Instantanés JSON (`backup.service.stress.spec.ts`)** : Conversion et réimportation de 20 000 fiches en moins de 1s.
- **Sollicitation Catalogue Backend (`products.service.stress.spec.ts`)** : Décompte du stock sur 100 pages séquentielles et 200 recherches simultanées en moins de 1s.
- **Connexions Concomitantes (`auth.service.stress.spec.ts`)** : 100 ouvertures de session simultanées avec calcul bcrypt parallèle.
- **Audit de Données Profondes (`audit.interceptor.stress.spec.ts`)** : Nettoyage récursif de structures JSON à 12 étages et 2 000 champs en moins de 100ms.
- **Génération et Débit de Courriels (`email-notification.service.stress.spec.ts`)** : 500 expéditions simulées, 10 000 calculs de remises (< 300ms) et 1 000 reçus HTML générés (< 1,5s).

---

## ⌨️ Raccourcis Clavier & Guide Rapide d'Accessibilité

| Touche / Raccourci | Périmètre | Fonction Assurée |
| :--- | :---: | :--- |
| **`F2`** | POS | Donne le focus au champ de recherche de références au comptoir. |
| **`F3`** | Global | Affiche le **Vérificateur Rapide de Prix et de Facilités** partout. |
| **`F4`** | POS | Ouvre l'écran d'encaissement, les modes de règlement et le régime. |
| **`Échap`** | POS / Modales | Réinitialise le panier actif ou ferme le dialogue affiché. |
| **`Entrée` (Scan)**| POS | Ajoute la pièce scannée au ticket courant avec confirmation sonore. |
| **`Ctrl + P`** | POS / Facture | Lance l'impression du ticket de caisse ou de la facture A4 avec QR. |
| **`Alt + A`** | Global | **Bascule le Centre d'Accessibilité Universelle** (Contraste, voix, zoom).|
| **`Alt + S`** | Global | **Assistant Parlant** : Lit à haute voix le titre et l'état du module courant. |
| **`Alt + V` / 🔊** | Vérificateur F3| **Énonce** la désignation, le prix unitaire et le stock de l'article. |
| **`Tab` initial** | Global | **Saut direct au contenu utile** (Skip Link pour lecteurs d'écran WCAG 2.4.1). |

---

## 🧭 Plan de Routage de l'Application

| Symbole | Module | Chemin | Description du Module |
| :---: | :--- | :--- | :--- |
| 📊 | **Dashboard** | `/` | Chiffres clés d'activité, courbes Recharts, envois à traiter et export CSV. |
| 📦 | **Articles** | `/productos` | Catalogue complet, recherche SKU/EAN, filtres, réévaluations, import/export. |
| ➕ | **Nouvel Article**| `/productos/nuevo` | Saisie de fiche avec paramétrage des coefficients et calcul de TVA. |
| 🏷️ | **Catégories** | `/categorias` | Structuration des départements et familles d'articles. |
| 🏭 | **Inventaire** | `/inventario` | Stocks multi-dépôts, Kardex d'activité, transferts et export CSV. |
| 🛒 | **Point de Vente**| `/pos` | Caisse au comptoir : touches `F2`, `F3`, `F4`, ventilation et scanner. |
| 🔍 | **Contrôle Prix** | Modale (`F3`)| Prix immédiat, stocks par lieu, simulation en plusieurs fois et remise espèces. |
| 🧾 | **Ventes** | `/ventas` | Historique des encaissements, tri fiscal, réimpression, annulations et CSV. |
| 👥 | **Clients** | `/clientes` | Dossiers fiscaux, encours de compte, blocage débiteurs, imports/exports. |
| 🧠 | **Profils & Churn**| `/clientes/perfiles`| Segmentation RFM, calcul du churn (0-100%), vues 360° et jeux de données ML. |
| 🚚 | **Fournisseurs** | `/proveedores` | Annuaire des marques et grossistes, numéro fiscal, dettes et export CSV. |
| 📑 | **Achats** | `/compras` | Factures d'approvisionnement, entrée en inventaire et export CSV. |
| ➕ | **Saisie d'Achat**| `/compras/nueva` | Réception de livraison avec révision des prix d'achat et marges. |
| 📄 | **Facturation** | `/facturacion` | Factures A/B avec CAE, Bons Internes et **Livre des Ventes CSV pour Comptable**. |
| 💰 | **Caisse** | `/caja` | Ouverture d'équipe, mouvements manuels, clôture de caisse Z et export CSV. |
| 📈 | **Rapports** | `/reportes` | Journal fiscal numérique, suivi de marge et valorisation des stocks. |
| 🛡️ | **Audit** | `/auditoria` | Registre forensique avec contrôle SHA-256 et export JSON certifié (**Admin Seul**). |
| ⚙️ | **Paramètres** | `/configuracion` | Coordonnées de société, monnaie, sauvegardes Google Drive, MELI et SMTP. |
| 👤 | **Utilisateurs** | `/usuarios` | Liste des collaborateurs, affectation des profils et autorisations fines. |

---

## 🏗️ Stack Technologique & Architecture Monorepo

| Étage | Outils Principaux | Mission |
| :--- | :--- | :--- |
| **Frontend SPA** | React 18/19, Vite 5.4, Tailwind CSS 3.4, TypeScript | Interface réactive haut débit avec typage strict. |
| **Composants Graphiques** | shadcn/ui, Radix UI, Lucide Icons | Éléments accessibles, gestion du focus, boîtes modales. |
| **État et Mise en Cache** | Zustand 4.5, TanStack Query (React Query 5) | Panier en mémoire et gestion du cache serveur. |
| **Visualisation Graphique**| Recharts | Graphiques d'évolution des ventes, marges et rotation. |
| **Manipulation Fichiers** | SheetJS (`xlsx`) | Traitement côté client des classeurs `.xlsx`, `.xls` et `.csv`. |
| **API REST Backend** | NestJS 10, Fastify, TypeScript | Architecture modulaire, contrôle par DTOs et Swagger OpenAPI. |
| **Base et ORM** | PostgreSQL 16, Prisma ORM 5 | 48 schémas relationnels avec clés étrangères et migrations. |
| **Cache et Files** | Redis 7 | Stockage temporaire haute vitesse et files de messages. |
| **Structure Monorepo** | pnpm Workspaces | Partage d'infrastructure via le paquet commun `@ferreteria/shared`. |

### Organisation des Répertoires du Projet :

```
GestionQuincaillerie/
├── apps/
│   ├── api/                     # Backend NestJS 10 + Fastify
│   │   ├── prisma/
│   │   │   ├── schema.prisma    # 48 Modèles relationnels structurés
│   │   │   └── seed.ts          # Script d'injection des données de référence
│   │   └── src/
│   │       ├── modules/         # Auth, Users, Products, Categories, Warehouses,
│   │       │                    # Inventory, Suppliers, Purchases, Sales,
│   │       │                    # CashRegister, Customers, Invoicing, Reports,
│   │       │                    # Audit, Settings, Telemetry
│   │       └── common/          # Guards, Interceptors, Decorators, Filters
│   └── web/                     # Frontend React 18/19 + Vite
│       └── src/
│           ├── components/
│           │   ├── ui/          # 21 composants réutilisables shadcn/ui
│           │   ├── common/      # PriceCheckModal, DataTable, ConfirmDialog
│           │   ├── products/    # ProductExcelImportModal
│           │   ├── customers/   # CustomerExcelImportModal, CustomerProfileModal
│           │   ├── quotes/      # NewQuoteModal, QuotePrintModal, UpdateExchangeRateModal
│           │   ├── settings/    # BackupSettingsTab, MeliSettingsTab, EmailSettingsTab
│           │   └── layout/      # Sidebar, Header avec F3, DashboardLayout
│           ├── pages/           # Vues de travail (POS, Facturation, Devis, Caisse)
│           ├── services/        # Clients API, backup, excel-import, google-drive, quotes
│           ├── stores/          # Stores Zustand (auth, pos, cash, accessibility)
│           └── hooks/           # useBarcodeScanner, useToast
├── packages/
│   └── shared/                  # Bibliothèque partagée : types TypeScript et schémas Zod
├── docs/
│   └── screenshots/             # Captures d'écran et GIF interactif
├── docker-compose.yml           # Fichier d'orchestration pour PostgreSQL 16 et Redis 7
├── pnpm-workspace.yaml          # Configuration du monorepo et forçage de paquets
└── package.json                 # Commandes globales du projet
```

---

## ⚙️ Variables d'Environnement

Gabarit de configuration présent dans `.env.example` :

```env
# ==========================================
# Données et Cache
# ==========================================
DATABASE_URL="postgresql://ferreteria:ferreteria_dev_2026@localhost:5432/ferreteria_db?schema=public"
REDIS_HOST=localhost
REDIS_PORT=6379

# ==========================================
# Sécurité et Authentification JWT
# ==========================================
JWT_SECRET=super-secret-key-change-in-production-2026
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# ==========================================
# Adresses et Ports d'Écoute
# ==========================================
API_PORT=4000
API_HOST=0.0.0.0
FRONTEND_URL=http://localhost:5173

# ==========================================
# Connexion API Mercado Libre (MELI)
# ==========================================
MELI_APP_ID=
MELI_CLIENT_SECRET=
MELI_REDIRECT_URI=http://localhost:4000/api/ecommerce/meli/callback
MELI_WEBHOOK_SECRET=
MELI_SELLER_ID=

# ==========================================
# Stockage Google Drive & Sheets (OAuth 2.0)
# ==========================================
VITE_GOOGLE_CLIENT_ID=

# ==========================================
# Expédition de Reçus par E-mail (SMTP)
# ==========================================
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=facturation@quincaillerie.com
SMTP_PASS=votre_mot_de_passe_application
SMTP_FROM_NAME="Quincaillerie Centrale"
SMTP_FROM_EMAIL=facturation@quincaillerie.com
SMTP_BCC=comptabilite@quincaillerie.com
```

---

## 🛠️ Commandes de Maintenance & Qualité

```bash
# Lancer l'intégralité des tests automatisés (Jest + Vitest)
pnpm -r run test

# Lancer uniquement les tests du Frontend (Vitest)
pnpm --filter @ferreteria/web run test

# Lancer uniquement les tests du Backend (Jest)
pnpm --filter @ferreteria/api run test

# Lancer les tests en continu lors des modifications (Watch mode)
pnpm --filter @ferreteria/web run test:watch

# Contrôle strict du typage TypeScript sur tout le monorepo (0 erreur)
pnpm -r run lint

# Compiler la version de production (Frontend en chunks + Backend NestJS)
pnpm -r run build

# Explorer les données avec l'interface graphique Prisma Studio
pnpm --filter @ferreteria/api exec prisma studio

# Arrêter les conteneurs (Docker ou Podman)
docker compose down    # ou : podman-compose down

# Démarrer les conteneurs (Docker ou Podman)
docker compose up -d   # ou : podman-compose up -d
```

---

## 📄 Licence

Développé pour **GestionQuincaillerie**. Tous droits réservés.

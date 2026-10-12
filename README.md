# IvoireMarket

Boutique en ligne **de démonstration** spécialisée dans l'électronique et le high-tech en Côte d'Ivoire, réalisée dans le cadre d'un projet universitaire de cloud computing.

L'application est développée avec Next.js et TypeScript, conteneurisée avec Docker, publiée sur Docker Hub (`leti1006/ivoiremarket:v1`) et déployée sur une instance AWS EC2 par simple `docker pull`.

> ⚠️ **Démonstration uniquement** : les produits, prix, stocks et promotions sont fictifs. Aucune vente, aucun paiement et aucune livraison ne sont effectués, et aucune donnée saisie n'est conservée.

---

## Sommaire

1. [Objectifs du projet](#1-objectifs-du-projet)
2. [Fonctionnalités](#2-fonctionnalités)
3. [Technologies](#3-technologies)
4. [Architecture](#4-architecture)
5. [Prérequis](#5-prérequis)
6. [Installation et développement](#6-installation-et-développement)
7. [Tests et qualité](#7-tests-et-qualité)
8. [Build de production](#8-build-de-production)
9. [Docker](#9-docker)
10. [Publication sur Docker Hub](#10-publication-sur-docker-hub)
11. [Déploiement sur AWS EC2](#11-déploiement-sur-aws-ec2)
12. [Ports utilisés](#12-ports-utilisés)
13. [Sécurité](#13-sécurité)
14. [Limites actuelles](#14-limites-actuelles)
15. [Répartition du travail](#15-répartition-du-travail)
16. [Difficultés rencontrées et solutions](#16-difficultés-rencontrées-et-solutions)
17. [Procédure de démonstration](#17-procédure-de-démonstration)

Voir aussi : [docs/COMMANDES.md](docs/COMMANDES.md) (aide-mémoire des commandes) et [docs/SOUTENANCE.md](docs/SOUTENANCE.md) (préparation de la soutenance).

---

## 1. Objectifs du projet

- Concevoir une application web **fonctionnelle, testée et maintenable**.
- Versionner le code sur un **dépôt GitHub public**, avec des commits réalisés par chaque membre.
- Écrire un **Dockerfile commenté** et construire l'image **localement**.
- Publier l'image sur **Docker Hub** sous le nom `leti1006/ivoiremarket:v1`.
- Déployer sur **AWS EC2** en **téléchargeant** l'image (`docker pull`), sans aucun build sur le serveur.
- Rendre le site accessible publiquement à l'adresse `http://<IP_PUBLIQUE_EC2>`.

## 2. Fonctionnalités

| Page | Route | Contenu |
|---|---|---|
| Accueil | `/` | Bannière, catégories, sélection de produits, promotions (démo), avantages |
| Catalogue | `/catalogue` | Recherche (insensible aux accents), filtres catégorie, prix et disponibilité, tri par pertinence ou prix, message « aucun résultat » |
| Fiche produit | `/produits/[slug]` | Visuel, prix en FCFA, stock, description, points clés, quantité, ajout au panier, produits similaires |
| Panier | `/panier` | Modification des quantités, suppression, sous-totaux, total, panier conservé après actualisation |
| Commande | `/commande` | Formulaire validé (nom, téléphone ivoirien, zone, adresse), frais de livraison, récapitulatif |
| Confirmation | `/commande/confirmation` | Numéro de commande de démo, récapitulatif, montant total |
| 404 | toute URL inconnue | Page cohérente avec l'identité visuelle, vrai code HTTP 404 |

Détails techniques notables :

- les filtres sont stockés **dans l'URL** (`/catalogue?categorie=reseau&tri=prix-asc`) : on peut partager une recherche et utiliser le bouton « retour » ;
- le site reste utilisable **sans JavaScript** pour la recherche et les filtres (formulaires GET) ;
- le **total de la commande est recalculé par le serveur** à partir du catalogue : un prix modifié dans le navigateur est ignoré ;
- le site est accessible au clavier (lien d'évitement, focus visible, libellés ARIA) et responsive du mobile au grand écran.

## 3. Technologies

| Domaine | Outil | Rôle |
|---|---|---|
| Framework | **Next.js 16.4** (App Router, Cache Components) | Pages, rendu serveur, Server Actions |
| Langage | **TypeScript 5** en mode `strict` | Typage de tout le code applicatif |
| UI | **React 19**, **Tailwind CSS 4**, **Lucide React** | Composants, styles, icônes |
| Validation | **Zod 4** | Paramètres d'URL, formulaire, panier stocké, Server Action |
| Tests | **Vitest**, **React Testing Library**, **Playwright** | Tests unitaires, de composants et de parcours |
| Qualité | **ESLint** (config Next.js) | Analyse statique |
| Conteneur | **Docker** (build multi-étapes, `node:24-alpine`) | Image de production |
| Registre | **Docker Hub** | Distribution de l'image |
| Cloud | **AWS EC2** (Ubuntu 24.04) | Hébergement |

Choix assumés :

- **pas de base de données** : le catalogue est un fichier TypeScript typé. Une base n'apporterait rien à une démo sans vraies commandes ;
- **pas de shadcn/ui** : une poignée de composants maison (bouton, badge, champ) suffisent et évitent des dépendances ;
- **pas de Nginx** : le serveur Node.js de Next.js sert directement le site sur le port 3000, publié sur le port 80 par Docker. Nginx ne deviendrait utile qu'avec HTTPS et un nom de domaine ;
- **illustrations SVG** dessinées dans le code plutôt que des photos de marques soumises au droit d'auteur.

## 4. Architecture

```
ivoiremarket/
├── Dockerfile               # Image de production commentée (multi-étapes)
├── .dockerignore            # Fichiers exclus de l'image (secrets, node_modules…)
├── deploy/ec2-deploy.sh     # Script de déploiement sur EC2 (pull + run)
├── next.config.ts           # standalone, en-têtes de sécurité, Cache Components
├── src/
│   ├── app/                 # Routes (pages, layout, 404, erreur)
│   ├── components/          # Composants partagés (en-tête, pied de page, logo, bouton)
│   ├── data/                # Données de démonstration (produits, catégories, zones)
│   ├── features/
│   │   ├── products/        # Recherche, filtres, tri, cartes, visuels
│   │   ├── cart/            # Logique du panier, stockage local, composants
│   │   └── checkout/        # Validation, calcul de commande, Server Action
│   ├── lib/                 # Utilitaires (formatage FCFA…)
│   ├── types/               # Types TypeScript
│   └── proxy.ts             # Vrai 404 pour les produits inconnus
└── tests/
    ├── unit/                # Vitest + Testing Library
    └── e2e/                 # Playwright (desktop + mobile)
```

Principes :

- **Server Components par défaut** : les pages sont rendues sur le serveur. Seuls les éléments interactifs (panier, quantité, formulaire, menu mobile) sont des Client Components (`"use client"`).
- La **logique métier est isolée dans des fonctions pures** (`filters.ts`, `cart-logic.ts`, `order.ts`), testées indépendamment de l'interface.
- Le **panier** est stocké dans le `localStorage` du navigateur et validé par Zod à la lecture. Il n'est envoyé au serveur qu'au moment de commander.
- La **commande** passe par une **Server Action** (`placeDemoOrder`) qui revalide le formulaire et recalcule les prix côté serveur.
- Les **fiches produits** sont générées au build (`generateStaticParams`), et la page catalogue est en *Partial Prerendering* : la coquille est statique, les résultats sont rendus en streaming.

## 5. Prérequis

| Outil | Version testée |
|---|---|
| Node.js | 24.x (LTS) |
| npm | 11.x |
| Git | 2.4x+ |
| Docker Desktop | 29.x |
| Compte Docker Hub | — |
| Compte AWS (EC2) | — |

## 6. Installation et développement

```bash
git clone https://github.com/Leti1006/ivoiremarket_.git
cd ivoiremarket_
npm ci            # installe les versions exactes du package-lock.json
npm run dev       # http://localhost:3000
```

## 7. Tests et qualité

```bash
npm run lint        # ESLint
npm run typecheck   # génération des types de routes + tsc --noEmit
npm run test        # tests unitaires et de composants (Vitest)
npm run check       # les trois à la suite

npx playwright install chromium   # une seule fois
npm run build && npm run test:e2e # parcours navigateur (desktop + mobile)

# Tester un conteneur ou un serveur déjà lancé :
BASE_URL=http://localhost:8080 npm run test:e2e
```

**Intégration continue** : le workflow [.github/workflows/ci.yml](.github/workflows/ci.yml) exécute à chaque push sur `main` le lint, la vérification des types, les tests unitaires, le build, les tests Playwright, puis construit l'image Docker et vérifie que le conteneur répond. Il ne publie rien : la publication sur Docker Hub reste manuelle.

Couverture des tests :

- **Unitaires (41)** : formatage FCFA, validation des paramètres d'URL, recherche, filtres et tri, logique du panier (stock, quantité maximale, totaux), stockage corrompu, validation du téléphone ivoirien, calcul de commande, Server Action (prix client ignorés, panier vide).
- **Composants** : ajout au panier, compteur de l'en-tête, limite de stock, produit en rupture.
- **E2E (Playwright, desktop et mobile)** : recherche, filtres et tri, résultat vide, 404, menu mobile, parcours complet panier → commande → confirmation, en-têtes de sécurité.

## 8. Build de production

```bash
npm run build                  # génère .next/standalone
npm run start                  # serveur de production local
```

## 9. Docker

Le [Dockerfile](Dockerfile) est commenté instruction par instruction. Il comporte trois étapes :

1. **deps** : `npm ci` à partir du `package-lock.json`, mis en cache tant qu'il ne change pas ;
2. **builder** : `npm run build` produit le serveur autonome `.next/standalone` ;
3. **runner** : image finale `node:24-alpine` qui ne contient que `server.js`, les modules nécessaires et les fichiers statiques. Elle s'exécute avec l'utilisateur **non privilégié** `nextjs` et dispose d'un `HEALTHCHECK`.

```bash
# Construire l'image (localement)
docker build -t leti1006/ivoiremarket:v1 .

# Lancer un conteneur : port 8080 de la machine -> port 3000 du conteneur
docker run -d --name ivoiremarket -p 8080:3000 leti1006/ivoiremarket:v1

# Vérifier
curl -I http://localhost:8080
docker ps                       # STATUS doit afficher (healthy)
docker logs ivoiremarket

# Arrêter et supprimer
docker stop ivoiremarket && docker rm ivoiremarket

# Après une modification du code : reconstruire puis relancer
docker build -t leti1006/ivoiremarket:v1 .
```

Taille mesurée : environ **75 Mo** compressés sur Docker Hub.

## 10. Publication sur Docker Hub

```bash
docker login -u leti1006        # mot de passe ou jeton saisi de façon masquée
docker push leti1006/ivoiremarket:v1
docker manifest inspect leti1006/ivoiremarket:v1   # vérifie que le tag existe
docker pull leti1006/ivoiremarket:v1               # teste le téléchargement
```

Page publique : <https://hub.docker.com/r/leti1006/ivoiremarket>

> On utilise de préférence un **jeton d'accès personnel** (Docker Hub → Account settings → Personal access tokens) plutôt que le mot de passe du compte. Il ne doit jamais être écrit dans le dépôt.

## 11. Déploiement sur AWS EC2

**Règle du projet : l'image n'est jamais construite sur EC2.** Elle est téléchargée depuis Docker Hub.

### 11.1 Créer l'instance (console AWS)

- AMI **Ubuntu Server 24.04 LTS**, architecture **x86_64** (l'image est construite pour `amd64`) ;
- type `t3.micro` ou `t2.micro` ;
- paire de clés `.pem` conservée **hors du dépôt** ;
- groupe de sécurité : voir [Ports utilisés](#12-ports-utilisés).

### 11.2 Se connecter et installer Docker

```bash
# Depuis le poste local (Windows : PowerShell ou Git Bash)
ssh -i ~/.ssh/ivoiremarket-key.pem ubuntu@<IP_PUBLIQUE_EC2>

# Sur le serveur
sudo apt-get update
sudo apt-get install -y docker.io
sudo systemctl enable --now docker
sudo usermod -aG docker ubuntu     # permet d'utiliser docker sans sudo
exit                               # puis se reconnecter pour appliquer le groupe
docker version
```

### 11.3 Déployer

```bash
# Sur le serveur
docker pull leti1006/ivoiremarket:v1
docker rm -f ivoiremarket 2>/dev/null || true
docker run -d --name ivoiremarket --restart unless-stopped -p 80:3000 leti1006/ivoiremarket:v1
docker ps
docker logs ivoiremarket
curl -I http://localhost
```

Le script [deploy/ec2-deploy.sh](deploy/ec2-deploy.sh) automatise ces étapes et vérifie le résultat :

```bash
scp -i ~/.ssh/ivoiremarket-key.pem deploy/ec2-deploy.sh ubuntu@<IP_PUBLIQUE_EC2>:~
ssh -i ~/.ssh/ivoiremarket-key.pem ubuntu@<IP_PUBLIQUE_EC2> "chmod +x ec2-deploy.sh && ./ec2-deploy.sh leti1006 v1"
```

Enfin, ouvrir `http://<IP_PUBLIQUE_EC2>` dans un navigateur.

## 12. Ports utilisés

| Port | Où | Exposé à Internet | Rôle |
|---|---|---|---|
| 3000 | dans le conteneur | ❌ Non | Serveur Next.js |
| 80 | hôte EC2 | ✅ Oui (0.0.0.0/0) | HTTP public, redirigé vers 3000 par `-p 80:3000` |
| 22 | hôte EC2 | ⚠️ Mon IP uniquement | Administration SSH |
| 8080 | poste local | — | Tests locaux du conteneur |

Aucun autre port n'est ouvert dans le groupe de sécurité.

## 13. Sécurité

- **Entrées validées par Zod** : paramètres d'URL (valeurs invalides remplacées par des valeurs par défaut), formulaire (côté navigateur **et** serveur), panier relu depuis le `localStorage`.
- **Prix jamais fournis par le client** : la Server Action recalcule les montants et vérifie le stock.
- **Pas d'injection HTML** : React échappe tout le texte affiché ; aucun `dangerouslySetInnerHTML`.
- **En-têtes HTTP** : `Content-Security-Policy` (ressources du site uniquement, `frame-ancestors 'none'`), `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy`, `Permissions-Policy` ; l'en-tête `X-Powered-By` est supprimé.
  - Limite connue : la CSP autorise `'unsafe-inline'` pour les scripts, car Next.js injecte des scripts d'hydratation. Une CSP à *nonce* demanderait un rendu entièrement dynamique.
- **Données minimales** : ni carte bancaire, ni mot de passe, ni stockage côté serveur ; e-mail facultatif.
- **Aucun secret dans le dépôt ni dans l'image** : `.gitignore` et `.dockerignore` excluent `.env*`, `*.pem` et `*.key`.
- **Conteneur non-root**, image minimale sans outils de compilation.
- **AWS** : SSH limité à une IP, port 3000 non exposé, aucune clé AWS dans le code.
- **Dépendances** : `npm audit` signale des vulnérabilités dans `braces`, une dépendance de l'outillage ESLint utilisée seulement en développement et absente de l'image finale. Le correctif proposé (`--force`) rétrograderait `eslint-config-next` en version 14 ; il n'a donc pas été appliqué.
- **HTTPS** : non mis en place, car il faut un nom de domaine pour obtenir un certificat (Let's Encrypt). Le site est servi en HTTP, ce qui est acceptable puisqu'aucune donnée sensible n'est collectée.

## 14. Limites actuelles

- Catalogue statique dans le code : pas d'interface d'administration ni de base de données.
- Commandes simulées : rien n'est enregistré, la confirmation n'est visible que dans l'onglet d'origine.
- Pas de comptes utilisateurs ni de paiement réel (volontairement).
- HTTP uniquement (pas de nom de domaine).
- Image construite pour `amd64` uniquement.

Améliorations possibles : base de données (PostgreSQL/RDS), administration du catalogue, vraies photos, paiement Mobile Money en mode test, HTTPS via un nom de domaine et Nginx ou un Load Balancer, publication automatique de l'image depuis la CI (aujourd'hui la CI vérifie mais ne publie pas).

## 15. Répartition du travail

> À compléter par le groupe avec les contributions **réelles** (visibles dans `git log`).

| Membre | Responsabilités | Commits principaux |
|---|---|---|
| Leti Ouattara | Application Next.js (catalogue, panier, commande), tests, Dockerfile, publication Docker Hub | _à compléter_ |
| [@asaphfelix03-bip](https://github.com/asaphfelix03-bip) | _à compléter_ | _à compléter_ |

Un assistant IA (Claude Code) a été utilisé pour générer et vérifier une partie du code et de la documentation. Chaque membre a relu, compris et versionné sa partie.

## 16. Difficultés rencontrées et solutions

> Section à compléter au fil du projet avec les problèmes **réellement** rencontrés. Les points ci-dessous ont été observés pendant le développement.

| Difficulté observée | Cause | Solution |
|---|---|---|
| `npm install` échoue (`ERESOLVE`) en ajoutant Vitest | `@types/node@20` incompatible avec Vitest 5 | Alignement sur `@types/node@24`, qui correspond à Node 24 (sans `--force`) |
| `tsc` ne connaît pas `PageProps<"/catalogue">` | Les types de routes sont générés par Next.js | Script `typecheck` = `next typegen && tsc --noEmit` |
| Une URL de produit inconnue renvoyait HTTP 200 au lieu de 404 | Avec le streaming, le statut 200 est déjà envoyé quand `notFound()` s'exécute | Vérification du slug dans `src/proxy.ts`, avant le rendu |
| Tests E2E : deux éléments trouvés au lieu d'un | Next.js garde la page précédente montée mais masquée (`<Activity>`) | Les tests ne ciblent que les éléments visibles |
| _à compléter (déploiement EC2…)_ | | |

## 17. Procédure de démonstration

Voir le scénario détaillé dans [docs/SOUTENANCE.md](docs/SOUTENANCE.md#scénario-de-démonstration-58-minutes).

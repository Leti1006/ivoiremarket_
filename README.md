# IvoireMarket

Boutique en ligne **de démonstration** spécialisée dans l'électronique et le high-tech en Côte d'Ivoire, réalisée dans le cadre d'un projet universitaire de cloud computing.

L'application est développée avec Next.js et TypeScript, conteneurisée avec Docker, publiée sur Docker Hub (`leti1006/ivoiremarket:v1`, puis `v2`) et déployée sur une instance AWS EC2 par simple `docker pull`.

🌐 **Application en ligne : http://13.60.255.43** (instance AWS EC2, région eu-north-1).

> ⚠️ **Démonstration uniquement** : les marques et modèles existent (photos réelles sous licence libre), mais les prix, stocks et promotions sont fictifs. Aucune vente, aucun paiement et aucune livraison ne sont effectués. Les commandes sont enregistrées dans la base uniquement pour être traitées dans l'espace administrateur : il ne faut pas y saisir de vraies coordonnées.

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

Voir aussi : [docs/COMMANDES.md](docs/COMMANDES.md) (aide-mémoire des commandes).

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
| Confirmation | `/commande/confirmation` | Numéro de commande, récapitulatif, montant total |
| Crédits photos | `/credits` | Auteur, licence et source de chaque photo |
| 404 | toute URL inconnue | Page cohérente avec l'identité visuelle, vrai code HTTP 404 |

**Espace administrateur** (accès protégé par mot de passe) :

| Page | Route | Contenu |
|---|---|---|
| Connexion | `/admin/connexion` | Identifiant + mot de passe, limitation à 5 essais / 15 min |
| Tableau de bord | `/admin` | Nombre de produits, commandes à traiter, ruptures, chiffre d'affaires (démo), alertes de stock |
| Produits | `/admin/produits` | Liste, recherche, filtre de stock ; création, modification (prix, promo, stock, photo, mise en avant) et suppression |
| Commandes | `/admin/commandes` | Liste filtrable par statut, détail client et articles, changement de statut |

**Logique d'ensemble** : la boutique et l'administration partagent la même base de données.

- Une commande passée en boutique **décrémente le stock** (transaction atomique : impossible de vendre deux fois le dernier exemplaire) et apparaît immédiatement dans l'administration.
- Le cycle d'une commande est contrôlé : `Nouvelle → Confirmée → Expédiée → Livrée`, avec annulation possible avant expédition. **Une annulation remet les articles en stock.**
- Un prix, une promotion, un stock ou une photo modifiés par l'administrateur sont **visibles immédiatement** dans la boutique ; un produit à stock 0 passe en « Rupture » et ne peut plus être commandé.

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
| Validation | **Zod 4** | Paramètres d'URL, formulaires, panier stocké, Server Actions |
| Base de données | **SQLite** via `node:sqlite` (intégré à Node 24) | Catalogue, commandes, stocks |
| Images | **next/image** (AVIF/WebP, tailles adaptées) | Photos réelles optimisées |
| Tests | **Vitest**, **React Testing Library**, **Playwright** | Tests unitaires, de composants et de parcours |
| Qualité | **ESLint** (config Next.js) | Analyse statique |
| Conteneur | **Docker** (build multi-étapes, `node:24-alpine`) | Image de production |
| Registre | **Docker Hub** | Distribution de l'image |
| Cloud | **AWS EC2** (Ubuntu 24.04) | Hébergement |

Choix assumés :

- **SQLite plutôt qu'un serveur de base de données** : un simple fichier, sans service supplémentaire à administrer ni dépendance native à compiler (`node:sqlite` est intégré à Node 24). Dans Docker, il est placé dans un **volume** pour survivre aux mises à jour. Pour plusieurs serveurs, on passerait à PostgreSQL (Amazon RDS) ;
- **pas de shadcn/ui** : une poignée de composants maison (bouton, badge, champ) suffisent et évitent des dépendances ;
- **pas de Nginx** : le serveur Node.js de Next.js sert directement le site sur le port 3000, publié sur le port 80 par Docker. Nginx ne deviendrait utile qu'avec HTTPS et un nom de domaine ;
- **photos réelles issues de Wikimedia Commons** (licences CC0, CC BY, CC BY-SA) plutôt que des photos de sites marchands protégées par le droit d'auteur. Chaque photo est créditée (fiche produit et page `/credits`). Le nom de chaque produit correspond au modèle visible sur sa photo ;
- **un seul compte administrateur** défini par variables d'environnement : suffisant pour la démonstration, sans table d'utilisateurs ni inscription.

## 4. Architecture

```
ivoiremarket/
├── Dockerfile               # Image de production commentée (multi-étapes)
├── .dockerignore            # Fichiers exclus de l'image (secrets, node_modules…)
├── deploy/ec2-deploy.sh     # Script de déploiement sur EC2 (pull + run)
├── next.config.ts           # standalone, en-têtes de sécurité, Cache Components
├── src/
├── public/images/products/  # 29 photos WebP optimisées
├── src/
│   ├── app/
│   │   ├── (boutique)/      # Pages publiques (accueil, catalogue, produit, panier, commande, crédits)
│   │   └── admin/           # Connexion + espace administrateur protégé
│   ├── components/          # Composants partagés (en-tête, pied de page, logo, bouton)
│   ├── data/                # Catalogue initial (seed), catégories, zones, crédits photos
│   ├── features/
│   │   ├── products/        # Recherche, filtres, tri, cartes, photos
│   │   ├── cart/            # Logique du panier, stockage local, composants
│   │   ├── checkout/        # Validation, calcul et enregistrement de commande
│   │   └── admin/           # Formulaires, Server Actions et statuts de l'administration
│   ├── server/              # Code serveur uniquement : base SQLite, dépôts, authentification
│   ├── lib/                 # Utilitaires (formatage FCFA…)
│   ├── types/               # Types TypeScript
│   └── proxy.ts             # 404 réel pour les produits inconnus + garde de /admin
└── tests/
    ├── unit/                # Vitest + Testing Library
    └── e2e/                 # Playwright (desktop + mobile)
```

Principes :

- **Server Components par défaut** : les pages sont rendues sur le serveur. Seuls les éléments interactifs (panier, quantité, formulaire, menu mobile) sont des Client Components (`"use client"`).
- La **logique métier est isolée dans des fonctions pures** (`filters.ts`, `cart-logic.ts`, `order.ts`), testées indépendamment de l'interface.
- Le **panier** est stocké dans le `localStorage` du navigateur et validé par Zod à la lecture. Il n'est envoyé au serveur qu'au moment de commander.
- La **commande** passe par une **Server Action** (`placeDemoOrder`) qui revalide le formulaire et recalcule les prix côté serveur.
- Les pages sont en *Partial Prerendering* : la coquille (en-tête, titres) est statique, les données de la base arrivent en streaming. Les lectures appellent `connection()` pour toujours refléter l'état actuel de la base.
- La **base** est initialisée automatiquement au premier démarrage avec le catalogue de départ (`src/data/seed-products.ts`). Ensuite, c'est l'administration qui fait foi.
- **Sécurité de l'administration en profondeur** : le Proxy redirige les visiteurs sans session, et **chaque page et chaque Server Action** revérifie la session (`requireAdmin`) avant de lire ou modifier une donnée.

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
cp .env.example .env.local   # puis choisir un mot de passe admin et un secret de session
npm run dev       # http://localhost:3000  — administration : http://localhost:3000/admin
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

- **Unitaires (52)** : formatage FCFA, paramètres d'URL, recherche, filtres et tri, logique du panier, stockage corrompu, téléphone ivoirien, calcul et enregistrement de commande (stock décrémenté, prix client ignorés, stock insuffisant sans effet), base SQLite (CRUD produits, cycle de vie des commandes, remise en stock), formulaire produit, sessions signées (falsification, expiration), limitation des tentatives.
- **Composants** : ajout au panier, compteur de l'en-tête, limite de stock, produit en rupture.
- **E2E (25, Playwright, desktop et mobile)** : recherche, filtres et tri, résultat vide, 404, menu mobile, parcours complet panier → commande → confirmation, photos et crédits, en-têtes de sécurité ; administration : redirection sans session, mauvais mot de passe, création / modification / suppression d'un produit visible dans la boutique, traitement d'une commande de bout en bout.

## 8. Build de production

```bash
npm run build                  # génère .next/standalone
npm run start                  # serveur de production local
```

## 9. Docker

Le [Dockerfile](Dockerfile) est commenté instruction par instruction. Il comporte trois étapes :

1. **deps** : `npm ci` à partir du `package-lock.json`, mis en cache tant qu'il ne change pas ;
2. **builder** : `npm run build` produit le serveur autonome `.next/standalone` ;
3. **runner** : image finale `node:24-alpine` qui ne contient que `server.js`, les modules nécessaires, les fichiers statiques et les photos. Elle s'exécute avec l'utilisateur **non privilégié** `nextjs`, déclare le volume `/app/data` (base SQLite) et dispose d'un `HEALTHCHECK`.

Les **secrets ne sont jamais dans l'image** : le mot de passe administrateur et la clé de session sont fournis au démarrage, dans un fichier d'environnement local non versionné.

```bash
# Construire l'image (localement)
docker build -t leti1006/ivoiremarket:v2 .

# Fichier de secrets (non versionné), sur le modèle de .env.example
cp .env.example ivoiremarket.env   # puis éditer les valeurs

# Lancer un conteneur : port 8080 -> 3000, base dans le volume « ivoiremarket-data »
docker run -d --name ivoiremarket -p 8080:3000   --env-file ivoiremarket.env   -v ivoiremarket-data:/app/data   leti1006/ivoiremarket:v2

# Vérifier
curl -I http://localhost:8080
docker ps                       # STATUS doit afficher (healthy)
docker logs ivoiremarket

# Arrêter et supprimer
docker stop ivoiremarket && docker rm ivoiremarket

# Après une modification du code : reconstruire puis relancer
# (le volume conserve les produits et commandes saisis dans l'administration)
docker build -t leti1006/ivoiremarket:v2 .
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

### 11.4 Mise à jour vers la v2 (effectuée)

```bash
# Poste local : construire, tester (25 tests E2E contre le conteneur), publier
docker build -t leti1006/ivoiremarket:v2 .
docker push leti1006/ivoiremarket:v2
# Serveur EC2 : télécharger et relancer (aucun build)
scp -i ~/.ssh/ivoiremarket_ed25519 deploy/ec2-deploy.sh ubuntu@13.60.255.43:~
ssh -i ~/.ssh/ivoiremarket_ed25519 ubuntu@13.60.255.43 "./ec2-deploy.sh leti1006 v2"
```

Vérifié après déploiement : empreinte de l'image sur EC2 identique à celle publiée (`sha256:bd5ff7f9…`), conteneur `healthy` sous l'utilisateur `nextjs`, fichier de secrets `~/ivoiremarket.env` en droits `600`, base dans le volume `ivoiremarket-data`, `/admin` redirigé vers la connexion, port 3000 fermé. Sur l'adresse publique : 17 tests boutique (ceux qui ne créent pas de commande, pour ne pas polluer les données) et une connexion administrateur en lecture seule.

Les identifiants administrateur de production se lisent sur le serveur : `ssh … "cat ~/ivoiremarket.env"`. Ils ne sont ni dans Git, ni dans l'image, ni dans ce README.

### 11.5 Premier déploiement (v1)

| Élément | Valeur |
|---|---|
| Région | eu-north-1 (Stockholm) |
| Instance | `ivoiremarket`, t3.micro, Ubuntu 24.04.5 LTS, x86_64 |
| IP publique | `13.60.255.43` |
| Groupe de sécurité | `ivoiremarket-sg` : 80/tcp depuis 0.0.0.0/0 ; 22/tcp depuis une seule IP (/32) |
| Clé SSH | paire ed25519 générée en local ; seule la clé **publique** a été importée dans AWS (`ivoiremarket-key`) |
| Méthode | AWS CloudShell + AWS CLI (`import-key-pair`, `create-security-group`, `run-instances`) ; un script *user data* installe Docker puis exécute `docker pull` et `docker run -p 80:3000` au premier démarrage |

Vérifications effectuées :

- `docker images` sur EC2 affiche l'ID `aa7562f60d36`, **identique** à l'image testée en local : aucun build sur le serveur ;
- `docker ps` affiche `Up (healthy)` et `0.0.0.0:80->3000/tcp` ; `docker exec ivoiremarket whoami` renvoie `nextjs` ;
- `http://13.60.255.43:3000` est injoignable depuis Internet, ce qui est attendu puisque le port 3000 n'est pas exposé ;
- les 17 tests Playwright passent contre `BASE_URL=http://13.60.255.43`.

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
- **Administration** :
  - identifiants et clé de session fournis par variables d'environnement, jamais dans le code, Git ou l'image ;
  - session = jeton signé HMAC-SHA256 avec expiration (8 h), dans un cookie `httpOnly` + `SameSite=Strict` (inaccessible au JavaScript, non envoyé depuis un autre site) ;
  - comparaisons à temps constant ; blocage après 5 échecs en 15 minutes ;
  - double contrôle : le Proxy filtre `/admin`, et chaque page et Server Action revérifie la session ; les Server Actions de Next.js vérifient aussi l'origine des requêtes (protection CSRF) ;
  - pages d'administration exclues de l'indexation (`noindex`).
- **Base de données** : requêtes **paramétrées** uniquement (`?`), donc pas d'injection SQL ; contraintes `CHECK` (prix > 0, stock ≥ 0) ; transactions pour les commandes et les annulations.
- **Photos** : seules les photos de la photothèque peuvent être choisies (liste blanche) ; l'optimiseur d'images n'accepte que `/images/products/**`.
- **Données minimales** : ni carte bancaire, ni mot de passe client ; e-mail facultatif. Les commandes (nom, téléphone, adresse) sont stockées pour la démonstration : un avertissement invite à ne pas saisir de vraies coordonnées.
- **Aucun secret dans le dépôt ni dans l'image** : `.gitignore` et `.dockerignore` excluent `.env*`, `*.pem` et `*.key`.
- **Conteneur non-root**, image minimale sans outils de compilation.
- **AWS** : SSH limité à une IP, port 3000 non exposé, aucune clé AWS dans le code.
- **Dépendances** : `npm audit` signale des vulnérabilités dans `braces`, une dépendance de l'outillage ESLint utilisée seulement en développement et absente de l'image finale. Le correctif proposé (`--force`) rétrograderait `eslint-config-next` en version 14 ; il n'a donc pas été appliqué.
- **HTTPS** : non mis en place, car il faut un nom de domaine pour obtenir un certificat (Let's Encrypt). **Limite importante** : en HTTP, le mot de passe administrateur et le cookie de session circulent en clair sur le réseau. Pour une vraie mise en production, HTTPS serait obligatoire, et il faudrait définir `COOKIE_SECURE=true`.

## 14. Limites actuelles

- Un seul compte administrateur, sans gestion de rôles ; la limitation des tentatives de connexion est en mémoire (remise à zéro au redémarrage).
- SQLite sur un seul serveur : pas de réplication. Une sauvegarde consiste à copier le volume `ivoiremarket-data`.
- Pas d'envoi de photos depuis l'administration : on choisit parmi la photothèque (choix volontaire pour éviter les risques liés aux fichiers envoyés).
- Pas de comptes clients ni de paiement réel (volontairement) ; la confirmation n'est visible que dans l'onglet d'origine.
- HTTP uniquement (pas de nom de domaine).
- Image construite pour `amd64` uniquement.

Améliorations possibles : HTTPS (nom de domaine + Nginx/Caddy ou un Load Balancer AWS), PostgreSQL sur Amazon RDS, envoi de photos vers Amazon S3, comptes administrateurs multiples avec rôles, notifications de commande par e-mail/SMS, paiement Mobile Money en mode test, publication automatique de l'image depuis la CI.

## 15. Répartition du travail

> À compléter par le groupe avec les contributions **réelles** (visibles dans `git log`).

| Membre | Responsabilités | Commits principaux |
|---|---|---|
| Leti Ouattara | Application Next.js (catalogue, panier, commande), tests, Dockerfile, publication Docker Hub | _à compléter_ |
| [Asaph Felix (@asaphfelix03-beep)](https://github.com/asaphfelix03-beep) | Relecture et correction de la documentation, nettoyage du dépôt, tests unitaires | `docs: fix team member GitHub link…`, `test: add unit tests for cn helper` |

Un assistant IA (Claude Code) a été utilisé pour générer et vérifier une partie du code et de la documentation. Chaque membre a relu, compris et versionné sa partie.

## 16. Difficultés rencontrées et solutions

> Section à compléter au fil du projet avec les problèmes **réellement** rencontrés. Les points ci-dessous ont été observés pendant le développement.

| Difficulté observée | Cause | Solution |
|---|---|---|
| `npm install` échoue (`ERESOLVE`) en ajoutant Vitest | `@types/node@20` incompatible avec Vitest 5 | Alignement sur `@types/node@24`, qui correspond à Node 24 (sans `--force`) |
| `tsc` ne connaît pas `PageProps<"/catalogue">` | Les types de routes sont générés par Next.js | Script `typecheck` = `next typegen && tsc --noEmit` |
| Une URL de produit inconnue renvoyait HTTP 200 au lieu de 404 | Avec le streaming, le statut 200 est déjà envoyé quand `notFound()` s'exécute | Vérification du slug dans `src/proxy.ts`, avant le rendu |
| Tests E2E : deux éléments trouvés au lieu d'un | Next.js garde la page précédente montée mais masquée (`<Activity>`) | Les tests ne ciblent que les éléments visibles |
| Le panneau de navigateur, trop petit, rendait la console EC2 difficile à manipuler | Formulaires de la console dans une iframe peu lisible | Création des ressources en ligne de commande via AWS CloudShell (AWS CLI), plus reproductible |
| Ne pas faire transiter de clé privée | Le téléchargement d'un `.pem` expose la clé | Clé générée en local (`ssh-keygen`), seule la clé publique est importée |
| Choix de l'instance | L'image Docker est construite pour `amd64` | Instance x86_64 (t3.micro), pas de t4g (ARM) |
| Tableau de bord admin bloqué sur « chargement » | Next 16 interdit `Date.now()` pendant un pré-rendu ; la vérification d'expiration de session l'utilisait | `await connection()` avant la vérification : elle a lieu à chaque requête |
| Tests E2E très lents, navigations expirées | L'encodage des images en AVIF saturait le CPU du serveur | Format WebP uniquement (les photos source sont déjà en WebP) |
| Déplacement de dossiers refusé (`Permission denied`) | Le serveur de développement verrouillait les fichiers (Windows) | Arrêt du serveur avant de réorganiser les routes |
| SSH vers EC2 bloqué (timeout) lors de la mise à jour v2 | L'IP publique du poste avait changé ; la règle SSH n'autorisait que l'ancienne | Règle du groupe de sécurité mise à jour (nouvelle IP /32, ancienne retirée) |
| Script de déploiement en échec (`unbound variable`) | Une apostrophe dans `${1:?…}` ouvrait une chaîne et décalait tout le script | Message sans apostrophe, vérification avec `bash -n` |
| `docker push` refusé (`insufficient_scope`) | Session Docker Hub perdue au redémarrage de Docker Desktop | Reconnexion dans Docker Desktop |
| _à compléter par le groupe_ | | |

## 17. Procédure de démonstration

1. Ouvrir le site public, parcourir le catalogue, rechercher et filtrer.
2. Ajouter des produits au panier, actualiser la page (panier conservé), passer une commande.
3. Se connecter à `/admin` : la commande apparaît et le stock a diminué ; faire avancer son statut.
4. Modifier le prix d'un produit dans l'administration et constater le changement dans la boutique.
5. Montrer le Dockerfile, l'image sur Docker Hub, puis `docker ps` et `docker logs` sur EC2.

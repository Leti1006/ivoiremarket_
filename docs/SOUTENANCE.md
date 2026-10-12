# Préparation de la soutenance — IvoireMarket

## 1. Besoin et solution (1 minute)

**Besoin.** Une boutique en ligne claire et rassurante pour découvrir et comparer des produits high-tech en Côte d'Ivoire, avec des prix en FCFA. Elle doit être déployée dans le cloud selon une chaîne complète : GitHub → Docker → Docker Hub → AWS EC2.

**Solution.** IvoireMarket, une application Next.js et TypeScript avec catalogue, recherche, filtres, panier et commande simulée. Elle est empaquetée dans une image Docker de 75 Mo, publiée sur Docker Hub, puis téléchargée et lancée sur EC2.

## 2. Pourquoi Next.js et TypeScript ?

- **Next.js** réunit le rendu serveur (pages rapides et bien référencées), le routage par dossiers et le code serveur (Server Actions) dans un seul projet, sans backend séparé. Son mode `standalone` produit un serveur minimal, idéal pour Docker.
- **TypeScript strict** détecte les erreurs avant l'exécution : un produit sans prix, une catégorie inconnue ou une mauvaise propriété font échouer la compilation au lieu de provoquer un bug devant l'utilisateur.

## 3. Architecture (à montrer dans VS Code)

- `src/app` : une route = un dossier (`catalogue/`, `panier/`, `produits/[slug]/`).
- `src/features/*` : le code est organisé par fonctionnalité (produits, panier, commande).
- `src/data` : le catalogue de démonstration, typé.
- **Server Components par défaut**, et Client Components uniquement pour l'interactivité (panier, formulaire, menu mobile).
- **Panier** : `localStorage` du navigateur, validé par Zod.
- **Commande** : Server Action qui revalide et **recalcule les prix côté serveur**.

## 4. Le Dockerfile, étape par étape

| Instruction | Explication à l'oral |
|---|---|
| `FROM node:24-alpine AS deps` | Image officielle Node 24 LTS sur Alpine, très légère. `AS deps` nomme l'étape. |
| `RUN apk add libc6-compat` | Compatibilité de certains modules natifs avec Alpine. |
| `WORKDIR /app` | Dossier de travail dans le conteneur. |
| `COPY package.json package-lock.json ./` | On copie d'abord les manifestes : le cache Docker évite de réinstaller si seul le code change. |
| `RUN npm ci` | Installation reproductible des versions exactes. |
| `FROM … AS builder` | Deuxième étape : la compilation. |
| `COPY --from=deps …node_modules` | On réutilise les dépendances de l'étape 1. |
| `COPY . .` | Code source (filtré par `.dockerignore`). |
| `RUN npm run build` | Génère `.next/standalone` et `.next/static`. |
| `FROM … AS runner` | Image finale propre : ni code source, ni outils de build. |
| `ENV NODE_ENV=production`, `PORT=3000`, `HOSTNAME=0.0.0.0` | Mode production, port interne 3000, écoute sur toutes les interfaces (sinon le site serait injoignable depuis l'extérieur du conteneur). |
| `RUN addgroup … adduser …` | Crée l'utilisateur `nextjs`, non privilégié. |
| `COPY --from=builder … standalone / static / public` | On ne copie que le nécessaire pour exécuter le site. |
| `USER nextjs` | Le serveur ne tourne pas en root : si le conteneur est compromis, les dégâts sont limités. |
| `EXPOSE 3000` | Documente le port. Il ne l'ouvre pas : c'est `docker run -p` qui publie le port. |
| `HEALTHCHECK` | Docker vérifie toutes les 30 s que le site répond et affiche `healthy`. |
| `CMD ["node", "server.js"]` | Commande de démarrage. |

**Pourquoi le multi-étapes ?** L'image finale ne contient pas les dépendances de développement, le code TypeScript ni le cache de build : environ 75 Mo compressés (mesuré sur Docker Hub). Elle est aussi plus sûre, car elle contient moins de logiciels exposés.

## 5. Cycle Git / GitHub

1. Chaque membre travaille sur sa partie et fait des commits explicites (`feat:`, `test:`, `build:`, `docs:`).
2. `git push` vers le dépôt public GitHub.
3. Le `.gitignore` exclut `node_modules`, `.next`, `.env*` et `*.pem` : aucun secret n'est publié.

## 6. Docker Hub

`docker build` (en local) → `docker login` (avec un jeton d'accès) → `docker push leti1006/ivoiremarket:v1` → vérification avec `docker manifest inspect`.

**L'image publiée est exactement celle qui a été testée** : les tests Playwright ont été lancés contre le conteneur avant le push.

## 7. Déploiement EC2

1. Instance Ubuntu 24.04 (x86_64) avec une clé SSH `.pem`.
2. Installation de Docker (`apt-get install docker.io`).
3. `docker pull leti1006/ivoiremarket:v1`, sans aucun build sur le serveur.
4. `docker run -d --restart unless-stopped -p 80:3000 …` : le port 80 de la machine est redirigé vers le port 3000 du conteneur.
5. Vérification avec `docker ps`, `docker logs`, `curl -I http://localhost`, puis depuis un navigateur externe.

## 8. Groupe de sécurité

| Règle | Source | Justification |
|---|---|---|
| HTTP 80 | 0.0.0.0/0 | Le site doit être public. |
| SSH 22 | Mon IP /32 | Seuls nous administrons le serveur. |
| *(port 3000 fermé)* | — | Inutile : Docker redirige déjà 80 → 3000. |

C'est le principe du **moindre privilège** : on n'ouvre que ce qui est nécessaire.

## Scénario de démonstration (5 à 8 minutes)

**Avant la soutenance :** vérifier que l'instance EC2 est démarrée, que `http://<IP>` répond, et ouvrir les onglets nécessaires (site, Docker Hub, GitHub, terminal SSH).

| Temps | Action | Ce qu'on dit |
|---|---|---|
| 0:00 | Ouvrir `http://<IP_EC2>` | « Le site tourne sur EC2, dans un conteneur Docker. » |
| 0:30 | Accueil, puis catégorie Smartphones | Identité visuelle, prix en FCFA, mention « démonstration ». |
| 1:15 | Rechercher « casque », puis trier par prix | Recherche sans accents, filtres dans l'URL. |
| 2:00 | Fiche produit : quantité 2, ajout au panier | Compteur mis à jour, stock limité. |
| 2:30 | Panier : modifier, supprimer, **actualiser la page** | Le panier est conservé (localStorage). |
| 3:00 | Commande : valider le formulaire vide, puis le remplir | Validation Zod, téléphone ivoirien, frais de livraison. |
| 3:45 | Confirmation | Numéro de commande, total recalculé par le serveur. |
| 4:00 | Vue mobile (outils développeur, F12) | Responsive. |
| 4:30 | GitHub : historique des commits | Contributions de chaque membre. |
| 5:00 | VS Code : `Dockerfile` | Multi-étapes, utilisateur non-root. |
| 5:45 | Docker Hub : tag `v1` | Image publiée. |
| 6:15 | Terminal SSH : `docker ps`, `docker logs ivoiremarket` | Conteneur `healthy`, aucun build sur EC2. |
| 7:00 | Console AWS : groupe de sécurité | Ports 80 et 22 uniquement. |

**Plan B** (si Internet ou AWS ne répond pas) : `docker run -d -p 8080:3000 leti1006/ivoiremarket:v1` en local, puis lancer la même démonstration sur `http://localhost:8080`.

## Questions probables du jury

**Quelle différence entre une image et un conteneur ?**
L'image est un modèle figé, en lecture seule (le « moule »). Le conteneur est une instance en cours d'exécution de cette image. Une même image peut lancer plusieurs conteneurs.

**À quoi sert `-p 80:3000` ?**
Il redirige le port 80 de la machine hôte vers le port 3000 du conteneur. Les visiteurs tapent l'IP sans préciser de port, car 80 est le port HTTP par défaut.

**Pourquoi ne pas construire l'image sur EC2 ?**
C'est la consigne, mais c'est aussi une bonne pratique : on déploie exactement l'image testée, le serveur n'a besoin ni du code ni de Node, et le déploiement est plus rapide et reproductible.

**Pourquoi `npm ci` et pas `npm install` ?**
`npm ci` installe exactement les versions du `package-lock.json` et échoue en cas d'incohérence : les builds sont reproductibles.

**Pourquoi un utilisateur non-root ?**
Si une faille permettait d'exécuter du code dans le conteneur, l'attaquant n'aurait pas les droits administrateur.

**Que se passe-t-il si l'instance redémarre ?**
Le service Docker est activé au démarrage (`systemctl enable`), et `--restart unless-stopped` relance automatiquement le conteneur.

**Comment mettre à jour le site ?**
Modifier le code, construire en local une nouvelle image (par exemple `v2`), la pousser sur Docker Hub, puis faire sur EC2 `docker pull`, arrêter l'ancien conteneur et lancer le nouveau.

**Pourquoi pas de HTTPS ?**
Un certificat HTTPS reconnu (Let's Encrypt) nécessite un nom de domaine. C'est une amélioration prévue. Le site ne collecte aucune donnée sensible.

**Où sont stockées les commandes ?**
Nulle part : c'est une démonstration. Le serveur valide la commande, calcule le total et renvoie un numéro, sans rien enregistrer.

**Pourquoi le serveur recalcule-t-il les prix ?**
Tout ce qui vient du navigateur peut être modifié par l'utilisateur. Le serveur ne fait confiance qu'au catalogue.

**Comment le panier survit-il à une actualisation ?**
Il est stocké dans le `localStorage` du navigateur et validé avec Zod à la relecture, pour ignorer un contenu corrompu.

**Qu'est-ce qu'un Server Component ?**
Un composant React exécuté sur le serveur : il envoie du HTML, sans JavaScript côté navigateur. On n'utilise de composants client que pour ce qui est interactif.

**Comment avez-vous testé ?**
41 tests unitaires (Vitest) et 17 tests de parcours (Playwright, sur ordinateur et sur mobile), exécutés aussi contre le conteneur Docker avant publication.

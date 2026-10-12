# syntax=docker/dockerfile:1
# =============================================================================
# Dockerfile de production d'IvoireMarket (Next.js 16, mode « standalone »).
# Build multi-étapes : on compile dans des images intermédiaires, puis on ne
# copie que le strict nécessaire dans une image finale légère et sans outils
# de compilation. L'image se construit EN LOCAL, puis est publiée sur Docker
# Hub ; le serveur EC2 se contente de la télécharger avec « docker pull ».
# =============================================================================

# -----------------------------------------------------------------------------
# Étape 1 « deps » : installation des dépendances
# -----------------------------------------------------------------------------
# Image de base officielle Node.js 24 (version LTS) sur Alpine Linux, très légère.
FROM node:24-alpine AS deps

# Bibliothèque de compatibilité recommandée pour certains modules natifs sous Alpine.
RUN apk add --no-cache libc6-compat

# Dossier de travail dans le conteneur : toutes les commandes suivantes s'y exécutent.
WORKDIR /app

# On copie d'abord uniquement les manifestes npm : tant qu'ils ne changent pas,
# Docker réutilise le cache de cette étape et n'a pas à tout réinstaller.
COPY package.json package-lock.json ./

# Installation reproductible des versions exactes du package-lock.json.
RUN npm ci

# -----------------------------------------------------------------------------
# Étape 2 « builder » : compilation de l'application
# -----------------------------------------------------------------------------
# Nouvelle étape repartant de la même image de base.
FROM node:24-alpine AS builder

# Même dossier de travail que l'étape précédente.
WORKDIR /app

# Récupère les dépendances installées à l'étape « deps ».
COPY --from=deps /app/node_modules ./node_modules

# Copie le code source (les fichiers listés dans .dockerignore sont exclus).
COPY . .

# Désactive la télémétrie anonyme de Next.js pendant le build.
ENV NEXT_TELEMETRY_DISABLED=1

# Build de production : génère .next/standalone (serveur minimal) et .next/static.
RUN npm run build

# -----------------------------------------------------------------------------
# Étape 3 « runner » : image finale exécutée en production
# -----------------------------------------------------------------------------
# Image finale repartant d'une base propre : ni code source, ni outils de build.
FROM node:24-alpine AS runner

# Dossier de travail de l'application dans l'image finale.
WORKDIR /app

# Mode production, sans télémétrie.
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Port d'écoute interne du serveur Next.js.
ENV PORT=3000

# Écoute sur toutes les interfaces, sinon le serveur serait injoignable depuis l'hôte.
ENV HOSTNAME=0.0.0.0

# Crée un groupe et un utilisateur système non privilégiés (principe du moindre privilège).
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

# Copie les fichiers statiques publics (favicon, etc.).
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Copie le serveur autonome produit par « output: 'standalone' » (server.js + modules utiles).
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./

# Copie les ressources compilées (JS, CSS, polices) que server.js sert sous /_next/static.
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# À partir d'ici, tout s'exécute avec l'utilisateur non privilégié, pas en root.
USER nextjs

# Documente le port utilisé par le conteneur (la publication se fait avec « docker run -p »).
EXPOSE 3000

# Vérifie toutes les 30 s que l'application répond ; Docker affiche alors « healthy ».
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

# Commande de démarrage : le serveur Node.js minimal généré par Next.js.
CMD ["node", "server.js"]

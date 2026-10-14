#!/usr/bin/env bash
# =============================================================================
# Déploiement d'IvoireMarket sur une instance EC2 Ubuntu.
# Ce script NE CONSTRUIT PAS l'image : il télécharge l'image déjà publiée sur
# Docker Hub (docker pull), puis remplace l'ancien conteneur par le nouveau.
#
# Usage (sur le serveur EC2) :
#   ./ec2-deploy.sh <utilisateur_dockerhub> [tag]
#   ex. ./ec2-deploy.sh leti1006 v2
#
# Secrets : le fichier ~/ivoiremarket.env (droits 600, jamais versionné)
# contient ADMIN_USERNAME, ADMIN_PASSWORD et SESSION_SECRET. S'il n'existe
# pas, il est créé avec des valeurs aléatoires.
# Données : le volume Docker « ivoiremarket-data » conserve la base SQLite
# (produits, stocks, commandes) d'un déploiement à l'autre.
# =============================================================================
set -euo pipefail

DOCKERHUB_USER="${1:?Indiquez votre nom d'utilisateur Docker Hub}"
TAG="${2:-v2}"
IMAGE="${DOCKERHUB_USER}/ivoiremarket:${TAG}"
CONTAINER="ivoiremarket"
ENV_FILE="${HOME}/ivoiremarket.env"
VOLUME="ivoiremarket-data"

echo "==> Image : ${IMAGE}"

# 1. Fichier de secrets : créé une seule fois, lisible uniquement par l'utilisateur.
if [ ! -f "${ENV_FILE}" ]; then
  echo "==> Création de ${ENV_FILE} (secrets aléatoires)"
  umask 077
  {
    echo "ADMIN_USERNAME=admin"
    echo "ADMIN_PASSWORD=$(openssl rand -base64 18 | tr -d '/+=' | cut -c1-20)"
    echo "SESSION_SECRET=$(openssl rand -base64 48 | tr -d '\n')"
  } > "${ENV_FILE}"
  echo "    Mot de passe admin : à lire avec  cat ${ENV_FILE}"
fi

# 2. Télécharger l'image publiée (aucun build sur EC2).
docker pull "${IMAGE}"

# 3. Arrêter et supprimer proprement l'ancien conteneur s'il existe.
if docker ps -a --format '{{.Names}}' | grep -qx "${CONTAINER}"; then
  echo "==> Arrêt de l'ancien conteneur"
  docker stop "${CONTAINER}" >/dev/null
  docker rm "${CONTAINER}" >/dev/null
fi

# 4. Lancer le conteneur : port public 80 -> port 3000 du conteneur,
#    secrets via --env-file, base de données dans un volume persistant.
docker run -d \
  --name "${CONTAINER}" \
  --restart unless-stopped \
  -p 80:3000 \
  --env-file "${ENV_FILE}" \
  -v "${VOLUME}:/app/data" \
  "${IMAGE}"

# 5. Vérifier que l'application répond localement.
echo "==> Vérification..."
for i in $(seq 1 30); do
  if curl -fsS -o /dev/null http://localhost/; then
    echo "==> OK : l'application répond sur http://localhost/"
    docker ps --filter "name=${CONTAINER}"
    exit 0
  fi
  sleep 2
done

echo "!! L'application ne répond pas. Derniers logs :" >&2
docker logs --tail 50 "${CONTAINER}" >&2
exit 1

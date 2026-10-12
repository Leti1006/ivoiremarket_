#!/usr/bin/env bash
# =============================================================================
# Déploiement d'IvoireMarket sur une instance EC2 Ubuntu.
# Ce script NE CONSTRUIT PAS l'image : il télécharge l'image déjà publiée sur
# Docker Hub (docker pull), puis remplace l'ancien conteneur par le nouveau.
#
# Usage (sur le serveur EC2) :
#   ./ec2-deploy.sh <utilisateur_dockerhub> [tag]
#   ex. ./ec2-deploy.sh monpseudo v1
# =============================================================================
set -euo pipefail

DOCKERHUB_USER="${1:?Indiquez votre nom d'utilisateur Docker Hub}"
TAG="${2:-v1}"
IMAGE="${DOCKERHUB_USER}/ivoiremarket:${TAG}"
CONTAINER="ivoiremarket"

echo "==> Image : ${IMAGE}"

# 1. Télécharger l'image publiée (aucun build sur EC2).
docker pull "${IMAGE}"

# 2. Arrêter et supprimer proprement l'ancien conteneur s'il existe.
if docker ps -a --format '{{.Names}}' | grep -qx "${CONTAINER}"; then
  echo "==> Arrêt de l'ancien conteneur"
  docker stop "${CONTAINER}" >/dev/null
  docker rm "${CONTAINER}" >/dev/null
fi

# 3. Lancer le conteneur : port public 80 de l'hôte -> port 3000 du conteneur.
#    --restart unless-stopped : redémarre automatiquement après un reboot.
docker run -d \
  --name "${CONTAINER}" \
  --restart unless-stopped \
  -p 80:3000 \
  "${IMAGE}"

# 4. Vérifier que l'application répond localement.
echo "==> Vérification..."
for i in $(seq 1 20); do
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

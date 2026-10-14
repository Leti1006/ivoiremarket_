# Aide-mémoire des commandes

## Développement (poste local)

| Commande | Effet |
|---|---|
| `npm ci` | Installe exactement les versions du `package-lock.json` |
| `npm run dev` | Serveur de développement sur http://localhost:3000 |
| `npm run lint` | Analyse ESLint |
| `npm run typecheck` | Vérification TypeScript stricte |
| `npm run test` | Tests unitaires Vitest |
| `npm run build` | Build de production (`.next/standalone`) |
| `npm run test:e2e` | Tests Playwright (lance le serveur de production) |

## Git

```bash
git status                       # fichiers modifiés
git add <fichiers>               # préparer un commit
git commit -m "feat: ..."        # enregistrer
git log --oneline --graph        # historique
git push                         # publier sur GitHub
```

Convention des messages : `feat:` (fonctionnalité), `fix:` (correction), `test:`, `build:` (Docker), `docs:`, `chore:` (configuration).

## Docker (poste local)

```bash
docker version                                            # Docker fonctionne ?
docker build -t leti1006/ivoiremarket:v1 .                # construire l'image
docker images leti1006/ivoiremarket                       # lister l'image
docker run -d --name ivoiremarket -p 8080:3000 --env-file ivoiremarket.env -v ivoiremarket-data:/app/data leti1006/ivoiremarket:v2
docker volume ls                                          # le volume de la base
docker exec ivoiremarket ls -l /app/data                  # fichier SQLite
docker ps                                                 # conteneurs actifs (healthy ?)
docker logs -f ivoiremarket                               # logs en direct
curl -I http://localhost:8080                             # test HTTP
docker exec ivoiremarket whoami                           # -> nextjs (pas root)
docker stop ivoiremarket && docker rm ivoiremarket        # arrêter / supprimer
```

## Docker Hub

```bash
docker login -u leti1006
docker push leti1006/ivoiremarket:v1
docker manifest inspect leti1006/ivoiremarket:v1
docker pull leti1006/ivoiremarket:v1
```

## AWS EC2

```bash
# Connexion (depuis le poste local)
ssh -i ~/.ssh/ivoiremarket-key.pem ubuntu@<IP>

# Installation de Docker (une seule fois)
sudo apt-get update && sudo apt-get install -y docker.io
sudo systemctl enable --now docker
sudo usermod -aG docker ubuntu && exit       # se reconnecter ensuite

# Déploiement (aucun build : uniquement pull + run) — le script fait tout :
./ec2-deploy.sh leti1006 v2
# Équivalent manuel :
docker pull leti1006/ivoiremarket:v2
docker rm -f ivoiremarket 2>/dev/null || true
docker run -d --name ivoiremarket --restart unless-stopped -p 80:3000   --env-file ~/ivoiremarket.env -v ivoiremarket-data:/app/data leti1006/ivoiremarket:v2
cat ~/ivoiremarket.env                     # identifiants admin (ne jamais les publier)

# Vérifications
docker ps
docker logs --tail 50 ivoiremarket
curl -I http://localhost
curl -s http://checkip.amazonaws.com      # IP publique du serveur
```

## Diagnostic rapide

| Symptôme | Vérification |
|---|---|
| Le site ne répond pas depuis Internet | Groupe de sécurité : port 80 ouvert ? `curl -I http://localhost` fonctionne-t-il sur le serveur ? |
| `permission denied` avec docker | `sudo usermod -aG docker ubuntu`, puis se reconnecter |
| `port is already allocated` | `docker ps` : un ancien conteneur utilise le port → `docker rm -f ivoiremarket` |
| `exec format error` | Instance ARM (t4g) alors que l'image est `amd64` : utiliser t3.micro ou t2.micro |
| SSH `Permission denied (publickey)` | Mauvaise clé ou utilisateur : `ubuntu@` pour Ubuntu ; sous Linux/Mac, `chmod 400` sur la clé |
| SSH bloqué (timeout) | Votre IP a changé : mettre à jour la règle « My IP » du port 22 |

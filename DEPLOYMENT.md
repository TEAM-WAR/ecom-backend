# Guide de Déploiement - Ecom Backend API

## Vue d'ensemble

Cette API Node.js/Express est déployée avec Docker et MongoDB pour gérer les données de l'application e-commerce.

## Prérequis

- Docker et Docker Compose installés
- Connexion Internet pour MongoDB Atlas
- Port 5000 disponible
- Au moins 1GB de RAM disponible

## Configuration

### Variables d'environnement

Le fichier `docker-compose.yml` contient les variables suivantes :

```yaml
environment:
  - NODE_ENV=production
  - PORT=5000
  - MONGO_URI=mongodb+srv://jesserbk:STxq50ZR020XtaWT@cluster0.z6e0l6w.mongodb.net/globalup?retryWrites=true&w=majority&appName=Cluster0
```

### Volumes

- `./uploads:/app/uploads` : Dossier pour les fichiers uploadés

## Déploiement Rapide

### 1. Utilisation du script de déploiement (Recommandé)

```bash
# Rendre le script exécutable (première fois seulement)
chmod +x deploy.sh

# Démarrer l'API
./deploy.sh start

# Vérifier le statut
./deploy.sh status

# Voir les logs
./deploy.sh logs

# Arrêter l'API
./deploy.sh stop

# Redémarrer l'API
./deploy.sh restart

# Reconstruire et redémarrer (après modifications du code)
./deploy.sh rebuild

# Nettoyer les ressources
./deploy.sh cleanup
```

### 2. Déploiement manuel avec Docker Compose

```bash
# Construire l'image
docker-compose build --no-cache

# Démarrer les services
docker-compose up -d

# Vérifier le statut
docker-compose ps

# Voir les logs
docker-compose logs -f

# Arrêter les services
docker-compose down
```

### 3. Déploiement direct avec Docker

```bash
# Construire l'image
docker build -t ecom-backend:latest .

# Démarrer le conteneur
docker run -d \
  --name ecom-backend \
  -p 5000:5000 \
  -e NODE_ENV=production \
  -e PORT=5000 \
  -e MONGO_URI="mongodb+srv://jesserbk:STxq50ZR020XtaWT@cluster0.z6e0l6w.mongodb.net/globalup?retryWrites=true&w=majority&appName=Cluster0" \
  -v $(pwd)/uploads:/app/uploads \
  --restart unless-stopped \
  ecom-backend:latest
```

## Endpoints API

### Test de connectivité

```bash
# Test de base
curl http://localhost:5000

# Test avec headers
curl -I http://localhost:5000

# Test d'un endpoint spécifique
curl http://localhost:5000/api/products
```

### Endpoints disponibles

- `GET /` - Page d'accueil de l'API
- `GET /api/products` - Liste des produits
- `POST /api/products` - Créer un produit
- `GET /api/products/:id` - Détails d'un produit
- `PUT /api/products/:id` - Modifier un produit
- `DELETE /api/products/:id` - Supprimer un produit

## Monitoring

### Vérification de la santé

```bash
# Test de connectivité
curl -I http://localhost:5000

# Health check du conteneur
docker inspect ecom-backend_app_1 | grep Health -A 10

# Statut des services
docker-compose ps
```

### Logs

```bash
# Logs en temps réel
./deploy.sh logs

# Logs avec timestamps
docker-compose logs -t

# Logs des dernières 100 lignes
docker-compose logs --tail 100
```

## Maintenance

### Mise à jour de l'API

```bash
# 1. Arrêter l'API
./deploy.sh stop

# 2. Mettre à jour le code source
git pull origin main

# 3. Reconstruire et redémarrer
./deploy.sh rebuild
```

### Sauvegarde des données

```bash
# Sauvegarder le dossier uploads
tar -czf uploads-backup-$(date +%Y%m%d).tar.gz uploads/

# Restaurer les uploads
tar -xzf uploads-backup-YYYYMMDD.tar.gz
```

### Nettoyage

```bash
# Nettoyage complet
./deploy.sh cleanup

# Supprimer les images non utilisées
docker image prune -f

# Supprimer les conteneurs arrêtés
docker container prune -f
```

## Dépannage

### Problèmes courants

1. **Port 5000 déjà utilisé**
   ```bash
   # Vérifier ce qui utilise le port 5000
   sudo netstat -tlnp | grep :5000
   
   # Arrêter le service qui utilise le port
   sudo systemctl stop <service-name>
   ```

2. **Erreur de connexion MongoDB**
   ```bash
   # Vérifier la connectivité
   curl -I http://localhost:5000
   
   # Vérifier les logs
   ./deploy.sh logs
   
   # Vérifier les variables d'environnement
   docker-compose config
   ```

3. **API ne répond pas**
   ```bash
   # Vérifier le statut du conteneur
   ./deploy.sh status
   
   # Vérifier les logs
   ./deploy.sh logs
   
   # Redémarrer l'API
   ./deploy.sh restart
   ```

4. **Problème de permissions uploads**
   ```bash
   # Corriger les permissions
   sudo chown -R $USER:$USER uploads/
   chmod -R 755 uploads/
   ```

### Logs d'erreur

Les logs sont disponibles via :
- Docker Compose : `docker-compose logs`
- Conteneur direct : `docker logs ecom-backend_app_1`

## Sécurité

- L'application s'exécute avec un utilisateur non-root
- Conteneur isolé avec Docker
- Redémarrage automatique en cas de crash
- Variables d'environnement sécurisées

## Performance

- Node.js optimisé pour la production
- Connexion MongoDB Atlas (cloud)
- Gestion des uploads de fichiers
- Health checks automatiques

## Intégration avec le Frontend

Le frontend (ecom-dashboard) doit être configuré pour pointer vers :
```
http://localhost:5000
```

ou l'IP du serveur :
```
http://<server-ip>:5000
```

## Support

Pour toute question ou problème :
1. Vérifier les logs : `./deploy.sh logs`
2. Vérifier le statut : `./deploy.sh status`
3. Consulter cette documentation
4. Vérifier la connectivité MongoDB
5. Contacter l'équipe de développement 
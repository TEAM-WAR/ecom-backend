# 🗄️ Configuration MongoDB

## Option 1: MongoDB Local (Recommandé pour le développement)

### Installation MongoDB Community Edition

#### Windows
1. Téléchargez MongoDB Community Server depuis [mongodb.com](https://www.mongodb.com/try/download/community)
2. Installez avec les paramètres par défaut
3. MongoDB sera accessible sur `mongodb://localhost:27017`

#### macOS (avec Homebrew)
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb/brew/mongodb-community
```

#### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install mongodb
sudo systemctl start mongodb
sudo systemctl enable mongodb
```

### Vérification
```bash
# Vérifier que MongoDB fonctionne
mongosh
# ou
mongo
```

## Option 2: MongoDB Atlas (Cloud - Gratuit)

### 1. Créer un compte MongoDB Atlas
1. Allez sur [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Créez un compte gratuit
3. Créez un nouveau cluster (gratuit)

### 2. Configurer la base de données
1. Cliquez sur "Connect"
2. Choisissez "Connect your application"
3. Copiez l'URI de connexion

### 3. Mettre à jour le fichier .env
```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/ecommerce?retryWrites=true&w=majority
```

**Remplacez :**
- `username` : votre nom d'utilisateur MongoDB
- `password` : votre mot de passe MongoDB
- `cluster` : l'identifiant de votre cluster

### 4. Configurer l'accès réseau
1. Dans MongoDB Atlas, allez dans "Network Access"
2. Cliquez sur "Add IP Address"
3. Ajoutez `0.0.0.0/0` pour permettre l'accès depuis n'importe où (développement uniquement)

## Option 3: Docker (Alternative)

### Installation avec Docker
```bash
# Lancer MongoDB avec Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Vérifier que le conteneur fonctionne
docker ps
```

## 🔧 Test de connexion

Une fois MongoDB configuré, testez votre serveur :

```bash
# Démarrer le serveur
npm run dev

# Dans un autre terminal, tester l'API
curl http://localhost:5000
```

Vous devriez voir :
```json
{
  "message": "API E-commerce Backend - Fonctionnel !"
}
```

## 🗂️ Initialiser la base de données

Pour peupler la base de données avec des données de test :

```bash
npm run seed
```

Cela ajoutera 6 produits d'exemple dans votre base de données.

## 🚨 Dépannage

### Erreur de connexion MongoDB
- Vérifiez que MongoDB est démarré
- Vérifiez l'URI de connexion dans `.env`
- Vérifiez les paramètres réseau (pour Atlas)

### Erreur "ECONNREFUSED"
- MongoDB n'est pas démarré
- Le port 27017 est bloqué
- Vérifiez l'URI de connexion

### Erreur d'authentification (Atlas)
- Vérifiez le nom d'utilisateur et mot de passe
- Assurez-vous que l'utilisateur a les bonnes permissions 
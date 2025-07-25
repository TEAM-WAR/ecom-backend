# 🛒 API E-commerce Backend

Backend Express.js avec MongoDB pour une application e-commerce complète.

## 🚀 Installation

1. **Cloner le projet**
```bash
git clone <votre-repo>
cd ecom-backend
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configuration MongoDB**
   - Assurez-vous que MongoDB est installé et en cours d'exécution
   - Ou utilisez MongoDB Atlas (cloud)

4. **Variables d'environnement**
Créez un fichier `.env` à la racine du projet :
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/ecommerce
NODE_ENV=development
```

5. **Démarrer le serveur**
```bash
# Mode développement (avec nodemon)
npm run dev

# Mode production
npm start
```

## 📡 API Endpoints

### Produits

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/products` | Récupérer tous les produits |
| GET | `/api/products/:id` | Récupérer un produit par ID |
| POST | `/api/products` | Créer un nouveau produit |
| PUT | `/api/products/:id` | Mettre à jour un produit |
| DELETE | `/api/products/:id` | Supprimer un produit |
| POST | `/api/products/:id/reviews` | Ajouter une review |

### Filtres disponibles

- `?category=Électronique` - Filtrer par catégorie
- `?search=smartphone` - Recherche textuelle
- `?minPrice=100&maxPrice=500` - Filtrer par prix
- `?inStock=true` - Produits en stock uniquement

## 📊 Modèle de données

### Produit
```javascript
{
  name: String (requis, max 100 caractères),
  price: Number (requis, min 0),
  description: String (requis, max 500 caractères),
  category: String (requis, enum),
  inStock: Boolean (défaut: true),
  stockQuantity: Number (défaut: 0),
  imageUrl: String,
  rating: Number (0-5),
  reviews: Array,
  createdAt: Date,
  updatedAt: Date
}
```

### Catégories disponibles
- Électronique
- Vêtements
- Livres
- Maison
- Sport
- Autre

## 🔧 Exemples d'utilisation

### Créer un produit
```bash
curl -X POST http://localhost:5000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "iPhone 15",
    "price": 999,
    "description": "Dernier iPhone avec puce A17 Pro",
    "category": "Électronique",
    "stockQuantity": 50
  }'
```

### Récupérer tous les produits
```bash
curl http://localhost:5000/api/products
```

### Ajouter une review
```bash
curl -X POST http://localhost:5000/api/products/PRODUCT_ID/reviews \
  -H "Content-Type: application/json" \
  -d '{
    "user": "Jean Dupont",
    "rating": 5,
    "comment": "Excellent produit !"
  }'
```

## 🛠️ Technologies utilisées

- **Express.js** - Framework web
- **MongoDB** - Base de données NoSQL
- **Mongoose** - ODM pour MongoDB
- **dotenv** - Gestion des variables d'environnement
- **nodemon** - Redémarrage automatique en développement

## 📝 Structure du projet

```
ecom-backend/
├── src/
│   ├── controllers/
│   │   └── productController.js
│   ├── models/
│   │   └── Product.js
│   ├── routes/
│   │   └── productRoutes.js
│   └── index.js
├── .env
├── package.json
└── README.md
```

## 🔒 Sécurité

- Validation des données avec Mongoose
- Gestion d'erreurs centralisée
- CORS configuré pour le frontend
- Variables d'environnement pour les secrets

## 🚀 Déploiement

1. **Préparer pour la production**
```bash
npm run build
```

2. **Variables d'environnement de production**
```env
PORT=5000
MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/ecommerce
NODE_ENV=production
```

## 📞 Support

Pour toute question ou problème, ouvrez une issue sur GitHub. 
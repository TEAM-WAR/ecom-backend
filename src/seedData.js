import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './models/Product.js';

dotenv.config();

const sampleProducts = [
  {
    name: "iPhone 15 Pro",
    price: 1199,
    description: "Le dernier iPhone avec puce A17 Pro, appareil photo 48MP et design en titane",
    category: "Électronique",
    stockQuantity: 25,
    imageUrl: "https://example.com/iphone15.jpg",
    rating: 4.8,
    reviews: [
      {
        user: "Marie Dupont",
        rating: 5,
        comment: "Excellent téléphone, très rapide et photos magnifiques !"
      },
      {
        user: "Jean Martin",
        rating: 4,
        comment: "Très bon produit, mais un peu cher"
      }
    ]
  },
  {
    name: "MacBook Air M2",
    price: 1499,
    description: "Ordinateur portable ultra-léger avec puce M2, parfait pour la productivité",
    category: "Électronique",
    stockQuantity: 15,
    imageUrl: "https://example.com/macbook-air.jpg",
    rating: 4.9,
    reviews: [
      {
        user: "Sophie Bernard",
        rating: 5,
        comment: "Incroyablement rapide et silencieux !"
      }
    ]
  },
  {
    name: "T-shirt Premium",
    price: 29.99,
    description: "T-shirt en coton bio de haute qualité, coupe moderne",
    category: "Vêtements",
    stockQuantity: 100,
    imageUrl: "https://example.com/tshirt.jpg",
    rating: 4.2,
    reviews: [
      {
        user: "Pierre Durand",
        rating: 4,
        comment: "Très confortable et bonne qualité"
      }
    ]
  },
  {
    name: "Livre 'Le Guide du Développeur'",
    price: 39.99,
    description: "Guide complet pour apprendre le développement web moderne",
    category: "Livres",
    stockQuantity: 50,
    imageUrl: "https://example.com/livre-dev.jpg",
    rating: 4.5,
    reviews: [
      {
        user: "Alexandre Moreau",
        rating: 5,
        comment: "Contenu très bien structuré et à jour"
      }
    ]
  },
  {
    name: "Canapé Moderne",
    price: 899,
    description: "Canapé 3 places design, tissu résistant et confortable",
    category: "Maison",
    stockQuantity: 8,
    imageUrl: "https://example.com/canape.jpg",
    rating: 4.3,
    reviews: [
      {
        user: "Claire Rousseau",
        rating: 4,
        comment: "Très confortable, parfait pour le salon"
      }
    ]
  },
  {
    name: "Vélo de Course",
    price: 1299,
    description: "Vélo de course professionnel, cadre en carbone, ultra-léger",
    category: "Sport",
    stockQuantity: 12,
    imageUrl: "https://example.com/velo.jpg",
    rating: 4.7,
    reviews: [
      {
        user: "Thomas Leroy",
        rating: 5,
        comment: "Performance exceptionnelle, très léger"
      }
    ]
  }
];

const seedDatabase = async () => {
  try {
    // Connexion à MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    
    console.log('✅ Connecté à MongoDB');
    
    // Supprimer tous les produits existants
    await Product.deleteMany({});
    console.log('🗑️ Base de données vidée');
    
    // Insérer les nouveaux produits
    const createdProducts = await Product.insertMany(sampleProducts);
    console.log(`✅ ${createdProducts.length} produits ajoutés à la base de données`);
    
    // Afficher les produits créés
    console.log('\n📦 Produits créés :');
    createdProducts.forEach(product => {
      console.log(`- ${product.name} (${product.price}TND)`);
    });
    
    console.log('\n🎉 Base de données initialisée avec succès !');
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation :', error);
  } finally {
    // Fermer la connexion
    await mongoose.connection.close();
    console.log('🔌 Connexion MongoDB fermée');
  }
};

// Exécuter le script si appelé directement
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase();
}

export default seedDatabase; 
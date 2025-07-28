import express from 'express';
import productRoutes from './productRoutes.js';
import categoryRoutes from './categoryRoutes.js';
import uploadRoutes from './uploadRoutes.js';
import transactionRoutes from './transactionRoutes.js';
import colisRoutes from './colisRoutes.js';

const router = express.Router();

// Routes pour les produits
router.use('/products', productRoutes);

// Routes pour les catégories
router.use('/categories', categoryRoutes);

// Routes pour l'upload d'images
router.use('/upload', uploadRoutes);

// Routes pour les transactions
router.use('/transactions', transactionRoutes);

// Routes pour les colis
router.use('/colis', colisRoutes);

export default router; 
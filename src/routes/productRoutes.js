import express from 'express';
import { 
  getAllProducts, 
  getProductById, 
  createProduct, 
  updateProduct, 
  deleteProduct,
  addReview
} from '../controllers/productController.js';

const router = express.Router();

// Routes principales
router.get('/', getAllProducts);
router.get('/:id', getProductById);
router.post('/', createProduct);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);

// Route pour ajouter une review
router.post('/:id/reviews', addReview);

export default router; 
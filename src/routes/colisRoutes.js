import express from 'express';
import { 
  getAllColis, 
  getColisById, 
  getColisByCodeBarre,
  createColis, 
  updateColis, 
  deleteColis,
  updateColisStatus,
  searchColisByDestinataire,
  getColisStats,
  createMultipleColis
} from '../controllers/colisController.js';

const router = express.Router();

// Routes principales CRUD
router.get('/', getAllColis);
router.get('/stats', getColisStats);
router.get('/:id', getColisById);
router.post('/', createColis);
router.post('/batch', createMultipleColis);
router.put('/:id', updateColis);
router.delete('/:id', deleteColis);

// Routes spécialisées
router.get('/code-barre/:codeBarre', getColisByCodeBarre);
router.get('/destinataire/:nomDestinataire', searchColisByDestinataire);
router.patch('/:id/status', updateColisStatus);

export default router; 
import express from 'express';
import { 
  getAllColis, 
  getColisById, 
  getColisByCodeBarre,
  detectColis, 
  updateColis, 
  deleteColis,
  updateColisStatus,
  searchColisByDestinataire,
  getColisStats,
  createMultipleColis,
  createColis,
  markAsReturned,
  updatePendingColisStatus
} from '../controllers/colisController.js';

const router = express.Router();

// Routes principales CRUD
router.get('/', getAllColis);
router.get('/stats', getColisStats);
router.get('/:id', getColisById);
router.post('/', detectColis);
router.post('/confirm', createColis);
router.post('/batch', createMultipleColis);
router.put('/:id', updateColis);
router.delete('/:id', deleteColis);

// Routes spécialisées
router.get('/code-barre/:codeBarre', getColisByCodeBarre);
router.get('/destinataire/:nomDestinataire', searchColisByDestinataire);
router.patch('/:id/status', updateColisStatus);
router.patch('/:id/mark-as-returned', markAsReturned);
router.patch('/update-pending-status', updatePendingColisStatus);

export default router; 
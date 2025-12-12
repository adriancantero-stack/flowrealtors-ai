import { Router } from 'express';
import { getLeads, createLead, updateLead, deleteLead } from '../controllers/leadController';

const router = Router();

// In real app, add authMiddleware here
router.get('/', getLeads);
router.post('/', createLead);
router.put('/:id', updateLead);
router.delete('/:id', deleteLead);

export default router;

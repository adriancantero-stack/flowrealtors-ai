import { Router } from 'express';
import { getPublicFunnel, submitFunnelForm } from '../controllers/funnelController';

const router = Router();

// GET /api/public/realtors/:slug
router.get('/realtors/:slug', getPublicFunnel);

// POST /api/public/realtors/:slug/apply (Optional alias, mostly used by funnel)
router.post('/realtors/:slug/apply', submitFunnelForm);

export default router;

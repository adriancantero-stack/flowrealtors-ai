import { Router } from 'express';
import {
    getFunnelSettings,
    updateFunnelSettings,
    getPublicFunnel,
    submitFunnelForm
} from '../controllers/funnelController';

const router = Router();

// Private (Dashboard)
router.get('/settings/:userId', getFunnelSettings);
router.post('/settings/:userId', updateFunnelSettings);

// Public
router.get('/public/:slug', getPublicFunnel);
router.post('/public/:slug/apply', submitFunnelForm);

export default router;

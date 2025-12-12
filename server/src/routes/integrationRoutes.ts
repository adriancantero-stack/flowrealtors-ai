import { Router } from 'express';
import { handleWebhook, saveIntegrationConfig } from '../controllers/webhookController';

const router = Router();

// Webhooks: /api/integrations/webhooks/:channel/:userId
router.post('/webhooks/:channel/:userId', handleWebhook);

// Config: /api/integrations/config/:channel/:userId
router.post('/config/:channel/:userId', saveIntegrationConfig);

export default router;

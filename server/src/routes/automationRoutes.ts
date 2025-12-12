import { Router } from 'express';
import { getSettings, updateSettings, triggerScheduler } from '../controllers/automationController';

const router = Router();

router.get('/settings/:userId', getSettings);
router.post('/settings/:userId', updateSettings);
router.post('/trigger', triggerScheduler);

export default router;

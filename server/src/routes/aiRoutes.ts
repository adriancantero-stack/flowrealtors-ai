import { Router } from 'express';
import {
    qualifyLead,
    getGeminiSettings,
    updateGeminiSettings,
    testGeminiConnection,
    getGeminiLogs
} from '../controllers/aiController';
import { AIService } from '../services/aiService';

const router = Router();

router.post('/qualify', qualifyLead);
router.post('/translate', async (req, res) => {
    try {
        const { text, target } = req.body;
        const result = await AIService.translate(text, target);
        res.json({ translation: result });
    } catch (error) {
        res.status(500).json({ error: 'Translation failed' });
    }
});

// Admin Routes
router.get('/settings', getGeminiSettings);
router.post('/settings', updateGeminiSettings);
router.post('/test', testGeminiConnection);
router.get('/logs', getGeminiLogs);

export default router;

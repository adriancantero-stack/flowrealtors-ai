import express from 'express';
import { WhatsAppService } from '../services/whatsappService';

const router = express.Router();

// Settings Endpoints
router.get('/settings', async (req, res) => {
    const settings = await WhatsAppService.getSettings();
    res.json(settings);
});

router.post('/settings', async (req, res) => {
    try {
        await WhatsAppService.saveSettings(req.body);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to save settings' });
    }
});

router.post('/test', async (req, res) => {
    try {
        const { to, message } = req.body;
        const result = await WhatsAppService.sendMessage(to, message);
        res.json({ success: true, result });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Webhook Verification (GET)
router.get('/webhooks/inbound', async (req, res) => {
    const settings = await WhatsAppService.getSettings();

    const mode = req.query['hub.mode'] as string;
    const token = req.query['hub.verify_token'] as string;
    const challenge = req.query['hub.challenge'] as string;

    const result = WhatsAppService.verifyWebhook(mode, token, challenge, settings);

    if (result) {
        res.status(200).send(result);
    } else {
        res.sendStatus(403);
    }
});

// Webhook Event (POST)
router.post('/webhooks/inbound', async (req, res) => {
    const body = req.body;
    console.log('WhatsApp Webhook:', JSON.stringify(body, null, 2));

    // Basic structure check for Cloud API
    if (body.object) {
        // TODO: Implement Inbound Pipeline (Language -> Gemini -> Automation)
        // For now, verify receipt
        res.status(200).send('EVENT_RECEIVED');
    } else {
        res.sendStatus(404);
    }
});

export default router;

import express from 'express';
import { WhatsAppService } from '../services/whatsappService';
import { AIService } from '../services/aiService';

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

    try {
        if (body.object) {
            if (
                body.entry &&
                body.entry[0].changes &&
                body.entry[0].changes[0] &&
                body.entry[0].changes[0].value.messages &&
                body.entry[0].changes[0].value.messages[0]
            ) {
                const change = body.entry[0].changes[0].value;
                const message = change.messages[0];
                const from = message.from; // Phone number
                const msgBody = message.text?.body;

                if (msgBody) {
                    console.log(`Received message from ${from}: ${msgBody}`);

                    // 1. Generate AI Response
                    // Since we don't have a Lead model fully hydrated here, we pass a partial/mock one or fetch it
                    // For MVP, we treat it as a new interaction
                    const mockLead: any = { status: 'new' };
                    const aiResponse = await AIService.generateResponse(mockLead, msgBody);

                    // 2. Send Response
                    await WhatsAppService.sendMessage(from, aiResponse);
                    console.log(`Sent AI response to ${from}`);
                }
            }
            res.status(200).send('EVENT_RECEIVED');
        } else {
            res.sendStatus(404);
        }
    } catch (error) {
        console.error('Error processing inbound webhook:', error);
        res.status(500).send('Internal Server Error');
    }
});

export default router;

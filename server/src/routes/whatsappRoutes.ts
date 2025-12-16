import express from 'express';
import { WhatsAppService } from '../services/whatsappService';
import { AIService } from '../services/aiService';
import { prisma } from '../lib/prisma';

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
    } catch (error: any) {
        console.error('Save Settings Error:', error);
        res.status(500).json({ error: `Failed to save settings: ${error.message || error}` });
    }
});

router.post('/debug-test', async (req, res) => {
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
                const metadata = change.metadata; // contains phone_number_id
                const message = change.messages[0];
                const from = message.from; // Phone number of the lead
                const msgBody = message.text?.body;

                if (msgBody && metadata?.phone_number_id) {
                    console.log(`Received message from ${from} to ID ${metadata.phone_number_id}: ${msgBody}`);

                    // 1. Identify Realtor
                    const realtor = await prisma.user.findFirst({
                        where: { whatsapp_phone_number_id: metadata.phone_number_id }
                    });

                    if (realtor) {
                        // 2. Find or Create Lead
                        // Upsert by phone + brokerId (composite unique usually, but schema has unique phone global?
                        // Schema has `phone String @unique`, so one phone = one lead global?
                        // Ideally leads are scoped to realtors. 
                        // Check schema again: `phone String @unique` means 1 phone = 1 lead in whole DB.
                        // We will assume global uniqueness for now as per schema.

                        let lead = await prisma.lead.findUnique({
                            where: { phone: from }
                        });

                        if (!lead) {
                            lead = await prisma.lead.create({
                                data: {
                                    phone: from,
                                    name: 'WhatsApp Lead ' + from.slice(-4),
                                    source: 'whatsapp',
                                    status: 'new',
                                    brokerId: realtor.id
                                }
                            });
                            console.log(`Created new lead: ${lead.id}`);
                        } else {
                            // Optional: Update broker if lead was orphan, OR ensure correct ownership?
                            // For now, simple access.
                        }

                        // 3. Save Inbound Message
                        await prisma.leadMessage.create({
                            data: {
                                leadId: lead.id,
                                role: 'user',
                                sender: 'lead',
                                direction: 'inbound',
                                content: msgBody,
                                channel: 'whatsapp',
                                timestamp: new Date()
                            }
                        });

                        // 4. Generate AI Response
                        const aiResponse = await AIService.generateResponse(lead, msgBody);

                        // 5. Save Outbound Message
                        await prisma.leadMessage.create({
                            data: {
                                leadId: lead.id,
                                role: 'assistant',
                                sender: 'ai',
                                direction: 'outbound',
                                content: aiResponse,
                                channel: 'whatsapp',
                                timestamp: new Date()
                            }
                        });

                        // 6. Send via WhatsApp
                        await WhatsAppService.sendMessage(from, aiResponse);
                        console.log(`Sent AI response to ${from}`);

                    } else {
                        console.warn(`No realtor found for phone_number_id: ${metadata.phone_number_id}`);
                    }
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


import express from 'express';
import { prisma } from '../lib/prisma';
import { AIService } from '../services/aiService';

const router = express.Router();

// Mock Inbound Message (Simulate WhatsApp)
router.post('/leads/:leadId/mock-message', async (req, res) => {
    // Basic security check: ensure dev mode or admin
    // if (process.env.NODE_ENV === 'production') return res.status(403).json({ error: 'Dev only' });

    try {
        const { leadId } = req.params;
        const { text, direction = 'inbound', sender = 'lead', trigger_ai = true } = req.body;
        const id = parseInt(leadId);

        const lead = await prisma.lead.findUnique({ where: { id } });
        if (!lead) return res.status(404).json({ error: 'Lead not found' });

        // 1. Save Mock Message
        const message = await prisma.leadMessage.create({
            data: {
                leadId: id,
                content: text,
                direction,
                sender,
                role: sender === 'lead' ? 'user' : 'assistant',
                channel: 'whatsapp_mock',
                timestamp: new Date()
            }
        });

        // 2. Trigger AI Response if requested (and if inbound)
        if (direction === 'inbound' && trigger_ai) {
            const aiResponse = await AIService.generateResponse(lead, text);
            await prisma.leadMessage.create({
                data: {
                    leadId: id,
                    role: 'assistant',
                    sender: 'ai',
                    direction: 'outbound',
                    content: aiResponse,
                    channel: 'whatsapp_mock',
                    timestamp: new Date()
                }
            });
            return res.json({ success: true, message, ai_response: aiResponse });
        }

        res.json({ success: true, message });
    } catch (error) {
        console.error('Mock Message Error:', error);
        res.status(500).json({ error: 'Failed to insert mock message' });
    }
});

export default router;


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

            // Fetch Conversation History
            const historyMessages = await prisma.leadMessage.findMany({
                where: { leadId: lead.id },
                orderBy: { timestamp: 'desc' },
                take: 10
            });
            const history = historyMessages.reverse().map(m =>
                `${m.role === 'assistant' ? 'AI' : 'User'}: ${m.content}`
            ).join('\n');

            const aiResponse = await AIService.generateResponse(lead, text, history);
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

import bcrypt from 'bcryptjs';

// Remote Seed Endpoint (Emergency Restore) - GET for browser access
router.get('/seed-users', async (req, res) => {
    try {
        const usersToRestore = [
            { name: 'Adrian Realtor', email: 'adrian@flowrealtors.com', slug: 'adrian-realtor' },
            { name: 'Patricia Chahin', email: 'patricia@gmail.com', slug: 'patricia-chahin' },
            { name: 'Admin User', email: 'admin@flowrealtors.com', slug: 'admin', role: 'admin' }
        ];

        const SALT_ROUNDS = 10;
        const DEFAULT_HASH = await bcrypt.hash('123456', SALT_ROUNDS);
        const results = [];

        for (const u of usersToRestore) {
            const existing = await prisma.user.findUnique({ where: { email: u.email } });
            if (!existing) {
                const newUser = await prisma.user.create({
                    data: {
                        name: u.name,
                        email: u.email,
                        slug: u.slug,
                        role: u.role || 'realtor',
                        status: 'active',
                        password_hash: DEFAULT_HASH
                    }
                });
                results.push(`Restored: ${u.name}`);
            } else {
                results.push(`Skipped (Exists): ${u.name}`);
            }

            // check for leads
            const user = await prisma.user.findUnique({ where: { email: u.email } });
            if (user) {
                const leadCount = await prisma.lead.count({ where: { brokerId: user.id } });
                if (leadCount === 0) {
                    // Create sample lead
                    const uniquePhone = `+551199999${user.id.toString().padStart(4, '0')}`;

                    // Check if exists first to be safe
                    const existingLead = await prisma.lead.findUnique({ where: { phone: uniquePhone } });

                    if (!existingLead) {
                        await prisma.lead.create({
                            data: {
                                brokerId: user.id,
                                name: 'Exemplo WhatsApp',
                                phone: uniquePhone,
                                status: 'New',
                                source: 'WhatsApp',
                                messages: {
                                    create: [
                                        {
                                            role: 'user',
                                            sender: 'lead',
                                            direction: 'inbound',
                                            content: 'Olá, gostaria de saber mais sobre o imóvel.',
                                            timestamp: new Date()
                                        }
                                    ]
                                }
                            }
                        });
                        results.push(`+ Added Sample Lead for ${u.name}`);
                    } else {
                        results.push(`~ Sample Lead already exists for ${u.name}`);
                    }
                }
            }
        }
        res.json({ success: true, results });
    } catch (error) {
        console.error('Seed Error:', error);
        res.status(500).json({ error: String(error) });
    }
});

export default router;

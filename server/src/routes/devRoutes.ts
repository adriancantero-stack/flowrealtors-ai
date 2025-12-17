
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
        const savedMessage = await prisma.leadMessage.create({
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

            // 4. Generate AI Response
            // Fetch History for Context
            const historyMessages = await prisma.leadMessage.findMany({
                where: { leadId: id }, // Use 'id' which is already parsed
                orderBy: { timestamp: 'desc' },
                take: 10
            });
            const history = historyMessages.reverse().map(m =>
                `${m.role === 'assistant' ? 'AI' : 'User'}: ${m.content}`
            ).join('\n');

            const aiResponse = await AIService.generateResponse(lead, text, history);

            // 5. Save Outbound Message (AI)
            await prisma.leadMessage.create({
                data: {
                    leadId: id, // Use 'id' which is already parsed
                    role: 'assistant',
                    sender: 'ai',
                    direction: 'outbound',
                    content: aiResponse,
                    channel: 'whatsapp_mock', // Preserve existing channel
                    timestamp: new Date()
                }
            });

            // 6. REAL-TIME QUALIFICATION (LaHaus Style)
            // Analyze the user's message to extract insights
            try {
                const analysis = await AIService.qualifyLead(text, history);
                console.log('[Dev] Lead Analysis:', JSON.stringify(analysis, null, 2));

                // Update Lead with Insights
                if (analysis.score > 0) {
                    await prisma.lead.update({
                        where: { id: id }, // Use 'id' which is already parsed
                        data: {
                            intent: analysis.intent,
                            budget: analysis.extracted_data.budget || undefined,
                            desired_city: analysis.extracted_data.location || undefined,
                            score: analysis.score,
                            status: analysis.extracted_data.suggested_status as any || undefined,
                            // Profile updates (only if found)
                            ...(analysis.extracted_data.name ? { name: analysis.extracted_data.name } : {}),
                            ...(analysis.extracted_data.email ? { email: analysis.extracted_data.email } : {}),
                            // We probably shouldn't auto-update PHONE unless we are sure, to avoid losing the WhatsApp ID.
                            // But user asked for it. Let's do it carefully? 
                            // Actually, mostly they provide email/name. Phone is the key for WhatsApp.
                            // Let's stick to Name/Email/Status for now.
                        }
                    });
                }
            } catch (err) {
                console.error('[Dev] Auto-qualification failed:', err);
            }

            return res.json({ success: true, message: savedMessage, ai_response: aiResponse });
        }

        res.json({ success: true, message: savedMessage });
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

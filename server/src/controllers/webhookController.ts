import { Request, Response } from 'express';
import { AIService } from '../services/aiService';
import { AutomationService } from '../services/automationService';
import { Lead } from '../models/types';
import { prisma } from '../lib/prisma'; // Real DB connection

export const handleWebhook = async (req: Request, res: Response) => {
    const { channel, userId } = req.params;
    const body = req.body;

    console.log(`[Webhook] Received from ${channel} for User ${userId}`, JSON.stringify(body, null, 2));

    try {
        let leadData: { phone?: string; email?: string; name?: string; status?: string } = {};
        let message = '';
        let source: any = 'manual';
        let eventType = null; // for calendar

        // 1. Normalize Payload
        switch (channel) {
            case 'whatsapp':
                // Simulated WhatsApp payload structure
                source = 'whatsapp';
                message = body.text?.body || body.message || 'Image Attachment';
                leadData = {
                    phone: body.from || body.phone,
                    name: body.profile?.name || 'Unknown WhatsApp User'
                };
                break;
            case 'meta':
                // Simulated Meta payload (IG/FB)
                source = body.object === 'instagram' ? 'instagram' : 'facebook';
                message = body.entry?.[0]?.messaging?.[0]?.message?.text || 'Interaction';
                leadData = {
                    name: body.entry?.[0]?.messaging?.[0]?.sender?.id || 'Social User'
                };
                break;
            case 'tiktok':
                source = 'tiktok';
                message = body.message || 'TikTok Interaction';
                leadData = { name: body.user_id || 'TikTok User' };
                break;
            case 'youtube':
                source = 'youtube';
                message = body.comment || 'New Comment';
                leadData = { name: body.author || 'YouTube User' };
                break;
            case 'calendar':
                // Calendar usually doesn't create leads, but updates them
                // For simplified flow, we'll treat it as a source
                source = 'manual'; // or calendar-specific
                message = `Appointment: ${body.event_type} - ${body.status}`;
                leadData = { email: body.invitee_email, name: body.invitee_name, status: 'appointment_set' };
                eventType = body.status; // created, completed
                break;
            case 'automation':
                source = 'manual'; // Zapier/Make usually pipes in lead data
                message = body.message || 'Automation Inquiry';
                leadData = { ...body }; // Assume clean payload mapping
                break;
            default:
                message = 'Unknown Webhook';
        }

        const brokerId = parseInt(userId);
        if (isNaN(brokerId)) {
            return res.status(400).json({ error: 'Invalid User ID' });
        }

        // 2. Find or Create Lead (Real Logic)
        // Try precise match first
        let lead = null;
        if (leadData.phone) {
            lead = await prisma.lead.findUnique({ where: { phone: leadData.phone } });
        }

        let isNewLead = false;

        if (!lead) {
            isNewLead = true;
            // Create New Lead
            lead = await prisma.lead.create({
                data: {
                    brokerId: brokerId,
                    name: leadData.name || `New ${channel} Lead`,
                    phone: leadData.phone || `unknown-${Date.now()}`, // Fallback if no phone (will fail unique constraint if strictly required)
                    email: leadData.email,
                    source: source,
                    status: leadData.status || 'new',
                }
            });
            console.log('[Webhook] Created New Lead DB ID:', lead.id);
        } else {
            console.log('[Webhook] Found Existing Lead DB ID:', lead.id);
            // Optional: Update status if provided
            if (leadData.status) {
                lead = await prisma.lead.update({
                    where: { id: lead.id },
                    data: { status: leadData.status }
                });
            }
        }

        // 3. Automation Triggers
        if (isNewLead) {
            // Mapping prisma lead to internal type if needed, but for now passing as is if compatible
            // await AutomationService.triggerWelcomeFlow(lead as any);
        }

        if (channel === 'calendar' && eventType) {
            // await AutomationService.triggerCalendarFlow(lead as any, eventType, new Date(body.event_start_time || Date.now()));
        }

        // 4. Log Message to DB
        if (message) {
            await prisma.leadMessage.create({
                data: {
                    leadId: lead.id,
                    role: 'user', // From lead
                    sender: 'lead',
                    direction: 'inbound',
                    content: message,
                    channel: channel,
                    timestamp: new Date()
                }
            });
            console.log('[Webhook] Persisted Inbound Message:', message);
        }

        // 5. Trigger AI Qualification & Persist Response
        if (message && channel !== 'calendar') {

            // Fetch Conversation History
            const historyMessages = await prisma.leadMessage.findMany({
                where: { leadId: lead.id },
                orderBy: { timestamp: 'desc' },
                take: 10
            });

            // Format history (reverse to chronological)
            const history = historyMessages.reverse().map(m =>
                `${m.role === 'assistant' ? 'AI' : 'User'}: ${m.content}`
            ).join('\n');

            const aiResponse = await AIService.generateResponse(lead as any, message, history);

            // Persist AI Response
            await prisma.leadMessage.create({
                data: {
                    leadId: lead.id,
                    role: 'assistant',
                    sender: 'ai',
                    direction: 'outbound',
                    content: aiResponse,
                    channel: channel,
                    timestamp: new Date()
                }
            });
            console.log('[Webhook] AI Response Persisted:', aiResponse);

            // TODO: Actually send outbound via channel API (WhatsApp/Meta) here.
        }

        res.status(200).json({ success: true, lead_id: lead.id });

    } catch (error) {
        console.error('[Webhook] Error processing:', error);
        res.status(500).json({ error: 'Webhook processing failed', details: error });
    }
};

export const saveIntegrationConfig = async (req: Request, res: Response) => {
    // Placeholder
    res.json({ success: true });
};

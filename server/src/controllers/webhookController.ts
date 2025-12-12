import { Request, Response } from 'express';
import { AIService } from '../services/aiService';
import { AutomationService } from '../services/automationService';
import { Lead } from '../models/types';

// In-memory mocks for simulation
const leads: Lead[] = [];

export const handleWebhook = async (req: Request, res: Response) => {
    const { channel, userId } = req.params;
    const body = req.body;

    console.log(`[Webhook] Received from ${channel} for User ${userId}`, JSON.stringify(body, null, 2));

    try {
        let leadData: Partial<Lead> = {};
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

        // 2. Find or Create Lead (Mock Logic)
        // In real app: findByPhone or findByEmail
        let lead = leads.find(l =>
            (leadData.phone && l.phone === leadData.phone) ||
            (leadData.email && l.email === leadData.email)
        );

        let isNewLead = false;

        if (!lead) {
            isNewLead = true;
            lead = {
                id: Math.random().toString(36).substr(2, 9),
                user_id: userId,
                name: leadData.name || 'New Lead',
                phone: leadData.phone || '',
                email: leadData.email,
                source: source,
                status: 'new',
                qualification_score: 0,
                tags: [],
                conversation_history: [],
                created_at: new Date()
            };
            leads.push(lead);
            console.log('[Webhook] Created New Lead:', lead.id);
        } else {
            console.log('[Webhook] Found Existing Lead:', lead.id);
            // Update logic if needed (e.g. status change)
            if (leadData.status) lead.status = leadData.status as any;
        }

        // 3. Automation Triggers
        if (isNewLead) {
            await AutomationService.triggerWelcomeFlow(lead);
        }

        if (channel === 'calendar' && eventType) {
            await AutomationService.triggerCalendarFlow(lead, eventType, new Date(body.event_start_time || Date.now()));
        }


        // 4. Log Message
        // (Mock: would insert into MessageLog table)
        console.log('[Webhook] Logged Message:', message);

        // 5. Trigger AI Qualification
        if (message && channel !== 'calendar') {
            const aiResult = await AIService.qualifyLead(message);

            // Update Lead with AI results
            lead.qualification_score = aiResult.score;
            if (aiResult.intent) lead.intent = aiResult.intent;
            if (aiResult.recommended_action) lead.recommended_action = aiResult.recommended_action;
            if (aiResult.ai_summary) lead.ai_summary = aiResult.ai_summary;
            if (aiResult.extracted_data.budget) lead.budget = aiResult.extracted_data.budget;

            console.log('[Webhook] AI Qualified Lead:', aiResult);
        }

        res.status(200).json({ success: true, lead_id: lead.id });

    } catch (error) {
        console.error('[Webhook] Error processing:', error);
        res.status(500).json({ error: 'Webhook processing failed' });
    }
};

export const saveIntegrationConfig = async (req: Request, res: Response) => {
    // Placeholder
    res.json({ success: true });
};

import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { AIService } from '../services/aiService';
import { AutomationService } from '../services/automationService';

// Get Settings (Private - for Dashboard)
export const getFunnelSettings = async (req: Request, res: Response) => {
    // req.user is set by middleware, but user might be requesting for a specific userId if admin?
    // Assuming for now the route uses :userId param for multi-talent context or own profile
    const userId = parseInt(req.params.userId);

    try {
        const landing = await prisma.landingPage.findUnique({
            where: { userId }
        });

        if (!landing) {
            // Return defaults if not created yet
            return res.json({
                hero_headline: "Compra tu casa soñada en Florida",
                hero_subheadline: "Asesoría experta para compradores internacionales.",
                vsl_url: "",
                cta_text: "Agendar Sesión",
                primary_color: "#0A84FF",
                calendly_url: "",
                show_reviews: false
            });
        }
        res.json(landing);
    } catch (error) {
        console.error('Error fetching funnel settings:', error);
        res.status(500).json({ error: 'Failed' });
    }
};

// Update Settings (Private - for Dashboard)
export const updateFunnelSettings = async (req: Request, res: Response) => {
    const userId = parseInt(req.params.userId);
    const data = req.body;

    try {
        const landing = await prisma.landingPage.upsert({
            where: { userId },
            update: {
                hero_headline: data.hero_headline,
                hero_subheadline: data.hero_subheadline,
                vsl_url: data.vsl_url,
                cta_text: data.cta_text,
                primary_color: data.primary_color,
                calendly_url: data.calendly_url,
                show_reviews: data.show_reviews
            },
            create: {
                userId,
                hero_headline: data.hero_headline,
                hero_subheadline: data.hero_subheadline,
                vsl_url: data.vsl_url,
                cta_text: data.cta_text,
                primary_color: data.primary_color,
                calendly_url: data.calendly_url,
                show_reviews: data.show_reviews
            }
        });
        res.json(landing);
    } catch (error) {
        console.error('Error saving funnel settings:', error);
        res.status(500).json({ error: 'Failed to save' });
    }
};

// Public Funnel Page Data
export const getPublicFunnel = async (req: Request, res: Response) => {
    const { slug } = req.params;

    try {
        const user = await prisma.user.findUnique({
            where: { slug },
            include: { landingPage: true }
        });

        if (!user) {
            return res.status(404).json({ error: 'Realtor not found' });
        }

        // Combine structure
        const responseData = {
            realtor: {
                name: user.name,
                email: user.email,
                photo_url: user.photo_url,
                phone: user.phone,
                city: user.city,
                state: user.state,
                // VSL Funnel Fields
                display_name: user.display_name,
                region: user.region,
                calendly_link: user.calendly_link // Fallback if landing page specific is empty
            },
            page: user.landingPage || {
                hero_headline: "Compra tu casa soñada en Florida",
                hero_subheadline: "Asesoría experta para compradores internacionales.",
                cta_text: "Agendar Sesión",
                primary_color: "#0A84FF"
            }
        };

        res.json(responseData);

    } catch (error) {
        console.error('Error fetching public funnel:', error);
        res.status(500).json({ error: 'System Error' });
    }
};

// Submit Form on Public Page
export const submitFunnelForm = async (req: Request, res: Response) => {
    const { slug } = req.params;
    const formData = req.body;

    try {
        const user = await prisma.user.findUnique({
            where: { slug },
            include: { landingPage: true }
        });
        if (!user) return res.status(404).json({ error: 'Realtor not found' });

        const redirectUrl = user.landingPage?.calendly_url || user.calendly_link || '#';

        // 1. Create Lead
        const lead = await prisma.lead.create({
            data: {
                brokerId: user.id,
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                status: 'new',
                source: 'funnel_landing',
                language: 'es', // TODO: Detect or pass from frontend param
                budget: formData.budget,
                desired_city: formData.city,
                timeline: formData.timeline,
                notes: `Concern: ${formData.concern}. Pre-approved: ${formData.preapproved}`
            }
        });

        // 2. AI Qualification & Notifications
        const summaryMsg = `Formulario Web\nNome: ${formData.name}\nCidade: ${formData.city}\nOrçamento: ${formData.budget}\nTimeline: ${formData.timeline}\nPre-aprovado: ${formData.preapproved}\nDúvida: ${formData.concern}`;

        // Async processing (don't block response) (Ideal world)
        // But for MVP we run it here
        try {
            const aiResult = await AIService.qualifyLead(summaryMsg);

            await prisma.lead.update({
                where: { id: lead.id },
                data: {
                    score: aiResult.score,
                    intent: aiResult.intent,
                    // recommended_action: aiResult.recommended_action, // Field missing in schema or mapped differently? Update schema later if needed.
                    ai_summary: aiResult.ai_summary
                }
            });

            // Trigger Automations
            await AutomationService.triggerWelcomeFlow(lead as any);
        } catch (e) {
            console.error('AI step failed:', e);
        }

        res.json({ success: true, leadId: lead.id, redirectUrl });

    } catch (error) {
        console.error('Funnel error:', error);
        res.status(500).json({ error: 'Processing failed' });
    }
};


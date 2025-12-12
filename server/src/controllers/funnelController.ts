import { Request, Response } from 'express';
import { FunnelSettings, Lead } from '../models/types';
import { AIService } from '../services/aiService';
import { AutomationService } from '../services/automationService';

// Mock DB
let funnelSettingsStore: FunnelSettings[] = [
    {
        id: '1',
        user_id: 'user_123',
        hero_title: 'Compra inteligente de casa en Florida, con ayuda de un Realtor experto.',
        hero_subtitle: 'Te ayudamos a encontrar la casa ideal, entender el financiamiento y evitar errores caros al comprar en Estados Unidos.',
        target_area: 'Ocala, Orlando, Tampa',
        primary_language: 'es',
        realtor_headline: 'Soy Patricia, Realtor en Florida especializada en ayudar familias latinas.',
        realtor_bio_short: 'Más de 10 años de experiencia ayudando a primeros compradores a lograr el sueño americano.',
        profile_photo_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200&h=200',
        brand_color: '#0A84FF',
        calendly_url: 'https://calendly.com/',
        funnel_slug: 'patricia-chahin',
        show_testimonials: false,
        created_at: new Date()
    }
];

// Mock Leads
const leads: Lead[] = [];

export const getFunnelSettings = async (req: Request, res: Response) => {
    const { userId } = req.params;
    const settings = funnelSettingsStore.find(s => s.user_id === userId);

    if (!settings) {
        // Return default if not exists
        return res.json({
            user_id: userId,
            hero_title: 'Compra inteligente de casa en Florida',
            hero_subtitle: 'Asesoría experta para compradores internacionales y locales.',
            target_area: 'Florida',
            primary_language: 'es',
            realtor_headline: 'Tu aliado inmobiliario',
            realtor_bio_short: 'Experto en bienes raíces.',
            brand_color: '#000000',
            funnel_slug: `realtor-${userId.substr(0, 5)}`,
            calendly_url: '',
            show_testimonials: false
        });
    }

    res.json(settings);
};

export const updateFunnelSettings = async (req: Request, res: Response) => {
    const { userId } = req.params;
    const updates = req.body;

    let settings = funnelSettingsStore.find(s => s.user_id === userId);

    if (settings) {
        Object.assign(settings, updates);
    } else {
        settings = {
            id: Math.random().toString(36).substr(2, 9),
            user_id: userId,
            created_at: new Date(),
            ...updates
        };
        funnelSettingsStore.push(settings!);
    }

    res.json(settings);
};

export const getPublicFunnel = async (req: Request, res: Response) => {
    const { slug } = req.params;
    const settings = funnelSettingsStore.find(s => s.funnel_slug === slug);

    if (!settings) {
        return res.status(404).json({ error: 'Funnel not found' });
    }

    res.json(settings);
};

export const submitFunnelForm = async (req: Request, res: Response) => {
    const { slug } = req.params;
    const formData = req.body;

    console.log(`[Funnel] Submission for ${slug}:`, formData);

    const settings = funnelSettingsStore.find(s => s.funnel_slug === slug);
    if (!settings) {
        return res.status(404).json({ error: 'Realtor not found' });
    }

    try {
        // 1. Create Lead
        const lead: Lead = {
            id: Math.random().toString(36).substr(2, 9),
            user_id: settings.user_id,
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            source: 'funnel_landing',
            status: 'new',
            language: settings.primary_language as 'en' | 'es' | 'pt' || 'es',
            tags: ['funnel_form'],
            qualification_score: 0,
            conversation_history: [],
            extracted_data: {
                budget: formData.budget,
                timeline: formData.timeline
            },
            created_at: new Date()
        };

        // 2. Log Message (Form Summary)
        const summaryMsg = `Formulario Web\nCiudad: ${formData.city}\nPresupuesto: ${formData.budget}\nTiempo: ${formData.timeline}\nPre-aprobado: ${formData.preapproved}\nDuda: ${formData.concern}`;
        console.log(`[Funnel] New Lead Created: ${lead.id}`);

        // 3. AI Qualification
        const aiResult = await AIService.qualifyLead(summaryMsg);
        lead.qualification_score = aiResult.score;
        lead.intent = aiResult.intent;
        lead.recommended_action = aiResult.recommended_action;
        lead.ai_summary = aiResult.ai_summary;

        // 4. Trigger Automation (Welcome Flow)
        await AutomationService.triggerWelcomeFlow(lead);

        res.json({ success: true, redirect: `/f/${slug}/thank-you` });

    } catch (error) {
        console.error('Funnel error:', error);
        res.status(500).json({ error: 'Processing failed' });
    }
};

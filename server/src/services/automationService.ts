import { AutomationJob, AutomationSettings, Lead, MessageLog } from '../models/types';
import { GeminiService } from './geminiService';

// In-memory queues and settings for simulation
const automationQueue: AutomationJob[] = [];
let automationSettings: AutomationSettings = {
    id: 'default_settings',
    user_id: 'user_123',
    welcome_enabled: true,
    pre_call_enabled: true,
    reminder_enabled: true,
    post_call_enabled: true,
    reactivation_enabled: true,
    welcome_delay_minutes: 0,
    reminder_before_minutes: 60,
    reactivation_days: 3,
    created_at: new Date()
};

// Message Templates Registry
const templates = {
    en: {
        welcome: "Hi {name}, I'm the virtual assistant. Thanks for reaching out. What type of property are you looking for?",
        pre_call: "Hi, your session is scheduled. Do you have any specific questions to prepare for the meeting?",
        reminder: "Reminder: Your session is today at {time}.",
        post_call: "How was the session? Let me know if you want to review next steps.",
        reactivation: "Hi, are you still interested in buying a home in your area of interest?"
    },
    es: {
        welcome: "Hola {name}, soy el asistente virtual. Gracias por escribir. ¿Qué tipo de propiedad buscas?",
        pre_call: "Hola, tu sesión está agendada. ¿Tienes alguna duda específica para preparar la reunión?",
        reminder: "Recordatorio: Tu sesión es hoy a las {time}.",
        post_call: "¿Qué te pareció la sesión? Avísame si quieres revisar siguientes pasos.",
        reactivation: "Hola, ¿sigues interesado en comprar casa en tu zona de interés?"
    },
    pt: {
        welcome: "Olá {name}, sou o assistente virtual. Obrigado pelo contato. Que tipo de imóvel você procura?",
        pre_call: "Olá, sua sessão está agendada. Você tem alguma dúvida específica para preparar a reunião?",
        reminder: "Lembrete: Sua sessão é hoje às {time}.",
        post_call: "O que achou da sessão? Me avise se quiser revisar os próximos passos.",
        reactivation: "Olá, você ainda tem interesse em comprar um imóvel na sua área de interesse?"
    }
};

export class AutomationService {

    // --- Configuration ---
    static async getSettings(userId: string): Promise<AutomationSettings> {
        return automationSettings;
    }

    static async updateSettings(userId: string, settings: Partial<AutomationSettings>): Promise<AutomationSettings> {
        automationSettings = { ...automationSettings, ...settings };
        return automationSettings;
    }

    // --- Scheduling ---
    static async scheduleJob(job: Omit<AutomationJob, 'id' | 'status'>) {
        const newJob: AutomationJob = {
            id: Math.random().toString(36).substr(2, 9),
            status: 'pending',
            ...job
        };
        automationQueue.push(newJob);
        console.log(`[Automation] Scheduled job: ${newJob.type} for Lead ${newJob.lead_id} at ${newJob.scheduled_for}`);
    }

    // --- triggers ---
    static async triggerWelcomeFlow(lead: Lead) {
        const settings = await this.getSettings(lead.user_id);
        if (!settings.welcome_enabled) return;

        const scheduledTime = new Date(Date.now() + settings.welcome_delay_minutes * 60000);

        await this.scheduleJob({
            user_id: lead.user_id,
            lead_id: lead.id,
            type: 'welcome',
            scheduled_for: scheduledTime,
            language: lead.language,
            payload: { name: lead.name }
        });
    }

    static async triggerCalendarFlow(lead: Lead, eventStatus: string, eventDate: Date) {
        const settings = await this.getSettings(lead.user_id);

        // Pre-Call
        if (eventStatus === 'created' && settings.pre_call_enabled) {
            await this.scheduleJob({
                user_id: lead.user_id,
                lead_id: lead.id,
                type: 'pre_call',
                scheduled_for: new Date(), // Send immediately upon booking
                language: lead.language,
                payload: { meeting_time: eventDate }
            });
        }

        // Reminder
        if (eventStatus === 'created' && settings.reminder_enabled) {
            const reminderTime = new Date(eventDate.getTime() - settings.reminder_before_minutes * 60000);
            if (reminderTime > new Date()) {
                await this.scheduleJob({
                    user_id: lead.user_id,
                    lead_id: lead.id,
                    type: 'reminder',
                    scheduled_for: reminderTime,
                    language: lead.language,
                    payload: { meeting_time: eventDate }
                });
            }
        }

        // Post-Call
        if (eventStatus === 'completed' && settings.post_call_enabled) {
            const followUpTime = new Date(Date.now() + 60 * 60000); // 1 hour after completion
            await this.scheduleJob({
                user_id: lead.user_id,
                lead_id: lead.id,
                type: 'post_call',
                scheduled_for: followUpTime,
                language: lead.language
            });
        }
    }

    // --- Execution ---
    // Simulate cron job running every minute
    static async runScheduler() {
        const now = new Date();
        const pendingJobs = automationQueue.filter(j => j.status === 'pending' && new Date(j.scheduled_for) <= now);

        for (const job of pendingJobs) {
            await this.executeJob(job);
        }
    }

    private static async executeJob(job: AutomationJob) {
        console.log(`[Automation] Executing job: ${job.type} for Lead ${job.lead_id}`);

        let messageText = '';
        const lang = job.language || 'en';
        const t = templates[lang] || templates['en'];
        let prompt = '';

        // 1. Construct Prompt based on Job Type
        switch (job.type) {
            case 'welcome':
                prompt = `Write a warm, concise welcome message for a real estate lead named ${job.payload?.name || 'there'}. Language: ${lang}. Ask what they are looking for. Max 200 chars.`;
                break;
            case 'pre_call':
                prompt = `Write a message confirming a meeting. Language: ${lang}. Ask if they have specific questions. Max 200 chars.`;
                break;
            case 'reminder':
                prompt = `Write a friendly reminder for a meeting at ${new Date(job.payload?.meeting_time).toLocaleTimeString()}. Language: ${lang}. Max 160 chars.`;
                break;
            case 'post_call':
                prompt = `Write a follow-up message after a meeting. Language: ${lang}. Ask how it went and if they want next steps. Max 200 chars.`;
                break;
            case 'reactivation':
                prompt = `Write a re-engagement message for a cold lead. Language: ${lang}. Ask if they are still interested in buying a home. Max 200 chars.`;
                break;
        }

        try {
            // 2. Generate with Gemini
            if (prompt) {
                // Use Flash for speed/cost
                messageText = await GeminiService.runGemini(prompt, 'gemini-2.0-flash');
            } else {
                throw new Error('No prompt defined');
            }
        } catch (error) {
            console.error(`[Automation] AI Failed, using template fallback: ${error}`);
            // 3. Fallback to Templates
            switch (job.type) {
                case 'welcome':
                    messageText = t.welcome.replace('{name}', job.payload?.name || 'Customer');
                    break;
                case 'pre_call':
                    messageText = t.pre_call;
                    break;
                case 'reminder':
                    messageText = t.reminder.replace('{time}', new Date(job.payload?.meeting_time).toLocaleTimeString());
                    break;
                case 'post_call':
                    messageText = t.post_call;
                    break;
                case 'reactivation':
                    messageText = t.reactivation;
                    break;
            }
        }

        // Simulate Sending
        console.log(`[Message Sent] To Lead ${job.lead_id} (${lang}): "${messageText}"`);

        // Update Job Status
        job.status = 'executed';
    }
}

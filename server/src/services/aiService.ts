import { AnalysisResult, Lead } from '../models/types';
import { GeminiService } from './geminiService';
import { AISettingsService } from './aiSettingsService';

export class AIService {

    static detectLanguage(message: string): 'en' | 'es' | 'pt' {
        const lower = message.toLowerCase();
        if (lower.includes('hola') || lower.includes('gracias') || lower.includes('información')) return 'es';
        if (lower.includes('oi') || lower.includes('obrigado') || lower.includes('interesse')) return 'pt';
        return 'en';
    }

    static async qualifyLead(message: string): Promise<AnalysisResult> {
        const prompt = `
Analyze the real estate lead message below. Return STRICT JSON only.

Message: "${message}"

Return:
{
  "intent": "Buying Interest | Rental Inquiry | Pricing Question | Low Intent | Highly Motivated",
  "property_type": "House | Condo | Land | Unknown",
  "location_preference": "City/Area or Unknown",
  "budget": "Value or Unknown",
  "timeline": "ASAP | This Month | This Year | Unknown",
  "financing": "Cash | Mortgage | Unknown",
  "urgency": "High | Medium | Low",
  "notes": "Short realtor-friendly summary"
}
`;
        try {
            // Use Pro model for qualification
            const settings = await AISettingsService.getSettings();
            const raw = await GeminiService.runGemini(prompt, settings.strong_model);

            // Clean markdown json fences if present
            const cleanJson = raw.replace(/```json/g, '').replace(/```/g, '').trim();
            const data = JSON.parse(cleanJson);

            // Map to AnalysisResult interface
            return {
                intent: data.intent || 'General Inquiry',
                extracted_data: {
                    budget: data.budget,
                    timeline: data.timeline,
                    property_type: data.property_type,
                    location: data.location_preference,
                    financing: data.financing,
                    urgency_level: (data.urgency || 'medium').toLowerCase()
                },
                score: data.urgency === 'High' ? 85 : data.urgency === 'Medium' ? 50 : 20,
                recommended_action: data.urgency === 'High' ? 'Call Immediately' : 'Follow up',
                ai_summary: data.notes || raw
            };

        } catch (error) {
            console.error('Qualification failed', error);
            // Fallback to basic
            return {
                intent: 'Error Processing',
                extracted_data: {
                    budget: null,
                    timeline: null,
                    property_type: null,
                    location: null,
                    financing: null,
                    urgency_level: 'low'
                },
                score: 0,
                recommended_action: 'Manual Review',
                ai_summary: 'AI failed to process message.'
            };
        }
    }

    static async generateResponse(lead: any, message: string): Promise<string> {
        const language = this.detectLanguage(message);

        const settings = await AISettingsService.getSettings();

        // If user has a custom system prompt, we trust it and send a simpler user message
        // The GeminiService will attach the system prompt automatically
        if (settings.system_prompt && settings.system_prompt.trim().length > 10) {
            const prompt = `Lead message: "${message}"\nLead known data: ${JSON.stringify(lead)}`;
            return await GeminiService.runGemini(prompt);
        }

        const prompt = `
You are FlowRealtors AI. 
Write a helpful message for a homebuyer.

Lead message: "${message}"
Lead language: ${language}
Lead known data: ${JSON.stringify(lead)}

Focus on:
- Acknowledge interest
- Ask only relevant questions
- Keep message short (under 200 chars)
- Do NOT repeat information already provided
- Always write in ${language}
`;

        try {
            return await GeminiService.runGemini(prompt);
        } catch (error) {
            // Fallbacks
            if (language === 'es') return "Gracias por tu mensaje, te responderé enseguida.";
            if (language === 'pt') return "Obrigado pela mensagem, já te respondo.";
            return "Thank you for your message, I'll reply shortly.";
        }
    }

    static async translate(text: string, targetLang: string): Promise<string> {
        const prompt = `Translate this accurately to ${targetLang}: ${text}`;
        try {
            return await GeminiService.runGemini(prompt, 'gemini-2.0-flash');
        } catch {
            return text; // Fallback to original
        }
    }
}

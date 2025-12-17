import { AnalysisResult, Lead } from '../models/types';
import { GeminiService } from './geminiService';
import { AISettingsService } from './aiSettingsService';

export class AIService {

    static detectLanguage(message: string, lead?: any): 'en' | 'es' | 'pt' {
        // 1. Strong signal: Phone Country Code
        if (lead && lead.phone) {
            if (lead.phone.startsWith('55') || lead.phone.startsWith('+55')) return 'pt';
            if (lead.phone.startsWith('34') || lead.phone.startsWith('+34') || // Spain
                lead.phone.startsWith('52') || lead.phone.startsWith('+52') || // Mexico
                lead.phone.startsWith('54') || lead.phone.startsWith('+54') || // Argentina
                lead.phone.startsWith('56') || lead.phone.startsWith('+56') || // Chile
                lead.phone.startsWith('57') || lead.phone.startsWith('+57') || // Colombia
                lead.phone.startsWith('51') || lead.phone.startsWith('+51')    // Peru
            ) return 'es';
        }

        // 2. Keyword check
        const lower = message.toLowerCase();
        if (lower.includes('hola') || lower.includes('gracias') || lower.includes('información')) return 'es';
        if (lower.includes('oi') || lower.includes('obrigado') || lower.includes('interesse')) return 'pt';

        // 3. Fallback: if short, maybe auto-detect, but for now default 'en' OR 'pt' if we want to be Brazil-first
        if (lower === 'casa') return 'pt'; // Specific fix for ambiguous word "casa"

        return 'en';
    }

    static async qualifyLead(message: string, history: string = ''): Promise<AnalysisResult> {
        const prompt = `
Analyze the real estate lead conversation below. Return STRICT JSON only.

Conversation History:
${history}

New Message: "${message}"

Instructions:
1. Extract insights based on the FULL conversation history.
2. If the user provided their NAME, EMAIL or PHONE in the chat, extract it.
3. Update specific real estate fields.
   - If the user changes their mind (e.g. was Rent, now Buy), OVERWRITE the old value.
   - If checking history, prioritize the LATEST information.
4. Suggest a STATUS based on the conversation progress:
   - "New": Just started, no real info yet.
   - "In Qualification": User is answering questions.
   - "Qualified": User has provided Budget AND Location AND Timeline.
   - "Hot": User is very urgent or ready to buy/visit.
   - "Not Interested": User said stop or not interested.

Return:
{
  "extracted_contact": {
    "name": "Full Name or null",
    "email": "Email or null",
    "phone": "Phone or null"
  },
  "intent": "Buying Interest | Rental Inquiry | Pricing Question | Low Intent | Highly Motivated",
  "property_type": "House | Condo | Land | Unknown",
  "location_preference": "City/Area or Unknown",
  "budget": "Value or Unknown",
  "timeline": "ASAP | This Month | This Year | Unknown",
  "financing": "Cash | Mortgage | Unknown",
  "urgency": "High | Medium | Low",
  "notes": "Short realtor-friendly summary of LATEST needs"
}
`;
        try {
            // Use Pro model for qualification
            const settings = await AISettingsService.getSettings();
            const raw = await GeminiService.runGemini(prompt, settings.strong_model);

            // Clean markdown json fences if present
            const cleanJson = raw.replace(/```json/g, '').replace(/```/g, '').trim();
            const data = JSON.parse(cleanJson);

            // Calculate Score & Status
            let score = 20; // Default started
            if (data.location_preference !== 'Unknown' && data.location_preference !== 'City/Area or Unknown') score += 20;
            if (data.budget !== 'Unknown' && data.budget !== 'Value or Unknown') score += 20;
            if (data.timeline !== 'Unknown' && data.timeline !== 'ASAP | This Month | This Year | Unknown') score += 20;
            if (data.urgency === 'High') score += 20;
            if (data.intent?.includes('Buy') || data.intent?.includes('Motivated')) score += 10;
            if (score > 100) score = 100;

            let status = 'New';
            if (score > 30) status = 'In Qualification';
            if (score > 70) status = 'Qualified';
            if (score > 90) status = 'Hot';
            // Override if explicit negative
            if (data.intent?.includes('Low Intent')) status = 'New';

            return {
                intent: data.intent || 'General Inquiry',
                extracted_data: {
                    budget: data.budget,
                    timeline: data.timeline,
                    property_type: data.property_type,
                    location: data.location_preference,
                    financing: data.financing,
                    urgency_level: (data.urgency || 'medium').toLowerCase(),
                    name: data.extracted_contact?.name,
                    email: data.extracted_contact?.email,
                    phone: data.extracted_contact?.phone,
                    suggested_status: status
                },
                score: score,
                recommended_action: score > 80 ? 'Call Immediately' : 'Follow up',
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
                    urgency_level: 'low',
                    suggested_status: 'New'
                },
                score: 0,
                recommended_action: 'Manual Review',
                ai_summary: 'AI failed to process message.'
            };
        }
    }

    static async generateResponse(lead: any, message: string, history: string = ''): Promise<string> {
        const language = this.detectLanguage(message, lead);

        const settings = await AISettingsService.getSettings();

        // If user has a custom system prompt, we trust it and send a simpler user message
        // The GeminiService will attach the system prompt automatically
        if (settings.system_prompt && settings.system_prompt.trim().length > 10) {
            const prompt = `
Conversation History:
${history}

New Lead message: "${message}"
Lead known data: ${JSON.stringify(lead)}
`;
            return await GeminiService.runGemini(prompt);
        }

        const prompt = `
You are FlowRealtors AI. 
Write a helpful, short response for a homebuyer.

Conversation History:
${history}

Current Context:
New Lead message: "${message}"
Calculated Language: ${language} (You MUST write in this language)
Lead known data: ${JSON.stringify(lead)}

Instructions:
1. REVIEW the Conversation History.
2. If this is a continuing conversation, DO NOT greet again.
3. WE DO NOT HAVE A LIST OF PROPERTIES VISIBLE RIGHT NOW.
   - If user asks for listings, say "I will check what we have available that matches your criteria".
   - DO NOT invent specific property details unless they were already discussed.
4. GOAL: Get them to agree to a MEETING or CALL to discuss details.
   - "Shall we schedule a quick call to see the best options?"
   - "I can filter the best ones for you, are you free for a visit?"
5. Keep message short (under 200 chars).
6. CRITICAL: Write the response in ${language} language ONLY.
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

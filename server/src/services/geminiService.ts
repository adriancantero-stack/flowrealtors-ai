import { AISettingsService } from './aiSettingsService';

interface GeminiRequest {
    system_instruction?: { parts: { text: string }[] };
    contents: { role?: string; parts: { text: string }[] }[];
    generationConfig: {
        temperature: number;
        maxOutputTokens: number;
    };
}

export class GeminiService {
    static async runGemini(prompt: string, modelOverride?: string, temperatureOverride?: number): Promise<string> {
        const settings = await AISettingsService.getSettings();

        if (!settings.api_key) {
            console.warn('Gemini API Key missing');
            return "AI Error: API Key not configured.";
        }

        const model = modelOverride || settings.default_model;
        const temperature = temperatureOverride !== undefined ? temperatureOverride : settings.temperature;

        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${settings.api_key}`;

        const payload: GeminiRequest = {
            contents: [
                { role: "user", parts: [{ text: prompt }] }
            ],
            generationConfig: {
                temperature: temperature,
                maxOutputTokens: settings.max_tokens
            }
        };

        if (settings.system_prompt) {
            payload.system_instruction = {
                parts: [{ text: settings.system_prompt }]
            };
        }

        try {
            const startTime = Date.now();
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            // Check for API errors
            if (data.error) {
                console.error('Gemini API Error Detail:', JSON.stringify(data.error, null, 2));
                return `AI Error: ${data.error.message}`;
            }

            // Extract content
            const candidate = data.candidates?.[0];
            const output = candidate?.content?.parts?.[0]?.text || "No response generated";
            const finishReason = candidate?.finishReason;

            // Log interaction
            await AISettingsService.logInteraction({
                model: model,
                prompt_preview: prompt.substring(0, 100) + '...',
                response_preview: output.substring(0, 100) + (finishReason ? ` [${finishReason}]` : '...'),
                cost_estimated: 0
            });

            return output;

        } catch (error: any) {
            console.error('Gemini API Error:', error);
            await AISettingsService.logInteraction({
                model: model,
                prompt_preview: prompt.substring(0, 50),
                response_preview: `ERROR: ${error.message}`,
                cost_estimated: 0
            });
            throw error;
        }
    }
}

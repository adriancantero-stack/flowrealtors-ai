import { AnalysisResult } from '../models/types';

export class AIService {
    static async qualifyLead(message: string): Promise<AnalysisResult> {
        console.log('AI analyzing:', message);
        const lowerMsg = message.toLowerCase();

        // 1. Intent Detection Rules
        let intent = 'General Inquiry';
        if (lowerMsg.includes('buy') || lowerMsg.includes('purchase') || lowerMsg.includes('looking for a house')) intent = 'Buying Interest';
        else if (lowerMsg.includes('price') || lowerMsg.includes('how much') || lowerMsg.includes('cost')) intent = 'Pricing Question';
        else if (lowerMsg.includes('rent') || lowerMsg.includes('lease')) intent = 'Rental Inquiry';
        else if (lowerMsg.includes('not sure') || lowerMsg.includes('just looking')) intent = 'Low Intent';
        else if (lowerMsg.includes('ready') || lowerMsg.includes('pre-approved') || lowerMsg.includes('urgent')) intent = 'Highly Motivated';

        // 2. Extraction Rules (Simple Regex/Keyword)
        const budgetMatch = lowerMsg.match(/\$?\d+(?:,\d{3})*(?:k|m)?/);
        const budget = budgetMatch ? budgetMatch[0] : null;

        let timeline = null;
        if (lowerMsg.includes('soon') || lowerMsg.includes('asap')) timeline = 'ASAP';
        else if (lowerMsg.includes('month')) timeline = 'Within a month';
        else if (lowerMsg.includes('year')) timeline = 'This year';

        let propertyType = null;
        if (lowerMsg.includes('condo') || lowerMsg.includes('apartment')) propertyType = 'Condo/Apartment';
        else if (lowerMsg.includes('house') || lowerMsg.includes('home')) propertyType = 'House';
        else if (lowerMsg.includes('land')) propertyType = 'Land';

        let urgencyLevel: 'low' | 'medium' | 'high' = 'medium';
        if (intent === 'Low Intent') urgencyLevel = 'low';
        if (intent === 'Highly Motivated' || timeline === 'ASAP') urgencyLevel = 'high';

        // 3. Scoring Logic
        let score = 20; // Base score
        if (timeline === 'ASAP' || timeline === 'Within a month') score += 20;
        if (budget) score += 20;
        if (propertyType) score += 15;
        if (lowerMsg.includes('?')) score += 10; // Asking questions
        if (intent === 'Highly Motivated') score += 15;
        if (intent === 'Low Intent') score -= 10;

        // Cap score
        score = Math.max(0, Math.min(100, score));

        // 4. Recommendation Logic
        let recommendedAction = 'Follow up in 24h';
        if (score > 80) recommendedAction = 'Mark as Hot Lead and request call booking';
        else if (score > 60) recommendedAction = 'Send additional info and ask for clarification';
        else if (score < 30) recommendedAction = 'Cold lead, low priority';
        if (intent === 'Pricing Question') recommendedAction = 'Send pricing brochure';

        // 5. Summary Generation (Placeholder)
        const summary = `Lead is showing ${intent}. Possible budget: ${budget || 'Unknown'}. Property type: ${propertyType || 'Unknown'}. Timeline: ${timeline || 'Unknown'}. Recommended action: ${recommendedAction}.`;

        return {
            intent,
            extracted_data: {
                budget,
                timeline,
                property_type: propertyType,
                location: null, // Harder to extract without NER
                financing: null,
                urgency_level: urgencyLevel
            },
            score,
            recommended_action: recommendedAction,
            ai_summary: summary
        };
    }

    static async generateResponse(context: string): Promise<string> {
        // Placeholder for future LLM integration
        return "This is an AI generated placeholder response based on context.";
    }

    // Future LLM Connector Placeholder
    static async runLLM(params: { prompt: string, temperature: number, model: string }) {
        console.log('Mock LLM Call:', params);
        return { text: "Simulated LLM response" };
    }
}

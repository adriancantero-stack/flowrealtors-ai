import { Request, Response } from 'express';
import { AIService } from '../services/aiService';
import { AISettingsService } from '../services/aiSettingsService';
import { GeminiService } from '../services/geminiService';

export const qualifyLead = async (req: Request, res: Response): Promise<void> => {
    try {
        const { lead_id, message, source } = req.body;

        if (!message) {
            res.status(400).json({ error: 'Message is required' });
            return;
        }

        const qualificationResult = await AIService.qualifyLead(message);

        // In a real implementation, we would update the Lead in the database here with the result.
        // For now, we return the analysis.

        res.status(200).json({
            lead_id,
            result: qualificationResult
        });

    } catch (error) {
        console.error('Error qualifying lead:', error);
        res.status(500).json({ error: 'Failed to qualify lead' });
    }
};

export const getGeminiSettings = async (req: Request, res: Response): Promise<void> => {
    try {
        const settings = await AISettingsService.getSettings();
        // Hide API key in response for security if needed, but for admin panel we often need it or a masked version.
        // Sending as is for now as per "Admin Panel" requirement.
        res.json(settings);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch settings' });
    }
};

export const updateGeminiSettings = async (req: Request, res: Response): Promise<void> => {
    try {
        const updated = await AISettingsService.updateSettings(req.body);
        res.json(updated);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update settings' });
    }
};

export const testGeminiConnection = async (req: Request, res: Response): Promise<void> => {
    try {
        const { prompt } = req.body;
        const response = await GeminiService.runGemini(prompt || "Hello from FlowRealtors!", req.body.model);
        res.json({ response });
    } catch (error: any) {
        res.status(500).json({ error: error.message || 'Gemini Test Failed' });
    }
};

export const getGeminiLogs = async (req: Request, res: Response): Promise<void> => {
    try {
        const logs = await AISettingsService.getLogs();
        res.json(logs);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch logs' });
    }
};

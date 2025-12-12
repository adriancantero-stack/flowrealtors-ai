import { PrismaClient } from '@prisma/client';
import { AISettings, AILog } from '../models/aiTypes';

const prisma = new PrismaClient();

export class AISettingsService {
    static async getSettings(): Promise<AISettings> {
        try {
            const settings = await prisma.aISettings.findFirst();
            if (settings) {
                return {
                    ...settings,
                    id: settings.id.toString(), // Convert Int to String to match interface
                    provider: 'gemini', // Hardcoded or add to schema if needed
                    created_at: new Date(), // Schema doesn't have it or not selected? Schema has updatedAt
                    updated_at: settings.updatedAt
                } as unknown as AISettings;
            }
            // Return default
            return {
                id: 'default',
                provider: 'gemini',
                api_key: '',
                default_model: 'gemini-flash-latest',
                strong_model: 'gemini-pro-latest',
                temperature: 0.7,
                max_tokens: 1000,
                system_prompt: "You are FlowRealtors AI...",
                created_at: new Date(),
                updated_at: new Date()
            };
        } catch (error) {
            return {
                id: 'default',
                provider: 'gemini',
                api_key: '',
                default_model: 'gemini-flash-latest',
                strong_model: 'gemini-pro-latest',
                temperature: 0.7,
                max_tokens: 1000,
                system_prompt: "",
                created_at: new Date(),
                updated_at: new Date()
            };
        }
    }

    static async updateSettings(newSettings: Partial<AISettings>): Promise<AISettings> {
        const existing = await prisma.aISettings.findFirst();

        let updated;
        if (existing) {
            updated = await prisma.aISettings.update({
                where: { id: existing.id },
                data: {
                    api_key: newSettings.api_key,
                    default_model: newSettings.default_model,
                    strong_model: newSettings.strong_model,
                    temperature: newSettings.temperature,
                    max_tokens: newSettings.max_tokens,
                    system_prompt: newSettings.system_prompt
                }
            });
        } else {
            updated = await prisma.aISettings.create({
                data: {
                    api_key: newSettings.api_key || '',
                    default_model: newSettings.default_model || 'gemini-flash-latest',
                    strong_model: newSettings.strong_model || 'gemini-pro-latest',
                    temperature: newSettings.temperature || 0.7,
                    max_tokens: newSettings.max_tokens || 1000,
                    system_prompt: newSettings.system_prompt || ''
                }
            });
        }

        return {
            ...updated,
            id: updated.id.toString(),
            provider: 'gemini',
            created_at: new Date(),
            updated_at: updated.updatedAt
        } as unknown as AISettings;
    }

    static async logInteraction(log: Omit<AILog, 'id' | 'created_at'>): Promise<void> {
        try {
            await prisma.aILog.create({
                data: {
                    model: log.model,
                    prompt_preview: log.prompt_preview,
                    response_preview: log.response_preview
                }
            });
        } catch (error) {
            console.error('Failed to log AI interaction:', error);
        }
    }

    static async getLogs(): Promise<AILog[]> {
        try {
            const logs = await prisma.aILog.findMany({
                orderBy: { createdAt: 'desc' },
                take: 100
            });
            return logs.map(l => ({
                id: l.id.toString(),
                model: l.model,
                prompt_preview: l.prompt_preview,
                response_preview: l.response_preview,
                created_at: l.createdAt
            }));
        } catch {
            return [];
        }
    }
}

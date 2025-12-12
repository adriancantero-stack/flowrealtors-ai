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
        await ensureDataDir();
        let logs: AILog[] = [];
        try {
            const data = await fs.readFile(LOGS_FILE, 'utf-8');
            logs = JSON.parse(data);
        } catch {
            logs = [];
        }

        const newLog: AILog = {
            ...log,
            id: Math.random().toString(36).substr(2, 9),
            created_at: new Date()
        };

        logs.unshift(newLog); // Prepend
        // Keep last 100 logs
        if (logs.length > 100) logs = logs.slice(0, 100);

        await fs.writeFile(LOGS_FILE, JSON.stringify(logs, null, 2));
    }

    static async getLogs(): Promise<AILog[]> {
        await ensureDataDir();
        try {
            const data = await fs.readFile(LOGS_FILE, 'utf-8');
            return JSON.parse(data);
        } catch {
            return [];
        }
    }
}

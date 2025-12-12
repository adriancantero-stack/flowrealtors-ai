import fs from 'fs/promises';
import path from 'path';
import { AISettings, AILog } from '../models/aiTypes';

const DATA_DIR = path.join(__dirname, '../data');
const SETTINGS_FILE = path.join(DATA_DIR, 'ai_settings.json');
const LOGS_FILE = path.join(DATA_DIR, 'ai_logs.json');

// Ensure data directory exists
async function ensureDataDir() {
    try {
        await fs.access(DATA_DIR);
    } catch {
        await fs.mkdir(DATA_DIR, { recursive: true });
    }
}

export class AISettingsService {
    static async getSettings(): Promise<AISettings> {
        await ensureDataDir();
        try {
            const data = await fs.readFile(SETTINGS_FILE, 'utf-8');
            const settings = JSON.parse(data);
            return settings[0];
        } catch (error) {
            // Return default structure if file missing
            return {
                id: 'default',
                provider: 'gemini',
                api_key: '',
                default_model: 'gemini-flash-latest',
                strong_model: 'gemini-pro-latest',
                temperature: 0.2,
                max_tokens: 600,
                system_prompt: "You are FlowRealtors AI...",
                created_at: new Date(),
                updated_at: new Date()
            };
        }
    }

    static async updateSettings(newSettings: Partial<AISettings>): Promise<AISettings> {
        await ensureDataDir();
        const current = await this.getSettings();
        const updated = {
            ...current,
            ...newSettings,
            updated_at: new Date()
        };

        await fs.writeFile(SETTINGS_FILE, JSON.stringify([updated], null, 2));
        return updated;
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

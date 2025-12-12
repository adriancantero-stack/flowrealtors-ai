import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface WhatsAppSettings {
    id?: number;
    provider: string;
    api_token: string;
    phone_number_id: string;
    business_account_id?: string | null;
    verify_token: string;
    webhook_url?: string;
    enabled: boolean;
}

export class WhatsAppService {
    static async getSettings(): Promise<WhatsAppSettings> {
        try {
            const settings = await prisma.whatsAppSettings.findFirst();
            if (settings) {
                return {
                    ...settings,
                    provider: settings.provider as 'cloud-api' | '360dialog'
                };
            }
            return {
                provider: 'cloud-api',
                api_token: '',
                phone_number_id: '',
                business_account_id: '',
                verify_token: 'flowrealtors_verify_token',
                webhook_url: '',
                enabled: false
            };
        } catch (error) {
            console.error('Error fetching WhatsApp settings:', error);
            return {
                provider: 'cloud-api',
                api_token: '',
                phone_number_id: '',
                business_account_id: '',
                verify_token: 'flowrealtors_verify_token',
                webhook_url: '',
                enabled: false
            };
        }
    }

    static async saveSettings(settings: WhatsAppSettings): Promise<void> {
        // Upsert logic: update if exists, create if not
        // Since we don't have a guaranteed singleton ID, used findFirst to check or just assume ID 1?
        // Better: findFirst, if exists use that ID.
        const existing = await prisma.whatsAppSettings.findFirst();

        if (existing) {
            await prisma.whatsAppSettings.update({
                where: { id: existing.id },
                data: {
                    provider: settings.provider,
                    api_token: settings.api_token,
                    phone_number_id: settings.phone_number_id,
                    business_account_id: settings.business_account_id || '',
                    verify_token: settings.verify_token,
                    enabled: settings.enabled
                }
            });
        } else {
            await prisma.whatsAppSettings.create({
                data: {
                    provider: settings.provider,
                    api_token: settings.api_token,
                    phone_number_id: settings.phone_number_id,
                    business_account_id: settings.business_account_id || '',
                    verify_token: settings.verify_token,
                    enabled: settings.enabled
                }
            });
        }
    }

    static async sendMessage(to: string, text: string): Promise<any> {
        const settings = await this.getSettings();
        if (!settings.enabled) throw new Error('WhatsApp is disabled');

        if (settings.provider === 'cloud-api') {
            return this.sendCloudApiMessage(settings, to, text);
        } else {
            return this.send360DialogMessage(settings, to, text);
        }
    }

    private static async sendCloudApiMessage(settings: WhatsAppSettings, to: string, text: string) {
        const url = `https://graph.facebook.com/v20.0/${settings.phone_number_id}/messages`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${settings.api_token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                messaging_product: 'whatsapp',
                to: to,
                type: 'text',
                text: { body: text }
            })
        });

        const data = await response.json();
        if (!response.ok) {
            console.error('WhatsApp Cloud API Error:', data);
            throw new Error(data.error?.message || 'Failed to send message via Cloud API');
        }
        return data;
    }

    private static async send360DialogMessage(settings: WhatsAppSettings, to: string, text: string) {
        const url = 'https://waba.360dialog.io/v1/messages';

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'D360-API-KEY': settings.api_token,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                to: to,
                type: 'text',
                text: { body: text }
            })
        });

        const data = await response.json();
        if (!response.ok) {
            console.error('360dialog Error:', data);
            throw new Error(data.meta?.developer_message || 'Failed to send message via 360dialog');
        }
        return data;
    }

    static verifyWebhook(mode: string | null, token: string | null, challenge: string | null, settings: WhatsAppSettings): string | null {
        if (mode === 'subscribe' && token === settings.verify_token) {
            return challenge;
        }
        return null;
    }
}

import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

const DATA_DIR = path.join(__dirname, '../data');

async function migrate() {
    console.log('Starting migration...');

    // 1. Migrate WhatsApp Settings
    try {
        const waPath = path.join(DATA_DIR, 'whatsappSettings.json');
        if (fs.existsSync(waPath)) {
            const waData = JSON.parse(fs.readFileSync(waPath, 'utf-8'));
            console.log('Migrating WhatsApp Settings...');
            await prisma.whatsAppSettings.create({
                data: {
                    provider: waData.provider || 'cloud-api',
                    api_token: waData.api_token || '',
                    phone_number_id: waData.phone_number_id || '',
                    business_account_id: waData.business_account_id || '',
                    verify_token: waData.verify_token || 'flowrealtors_verify_token',
                    enabled: waData.enabled || false,
                }
            });
            console.log('WhatsApp Settings migrated.');
        }
    } catch (e) {
        console.error('Error migrating WhatsApp settings:', e);
    }

    // 2. Migrate AI Settings
    try {
        const aiPath = path.join(DATA_DIR, 'ai_settings.json');
        if (fs.existsSync(aiPath)) {
            const aiData = JSON.parse(fs.readFileSync(aiPath, 'utf-8'));
            console.log('Migrating AI Settings...');
            await prisma.aISettings.create({
                data: {
                    api_key: aiData.api_key || '',
                    default_model: aiData.default_model || 'gemini-flash-latest',
                    strong_model: aiData.strong_model || 'gemini-pro-latest',
                    temperature: aiData.temperature || 0.7,
                    max_tokens: aiData.max_tokens || 1000,
                    system_prompt: aiData.system_prompt || '',
                }
            });
            console.log('AI Settings migrated.');
        }
    } catch (e) {
        console.error('Error migrating AI settings:', e);
    }

    // 3. Migrate Mock Leads (Since they were in-memory, we seed them)
    try {
        console.log('Seeding Mock Leads...');
        const mockLeads = [
            {
                name: 'John Doe',
                phone: '+15551234567',
                email: 'john@example.com',
                source: 'instagram',
                status: 'new',
                language: 'en',
                intent: 'buy',
            },
            {
                name: 'Jane Smith',
                phone: '+15559876543',
                status: 'qualified',
                source: 'whatsapp',
                language: 'en',
                intent: 'invest',
            }
        ];

        for (const lead of mockLeads) {
            await prisma.lead.upsert({
                where: { phone: lead.phone },
                update: {},
                create: lead
            });
        }
        console.log('Mock Leads seeded.');
    } catch (e) {
        console.error('Error seeding leads:', e);
    }

    console.log('Migration complete.');
    await prisma.$disconnect();
}

migrate();

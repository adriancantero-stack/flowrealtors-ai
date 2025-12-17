
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Fixing AI Model Settings...');

    const settings = await prisma.aISettings.findFirst();

    if (settings) {
        console.log('Found existing settings:', settings);
        const updated = await prisma.aISettings.update({
            where: { id: settings.id },
            data: {
                default_model: 'gemini-1.5-flash',
                strong_model: 'gemini-1.5-flash'
            }
        });
        console.log('Updated settings to gemini-1.5-flash:', updated);
    } else {
        console.log('No settings found. Creating new...');
        const newSettings = await prisma.aISettings.create({
            data: {
                api_key: process.env.GEMINI_API_KEY || '',
                default_model: 'gemini-1.5-flash',
                strong_model: 'gemini-1.5-flash',
                temperature: 0.7,
                max_tokens: 1000,
                system_prompt: 'You are FlowRealtors AI, a helpful real estate assistant.'
            }
        });
        console.log('Created settings:', newSettings);
    }
}

main()
    .catch((e) => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });

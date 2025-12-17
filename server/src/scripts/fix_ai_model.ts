
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Force Fixing AI Model Settings to gemini-2.0-flash-lite...');

    const settings = await prisma.aISettings.findFirst();

    if (settings) {
        console.log('Found existing settings:', settings);
        const updated = await prisma.aISettings.update({
            where: { id: settings.id },
            data: {
                default_model: 'gemini-2.0-flash-lite',
                strong_model: 'gemini-2.0-flash-lite'
            }
        });
        console.log('SUCCESS: Updated settings to gemini-2.0-flash-lite:', updated);
    } else {
        console.log('No settings found. Creating new...');
        const newSettings = await prisma.aISettings.create({
            data: {
                api_key: process.env.GEMINI_API_KEY || '',
                default_model: 'gemini-2.0-flash-lite',
                strong_model: 'gemini-2.0-flash-lite',
                temperature: 0.7,
                max_tokens: 1000,
                system_prompt: 'You are FlowRealtors AI, a helpful real estate assistant.'
            }
        });
        console.log('SUCCESS: Created settings:', newSettings);
    }
}

main()
    .catch((e) => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });

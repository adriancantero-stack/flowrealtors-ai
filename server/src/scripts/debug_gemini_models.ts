
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Fetching available Gemini models...');

    try {
        const settings = await prisma.aISettings.findFirst();
        if (!settings || !settings.api_key) {
            console.error('No API Key found in DB.');
            return;
        }

        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models?key=${settings.api_key}`;

        const response = await fetch(endpoint);
        const data = await response.json();

        if (data.error) {
            console.error('API Error:', JSON.stringify(data.error, null, 2));
        } else {
            console.log('Available Models:');
            if (data.models) {
                data.models.forEach((m: any) => {
                    console.log(`- ${m.name} (Supported: ${m.supportedGenerationMethods.join(', ')})`);
                });
            } else {
                console.log('No models list returned', data);
            }
        }

    } catch (error) {
        console.error('Script Error:', error);
    }
}

main()
    .catch((e) => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });


import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const CANDIDATE_MODELS = [
    'gemini-2.0-flash',        // Standard 2.0 Flash
    'gemini-2.0-flash-001',    // Versioned 2.0 Flash
    'gemini-flash-latest',     // Stable alias (usually 1.5 Flash)
    'gemini-2.5-flash',        // Newer Flash
    'gemini-pro-latest',       // Stable alias for Pro
    'gemini-1.5-pro-latest'
];

async function testModel(apiKey: string, model: string): Promise<boolean> {
    console.log(`Testing model: ${model}...`);
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ role: "user", parts: [{ text: "Hi" }] }]
            })
        });

        const data = await response.json();

        if (data.error) {
            console.log(`❌ ${model} Failed: ${data.error.message}`);
            return false;
        }

        if (data.candidates && data.candidates.length > 0) {
            console.log(`✅ ${model} SUCCEDED! Response: ${data.candidates[0].content.parts[0].text}`);
            return true;
        }

        return false;
    } catch (e: any) {
        console.log(`❌ ${model} Error: ${e.message}`);
        return false;
    }
}

async function main() {
    console.log('Searching for a working Gemini model...');

    const settings = await prisma.aISettings.findFirst();
    if (!settings || !settings.api_key) {
        console.error('No settings/API key found');
        return;
    }

    let winner = null;

    for (const model of CANDIDATE_MODELS) {
        const works = await testModel(settings.api_key, model);
        if (works) {
            winner = model;
            break;
        }
    }

    if (winner) {
        console.log(`\n🏆 WINNER FOUND: ${winner}`);
        console.log('Updating database...');

        await prisma.aISettings.update({
            where: { id: settings.id },
            data: {
                default_model: winner,
                strong_model: winner
            }
        });
        console.log('Database updated successfully!');
    } else {
        console.error('\n💀 ALL MODELS FAILED. The API Key might be practically exhausted or invalid for all efficient models.');
    }
}

main()
    .catch((e) => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });

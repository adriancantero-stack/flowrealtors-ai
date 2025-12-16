
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Starting data restoration...');

    // 1. Restore Admin
    const admin = await prisma.user.upsert({
        where: { email: 'admin@flowrealtors.com' },
        update: {
            password_hash: 'admin123',
            role: 'admin',
            slug: 'admin-user'
        },
        create: {
            name: 'Admin User',
            email: 'admin@flowrealtors.com',
            password_hash: 'admin123',
            role: 'admin',
            slug: 'admin-user',
            default_lang: 'pt'
        }
    });

    // 2. Restore Patricia
    const patricia = await prisma.user.upsert({
        where: { email: 'patricia@flowrealtors.com' },
        update: {
            password_hash: 'patricia123',
            role: 'broker',
            slug: 'patricia-corretora'
        },
        create: {
            name: 'Patricia Corretora',
            email: 'patricia@flowrealtors.com',
            password_hash: 'patricia123',
            role: 'broker',
            slug: 'patricia-corretora',
            default_lang: 'pt'
        }
    });

    // 3. Restore Adrian
    const adrian = await prisma.user.upsert({
        where: { email: 'adrian@flowrealtors.com' },
        update: {
            password_hash: 'adrian123',
            role: 'broker',
            slug: 'adrian-corretor'
        },
        create: {
            name: 'Adrian Corretor',
            email: 'adrian@flowrealtors.com',
            password_hash: 'adrian123',
            role: 'broker',
            slug: 'adrian-corretor',
            default_lang: 'es'
        }
    });
    console.log('Adrian restored:', adrian.email);

    // 4. Create Sample Leads for Patricia
    const lead1 = await prisma.lead.upsert({
        where: { phone: '5511999999991' },
        update: { brokerId: patricia.id },
        create: {
            name: 'Cliente Interessado 1',
            email: 'cliente1@example.com',
            phone: '5511999999991',
            status: 'new',
            language: 'pt',
            intent: 'buy',
            budget: '500k-1m',
            brokerId: patricia.id,
            notes: 'Interessado em apartamento na planta.'
        }
    });
    console.log('Lead 1 created for Patricia');

    // 5. Create Sample Leads for Adrian
    const lead2 = await prisma.lead.upsert({
        where: { phone: '5511999999992' },
        update: { brokerId: adrian.id },
        create: {
            name: 'Cliente Interessado 2',
            email: 'cliente2@example.com',
            phone: '5511999999992',
            status: 'qualified',
            language: 'es',
            intent: 'rent',
            budget: '2k-3k',
            brokerId: adrian.id,
            notes: 'Looking for a studio in downtown.'
        }
    });
    console.log('Lead 2 created for Adrian');

    console.log('Data restoration complete!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

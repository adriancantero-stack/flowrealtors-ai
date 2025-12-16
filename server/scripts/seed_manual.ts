
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting manual seed...');

    // 1. Find a Realtor User (ensure we have one)
    let realtor = await prisma.user.findFirst({
        where: { role: 'realtor' }
    });

    if (!realtor) {
        console.log('⚠️ No realtor found. Creating default "adrian-realtor"...');
        realtor = await prisma.user.create({
            data: {
                name: 'Adrian Realtor',
                email: 'adrian@flowrealtors.com',
                slug: 'adrian-realtor',
                password_hash: 'hashed_password_placeholder',
                role: 'realtor',
                status: 'active'
            }
        });
    }

    console.log(`✅ Found Realtor: ${realtor.name} (${realtor.email})`);

    // 2. Define Mock Leads
    const leads = [
        {
            name: 'Ana Silva',
            email: 'ana.silva@example.com',
            phone: '+55 11 99999-0001',
            status: 'New',
            source: 'Instagram',
            score: null,
            notes: 'Interagiu com post sobre Apartamento Jardins.',
            messages: [
                { role: 'user', content: 'Olá, gostaria de saber o valor do apê nos Jardins.' }
            ]
        },
        {
            name: 'Bruno Souza',
            email: 'bruno.souza@example.com',
            phone: '+55 11 99999-0002',
            status: 'In Qualification',
            source: 'WhatsApp',
            score: 45,
            notes: 'Respondeu algumas perguntas, mas parou.',
            messages: [
                { role: 'user', content: 'Oi, vi o anúncio no Zap.' },
                { role: 'assistant', content: 'Olá Bruno! Tudo bem? Qual região você busca?' },
                { role: 'user', content: 'Zona Sul, perto do metrô.' }
            ]
        },
        {
            name: 'Carla Dias',
            email: 'carla.dias@example.com',
            phone: '+55 11 99999-0003',
            status: 'Qualified',
            source: 'Website',
            score: 85,
            budget: 'R$ 800k - 1M',
            desired_city: 'São Paulo',
            notes: 'Cliente com orçamento aprovado, busca 3 dorms.',
            messages: [
                { role: 'user', content: 'Tenho interesse em imóveis de alto padrão.' },
                { role: 'assistant', content: 'Certo Carla. Qual seu orçamento estimado?' },
                { role: 'user', content: 'Entre 800 mil e 1 milhão.' }
            ]
        },
        {
            name: 'Daniel Rocha',
            email: 'daniel.rocha@example.com',
            phone: '+55 11 99999-0004',
            status: 'Hot',
            source: 'Referral',
            score: 95,
            budget: 'R$ 1.5M+',
            desired_city: 'São Paulo',
            notes: 'Urgente. Mudança em 30 dias. Quer visitar hoje.',
            messages: [
                { role: 'user', content: 'Preciso de um imóvel pra ontem!' },
                { role: 'assistant', content: 'Entendido Daniel. Quando pode visitar?' },
                { role: 'user', content: 'Hoje a tarde se possível.' }
            ]
        },
        {
            name: 'Eduardo Lima',
            email: 'edu.lima@example.com',
            phone: '+55 11 99999-0005',
            status: 'Not Interested',
            source: 'Cold Call',
            score: 10,
            notes: 'Disse que só estava curioso.',
            messages: [
                { role: 'user', content: 'Qual o preço?' },
                { role: 'assistant', content: 'A partir de 500k.' },
                { role: 'user', content: 'Ah tá, muito caro, obrigado.' }
            ]
        },
        {
            name: 'Fabiana Melo',
            email: 'fabiana.m@example.com',
            phone: '+55 11 99999-0006',
            status: 'Follow-up', // Maps to Scheduled/Follow-up usually
            source: 'Linkedin',
            score: 60,
            next_action_at: new Date(Date.now() + 86400000), // Tomorrow
            notes: 'Pediu para ligar amanhã.',
            messages: [
                { role: 'user', content: 'Pode me ligar amanhã?' }
            ]
        }
    ];

    // 3. Insert Leads
    for (const data of leads) {
        // Check if exists
        const exists = await prisma.lead.findUnique({
            where: { phone: data.phone }
        });

        if (exists) {
            console.log(`⚠️ Lead ${data.name} already exists. Skipping.`);
            continue;
        }

        const { messages, ...leadData } = data;

        const lead = await prisma.lead.create({
            data: {
                ...leadData,
                brokerId: realtor.id,
                messages: {
                    create: messages.map(m => ({
                        role: m.role,
                        sender: m.role === 'user' ? 'lead' : 'ai',
                        direction: m.role === 'user' ? 'inbound' : 'outbound',
                        content: m.content,
                        timestamp: new Date()
                    }))
                }
            }
        });
        console.log(`✨ Created lead: ${lead.name} [${lead.status}]`);
    }

    console.log('🏁 Seed complete!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

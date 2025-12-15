
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Starting backfill...');

    // 1. Find Patricia
    const patricia = await prisma.user.findFirst({
        where: {
            email: { contains: 'patricia', mode: 'insensitive' }
        }
    });

    if (patricia) {
        console.log(`Found user: ${patricia.name} (${patricia.email})`);

        // 2. Update Slug
        const updated = await prisma.user.update({
            where: { id: patricia.id },
            data: {
                slug: 'patricia-chahin',
                whatsapp_provider: 'cloud-api' // Default
            }
        });
        console.log(`Updated slug for ${updated.name}: ${updated.slug}`);
    } else {
        console.log('User Patricia not found via email search.');
    }

    // Optional: Backfill others if needed
    const usersWithoutSlug = await prisma.user.findMany({
        where: { slug: null }
    });

    for (const user of usersWithoutSlug) {
        if (user.id === patricia?.id) continue;

        const newSlug = user.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '') + '-' + user.id;
        await prisma.user.update({
            where: { id: user.id },
            data: { slug: newSlug }
        });
        console.log(`Generated slug for ${user.name}: ${newSlug}`);
    }
}

main()
    .catch((e) => console.error(e))
    .finally(async () => await prisma.$disconnect());


import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function check() {
    const slug = 'adrian-corretor';
    console.log(`Looking up user for slug: ${slug}`);
    const user = await prisma.user.findFirst({ where: { slug } });

    if (user) {
        console.log(`Found: ${user.email}`);
        console.log(`Role: ${user.role}`);
        console.log(`Status: ${user.status}`);
    } else {
        console.log('No user found for this slug.');
    }
}

check()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());

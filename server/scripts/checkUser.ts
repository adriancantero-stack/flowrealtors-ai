
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const email = 'patricia@gmail.com';
    console.log(`Checking user: ${email}...`);

    const user = await prisma.user.findUnique({
        where: { email },
        select: { id: true, name: true, email: true, slug: true, role: true, password_hash: true }
    });

    console.log('User found:', user);
}

main()
    .catch((e) => console.error(e))
    .finally(async () => await prisma.$disconnect());

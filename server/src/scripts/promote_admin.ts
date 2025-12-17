
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const email = 'adrian@flowrealtors.com';
    console.log(`Updating role for ${email}...`);

    const user = await prisma.user.update({
        where: { email },
        data: { role: 'admin' }
    });

    console.log('Updated User:', user);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());

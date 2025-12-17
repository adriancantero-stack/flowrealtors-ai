
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const email = 'adrian@flowrealtors.com';
    console.log(`Resetting password for ${email} to 'admin123'...`);

    const user = await prisma.user.update({
        where: { email },
        data: { password_hash: 'admin123' }
    });

    console.log('Updated User:', user);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());

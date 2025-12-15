
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const email = 'patricia@gmail.com'; // Adjust if needed
    const newPassword = '123456';

    console.log(`Setting password for ${email}...`);

    try {
        const user = await prisma.user.update({
            where: { email },
            data: { password_hash: newPassword }
        });
        console.log(`✅ Password updated for ${user.name}`);
    } catch (error) {
        console.error('Error updating password. User might not exist or email is wrong.');
        console.error(error);
    }
}

main()
    .catch((e) => console.error(e))
    .finally(async () => await prisma.$disconnect());

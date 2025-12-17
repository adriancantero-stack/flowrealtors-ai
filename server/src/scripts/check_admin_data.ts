
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Checking Users...');
    const users = await prisma.user.findMany();
    console.log(`Found ${users.length} users:`);
    users.forEach(u => console.log(`- ID: ${u.id}, Name: ${u.name}, Role: ${u.role}, Email: ${u.email}`));

    console.log('\nChecking Leads...');
    const leads = await prisma.lead.findMany();
    console.log(`Found ${leads.length} leads.`);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());

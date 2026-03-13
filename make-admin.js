const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    const email = process.argv[2];

    if (!email) {
        console.error('Usage: node make-admin.js <user_email>');
        process.exit(1);
    }

    try {
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            console.error(`Error: User with email "${email}" not found.`);
            process.exit(1);
        }

        const updatedUser = await prisma.user.update({
            where: { email },
            data: { role: 'ADMIN' },
        });

        console.log(`✅ Success! User "${updatedUser.name || updatedUser.email}" has been elevated to ADMIN role.`);
    } catch (error) {
        console.error('❌ Error updating user role:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

main();

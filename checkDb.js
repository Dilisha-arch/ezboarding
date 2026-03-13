const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const unis = await prisma.university.findMany({
    include: { faculties: true },
  });
  console.log("Total Universities:", unis.length);
  if (unis.length > 0) {
    console.log("First University:", unis[0].name, "IsActive:", unis[0].isActive, "Faculties:", unis[0].faculties.length);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());

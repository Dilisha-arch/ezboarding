
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();
const prisma = new PrismaClient();

async function main() {
  console.log("--- Universities ---");
  const universities = await prisma.university.findMany({
    include: { faculties: true }
  });
  console.log(JSON.stringify(universities, null, 2));

  console.log("\n--- All Properties (Status Check) ---");
  const allProperties = await prisma.property.findMany({
    select: { id: true, title: true, status: true, availableSpots: true }
  });
  console.log(JSON.stringify(allProperties, null, 2));

  console.log("\n--- PropertyUniversity Links ---");
  const links = await prisma.propertyUniversity.findMany({
    include: { university: { select: { name: true } }, faculty: { select: { name: true } } }
  });
  console.log(JSON.stringify(links, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());

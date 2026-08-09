import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding PackAI database...');

  // Clear existing presets if any
  await prisma.container.deleteMany({});
  await prisma.packageType.deleteMany({});

  const containers = await prisma.container.createMany({
    data: [
      { name: 'Standard Container', length: 120, width: 100, height: 100 },
      { name: 'Large Container', length: 200, width: 150, height: 120 },
      { name: 'Small Container', length: 80, width: 60, height: 60 },
    ],
  });

  const packages = await prisma.packageType.createMany({
    data: [
      { name: 'Small Box', length: 20, width: 20, height: 20, weight: 2 },
      { name: 'Medium Box', length: 30, width: 20, height: 15, weight: 4 },
      { name: 'Large Box', length: 40, width: 30, height: 20, weight: 8 },
      { name: 'Electronics Box', length: 35, width: 25, height: 15, weight: 5 },
      { name: 'Bottle Box', length: 25, width: 20, height: 30, weight: 3 },
    ],
  });

  console.log(`Database seeded successfully! Created ${containers.count} containers and ${packages.count} package types.`);
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

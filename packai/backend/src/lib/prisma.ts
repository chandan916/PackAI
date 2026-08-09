import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

export async function initDatabase() {
  try {
    // 1. Create tables if they do not exist (SQLite auto-initialization)
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS containers (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        length REAL NOT NULL,
        width REAL NOT NULL,
        height REAL NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS package_types (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        length REAL NOT NULL,
        width REAL NOT NULL,
        height REAL NOT NULL,
        weight REAL DEFAULT 0,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS optimization_runs (
        id TEXT PRIMARY KEY,
        containerCount INTEGER NOT NULL,
        averageUtilization REAL NOT NULL,
        emptySpacePercentage REAL NOT NULL,
        inputData TEXT NOT NULL,
        resultData TEXT NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2. Auto-seed presets if table is empty
    const existingContainers = await prisma.container.count();
    if (existingContainers === 0) {
      console.log('🌱 Seeding initial presets in SQLite database...');
      await prisma.container.createMany({
        data: [
          { id: '1', name: 'Standard Container', length: 120, width: 100, height: 100 },
          { id: '2', name: 'Large Container', length: 200, width: 150, height: 120 },
          { id: '3', name: 'Small Container', length: 80, width: 60, height: 60 },
        ],
      });

      await prisma.packageType.createMany({
        data: [
          { id: '1', name: 'Small Box', length: 20, width: 20, height: 20, weight: 2 },
          { id: '2', name: 'Medium Box', length: 30, width: 20, height: 15, weight: 4 },
          { id: '3', name: 'Large Box', length: 40, width: 30, height: 20, weight: 8 },
          { id: '4', name: 'Electronics Box', length: 35, width: 25, height: 15, weight: 5 },
          { id: '5', name: 'Bottle Box', length: 25, width: 20, height: 30, weight: 3 },
        ],
      });
      console.log('✅ Initial presets seeded successfully!');
    }
  } catch (err: any) {
    console.warn('Database auto-initialization notice:', err.message);
  }
}

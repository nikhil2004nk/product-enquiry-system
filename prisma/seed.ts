import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const LG_CATALOGUE_URL =
  "https://drive.google.com/file/d/1SF_JGm1719_rFzF29dH1BXjrDjTWBApB/view?usp=drivesdk";

const ledModels = [
  "32LR653",
  "32LB659",
  "43NU885B",
  "43QNED70B",
  "50NU885B",
  "55NU885",
  "55QNED70",
  "55QNED82",
  "55QNED85",
  "55MRGB85",
  "55C6",
  "55G6",
  "65NU885",
  "65QNED70",
  "65QNED82",
  "65QNED85",
  "65MRGB85",
  "65C6",
  "65G6",
  "75NU885",
  "75QNED70",
  "75QNED85",
  "75MRHB85",
  "85NU885",
  "85QNED82",
  "100QNED86",
];

async function main() {
  console.log("Seeding database...");

  const category = await prisma.category.upsert({
    where: {
      name: "LED",
    },
    update: {
      catalogueUrl: LG_CATALOGUE_URL,
      active: true,
    },
    create: {
      name: "LED",
      description: "LG LED Televisions",
      catalogueUrl: LG_CATALOGUE_URL,
      active: true,
    },
  });

  console.log(`Category created/found: ${category.name}`);

  for (const modelNumber of ledModels) {
    await prisma.product.upsert({
      where: {
        categoryId_modelNumber: {
          categoryId: category.id,
          modelNumber,
        },
      },
      update: {
        active: true,
      },
      create: {
        categoryId: category.id,
        modelNumber,
        active: true,
      },
    });
  }

  const bcrypt = require("bcryptjs");
  const pinHash = await bcrypt.hash("1234", 10);
  
  // @ts-ignore
  await prisma.user.upsert({
    where: { mobile: "9324302421" },
    update: {},
    create: {
      name: "Nikhil",
      mobile: "9324302421",
      pinHash,
    },
  });
  console.log("Admin user Nikhil seeded successfully.");

  console.log(`${ledModels.length} LED products created/updated.`);
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

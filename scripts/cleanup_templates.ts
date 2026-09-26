import { prisma } from "../src/lib/prisma";

async function main() {
  const result = await (prisma as any).messageTemplate.deleteMany({
    where: {
      userId: null,
      name: {
        not: 'Standard Reply'
      }
    }
  });
  console.log(`Deleted ${result.count} old global templates`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

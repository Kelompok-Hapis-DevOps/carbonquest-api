import prisma from "../src/prisma/client.js";
import { BADGE_CATALOG } from "../src/config/badges.js";

async function main() {
  console.log("Seeding badge catalog...");

  for (const badge of BADGE_CATALOG) {
    await prisma.badges.upsert({
      where: { code: badge.code },
      create: badge,
      update: {
        name: badge.name,
        description: badge.description,
        icon: badge.icon,
        category: badge.category,
        threshold: badge.threshold,
      },
    });
  }

  console.log(`Seeded ${BADGE_CATALOG.length} badges successfully.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

require("dotenv/config");
const { PrismaPg } = require("@prisma/adapter-pg");
const { PrismaClient } = require("@prisma/client");

async function main() {
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
  });
  const prisma = new PrismaClient({ adapter });

  const orphans = await prisma.resume.findMany({
    where: { slug: "untitled-resume" },
    include: { _count: { select: { sectionOrder: true } } },
  });

  if (orphans.length === 0) {
    console.log("No orphaned resumes found with slug 'untitled-resume'");
    await prisma.$disconnect();
    return;
  }

  let deleted = 0;
  for (const orphan of orphans) {
    if (orphan._count.sectionOrder === 0) {
      await prisma.resume.delete({ where: { id: orphan.id } });
      console.log(`Deleted orphaned resume: ${orphan.id} (user: ${orphan.userId})`);
      deleted++;
    } else {
      console.log(`Skipping resume ${orphan.id}: has ${orphan._count.sectionOrder} section orders (not orphaned)`);
    }
  }

  console.log(`Done. Deleted ${deleted} orphaned resume(s)`);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error("Cleanup failed:", e);
  process.exit(1);
});

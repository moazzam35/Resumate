require("dotenv/config");
const { PrismaPg } = require("@prisma/adapter-pg");
const { PrismaClient } = require("@prisma/client");

async function main() {
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
  });
  const prisma = new PrismaClient({ adapter });

  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
    orderBy: { createdAt: "asc" },
  });

  console.log("=== ALL USERS ===");
  users.forEach((u) => {
    console.log(`  ${u.email} | role: ${u.role} | id: ${u.id}`);
  });

  if (users.length === 0) {
    console.log("\nNo users found. Sign up first!");
    await prisma.$disconnect();
    return;
  }

  const targetUser = users[0];

  if (targetUser.role === "ADMIN") {
    console.log(`\n${targetUser.email} is already ADMIN.`);
  } else {
    await prisma.user.update({
      where: { id: targetUser.id },
      data: { role: "ADMIN" },
    });
    console.log(`\nPromoted ${targetUser.email} to ADMIN.`);
  }

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

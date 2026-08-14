require("dotenv/config");
const bcryptjs = require("bcryptjs");
const { PrismaPg } = require("@prisma/adapter-pg");
const { PrismaClient } = require("@prisma/client");

async function main() {
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
  });
  const prisma = new PrismaClient({ adapter });

  const password = await bcryptjs.hash("1122", 12);

  const users = [
    { name: "User One", email: "user1@example.com", role: "USER" },
    { name: "User Two", email: "user2@example.com", role: "USER" },
    { name: "Client One", email: "client1@example.com", role: "CLIENT" },
    { name: "Admin", email: "admin@example.com", role: "ADMIN" },
  ];

  for (const u of users) {
    const existing = await prisma.user.findUnique({ where: { email: u.email } });
    if (existing) {
      console.log(`Already exists: ${u.email}`);
      continue;
    }

    const user = await prisma.user.create({
      data: {
        name: u.name,
        email: u.email,
        password,
        role: u.role,
      },
    });

    await prisma.subscription.create({
      data: {
        userId: user.id,
        plan: "FREE",
        isActive: true,
      },
    });

    console.log(`Created: ${u.email} (${u.role})`);
  }

  await prisma.$disconnect();
  console.log("Done.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

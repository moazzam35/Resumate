require("dotenv/config");
const { PrismaPg } = require("@prisma/adapter-pg");
const { PrismaClient } = require("@prisma/client");

const TEMPLATES = [
  {
    slug: "modern",
    name: "Modern",
    description: "Clean and modern design with a professional look",
    category: "professional",
    isPremium: false,
    thumbnail: "/templates/modern.png",
  },
  {
    slug: "minimal",
    name: "Minimal",
    description: "Minimalist design focusing on content",
    category: "minimal",
    isPremium: false,
    thumbnail: "/templates/minimal.png",
  },
  {
    slug: "professional",
    name: "Professional",
    description: "Traditional professional resume format",
    category: "professional",
    isPremium: false,
    thumbnail: "/templates/professional.png",
  },
  {
    slug: "corporate",
    name: "Corporate",
    description: "Corporate-style layout for business roles",
    category: "professional",
    isPremium: true,
    thumbnail: "/templates/corporate.png",
  },
  {
    slug: "creative",
    name: "Creative",
    description: "Stand out with creative visual elements",
    category: "creative",
    isPremium: true,
    thumbnail: "/templates/creative.png",
  },
  {
    slug: "developer",
    name: "Developer",
    description: "Optimized for technical roles",
    category: "technical",
    isPremium: true,
    thumbnail: "/templates/developer.png",
  },
];

async function main() {
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
  });
  const prisma = new PrismaClient({ adapter });

  for (const [index, t] of TEMPLATES.entries()) {
    await prisma.resumeTemplate.upsert({
      where: { slug: t.slug },
      update: {
        name: t.name,
        description: t.description,
        category: t.category,
        isPremium: t.isPremium,
        isActive: true,
        order: index,
        thumbnail: t.thumbnail,
      },
      create: {
        slug: t.slug,
        name: t.name,
        description: t.description,
        category: t.category,
        isPremium: t.isPremium,
        isActive: true,
        order: index,
        thumbnail: t.thumbnail,
      },
    });
    console.log(`Seeded: ${t.name}`);
  }

  const total = await prisma.resumeTemplate.count();
  console.log(`Total templates: ${total}`);

  await prisma.$disconnect();
}

main().catch(async (error) => {
  console.error(error);
  process.exit(1);
});

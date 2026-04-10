import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const demoPassword = await bcrypt.hash("demo1234", 10);

  const user = await prisma.user.upsert({
    where: { username: "demo" },
    update: {},
    create: {
      username: "demo",
      passwordHash: demoPassword,
    },
  });

  const hasScores = await prisma.score.count({ where: { userId: user.id } });
  if (hasScores === 0) {
    await prisma.score.createMany({
      data: [
        {
          userId: user.id,
          username: user.username,
          gameType: "sudoku",
          difficulty: "easy",
          timeSeconds: 420,
          mistakesEnabled: false,
        },
        {
          userId: user.id,
          username: user.username,
          gameType: "killer",
          difficulty: "medium",
          timeSeconds: 980,
          mistakesEnabled: true,
        },
      ],
    });
  }

  console.log("Seed complete. Demo user: demo / demo1234");
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

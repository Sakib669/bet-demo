import { PrismaClient } from "./generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function main() {
  const adminMobile = process.env.ADMIN_MOBILE?.trim();
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminMobile || !/^01[3-9]\d{8}$/.test(adminMobile) || !adminPassword || adminPassword.length < 12) {
    throw new Error("Set ADMIN_MOBILE to a valid Bangladesh mobile number and ADMIN_PASSWORD to at least 12 characters before seeding.");
  }
  const adminPasswordHash = await bcrypt.hash(adminPassword, 12);

  await prisma.user.upsert({
    where: { mobile: adminMobile },
    update: {
      role: "ADMIN",
      passwordHash: adminPasswordHash,
    },
    create: {
      name: "Operator",
      mobile: adminMobile,
      username: adminMobile,
      passwordHash: adminPasswordHash,
      role: "ADMIN",
      wallet: {
        create: {
          balance: 0,
        },
      },
    },
  });
  if (adminMobile !== "01700000000") {
    await prisma.user.updateMany({ where: { mobile: "01700000000" }, data: { isActive: false } });
  }
  await prisma.user.updateMany({ where: { mobile: "01711111111" }, data: { isActive: false } });
  console.log("Operator account is ready.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

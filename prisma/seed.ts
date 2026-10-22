import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminPasswordHash = await bcrypt.hash("admin123", 10);
  const playerPasswordHash = await bcrypt.hash("player123", 10);

  // 1. Seed or update Admin
  const admin = await prisma.user.upsert({
    where: { mobile: "01700000000" },
    update: {
      role: "ADMIN",
      passwordHash: adminPasswordHash,
    },
    create: {
      name: "System Admin",
      mobile: "01700000000",
      username: "admin",
      passwordHash: adminPasswordHash,
      role: "ADMIN",
      wallet: {
        create: {
          balance: 999999.0,
        },
      },
    },
  });

  // 2. Seed or update Default Customer
  const customer = await prisma.user.upsert({
    where: { mobile: "01711111111" },
    update: {
      passwordHash: playerPasswordHash,
    },
    create: {
      name: "Demo Player",
      mobile: "01711111111",
      username: "player_one",
      passwordHash: playerPasswordHash,
      role: "CUSTOMER",
      wallet: {
        create: {
          balance: 1000.0,
        },
      },
    },
  });

  // Ensure customer has wallet
  const existingWallet = await prisma.wallet.findUnique({
    where: { userId: customer.id },
  });
  if (!existingWallet) {
    await prisma.wallet.create({
      data: {
        userId: customer.id,
        balance: 1000.0,
      },
    });
  }

  // 3. Seed SiteSetting for bKash
  await prisma.siteSetting.upsert({
    where: { key: "bkash_number" },
    update: {},
    create: {
      key: "bkash_number",
      value: "01798-234567",
    },
  });

  await prisma.siteSetting.upsert({
    where: { key: "bkash_type" },
    update: {},
    create: {
      key: "bkash_type",
      value: "Personal (Send Money)",
    },
  });

  console.log("Database seeded successfully with Admin (01700000000 / admin123) and Customer (01711111111 / player123)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

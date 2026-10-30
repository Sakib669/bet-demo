import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function getGameUser() {
  const session = await auth();
  const userId = session?.user?.id;

  if (userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { wallet: true },
    });
    if (user && user.wallet) return user;
  }

  return null;
}

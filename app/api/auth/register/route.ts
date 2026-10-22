import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, mobile, email, password } = body;

    if (!name || typeof name !== "string" || name.trim().length < 2) {
      return NextResponse.json(
        { success: false, message: "Valid name is required (minimum 2 characters)" },
        { status: 400 }
      );
    }

    if (!mobile || typeof mobile !== "string") {
      return NextResponse.json(
        { success: false, message: "Mobile number is required" },
        { status: 400 }
      );
    }

    const cleanMobile = mobile.trim().replace(/[-\s]/g, "");
    const bdMobileRegex = /^01[3-9]\d{8}$/;
    if (!bdMobileRegex.test(cleanMobile)) {
      return NextResponse.json(
        { success: false, message: "Valid Bangladesh 11-digit mobile number required (e.g. 017XXXXXXXX)" },
        { status: 400 }
      );
    }

    if (!password || typeof password !== "string" || password.length < 6) {
      return NextResponse.json(
        { success: false, message: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    // Check if mobile already in use
    const existingMobile = await prisma.user.findUnique({
      where: { mobile: cleanMobile },
    });
    if (existingMobile) {
      return NextResponse.json(
        { success: false, message: "Mobile number is already registered" },
        { status: 400 }
      );
    }

    // Check if optional email already in use
    const cleanEmail = email && typeof email === "string" && email.trim().length > 0 ? email.trim().toLowerCase() : null;
    if (cleanEmail) {
      const existingEmail = await prisma.user.findUnique({
        where: { email: cleanEmail },
      });
      if (existingEmail) {
        return NextResponse.json(
          { success: false, message: "Email is already registered" },
          { status: 400 }
        );
      }
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          name: name.trim(),
          mobile: cleanMobile,
          email: cleanEmail,
          username: cleanMobile,
          passwordHash,
          role: "CUSTOMER",
        },
      });

      const newWallet = await tx.wallet.create({
        data: {
          userId: newUser.id,
          balance: 1000.0,
        },
      });

      await tx.transaction.create({
        data: {
          walletId: newWallet.id,
          type: "DAILY_BONUS",
          amount: 1000.0,
          balanceBefore: 0.0,
          balanceAfter: 1000.0,
          description: "Welcome Free Demo Credits",
        },
      });

      return newUser;
    });

    return NextResponse.json({
      success: true,
      message: "Registration successful. You can now log in.",
      user: {
        id: user.id,
        name: user.name,
        mobile: user.mobile,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create account. Please try again." },
      { status: 500 }
    );
  }
}

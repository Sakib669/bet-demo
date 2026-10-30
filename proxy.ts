import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const role = (req.auth?.user as any)?.role;

  const isAdminRoute = nextUrl.pathname.startsWith("/admin");
  const isAuthRoute = nextUrl.pathname === "/login" || nextUrl.pathname === "/register";
  const isCustomerHome = nextUrl.pathname === "/";

  // 1. Unauthenticated trying to access admin
  if (isAdminRoute && !isLoggedIn) {
    const callbackUrl = encodeURIComponent(nextUrl.pathname);
    return NextResponse.redirect(new URL(`/login?callbackUrl=${callbackUrl}`, nextUrl));
  }

  // 2. Non-admin customer trying to access admin
  if (isAdminRoute && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/", nextUrl));
  }

  // 3. Admin trying to access customer pages (home /)
  if (isCustomerHome && isLoggedIn && role === "ADMIN") {
    return NextResponse.redirect(new URL("/admin/dashboard", nextUrl));
  }

  // 4. Logged in user visiting /login or /register
  if (isAuthRoute && isLoggedIn) {
    if (role === "ADMIN") {
      return NextResponse.redirect(new URL("/admin/dashboard", nextUrl));
    }
    return NextResponse.redirect(new URL("/", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|images|favicon.ico).*)"],
};

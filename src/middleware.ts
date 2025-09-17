// middleware.ts
import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse, NextRequest } from "next/server";

export default clerkMiddleware((auth, req: NextRequest) => {
  const { pathname } = req.nextUrl;
  console.log("Pathname ->", pathname);

  const availablePaths = [
    "/modes",
    "/getdata",
    "/patients",
    "/pressure",
    "/profile",
    "/client",
  ];

  const isRoot = pathname === "/";
  const isApi = pathname.startsWith("/api") || pathname.startsWith("/trpc");
  const isStatic = pathname.startsWith("/_next") || /\.(.*)$/.test(pathname);
  // const isProfile = pathname.startsWith("/profile/");
  const isAvailable = availablePaths.some((value) => pathname.startsWith(`${value}/`) || pathname === value);
  console.log("Is Available ->", isAvailable);

  if (!isApi && !isStatic && !isAvailable && !isRoot) {
    const url = req.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)"], // ✅ Allows /api/* too
};
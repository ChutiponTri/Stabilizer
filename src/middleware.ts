// middleware.ts
import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse, NextRequest } from "next/server";

export default clerkMiddleware((auth, req) => {
  const { pathname } = req.nextUrl;

  const availablePaths = [
    "/",
    "/modes",
    "/getdata",
    "/patients",
    "/pressure",
    "/profile"
  ];

  const isApi = pathname.startsWith("/api") || pathname.startsWith("/trpc");
  const isStatic = pathname.startsWith("/_next") || /\.(.*)$/.test(pathname);
  const isAvailable = availablePaths.some((value) => pathname.startsWith(value))

  if (!isApi && !isStatic && !isAvailable) {
    const url = req.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)", ],
};
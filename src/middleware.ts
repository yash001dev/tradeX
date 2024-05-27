import { getToken } from "next-auth/jwt";
import { getSession } from "next-auth/react";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Allow public routes to bypass the session check
  const publicPaths = ["/_next", "/api", "/favicon.ico", "/robots.txt"];
  if (publicPaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // Log the session for debugging purposes

  // If user is already logged in and trying to access auth routes, redirect to dashboard
  if (token && pathname.startsWith("/auth")) {
    return NextResponse.redirect(
      new URL("/playground", request.url).toString()
    );
  }

  // If user is not logged in and trying to access protected routes, redirect to signin
  if (!token && !pathname.startsWith("/auth")) {
    return NextResponse.redirect(
      new URL("/auth/signin", request.url).toString()
    );
  }

  // Allow the request to proceed if none of the above conditions are met
  return NextResponse.next();
}

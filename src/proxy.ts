import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { SESSION_COOKIE_NAME, SessionUser } from "./lib/auth/constants";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  let session: SessionUser | null = null;

  if (sessionCookie && process.env.JWT_SECRET) {
    try {
      const secretKey = new TextEncoder().encode(process.env.JWT_SECRET);
      const { payload } = await jwtVerify(sessionCookie, secretKey);
      session = payload as unknown as SessionUser;
    } catch {
      // Invalid/expired token
      session = null;
    }
  }

  const isTeacherRoute = pathname.startsWith("/teacher");
  const isStudentRoute = pathname.startsWith("/student");
  const isAuthRoute = pathname === "/login" || pathname === "/register";

  // Redirect authenticated users away from /login and /register
  if (isAuthRoute && session) {
    if (session.role === "teacher") {
      return NextResponse.redirect(new URL("/teacher", request.url));
    } else {
      return NextResponse.redirect(new URL("/student", request.url));
    }
  }

  // Teacher routes: strictly teacher only
  if (isTeacherRoute) {
    if (!session) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (session.role !== "teacher") {
      // Reject student attempt to enter teacher area
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }

    if (session.status !== "active") {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("error", "account_inactive");
      const res = NextResponse.redirect(loginUrl);
      res.cookies.delete(SESSION_COOKIE_NAME);
      return res;
    }
  }

  // Student routes: student or teacher (teacher can view learning library)
  if (isStudentRoute) {
    if (!session) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (session.status !== "active") {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("error", "account_inactive");
      const res = NextResponse.redirect(loginUrl);
      res.cookies.delete(SESSION_COOKIE_NAME);
      return res;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/teacher/:path*",
    "/student/:path*",
    "/login",
    "/register",
  ],
};

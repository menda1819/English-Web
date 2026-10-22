import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { SESSION_COOKIE_NAME, SESSION_MAX_AGE_SECONDS, SessionUser } from "./constants";
import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";

function getSecretKey(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET environment variable is required.");
  }
  return new TextEncoder().encode(secret);
}

/**
 * Sign JWT token with jose (Edge and Node compatible)
 */
export async function signSessionToken(payload: SessionUser): Promise<string> {
  // Ensure the payload is a 100% plain JSON-serializable object
  // to avoid DataCloneError from Mongoose Document or CoreMongooseArray proxies
  const cleanPayload = {
    userId: String(payload.userId),
    email: String(payload.email),
    name: String(payload.name),
    role: payload.role,
    grade: payload.grade !== undefined && payload.grade !== null ? Number(payload.grade) : undefined,
    avatar: payload.avatar ? String(payload.avatar) : undefined,
    status: payload.status,
    accessAllGrades: Boolean(payload.accessAllGrades),
    allowedGrades: Array.isArray(payload.allowedGrades)
      ? Array.from(payload.allowedGrades).map(Number)
      : [],
  };

  const safePayload = JSON.parse(JSON.stringify(cleanPayload));

  return await new SignJWT(safePayload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
    .sign(getSecretKey());
}

/**
 * Verify JWT token with jose
 */
export async function verifySessionToken(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    return payload as unknown as SessionUser;
  } catch {
    return null;
  }
}

/**
 * Set HTTP-only, secure, same-site session cookie
 */
export async function setSessionCookie(payload: SessionUser) {
  const token = await signSessionToken(payload);
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

/**
 * Delete session cookie
 */
export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

/**
 * Get current session user from cookie
 */
export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  const session = await verifySessionToken(token);
  return session;
}

import { redirect } from "next/navigation";

/**
 * Require an authenticated session (redirects to /login if absent)
 */
export async function requireAuth(): Promise<SessionUser> {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }
  return session;
}

/**
 * Require a teacher session. Rejects student requests on the server.
 */
export async function requireTeacher(): Promise<SessionUser> {
  const session = await requireAuth();
  if (session.role !== "teacher") {
    redirect("/unauthorized");
  }

  // Also verify user is active in DB
  await connectToDatabase();
  const dbUser = await User.findById(session.userId);
  if (!dbUser || dbUser.status !== "active" || dbUser.role !== "teacher") {
    redirect("/unauthorized");
  }

  return session;
}

/**
 * Require an authenticated student session (or teacher acting as student).
 */
export async function requireStudent(): Promise<SessionUser> {
  const session = await requireAuth();

  await connectToDatabase();
  const dbUser = await User.findById(session.userId);
  if (!dbUser || dbUser.status !== "active") {
    redirect("/login?error=account_inactive");
  }

  return session;
}

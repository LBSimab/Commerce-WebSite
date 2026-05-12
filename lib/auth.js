/**
 * Auth Utilities
 *
 * JWT token generation and verification.
 * Tokens are stored in HTTP-only cookies for security.
 */

import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const JWT_SECRET =
  process.env.JWT_SECRET || "fallback-secret-change-in-production";
const JWT_EXPIRES_IN = "7d";
const COOKIE_NAME = "sahandcover-token";

// Generate a JWT token
export function generateToken(userId) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

// Verify a JWT token
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

// Set token in HTTP-only cookie
export async function setTokenCookie(token) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

// Get token from cookies
export async function getTokenFromCookies() {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_NAME)?.value || null;
}

// Remove token cookie (logout)
export async function removeTokenCookie() {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

// Get current user from token in cookies (for server components)
export async function getCurrentUser() {
  const token = await getTokenFromCookies();
  if (!token) return null;

  const decoded = verifyToken(token);
  if (!decoded) return null;

  const User = (await import("@/models/User")).default;
  const user = await User.findById(decoded.userId);
  return user;
}

import "server-only";
import crypto from "node:crypto";
import { cookies } from "next/headers";
import { getDb, updateDb } from "./db";
import type { User } from "./types";

export const SESSION_COOKIE = "butterfly_session";
const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;

export function createSession(userId: string) {
  const token = crypto.randomBytes(32).toString("hex");
  updateDb((db) => {
    db.sessions.push({ token, userId, createdAt: new Date().toISOString() });
    db.sessions = db.sessions.slice(-500);
  });
  return { token, maxAge: THIRTY_DAYS / 1000 };
}

export async function sessionUser(): Promise<User | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const db = getDb();
  const session = db.sessions.find((item) => item.token === token);
  if (!session) return null;
  return db.users.find((user) => user.id === session.userId) ?? null;
}

export async function requireUser() {
  const user = await sessionUser();
  if (!user) throw new Error("UNAUTHORIZED");
  return user;
}

export async function requireAdmin() {
  const user = await sessionUser();
  if (!user || user.role !== "admin") throw new Error("FORBIDDEN");
  return user;
}

export function clearSession(token: string | undefined) {
  if (!token) return;
  updateDb((db) => {
    db.sessions = db.sessions.filter((session) => session.token !== token);
  });
}

export function normaliseEmail(email: string) {
  return email.trim().toLowerCase();
}

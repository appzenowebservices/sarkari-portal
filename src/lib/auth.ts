import { randomBytes, scrypt, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { ObjectId } from "mongodb";
import {
  getAdminsCollection,
  getSessionsCollection,
} from "@/db";
import type { Admin, Session } from "@/db/schema";

export const SESSION_COOKIE = "addies_session";
const SESSION_DAYS = 7;

export function hashPassword(password: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const salt = randomBytes(16).toString("hex");
    scrypt(password, salt, 64, (err, derived) => {
      if (err) return reject(err);
      resolve(`scrypt:${salt}:${derived.toString("hex")}`);
    });
  });
}

export function verifyPassword(password: string, stored: string): Promise<boolean> {
  return new Promise((resolve) => {
    const [scheme, salt, hashHex] = stored.split(":");
    if (scheme !== "scrypt" || !salt || !hashHex) return resolve(false);
    scrypt(password, salt, 64, (err, derived) => {
      if (err) return resolve(false);
      const known = Buffer.from(hashHex, "hex");
      resolve(known.length === derived.length && timingSafeEqual(known, derived));
    });
  });
}

export async function createSession(adminId: ObjectId): Promise<string> {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  const sessions = await getSessionsCollection();
  await sessions.insertOne({
    _id: new ObjectId(),
    token,
    adminId,
    expiresAt,
    createdAt: new Date(),
  });
  return token;
}

export async function destroySession(token: string): Promise<void> {
  const sessions = await getSessionsCollection();
  await sessions.deleteOne({ token });
}

export async function getAdmin(): Promise<Admin | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const sessions = await getSessionsCollection();
  const session = (await sessions.findOne({ token })) as Session | null;
  if (!session) return null;

  if (session.expiresAt.getTime() < Date.now()) {
    await destroySession(token);
    return null;
  }

  const admins = await getAdminsCollection();
  const admin = (await admins.findOne({ _id: session.adminId })) as Admin | null;
  return admin ?? null;
}

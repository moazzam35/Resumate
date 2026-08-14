import bcryptjs from "bcryptjs";
import { createHash } from "node:crypto";

const SALT_ROUNDS = 12;

export async function hashPassword(password) {
  return bcryptjs.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password, hashedPassword) {
  return bcryptjs.compare(password, hashedPassword);
}

export function generateRandomToken(length = 32) {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(bytes[i] % chars.length);
  }
  return result;
}

/**
 * Hash a reset token before persisting it so a database leak does not expose
 * usable tokens. Lookups must hash the submitted token the same way.
 */
export function hashResetToken(token) {
  return createHash("sha256").update(token).digest("hex");
}

/**
 * Hash a refresh token before persisting it in the Session table (with a
 * "session:" prefix so the same table can hold reset/verify tokens without
 * collisions). A database leak therefore exposes no usable session tokens.
 */
export function hashSessionToken(token) {
  return `session:${createHash("sha256").update(token).digest("hex")}`;
}

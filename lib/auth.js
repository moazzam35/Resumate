import { SignJWT, jwtVerify } from "jose";

function getSecret(name, value) {
  if (!value || value === "undefined" || value.length < 32) {
    throw new Error(
      `Invalid ${name}: set a strong secret of at least 32 characters in your environment variables.`
    );
  }
  if (value.includes("change-this") || value.includes("your-super-secret")) {
    console.error(
      `WARNING: ${name} is still a placeholder value. Rotate it before deploying.`
    );
  }
  return new TextEncoder().encode(value);
}

let jwtSecret = null;
let jwtRefreshSecret = null;

function getJwtSecret() {
  if (!jwtSecret) jwtSecret = getSecret("JWT_SECRET", process.env.JWT_SECRET);
  return jwtSecret;
}

function getJwtRefreshSecret() {
  if (!jwtRefreshSecret) {
    jwtRefreshSecret = getSecret("JWT_REFRESH_SECRET", process.env.JWT_REFRESH_SECRET);
  }
  return jwtRefreshSecret;
}

export async function signAccessToken(payload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1h")
    .setIssuer("ai-resume-builder")
    .sign(getJwtSecret());
}

export async function signRefreshToken(payload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .setIssuer("ai-resume-builder")
    .sign(getJwtRefreshSecret());
}

export async function verifyAccessToken(token) {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret(), {
      issuer: "ai-resume-builder",
    });
    return payload;
  } catch (error) {
    return null;
  }
}

export async function verifyRefreshToken(token) {
  try {
    const { payload } = await jwtVerify(token, getJwtRefreshSecret(), {
      issuer: "ai-resume-builder",
    });
    return payload;
  } catch (error) {
    return null;
  }
}

export function getTokenFromRequest(request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }
  const cookies = request.headers.get("cookie");
  if (cookies) {
    const cookie = cookies
      .split(";")
      .map((part) => part.trim())
      .find((part) => part.startsWith("token="));
    if (cookie) return cookie.slice("token=".length);
  }
  return null;
}

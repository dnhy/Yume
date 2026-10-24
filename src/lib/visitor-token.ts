import "server-only";

import { SignJWT } from "jose";

export const VISITOR_ISSUER = "dnhy-space-web";
export const VISITOR_AUDIENCE = "dnhy-space-api";

export interface VisitorIdentity {
  githubId: string;
  githubLogin: string;
  name?: string | null;
  avatarUrl?: string | null;
}

/**
 * 签发 5 分钟有效的访客令牌，仅由 Next.js 服务端调用 ABP 时携带。
 */
export async function createVisitorToken(identity: VisitorIdentity) {
  const secret = process.env.VISITOR_JWT_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error("VISITOR_JWT_SECRET 未配置或长度不足 32 位");
  }

  return await new SignJWT({
    github_id: identity.githubId,
    github_login: identity.githubLogin,
    name: identity.name ?? identity.githubLogin,
    picture: identity.avatarUrl ?? null,
    role: "Visitor",
  })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuer(VISITOR_ISSUER)
    .setAudience(VISITOR_AUDIENCE)
    .setSubject(identity.githubId)
    .setIssuedAt()
    .setExpirationTime("5m")
    .sign(new TextEncoder().encode(secret));
}

// src/lib/auth.ts (TEST-mode helper session)
import { cookies } from "next/headers";
import { prisma } from "@lib/db";
import type { Role } from "@prisma/client";

export type Session = {
  userId: string;
  email: string;
  role: Role;
  tenantId: string;
};

const COOKIE = "devAuth";

export function getSession(): Session | null {
  const raw = cookies().get(COOKIE)?.value;
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Session;
  } catch {
    return null;
  }
}

export async function loginByEmail(email: string): Promise<Session | null> {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return null;

  const member = await prisma.member.findFirst({
    where: { userId: user.id },
    include: { tenant: true }
  });
  if (!member) return null;

  return {
    userId: user.id,
    email: user.email,
    role: member.role,
    tenantId: member.tenantId
  };
}

export function serializeSession(sess: Session): string {
  return JSON.stringify(sess);
}

export function clearSessionCookieHeaders() {
  return [
    {
      name: COOKIE,
      value: "",
      options: { path: "/", httpOnly: true, sameSite: "lax", maxAge: 0 }
    }
  ] as const;
}

export const COOKIE_NAME = COOKIE;



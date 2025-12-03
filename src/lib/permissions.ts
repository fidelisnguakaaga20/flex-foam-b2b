// src/lib/permissions.ts
// DEV-ONLY stub for TEST mode; replace with real auth later.
export function requireAdmin() {
  return { userId: "dev-admin", tenantId: "dev-tenant", role: "ADMIN" as const };
}


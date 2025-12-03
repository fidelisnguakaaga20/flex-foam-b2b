// src/app/portal/dashboard/page.tsx
import { redirect } from "next/navigation";

export default function DashboardRedirectPage() {
  // Keep a single source of truth: main dashboard is at /portal
  redirect("/portal");
}


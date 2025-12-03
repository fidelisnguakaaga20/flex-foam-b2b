// src/app/portal/admin/page.tsx
import Link from "next/link";
import { cookies } from "next/headers";

export const metadata = {
  title: "Admin · FLEX FOAM",
};

export default function AdminLandingPage() {
  const cookieStore = cookies();
  const devCookie = cookieStore.get("hf_dev_user");
  const devUser = devCookie ? safeParse(devCookie.value) : null;

  const isLoggedIn = !!devUser;

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold">Admin</h1>
        <p className="text-sm text-gray-400">
          Factory / admin tools for FLEX FOAM (TEST mode).
        </p>
      </header>

      {!isLoggedIn && (
        <section className="space-y-3 rounded-2xl border border-yellow-500/40 bg-yellow-500/5 px-4 py-4">
          <p className="text-sm">
            You must be logged in to access admin tools.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/auth/dev"
              className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
            >
              Go to Dev Login
            </Link>
            <Link
              href="/portal"
              className="rounded-xl border border-gray-700 px-4 py-2 text-sm text-gray-100 hover:bg-gray-900"
            >
              ← Back to Portal
            </Link>
            <Link
              href="/"
              className="text-sm text-gray-300 underline-offset-4 hover:underline"
            >
              Home
            </Link>
          </div>
        </section>
      )}

      {isLoggedIn && (
        <section className="space-y-4">
          <p className="text-sm text-gray-300">
            Logged in as{" "}
            <span className="font-mono">{devUser?.email ?? "unknown"}</span>{" "}
            (dev mode).
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            <Link
              href="/portal/admin/products"
              className="rounded-2xl border border-gray-700 bg-gray-900 px-4 py-4 text-sm hover:border-blue-500 hover:bg-gray-900/80"
            >
              <h2 className="font-semibold mb-1">Manage Products</h2>
              <p className="text-xs text-gray-400">
                CRUD foam SKUs, densities, dimensions and pricing.
              </p>
            </Link>

            <Link
              href="/portal"
              className="rounded-2xl border border-gray-700 bg-gray-900 px-4 py-4 text-sm hover:border-blue-500 hover:bg-gray-900/80"
            >
              <h2 className="font-semibold mb-1">Back to Dealer Portal</h2>
              <p className="text-xs text-gray-400">
                View dashboard, orders, invoices and TEST flows.
              </p>
            </Link>
          </div>

          <Link
            href="/"
            className="inline-flex text-sm text-gray-300 underline-offset-4 hover:underline"
          >
            ← Back to Home
          </Link>
        </section>
      )}
    </main>
  );
}

function safeParse(value: string) {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}


// src/app/auth/dev/page.tsx
import Link from "next/link";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { prisma } from "@lib/db";

export const metadata = {
  title: "Dev Login · FLEX FOAM",
};

// Server Action: login or auto-create dev user
async function devLoginAction(formData: FormData) {
  "use server";

  const email = String(formData.get("email") || "")
    .toLowerCase()
    .trim();

  if (!email) {
    redirect("/auth/dev?error=missing");
  }

  let user = await prisma.user.findFirst({
    where: { email },
  });

  // If not found, auto-create a dev user
  if (!user) {
    user = await prisma.user.create({
      data: {
        email,
        name: email.split("@")[0] || "Dev User",
      },
    });
  }

  cookies().set(
    "hf_dev_user",
    JSON.stringify({
      id: user.id,
      email: user.email,
    }),
    {
      httpOnly: true,
      path: "/",
      secure: process.env.NODE_ENV === "production",
    },
  );

  redirect("/portal/admin");
}

type PageProps = {
  searchParams?: { error?: string };
};

export default function DevLoginPage({ searchParams }: PageProps) {
  const error = searchParams?.error;

  return (
    <main className="mx-auto max-w-md px-4 py-10 space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold">Dev Login</h1>
        <p className="text-sm text-gray-400">
          TEST ONLY. Enter any email to log in as that user.
        </p>
      </header>

      {error === "missing" && (
        <p className="text-sm text-red-400">Please enter an email.</p>
      )}

      <form className="space-y-3" action={devLoginAction}>
        <label className="grid gap-1 text-sm">
          <span>Email</span>
          <input
            className="w-full rounded-xl border border-gray-700 bg-black px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            type="email"
            name="email"
            placeholder="admin@example.com"
            required
          />
        </label>

        <button
          type="submit"
          className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
        >
          Login as this user
        </button>
      </form>

      <div className="pt-4 border-t border-gray-800 flex gap-3">
        <Link
          href="/"
          className="text-sm text-gray-300 underline-offset-4 hover:underline"
        >
          ← Back to Home
        </Link>
        <Link
          href="/portal"
          className="text-sm text-gray-300 underline-offset-4 hover:underline"
        >
          Go to Portal
        </Link>
      </div>
    </main>
  );
}


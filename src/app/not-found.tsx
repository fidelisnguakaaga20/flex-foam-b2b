import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <h1 className="mb-2 text-3xl font-semibold">Page not found</h1>
      <p className="mb-6 text-sm text-gray-500">
        The page you’re looking for doesn’t exist or may have been moved.
      </p>

      <div className="flex gap-3">
        <Link
          href="/"
          className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-gray-50"
        >
          ← Back to Home
        </Link>
        <Link
          href="/portal"
          className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          Go to Portal
        </Link>
      </div>
    </main>
  );
}

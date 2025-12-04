// middleware.ts
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function middleware(_req: NextRequest) {
  // Always allow the request to continue
  const res = NextResponse.next();

  try {
    // Same CSP you had before
    const csp = [
      "default-src 'self';",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' 'wasm-unsafe-eval' https://js.paystack.co https://checkout.paystack.com;",
      "style-src 'self' 'unsafe-inline';",
      "img-src 'self' data: blob:;",
      "font-src 'self';",
      "connect-src 'self' https://api.paystack.co https://checkout.paystack.com;",
      "frame-src https://js.paystack.co https://checkout.paystack.com;",
      "frame-ancestors 'self';",
      "form-action 'self';",
      "base-uri 'self';",
    ].join(" ");

    res.headers.set("Content-Security-Policy", csp);

    // 🔐 Stage 12 security headers (unchanged)
    res.headers.set("X-Frame-Options", "SAMEORIGIN");
    res.headers.set("X-Content-Type-Options", "nosniff");
    res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    res.headers.set(
      "Permissions-Policy",
      "camera=(), microphone=(), geolocation=()"
    );
  } catch (err) {
    // In prod on Vercel, if anything throws here,
    // just return a plain response instead of 500.
    console.error("Middleware header error", err);
    return NextResponse.next();
  }

  return res;
}

// Apply to app routes, skip static/SEO files
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};

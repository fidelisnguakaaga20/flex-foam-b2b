// src/middleware.ts
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // Keep your existing CSP, already aligned with Paystack + Next dev.
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

  // 🔐 Extra security headers required by Stage 12
  res.headers.set("X-Frame-Options", "SAMEORIGIN");
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()"
  );

  return res;
}

// Apply to app routes, skip static/SEO files
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};


// // src/middleware.ts
// import type { NextRequest } from "next/server";
// import { NextResponse } from "next/server";

// export function middleware(req: NextRequest) {
//   const res = NextResponse.next();

//   // For now, allow inline scripts so Next.js can hydrate client components.
//   // We still keep things reasonably tight and allow Paystack domains.
//   const csp = [
//     "default-src 'self';",
//     "script-src 'self' 'unsafe-inline' 'unsafe-eval' 'wasm-unsafe-eval' https://js.paystack.co https://checkout.paystack.com;",
//     "style-src 'self' 'unsafe-inline';",
//     "img-src 'self' data: blob:;",
//     "font-src 'self';",
//     "connect-src 'self' https://api.paystack.co https://checkout.paystack.com;",
//     "frame-src https://js.paystack.co https://checkout.paystack.com;",
//     "frame-ancestors 'self';",
//     "form-action 'self';",
//     "base-uri 'self';",
//   ].join(" ");

//   res.headers.set("Content-Security-Policy", csp);

//   return res;
// }

// // apply to all app routes, skip static assets
// export const config = {
//   matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
// };


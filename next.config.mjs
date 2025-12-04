// next.config.mjs

/** @type {import('next').NextConfig} */
const nextConfig = {
  // keep your existing experimental flag
  experimental: {
    typedRoutes: true,
  },

  // Stage 12 security headers (moved from middleware)
  async headers() {
    // Same CSP you already had in middleware
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

    return [
      {
        // apply to everything (pages + API)
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;


// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   reactStrictMode: true,
//   images: { remotePatterns: [] },

//   experimental: {
//     typedRoutes: true,
//     // >>> Critical: load pdfkit as a server external package so its AFM data files are readable
//     serverComponentsExternalPackages: ["pdfkit"],
//   },

//   async headers() {
//     // Security headers WITHOUT CSP (CSP is handled in src/middleware.ts)
//     const security = [
//       ["Referrer-Policy", "strict-origin-when-cross-origin"],
//       ["X-Content-Type-Options", "nosniff"],
//       ["X-Frame-Options", "SAMEORIGIN"],
//       ["X-XSS-Protection", "0"],
//       ["Permissions-Policy", "camera=(), microphone=(), geolocation=()"],
//       ["Cross-Origin-Opener-Policy", "same-origin"],
//       ["Cross-Origin-Resource-Policy", "same-origin"],
//       ["Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload"],
//     ];

//     return [
//       {
//         source: "/:path*",
//         headers: security.map(([key, value]) => ({ key, value })),
//       },
//     ];
//   },
// };

// export default nextConfig;


/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: { remotePatterns: [] },

  experimental: {
    typedRoutes: true,
    // >>> Critical: load pdfkit as a server external package so its AFM data files are readable
    serverComponentsExternalPackages: ["pdfkit"],
  },

  async headers() {
    // Security headers WITHOUT CSP (CSP is handled in src/middleware.ts)
    const security = [
      ["Referrer-Policy", "strict-origin-when-cross-origin"],
      ["X-Content-Type-Options", "nosniff"],
      ["X-Frame-Options", "SAMEORIGIN"],
      ["X-XSS-Protection", "0"],
      ["Permissions-Policy", "camera=(), microphone=(), geolocation=()"],
      ["Cross-Origin-Opener-Policy", "same-origin"],
      ["Cross-Origin-Resource-Policy", "same-origin"],
      ["Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload"],
    ];

    return [
      {
        source: "/:path*",
        headers: security.map(([key, value]) => ({ key, value })),
      },
    ];
  },
};

export default nextConfig;


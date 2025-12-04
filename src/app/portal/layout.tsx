// src/app/portal/layout.tsx
import React from "react";
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Portal · FLEX FOAM",
};

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Nested layouts must return a fragment/element (no <html> or <body>)
  return <section className="mx-auto max-w-6xl p-4">{children}</section>;
}


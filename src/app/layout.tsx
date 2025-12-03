// src/app/layout.tsx
import React from "react";
import type { Metadata } from "next";
import "../styles/globals.css";
import NavBar from "@components/NavBar";
import TestModeBanner from "@components/TestModeBanner";
import { IS_TEST } from "@lib/env";

export const metadata: Metadata = {
  title: {
    default: "FLEX FOAM — B2B Dealer Portal",
    template: "%s — FLEX FOAM",
  },
  description:
    "B2B dealer portal (TEST mode) for FLEX FOAM dealers & distributors.",
  metadataBase: new URL("http://localhost:3000"),
  openGraph: {
    title: "FLEX FOAM — B2B Dealer Portal",
    description:
      "Browse wholesale foam SKUs, place bulk orders, and track production in TEST mode.",
    url: "/",
    siteName: "FLEX FOAM",
    images: [
      {
        // STAGE 14: reuse same PNG for OG image
        url: "/images/flex-foam/flex-foam-hero.png",
        width: 1200,
        height: 630,
        alt: "FLEX FOAM dealer portal hero banner (CGI/Render).",
      },
    ],
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-dvh bg-black text-white">
        <TestModeBanner isTest={IS_TEST} />
        <NavBar />
        <main className="mx-auto max-w-6xl">{children}</main>
      </body>
    </html>
  );
}


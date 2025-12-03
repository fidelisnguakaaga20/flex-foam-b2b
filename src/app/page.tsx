// src/app/page.tsx
import React from "react";
import Image from "next/image";

export default function HomePage() {
  return (
    <section className="grid gap-4">
      {/* Hero */}
      <div className="card grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] items-center">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">
            Premium Foam for Dealers &amp; Distributors
          </h1>
          <p className="mt-2 text-sm sm:text-base text-neutral-600 dark:text-neutral-300">
            Browse wholesale SKUs, place bulk orders, pay in sandbox, and track
            production stages — all in <strong>TEST MODE</strong> until
            approval.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <a className="btn" href="/products">
              View Products
            </a>
            <a className="btn" href="/portal">
              Enter Portal
            </a>
          </div>
        </div>

        {/* STAGE 14: single PNG hero used here */}
        <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden border border-neutral-800 bg-neutral-900">
          <Image
            src="/images/flex-foam/flex-foam-hero.png"
            alt="FLEX FOAM CGI/Render of premium foam blocks in a warehouse."
            fill
            priority
            className="object-cover"
          />
          <span className="absolute bottom-2 right-3 text-[10px] bg-black/70 px-2 py-1 rounded">
            CGI/Render
          </span>
        </div>
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold">Mobile-first UX</h2>
        <ul className="list-disc pl-5 text-sm">
          <li>Sticky nav, big tap targets, responsive tables</li>
          <li>Lazy images, code splitting</li>
          <li>Alt text &amp; color contrast ≥ 4.5:1</li>
        </ul>
      </div>

      {/* STAGE 14: three cards – all reuse same PNG */}
      <div className="card grid gap-4 md:grid-cols-3">
        {[
          {
            title: "Bedding & Hospitality",
            text: "Mattresses, toppers, and pillows optimized for comfort and durability.",
          },
          {
            title: "Furniture & Upholstery",
            text: "Seat cushions and sofas with consistent density and long-term support.",
          },
          {
            title: "Packaging & Inserts",
            text: "Custom-cut inserts that protect high-value products in transit.",
          },
        ].map((item) => (
          <div key={item.title} className="space-y-2">
            <div className="relative w-full aspect-[16/9] rounded-xl overflow-hidden border border-neutral-800 bg-neutral-900">
              <Image
                src="/images/flex-foam/flex-foam-hero.png"
                alt={`${item.title} using FLEX FOAM (CGI/Render).`}
                fill
                className="object-cover"
              />
            </div>
            <h2 className="text-sm font-semibold">{item.title}</h2>
            <p className="text-xs text-neutral-400">{item.text}</p>
          </div>
        ))}
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold">System Modes</h2>
        <p className="text-sm">
          <code>APP_MODE=test</code> shows the yellow banner and uses demo data.
          Switching to <code>live</code> later hides the banner and uses
          production keys.
        </p>
      </div>
    </section>
  );
}


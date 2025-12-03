// src/app/company/page.tsx
import React from "react";
import Image from "next/image";

export const metadata = {
  title: "Company — FLEX FOAM",
  description:
    "About FLEX FOAM — manufacturing quality foam for bedding, furniture, packaging, and automotive.",
};

export default function CompanyPage() {
  return (
    <section className="grid gap-4">
      <div className="card">
        <h1 className="text-2xl sm:text-3xl font-bold">About FLEX FOAM</h1>
        <p className="mt-2 text-sm sm:text-base text-neutral-600 dark:text-neutral-300">
          We produce premium polyurethane foam for dealers and OEMs. Core lines:
          sheet foam, rebond, memory foam, and custom inserts for packaging and
          automotive seats. Lead times are optimized for bulk B2B orders.
        </p>
      </div>

      <div className="card grid sm:grid-cols-2 gap-4">
        <div>
          <h2 className="text-lg font-semibold">Industries</h2>
          <ul className="list-disc pl-5 text-sm">
            <li>Bedding &amp; Hospitality</li>
            <li>Furniture &amp; Upholstery</li>
            <li>Packaging &amp; Protective Inserts</li>
            <li>Automotive &amp; Transport</li>
          </ul>
        </div>
        <div>
          <h2 className="text-lg font-semibold">Quality &amp; Compliance</h2>
          <ul className="list-disc pl-5 text-sm">
            <li>Density-tested batches, documented specs</li>
            <li>Process controls for cutting, curing, and QA</li>
            <li>Ethical marketing — images marked as “CGI/Render”</li>
          </ul>
        </div>
      </div>

      {/* STAGE 14: 3 process cards all reuse same PNG */}
      <div className="card grid gap-4 md:grid-cols-3">
        {[
          {
            title: "Cutting",
            text: "CNC-controlled cutting lines keep dimensions consistent, order after order.",
          },
          {
            title: "Curing",
            text: "Controlled curing delivers stable densities for all major applications.",
          },
          {
            title: "Quality Check",
            text: "Sampling, compression, and visual inspections are logged for audits.",
          },
        ].map((item) => (
          <div key={item.title} className="space-y-2">
            <div className="relative w-full aspect-[16/9] rounded-xl overflow-hidden border border-neutral-800 bg-neutral-900">
              <Image
                src="/images/flex-foam/flex-foam-hero.png"
                alt={`${item.title} at FLEX FOAM (CGI/Render).`}
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
        <h2 className="text-lg font-semibold">Contact</h2>
        <p className="text-sm">
          For quotes and bulk orders, use the Contact/Quote page.
        </p>
      </div>
    </section>
  );
}

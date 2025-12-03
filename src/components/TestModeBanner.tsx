"use client";

import clsx from "clsx";

export default function TestModeBanner({ isTest }: { isTest: boolean }) {
  if (!isTest) return null;
  return (
    <div
      className={clsx(
        "sticky top-0 z-50 w-full bg-yellow-400 text-black",
        "text-center text-xs sm:text-sm py-1"
      )}
    >
      <strong>TEST MODE</strong> — No real charges. Demo data only.
    </div>
  );
}

// src/lib/currency.ts
// Kobo (number|bigint) -> NGN display (₦)
export function formatNGN(kobo: number | bigint) {
  const v = Number(kobo) / 100;
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 2,
  }).format(v);
}


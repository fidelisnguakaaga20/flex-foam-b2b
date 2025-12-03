// App mode
export const APP_MODE = process.env.APP_MODE?.toLowerCase() === "live" ? "live" : "test";
export const IS_TEST = APP_MODE !== "live";
// alias used by some routes you pasted
export const IS_TEST_MODE = IS_TEST;

// Public base URL (for callbacks/emails)
export const APP_BASE_URL =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || "http://localhost:3000";

// Paystack
export const PAYSTACK_PUBLIC_KEY = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY ?? "";
export const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY ?? "";
export function assertPaystackEnv() {
  if (!PAYSTACK_SECRET_KEY) throw new Error("Missing PAYSTACK_SECRET_KEY");
}

// Notifications (SMTP / From / WhatsApp)
export const SMTP_HOST = process.env.SMTP_HOST || "";
export const SMTP_PORT = Number(process.env.SMTP_PORT || 587);
export const SMTP_USER = process.env.SMTP_USER || "";
export const SMTP_PASS = process.env.SMTP_PASS || "";
export const NOTIFY_FROM = process.env.NOTIFY_FROM || "FLEX FOAM <no-reply@localhost>";
export const WHATSAPP_NUMBER =
  (process.env.NEXT_PUBLIC_WHATSAPP || "").replace(/[^\d]/g, "") || "2340000000000";


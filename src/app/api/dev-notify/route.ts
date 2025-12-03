import { NextRequest } from "next/server";
import { IS_TEST } from "@lib/env";
import { sendPaymentSuccessEmail } from "@lib/notifications";
import { checkRateLimit } from "@lib/rateLimit";

/**
 * TEST helper:
 * GET /api/dev-notify?orderId=...
 * Returns an HTML preview of the email (no external SMTP needed).
 */
export async function GET(req: NextRequest) {
  if (!IS_TEST) {
    return new Response(JSON.stringify({ error: "DISABLED_IN_LIVE" }), {
      status: 403,
      headers: { "content-type": "application/json" },
    });
  }

  // 🔐 Stage 12: Rate limit email previews
  const ip =
    req.ip ??
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "local";
  const key = `dev-notify:${ip}`;

  const rate = checkRateLimit(key, {
    limit: 10, // max 10 previews
    windowMs: 10 * 60_000, // per 10 minutes
  });

  if (!rate.ok) {
    const retrySeconds = Math.max(1, Math.ceil(rate.retryInMs / 1000));
    return new Response(
      JSON.stringify({
        error: "RATE_LIMITED",
        retryAfterSeconds: retrySeconds,
      }),
      {
        status: 429,
        headers: {
          "content-type": "application/json",
          "Retry-After": String(retrySeconds),
        },
      }
    );
  }

  const { searchParams } = new URL(req.url);
  const orderId = searchParams.get("orderId") || "";
  if (!orderId) {
    return new Response(JSON.stringify({ error: "orderId required" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }

  const result = await sendPaymentSuccessEmail(orderId, "dealer@example.com");
  const emlB64 = result.previewBase64;

  const html = `
    <html><body style="font-family:system-ui">
      <h2>Email Queued (TEST transport)</h2>
      <p><strong>messageId:</strong> ${result.messageId}</p>
      <p>Download raw EML (open with any mail client):</p>
      <p><a download="preview.eml" href="data:message/rfc822;base64,${emlB64}">preview.eml</a></p>
      <p>Note: In LIVE mode this endpoint is disabled.</p>
    </body></html>
  `;
  return new Response(html, {
    status: 200,
    headers: { "content-type": "text/html" },
  });
}


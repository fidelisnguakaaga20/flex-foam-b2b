// src/app/api/payments/paystack/webhook/route.ts
import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { PAYSTACK_SECRET_KEY, assertPaystackEnv } from "@lib/env";

// Always server-side
export const dynamic = "force-dynamic";

function verifyPaystackSignature(signature: string, rawBody: string): boolean {
  if (!PAYSTACK_SECRET_KEY) {
    throw new Error("Missing PAYSTACK_SECRET_KEY");
  }

  // HMAC over the raw UTF-8 body string
  const computedHex = crypto
    .createHmac("sha512", PAYSTACK_SECRET_KEY)
    .update(rawBody, "utf8")
    .digest("hex");

  if (signature.length !== computedHex.length) return false;

  // Convert Buffers into Uint8Array for timingSafeEqual
  const sigBuf = Buffer.from(signature, "hex");
  const expBuf = Buffer.from(computedHex, "hex");

  const sigArr = new Uint8Array(sigBuf.buffer, sigBuf.byteOffset, sigBuf.byteLength);
  const expArr = new Uint8Array(expBuf.buffer, expBuf.byteOffset, expBuf.byteLength);

  return crypto.timingSafeEqual(sigArr, expArr);
}

export async function POST(req: NextRequest) {
  assertPaystackEnv();

  const signature = req.headers.get("x-paystack-signature") ?? "";
  const rawBody = await req.text(); // raw string body

  if (!signature || !verifyPaystackSignature(signature, rawBody)) {
    return NextResponse.json(
      { ok: false, error: "invalid_signature" },
      { status: 400 },
    );
  }

  let payload: any;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json(
      { ok: false, error: "invalid_json" },
      { status: 400 },
    );
  }

  // Stage 13: just log the event for now
  console.log("Paystack webhook (TEST):", payload?.event ?? "unknown_event");

  return NextResponse.json({ ok: true });
}


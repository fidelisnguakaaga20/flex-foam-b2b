import { NextResponse } from "next/server";
import { PAYSTACK_PUBLIC_KEY } from "@lib/env";

export async function GET() {
  return NextResponse.json({ ok: true, pub: PAYSTACK_PUBLIC_KEY ? "set" : "missing" });
}


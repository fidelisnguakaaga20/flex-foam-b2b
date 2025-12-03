import { NextRequest, NextResponse } from "next/server";
import { IS_TEST_MODE } from "@lib/env";
import { loginByEmail, serializeSession, COOKIE_NAME } from "@lib/auth";
import { checkRateLimit } from "@lib/rateLimit";

export async function GET(req: NextRequest) {
  // Block completely in LIVE mode (as before)
  if (!IS_TEST_MODE) {
    return new NextResponse("Disabled in LIVE mode", { status: 403 });
  }

  // 🔐 Stage 12: Rate limit dev-login in TEST mode
  const ip =
    req.ip ??
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "local";
  const key = `dev-login:${ip}`;

  const rate = checkRateLimit(key, {
    limit: 10, // max 10 dev-logins
    windowMs: 60_000, // per 60 seconds
  });

  if (!rate.ok) {
    const retrySeconds = Math.max(1, Math.ceil(rate.retryInMs / 1000));
    return new NextResponse(
      "Too many dev login attempts, please try again shortly.",
      {
        status: 429,
        headers: {
          "Retry-After": String(retrySeconds),
        },
      }
    );
  }

  const email = req.nextUrl.searchParams.get("email")?.trim().toLowerCase();
  if (!email) return new NextResponse("Missing email", { status: 400 });

  const session = await loginByEmail(email);
  if (!session) return new NextResponse("User not found", { status: 404 });

  const res = NextResponse.redirect(new URL("/portal", req.url));
  res.cookies.set({
    name: COOKIE_NAME,
    value: serializeSession(session),
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });
  return res;
}


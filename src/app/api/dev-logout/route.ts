import { NextRequest, NextResponse } from "next/server";
import { COOKIE_NAME } from "@lib/auth";

export async function GET(req: NextRequest) {
  const res = NextResponse.redirect(new URL("/", req.url));
  res.cookies.set({
    name: COOKIE_NAME,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0
  });
  return res;
}

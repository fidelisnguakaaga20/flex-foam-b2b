import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@lib/db";
import { requireAdmin } from "@lib/permissions";

export async function GET() {
  const sess = requireAdmin();
  const products = await prisma.product.findMany({
    where: { tenantId: sess.tenantId },
    orderBy: { sku: "asc" }
  });
  return NextResponse.json(products);
}

export async function POST(req: NextRequest) {
  const sess = requireAdmin();
  const body = await req.json();

  const sku = String(body.sku || "").trim().toUpperCase();
  const name = String(body.name || "").trim();
  const density = String(body.density || "").trim();
  const dimensions = String(body.dimensions || "").trim();
  const priceNaira = Number(body.priceNaira || 0);

  if (!sku || !name || !density || !dimensions || !priceNaira) {
    return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });
  }

  const price = Math.round(priceNaira * 100);

  const product = await prisma.product.create({
    data: {
      tenantId: sess.tenantId,
      sku,
      name,
      density,
      dimensions,
      price
    }
  });

  return NextResponse.json(product, { status: 201 });
}

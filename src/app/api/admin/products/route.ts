// src/app/api/admin/products/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@lib/db";
import { requireAdmin } from "@lib/permissions";

const serialize = (p: any) => ({
  ...p,
  price: Number(p.price), // kobo for JSON
  createdAt: p.createdAt.toISOString(),
});

const isNonEmpty = (s: unknown) => typeof s === "string" && s.trim().length > 0;
const digitsOnly = (s: string) => /^\d+$/.test(s.trim());
const toPriceKobo = (v: unknown): bigint | null => {
  if (typeof v === "string") v = v.trim();
  const n =
    typeof v === "number" ? Math.trunc(v) :
    typeof v === "string" && /^\d+$/.test(v) ? Number(v) :
    NaN;
  if (!Number.isFinite(n) || n < 0 || n > 1e11) return null;
  return BigInt(n);
};

export async function GET() {
  requireAdmin();
  const rows = await prisma.product.findMany({ orderBy: { sku: "asc" } });
  return NextResponse.json(rows.map(serialize));
}

export async function POST(req: NextRequest) {
  requireAdmin();
  try {
    const b = await req.json();
    const sku = String(b.sku ?? "");
    const name = String(b.name ?? "");
    const density = String(b.density ?? "");
    const dimensions = String(b.dimensions ?? "");
    const price = toPriceKobo(b.price);

    if (!isNonEmpty(sku) || !isNonEmpty(name) || (digitsOnly(sku) && digitsOnly(name))) {
      return NextResponse.json({ error: "BAD_REQUEST", message: "Invalid sku/name." }, { status: 400 });
    }
    if (price === null) {
      return NextResponse.json({ error: "BAD_REQUEST", message: "Invalid price (kobo)." }, { status: 400 });
    }

    const t = await prisma.tenant.findFirst();
    const created = await prisma.product.create({
      data: { tenantId: t!.id, sku: sku.trim(), name: name.trim(), density: density.trim(), dimensions: dimensions.trim(), price },
    });
    return NextResponse.json(serialize(created), { status: 201 });
  } catch {
    return NextResponse.json({ error: "CREATE_FAILED" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  requireAdmin();
  try {
    const b = await req.json();
    const id = String(b.id ?? "");
    if (!id) return NextResponse.json({ error: "BAD_REQUEST", message: "id required" }, { status: 400 });

    const updates: any = {};
    if (b.sku !== undefined) {
      const sku = String(b.sku);
      if (!isNonEmpty(sku)) return NextResponse.json({ error: "BAD_REQUEST", message: "sku invalid" }, { status: 400 });
      updates.sku = sku.trim();
    }
    if (b.name !== undefined) {
      const name = String(b.name);
      if (!isNonEmpty(name)) return NextResponse.json({ error: "BAD_REQUEST", message: "name invalid" }, { status: 400 });
      updates.name = name.trim();
    }
    if (b.price !== undefined) {
      const price = toPriceKobo(b.price);
      if (price === null) return NextResponse.json({ error: "BAD_REQUEST", message: "price invalid" }, { status: 400 });
      updates.price = price;
    }
    if (b.density !== undefined) updates.density = String(b.density).trim();
    if (b.dimensions !== undefined) updates.dimensions = String(b.dimensions).trim();

    const updated = await prisma.product.update({ where: { id }, data: updates });
    return NextResponse.json(serialize(updated));
  } catch (e: any) {
    return NextResponse.json({ error: "UPDATE_FAILED" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  requireAdmin();
  try {
    const id = String(new URL(req.url).searchParams.get("id") ?? "");
    if (!id) return NextResponse.json({ error: "BAD_REQUEST", message: "id required" }, { status: 400 });
    const deleted = await prisma.product.delete({ where: { id } });
    return NextResponse.json(serialize(deleted));
  } catch (e: any) {
    if (e?.code === "P2003") return NextResponse.json({ error: "FK_CONSTRAINT" }, { status: 409 });
    return NextResponse.json({ error: "DELETE_FAILED" }, { status: 500 });
  }
}



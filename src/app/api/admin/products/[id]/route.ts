import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@lib/db";
import { requireAdmin } from "@lib/permissions";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  requireAdmin();
  try {
    const body = await req.json();
    const updated = await prisma.product.update({
      where: { id: params.id },
      data: {
        sku: body.sku,
        name: body.name,
        density: body.density,
        dimensions: body.dimensions,
        price: body.price,
      },
    });
    return NextResponse.json(updated, { status: 200 });
  } catch (err: any) {
    // Duplicate SKU protection
    if (err?.code === "P2002") {
      return NextResponse.json(
        { error: "DUPLICATE_SKU", message: "SKU already exists." },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "UPDATE_FAILED", message: "Failed to update product." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  requireAdmin();
  try {
    const deleted = await prisma.product.delete({
      where: { id: params.id },
    });
    return NextResponse.json(deleted, { status: 200 });
  } catch (err: any) {
    // FK violation → product is referenced somewhere (orders/invoices/items)
    if (err?.code === "P2003") {
      return NextResponse.json(
        {
          error: "CONFLICT",
          message:
            "Cannot delete this product because it is referenced by existing records. Remove related items first.",
        },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "DELETE_FAILED", message: "Failed to delete product." },
      { status: 500 }
    );
  }
}

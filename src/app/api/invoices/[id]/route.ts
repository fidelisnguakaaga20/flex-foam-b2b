// src/app/api/invoices/[id]/route.ts
import { NextRequest } from "next/server";
import { renderInvoicePdf, invoiceFilename } from "@lib/invoice";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const buffer = await renderInvoicePdf(params.id);
    const name = invoiceFilename(params.id);

    return new Response(buffer, {
      status: 200,
      headers: {
        "content-type": "application/pdf",
        "content-disposition": `attachment; filename="${name}"`,
        "cache-control": "no-store",
      },
    });
  } catch (e: any) {
    if (String(e?.message) === "NOT_FOUND") {
      return new Response(JSON.stringify({ error: "NOT_FOUND" }), {
        status: 404,
        headers: { "content-type": "application/json" },
      });
    }
    return new Response(JSON.stringify({ error: "INVOICE_ERROR" }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
}



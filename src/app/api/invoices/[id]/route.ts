// src/app/api/invoices/[id]/route.ts 

import { NextRequest } from "next/server";
import { renderInvoicePdf, invoiceFilename } from "@lib/invoice";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
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
  } catch (e: unknown) {
    // BEFORE: any non-"NOT_FOUND" error was swallowed and returned only as
    //   { "error": "INVOICE_ERROR" }  -> hard to see the real bug.
    //
    // AFTER: we still return "INVOICE_ERROR" to clients, BUT
    //   - we log the full error to the server console (for Vercel + local dev)
    //   - we also include a "message" field in JSON so you can see what went wrong.

    console.error("INVOICE_ERROR for invoice", params.id, e);

    // keep the NOT_FOUND behavior exactly the same
    if (e instanceof Error && e.message === "NOT_FOUND") {
      return new Response(JSON.stringify({ error: "NOT_FOUND" }), {
        status: 404,
        headers: { "content-type": "application/json" },
      });
    }

    // same 500, but now with more detail so you can debug the real issue
    return new Response(
      JSON.stringify({
        error: "INVOICE_ERROR",
        message: e instanceof Error ? e.message : String(e),
      }),
      {
        status: 500,
        headers: { "content-type": "application/json" },
      }
    );
  }
}


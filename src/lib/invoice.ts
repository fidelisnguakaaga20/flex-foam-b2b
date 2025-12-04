// src/lib/invoice.ts
import { prisma } from "@lib/db";
import { formatNGN } from "@lib/currency";
import { IS_TEST } from "@lib/env";
import PDFDocument from "pdfkit";

export async function getOrderFull(id: string) {
  return prisma.order.findUnique({
    where: { id },
    include: {
      items: { include: { product: true } },
      payment: true,
      tenant: true,
    },
  });
}

export function invoiceFilename(orderId: string) {
  return `INV-${orderId.slice(0, 8).toUpperCase()}.pdf`;
}

export async function renderInvoicePdf(orderId: string): Promise<Buffer> {
  const order = await getOrderFull(orderId);
  if (!order) throw new Error("NOT_FOUND");

  const title = IS_TEST ? "INVOICE (TEST)" : "INVOICE";
  const invoiceNo = invoiceFilename(order.id);
  const issueDate = new Date(order.createdAt);

  const doc = new PDFDocument({
    size: "A4",
    margin: 50,
    info: { Title: `${title} — ${invoiceNo}`, Author: "FLEX FOAM" },
  });

  // Collect PDF chunks and concat to a single Buffer
  const chunks: Uint8Array[] = [];
  const p = new Promise<Buffer>((res, rej) => {
    doc.on("data", (c: Buffer) => {
      // Create a Uint8Array view over the Buffer so TS is happy,
      // but the underlying bytes stay exactly the same.
      chunks.push(new Uint8Array(c.buffer, c.byteOffset, c.byteLength));
    });
    doc.on("end", () => res(Buffer.concat(chunks)));
    doc.on("error", rej);
  });

  doc.font("Helvetica");

  // Header
  doc.fontSize(18).text("FLEX FOAM", { align: "left" });
  doc.moveDown(0.3);
  doc.fontSize(10).fillColor("#444").text("Dealer/Distributor Invoice");
  doc.moveDown();

  // Watermark in TEST
  if (IS_TEST) {
    doc.save();
    doc.rotate(35, { origin: [300, 400] });
    doc.fontSize(48).fillColor("#d1d5db");
    doc.opacity(0.35);
    doc.text("TEST / NOT A TAX INVOICE", 50, 250, {
      align: "center",
      width: 500,
    });
    doc.opacity(1).restore().fillColor("black");
  }

  // Meta
  doc.fontSize(12).fillColor("black").text(title);
  doc.moveDown(0.5).fontSize(10);
  doc.text(`Invoice No: ${invoiceNo}`);
  doc.text(`Order Ref: ${order.customerRef}`);
  doc.text(`Order Status: ${order.status}`);
  if (order.payment) {
    doc.text(`Payment Ref: ${order.payment.ref}`);
    doc.text(`Payment Status: ${order.payment.status}`);
  }
  doc.text(`Issue Date: ${issueDate.toLocaleDateString()}`);
  doc.moveDown();

  // Bill To (placeholder)
  doc.fontSize(11).text("Bill To:");
  doc.fontSize(10).text("Dealer / Distributor");
  doc.text("FLEX FOAM Customer");
  doc.moveDown();

  // Items
  doc.fontSize(11).text("Items", { underline: true });
  doc.moveDown(0.5);

  const tableTop = doc.y;
  const col = (x: number) => 50 + x;
  const row = (y: number) => tableTop + y;

  doc.fontSize(10).fillColor("black");
  doc.text("SKU", col(0), row(0), { width: 100 });
  doc.text("Name", col(100), row(0), { width: 220 });
  doc.text("Qty", col(320), row(0), { width: 40, align: "right" });
  doc.text("Unit", col(360), row(0), { width: 80, align: "right" });
  doc.text("Subtotal", col(440), row(0), { width: 100, align: "right" });
  doc.moveTo(50, row(15)).lineTo(545, row(15)).strokeColor("#e5e7eb").stroke();

  let y = 25;
  for (const it of order.items) {
    const subtotal = Number(it.unitPrice) * it.qty;
    doc.fillColor("#111827");
    doc.text(it.product.sku, col(0), row(y), { width: 100 });
    doc.text(it.product.name, col(100), row(y), { width: 220 });
    doc.text(String(it.qty), col(320), row(y), { width: 40, align: "right" });
    doc.text(formatNGN(it.unitPrice), col(360), row(y), {
      width: 80,
      align: "right",
    });
    doc.text(formatNGN(subtotal), col(440), row(y), {
      width: 100,
      align: "right",
    });
    y += 18;
  }

  doc
    .moveTo(50, row(y + 4))
    .lineTo(545, row(y + 4))
    .strokeColor("#e5e7eb")
    .stroke();
  doc.fontSize(11).fillColor("black");
  doc.text("Total:", col(360), row(y + 12), { width: 80, align: "right" });
  doc.text(formatNGN(order.total), col(440), row(y + 12), {
    width: 100,
    align: "right",
  });

  doc.moveDown(2).fontSize(9).fillColor("#6b7280");
  doc.text(
    IS_TEST
      ? "Generated in TEST MODE. Not a tax invoice."
      : "Thank you for your business.",
  );

  doc.end();
  return p;
}



// // src/lib/invoice.ts
// import { prisma } from "@lib/db";
// import { formatNGN } from "@lib/currency";
// import { IS_TEST } from "@lib/env";
// import PDFDocument from "pdfkit";

// export async function getOrderFull(id: string) {
//   return prisma.order.findUnique({
//     where: { id },
//     include: {
//       items: { include: { product: true } },
//       payment: true,
//       tenant: true,
//     },
//   });
// }

// export function invoiceFilename(orderId: string) {
//   return `INV-${orderId.slice(0, 8).toUpperCase()}.pdf`;
// }

// export async function renderInvoicePdf(orderId: string): Promise<Buffer> {
//   const order = await getOrderFull(orderId);
//   if (!order) throw new Error("NOT_FOUND");

//   const title = IS_TEST ? "INVOICE (TEST)" : "INVOICE";
//   const invoiceNo = invoiceFilename(order.id);
//   const issueDate = new Date(order.createdAt);

//   const doc = new PDFDocument({
//     size: "A4",
//     margin: 50,
//     info: { Title: `${title} — ${invoiceNo}`, Author: "FLEX FOAM" },
//   });

//   const chunks: Buffer[] = [];
//   const p = new Promise<Buffer>((res, rej) => {
//     doc.on("data", (c: Buffer) => chunks.push(c));
//     doc.on("end", () => res(Buffer.concat(chunks)));
//     doc.on("error", rej);
//   });

//   doc.font("Helvetica");

//   // Header
//   doc.fontSize(18).text("FLEX FOAM", { align: "left" });
//   doc.moveDown(0.3);
//   doc.fontSize(10).fillColor("#444").text("Dealer/Distributor Invoice");
//   doc.moveDown();

//   // Watermark in TEST
//   if (IS_TEST) {
//     doc.save();
//     doc.rotate(35, { origin: [300, 400] });
//     doc.fontSize(48).fillColor("#d1d5db");
//     doc.opacity(0.35);
//     doc.text("TEST / NOT A TAX INVOICE", 50, 250, { align: "center", width: 500 });
//     doc.opacity(1).restore().fillColor("black");
//   }

//   // Meta
//   doc.fontSize(12).fillColor("black").text(title);
//   doc.moveDown(0.5).fontSize(10);
//   doc.text(`Invoice No: ${invoiceNo}`);
//   doc.text(`Order Ref: ${order.customerRef}`);
//   doc.text(`Order Status: ${order.status}`);
//   if (order.payment) {
//     doc.text(`Payment Ref: ${order.payment.ref}`);
//     doc.text(`Payment Status: ${order.payment.status}`);
//   }
//   doc.text(`Issue Date: ${issueDate.toLocaleDateString()}`);
//   doc.moveDown();

//   // Bill To (placeholder)
//   doc.fontSize(11).text("Bill To:");
//   doc.fontSize(10).text("Dealer / Distributor");
//   doc.text("FLEX FOAM Customer");
//   doc.moveDown();

//   // Items
//   doc.fontSize(11).text("Items", { underline: true });
//   doc.moveDown(0.5);

//   const tableTop = doc.y;
//   const col = (x: number) => 50 + x;
//   const row = (y: number) => tableTop + y;

//   doc.fontSize(10).fillColor("black");
//   doc.text("SKU", col(0), row(0), { width: 100 });
//   doc.text("Name", col(100), row(0), { width: 220 });
//   doc.text("Qty", col(320), row(0), { width: 40, align: "right" });
//   doc.text("Unit", col(360), row(0), { width: 80, align: "right" });
//   doc.text("Subtotal", col(440), row(0), { width: 100, align: "right" });
//   doc.moveTo(50, row(15)).lineTo(545, row(15)).strokeColor("#e5e7eb").stroke();

//   let y = 25;
//   for (const it of order.items) {
//     const subtotal = Number(it.unitPrice) * it.qty;
//     doc.fillColor("#111827");
//     doc.text(it.product.sku, col(0), row(y), { width: 100 });
//     doc.text(it.product.name, col(100), row(y), { width: 220 });
//     doc.text(String(it.qty), col(320), row(y), { width: 40, align: "right" });
//     doc.text(formatNGN(it.unitPrice), col(360), row(y), { width: 80, align: "right" });
//     doc.text(formatNGN(subtotal), col(440), row(y), { width: 100, align: "right" });
//     y += 18;
//   }

//   doc.moveTo(50, row(y + 4)).lineTo(545, row(y + 4)).strokeColor("#e5e7eb").stroke();
//   doc.fontSize(11).fillColor("black");
//   doc.text("Total:", col(360), row(y + 12), { width: 80, align: "right" });
//   doc.text(formatNGN(order.total), col(440), row(y + 12), { width: 100, align: "right" });

//   doc.moveDown(2).fontSize(9).fillColor("#6b7280");
//   doc.text(IS_TEST ? "Generated in TEST MODE. Not a tax invoice." : "Thank you for your business.");

//   doc.end();
//   return p;
// }

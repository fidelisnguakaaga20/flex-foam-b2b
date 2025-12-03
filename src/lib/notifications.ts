// src/lib/notifications.ts
import { APP_BASE_URL, WHATSAPP_NUMBER } from "@lib/env";
import { sendMail } from "@lib/mailer";
import { getOrderFull, invoiceFilename, renderInvoicePdf } from "@lib/invoice";

export function buildWhatsAppOrderLink(orderId: string, customerRef: string) {
  const invoiceUrl = `${APP_BASE_URL}/api/invoices/${encodeURIComponent(orderId)}`;
  const msg = `Hello FLEX FOAM,%0AOrder: ${customerRef}%0AInvoice: ${invoiceUrl}%0AStatus update, please.`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`;
}

/** Sends a single email with attached invoice PDF after payment success. */
export async function sendPaymentSuccessEmail(orderId: string, toEmail: string) {
  const order = await getOrderFull(orderId);
  if (!order) throw new Error("ORDER_NOT_FOUND");

  const invoiceBuf = await renderInvoicePdf(order.id);
  const fileName = invoiceFilename(order.id);
  const orderUrl = `${APP_BASE_URL}/portal/orders/${order.id}`;
  const invoiceUrl = `${APP_BASE_URL}/api/invoices/${order.id}`;
  const waLink = buildWhatsAppOrderLink(order.id, order.customerRef);

  const html = `
    <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto">
      <h2>Payment Received — ${order.customerRef}</h2>
      <p>Your payment was successful. You can track your order here:</p>
      <p><a href="${orderUrl}">${orderUrl}</a></p>
      <p>Download your invoice:</p>
      <p><a href="${invoiceUrl}">${invoiceUrl}</a></p>
      <p>Need assistance? WhatsApp us: <a href="${waLink}">${waLink}</a></p>
      <hr/>
      <small>FLEX FOAM — Dealer/Distributor Portal</small>
    </div>
  `;

  return sendMail({
    to: toEmail,
    subject: `FLEX FOAM — Payment Received (${order.customerRef})`,
    html,
    attachments: [{ filename: fileName, content: invoiceBuf, contentType: "application/pdf" }],
  });
}

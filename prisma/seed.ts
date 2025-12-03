// prisma/seed.ts
import { PrismaClient, Role, OrderStatus, PaymentStatus } from "@prisma/client";
const prisma = new PrismaClient();

const kobo = (naira: number) => BigInt(Math.round(naira * 100));

async function main() {
  // Tenant
  const tenant = await prisma.tenant.upsert({
    where: { name: "FLEX FOAM" },
    update: {},
    create: { name: "FLEX FOAM" },
  });

  // Users
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@FLEXfoam.test" },
    update: {},
    create: { email: "admin@FLEXfoam.test", name: "Factory Admin" },
  });
  const staffUser = await prisma.user.upsert({
    where: { email: "staff@FLEXfoam.test" },
    update: {},
    create: { email: "staff@FLEXfoam.test", name: "Support Staff" },
  });
  const dealerA = await prisma.user.upsert({
    where: { email: "dealer.a@FLEXfoam.test" },
    update: {},
    create: { email: "dealer.a@FLEXfoam.test", name: "Dealer Alpha" },
  });
  const dealerB = await prisma.user.upsert({
    where: { email: "dealer.b@FLEXfoam.test" },
    update: {},
    create: { email: "dealer.b@FLEXfoam.test", name: "Dealer Beta" },
  });

  // Members
  await prisma.member.upsert({
    where: { userId_tenantId: { userId: adminUser.id, tenantId: tenant.id } },
    update: { role: Role.ADMIN },
    create: { userId: adminUser.id, tenantId: tenant.id, role: Role.ADMIN },
  } as any);
  await prisma.member.upsert({
    where: { userId_tenantId: { userId: staffUser.id, tenantId: tenant.id } },
    update: { role: Role.STAFF },
    create: { userId: staffUser.id, tenantId: tenant.id, role: Role.STAFF },
  } as any);
  await prisma.member.upsert({
    where: { userId_tenantId: { userId: dealerA.id, tenantId: tenant.id } },
    update: { role: Role.DEALER },
    create: { userId: dealerA.id, tenantId: tenant.id, role: Role.DEALER },
  } as any);
  await prisma.member.upsert({
    where: { userId_tenantId: { userId: dealerB.id, tenantId: tenant.id } },
    update: { role: Role.DEALER },
    create: { userId: dealerB.id, tenantId: tenant.id, role: Role.DEALER },
  } as any);

  // Products
  const products = [
    { sku: "SHEET-25", name: "Sheet Foam 25kg/m³", density: "25kg/m³", dimensions: '6x3x8"', price: kobo(35000) },
    { sku: "SHEET-30", name: "Sheet Foam 30kg/m³", density: "30kg/m³", dimensions: '6x3x8"', price: kobo(41000) },
    { sku: "REBOND-80", name: "Rebond 80kg/m³", density: "80kg/m³", dimensions: '6x3x8"', price: kobo(72000) },
    { sku: "MEM-55",   name: "Memory 55kg/m³",     density: "55kg/m³", dimensions: '6x3x8"', price: kobo(89000) },
    { sku: "PACK-INS", name: "Packaging Insert Foam", density: "Varies", dimensions: "Custom", price: kobo(15000) },
    { sku: "AUTO-RES", name: "Automotive Resilience Foam", density: "High Resilience", dimensions: "Custom", price: kobo(12500) },
  ];

  for (const p of products) {
    await prisma.product.upsert({
      where: { sku: p.sku },
      update: { ...p, tenantId: tenant.id },
      create: { ...p, tenantId: tenant.id },
    });
  }

  const p1 = await prisma.product.findUnique({ where: { sku: "SHEET-25" } });
  const p2 = await prisma.product.findUnique({ where: { sku: "REBOND-80" } });

  if (p1 && p2) {
    const five = 5n, three = 3n, two = 2n;

    // CREATED
    const o1 = await prisma.order.upsert({
      where: { id: (await prisma.order.findFirst({ where: { customerRef: "DEALER-ALPHA-001" } }))?.id ?? "___none___" },
      update: {},
      create: {
        tenantId: tenant.id,
        customerRef: "DEALER-ALPHA-001",
        status: OrderStatus.CREATED,
        total: 0n,
      },
    });
    await prisma.orderItem.create({
      data: { orderId: o1.id, productId: p1.id, qty: 10, unitPrice: p1.price },
    }).catch(() => {});

    // PAID + Payment
    const existingPaid = await prisma.order.findFirst({ where: { customerRef: "DEALER-ALPHA-002" } });
    const o2 = existingPaid ?? await prisma.order.create({
      data: {
        tenantId: tenant.id,
        customerRef: "DEALER-ALPHA-002",
        status: OrderStatus.PAID,
        total: p2.price * five,
      },
    });
    await prisma.orderItem.create({
      data: { orderId: o2.id, productId: p2.id, qty: 5, unitPrice: p2.price },
    }).catch(() => {});
    await prisma.payment.upsert({
      where: { orderId: o2.id },
      update: {
        provider: "sandbox",
        ref: `TESTPAY-${o2.id.slice(0,6)}`,
        amount: p2.price * five,
        status: PaymentStatus.SUCCESS,
      },
      create: {
        orderId: o2.id,
        provider: "sandbox",
        ref: `TESTPAY-${Date.now()}`,
        amount: p2.price * five,
        status: PaymentStatus.SUCCESS,
      },
    });

    // Other demo orders
    const ensureOrder = async (customerRef: string, status: OrderStatus, total: bigint) => {
      const found = await prisma.order.findFirst({ where: { customerRef } });
      return found ?? prisma.order.create({ data: { tenantId: tenant.id, customerRef, status, total } });
    };
    await ensureOrder("DEALER-BETA-003", OrderStatus.IN_PRODUCTION, p1.price * three);
    await ensureOrder("DEALER-BETA-004", OrderStatus.DISPATCHED,    p1.price * two);
    await ensureOrder("DEALER-BETA-005", OrderStatus.DELIVERED,     p2.price * 1n);
  }

  console.log("Seed complete (idempotent).");
}

main().finally(() => prisma.$disconnect());



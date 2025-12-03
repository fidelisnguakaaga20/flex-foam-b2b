// src/app/portal/cart/page.tsx
import Link from "next/link";
import CartTable from "@components/cart/CartTable";
import PlaceOrderButton from "@components/cart/PlaceOrderButton";

export const dynamic = "force-dynamic";

export default async function CartPage() {
  return (
    <section className="p-4 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl sm:text-3xl font-bold">Your Cart</h1>
        {/* Easy navigation back to products */}
        <Link
          href="/portal/products"
          className="text-sm font-medium text-blue-400 hover:underline underline-offset-4"
        >
          Continue shopping →
        </Link>
      </div>

      <CartTable />

      <div className="flex justify-end">
        <PlaceOrderButton />
      </div>
    </section>
  );
}

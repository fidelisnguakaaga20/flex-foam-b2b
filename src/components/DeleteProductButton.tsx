// src/components/DeleteProductButton.tsx
"use client";

import { useRouter } from "next/navigation";

export default function DeleteProductButton({ id }: { id: string }) {
  const r = useRouter();
  async function del() {
    const ok = confirm("Delete this product?");
    if (!ok) return;
    const res = await fetch(`/api/admin/products?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    if (res.status === 409) {
      alert("Cannot delete: product referenced by orders.");
      return;
    }
    if (!res.ok) {
      alert("Delete failed");
      return;
    }
    r.refresh();
  }
  return (
    <button onClick={del} className="px-2 py-1 border rounded hover:bg-red-600/20">
      Delete
    </button>
  );
}



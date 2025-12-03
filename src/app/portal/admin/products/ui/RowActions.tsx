"use client";

type Props = {
  id: string;
  editHref: string;
  label: string;
};

export default function RowActions({ id, editHref, label }: Props) {
  async function onDelete() {
    if (!confirm(`Delete ${label}?`)) return;
    const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    if (res.ok) {
      // Soft refresh
      window.location.reload();
    } else {
      const t = await res.text();
      alert(`Delete failed: ${t}`);
    }
  }

  return (
    <div className="flex gap-2">
      <a className="px-3 py-1.5 rounded-xl border" href={editHref}>Edit</a>
      <button
        type="button"
        onClick={onDelete}
        className="px-3 py-1.5 rounded-xl border border-red-600 text-red-600"
      >
        Delete
      </button>
    </div>
  );
}

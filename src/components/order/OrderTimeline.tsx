// src/components/order/OrderTimeline.tsx
const steps = ["CREATED", "PAID", "IN_PRODUCTION", "DISPATCHED", "DELIVERED"] as const;

export default function OrderTimeline({ status }: { status: string }) {
  const idx = steps.indexOf(status as any);
  return (
    <ol className="flex flex-wrap gap-2 text-xs">
      {steps.map((s, i) => (
        <li key={s} className={`px-2 py-1 rounded border ${i <= idx ? "bg-green-800 border-green-600" : "bg-gray-800 border-gray-700"}`}>
          {s}
        </li>
      ))}
    </ol>
  );
}


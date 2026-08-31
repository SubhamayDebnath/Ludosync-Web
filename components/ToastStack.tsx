"use client";

export interface ToastItem {
  id: string;
  text: string;
  tone?: "danger" | "muted";
}

export function ToastStack({ toasts }: { toasts: ToastItem[] }) {
  if (toasts.length === 0) return null;
  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-50 flex flex-col items-center gap-2 px-4">
      {toasts.map((t) => (
        <div
          key={t.id}
          role="status"
          className={`pointer-events-auto rounded-full border px-4 py-2 text-xs font-medium shadow-lg backdrop-blur-md animate-toast-in ${
            t.tone === "danger"
              ? "border-danger/60 bg-danger/15 text-danger"
              : "border-surface2 bg-surface/95 text-ink"
          }`}
        >
          {t.text}
        </div>
      ))}
    </div>
  );
}

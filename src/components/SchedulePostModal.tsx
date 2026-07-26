"use client";

import { useState } from "react";

interface FacebookPage {
  id: number;
  pageName: string;
}

export default function SchedulePostModal({
  pages,
  onClose,
  onCreated
}: {
  pages: FacebookPage[];
  onClose: () => void;
  onCreated: () => void;
}) {
  const [pageId, setPageId] = useState<number | "">(pages[0]?.id ?? "");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [scheduledFor, setScheduledFor] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!pageId) {
      setError("اختر صفحة أولاً");
      return;
    }
    setSubmitting(true);
    setError(null);

    const res = await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pageId,
        content,
        imageUrl: imageUrl || null,
        scheduledFor: new Date(scheduledFor).toISOString()
      })
    });

    setSubmitting(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "تعذّرت الجدولة");
      return;
    }

    onCreated();
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg">جدولة منشور جديد</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <select
            required
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            value={pageId}
            onChange={(e) => setPageId(Number(e.target.value))}
          >
            <option value="">اختر صفحة</option>
            {pages.map((p) => (
              <option key={p.id} value={p.id}>
                {p.pageName}
              </option>
            ))}
          </select>

          <textarea
            required
            placeholder="نص المنشور"
            rows={4}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />

          <input
            placeholder="رابط صورة (اختياري)"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
          />

          <input
            type="datetime-local"
            required
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            value={scheduledFor}
            onChange={(e) => setScheduledFor(e.target.value)}
          />

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-brand-600 hover:bg-brand-700 text-white rounded-lg py-2 text-sm disabled:opacity-60"
          >
            {submitting ? "جاري الجدولة..." : "جدولة المنشور"}
          </button>
        </form>
      </div>
    </div>
  );
}

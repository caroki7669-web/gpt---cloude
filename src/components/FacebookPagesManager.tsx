"use client";

import { useEffect, useState } from "react";

interface FacebookPage {
  id: number;
  pageId: string;
  pageName: string;
  isActive: boolean;
  createdAt: string;
}

export default function FacebookPagesManager() {
  const [pages, setPages] = useState<FacebookPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ pageId: "", pageName: "", pageAccessToken: "" });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function loadPages() {
    setLoading(true);
    const res = await fetch("/api/pages");
    if (res.ok) setPages(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    loadPages();
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const res = await fetch("/api/pages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });

    setSubmitting(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "تعذّرت الإضافة");
      return;
    }

    setForm({ pageId: "", pageName: "", pageAccessToken: "" });
    setShowForm(false);
    loadPages();
  }

  async function handleDelete(id: number) {
    if (!confirm("متأكد من حذف الصفحة؟")) return;
    await fetch(`/api/pages/${id}`, { method: "DELETE" });
    loadPages();
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-lg">صفحات فيسبوك</h2>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="text-sm bg-brand-600 hover:bg-brand-700 text-white rounded-lg px-3 py-1.5"
        >
          {showForm ? "إلغاء" : "+ إضافة صفحة"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="mb-5 space-y-3 border-b border-slate-100 pb-5">
          <input
            required
            placeholder="Page ID"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            value={form.pageId}
            onChange={(e) => setForm({ ...form, pageId: e.target.value })}
          />
          <input
            required
            placeholder="اسم الصفحة"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            value={form.pageName}
            onChange={(e) => setForm({ ...form, pageName: e.target.value })}
          />
          <input
            required
            placeholder="Page Access Token"
            type="password"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            value={form.pageAccessToken}
            onChange={(e) => setForm({ ...form, pageAccessToken: e.target.value })}
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="bg-brand-600 hover:bg-brand-700 text-white rounded-lg px-4 py-2 text-sm disabled:opacity-60"
          >
            {submitting ? "جاري الحفظ..." : "حفظ"}
          </button>
        </form>
      )}

      {loading ? (
        <p className="text-sm text-slate-500">جاري التحميل...</p>
      ) : pages.length === 0 ? (
        <p className="text-sm text-slate-500">لا توجد صفحات مضافة بعد.</p>
      ) : (
        <ul className="space-y-2">
          {pages.map((p) => (
            <li
              key={p.id}
              className="flex items-center justify-between rounded-lg border border-slate-100 px-4 py-3"
            >
              <div>
                <p className="font-medium text-sm">{p.pageName}</p>
                <p className="text-xs text-slate-400">Page ID: {p.pageId}</p>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    p.isActive ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {p.isActive ? "نشطة" : "متوقفة"}
                </span>
                <button
                  onClick={() => handleDelete(p.id)}
                  className="text-xs text-red-600 hover:underline"
                >
                  حذف
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

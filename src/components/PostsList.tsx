"use client";

import { useEffect, useState } from "react";

interface Post {
  id: number;
  content: string;
  imageUrl: string | null;
  status: "scheduled" | "published" | "failed";
  scheduledFor: string;
  errorMessage: string | null;
}

const statusLabel: Record<Post["status"], string> = {
  scheduled: "مجدول",
  published: "تم النشر",
  failed: "فشل"
};

const statusColor: Record<Post["status"], string> = {
  scheduled: "bg-amber-100 text-amber-700",
  published: "bg-green-100 text-green-700",
  failed: "bg-red-100 text-red-700"
};

export default function PostsList({ refreshKey }: { refreshKey: number }) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/posts");
    if (res.ok) setPosts(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, [refreshKey]);

  async function handleDelete(id: number) {
    await fetch(`/api/posts/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
      <h2 className="font-bold text-lg mb-4">المنشورات</h2>

      {loading ? (
        <p className="text-sm text-slate-500">جاري التحميل...</p>
      ) : posts.length === 0 ? (
        <p className="text-sm text-slate-500">لا توجد منشورات مجدولة بعد.</p>
      ) : (
        <ul className="space-y-3">
          {posts.map((p) => (
            <li key={p.id} className="border border-slate-100 rounded-lg p-4">
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm flex-1">{p.content}</p>
                <span className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${statusColor[p.status]}`}>
                  {statusLabel[p.status]}
                </span>
              </div>
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-slate-400">
                  موعد النشر: {new Date(p.scheduledFor).toLocaleString("ar-EG")}
                </p>
                <button onClick={() => handleDelete(p.id)} className="text-xs text-red-600 hover:underline">
                  حذف
                </button>
              </div>
              {p.errorMessage && (
                <p className="text-xs text-red-500 mt-2">خطأ: {p.errorMessage}</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

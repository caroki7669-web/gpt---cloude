"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import FacebookPagesManager from "@/components/FacebookPagesManager";
import PostsList from "@/components/PostsList";
import SchedulePostModal from "@/components/SchedulePostModal";

interface FacebookPage {
  id: number;
  pageName: string;
}

export default function DashboardClient() {
  const router = useRouter();
  const [pages, setPages] = useState<FacebookPage[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  async function loadPages() {
    const res = await fetch("/api/pages");
    if (res.ok) setPages(await res.json());
  }

  useEffect(() => {
    loadPages();
  }, [refreshKey]);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="font-bold">لوحة تحكم النشر</h1>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowModal(true)}
              disabled={pages.length === 0}
              className="text-sm bg-brand-600 hover:bg-brand-700 disabled:opacity-40 text-white rounded-lg px-4 py-2"
            >
              + جدولة منشور
            </button>
            <button onClick={handleLogout} className="text-sm text-slate-500 hover:text-slate-700">
              خروج
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        <FacebookPagesManager />
        <PostsList refreshKey={refreshKey} />
      </main>

      {showModal && (
        <SchedulePostModal
          pages={pages}
          onClose={() => setShowModal(false)}
          onCreated={() => setRefreshKey((k) => k + 1)}
        />
      )}
    </div>
  );
}

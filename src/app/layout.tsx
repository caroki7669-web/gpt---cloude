import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "مدير صفحات فيسبوك",
  description: "منصة إدارة ونشر المحتوى لصفحات فيسبوك"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  );
}

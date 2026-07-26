import { redirect } from "next/navigation";
import { getSessionUserId } from "@/lib/auth";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const userId = await getSessionUserId();
  if (!userId) redirect("/login");

  return <DashboardClient />;
}

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { facebookPages } from "@/lib/schema";
import { getSessionUserId } from "@/lib/auth";
import { eq, and } from "drizzle-orm";

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = Number(params.id);
  await db
    .delete(facebookPages)
    .where(and(eq(facebookPages.id, id), eq(facebookPages.userId, userId)));

  return NextResponse.json({ ok: true });
}

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { posts } from "@/lib/schema";
import { getSessionUserId } from "@/lib/auth";
import { eq, and } from "drizzle-orm";

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = Number(params.id);
  await db.delete(posts).where(and(eq(posts.id, id), eq(posts.userId, userId)));

  return NextResponse.json({ ok: true });
}

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { posts, facebookPages } from "@/lib/schema";
import { getSessionUserId } from "@/lib/auth";
import { eq, and, desc } from "drizzle-orm";

const createSchema = z.object({
  pageId: z.number(),
  content: z.string().min(1),
  imageUrl: z.string().url().optional().nullable(),
  scheduledFor: z.string() // ISO date string
});

// Business rule from the spec: max 4 posts per day per page.
const MAX_POSTS_PER_DAY = 4;

export async function GET() {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rows = await db.query.posts.findMany({
    where: eq(posts.userId, userId),
    orderBy: [desc(posts.scheduledFor)]
  });
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const { pageId, content, imageUrl, scheduledFor } = parsed.data;

  const page = await db.query.facebookPages.findFirst({
    where: and(eq(facebookPages.id, pageId), eq(facebookPages.userId, userId))
  });
  if (!page) return NextResponse.json({ error: "Page not found" }, { status: 404 });

  const scheduledDate = new Date(scheduledFor);
  const dayStart = new Date(scheduledDate);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(dayStart);
  dayEnd.setDate(dayEnd.getDate() + 1);

  const sameDayPosts = await db.query.posts.findMany({
    where: and(eq(posts.pageId, pageId), eq(posts.userId, userId))
  });
  const countThatDay = sameDayPosts.filter(
    (p) => p.scheduledFor >= dayStart && p.scheduledFor < dayEnd
  ).length;

  if (countThatDay >= MAX_POSTS_PER_DAY) {
    return NextResponse.json(
      { error: `Daily limit of ${MAX_POSTS_PER_DAY} posts reached for this page` },
      { status: 429 }
    );
  }

  const [row] = await db
    .insert(posts)
    .values({
      userId,
      pageId,
      content,
      imageUrl: imageUrl ?? null,
      scheduledFor: scheduledDate
    })
    .returning();

  return NextResponse.json(row, { status: 201 });
}

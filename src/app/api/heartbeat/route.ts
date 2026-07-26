import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { posts, facebookPages } from "@/lib/schema";
import { decryptToken } from "@/lib/crypto";
import { publishPhotoPost, publishTextPost } from "@/lib/facebook";
import { eq, and, lte } from "drizzle-orm";

// This endpoint is called on a schedule (see .github/workflows/heartbeat.yml,
// every 6 hours) rather than running a long-lived cron process, matching the
// existing GitHub Actions pattern used elsewhere in this account's projects.
//
// Auth: a shared secret header, NOT a user session, since this is called
// server-to-server by GitHub Actions.

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-heartbeat-secret");
  if (!secret || secret !== process.env.HEARTBEAT_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const due = await db.query.posts.findMany({
    where: and(eq(posts.status, "scheduled"), lte(posts.scheduledFor, new Date()))
  });

  const results = [];

  for (const post of due) {
    const page = await db.query.facebookPages.findFirst({
      where: eq(facebookPages.id, post.pageId)
    });

    if (!page || !page.isActive) {
      await db
        .update(posts)
        .set({ status: "failed", errorMessage: "Page not found or inactive" })
        .where(eq(posts.id, post.id));
      results.push({ postId: post.id, ok: false, error: "Page not found or inactive" });
      continue;
    }

    const token = decryptToken(page.pageAccessToken);
    const result = post.imageUrl
      ? await publishPhotoPost(page.pageId, token, post.content, post.imageUrl)
      : await publishTextPost(page.pageId, token, post.content);

    if (result.success) {
      await db
        .update(posts)
        .set({ status: "published", publishedAt: new Date(), facebookPostId: result.postId })
        .where(eq(posts.id, post.id));
    } else {
      // Common cause here: Meta's Business Verification requirement for
      // Advanced Access to pages_manage_posts. We surface the raw error
      // instead of masking it so it's visible in the dashboard.
      await db
        .update(posts)
        .set({ status: "failed", errorMessage: result.error })
        .where(eq(posts.id, post.id));
    }

    results.push({ postId: post.id, ok: result.success, error: result.error });
  }

  return NextResponse.json({ processed: results.length, results });
}

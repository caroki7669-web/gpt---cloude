import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { facebookPages } from "@/lib/schema";
import { getSessionUserId } from "@/lib/auth";
import { encryptToken, decryptToken } from "@/lib/crypto";
import { eq, and } from "drizzle-orm";

const createSchema = z.object({
  pageId: z.string().min(1),
  pageName: z.string().min(1),
  pageAccessToken: z.string().min(1)
});

export async function GET() {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rows = await db.query.facebookPages.findMany({
    where: eq(facebookPages.userId, userId)
  });

  // Never return the raw token to the client.
  const safe = rows.map(({ pageAccessToken, ...rest }) => rest);
  return NextResponse.json(safe);
}

export async function POST(req: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const { pageId, pageName, pageAccessToken } = parsed.data;

  const [row] = await db
    .insert(facebookPages)
    .values({
      userId,
      pageId,
      pageName,
      pageAccessToken: encryptToken(pageAccessToken)
    })
    .returning();

  const { pageAccessToken: _omit, ...safe } = row;
  return NextResponse.json(safe, { status: 201 });
}

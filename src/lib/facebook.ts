// Thin wrapper around the Facebook Graph API for publishing to a Page.
//
// IMPORTANT LIMITATION (please read before wiring this into production use):
// Publishing photo/video posts to a Page via the Graph API requires the
// `pages_manage_posts` permission at "Advanced Access", which Meta only
// grants after the app (and often the business) completes Business
// Verification. Text-only posts to a Page can work at Standard/Development
// access for admins/testers of the app, but video posting at scale will be
// blocked until verification is approved. This module does not attempt to
// bypass that - it will simply return the error Meta sends back so it can
// be surfaced to the user (see /api/heartbeat).

const GRAPH_API_VERSION = "v20.0";

interface PublishResult {
  success: boolean;
  postId?: string;
  error?: string;
}

export async function publishTextPost(
  pageId: string,
  pageAccessToken: string,
  message: string
): Promise<PublishResult> {
  const url = `https://graph.facebook.com/${GRAPH_API_VERSION}/${pageId}/feed`;
  const body = new URLSearchParams({ message, access_token: pageAccessToken });

  const res = await fetch(url, { method: "POST", body });
  const data = await res.json();

  if (!res.ok || data.error) {
    return { success: false, error: data.error?.message ?? "Unknown Facebook API error" };
  }
  return { success: true, postId: data.id };
}

export async function publishPhotoPost(
  pageId: string,
  pageAccessToken: string,
  message: string,
  imageUrl: string
): Promise<PublishResult> {
  const url = `https://graph.facebook.com/${GRAPH_API_VERSION}/${pageId}/photos`;
  const body = new URLSearchParams({
    url: imageUrl,
    caption: message,
    access_token: pageAccessToken
  });

  const res = await fetch(url, { method: "POST", body });
  const data = await res.json();

  if (!res.ok || data.error) {
    return { success: false, error: data.error?.message ?? "Unknown Facebook API error" };
  }
  return { success: true, postId: data.post_id ?? data.id };
}

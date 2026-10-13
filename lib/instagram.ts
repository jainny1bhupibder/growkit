const G = "https://graph.instagram.com/v23.0";
async function j(r: Response) {
  const d = await r.json();
  if (!r.ok) throw new Error(`Instagram API ${r.status}: ${JSON.stringify(d)}`);
  return d;
}
export const redirectUri = () => process.env.APP_URL + "/api/instagram/callback";
export function authUrl(state: string) {
  return "https://www.instagram.com/oauth/authorize?" + new URLSearchParams({
    client_id: process.env.IG_APP_ID!, redirect_uri: redirectUri(), response_type: "code", state,
    scope: "instagram_business_basic,instagram_business_manage_comments,instagram_business_manage_messages",
  });
}
export async function exchangeCode(code: string) {
  const r = await fetch("https://api.instagram.com/oauth/access_token", {
    method: "POST",
    body: new URLSearchParams({ client_id: process.env.IG_APP_ID!, client_secret: process.env.IG_APP_SECRET!, grant_type: "authorization_code", redirect_uri: redirectUri(), code }),
  });
  return j(r) as Promise<{ access_token: string }>;
}
export async function longLived(token: string) {
  const q = new URLSearchParams({ grant_type: "ig_exchange_token", client_secret: process.env.IG_APP_SECRET!, access_token: token });
  return j(await fetch(`https://graph.instagram.com/access_token?${q}`)) as Promise<{ access_token: string; expires_in: number }>;
}
export async function refreshToken(token: string) {
  const q = new URLSearchParams({ grant_type: "ig_refresh_token", access_token: token });
  return j(await fetch(`https://graph.instagram.com/refresh_access_token?${q}`)) as Promise<{ access_token: string; expires_in: number }>;
}
export async function getProfile(token: string) {
  return j(await fetch(`${G}/me?fields=user_id,username&access_token=${token}`)) as Promise<{ id: string; user_id?: string; username: string }>;
}
export async function subscribe(igId: string, token: string) {
  return j(await fetch(`${G}/${igId}/subscribed_apps?subscribed_fields=comments&access_token=${token}`, { method: "POST" }));
}
// Private reply: sends a DM to the person who commented (allowed once per comment, within 7 days).
export async function privateReply(igId: string, token: string, commentId: string, text: string) {
  return j(await fetch(`${G}/${igId}/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ recipient: { comment_id: commentId }, message: { text } }),
  }));
}
export async function publicReply(token: string, commentId: string, text: string) {
  return j(await fetch(`${G}/${commentId}/replies`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ message: text }),
  }));
}
export async function listMedia(igId: string, token: string) {
  const r = await j(await fetch(`${G}/${igId}/media?fields=id,caption,permalink&limit=5&access_token=${token}`));
  return (r.data ?? []) as { id: string; caption?: string; permalink?: string }[];
}
export async function listComments(mediaId: string, token: string) {
  const r = await j(await fetch(`${G}/${mediaId}/comments?fields=id,text,username,timestamp&limit=25&access_token=${token}`));
  return (r.data ?? []) as { id: string; text: string; username: string; timestamp: string }[];
}
export async function hideComment(token: string, commentId: string) {
  return j(await fetch(`${G}/${commentId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ hide: true }),
  }));
}

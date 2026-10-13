import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";
export const dynamic = "force-dynamic";
const btn = { background: "#FF5C4D", color: "#2A0D08", border: 0, borderRadius: 10, padding: "12px 18px", fontWeight: 700, fontSize: 16, cursor: "pointer", textDecoration: "none", display: "inline-block" } as const;
const inp = { width: "100%", padding: 10, margin: "4px 0 10px", borderRadius: 8, border: "1px solid #ccd", fontSize: 16, boxSizing: "border-box" } as const;
const card = { background: "#fff", border: "1px solid #E2E6F0", borderRadius: 14, padding: 16, marginBottom: 12 } as const;

export default async function Home() {
  const user = await requireUser();
  if (!user) return (
    <main style={{ maxWidth: 560, margin: "0 auto", padding: 24 }}>
      <h1 style={{ fontSize: 40 }}>Grow your Instagram without risking your account.</h1>
      <p>Comment-to-DM automation, AI reply drafts, and more. Uses only features Instagram allows.</p>
      <a href="/api/instagram/connect" style={btn}>Connect Instagram</a>
      <p><a href="/demo.html">See the product demo</a> · <a href="/privacy">Privacy</a></p>
    </main>);
  const autos = await db.automation.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } });
  return (
    <main style={{ maxWidth: 640, margin: "0 auto", padding: 24 }}>
      <h1>@{user.username}</h1>
      <p>Plan: <b>{user.plan}</b> {user.plan === "FREE" && <form action="/api/stripe/checkout" method="post" style={{ display: "inline" }}><button style={{ ...btn, padding: "6px 12px", fontSize: 14 }}>Upgrade to Pro (7-day trial)</button></form>}</p>
      <p><a href="/inbox" style={{ ...btn, background: "#101528", color: "#fff" }}>Open inbox (AI replies)</a></p>
      <h2>Comment-to-DM automations</h2>
      {autos.map((a) => (
        <div key={a.id} style={card}>
          <b>{a.keyword}</b> {a.mediaId ? `on post ${a.mediaId}` : "on any post"} · {a.sent} DMs sent · {a.active ? "on" : "off"}
          <p style={{ margin: "6px 0" }}>{a.dm}</p>
          <form action="/api/automations" method="post" style={{ display: "inline" }}><input type="hidden" name="_method" value="PATCH" /><input type="hidden" name="id" value={a.id} /><input type="hidden" name="active" value={String(!a.active)} /><button>{a.active ? "Turn off" : "Turn on"}</button></form>{" "}
          <form action="/api/automations" method="post" style={{ display: "inline" }}><input type="hidden" name="_method" value="DELETE" /><input type="hidden" name="id" value={a.id} /><button>Delete</button></form>
        </div>))}
      <form action="/api/automations" method="post" style={card}>
        <h3>New automation</h3>
        <label>Keyword<input name="keyword" required placeholder="GUIDE" style={inp} /></label>
        <label>DM to send<textarea name="dm" required maxLength={900} placeholder="Here's your guide: https://..." style={inp} /></label>
        <label>Public reply (optional)<input name="publicReply" placeholder="Sent! Check your DMs" style={inp} /></label>
        <label>Post ID (optional, blank = any post)<input name="mediaId" style={inp} /></label>
        <button style={btn}>Add automation</button>
      </form>
      <form action="/api/account" method="post"><button>Disconnect and delete my data</button></form>
    </main>);
}

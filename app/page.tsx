import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";
import Shell from "@/components/Shell";
export const dynamic = "force-dynamic";

export default async function Home() {
  const user = await requireUser();

  if (!user) {
    return (
      <div className="welcome">
        <div className="logo"><i /> GrowKit</div>
        <div className="hero">
          <h1>Grow your Instagram without risking your account.</h1>
          <p>Turn comments into leads and reply faster in your own voice. GrowKit only uses features Instagram allows.</p>
          <div><a href="/api/instagram/connect" className="btn">Connect Instagram</a></div>
          <div className="trust"><span>7-day free trial</span><span>No passwords stored</span><span>Cancel anytime</span></div>
          <div className="trust"><a href="/demo.html">See the product demo</a><a href="/privacy">Privacy</a></div>
        </div>
        <div className="feats">
          <div className="card"><h3>Comment-to-DM</h3><p className="mute">Followers comment a keyword and get your link in their DMs.</p></div>
          <div className="card"><h3>AI reply inbox</h3><p className="mute">Drafts replies in your voice. You approve each one.</p></div>
          <div className="card"><h3>Safe by design</h3><p className="mute">No auto-liking, following, or mass commenting.</p></div>
        </div>
      </div>
    );
  }

  const autos = await db.automation.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } });
  const isFree = user.plan === "FREE";
  const totalDms = autos.reduce((n, a) => n + a.sent, 0);
  const activeCount = autos.filter((a) => a.active).length;

  return (
    <Shell title="Today" badge={isFree ? "Free plan" : "Pro"} username={`@${user.username}`}>
      <div className="grid">
        <div className="card stat"><b>{activeCount}</b><span>Active automations</span></div>
        <div className="card stat"><b>{totalDms}</b><span>DMs sent</span></div>
        <div className="card stat"><b>{autos.length}</b><span>Total automations</span></div>
        <div className="card stat"><b>{user.plan}</b><span>Plan</span></div>
      </div>

      {isFree && (
        <div className="card" style={{ borderColor: "var(--acc)" }}>
          <div className="between">
            <div>
              <h3>Free plan: {Math.min(autos.length, 1)} of 1 automation used</h3>
              <p className="mute" style={{ margin: "4px 0 0" }}>Pro gives you unlimited automations and AI reply drafts.</p>
            </div>
            <form action="/api/stripe/checkout" method="post"><button className="btn sm">Upgrade to Pro (7-day trial)</button></form>
          </div>
        </div>
      )}

      <div className="card between">
        <div>
          <h3>Inbox</h3>
          <p className="mute" style={{ margin: "4px 0 0" }}>Review comments and approve replies.</p>
        </div>
        <a href="/inbox" className="btn sm">Open inbox</a>
      </div>

      <h2 style={{ margin: "22px 0 4px" }}>Comment-to-DM automations</h2>
      <p className="sub">Followers comment a keyword. They get your DM.</p>

      <div className="two">
        <div>
          {autos.length === 0 && (
            <div className="card">
              <h3>No automations yet</h3>
              <p className="mute" style={{ margin: "4px 0 0" }}>Add your first keyword and DM using the form.</p>
            </div>
          )}
          {autos.map((a) => (
            <div key={a.id} className="card">
              <div className="between">
                <div>
                  <h3>{a.mediaId ? `Post ${a.mediaId}` : "Any post"}</h3>
                  <span className="mute">Comment <span className="kw">{a.keyword}</span> &middot; {a.sent} DMs sent &middot; {a.active ? "On" : "Off"}</span>
                </div>
              </div>
              <div className="bubble">{a.dm}</div>
              <div className="row">
                <form action="/api/automations" method="post">
                  <input type="hidden" name="_method" value="PATCH" />
                  <input type="hidden" name="id" value={a.id} />
                  <input type="hidden" name="active" value={String(!a.active)} />
                  <button className="btn sm alt">{a.active ? "Turn off" : "Turn on"}</button>
                </form>
                <form action="/api/automations" method="post">
                  <input type="hidden" name="_method" value="DELETE" />
                  <input type="hidden" name="id" value={a.id} />
                  <button className="btn sm danger">Delete</button>
                </form>
              </div>
            </div>
          ))}
        </div>

        <form action="/api/automations" method="post" className="card">
          <h3>New automation</h3>
          <label>Keyword<input name="keyword" required placeholder="GUIDE" /></label>
          <label>DM to send<textarea name="dm" required maxLength={900} placeholder="Here's your guide: https://..." /></label>
          <label>Public reply (optional)<input name="publicReply" placeholder="Sent! Check your DMs" /></label>
          <label>Post ID (optional, blank = any post)<input name="mediaId" /></label>
          <div className="row"><button className="btn sm">Add automation</button></div>
        </form>
      </div>

      <form action="/api/account" method="post" style={{ marginTop: 24 }}>
        <button className="btn sm danger">Disconnect and delete my data</button>
      </form>
    </Shell>
  );
}

"use client";
import { useEffect, useState } from "react";
import Shell from "@/components/Shell";

type C = { id: string; text: string; username: string; timestamp: string; post: string; permalink?: string };

export default function Inbox() {
  const [list, setList] = useState<C[] | null>(null);
  const [plan, setPlan] = useState("FREE");
  const [voice, setVoice] = useState("");
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string>("");
  const [msg, setMsg] = useState("");

  async function load() {
    const r = await fetch("/api/inbox");
    if (r.status === 401) { location.href = "/"; return; }
    const d = await r.json();
    if (!r.ok) { setMsg(d.error); setList([]); return; }
    setList(d.comments); setPlan(d.plan); setVoice(d.voice);
  }
  useEffect(() => { load(); }, []);

  async function draft(c: C) {
    setBusy(c.id); setMsg("");
    const r = await fetch("/api/ai/reply", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ comment: c.text }) });
    const d = await r.json();
    if (r.ok) setDrafts({ ...drafts, [c.id]: d.draft }); else setMsg(d.error);
    setBusy("");
  }
  async function act(action: string, c: C) {
    setBusy(c.id); setMsg("");
    const r = await fetch("/api/inbox/action", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action, commentId: c.id, text: drafts[c.id] }) });
    const d = await r.json();
    if (r.ok) setList((l) => (l || []).filter((x) => x.id !== c.id)); else setMsg(d.error);
    setBusy("");
  }
  async function saveVoice() {
    await fetch("/api/voice", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ voice }) });
    setMsg("Voice saved.");
  }

  return (
    <Shell title="Inbox" badge={plan === "PRO" ? "Pro" : "Free plan"}>
      <p className="sub">Replies are drafted by AI in your voice. Nothing posts until you tap Send reply.</p>

      <div className="card">
        <label htmlFor="voice" style={{ marginTop: 0 }}>Your voice (how you usually reply)</label>
        <textarea id="voice" value={voice} onChange={(e) => setVoice(e.target.value)} maxLength={500} placeholder="Warm, playful, short. Uses 1-2 emojis. Signs off with 'xo'." />
        <div className="row"><button className="btn sm alt" onClick={saveVoice}>Save voice</button></div>
      </div>

      {msg && <div className="card" role="status"><b>{msg}</b></div>}

      {plan !== "PRO" && (
        <div className="card" style={{ borderColor: "var(--acc)" }}>
          <h3>AI drafts are a Pro feature</h3>
          <p className="mute" style={{ margin: "4px 0 0" }}>You can still write replies yourself below.</p>
        </div>
      )}

      {list === null && <div className="card mute">Loading comments...</div>}
      {list?.length === 0 && (
        <div className="card">
          <h3>All caught up</h3>
          <p className="mute" style={{ margin: "4px 0 0" }}>New comments will show up here.</p>
        </div>
      )}

      {list?.map((c) => (
        <div key={c.id} className="card">
          <div className="between">
            <b>@{c.username}</b>
            <span className="kw">{c.post || "post"}</span>
          </div>
          <p style={{ margin: "8px 0" }}>{c.text}</p>
          <label htmlFor={`d-${c.id}`}>Reply (edit before sending)</label>
          <textarea id={`d-${c.id}`} value={drafts[c.id] || ""} onChange={(e) => setDrafts({ ...drafts, [c.id]: e.target.value })} placeholder="Write a reply or tap Draft with AI" />
          <div className="row">
            <button className="btn sm alt" disabled={busy === c.id} onClick={() => draft(c)}>Draft with AI</button>
            <button className="btn sm" disabled={busy === c.id || !drafts[c.id]} onClick={() => act("send", c)}>Send reply</button>
            <button className="btn sm alt" disabled={busy === c.id} onClick={() => act("skip", c)}>Skip</button>
            <button className="btn sm danger" disabled={busy === c.id} onClick={() => act("hide", c)}>Hide comment</button>
          </div>
        </div>
      ))}
    </Shell>
  );
}

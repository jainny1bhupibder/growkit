"use client";
import { useEffect, useState } from "react";
type C = { id: string; text: string; username: string; timestamp: string; post: string; permalink?: string };
const btn = { background: "#FF5C4D", color: "#2A0D08", border: 0, borderRadius: 10, padding: "9px 14px", fontWeight: 700, fontSize: 15, cursor: "pointer" } as const;
const alt = { ...btn, background: "#E9ECF5", color: "#101528" } as const;
const card = { background: "#fff", border: "1px solid #E2E6F0", borderRadius: 14, padding: 16, marginBottom: 12 } as const;
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
    <main style={{ maxWidth: 640, margin: "0 auto", padding: 24 }}>
      <p><a href="/">← Back</a></p>
      <h1>Inbox</h1>
      <p style={{ color: "#667" }}>Replies are drafted by AI in your voice. Nothing posts until you tap Send.</p>
      <div style={card}>
        <label>Your voice (how you usually reply)
          <textarea value={voice} onChange={(e) => setVoice(e.target.value)} maxLength={500} placeholder="Warm, playful, short. Uses 1-2 emojis. Signs off with 'xo'." style={{ width: "100%", boxSizing: "border-box", padding: 10, marginTop: 6, fontSize: 16 }} />
        </label>
        <button style={alt} onClick={saveVoice}>Save voice</button>
      </div>
      {msg && <p role="status"><b>{msg}</b></p>}
      {plan !== "PRO" && <p>AI drafts are a Pro feature. You can still write replies yourself below.</p>}
      {list === null && <p>Loading comments…</p>}
      {list?.length === 0 && <p>All caught up. New comments will show up here.</p>}
      {list?.map((c) => (
        <div key={c.id} style={card}>
          <b>@{c.username}</b> <span style={{ color: "#667", fontSize: 13 }}>on “{c.post || "post"}”</span>
          <p style={{ margin: "6px 0" }}>{c.text}</p>
          <textarea value={drafts[c.id] || ""} onChange={(e) => setDrafts({ ...drafts, [c.id]: e.target.value })} placeholder="Write a reply or tap Draft with AI" style={{ width: "100%", boxSizing: "border-box", padding: 10, fontSize: 16, minHeight: 70 }} />
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
            <button style={alt} disabled={busy === c.id} onClick={() => draft(c)}>Draft with AI</button>
            <button style={btn} disabled={busy === c.id || !drafts[c.id]} onClick={() => act("send", c)}>Send reply</button>
            <button style={alt} disabled={busy === c.id} onClick={() => act("skip", c)}>Skip</button>
            <button style={alt} disabled={busy === c.id} onClick={() => act("hide", c)}>Hide comment</button>
          </div>
        </div>))}
    </main>);
}

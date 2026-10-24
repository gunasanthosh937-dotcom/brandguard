import { useState } from "react";
import { PageHead, StatusBadge } from "../components/ui";
import { api, Issue, useLoad } from "../lib/api";
import { Status } from "../lib/data";

interface Item { id: number; title: string; score: number; status: Status; issues: Issue[]; created_at: string }

export default function Review() {
  const pending = useLoad<Item[]>("/api/review");
  const ready = useLoad<Item[]>("/api/publishable");
  const [channel, setChannel] = useState("website");
  const [msg, setMsg] = useState("");
  const refresh = () => { pending.load(); ready.load(); };
  const act = async (fn: () => Promise<unknown>, ok: string) => {
    try { await fn(); setMsg(ok); } catch (e) { setMsg((e as Error).message); }
    refresh();
  };
  const err = pending.err || ready.err;
  return (
    <>
      <PageHead title="Review queue" sub="Content that scored below 80 waits here until you approve or reject it." />
      {err && <p role="alert" className="mb-3 text-sm text-amber-800">{err}</p>}
      {msg && <p role="status" className="mb-3 text-sm">{msg}</p>}
      <h2 className="mb-2 font-medium">Waiting for review</h2>
      <div className="mb-6 space-y-3">
        {pending.data?.length === 0 && <p className="text-sm text-slate-600">Nothing to review. Run a check in the Content Checker.</p>}
        {pending.data?.map((i) => (
          <div key={i.id} className="card">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div><div className="font-medium">{i.title}</div><div className="text-xs text-slate-500">{new Date(i.created_at).toLocaleString()}</div></div>
              <div className="flex items-center gap-2"><span className="font-semibold">{i.score}</span><StatusBadge s={i.status} />
                <button className="btn" onClick={() => act(() => api.post(`/api/review/${i.id}`, { decision: "approve" }), "Approved.")}>Approve</button>
                <button className="btn-ghost" onClick={() => act(() => api.post(`/api/review/${i.id}`, { decision: "reject" }), "Rejected.")}>Reject</button></div>
            </div>
            <ul className="mt-2 list-disc pl-5 text-sm text-slate-700">{i.issues.map((x, k) => <li key={k}>{x.detail} {x.fix}</li>)}</ul>
          </div>
        ))}
      </div>
      <div className="mb-2 flex items-center justify-between"><h2 className="font-medium">Ready to publish</h2>
        <select aria-label="Channel" className="input !w-auto" value={channel} onChange={(e) => setChannel(e.target.value)}>
          {["website", "linkedin", "instagram", "email"].map((c) => <option key={c}>{c}</option>)}</select></div>
      <div className="space-y-2">
        {ready.data?.length === 0 && <p className="text-sm text-slate-600">No approved content waiting.</p>}
        {ready.data?.map((i) => (
          <div key={i.id} className="card flex items-center justify-between gap-2 !py-3">
            <span className="text-sm font-medium">{i.title} <span className="text-slate-500">· {i.score}</span></span>
            <button className="btn" onClick={() => act(() => api.post(`/api/analyses/${i.id}/publish`, { channel }), `Published to ${channel} (simulated).`)}>Publish</button>
          </div>
        ))}
      </div>
    </>
  );
}

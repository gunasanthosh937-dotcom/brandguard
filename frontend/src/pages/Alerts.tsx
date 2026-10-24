import { useState } from "react";
import { PageHead } from "../components/ui";
import { api, live, useLoad } from "../lib/api";

interface Alert { id: number; message: string; severity: string; resolved: boolean; created_at: string }

export default function Alerts() {
  const { data, err, load } = useLoad<Alert[]>("/api/alerts");
  const [msg, setMsg] = useState("");
  const scan = async () => {
    try { const r = await api.post<{ scanned: number; alerts_created: number }>("/api/monitor/scan"); setMsg(`Scanned ${r.scanned} items, ${r.alerts_created} new alert(s).`); }
    catch (e) { setMsg((e as Error).message); }
    load();
  };
  const resolve = async (id: number) => { try { await api.post(`/api/alerts/${id}/resolve`); } catch (e) { setMsg((e as Error).message); } load(); };
  return (
    <>
      <PageHead title="Alerts" sub="Stored content is re-checked when your brand rules change."
        action={<button className="btn" disabled={!live} onClick={scan}>Scan now</button>} />
      {err && <p role="alert" className="mb-3 text-sm text-amber-800">{err}</p>}
      {msg && <p role="status" className="mb-3 text-sm">{msg}</p>}
      <div className="space-y-2">
        {data?.length === 0 && <p className="text-sm text-slate-600">No alerts. Change a brand rule, then scan.</p>}
        {data?.map((a) => (
          <div key={a.id} className={`card flex items-center justify-between gap-3 !py-3 ${a.resolved ? "opacity-60" : ""}`}>
            <div><div className="text-sm">{a.message}</div><div className="text-xs text-slate-500">{a.severity} · {new Date(a.created_at).toLocaleString()}</div></div>
            {!a.resolved && <button className="btn-ghost" onClick={() => resolve(a.id)}>Resolve</button>}
          </div>
        ))}
      </div>
    </>
  );
}

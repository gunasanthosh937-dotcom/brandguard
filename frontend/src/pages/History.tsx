import { useState } from "react";
import { PageHead, StatusBadge } from "../components/ui";
import { checks, Status } from "../lib/data";

const filters: ("All" | Status)[] = ["All", "Approved", "Needs review", "Flagged"];
export default function History() {
  const [f, setF] = useState<"All" | Status>("All");
  const rows = checks.filter((c) => f === "All" || c.status === f);
  const count = (s: Status) => checks.filter((c) => c.status === s).length;
  const exportCsv = () => {
    const csv = ["id,name,type,score,date,status", ...rows.map((c) => [c.id, `"${c.name}"`, c.type, c.score, c.date, c.status].join(","))].join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" })); a.download = "brandguard-history.csv"; a.click();
  };
  return (
    <>
      <PageHead title="Analysis History" sub="Every check run against your brand, newest first." action={<button className="btn-ghost" onClick={exportCsv}>Export CSV</button>} />
      <div className="mb-4 grid grid-cols-3 gap-4">
        {(["Approved", "Needs review", "Flagged"] as Status[]).map((s) => <div key={s} className="card"><div className="text-sm text-slate-600">{s}</div><div className="text-2xl font-semibold">{count(s)}</div></div>)}
      </div>
      <div className="card">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <span className="text-sm text-slate-600">Showing {rows.length} of {checks.length} checks</span>
          <div className="flex gap-1">{filters.map((x) => (
            <button key={x} onClick={() => setF(x)} aria-pressed={f === x} className={`rounded-md px-3 py-1 text-sm ${f === x ? "bg-ink text-white" : "bg-slate-100"}`}>{x}</button>))}</div>
        </div>
        <div className="overflow-x-auto"><table className="w-full text-left text-sm">
          <thead className="text-slate-500"><tr><th className="py-2">Check</th><th>Type</th><th>Score</th><th>Date</th><th>Status</th></tr></thead>
          <tbody>{rows.map((c) => (
            <tr key={c.id} className="border-t border-slate-100"><td className="py-2"><div className="font-medium">{c.name}</div><div className="text-xs text-slate-500">{c.id}</div></td>
              <td>{c.type}</td><td>{c.score} /100</td><td className="whitespace-nowrap">{c.date}</td><td><StatusBadge s={c.status} /></td></tr>))}</tbody>
        </table></div>
      </div>
    </>
  );
}

import { PageHead } from "../components/ui";
import { useLoad } from "../lib/api";

interface A { total: number; average_score: number; by_status: Record<string, number>; trend: { date: string; average: number }[]; components: Record<string, number>; top_issues: [string, number][] }

export default function Analytics() {
  const { data, err } = useLoad<A>("/api/analytics");
  return (
    <>
      <PageHead title="Analytics" sub="Scores, outcomes and the issues that come up most." />
      {err && <p role="alert" className="text-sm text-amber-800">{err}</p>}
      {data && (
        <>
          <div className="mb-4 grid gap-4 sm:grid-cols-3">
            <div className="card"><div className="text-sm text-slate-600">Checks run</div><div className="text-3xl font-semibold">{data.total}</div></div>
            <div className="card"><div className="text-sm text-slate-600">Average score</div><div className="text-3xl font-semibold">{data.average_score}</div></div>
            <div className="card"><div className="text-sm text-slate-600">By status</div>
              <div className="text-sm">{Object.entries(data.by_status).map(([k, v]) => `${k}: ${v}`).join(" · ") || "No data yet"}</div></div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="card"><h2 className="mb-3 font-medium">Average score by component</h2>
              {Object.entries(data.components).map(([k, v]) => (
                <div key={k} className="mb-2"><div className="flex justify-between text-sm"><span className="capitalize">{k}</span><span>{v}</span></div>
                  <div className="h-2 rounded bg-slate-100"><div className="h-2 rounded bg-brand" style={{ width: `${v}%` }} /></div></div>))}</div>
            <div className="card"><h2 className="mb-3 font-medium">Most common issues</h2>
              {data.top_issues.length === 0 ? <p className="text-sm text-slate-600">No issues recorded.</p> :
                <ul className="space-y-1 text-sm">{data.top_issues.map(([k, n]) => <li key={k} className="flex justify-between"><span>{k}</span><span>{n}</span></li>)}</ul>}</div>
          </div>
          <div className="card mt-4"><h2 className="mb-3 font-medium">Average score by day</h2>
            <ul className="space-y-1 text-sm">{data.trend.map((t) => <li key={t.date} className="flex justify-between"><span>{t.date}</span><span>{t.average}</span></li>)}</ul></div>
        </>
      )}
    </>
  );
}

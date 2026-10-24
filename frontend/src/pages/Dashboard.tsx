import { Link } from "react-router-dom";
import { PageHead, StatusBadge } from "../components/ui";
import { breakdown, checks, stats, trend } from "../lib/data";

function Trend() {
  const w = 300, h = 90, min = 70, max = 95;
  const pts = trend.map((v, i) => `${(i / (trend.length - 1)) * w},${h - ((v - min) / (max - min)) * h}`).join(" ");
  return (
    <svg viewBox={`-4 -4 ${w + 8} ${h + 8}`} className="w-full" role="img" aria-label="Trust score over the last 7 weeks">
      <polyline points={pts} fill="none" stroke="#0f766e" strokeWidth="2.5" />
    </svg>
  );
}

export default function Dashboard() {
  const cards: [string, string, string][] = [
    ["Trust score", `${stats.trust}/100`, "+2 this week — trending upward"],
    ["Approved content", stats.approved.toLocaleString(), "Across 14 connected channels"],
    ["Total checks", stats.total.toLocaleString(), "312 checks in the last 7 days"],
    ["Requires review", String(stats.review), "9 flagged, 18 below score threshold"],
  ];
  return (
    <>
      <PageHead title="Brand overview" sub="Live snapshot of your brand health across all content and channels."
        action={<Link to="/check" className="btn">Run a new check</Link>} />
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(([t, v, s]) => (
          <div key={t} className="card"><div className="text-sm text-slate-600">{t}</div><div className="text-3xl font-semibold">{v}</div><div className="text-xs text-slate-500">{s}</div></div>
        ))}
      </div>
      <div className="mb-6 grid gap-4 lg:grid-cols-3">
        <div className="card lg:col-span-2"><h2 className="mb-2 font-medium">Trust score — last 7 weeks</h2><Trend />
          <div className="flex justify-between text-xs text-slate-500">{trend.map((_, i) => <span key={i}>W{i + 1}</span>)}</div></div>
        <div className="card"><h2 className="mb-3 font-medium">Score breakdown</h2>
          {breakdown.map(([n, v]) => (
            <div key={n} className="mb-3"><div className="flex justify-between text-sm"><span>{n}</span><span>{v}</span></div>
              <div className="h-2 rounded bg-slate-100"><div className="h-2 rounded bg-brand" style={{ width: `${v}%` }} /></div></div>
          ))}</div>
      </div>
      <div className="card">
        <div className="mb-3 flex justify-between"><h2 className="font-medium">Recent checks</h2><Link to="/history" className="text-sm text-brand">View all</Link></div>
        <ul className="divide-y divide-slate-100">
          {checks.slice(0, 5).map((c) => (
            <li key={c.id} className="flex items-center justify-between gap-3 py-2">
              <div><div className="text-sm font-medium">{c.name}</div><div className="text-xs text-slate-500">{c.type} check · {c.date}</div></div>
              <div className="flex items-center gap-2"><span className="font-semibold">{c.score}</span><StatusBadge s={c.status} /></div>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

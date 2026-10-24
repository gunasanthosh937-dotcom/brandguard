import { ReactNode } from "react";
import { Status } from "../lib/data";
const tone: Record<Status, string> = {
  Approved: "bg-emerald-100 text-emerald-800", "Needs review": "bg-amber-100 text-amber-800", Flagged: "bg-red-100 text-red-800",
};
export const StatusBadge = ({ s }: { s: Status }) => <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${tone[s]}`}>{s}</span>;
export const PageHead = ({ title, sub, action }: { title: string; sub: string; action?: ReactNode }) => (
  <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
    <div><h1 className="text-2xl font-semibold">{title}</h1><p className="text-sm text-slate-600">{sub}</p></div>{action}
  </div>
);

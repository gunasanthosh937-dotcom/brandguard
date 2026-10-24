import { useState } from "react";
import { PageHead, StatusBadge } from "../components/ui";
import { analyzeText, TextResult } from "../lib/api";
import { sampleText, statusOf, Status } from "../lib/data";
import { loadGuidelines } from "../lib/guidelines";

const langs: [string, string][] = [["en", "English"], ["hi", "Hindi"], ["ta", "Tamil"], ["es", "Spanish"]];

export default function ContentChecker() {
  const [text, setText] = useState("");
  const [lang, setLang] = useState("en");
  const [res, setRes] = useState<TextResult | null>(null);
  const [busy, setBusy] = useState(false);
  const run = async () => { setBusy(true); setRes(await analyzeText(text, loadGuidelines(), lang)); setBusy(false); };
  return (
    <>
      <PageHead title="Content Checker" sub="Paste any marketing copy to score it against your brand guidelines." />
      <div className="card">
        <label htmlFor="t" className="mb-2 block text-sm font-medium">Content to check</label>
        <textarea id="t" rows={8} className="input" value={text} onChange={(e) => setText(e.target.value)} placeholder="Paste your copy here" />
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button className="btn" disabled={!text.trim() || busy} onClick={run}>{busy ? "Analyzing…" : "Analyze content"}</button>
          <button className="btn-ghost" onClick={() => { setText(sampleText); setRes(null); }}>Load sample text</button>
          <select aria-label="Language" className="input !w-auto" value={lang} onChange={(e) => setLang(e.target.value)}>
            {langs.map(([v, n]) => <option key={v} value={v}>{n}</option>)}
          </select>
          <span className="ml-auto text-xs text-slate-500">{text.length} characters</span>
        </div>
      </div>
      {res && (
        <div className="card mt-4">
          <div className="mb-3 flex items-center gap-3">
            <span className="text-3xl font-semibold">{res.score}<span className="text-base text-slate-500">/100</span></span>
            <StatusBadge s={(res.status as Status) ?? statusOf(res.score)} />
            {res.review_state === "pending" && <span className="text-xs text-slate-600">Added to the review queue</span>}
          </div>
          {res.breakdown && (
            <div className="mb-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {Object.entries(res.breakdown).map(([k, v]) => (
                <div key={k} className="rounded-md bg-slate-50 p-2 text-sm"><div className="capitalize">{k} <span className="text-xs text-slate-500">({v.weight}%)</span></div><div className="font-semibold">{v.score}</div></div>
              ))}
            </div>
          )}
          {res.issues.length === 0 ? <p className="text-sm">No issues found. This copy matches your guidelines.</p> : (
            <ul className="space-y-2">{res.issues.map((i, k) => (
              <li key={k} className="rounded-md border border-slate-200 p-3 text-sm"><b>{i.kind}:</b> {i.detail}<div className="text-slate-600">Suggested fix: {i.fix}</div></li>
            ))}</ul>
          )}
          {res.demo && <p className="mt-3 text-xs text-slate-500">Demo scoring. Connect the backend for the full trust score.</p>}
        </div>
      )}
    </>
  );
}

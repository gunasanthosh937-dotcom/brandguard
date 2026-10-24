import { useState } from "react";
import { PageHead } from "../components/ui";
import { useGuidelines } from "../lib/guidelines";

function Tags({ label, items, onChange, addLabel }: { label: string; items: string[]; onChange: (v: string[]) => void; addLabel: string }) {
  const [v, setV] = useState("");
  const add = () => { const t = v.trim(); if (t && !items.includes(t)) onChange([...items, t]); setV(""); };
  return (
    <section className="card">
      <h2 className="mb-2 font-medium">{label}</h2>
      <div className="mb-3 flex flex-wrap gap-2">
        {items.map((i) => (
          <span key={i} className="flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-sm">{i}
            <button aria-label={`Remove ${i}`} onClick={() => onChange(items.filter((x) => x !== i))}>×</button></span>
        ))}
      </div>
      <div className="flex gap-2"><input className="input" value={v} onChange={(e) => setV(e.target.value)} onKeyDown={(e) => e.key === "Enter" && add()} />
        <button className="btn-ghost shrink-0" onClick={add}>{addLabel}</button></div>
    </section>
  );
}

export default function Guidelines() {
  const { g, setG, save, reset } = useGuidelines();
  const [saved, setSaved] = useState(false);
  return (
    <>
      <PageHead title="Brand Guidelines" sub="These rules are what the Content and Visual Checkers score against."
        action={<div className="flex gap-2"><button className="btn-ghost" onClick={reset}>Reset</button>
          <button className="btn" onClick={() => { save(g); setSaved(true); setTimeout(() => setSaved(false), 2000); }}>{saved ? "Saved" : "Save changes"}</button></div>} />
      <div className="space-y-4">
        <section className="card"><h2 className="font-medium">Brand facts</h2><p className="mb-2 text-xs text-slate-500">One fact per line</p>
          <textarea className="input" rows={6} value={g.facts} onChange={(e) => setG({ ...g, facts: e.target.value })} /></section>
        <section className="card"><h2 className="font-medium">Brand tone</h2><p className="mb-2 text-xs text-slate-500">Describe how the brand should sound</p>
          <textarea className="input" rows={3} value={g.tone} onChange={(e) => setG({ ...g, tone: e.target.value })} /></section>
        <Tags label="Approved product names" items={g.products} onChange={(products) => setG({ ...g, products })} addLabel="Add name" />
        <Tags label="Banned phrases" items={g.banned} onChange={(banned) => setG({ ...g, banned })} addLabel="Add phrase" />
        <section className="card"><h2 className="mb-2 font-medium">Brand colors</h2>
          <div className="flex flex-wrap items-center gap-3">
            {g.colors.map((c, i) => (
              <span key={i} className="flex items-center gap-1"><input type="color" aria-label={`Color ${i + 1}`} value={c} onChange={(e) => setG({ ...g, colors: g.colors.map((x, k) => (k === i ? e.target.value : x)) })} />
                <code className="text-xs">{c}</code></span>
            ))}
            <button className="btn-ghost" onClick={() => setG({ ...g, colors: [...g.colors, "#888888"] })}>Add color</button>
          </div></section>
      </div>
    </>
  );
}

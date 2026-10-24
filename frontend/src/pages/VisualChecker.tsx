import { useEffect, useState } from "react";
import { PageHead, StatusBadge } from "../components/ui";
import { statusOf } from "../lib/data";

// Demo scoring: derived from the file so the same upload gives the same sample report.
function sampleReport(f: File) {
  const seed = (f.size + f.name.length * 7) % 40;
  const mk = (n: string, off: number) => [n, Math.min(98, 58 + ((seed + off) % 40))] as [string, number];
  const parts = [mk("Logo placement", 3), mk("Color palette", 11), mk("Typography", 17), mk("Spacing & layout", 23)];
  return { parts, score: Math.round(parts.reduce((n, p) => n + p[1], 0) / parts.length) };
}

export default function VisualChecker() {
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState("");
  const [err, setErr] = useState("");
  useEffect(() => { if (!file) return; const u = URL.createObjectURL(file); setUrl(u); return () => URL.revokeObjectURL(u); }, [file]);
  const pick = (f?: File) => {
    if (!f) return;
    if (!/^image\/(png|jpeg|webp)$/.test(f.type)) { setErr("Upload a PNG, JPG or WebP image."); return; }
    setErr(""); setFile(f);
  };
  const r = file ? sampleReport(file) : null;
  return (
    <>
      <PageHead title="Visual Checker" sub="Upload a design, banner or screenshot to check it against your brand guidelines." />
      <label onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); pick(e.dataTransfer.files[0]); }}
        className="card flex cursor-pointer flex-col items-center gap-1 border-dashed py-10 text-center">
        <span className="font-medium">Click to upload, or drag & drop an image</span>
        <span className="text-xs text-slate-500">PNG, JPG or WebP — checked locally in your browser, nothing is sent anywhere.</span>
        <input type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={(e) => pick(e.target.files?.[0])} />
      </label>
      {err && <p role="alert" className="mt-2 text-sm text-red-700">{err}</p>}
      {file && r && (
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="card"><img src={url} alt="Uploaded design preview" className="max-h-80 w-full object-contain" /></div>
          <div className="card"><div className="mb-3 flex items-center gap-3"><span className="text-3xl font-semibold">{r.score}<span className="text-base text-slate-500">/100</span></span><StatusBadge s={statusOf(r.score)} /></div>
            {r.parts.map(([n, v]) => (<div key={n} className="mb-2"><div className="flex justify-between text-sm"><span>{n}</span><span>{v}</span></div>
              <div className="h-2 rounded bg-slate-100"><div className="h-2 rounded bg-brand" style={{ width: `${v}%` }} /></div></div>))}
            <p className="mt-3 text-xs text-slate-500">Sample report. Live visual analysis needs the backend.</p></div>
        </div>
      )}
    </>
  );
}

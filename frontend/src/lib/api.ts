import { useCallback, useEffect, useState } from "react";
import { Guidelines } from "./guidelines";

const BASE = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "");
export const live = Boolean(BASE);

export interface Issue { kind: string; detail: string; fix: string; category?: string }
export interface TextResult {
  id?: number; score: number; status?: string; review_state?: string; issues: Issue[];
  breakdown?: Record<string, { score: number; weight: number }>; demo: boolean;
}

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, { headers: { "Content-Type": "application/json" }, ...init });
  if (!res.ok) {
    let msg = `Request failed (${res.status})`;
    try { msg = (await res.json()).detail ?? msg; } catch { /* keep default */ }
    throw new Error(msg);
  }
  return res.json();
}
export const api = {
  get: <T,>(p: string) => req<T>(p),
  post: <T,>(p: string, body?: unknown) => req<T>(p, { method: "POST", body: body === undefined ? undefined : JSON.stringify(body) }),
};

export function useLoad<T>(path: string) {
  const [data, setData] = useState<T | null>(null);
  const [err, setErr] = useState("");
  const load = useCallback(() => {
    if (!live) { setErr("Backend not connected. Set VITE_API_URL in .env."); return; }
    api.get<T>(path).then((d) => { setData(d); setErr(""); }).catch((e) => setErr(e.message));
  }, [path]);
  useEffect(() => { load(); }, [load]);
  return { data, err, load };
}

function localAnalyze(text: string, g: Guidelines): TextResult {
  const issues: Issue[] = [];
  const lower = text.toLowerCase();
  g.banned.forEach((p) => {
    if (p && lower.includes(p.toLowerCase())) issues.push({ kind: "Banned phrase", detail: `"${p}" is not allowed.`, fix: `Remove "${p}" or state the fact plainly.` });
  });
  const ex = (text.match(/!/g) || []).length;
  if (ex) issues.push({ kind: "Tone", detail: `${ex} exclamation mark(s) found.`, fix: "Use full stops in product copy." });
  if (/brand\s?guard/i.test(text) && !/BrandGuard/.test(text))
    issues.push({ kind: "Terminology", detail: "BrandGuard is not written in camel case.", fix: "Write BrandGuard as one word." });
  const score = Math.max(0, 100 - issues.reduce((n, i) => n + (i.kind === "Banned phrase" ? 15 : 8), 0));
  return { score, issues, demo: true };
}

export async function analyzeText(text: string, g: Guidelines, language = "en", title = "Pasted text"): Promise<TextResult> {
  if (!live) return localAnalyze(text, g);
  try {
    return { ...(await api.post<TextResult>("/api/analyze/text", { text, language, title })), demo: false };
  } catch {
    return localAnalyze(text, g); // backend unreachable: keep the page usable
  }
}

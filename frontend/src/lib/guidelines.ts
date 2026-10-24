import { useState } from "react";

export interface Guidelines {
  facts: string; tone: string; products: string[]; banned: string[]; colors: string[];
}
export const defaults: Guidelines = {
  facts: [
    "Official company name: BrandGuard Technologies Pvt. Ltd.",
    "Founded in 2024; HQ in Chennai, India.",
    "We never use hype words like 'revolutionary' or 'world-class'.",
    "Tagline: 'Every brand, always on-brand.'",
    "Trademark: BrandGuard® is always written in camel case, one word.",
  ].join("\n"),
  tone: "Confident, clear and factual. Short sentences. Address the reader as 'you'. No hype words, no exclamation marks in product copy.",
  products: ["BrandGuard", "BrandGuard Engine", "TrustScore API", "BrandGuard Lens"],
  banned: ["revolutionary", "game-changer", "world-class", "clinically proven", "100% guaranteed"],
  colors: ["#0f766e", "#14263a", "#f3f6f8"],
};
const KEY = "brandguard.guidelines";
export const loadGuidelines = (): Guidelines => {
  try { return { ...defaults, ...JSON.parse(localStorage.getItem(KEY) || "{}") }; } catch { return defaults; }
};
export function useGuidelines() {
  const [g, setG] = useState<Guidelines>(loadGuidelines);
  const save = (next: Guidelines) => { try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* storage unavailable */ } setG(next); };
  const reset = () => { try { localStorage.removeItem(KEY); } catch { /* storage unavailable */ } setG(defaults); };
  return { g, setG, save, reset };
}

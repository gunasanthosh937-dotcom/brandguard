export type Status = "Approved" | "Needs review" | "Flagged";
export interface Check { id: string; name: string; type: "Text" | "Visual"; score: number; date: string; status: Status }
export const statusOf = (s: number): Status => (s >= 80 ? "Approved" : s >= 60 ? "Needs review" : "Flagged");

const raw: [string, string, "Text" | "Visual", number, string][] = [
  ["CHK-3412", "Homepage hero copy — Q4 refresh", "Text", 91, "2026-10-22 16:40"],
  ["CHK-3411", "Launch teaser — Instagram caption", "Text", 72, "2026-10-22 15:12"],
  ["CHK-3410", "Product banner — pricing page", "Visual", 86, "2026-10-22 11:05"],
  ["CHK-3409", "Press release — funding announcement", "Text", 54, "2026-10-21 18:30"],
  ["CHK-3408", "App onboarding screen 1", "Visual", 88, "2026-10-21 14:22"],
  ["CHK-3407", "Email newsletter — October edition", "Text", 79, "2026-10-20 09:48"],
  ["CHK-3406", "LinkedIn post — hiring announcement", "Text", 93, "2026-10-19 17:15"],
  ["CHK-3405", "YouTube thumbnail — demo video", "Visual", 61, "2026-10-19 10:02"],
  ["CHK-3404", "Sales deck — slide 7 feature list", "Text", 95, "2026-10-18 16:55"],
  ["CHK-3403", "Brochure back cover artwork", "Visual", 48, "2026-10-18 09:20"],
  ["CHK-3402", "Support auto-reply template", "Text", 90, "2026-10-17 13:37"],
  ["CHK-3401", "Event booth backdrop design", "Visual", 83, "2026-10-16 12:10"],
];
export const checks: Check[] = raw.map(([id, name, type, score, date]) => ({ id, name, type, score, date, status: statusOf(score) }));

export const stats = { trust: 87, approved: 1248, total: 3412, review: 27 };
export const trend = [78, 81, 80, 84, 86, 88, 87];
export const breakdown: [string, number][] = [
  ["Logo & visual identity", 92], ["Color usage", 88], ["Tone of voice", 84], ["Approved terminology", 79],
];

export const sampleText =
  "Meet BrandGuard Engine — the revolutionary, world-class way to protect your brand! It is 100% guaranteed to work. Try Brandguard today!";

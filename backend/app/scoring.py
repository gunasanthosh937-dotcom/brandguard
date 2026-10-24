"""Trust score engine. Weights (sum 100): facts 40, tone 30, terminology 20, compliance 10."""
import re

WEIGHTS = {"facts": 40, "tone": 30, "terminology": 20, "compliance": 10}

def status_of(score: int) -> str:
    return "Approved" if score >= 80 else "Needs review" if score >= 60 else "Flagged"

def analyze(text: str, brand: dict, language: str = "en") -> dict:
    sub = {k: 100 for k in WEIGHTS}
    issues: list[dict] = []

    def hit(cat, kind, detail, fix, penalty):
        sub[cat] = max(0, sub[cat] - penalty)
        issues.append({"category": cat, "kind": kind, "detail": detail, "fix": fix})

    low = text.lower()
    for f in brand.get("facts", []):
        if re.search(f["contradicts"], text):
            hit("facts", "Fact conflict", f"Conflicts with brand fact: {f['label']}.", f["correct"], 40)
    banned = list(brand.get("banned", [])) + list(brand.get("banned_by_lang", {}).get(language, []))
    for p in banned:
        if p and p.lower() in low:
            hit("tone", "Banned phrase", f'"{p}" is not allowed.', f'Remove "{p}" or state the fact plainly.', 25)
    ex = text.count("!")
    if ex:
        hit("tone", "Tone", f"{ex} exclamation mark(s) found.", "Use full stops in product copy.", min(40, 10 * ex))
    for t in brand.get("terms", []):
        for w in t["wrong"]:
            if re.search(rf"(?<!\w){re.escape(w)}(?!\w)", text):
                hit("terminology", "Terminology", f'"{w}" is not the approved name.', f'Write "{t["approved"]}".', 30)
    for r in brand.get("risky", []):
        if r.lower() in low:
            hit("compliance", "Risky claim", f'"{r}" is an unverifiable claim.', "Remove it or cite evidence.", 50)

    score = round(sum(sub[k] * w for k, w in WEIGHTS.items()) / 100)
    return {
        "score": score, "status": status_of(score), "issues": issues,
        "breakdown": {k: {"score": sub[k], "weight": w} for k, w in WEIGHTS.items()},
    }

const CATEGORY_LABELS = {
  mandatory_skills: "Mandatory Skills",
  evidence: "Evidence",
  semantic: "JD Relevance",
  education: "Education",
  preferred_skills: "Preferred Skills",
  experience: "Experience"
};

export function preferredCoverage(result) {
  const preferred = result.preferred_skills || [];
  if (!preferred.length) return Number(result.categories?.preferred_skills?.score ?? 0);
  return Math.round(((result.matched_preferred_skills || []).length / preferred.length) * 100);
}

export function eligibilityLabel(result) {
  return (result.missing_required_skills || []).length ? "Review required" : "Meets mandatory requirements";
}

export default function ScoreCard({ result }) {
  const score = Number(result.match_score ?? 0);
  const pass = score >= 60;
  const categories = result.categories || {};
  return <div className="scorecard"><div className="sc-top"><div><div className="sc-label">JD Match Score — {result.resume_name}</div><div className="sc-score">{score}<span>/100</span></div></div><div className={`stamp ${pass ? "" : "warn"}`}>{pass ? "Strong Match" : "Needs Work"}</div></div><div className="sc-body">{Object.keys(CATEGORY_LABELS).map((name) => { const category = categories[name]; if (!category) return null; const percentage = name === "preferred_skills" ? preferredCoverage(result) : Number(category.score ?? 0); return <div className="cat-row" key={name}><div className="cat-name">{CATEGORY_LABELS[name]}</div><div className="cat-bar-track"><div className="cat-bar-fill" style={{ width: `${percentage}%` }} /></div><div className="cat-val">{percentage}%{category.weight != null ? ` (${category.weight}%)` : ""}</div></div>; })}</div></div>;
}

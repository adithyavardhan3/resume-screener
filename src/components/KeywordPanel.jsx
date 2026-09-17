function SkillGroup({ title, skills, warning = false }) {
  return <div className={`panel kw-block ${warning ? "warn" : "good"}`} style={{ marginBottom: 0 }}><h4>{title}</h4><div className="tag-wrap">{skills.length ? skills.map((skill) => <span className={`tag ${warning ? "warn" : "good"}`} key={skill}>{skill}</span>) : <span className="tag empty-note">None</span>}</div></div>;
}

export default function KeywordPanel({ result }) {
  return <div className="kw-section skill-groups"><SkillGroup title="Matched mandatory" skills={result.matched_required_skills || []} /><SkillGroup title="Missing mandatory" skills={result.missing_required_skills || []} warning /><SkillGroup title="Matched preferred" skills={result.matched_preferred_skills || []} /><SkillGroup title="Missing preferred" skills={result.missing_preferred_skills || []} warning /></div>;
}

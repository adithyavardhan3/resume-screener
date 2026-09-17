export default function ATSChecklist({ checks }) {
  return (
    <div className="panel">
      <h3>ATS-friendliness checklist</h3>
      <ul className="checklist">
        {checks.map((c, i) => (
          <li key={i}>
            <span className={`check-icon ${c.pass ? "pass" : "fail"}`}>
              {c.pass ? "✓" : "✕"}
            </span>
            {c.label}
          </li>
        ))}
      </ul>
    </div>
  );
}

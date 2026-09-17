const LEVELS = ["Freshers", "Junior", "Mid-Level", "Senior", "Lead"];
const YEARS = Array.from({ length: 11 }, (_, value) => value);
const DEFAULT_YEARS = { Freshers: 0, Junior: 1, "Mid-Level": 3, Senior: 5, Lead: 8 };

export default function ExperienceRequirement({ level, onLevelChange, requiredYears, onRequiredYearsChange }) {
  function selectLevel(nextLevel) {
    onLevelChange(nextLevel);
    onRequiredYearsChange(DEFAULT_YEARS[nextLevel]);
  }

  function selectYears(nextYears) {
    if (level === "Freshers" && nextYears > 0) onLevelChange("Junior");
    onRequiredYearsChange(nextYears);
  }

  return <div className="experience-block"><label>Experience requirement</label><div className="experience-requirement-grid"><div><span className="experience-field-label">Experience level</span><div className="role-chip-row">{LEVELS.map((item) => <button key={item} type="button" className={level === item ? "role-chip active" : "role-chip"} onClick={() => selectLevel(item)}>{item}</button>)}</div></div><label className="years-select-label">Minimum professional experience<select value={requiredYears} onChange={(event) => selectYears(Number(event.target.value))}>{YEARS.map((year) => <option key={year} value={year}>{year === 10 ? "10+ years" : `${year} ${year === 1 ? "year" : "years"}`}</option>)}</select></label></div><p className="helper-text">This is a separate eligibility requirement and does not change the JD match score.</p></div>;
}

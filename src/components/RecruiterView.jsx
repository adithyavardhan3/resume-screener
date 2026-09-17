import { useState } from "react";
import Dropzone from "./Dropzone.jsx";
import ExperienceRequirement from "./ExperienceRequirement.jsx";
import { rankResumesAgainstJD } from "../api/scoreApi.js";
import { extractTextFromFile } from "../utils/fileParser.js";
import { eligibilityLabel, preferredCoverage } from "./ScoreCard.jsx";
import { experienceScreening, experienceStatusLabel } from "../utils/experience.js";

const DEFAULT_JD = "Looking for a Data Engineer with Python, AWS Lambda, DynamoDB, ETL pipelines, SQL, and API Gateway.";

export default function RecruiterView() {
  const [files, setFiles] = useState([]);
  const [jdText, setJdText] = useState(DEFAULT_JD);
  const [level, setLevel] = useState("Freshers");
  const [requiredYears, setRequiredYears] = useState(0);
  const [filter, setFilter] = useState("all");
  const [ranking, setRanking] = useState(false);
  const [error, setError] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [expanded, setExpanded] = useState(null);

  function addFiles(next) { setFiles((previous) => { const keys = new Set(previous.map(getFileKey)); return [...previous, ...next.filter((file) => !keys.has(getFileKey(file)))]; }); }
  async function handleRank() {
    if (!jdText.trim()) return setError("Paste a job description first.");
    if (!files.length) return setError("Upload at least one resume.");
    setError(null); setRanking(true); setCandidates([]);
    try {
      const resumes = await Promise.all(files.map(async (file) => ({ resume_name: file.name, resume_text: await extractTextFromFile(file) })));
      const data = await rankResumesAgainstJD(resumes, jdText, level, requiredYears);
      setCandidates([...(data.ranked_candidates || [])].sort((a, b) => Number(b.match_score || 0) - Number(a.match_score || 0)));
    } catch (err) { setError(err.message || "Unable to rank candidates."); }
    finally { setRanking(false); }
  }

  const visibleCandidates = candidates.filter((candidate) => { const eligible = experienceScreening(candidate, requiredYears).eligible; return filter === "all" || (filter === "eligible" && eligible === true) || (filter === "ineligible" && eligible === false); });
  return <div><div className="hero"><div className="eyebrow">Candidate ranking</div><h1>Rank every resume against one job description.</h1><p className="sub">Upload a batch of resumes, add the role's job description, and get a sorted, explainable ranking in seconds.</p></div><div className="panel"><div className="grid-2"><div><label>Candidate resumes</label><Dropzone multiple files={files} onFilesSelected={addFiles} title="Click or drop multiple resumes" subtitle="PDF or DOCX, multiple files supported" /><div>{files.map((file) => <span className="file-chip" key={getFileKey(file)}>{file.name}<button onClick={() => setFiles((items) => items.filter((item) => getFileKey(item) !== getFileKey(file)))}>x</button></span>)}</div></div><div><label>Job description</label><textarea value={jdText} onChange={(event) => setJdText(event.target.value)} /></div></div><ExperienceRequirement level={level} onLevelChange={setLevel} requiredYears={requiredYears} onRequiredYearsChange={setRequiredYears} /><div className="btn-row"><button className="btn" disabled={ranking} onClick={handleRank}>{ranking && <span className="spinner" />}{ranking ? "Ranking..." : "Rank candidates"}</button></div></div>{error && <div className="error-banner">{error}</div>}{candidates.length > 0 && <div className="panel"><div className="table-heading"><h3>Ranked candidates ({visibleCandidates.length})</h3><label className="candidate-filter">Show<select value={filter} onChange={(event) => setFilter(event.target.value)}><option value="all">All candidates</option><option value="eligible">Eligible only</option><option value="ineligible">Not eligible</option></select></label></div><table><thead><tr><th>Rank</th><th>Candidate</th><th>Match %</th><th>Experience</th><th>Eligibility</th><th>Top gap</th></tr></thead><tbody>{visibleCandidates.map((candidate, index) => <CandidateRow key={candidate.resume_name} candidate={candidate} index={index} requiredYears={requiredYears} expanded={expanded} onToggle={() => setExpanded(expanded === index ? null : index)} />)}</tbody></table></div>}</div>;
}

function CandidateRow({ candidate, index, requiredYears, expanded, onToggle }) { const experience = experienceScreening(candidate, requiredYears); return <><tr><td><span className={`rank-badge ${index === 0 ? "top" : ""}`}>{index + 1}</span></td><td className="cand-name">{candidate.resume_name}</td><td><span className="cand-score">{candidate.match_score || 0}%</span><span className="mini-bar-track"><span className="mini-bar-fill" style={{ width: `${candidate.match_score || 0}%` }} /></span></td><td>{experience.candidateYears == null ? "Not available" : `${experience.candidateYears} yrs`}</td><td>{experienceStatusLabel(experience)}</td><td>{candidate.top_gap ? <span className="gap-tag">{candidate.top_gap}</span> : "-"}</td></tr><tr><td colSpan="6"><button className="reset-link" onClick={onToggle}>{expanded === index ? "Hide details" : "View details"}</button>{expanded === index && <CandidateDetails candidate={candidate} experience={experience} />}</td></tr></>; }

function CandidateDetails({ candidate, experience }) { const categories = candidate.categories || {}; const rows = [["Mandatory Skills", categories.mandatory_skills?.score], ["Evidence", categories.evidence?.score], ["JD Relevance", categories.semantic?.score], ["Education", categories.education?.score], ["Preferred Skills", preferredCoverage(candidate)], ["Experience", categories.experience?.score]]; return <div className="candidate-details"><p><strong>Match score:</strong> {candidate.match_score || 0}%</p><p><strong>Mandatory eligibility:</strong> {eligibilityLabel(candidate)}</p><p><strong>Experience eligibility:</strong> {experienceStatusLabel(experience)} — {experience.reason}</p><p><strong>Internship experience:</strong> {experience.internshipMonths == null ? "Not available" : `${experience.internshipMonths} months`}</p><p><strong>Top gap:</strong> {candidate.top_gap || "None reported"}</p>{rows.map(([label, value]) => <p key={label}><strong>{label}:</strong> {value ?? "-"}%</p>)}<p><strong>Matched mandatory skills:</strong> {(candidate.matched_required_skills || []).join(", ") || "None"}</p><p><strong>Missing mandatory skills:</strong> {(candidate.missing_required_skills || []).join(", ") || "None"}</p><p><strong>Matched preferred skills:</strong> {(candidate.matched_preferred_skills || []).join(", ") || "None"}</p><p><strong>Missing preferred skills:</strong> {(candidate.missing_preferred_skills || []).join(", ") || "None"}</p></div>; }
function getFileKey(file) { return `${file.name}-${file.size}-${file.lastModified}`; }

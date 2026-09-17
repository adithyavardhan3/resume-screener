import { useState } from "react";
import Dropzone from "./Dropzone.jsx";
import ExperienceRequirement from "./ExperienceRequirement.jsx";
import ScoreCard from "./ScoreCard.jsx";
import KeywordPanel from "./KeywordPanel.jsx";
import ATSChecklist from "./ATSChecklist.jsx";
import { scoreResumeAgainstJD, screenResumeATS } from "../api/scoreApi.js";
import { experienceScreening, experienceStatusLabel } from "../utils/experience.js";
import { extractTextFromFile } from "../utils/fileParser.js";

const DEFAULT_JD = "Looking for a Data Engineer with experience in Python, AWS Lambda, DynamoDB, ETL pipelines, SQL, and API Gateway. Familiarity with NLP and cloud-based architecture is a plus.";

export default function SeekerView() {
  const [files, setFiles] = useState([]);
  const [jdText, setJdText] = useState(DEFAULT_JD);
  const [level, setLevel] = useState("Mid-Level");
  const [requiredYears, setRequiredYears] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const jdProvided = Boolean(jdText.trim());

  async function handleAnalyze() {
    if (!files[0]) return setError("Upload a resume first.");
    setError(null); setLoading(true); setResult(null);
    try {
      const resumeText = await extractTextFromFile(files[0]);
      const data = jdProvided ? await scoreResumeAgainstJD(files[0].name, resumeText, jdText, level, requiredYears) : await screenResumeATS(files[0].name, resumeText);
      setResult({ ...data, isAts: !jdProvided, selectedExperienceLevel: level, requiredExperienceYears: requiredYears });
    } catch (err) { setError(err.message || "Something went wrong. Please try again."); }
    finally { setLoading(false); }
  }

  return <div><div className="hero"><div className="eyebrow">Resume analysis</div><h1>See your resume the way an ATS reads it.</h1><p className="sub">Upload your resume with a job description for a JD match, or leave it blank for ATS compatibility screening.</p></div><div className="panel"><div className="grid-2"><div><label>Your resume</label><Dropzone multiple={false} files={files} onFilesSelected={setFiles} title="Click or drop your resume here" subtitle="PDF or DOCX, up to 5MB" /></div><div><label>Target job description (optional for ATS screening)</label><textarea value={jdText} onChange={(event) => setJdText(event.target.value)} /></div></div>{jdProvided && <ExperienceRequirement level={level} onLevelChange={setLevel} requiredYears={requiredYears} onRequiredYearsChange={setRequiredYears} />}<div className="btn-row"><button className="btn" disabled={loading} onClick={handleAnalyze}>{loading && <span className="spinner" />}{loading ? "Analyzing..." : jdProvided ? "Analyze JD match" : "Check ATS compatibility"}</button></div></div>{error && <div className="error-banner">{error}</div>}{result && (result.isAts ? <ATSResult result={result} /> : <JDMatchResult result={result} />)}</div>;
}

function JDMatchResult({ result }) {
  const skillsEligible = !(result.missing_required_skills || []).length;
  const experience = experienceScreening(result, result.requiredExperienceYears);
  return <><ScoreCard result={result} /><KeywordPanel result={result} /><div className="panel"><h3>Experience screening</h3><div className={`tag ${skillsEligible ? "good" : "warn"}`}>{skillsEligible ? "Meets mandatory requirements" : "Review required"}</div><div className={`experience-result ${experience.eligible === false ? "warn" : "good"}`}><strong>Status: {experienceStatusLabel(experience)}</strong><span>Required experience: {experience.requiredYears == null ? "Not specified" : `${experience.requiredYears} years`}</span><span>Professional experience detected: {experience.candidateYears == null ? "Not available" : `${experience.candidateYears} years`}</span>{experience.internshipMonths != null && <span>Internship experience: {experience.internshipMonths} months</span>}<span>Reason: {experience.reason}</span></div></div></>;
}

function ATSResult({ result }) { const keywords = result.detected_technical_keywords || result.technical_keywords || []; const problems = result.problems || result.warnings || []; return <><div className="scorecard"><div className="sc-top"><div><div className="sc-label">ATS Compatibility — {result.resume_name}</div><div className="sc-score">{result.ats_score ?? 0}<span>/100</span></div></div></div>{result.keyword_coverage != null && <div className="sc-body"><strong>Keyword coverage: {result.keyword_coverage}%</strong></div>}</div><div className="kw-section"><TagPanel title="Detected technical keywords" values={keywords} /><TagPanel title="Problems and warnings" values={problems} warning /></div><ATSChecklist checks={result.ats_checks || []} /></>; }
function TagPanel({ title, values, warning = false }) { return <div className={`panel kw-block ${warning ? "warn" : "good"}`} style={{ marginBottom: 0 }}><h4>{title}</h4><div className="tag-wrap">{values.length ? values.map((value, index) => <span className={`tag ${warning ? "warn" : "good"}`} key={`${index}-${String(value)}`}>{typeof value === "string" ? value : value.label || value.message || "Issue"}</span>) : <span className="tag empty-note">None reported</span>}</div></div>; }

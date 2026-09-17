// ============================================================
// API CONFIG
// ============================================================

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "https://z80y3fesrb.execute-api.ap-south-1.amazonaws.com";

const REQUEST_TIMEOUT_MS = 30_000;

// ============================================================
// INTERNAL API HELPER
// ============================================================

async function callScoringAPI(payload) {
  const controller = new AbortController();

  const timeout = setTimeout(() => {
    controller.abort();
  }, REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(`${API_BASE_URL}/score`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      signal: controller.signal,
      body: JSON.stringify(payload)
    });

    // Try to parse JSON regardless of HTTP status
    const responseData = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(
        responseData?.error ||
        responseData?.body?.error ||
        `Scoring request failed (${response.status})`
      );
    }

    /*
     * API Gateway/Lambda proxy responses can look like:
     *
     * {
     *   statusCode: 200,
     *   headers: {...},
     *   body: "{\"mode\":\"jd_match\", ...}"
     * }
     *
     * Unwrap the Lambda body so React receives:
     *
     * {
     *   mode: "jd_match",
     *   match_score: 80,
     *   ...
     * }
     */

    if (typeof responseData?.body === "string") {
      try {
        return JSON.parse(responseData.body);
      } catch {
        return responseData;
      }
    }

    return responseData;
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error(
        "The scoring request timed out. Please try again."
      );
    }

    if (error instanceof TypeError) {
      throw new Error(
        "Couldn't reach the scoring service. Check your API Gateway URL, CORS configuration, and internet connection."
      );
    }

    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

// ============================================================
// SEEKER — RESUME + JOB DESCRIPTION
// ============================================================

/**
 * Compare one resume against one Job Description.
 *
 * @param {string} resumeName
 * @param {string} resumeText
 * @param {string} jdText
 * @param {string} experienceLevel
 * @returns {Promise<object>}
 */
export async function scoreResumeAgainstJD(
  resumeName,
  resumeText,
  jdText,
  experienceLevel = "freshers",
  requiredExperienceYears = null
) {
  return callScoringAPI({
    mode: "jd_match",

    resume_name: resumeName,
    resume_text: resumeText,

    jd_text: jdText,

    experience_level: normalizeExperienceLevel(
      experienceLevel
    ),

    required_experience_years: requiredExperienceYears
  });
}

// ============================================================
// SEEKER — RESUME ONLY / ATS SCREENING
// ============================================================

/**
 * Analyze a resume without a Job Description.
 *
 * @param {string} resumeName
 * @param {string} resumeText
 * @returns {Promise<object>}
 */
export async function screenResumeATS(
  resumeName,
  resumeText
) {
  return callScoringAPI({
    mode: "ats",

    resume_name: resumeName,
    resume_text: resumeText
  });
}

// ============================================================
// RECRUITER — MULTIPLE RESUMES AGAINST ONE JD
// ============================================================

/**
 * Rank multiple resumes against one Job Description.
 *
 * @param {Array} resumes
 * @param {string} jdText
 * @param {string} experienceLevel
 * @returns {Promise<object>}
 */
export async function rankResumesAgainstJD(
  resumes,
  jdText,
  experienceLevel = "freshers",
  requiredExperienceYears = null
) {
  const formattedResumes = resumes.map((resume) => ({
    resume_name:
      resume.resume_name ||
      resume.name ||
      resume.fileName ||
      "resume.pdf",

    resume_text:
      resume.resume_text ||
      resume.text ||
      ""
  }));

  return callScoringAPI({
    mode: "recruiter",

    experience_level: normalizeExperienceLevel(
      experienceLevel
    ),

    required_experience_years: requiredExperienceYears,

    jd_text: jdText,

    resumes: formattedResumes
  });
}

// ============================================================
// EXPERIENCE LEVEL NORMALIZATION
// ============================================================

/**
 * Converts UI labels into the values expected by Lambda.
 *
 * Supported Lambda values:
 * freshers
 * junior
 * mid-level
 * senior
 * lead
 */
function normalizeExperienceLevel(level) {
  if (!level) {
    return "freshers";
  }

  const normalized = String(level)
    .trim()
    .toLowerCase();

  const mapping = {
    fresher: "freshers",
    freshers: "freshers",

    junior: "junior",
    "junior-level": "junior",

    "mid-level": "mid-level",
    midlevel: "mid-level",
    "mid level": "mid-level",

    senior: "senior",
    "senior-level": "senior",

    lead: "lead",
    "team lead": "lead"
  };

  return mapping[normalized] || "freshers";
}

// ============================================================
// OPTIONAL DEFAULT EXPORT
// ============================================================

export default {
  scoreResumeAgainstJD,
  screenResumeATS,
  rankResumesAgainstJD
};

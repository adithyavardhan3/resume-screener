# ResumeScore — Frontend

Dual-mode resume screening tool: Seeker mode (upload + JD → score & feedback) and
Recruiter mode (bulk upload → ranked candidates).

## Run it

```bash
npm install
npm run dev
```

Opens at http://localhost:5173

## Connect your real backend

1. Open `src/api/scoreApi.js`
2. Create `.env.local` and set `VITE_API_BASE_URL` to your API Gateway URL.

Your Lambda's `/score` endpoint should accept:
```json
{ "resume_name": "string", "resume_text": "string", "jd_text": "string" }
```

And return:
```json
{
  "resume_name": "string",
  "total_score": 0,
  "categories": {
    "skills": { "score": 0, "max": 25 },
    "experience": { "score": 0, "max": 25 },
    "education": { "score": 0, "max": 20 },
    "keywords": { "score": 0, "max": 30 }
  },
  "matched_keywords": ["string"],
  "missing_keywords": ["string"],
  "ats_checks": [{ "label": "string", "pass": true }]
}
```

No other frontend code needs to change once this is wired up.

## Project structure

```
src/
  api/scoreApi.js         one function, swap mock for real fetch()
  utils/fileParser.js     PDF/DOCX -> plain text extraction
  components/
    Header.jsx
    Dropzone.jsx
    SeekerView.jsx
    RecruiterView.jsx
    ScoreCard.jsx
    KeywordPanel.jsx
    ATSChecklist.jsx
    Footnote.jsx
  App.jsx
```

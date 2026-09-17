export function experienceScreening(result, requiredYears) {
  const source = result.experience || result.categories?.experience || {};
  const candidateYears = source.candidate_professional_years ?? source.candidate_years ?? null;
  const internshipMonths = source.candidate_internship_months ?? source.internship_months ?? null;
  const required = source.required_years ?? requiredYears ?? null;

  if (required == null || candidateYears == null) {
    return { candidateYears, internshipMonths, requiredYears: required, eligible: null, reason: "Not evaluated" };
  }

  const eligible = Number(candidateYears) >= Number(required);
  return {
    candidateYears,
    internshipMonths,
    requiredYears: required,
    eligible,
    reason: eligible
      ? "Meets minimum professional experience requirement"
      : `${required} year${Number(required) === 1 ? "" : "s"} required; ${candidateYears} years professional experience detected`
  };
}

export function experienceStatusLabel(screening) {
  if (screening.eligible === null) return "Not specified";
  return screening.eligible ? "Eligible" : "Not eligible";
}

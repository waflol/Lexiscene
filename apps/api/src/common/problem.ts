export interface ProblemJson {
  type: string; // URL, vd "https://lexiscene.app/problems/validation"
  title: string; // human-readable, vd "Validation failed"
  status: number; // HTTP status
  code: string; // machine-readable, vd "VALIDATION_ERROR"
  detail?: string; // optional explanation
  errors?: { path: string; message: string }[];
}

export function buildProblem(opts: {
  type: string;
  title: string;
  status: number;
  code: string;
  detail?: string;
  errors?: { path: string; message: string }[];
}): ProblemJson {
  return {
    type: opts.type,
    title: opts.title,
    status: opts.status,
    code: opts.code,
    detail: opts.detail,
    errors: opts.errors,
  };
}

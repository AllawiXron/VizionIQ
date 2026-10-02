import { handleAdvisorRequest } from "../../src/lib/advisor/core.js";

/**
 * Vercel function for the Vizion advisor. All logic (prompt, course
 * retrieval, business profile, images, streaming, model fallback) lives in
 * src/lib/advisor/core.ts so the local server behaves exactly the same.
 */
export default async function handler(req: any, res: any) {
  return handleAdvisorRequest(req, res);
}

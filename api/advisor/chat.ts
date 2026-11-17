import { handleAdvisorRequest } from "../../src/lib/advisor/core.js";

export default async function handler(req: any, res: any) {
  return handleAdvisorRequest(req, res);
}

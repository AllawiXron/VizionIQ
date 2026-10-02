/**
 * Compatibility entry point. The advisor now lives in ./advisor/core.ts
 * (shared by the Vercel function and the local server).
 */
export {
  getGeminiClient,
  sanitizeMessageForHistory,
  prepareCleanContents,
  handleAdvisorChat,
  handleAdvisorRequest,
  type ChatMessagePayload,
  type ChatOptions,
} from "./advisor/core";
export { buildSystemInstruction } from "./advisor/prompt";

/**
 * Opening a specific tool from elsewhere (advisor links, home shortcuts).
 * The tools screen may not be mounted yet when the request is made, so the
 * request is also kept until the suite mounts and takes it.
 */
export type ToolCategory = "all" | "understand" | "calculate" | "optimize" | "execute";
export interface ToolRequest {
  category?: ToolCategory;
  toolId?: string;
}

let pending: ToolRequest | null = null;

export function requestTool(detail: ToolRequest) {
  pending = detail;
  window.dispatchEvent(new CustomEvent("open-tool-category", { detail }));
}

export function takePendingTool(): ToolRequest | null {
  const request = pending;
  pending = null;
  return request;
}

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

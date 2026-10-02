/**
 * Splits an advisor answer into renderable blocks: markdown prose,
 * ```script blocks (ready-to-send messages) and ```calc blocks (live profit
 * calculator). Works on partial text while streaming: an unclosed fence is
 * returned as an open block so it can render progressively.
 */
export type RichBlock =
  | { type: "markdown"; content: string }
  | { type: "script"; content: string; open?: boolean }
  | { type: "calc"; content: string; open?: boolean }
  | { type: "code"; content: string; lang: string; open?: boolean };

const SCRIPT_LANGS = new Set(["script", "whatsapp", "message", "msg", "سكريبت"]);

export function parseRichBlocks(text: string, streaming = false): RichBlock[] {
  const blocks: RichBlock[] = [];
  const re = /```([^\n`]*)\n?([\s\S]*?)(```|$)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    if (m.index > last) pushMarkdown(blocks, text.slice(last, m.index));
    const lang = m[1].trim().toLowerCase();
    const closed = m[3] === "```";
    const content = m[2].replace(/\n+$/, "");
    const open = !closed;
    if (open && !streaming && !content) break;
    if (lang === "calc" || lang === "json-calc") blocks.push({ type: "calc", content, open });
    else if (SCRIPT_LANGS.has(lang) || lang === "") blocks.push({ type: "script", content, open });
    else blocks.push({ type: "code", content, lang, open });
    last = re.lastIndex;
    if (!closed) break;
  }
  if (last < text.length) pushMarkdown(blocks, text.slice(last));
  return blocks;
}

function pushMarkdown(blocks: RichBlock[], chunk: string) {
  const content = chunk.replace(/^\n+|\n+$/g, "");
  if (content.trim()) blocks.push({ type: "markdown", content });
}

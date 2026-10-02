import React, { memo, useEffect } from "react";
import { useStreamText } from "../../lib/advisor/streamStore";
import type { BusinessProfile } from "../../lib/advisor/profile";
import type { MarkdownActions } from "./Markdown";
import { RichMessage } from "./RichMessage";

interface StreamingAnswerProps extends MarkdownActions {
  id: string;
  onCopy?: (text: string) => void;
  onSaveProfile?: (p: BusinessProfile) => void;
  /** Called after each new piece of text is painted (keeps the chat pinned to the bottom). */
  onGrow?: () => void;
}

/**
 * The answer that is streaming right now. It reads its text from the stream
 * store, so only this bubble re-renders as words arrive.
 */
export const StreamingAnswer = memo(function StreamingAnswer({ id, onGrow, ...rest }: StreamingAnswerProps) {
  const text = useStreamText(id);
  // Pin after the browser has the new text, in the same frame it paints it.
  useEffect(() => {
    if (!onGrow) return;
    const frame = requestAnimationFrame(onGrow);
    return () => cancelAnimationFrame(frame);
  }, [text, onGrow]);
  return <RichMessage text={text} streaming {...rest} />;
});

import React, { memo, useEffect } from "react";
import { useStreamText } from "../../lib/advisor/streamStore";
import type { BusinessProfile } from "../../lib/advisor/profile";
import type { MarkdownActions } from "./Markdown";
import { RichMessage } from "./RichMessage";

interface StreamingAnswerProps extends MarkdownActions {
  id: string;
  onCopy?: (text: string) => void;
  onSaveProfile?: (p: BusinessProfile) => void;
  onGrow?: () => void;
}

export const StreamingAnswer = memo(function StreamingAnswer({ id, onGrow, ...rest }: StreamingAnswerProps) {
  const text = useStreamText(id);
  useEffect(() => {
    if (!onGrow) return;
    const frame = requestAnimationFrame(onGrow);
    return () => cancelAnimationFrame(frame);
  }, [text, onGrow]);
  return <RichMessage text={text} streaming {...rest} />;
});

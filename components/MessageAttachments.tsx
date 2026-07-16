import type { MessageAttachment } from "@/lib/message-attachments";
import { getInteractiveCopy } from "@/content/interactive-copy";

export default function MessageAttachments({
  attachments,
  inverted = false,
}: {
  attachments: MessageAttachment[];
  inverted?: boolean;
}) {
  const copy = getInteractiveCopy().conversation;
  if (!attachments.length) return null;
  return (
    <div className="mt-3 grid gap-2">
      {attachments.map((attachment) => (
        <a
          key={attachment.path}
          href={attachment.url}
          target="_blank"
          rel="noreferrer"
          className={[
            "flex items-center justify-between gap-3 rounded-lg border px-3 py-2 text-xs font-semibold",
            inverted ? "border-white/25 bg-white/10 text-white" : "border-line bg-card text-primary",
          ].join(" ")}
        >
          <span className="truncate">{attachment.name}</span>
          <span className="shrink-0">{copy.openAttachment}</span>
        </a>
      ))}
    </div>
  );
}

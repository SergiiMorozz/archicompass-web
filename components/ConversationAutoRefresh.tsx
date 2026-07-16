"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getInteractiveCopy } from "@/content/interactive-copy";

export default function ConversationAutoRefresh() {
  const copy = getInteractiveCopy().conversation;
  const router = useRouter();

  useEffect(() => {
    const interval = window.setInterval(() => {
      if (document.visibilityState === "visible") router.refresh();
    }, 15_000);

    return () => window.clearInterval(interval);
  }, [router]);

  return <span className="text-xs text-muted">{copy.autoRefresh}</span>;
}

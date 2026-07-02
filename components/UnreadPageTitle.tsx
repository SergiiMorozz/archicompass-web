"use client";

import { useEffect } from "react";

export default function UnreadPageTitle({
  count,
  label,
}: {
  count: number;
  label: string;
}) {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = count
      ? `(${count > 99 ? "99+" : count}) ${label} | ArchiCompass`
      : `${label} | ArchiCompass`;

    return () => {
      document.title = previousTitle;
    };
  }, [count, label]);

  return null;
}

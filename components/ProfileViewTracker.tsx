"use client";

import { useEffect } from "react";

const sessionStorageKey = "archicompass_profile_view_session";

export default function ProfileViewTracker({
  disabled,
  profileId,
}: {
  disabled: boolean;
  profileId: string;
}) {
  useEffect(() => {
    if (disabled) return;

    let sessionKey = window.sessionStorage.getItem(sessionStorageKey);
    if (!sessionKey) {
      sessionKey = crypto.randomUUID();
      window.sessionStorage.setItem(sessionStorageKey, sessionKey);
    }

    void fetch("/api/profile-views", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        profileId,
        sessionKey,
        sourcePath: window.location.pathname,
      }),
      keepalive: true,
    });
  }, [disabled, profileId]);

  return null;
}

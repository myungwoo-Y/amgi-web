"use client";

import { useSession } from "next-auth/react";

export function SessionStatus() {
  const { data, status } = useSession();

  if (status === "loading") {
    return (
      <p className="text-sm text-muted-foreground" aria-live="polite">
        Checking your session…
      </p>
    );
  }

  if (!data?.user) {
    return (
      <p className="text-sm text-muted-foreground">
        You are browsing as a guest. Sign in to sync your decks.
      </p>
    );
  }

  return (
    <p className="text-sm text-muted-foreground">
      Signed in as <span className="font-medium text-foreground">{data.user.email}</span>
    </p>
  );
}

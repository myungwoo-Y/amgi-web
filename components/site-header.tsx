import Link from "next/link";

import { LoginButton } from "@/components/auth/login-button";
import { LogoutButton } from "@/components/auth/logout-button";
import { auth } from "@/lib/auth";

export async function SiteHeader() {
  const session = await auth();

  return (
    <header className="border-b bg-background">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
        <Link href="/" className="text-lg font-semibold text-foreground">
          Amgi Flashcards
        </Link>
        {session?.user ? (
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-muted-foreground sm:inline-flex">
              {session.user.email}
            </span>
            <LogoutButton />
          </div>
        ) : (
          <LoginButton />
        )}
      </div>
    </header>
  );
}

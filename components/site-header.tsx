import Link from "next/link";

import { Button } from "@/components/ui/button";

export function SiteHeader() {
  return (
    <header className="border-b bg-background">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
        <Link href="/" className="text-lg font-semibold text-foreground">
          Amgi Flashcards
        </Link>
        <Button variant="outline">Login with Google</Button>
      </div>
    </header>
  );
}

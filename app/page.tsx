import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SessionStatus } from "@/components/session-status";

export default function Home() {
  return (
    <section className="space-y-12">
      <div className="space-y-6">
        <p className="text-sm font-semibold uppercase text-muted-foreground">
          Flashcards built for focused review
        </p>
        <div className="space-y-4">
          <h1 className="text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl">
            Retain more in less time with adaptive review sessions.
          </h1>
          <p className="text-lg text-muted-foreground">
            Amgi helps you schedule short, high-impact study bursts so you can
            master any topic—from language learning to interview prep—without
            burning out.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button size="lg">Start Reviewing</Button>
          <Button size="lg" variant="outline">
            View Roadmap
          </Button>
        </div>
      </div>

      <div className="rounded-2xl border bg-card p-6">
        <div className="space-y-3">
          <h2 className="text-xl font-semibold text-card-foreground">
            Early builders wanted
          </h2>
          <p className="text-base text-muted-foreground">
            Leave your email and we&apos;ll invite you once Google login is
            live. No spam—just product updates.
          </p>
        </div>
        <form className="mt-4 flex flex-col gap-3 sm:flex-row">
          <Input
            type="email"
            placeholder="you@example.com"
            aria-label="Email address"
          />
          <Button type="submit" className="sm:w-48">
            Notify Me
          </Button>
        </form>
      </div>

      <div className="rounded-xl border bg-muted/40 p-4">
        <SessionStatus />
      </div>
    </section>
  );
}

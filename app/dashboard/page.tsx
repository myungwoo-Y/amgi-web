import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/");
  }

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <p className="text-sm font-semibold uppercase text-muted-foreground">
          Dashboard
        </p>
        <h1 className="text-3xl font-semibold text-foreground">
          Welcome back, {session?.user?.name ?? "friend"}
        </h1>
        <p className="text-base text-muted-foreground">
          This server component reads your session via NextAuth auth() and
          proves the login redirect worked.
        </p>
      </div>

      <div className="rounded-2xl border bg-card p-4 text-xs text-card-foreground sm:text-sm">
        <pre className="overflow-x-auto text-wrap">
          {JSON.stringify(session, null, 2)}
        </pre>
      </div>
    </section>
  );
}

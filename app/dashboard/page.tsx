import { DeckListClient } from "@/components/dashboard/deck-list-client";
import { requireUser } from "@/lib/require-user";

export default async function DashboardPage() {
  await requireUser();

  return (
    <section className="space-y-8">
      <DeckListClient />
    </section>
  );
}

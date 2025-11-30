import { DeckDetailClient } from "@/components/deck/deck-detail-client";
import { requireUser } from "@/lib/require-user";

interface DeckPageProps {
  params: {
    deckId: string;
  };
}

export default async function DeckDetailPage({ params }: DeckPageProps) {
  await requireUser();

  return (
    <section className="space-y-6">
      <DeckDetailClient deckId={params.deckId} />
    </section>
  );
}

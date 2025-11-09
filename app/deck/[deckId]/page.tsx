import Link from "next/link";

import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/require-user";

interface DeckPageProps {
  params: {
    deckId: string;
  };
}

export default async function DeckDetailPage({ params }: DeckPageProps) {
  const { user } = await requireUser();

  const deck = await prisma.deck.findFirst({
    where: { id: params.deckId, userId: user.id },
    include: {
      cards: {
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          front: true,
          back: true,
          hint: true,
          updatedAt: true,
          createdAt: true,
          reviews: {
            orderBy: { reviewedAt: "desc" },
            take: 1,
            select: { grade: true, reviewedAt: true, nextReviewAt: true },
          },
        },
      },
    },
  });

  if (!deck) {
    return (
      <section className="space-y-4">
        <p className="text-muted-foreground">덱을 찾을 수 없습니다.</p>
        <Button asChild variant="outline">
          <Link href="/dashboard">대시보드로 돌아가기</Link>
        </Button>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase text-muted-foreground">Deck</p>
          <h1 className="text-3xl font-semibold text-foreground">{deck.title}</h1>
          {deck.description ? (
            <p className="text-base text-muted-foreground">{deck.description}</p>
          ) : (
            <p className="text-base text-muted-foreground italic">설명 없음</p>
          )}
        </div>
        <Button>새 카드 만들기</Button>
      </div>

      {deck.cards.length === 0 ? (
        <div className="rounded-xl border border-dashed bg-muted/40 p-6 text-center">
          <p className="text-sm text-muted-foreground">카드가 없습니다. 첫 카드를 추가해보세요.</p>
        </div>
      ) : (
        <ul className="space-y-4">
          {deck.cards.map((card) => (
            <li key={card.id} className="rounded-xl border bg-card p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                  <h2 className="text-lg font-semibold text-card-foreground">{card.front}</h2>
                  <p className="text-sm text-muted-foreground">{card.back}</p>
                  {card.hint && (
                    <p className="text-xs text-muted-foreground">힌트: {card.hint}</p>
                  )}
                </div>
                <div className="text-xs text-right text-muted-foreground">
                  <p>업데이트 {card.updatedAt.toLocaleDateString()}</p>
                  {card.reviews[0]?.nextReviewAt && (
                    <p>다음 복습 {card.reviews[0].nextReviewAt.toLocaleDateString()}</p>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

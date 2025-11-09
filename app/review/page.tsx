import Link from "next/link";

import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/require-user";

export default async function ReviewQueuePage() {
  const { user } = await requireUser();

  const now = new Date();
  const dueCards = await prisma.card.findMany({
    where: {
      deck: { userId: user.id },
      OR: [
        { reviews: { some: { nextReviewAt: { lte: now } } } },
        { reviews: { none: {} } },
      ],
    },
    orderBy: { createdAt: "asc" },
    include: {
      deck: { select: { id: true, title: true } },
      reviews: {
        orderBy: { reviewedAt: "desc" },
        take: 1,
        select: { grade: true, reviewedAt: true, nextReviewAt: true },
      },
    },
  });

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm uppercase text-muted-foreground">Review</p>
          <h1 className="text-3xl font-semibold text-foreground">오늘의 복습 큐</h1>
          <p className="text-base text-muted-foreground">
            nextReviewAt가 지났거나 아직 학습되지 않은 카드를 모았습니다.
          </p>
        </div>
        <Button variant="secondary" asChild>
          <Link href="/dashboard">대시보드</Link>
        </Button>
      </div>

      {dueCards.length === 0 ? (
        <div className="rounded-xl border border-dashed bg-muted/40 p-6 text-center">
          <p className="text-base font-semibold text-foreground">
            축하합니다! 오늘 복습할 카드가 없습니다.
          </p>
          <p className="text-sm text-muted-foreground">
            새로운 카드를 추가하거나 내일 다시 확인하세요.
          </p>
        </div>
      ) : (
        <ol className="space-y-4">
          {dueCards.map((card, index) => (
            <li key={card.id} className="rounded-xl border bg-card p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">#{index + 1}</p>
                  <p className="text-sm text-muted-foreground">
                    덱: {card.deck.title}
                  </p>
                  <h2 className="text-lg font-semibold text-card-foreground">
                    {card.front}
                  </h2>
                  <p className="text-sm text-muted-foreground">{card.back}</p>
                </div>
                <div className="text-right text-xs text-muted-foreground">
                  {card.reviews[0]?.grade !== undefined ? (
                    <>
                      <p>최근 점수 {card.reviews[0]?.grade}/5</p>
                      {card.reviews[0]?.nextReviewAt && (
                        <p>
                          다음 복습 {card.reviews[0].nextReviewAt.toLocaleDateString()}
                        </p>
                      )}
                    </>
                  ) : (
                    <p>첫 학습 필요</p>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

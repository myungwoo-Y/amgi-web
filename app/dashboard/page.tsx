import Link from "next/link";

import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/require-user";

export default async function DashboardPage() {
  const { user } = await requireUser();

  const decks = await prisma.deck.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      title: true,
      description: true,
      updatedAt: true,
      createdAt: true,
      _count: { select: { cards: true } },
    },
  });

  return (
    <section className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <p className="text-sm font-semibold uppercase text-muted-foreground">
            Dashboard
          </p>
          <h1 className="text-3xl font-semibold text-foreground">
            내 덱 ({decks.length})
          </h1>
          <p className="text-base text-muted-foreground">
            학습 중인 덱을 관리하고 리뷰 세션을 준비하세요.
          </p>
        </div>
        <div className="flex gap-3">
          <Button asChild variant="secondary">
            <Link href="/review">오늘 복습</Link>
          </Button>
          <Button asChild>
            <Link href="/deck/new">새 덱 만들기</Link>
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {decks.length === 0 ? (
          <div className="rounded-xl border border-dashed bg-muted/50 p-6 text-center">
            <p className="text-base font-medium text-foreground">
              아직 생성된 덱이 없습니다.
            </p>
            <p className="text-sm text-muted-foreground">
              첫 덱을 만들어 카드를 추가하고 학습을 시작하세요.
            </p>
          </div>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2">
            {decks.map((deck) => (
              <li key={deck.id} className="rounded-xl border bg-card p-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-card-foreground">
                      {deck.title}
                    </h2>
                    <span className="text-xs text-muted-foreground">
                      업데이트 {deck.updatedAt.toLocaleDateString()}
                    </span>
                  </div>
                  {deck.description ? (
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {deck.description}
                    </p>
                  ) : (
                    <p className="text-sm italic text-muted-foreground">
                      설명이 없습니다.
                    </p>
                  )}
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{deck._count.cards}장의 카드</span>
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/deck/${deck.id}`}>열기</Link>
                    </Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

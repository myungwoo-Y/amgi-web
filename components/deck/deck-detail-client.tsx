"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useDeck } from "@/hooks/use-decks";
import { useCreateCard } from "@/hooks/use-cards";

interface Props {
  deckId: string;
}

export function DeckDetailClient({ deckId }: Props) {
  const { data, isLoading, error } = useDeck(deckId);
  const createCard = useCreateCard(deckId);
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const [hint, setHint] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">덱을 불러오는 중...</p>;
  }

  if (error || !data) {
    return <p className="text-sm text-destructive">덱을 불러오지 못했습니다.</p>;
  }

  const cards = data.cards ?? [];

  const handleCreateCard = () => {
    setFormError(null);
    if (!front.trim() || !back.trim()) {
      setFormError("앞면과 뒷면을 모두 입력해 주세요.");
      return;
    }

    createCard.mutate(
      { front: front.trim(), back: back.trim(), hint: hint.trim() || undefined },
      {
        onSuccess: () => {
          setFront("");
          setBack("");
          setHint("");
        },
        onError: (err) => {
          setFormError(err instanceof Error ? err.message : "카드 생성 실패");
        },
      }
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase text-muted-foreground">Deck</p>
          <h1 className="text-3xl font-semibold text-foreground">{data.title}</h1>
          {data.description ? (
            <p className="text-base text-muted-foreground">{data.description}</p>
          ) : (
            <p className="text-base text-muted-foreground italic">설명 없음</p>
          )}
        </div>
        <div className="rounded-xl border bg-muted/30 p-4">
          <p className="text-sm font-semibold text-foreground">카드 추가</p>
          <div className="mt-3 space-y-2">
            <Input
              placeholder="앞면"
              value={front}
              onChange={(event) => setFront(event.target.value)}
            />
            <Textarea
              placeholder="뒷면"
              value={back}
              onChange={(event) => setBack(event.target.value)}
            />
            <Input
              placeholder="힌트 (선택)"
              value={hint}
              onChange={(event) => setHint(event.target.value)}
            />
            {formError && <p className="text-sm text-destructive">{formError}</p>}
            <Button
              type="button"
              className="w-full"
              onClick={handleCreateCard}
              disabled={createCard.isPending}
            >
              {createCard.isPending ? "저장 중..." : "새 카드 만들기"}
            </Button>
          </div>
        </div>
      </div>

      {cards.length === 0 ? (
        <div className="rounded-xl border border-dashed bg-muted/40 p-6 text-center">
          <p className="text-sm text-muted-foreground">카드가 없습니다. 첫 카드를 추가해보세요.</p>
        </div>
      ) : (
        <ul className="space-y-4">
          {cards.map((card) => {
            const nextReview = card.reviews?.[0]?.nextReviewAt;
            return (
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
                    <p>업데이트 {new Date(card.updatedAt).toLocaleDateString()}</p>
                    {nextReview && (
                      <p>다음 복습 {new Date(nextReview).toLocaleDateString()}</p>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

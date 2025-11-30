"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDecks, useCreateDeck, DeckSummary } from "@/hooks/use-decks";
import { useUIStore } from "@/lib/stores/ui-store";

export function DeckListClient() {
  const { data: decks, isLoading } = useDecks();
  const createDeck = useCreateDeck();
  const { isCreateDeckOpen, openCreateDeck, closeCreateDeck } = useUIStore();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);

  const deckList = decks ?? [];

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("덱 제목을 입력해주세요.");
      return;
    }

    createDeck.mutate(
      { title: title.trim(), description: description.trim() || undefined },
      {
        onSuccess: () => {
          setTitle("");
          setDescription("");
          closeCreateDeck();
        },
        onError: (err) => {
          setError(err instanceof Error ? err.message : "생성에 실패했습니다.");
        },
      }
    );
  };

  const renderDeck = (deck: DeckSummary) => (
    <li key={deck.id} className="rounded-xl border bg-card p-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-card-foreground">
            {deck.title}
          </h2>
          <span className="text-xs text-muted-foreground">
            업데이트 {new Date(deck.updatedAt).toLocaleDateString()}
          </span>
        </div>
        {deck.description ? (
          <p className="text-sm text-muted-foreground break-words">
            {deck.description}
          </p>
        ) : (
          <p className="text-sm italic text-muted-foreground">설명 없음</p>
        )}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{deck._count.cards}장의 카드</span>
          <Button asChild size="sm" variant="outline">
            <Link href={`/deck/${deck.id}`}>열기</Link>
          </Button>
        </div>
      </div>
    </li>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <p className="text-sm font-semibold uppercase text-muted-foreground">
            Dashboard
          </p>
          <h1 className="text-3xl font-semibold text-foreground">
            내 덱 ({deckList.length})
          </h1>
          <p className="text-base text-muted-foreground">
            학습 중인 덱을 관리하고 리뷰 세션을 준비하세요.
          </p>
        </div>
        <div className="flex gap-3">
          <Button asChild variant="secondary">
            <Link href="/review">오늘 복습</Link>
          </Button>
          <Button onClick={openCreateDeck} disabled={createDeck.isPending}>
            새 덱 만들기
          </Button>
        </div>
      </div>

      {isCreateDeckOpen && (
        <form
          onSubmit={handleSubmit}
          className="space-y-3 rounded-xl border bg-muted/30 p-4"
        >
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-foreground">덱 만들기</p>
            <Button type="button" variant="ghost" size="sm" onClick={closeCreateDeck}>
              닫기
            </Button>
          </div>
          <Input
            placeholder="예: Interview Prep"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
          <Input
            placeholder="간단한 설명"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full" disabled={createDeck.isPending}>
            {createDeck.isPending ? "생성 중..." : "덱 생성"}
          </Button>
        </form>
      )}

      <div className="space-y-4">
        {isLoading ? (
          <div className="rounded-xl border bg-muted/40 p-6 text-center text-sm text-muted-foreground">
            덱을 불러오는 중...
          </div>
        ) : deckList.length === 0 ? (
          <div className="rounded-xl border border-dashed bg-muted/50 p-6 text-center">
            <p className="text-base font-medium text-foreground">아직 덱이 없습니다.</p>
            <p className="text-sm text-muted-foreground">
              "새 덱 만들기" 버튼을 눌러 첫 덱을 생성하세요.
            </p>
          </div>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2">{deckList.map(renderDeck)}</ul>
        )}
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useReviewQueue, useSubmitReview, type ReviewCard } from "@/hooks/use-review";

const gradeOptions = [0, 1, 2, 3, 4, 5];

export function ReviewQueueClient() {
  const { data, isLoading } = useReviewQueue();
  const submitReview = useSubmitReview();
  const [queue, setQueue] = useState<ReviewCard[]>([]);
  const [initialCount, setInitialCount] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  useEffect(() => {
    if (data) {
      setQueue(data);
      setInitialCount(data.length);
      setShowAnswer(false);
    }
  }, [data]);

  const currentCard = queue[0];
  const remaining = queue.length;
  const completed = initialCount - remaining;

  const handleReveal = () => setShowAnswer(true);

  const handleGrade = (grade: number) => {
    if (!currentCard) return;

    submitReview.mutate(
      { cardId: currentCard.id, grade },
      {
        onSuccess: () => {
          toast.success(`점수 ${grade}점으로 기록했습니다.`);
          setQueue((prev) => prev.slice(1));
          setShowAnswer(false);
        },
        onError: (err) => {
          toast.error(err instanceof Error ? err.message : "기록에 실패했습니다.");
        },
      }
    );
  };

  const headerText = useMemo(() => {
    if (!initialCount) {
      return "오늘 복습할 카드가 없습니다.";
    }
    if (!remaining) {
      return "축하합니다! 오늘의 복습을 완료했습니다.";
    }
    return `남은 카드 ${remaining} / ${initialCount}`;
  }, [initialCount, remaining]);

  if (isLoading) {
    return (
      <div className="rounded-xl border bg-muted/40 p-6 text-center text-sm text-muted-foreground">
        복습 카드를 불러오는 중...
      </div>
    );
  }

  if (!initialCount) {
    return (
      <div className="rounded-xl border border-dashed bg-muted/40 p-6 text-center">
        <p className="text-base font-semibold text-foreground">오늘 복습할 카드가 없습니다.</p>
        <p className="text-sm text-muted-foreground mt-2">새로운 카드를 추가하거나 내일 다시 돌아오세요.</p>
        <Button asChild variant="secondary" className="mt-4">
          <Link href="/dashboard">대시보드로 가기</Link>
        </Button>
      </div>
    );
  }

  if (!currentCard) {
    return (
      <div className="rounded-xl border bg-card p-6 text-center space-y-4">
        <p className="text-xl font-semibold text-card-foreground">모든 복습을 마쳤습니다! 🎉</p>
        <p className="text-sm text-muted-foreground">
          오늘 {completed}장의 카드를 복습했습니다. 내일 다시 돌아오면 더 많은 카드를 복습할 수 있어요.
        </p>
        <div className="flex justify-center gap-3">
          <Button asChild variant="secondary">
            <Link href="/dashboard">대시보드</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/deck/new">새 덱 만들기</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm uppercase text-muted-foreground">Review</p>
          <h1 className="text-3xl font-semibold text-foreground">오늘의 복습</h1>
          <p className="text-sm text-muted-foreground">{headerText}</p>
        </div>
        <Button asChild variant="ghost">
          <Link href="/dashboard">대시보드로 이동</Link>
        </Button>
      </div>

      <div className="rounded-2xl border bg-card p-6 shadow-sm">
        <p className="text-xs uppercase text-muted-foreground">덱</p>
        <p className="text-sm font-medium text-card-foreground">{currentCard.deck.title}</p>

        <div className="mt-6 space-y-2">
          <p className="text-xs text-muted-foreground">앞면</p>
          <p className="text-xl font-semibold text-card-foreground">{currentCard.front}</p>
        </div>

        <div className="mt-6 space-y-4">
          {!showAnswer ? (
            <Button onClick={handleReveal} className="w-full" variant="secondary">
              Show Answer
            </Button>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={currentCard.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                <div className="space-y-2 rounded-xl border bg-muted/50 p-4">
                  <p className="text-xs text-muted-foreground">뒷면</p>
                  <p className="text-base text-card-foreground">{currentCard.back}</p>
                  {currentCard.hint && (
                    <p className="text-xs text-muted-foreground">힌트: {currentCard.hint}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase text-muted-foreground">점수를 선택하세요</p>
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                    {gradeOptions.map((grade) => (
                      <Button
                        key={grade}
                        type="button"
                        variant="outline"
                        disabled={submitReview.isPending}
                        onClick={() => handleGrade(grade)}
                      >
                        {grade}
                      </Button>
                    ))}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
}

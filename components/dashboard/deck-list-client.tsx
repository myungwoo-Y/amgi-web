"use client";

import Link from "next/link";
import { useMemo } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useDecks, useCreateDeck } from "@/hooks/use-decks";
import { useUIStore } from "@/lib/stores/ui-store";

const deckSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, { message: "덱 제목은 2자 이상이어야 합니다." })
    .max(80, { message: "덱 제목은 80자 이하로 입력해주세요." }),
  description: z
    .string()
    .trim()
    .max(200, { message: "설명은 200자 이하로 입력해주세요." })
    .optional()
    .or(z.literal("")),
});

type DeckFormValues = z.infer<typeof deckSchema>;

export function DeckListClient() {
  const { data: decks, isLoading } = useDecks();
  const createDeck = useCreateDeck();
  const { isCreateDeckOpen, openCreateDeck, closeCreateDeck } = useUIStore();

  const deckList = decks ?? [];
  const form = useForm<DeckFormValues>({
    resolver: zodResolver(deckSchema),
    defaultValues: { title: "", description: "" },
  });

  const resetAndClose = () => {
    form.reset({ title: "", description: "" });
    closeCreateDeck();
  };

  const handleSubmit = form.handleSubmit(async (values) => {
    createDeck.mutate(values, {
      onSuccess: () => {
        toast.success("덱이 생성되었습니다.");
        resetAndClose();
      },
      onError: (err) => {
        toast.error(err instanceof Error ? err.message : "덱 생성에 실패했습니다.");
      },
    });
  });

  const deckCards = useMemo(
    () =>
      deckList.map((deck) => (
        <li key={deck.id} className="rounded-xl border bg-card p-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-card-foreground">{deck.title}</h2>
              <span className="text-xs text-muted-foreground">
                업데이트 {new Date(deck.updatedAt).toLocaleDateString()}
              </span>
            </div>
            {deck.description ? (
              <p className="text-sm text-muted-foreground break-words">{deck.description}</p>
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
      )),
    [deckList]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <p className="text-sm font-semibold uppercase text-muted-foreground">Dashboard</p>
          <h1 className="text-3xl font-semibold text-foreground">내 덱 ({deckList.length})</h1>
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

      <section className="space-y-4">
        {isLoading ? (
          <div className="rounded-xl border bg-muted/40 p-6 text-center text-sm text-muted-foreground">
            덱을 불러오는 중...
          </div>
        ) : deckList.length === 0 ? (
          <div className="rounded-xl border border-dashed bg-muted/50 p-6 text-center">
            <p className="text-base font-medium text-foreground">아직 덱이 없습니다.</p>
            <p className="text-sm text-muted-foreground">“새 덱 만들기” 버튼을 눌러 첫 덱을 생성하세요.</p>
          </div>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2">{deckCards}</ul>
        )}
      </section>

      <Dialog
        open={isCreateDeckOpen}
        onOpenChange={(open: boolean) => {
          if (!open) {
            resetAndClose();
          } else {
            openCreateDeck();
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>새 덱 만들기</DialogTitle>
            <DialogDescription>덱 이름과 간단한 설명을 입력하세요.</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>덱 이름</FormLabel>
                    <FormControl>
                      <Input placeholder="예: Interview Prep" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>설명 (선택)</FormLabel>
                    <FormControl>
                      <Input placeholder="간단한 설명을 입력하세요" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={resetAndClose}>
                  취소
                </Button>
                <Button type="submit" disabled={createDeck.isPending}>
                  {createDeck.isPending ? "생성 중..." : "덱 생성"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

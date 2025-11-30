"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDeck, type DeckDetail } from "@/hooks/use-decks";
import { useCreateCard, useDeleteCard, useUpdateCard } from "@/hooks/use-cards";

const cardSchema = z.object({
  front: z.string().trim().min(1, { message: "앞면을 입력하세요." }).max(200),
  back: z.string().trim().min(1, { message: "뒷면을 입력하세요." }).max(400),
  hint: z.string().trim().max(200).optional().or(z.literal("")),
});

type CardFormValues = z.infer<typeof cardSchema>;

type DeckCard = DeckDetail["cards"][number];

interface DeckDetailClientProps {
  deckId: string;
}

export function DeckDetailClient({ deckId }: DeckDetailClientProps) {
  const { data, isLoading, error } = useDeck(deckId);
  const createCard = useCreateCard(deckId);
  const [editingCard, setEditingCard] = useState<DeckCard | null>(null);
  const [deletingCard, setDeletingCard] = useState<DeckCard | null>(null);
  const [isCreateOpen, setCreateOpen] = useState(false);

  const updateCard = useUpdateCard(editingCard?.id ?? "", deckId);
  const deleteCard = useDeleteCard(deletingCard?.id ?? "", deckId);

  const createForm = useForm<CardFormValues>({
    resolver: zodResolver(cardSchema),
    defaultValues: { front: "", back: "", hint: "" },
  });

  const editForm = useForm<CardFormValues>({
    resolver: zodResolver(cardSchema),
    defaultValues: { front: "", back: "", hint: "" },
  });

  const resetCreate = () => {
    createForm.reset({ front: "", back: "", hint: "" });
    setCreateOpen(false);
  };

  const openEditModal = (card: DeckCard) => {
    setEditingCard(card);
    editForm.reset({
      front: card.front,
      back: card.back,
      hint: card.hint ?? "",
    });
  };

  const closeEditModal = () => {
    setEditingCard(null);
  };

  const handleCreateSubmit = createForm.handleSubmit((values) => {
    createCard.mutate(values, {
      onSuccess: () => {
        toast.success("카드가 추가되었습니다.");
        resetCreate();
      },
      onError: (err) => {
        toast.error(err instanceof Error ? err.message : "카드 추가에 실패했습니다.");
      },
    });
  });

  const handleEditSubmit = editForm.handleSubmit((values) => {
    if (!editingCard) return;
    updateCard.mutate(values, {
      onSuccess: () => {
        toast.success("카드가 수정되었습니다.");
        closeEditModal();
      },
      onError: (err) => {
        toast.error(err instanceof Error ? err.message : "카드 수정 실패");
      },
    });
  });

  const confirmDelete = () => {
    if (!deletingCard) return;
    deleteCard.mutate(undefined, {
      onSuccess: () => {
        toast.success("카드가 삭제되었습니다.");
        setDeletingCard(null);
      },
      onError: (err) => {
        toast.error(err instanceof Error ? err.message : "카드 삭제 실패");
      },
    });
  };

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">덱을 불러오는 중...</p>;
  }

  if (error || !data) {
    return <p className="text-sm text-destructive">덱을 불러오지 못했습니다.</p>;
  }

  const cards = data.cards ?? [];

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
        <Button onClick={() => setCreateOpen(true)}>새 카드 만들기</Button>
      </div>

      <div className="rounded-2xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[180px]">앞면</TableHead>
              <TableHead>뒷면</TableHead>
              <TableHead className="w-[160px]">힌트</TableHead>
              <TableHead className="w-[140px]">다음 복습</TableHead>
              <TableHead className="w-[140px] text-right">액션</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cards.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-sm text-muted-foreground">
                  카드가 없습니다. “새 카드 만들기” 버튼을 눌러 카드를 추가하세요.
                </TableCell>
              </TableRow>
            ) : (
              cards.map((card) => {
                const nextReview = card.reviews?.[0]?.nextReviewAt;
                return (
                  <TableRow key={card.id}>
                    <TableCell className="font-medium">{card.front}</TableCell>
                    <TableCell>{card.back}</TableCell>
                    <TableCell>{card.hint ?? "-"}</TableCell>
                    <TableCell>
                      {nextReview ? new Date(nextReview).toLocaleDateString() : "학습 필요"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="outline" onClick={() => openEditModal(card)}>
                          수정
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setDeletingCard(card)}>
                          삭제
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
          <TableCaption>{cards.length}장의 카드</TableCaption>
        </Table>
      </div>

      {/* Create Card Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={(open: boolean) => (open ? setCreateOpen(true) : resetCreate())}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>새 카드 만들기</DialogTitle>
            <DialogDescription>학습할 카드의 앞면/뒷면을 입력하세요.</DialogDescription>
          </DialogHeader>
          <Form {...createForm}>
            <form className="space-y-4" onSubmit={handleCreateSubmit}>
              <FormField
                control={createForm.control}
                name="front"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>앞면</FormLabel>
                    <FormControl>
                      <Input placeholder="예: React useState는?" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name="back"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>뒷면</FormLabel>
                    <FormControl>
                      <Textarea placeholder="답을 입력하세요" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name="hint"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>힌트 (선택)</FormLabel>
                    <FormControl>
                      <Input placeholder="기억 보조 팁" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={resetCreate}>
                  취소
                </Button>
                <Button type="submit" disabled={createCard.isPending}>
                  {createCard.isPending ? "저장 중..." : "카드 생성"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Card Dialog */}
      <Dialog open={Boolean(editingCard)} onOpenChange={(open: boolean) => (!open ? closeEditModal() : null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>카드 수정</DialogTitle>
            <DialogDescription>선택한 카드의 내용을 업데이트합니다.</DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form className="space-y-4" onSubmit={handleEditSubmit}>
              <FormField
                control={editForm.control}
                name="front"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>앞면</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="back"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>뒷면</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="hint"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>힌트</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={closeEditModal}>
                  취소
                </Button>
                <Button type="submit" disabled={updateCard.isPending}>
                  {updateCard.isPending ? "저장 중..." : "변경 사항 저장"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog open={Boolean(deletingCard)} onOpenChange={(open: boolean) => (!open ? setDeletingCard(null) : null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>카드 삭제</DialogTitle>
            <DialogDescription>
              “{deletingCard?.front}” 카드를 삭제하면 복구할 수 없습니다.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingCard(null)}>
              취소
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={deleteCard.isPending}>
              {deleteCard.isPending ? "삭제 중..." : "삭제"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

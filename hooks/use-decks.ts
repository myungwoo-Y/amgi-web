"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiRequest } from "@/lib/api-client";

const deckKeys = {
  all: ["decks"] as const,
  lists: () => [...deckKeys.all, "list"] as const,
  detail: (deckId: string | null) => [...deckKeys.all, "detail", deckId] as const,
};

export type DeckSummary = {
  id: string;
  title: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  _count: { cards: number };
};

export type DeckDetail = DeckSummary & {
  cards: Array<{
    id: string;
    front: string;
    back: string;
    hint: string | null;
    createdAt: string;
    updatedAt: string;
    reviews: Array<{
      grade: number;
      reviewedAt: string;
      nextReviewAt: string | null;
    }>;
  }>;
};

export function useDecks() {
  return useQuery<DeckSummary[]>({
    queryKey: deckKeys.lists(),
    queryFn: () => apiRequest<DeckSummary[]>("/api/decks"),
  });
}

export function useDeck(deckId: string) {
  return useQuery<DeckDetail>({
    queryKey: deckKeys.detail(deckId),
    enabled: Boolean(deckId),
    queryFn: () => apiRequest<DeckDetail>(`/api/decks/${deckId}`),
  });
}

export function useCreateDeck() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: { title: string; description?: string | null }) =>
      apiRequest<DeckSummary>("/api/decks", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    onMutate: async (newDeck) => {
      await queryClient.cancelQueries({ queryKey: deckKeys.lists() });
      const previousDecks =
        queryClient.getQueryData<DeckSummary[]>(deckKeys.lists()) ?? [];

      const optimisticDeck: DeckSummary = {
        id: `temp-${Date.now()}`,
        title: newDeck.title,
        description: newDeck.description ?? null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        _count: { cards: 0 },
      };

      queryClient.setQueryData(deckKeys.lists(), [optimisticDeck, ...previousDecks]);

      return { previousDecks };
    },
    onError: (_err, _newDeck, context) => {
      if (context?.previousDecks) {
        queryClient.setQueryData(deckKeys.lists(), context.previousDecks);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: deckKeys.lists() });
    },
  });
}

export function useUpdateDeck(deckId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: { title?: string; description?: string | null }) =>
      apiRequest(`/api/decks/${deckId}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: deckKeys.detail(deckId) });
      queryClient.invalidateQueries({ queryKey: deckKeys.lists() });
    },
  });
}

export function useDeleteDeck(deckId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () =>
      apiRequest(`/api/decks/${deckId}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: deckKeys.lists() });
    },
  });
}

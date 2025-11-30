"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiRequest } from "@/lib/api-client";

const cardKeys = {
  all: ["cards"] as const,
  detail: (cardId: string | null) => [...cardKeys.all, "detail", cardId] as const,
};

export function useCard(cardId: string) {
  return useQuery({
    queryKey: cardKeys.detail(cardId),
    enabled: Boolean(cardId),
    queryFn: () => apiRequest(`/api/cards/${cardId}`),
  });
}

export function useCreateCard(deckId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { front: string; back: string; hint?: string | null }) =>
      apiRequest("/api/cards", {
        method: "POST",
        body: JSON.stringify({ ...payload, deckId }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["decks", "detail", deckId] });
    },
  });
}

export function useUpdateCard(cardId: string, deckId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { front?: string; back?: string; hint?: string | null }) =>
      apiRequest(`/api/cards/${cardId}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["decks", "detail", deckId] });
      queryClient.invalidateQueries({ queryKey: cardKeys.detail(cardId) });
    },
  });
}

export function useDeleteCard(cardId: string, deckId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () =>
      apiRequest(`/api/cards/${cardId}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["decks", "detail", deckId] });
    },
  });
}

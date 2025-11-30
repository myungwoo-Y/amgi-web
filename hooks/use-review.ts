"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiRequest } from "@/lib/api-client";

export type ReviewCard = {
  id: string;
  front: string;
  back: string;
  hint: string | null;
  deck: { id: string; title: string };
};

const reviewKeys = {
  all: ["review", "queue"] as const,
};

export function useReviewQueue() {
  return useQuery<ReviewCard[]>({
    queryKey: reviewKeys.all,
    queryFn: () => apiRequest<ReviewCard[]>("/api/review"),
  });
}

export function useSubmitReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: { cardId: string; grade: number }) =>
      apiRequest("/api/review", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reviewKeys.all });
    },
  });
}

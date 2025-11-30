import { ReviewQueueClient } from "@/components/review/review-queue-client";
import { requireUser } from "@/lib/require-user";

export default async function ReviewPage() {
  await requireUser();

  return <ReviewQueueClient />;
}

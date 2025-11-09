import Link from "next/link";

import { Button } from "@/components/ui/button";
import { requireUser } from "@/lib/require-user";

export default async function NewDeckPage() {
  await requireUser();

  return (
    <section className="space-y-4">
      <h1 className="text-3xl font-semibold text-foreground">새 덱 만들기</h1>
      <p className="text-muted-foreground">
        덱 생성 폼은 준비 중입니다. 다음 단계에서 덱과 카드를 추가할 수 있게 될 예정입니다.
      </p>
      <Button asChild variant="outline">
        <Link href="/dashboard">돌아가기</Link>
      </Button>
    </section>
  );
}

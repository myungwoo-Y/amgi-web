import { redirect } from "next/navigation";

import { LoginButton } from "@/components/auth/login-button";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";

export default async function SignInPage() {
  const session = await auth();

  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <section className="mx-auto max-w-md space-y-6 text-center">
      <div className="space-y-3">
        <p className="text-sm font-semibold uppercase text-muted-foreground">
          Authentication Required
        </p>
        <h1 className="text-3xl font-semibold text-foreground">
          로그인 후 계속하세요
        </h1>
        <p className="text-base text-muted-foreground">
          Google 계정으로 로그인하면 덱과 복습 이력이 동기화됩니다.
        </p>
      </div>
      <div className="flex flex-col gap-3">
        <LoginButton />
        <Button asChild variant="ghost">
          <a href="/">홈으로 돌아가기</a>
        </Button>
      </div>
    </section>
  );
}

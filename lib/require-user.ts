import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/current-user";

export async function requireUser() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/signin");
  }

  return { user };
}

import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const deckId = typeof body?.deckId === "string" ? body.deckId : "";
  const front = typeof body?.front === "string" ? body.front.trim() : "";
  const back = typeof body?.back === "string" ? body.back.trim() : "";
  const hint =
    typeof body?.hint === "string" && body.hint.trim().length > 0
      ? body.hint.trim()
      : null;

  if (!deckId || !front || !back) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const deck = await prisma.deck.findFirst({
    where: { id: deckId, userId: user.id },
  });

  if (!deck) {
    return NextResponse.json({ error: "Deck not found" }, { status: 404 });
  }

  const card = await prisma.card.create({
    data: { deckId, front, back, hint },
  });

  return NextResponse.json(card, { status: 201 });
}

import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";

interface RouteContext {
  params: Promise<{ deckId: string }>;
}

async function resolveDeck(userId: string, deckId: string) {
  return prisma.deck.findFirst({
    where: { id: deckId, userId },
  });
}

export async function GET(_request: Request, context: RouteContext) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { deckId } = await context.params;

  const deck = await prisma.deck.findFirst({
    where: { id: deckId, userId: user.id },
    include: {
      _count: { select: { cards: true } },
      cards: {
        orderBy: { createdAt: "asc" },
        include: {
          reviews: {
            orderBy: { reviewedAt: "desc" },
            take: 1,
            select: { grade: true, reviewedAt: true, nextReviewAt: true },
          },
        },
      },
    },
  });

  if (!deck) {
    return NextResponse.json({ error: "Deck not found" }, { status: 404 });
  }

  return NextResponse.json(deck);
}

export async function PATCH(request: Request, context: RouteContext) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { deckId } = await context.params;

  const body = await request.json().catch(() => null);
  const updates: { title?: string; description?: string | null } = {};

  if (typeof body?.title === "string") {
    updates.title = body.title.trim();
  }

  if (typeof body?.description === "string") {
    updates.description = body.description.trim();
  } else if (body?.description === null) {
    updates.description = null;
  }

  const deck = await resolveDeck(user.id, deckId);

  if (!deck) {
    return NextResponse.json({ error: "Deck not found" }, { status: 404 });
  }

  const updated = await prisma.deck.update({
    where: { id: deck.id },
    data: updates,
  });

  return NextResponse.json(updated);
}

export async function DELETE(_request: Request, context: RouteContext) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { deckId } = await context.params;

  const deck = await resolveDeck(user.id, deckId);

  if (!deck) {
    return NextResponse.json({ error: "Deck not found" }, { status: 404 });
  }

  await prisma.deck.delete({ where: { id: deck.id } });

  return NextResponse.json({ success: true });
}

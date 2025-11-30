import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";

interface RouteContext {
  params: Promise<{ cardId: string }>;
}

async function getOwnedCard(userId: string, cardId: string) {
  return prisma.card.findFirst({
    where: { id: cardId, deck: { userId } },
    include: {
      deck: { select: { id: true, title: true } },
      reviews: {
        orderBy: { reviewedAt: "desc" },
        take: 5,
        select: { grade: true, reviewedAt: true, nextReviewAt: true },
      },
    },
  });
}

export async function GET(_request: Request, context: RouteContext) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { cardId } = await context.params;

  const card = await getOwnedCard(user.id, cardId);

  if (!card) {
    return NextResponse.json({ error: "Card not found" }, { status: 404 });
  }

  return NextResponse.json(card);
}

export async function PATCH(request: Request, context: RouteContext) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { cardId } = await context.params;

  const body = await request.json().catch(() => null);

  const updates: { front?: string; back?: string; hint?: string | null } = {};

  if (typeof body?.front === "string") {
    updates.front = body.front.trim();
  }

  if (typeof body?.back === "string") {
    updates.back = body.back.trim();
  }

  if (typeof body?.hint === "string") {
    updates.hint = body.hint.trim();
  } else if (body?.hint === null) {
    updates.hint = null;
  }

  const card = await prisma.card.findFirst({
    where: { id: cardId, deck: { userId: user.id } },
  });

  if (!card) {
    return NextResponse.json({ error: "Card not found" }, { status: 404 });
  }

  const updated = await prisma.card.update({
    where: { id: card.id },
    data: updates,
  });

  return NextResponse.json(updated);
}

export async function DELETE(_request: Request, context: RouteContext) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { cardId } = await context.params;

  const card = await prisma.card.findFirst({
    where: { id: cardId, deck: { userId: user.id } },
  });

  if (!card) {
    return NextResponse.json({ error: "Card not found" }, { status: 404 });
  }

  await prisma.card.delete({ where: { id: card.id } });

  return NextResponse.json({ success: true });
}

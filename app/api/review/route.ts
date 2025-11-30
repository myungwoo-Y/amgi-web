import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";

const GRADE_INTERVAL: Record<number, number> = {
  0: 1,
  1: 1,
  2: 1,
  3: 2,
  4: 4,
  5: 7,
};

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();

  const dueCards = await prisma.card.findMany({
    where: {
      deck: { userId: user.id },
      OR: [
        { reviews: { some: { nextReviewAt: { lte: now } } } },
        { reviews: { none: {} } },
      ],
    },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      front: true,
      back: true,
      hint: true,
      deck: { select: { id: true, title: true } },
    },
  });

  return NextResponse.json(dueCards);
}

export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const cardId = typeof body?.cardId === "string" ? body.cardId : "";
  const grade = Number(body?.grade);

  if (!cardId || Number.isNaN(grade) || grade < 0 || grade > 5) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const card = await prisma.card.findFirst({
    where: { id: cardId, deck: { userId: user.id } },
    select: { id: true },
  });

  if (!card) {
    return NextResponse.json({ error: "Card not found" }, { status: 404 });
  }

  const intervalDays = GRADE_INTERVAL[grade] ?? 1;
  const nextReviewAt = new Date();
  nextReviewAt.setDate(nextReviewAt.getDate() + intervalDays);

  const history = await prisma.reviewHistory.create({
    data: {
      cardId: card.id,
      grade,
      intervalDays,
      nextReviewAt,
    },
  });

  return NextResponse.json({
    success: true,
    intervalDays: history.intervalDays,
    nextReviewAt,
  });
}

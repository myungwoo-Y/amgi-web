import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const decks = await prisma.deck.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      title: true,
      description: true,
      createdAt: true,
      updatedAt: true,
      _count: { select: { cards: true } },
    },
  });

  return NextResponse.json(decks);
}

export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const rawTitle = typeof body?.title === "string" ? body.title : "";
  const rawDescription =
    typeof body?.description === "string" ? body.description : undefined;

  const title = rawTitle.trim();
  const description = rawDescription?.trim() || null;

  if (!title) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  const deck = await prisma.deck.create({
    data: {
      title,
      description,
      userId: user.id,
    },
  });

  return NextResponse.json(
    {
      ...deck,
      _count: { cards: 0 },
    },
    { status: 201 }
  );
}

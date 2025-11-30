## 2025-11-09 – Step 1 bootstrap
- Initialized Next.js 15 app with TypeScript, ESLint, Tailwind v3, shadcn/ui primitives, React Query, Zustand, and Framer Motion; added dev/build/lint/typecheck scripts.
- Set up Tailwind/PostCSS design tokens, shared `SiteHeader`, hero + CTA + email capture placeholder, and removed all dark-mode styles while keeping Google login button placeholder.
- `pnpm typecheck` passes; `pnpm lint` blocked by system Node 16.20.2 (needs ≥18.18.0).

## 2025-11-09 – Step 2 Auth.js integration
- Installed `next-auth@5.0.0-beta.30`, added Google provider config (`lib/auth.ts`) and API route, plus shared `AuthProvider`.
- Replaced header CTA with real login/logout buttons, added client `SessionStatus`, protected `/dashboard` server page, and ensured login redirect flows to dashboard.
- Documented required env keys (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `NEXTAUTH_SECRET`); `pnpm typecheck` passes, `pnpm lint` still blocked by Node 16.20.2.

## 2025-11-09 – Step 3 Prisma + Neon setup
- Added Prisma + @prisma/client + PrismaAdapter wiring, defined schema (User, Auth tables, Deck, Card, ReviewHistory) w/ constraints and helper client.
- Hooked Auth.js to PrismaAdapter w/ database sessions; documented DATABASE_URL usage and Neon-friendly example plus migrate commands.
- `pnpm typecheck` passes; `pnpm lint` still blocked on Node 16.20.2.

## 2025-11-09 – Step 4 Routing skeleton
- Added protected routes: dashboard deck list, deck detail, review queue, sign-in guard, and placeholder deck creation screen; all server components use `requireUser` helper with Prisma queries.
- Review queue computes due cards when `nextReviewAt` passed or never studied; dashboard and detail pages list decks/cards and CTA buttons for upcoming flows.
- `pnpm typecheck` passes; `pnpm lint` remains blocked by Node 16.20.2 (Next.js requires ≥18.18.0).

## 2025-11-09 – Step 5 API + data flow
- Implemented authenticated CRUD API routes for decks/cards with Prisma + Next.js route handlers, plus shared `apiRequest` helper and `getCurrentUser`.
- Added React Query provider, deck/card hooks (`useDecks`, `useDeck`, `useCreateDeck`, etc.), Zustand UI store, and client components showing optimistic deck creation + card creation flows.
- Dashboard/deck pages now use hooks + API data; `pnpm typecheck` passes and `pnpm lint` still blocked on system Node 16.20.2.

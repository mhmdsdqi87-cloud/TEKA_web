# Contributing to TEKA

Thanks for wanting to build with us — this guide covers running a local copy
and landing a clean pull request.

## Tech stack

Next.js 16 (App Router) · TypeScript 5 · Tailwind CSS 4 · shadcn/ui ·
Framer Motion · Zustand · Prisma ORM (SQLite) · Bun.

## Local setup

```bash
bun install
bun run db:push     # create/update the local database schema
bun run dev         # http://localhost:3000
```

## Before you open a pull request

1. `bun run lint` passes with no errors.
2. `bun run build` succeeds.
3. Motion and visual changes respect `prefers-reduced-motion` — the site
   treats accessibility as a feature, not an afterthought (semantic HTML,
   ARIA labels, keyboard navigation, skip-to-content).
4. Include screenshots or a short clip for visual changes.
5. One logical change per PR — small, focused PRs get merged fastest.

## Ground rules

- Honesty over hype: tokenomics and figures come from Whitepaper v1.0, and the
  only published contract is the Sepolia testnet deployment, clearly labeled.
  Never add invented data or decorative fake buttons.
- The 8-second ignition sequence must stay skippable and must not block
  content for assistive technology.
- New dependencies need a stated reason in the PR description.

## Reporting issues

See [SUPPORT.md](SUPPORT.md) — bugs go to Issues, ecosystem questions to the
community channels linked there.

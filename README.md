# YAZ Portfolio + CMS

A full-stack Next.js app: the public YAZ portfolio site plus a private admin
dashboard (`/admin`) for managing every section of it — categories, projects,
tags, images/videos, featured work, drag-and-drop ordering, and site-wide
text — without ever touching code again.

The portfolio's original design (colors, layout, animations, the AI
documentary generator demo) is preserved pixel-for-pixel; only the content is
now database-driven instead of hardcoded.

Bilingual: Arabic is the primary language (RTL), with an English toggle, on
both the public site and the admin dashboard.

## Stack

- Next.js 14 (App Router) + TypeScript
- Prisma + Postgres (any free Postgres works — Vercel Postgres, Neon, Supabase...)
- NextAuth (credentials login, single admin account)
- Local filesystem uploads (`/public/uploads`) — note: on serverless hosts
  (Vercel, etc.) the filesystem is ephemeral/read-only at runtime, so
  uploads made through the deployed dashboard won't persist. Fine for a
  local server or a VM; for a serverless deploy, swap in an object storage
  provider (S3, Cloudinary, Vercel Blob) if persistent uploads matter.
- dnd-kit for drag-and-drop reordering

## Setup

```bash
npm install
cp .env.example .env   # fill in DATABASE_URL / ADMIN_EMAIL / ADMIN_PASSWORD / NEXTAUTH_SECRET
npx prisma db push      # creates the schema in your Postgres database
npm run db:seed          # loads the original portfolio content
npm run dev
```

Visit `http://localhost:3000` for the site and `http://localhost:3000/admin`
for the dashboard (log in with the `ADMIN_EMAIL` / `ADMIN_PASSWORD` from your
`.env`).

### Deploying (e.g. Vercel)

Set the same four environment variables in your host's dashboard, and set
the build command to:

```
npx prisma db push && npx prisma db seed && next build
```

`prisma db push` is used instead of `prisma migrate deploy` since this
project ships without versioned migrations (`db push` syncs the schema
directly, which is simplest for a fresh deploy).

## Project structure

- `src/app/page.tsx` — public homepage (reads categories/projects/settings
  from the database)
- `src/components/site/` — the portfolio's visual components
- `src/app/admin/` — the admin dashboard (login, categories, projects,
  settings, media library)
- `src/app/api/admin/` — REST-ish route handlers backing the dashboard
- `prisma/schema.prisma` — data model
- `prisma/seed.ts` + `prisma/seed-data.json` — migrates the original
  portfolio content into the database on first run

## Notes

- Keyboard shortcuts in the project editor: `⌘/Ctrl+S` saves immediately,
  `⌘/Ctrl+Enter` toggles publish and saves.
- Autosave runs ~800ms after you stop typing; an explicit "Publish" toggle
  controls what's actually live on the public site.
- Uploaded images/videos are stored under `public/uploads` and tracked in
  the `Media` table for the media library.

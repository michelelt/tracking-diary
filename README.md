# How Are You (HAY) — Minimal Diary

A minimalist web app for tracking 6 personal metrics in 2 minutes a day. Designed for mobile, offline-tolerant, and built on a free stack (Vercel, Supabase free).

**Status**: 🚧 Work in progress (Phase 1: setup complete, auth and DB configured)

## Requirements

- Node.js 18+
- npm / yarn / pnpm
- A Google Cloud Console account
- A Supabase account (free)

## Local setup (step by step)

### 1. Clone the repo and install dependencies

```bash
cd tracking-diary
npm install
```

### 2. Create a Supabase project and grab the connection string

1. Go to [supabase.com](https://supabase.com) and create an account (free)
2. Create a new project
3. Go to **Settings > Database > Connection string**
4. Select the **URI** tab and copy the string
5. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
6. Paste it into `DATABASE_URL`:
   ```
   DATABASE_URL=postgresql://[user]:[password]@[host]:5432/[database]
   ```

### 3. Configure Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select an existing one)
3. Enable the **Google+ API**
4. Go to **Credentials > Create Credentials > OAuth 2.0 Client ID**
5. Select **Web application**
6. Add these Authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (local dev)
   - `https://baseline.vercel.app/api/auth/callback/google` (production, once you deploy)
7. Copy the **Client ID** and **Client Secret** into `.env.local`:
   ```
   GOOGLE_CLIENT_ID=...
   GOOGLE_CLIENT_SECRET=...
   ```

### 4. Generate NEXTAUTH_SECRET and NEXTAUTH_URL

```bash
# Generate a secret (run from the terminal)
openssl rand -base64 32
```

In `.env.local`:
```
NEXTAUTH_SECRET=<the-generated-value>
NEXTAUTH_URL=http://localhost:3000
```

### 5. Set the admin email and password

In `.env.local`:
```
ADMIN_EMAIL=michelecocca.mc@gmail.com
ADMIN_PASSWORD=admin
```

⚠️ **IMPORTANT**: In production, change ADMIN_PASSWORD to a strong string (at least 12 characters, a mix of uppercase, lowercase, numbers and symbols).

### 6. Run the Prisma migrations

```bash
npx prisma migrate dev --name init
```

This creates the tables in the Supabase database and generates the Prisma client.

### 7. Add your account to the allowlist

Connect to Supabase Studio:
1. Go to your Supabase project > **SQL Editor**
2. Run:
   ```sql
   INSERT INTO "AllowedUser" (email, "createdBy") VALUES ('michelecocca.mc@gmail.com', 'admin');
   ```

Or wait until I implement the admin area to manage the allowlist from the UI.

### 8. Start the dev server

```bash
npm run dev
```

Go to `http://localhost:3000`. You should see the login screen.

## Available commands

```bash
npm run dev          # Start Next.js in dev mode (hot reload)
npm run build        # Production build
npm start            # Start the built server
npm run lint         # Run ESLint
npm run type-check   # Check TypeScript
npm run test         # Jest in watch mode
npm run test:ci      # Jest in CI mode
npx prisma studio   # Open Prisma Studio (DB UI)
npx prisma migrate dev --name [name]  # Create a new migration
```

## Project structure

```
how-are-you/
├── app/
│   ├── (auth)/         # Login, unauthorized (not protected)
│   ├── (app)/          # All app pages (session-protected)
│   ├── admin/          # Admin area (protected by session + password)
│   ├── api/            # API routes
│   └── layout.tsx      # Root layout
├── lib/
│   ├── auth.ts         # NextAuth config
│   ├── db.ts           # Prisma client
│   ├── validators.ts   # Zod schemas
│   ├── types.ts        # TypeScript types
│   └── constants.ts    # Constants (emoji, colors, etc.)
├── components/         # React components
├── prisma/
│   └── schema.prisma   # DB schema
├── public/
│   ├── manifest.json   # PWA manifest
│   └── icons/          # Icons
└── __tests__/          # Unit and integration tests
```

## Deploying to Vercel

### Prerequisite: initialize git

If you haven't already:
```bash
git init
git add .
git commit -m "initial commit"
```

### Deploy

1. Connect the repo to Vercel (via GitHub)
2. Vercel will read `package.json` automatically and configure the build
3. Add the env vars in **Settings > Environment Variables**:
   - `DATABASE_URL`
   - `NEXTAUTH_SECRET` (generate a new one, don't reuse the local one)
   - `NEXTAUTH_URL=https://baseline.vercel.app` (or your domain)
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `ADMIN_EMAIL`
   - `ADMIN_PASSWORD` (change it!)
4. Push to main/master and Vercel will auto-deploy

## Limitations and things to know

### Supabase free tier

- **Auto-suspend**: the database is paused after 1 week of inactivity. **Workaround**: open the app at least every 6 days. It's not a bug, it's there to protect privacy.
- **Max 2 concurrent connections**: with Prisma pooling (transaction mode), this isn't a problem for 5 users.
- **No real-time**: Supabase free doesn't include PostgREST real-time. This app doesn't need it.

### Vercel Hobby (free)

- **10s timeout**: serverless functions time out after 10s. Fine for the queries we run.
- **No background jobs**: no cron jobs, no scheduler. We don't need them.

### What's missing (backlog)

- [ ] "Today" screen with 6 sections (sleep, energy, mood, movement, stimulation, positive thing)
- [ ] Autosave with debounce
- [ ] Status indicator ("saved", "saving...", "not saved")
- [ ] Streak badge (consecutive days)
- [ ] Past days (edit the last 7 days, read-only beyond that)
- [ ] Monthly calendar view
- [ ] Charts (energy, mood, sleep, etc.)
- [ ] Observed correlations
- [ ] CSV/JSON export
- [ ] Admin area (allowlist manager, stats)
- [ ] Offline-first PWA with sync
- [ ] Unit and integration tests
- [ ] Seed script with 30 days of fake data

## FAQ

**Q: Why Prisma and not Drizzle?**
A: Prisma offers better DX (auto-generation, automatic migrations, great Vercel integration) for the same complexity. For 5 users and simple metrics, there's no big performance difference.

**Q: Why JSON for the complex metrics instead of separate tables?**
A: For simplicity. Normalization isn't needed for 5 users. Postgres supports queries on JSON, so if aggregates were ever needed, I could still do them.

**Q: How do I save metrics offline and sync later?**
A: During Phase 8 (PWA), I'll implement IndexedDB + a sync handler. For now, a network connection is required.

**Q: Is the admin password really secure?**
A: It's hashed with bcrypt on the server (never stored in plain text). The hash is verified in constant time (safe comparison). The admin session expires after 2 hours and can be revoked by logging out. That's enough for 5 private users, not for a public app.

## License

MIT

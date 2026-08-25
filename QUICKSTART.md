# Quick Start (5 minuti)

Hai già Supabase e Google OAuth configurati? Esegui questi comandi:

```bash
cd c:\Users\mcocca\projects\tracking-diary

# 1. Installa
npm install

# 2. Copia env
cp .env.example .env.local

# 3. Compila .env.local con:
#    DATABASE_URL=postgresql://...
#    GOOGLE_CLIENT_ID=...
#    GOOGLE_CLIENT_SECRET=...
#    NEXTAUTH_SECRET=<openssl rand -base64 32>
#    ADMIN_EMAIL=michelecocca.mc@gmail.com
#    ADMIN_PASSWORD=admin

# 4. Migrazioni
npx prisma migrate dev --name init

# 5. Allowlist (in Supabase SQL Editor)
# INSERT INTO "AllowedUser" (email, "createdBy") VALUES ('michelecocca.mc@gmail.com', 'admin');

# 6. Dev server
npm run dev

# 7. Vai a http://localhost:3000
```

**Problemi?** Leggi `SETUP.md` per la guida completa step-by-step.

**Test rapidi**:
```bash
npm test              # test unitari
npm run type-check    # TypeScript check
npm run lint          # ESLint
npm run build         # build produzione
```

**Debug**:
```bash
# Apri Prisma Studio (UI del DB)
npx prisma studio

# Mostra log Supabase
psql postgresql://...
```

---

Per la **guida completa con screenshot e spiegazioni**, vedi `SETUP.md`.

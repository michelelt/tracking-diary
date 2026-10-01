# How Are You (HAY) — Diario Minimale

Un'app web minimalista per tracciare 6 metriche personali in 2 minuti al giorno. Pensata per mobile, offline-tolerant, e costruita su stack gratuito (Vercel, Supabase free).

**Stato**: 🚧 Work in progress (Fase 1: Setup completato, auth e DB configurati)

## Requisiti

- Node.js 18+
- npm / yarn / pnpm
- Un account Google Cloud Console
- Un account Supabase (gratuito)

## Setup locale (step by step)

### 1. Clona il repo e installa dipendenze

```bash
cd tracking-diary
npm install
```

### 2. Crea un progetto Supabase e prenota la stringa di connessione

1. Vai su [supabase.com](https://supabase.com) e crea un account (gratuito)
2. Crea un nuovo progetto
3. Vai a **Settings > Database > Connection string**
4. Seleziona la tab **URI** e copia la stringa
5. Copia `.env.example` a `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
6. Incolla in `DATABASE_URL`:
   ```
   DATABASE_URL=postgresql://[user]:[password]@[host]:5432/[database]
   ```

### 3. Configura Google OAuth

1. Vai su [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuovo progetto (o selezionane uno esistente)
3. Abilita **Google+ API**
4. Vai a **Credentials > Create Credentials > OAuth 2.0 Client ID**
5. Seleziona **Web application**
6. Aggiungi questi Authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (dev locale)
   - `https://baseline.vercel.app/api/auth/callback/google` (produzione, quando deployerai)
7. Copia **Client ID** e **Client Secret** nel `.env.local`:
   ```
   GOOGLE_CLIENT_ID=...
   GOOGLE_CLIENT_SECRET=...
   ```

### 4. Genera NEXTAUTH_SECRET e NEXTAUTH_URL

```bash
# Genera un secret (esegui da terminale)
openssl rand -base64 32
```

Nel `.env.local`:
```
NEXTAUTH_SECRET=<il-valore-generato>
NEXTAUTH_URL=http://localhost:3000
```

### 5. Imposta admin email e password

Nel `.env.local`:
```
ADMIN_EMAIL=michelecocca.mc@gmail.com
ADMIN_PASSWORD=admin
```

⚠️ **IMPORTANTE**: In produzione, cambia ADMIN_PASSWORD con una stringa forte (minimo 12 caratteri, mix di maiuscole, minuscole, numeri, simboli).

### 6. Esegui migrazioni Prisma

```bash
npx prisma migrate dev --name init
```

Questo creerà le tabelle nel database Supabase e genererà il Prisma client.

### 7. Aggiungi il tuo account all'allowlist

Connettiti a Supabase Studio:
1. Vai al tuo progetto Supabase > **SQL Editor**
2. Esegui:
   ```sql
   INSERT INTO "AllowedUser" (email, "createdBy") VALUES ('michelecocca.mc@gmail.com', 'admin');
   ```

O aspetta che implementerò l'area admin per gestire l'allowlist da UI.

### 8. Avvia il dev server

```bash
npm run dev
```

Vai a `http://localhost:3000`. Dovresti vedere la schermata di login.

## Comandi disponibili

```bash
npm run dev          # Avvia Next.js in dev mode (hot reload)
npm run build        # Build per produzione
npm start            # Avvia il server build
npm run lint         # Esegui ESLint
npm run type-check   # Verifica TypeScript
npm run test         # Jest in watch mode
npm run test:ci      # Jest in CI mode
npx prisma studio   # Apri Prisma Studio (UI del DB)
npx prisma migrate dev --name [nome]  # Crea nuova migrazione
```

## Struttura del progetto

```
how-are-you/
├── app/
│   ├── (auth)/         # Login, unauthorized (non protette)
│   ├── (app)/          # Tutte le pagine app (protette da session)
│   ├── admin/          # Area admin (protetta da session + password)
│   ├── api/            # API routes
│   └── layout.tsx      # Root layout
├── lib/
│   ├── auth.ts         # NextAuth config
│   ├── db.ts           # Prisma client
│   ├── validators.ts   # Zod schemas
│   ├── types.ts        # TypeScript types
│   └── constants.ts    # Costanti (emoji, colori, etc.)
├── components/         # Componenti React
├── prisma/
│   └── schema.prisma   # Schema DB
├── public/
│   ├── manifest.json   # PWA manifest
│   └── icons/          # Icone
└── __tests__/          # Test unitari e integrazione
```

## Deploy su Vercel

### Prerequisito: inizializza git

Se non hai ancora fatto:
```bash
git init
git add .
git commit -m "initial commit"
```

### Deploy

1. Connetti il repo a Vercel (tramite GitHub)
2. Vercel leggerà automaticamente `package.json` e configurerà la build
3. Aggiungi le env vars in **Settings > Environment Variables**:
   - `DATABASE_URL`
   - `NEXTAUTH_SECRET` (genera una nuova, non riusare quella locale)
   - `NEXTAUTH_URL=https://baseline.vercel.app` (o il tuo dominio)
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `ADMIN_EMAIL`
   - `ADMIN_PASSWORD` (cambiale!)
4. Push su main/master e Vercel farà auto-deploy

## Limitazioni e cose da sapere

### Supabase free tier

- **Auto-suspend**: il database entra in pausa dopo 1 settimana di inattività. **Workaround**: accedi all'app almeno ogni 6 giorni. Non è un bug, è per proteggere la privacy.
- **Max 2 connessioni concurrent**: con Prisma pooling (transaction mode), non è problema per 5 utenti.
- **No real-time**: Supabase free non include PostgREST real-time. Non serve per questa app.

### Vercel Hobby (gratuito)

- **Timeout 10s**: serverless functions timeoutano dopo 10s. OK per le query che facciamo.
- **No background jobs**: niente cron jobs, niente scheduler. Non ce ne serve.

### Cosa manca (backlog)

- [ ] Schermata "Oggi" con 6 sezioni (sleep, energy, mood, movement, stimulation, positive thing)
- [ ] Autosalvataggio con debounce
- [ ] Indicatore di stato ("salvato", "salvataggio...", "non salvato")
- [ ] Streak badge (giorni consecutivi)
- [ ] Giorni passati (edit ultimi 7 giorni, readonly oltre)
- [ ] Vista calendario mensile
- [ ] Grafici (energia, umore, sonno, etc.)
- [ ] Correlazioni osservate
- [ ] Export CSV/JSON
- [ ] Area admin (allowlist manager, stats)
- [ ] PWA offline-first con sync
- [ ] Test unitari e integrazione
- [ ] Seed script con 30 giorni dati fake

## FAQ

**D: Perché Prisma e non Drizzle?**
R: Prisma offre miglior DX (auto-generate, migrazioni automatic, ottima integrazione Vercel) a parità di complessità. Per 5 utenti e metriche semplici, non ci sono grandi differenze di performance.

**D: Perché JSON per le metriche complesse e non tabelle separate?**
R: Per semplicità. Non serve normalizzazione per 5 utenti. Postgres supporta query su JSON, quindi se servissero aggregate, potrei farlo comunque.

**D: Come faccio a salvare le metriche offline e sincronizzare dopo?**
R: Durante la Fase 8 (PWA), implementerò IndexedDB + sync handler. Per ora, la rete è obbligatoria.

**D: La password admin è veramente sicura?**
R: Viene hashata con bcrypt lato server (mai memorizzata in chiaro). Il hash è verificato a tempo costante (confronto sicuro). La sessione admin scade dopo 2 ore e è revocabile facendo logout. È sufficiente per 5 utenti privati, non per un'app pubblica.

## License

MIT

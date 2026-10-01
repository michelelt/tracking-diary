# Setup Completo e Tutorial di Test

Questa guida ti porta dal nulla al test completo dell'app in circa 30-45 minuti.

## Prerequisiti

- Node.js 18+ (`node --version` per verificare)
- npm/yarn (`npm --version`)
- Un account Google (per OAuth)
- Un account Supabase (gratuito)
- Un editor di testo / VS Code

---

## Fase 1: Setup Locale Base

### 1.1 Clona il repo e installa dipendenze

```bash
cd c:\Users\mcocca\projects\tracking-diary

# Installa tutti i package
npm install
```

**Cosa succede**: scarica Next.js, React, Prisma, Auth.js, Tailwind, Jest, ecc. (~400MB)

**Verifica**: non ci sono errori rossi. Se vedi warnings gialli, sono okay per ora.

```bash
# Verifica Node e npm
node --version   # deve essere 18+
npm --version    # deve essere 8+
```

### 1.2 Copia il file di env

```bash
# Copia .env.example → .env.local
cp .env.example .env.local

# Su Windows (PowerShell):
Copy-Item .env.example .env.local
```

**Cosa contiene `.env.local`**: tutte le variabili, ma al momento vuote (a parte i defaults).

Verificalo:
```bash
cat .env.local
```

---

## Fase 2: Setup Supabase

### 2.1 Crea un progetto Supabase

1. Vai su https://supabase.com/
2. Clicca **"Sign Up"** (o login se hai account)
3. **New Project**:
   - Name: `hay-dev` (o come vuoi)
   - Region: `eu-west-1` (Europa, consigliato)
   - Password database: genera una password strong (copia da qualche parte)
   - Clicca **"Create new project"**

4. Aspetta 1-2 minuti che il progetto sia pronto

### 2.2 Prendi la connection string

1. Nel dashboard Supabase, vai a **Settings > Database**
2. Cerca la sezione **Connection string**
3. Seleziona il tab **URI** (non PSQL)
4. Copia la stringa completa (qualcosa come: `postgresql://postgres:[password]@[host]...`)

### 2.3 Incolla in .env.local

Apri `.env.local` e sostituisci:

```env
DATABASE_URL=postgresql://postgres:[password]@[host]:[port]/postgres
```

Esempio concreto:
```env
DATABASE_URL=postgresql://postgres:MiaPasswordForte123@db.abcdefgh.supabase.co:5432/postgres
```

**Test**: apri terminal e controlla che sia letto:
```bash
# Stampa le prime 50 char del DATABASE_URL (nasconde password)
echo $env:DATABASE_URL.Substring(0, 50)
```

---

## Fase 3: Setup Google OAuth

### 3.1 Crea un progetto Google Cloud

1. Vai su https://console.cloud.google.com/
2. In alto, clicca il dropdown "Select a Project"
3. Clicca **"NEW PROJECT"**
   - Project name: `HAY Local Dev`
   - Clicca **"CREATE"**

4. Aspetta 30 secondi che il progetto sia creato

### 3.2 Abilita Google+ API

1. Vai su **APIs & Services > Library**
2. Cerca **"Google+ API"**
3. Clicca sul primo risultato
4. Clicca il blu **"ENABLE"**

### 3.3 Configura schermata di consenso OAuth

1. Vai a **APIs & Services > OAuth consent screen**
2. Seleziona **"External"** → **"CREATE"**
3. Compila il form:
   - **App name**: `How Are You`
   - **User support email**: la tua email
   - **Developer contact information**: la tua email
   - Clicca **"SAVE AND CONTINUE"** (salta i test scope)

### 3.4 Crea OAuth 2.0 Credential

1. Vai a **APIs & Services > Credentials**
2. Clicca **"+ CREATE CREDENTIALS"** → **"OAuth 2.0 Client ID"**
3. Se ti chiede di configurare OAuth consent screen, clicca **"CONFIGURE CONSENT SCREEN"** (fatto al step 3.3)
4. Scegli **Application type**: **"Web application"**
5. **Name**: `HAY Local`
6. Sotto **Authorized redirect URIs**, clicca **"+ ADD URI"** e aggiungi:
   ```
   http://localhost:3000/api/auth/callback/google
   ```
7. Clicca **"CREATE"**

### 3.5 Copia Client ID e Secret

Vedrai un popup con:
- **Client ID** (una stringa lunga tipo `123456789-abc...`)
- **Client Secret** (un'altra stringa)

Copia entrambe in `.env.local`:

```env
GOOGLE_CLIENT_ID=123456789-abc...
GOOGLE_CLIENT_SECRET=xyz...
```

**Test**: verifica che non siano vuote:
```bash
# PowerShell
echo "ID: $env:GOOGLE_CLIENT_ID"
echo "Secret: $env:GOOGLE_CLIENT_SECRET"
```

---

## Fase 4: Genera Secret NextAuth

### 4.1 Genera un secret casuale

```bash
# Usa questo comando per generare un secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Vedrai una stringa tipo: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0`

### 4.2 Incolla in .env.local

```env
NEXTAUTH_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0
NEXTAUTH_URL=http://localhost:3000
```

---

## Fase 5: Configura Admin Email e Password

Nel `.env.local`:

```env
ADMIN_EMAIL=michelecocca.mc@gmail.com
ADMIN_PASSWORD=admin
```

Lascia così per dev locale. Faremo la verifica in Fase 7 (admin area).

---

## Fase 6: Esegui Migrazioni Prisma

### 6.1 Crea le tabelle nel database

```bash
# Questa crea le tabelle basate su prisma/schema.prisma
npx prisma migrate dev --name init
```

**Output atteso**:
```
✔ Generated Prisma Client
✔ Created migration: ./prisma/migrations/[timestamp]_init
✔ Applied migration
```

Se fallisce con errore di connessione:
- Verifica che `DATABASE_URL` sia corretto
- Verifica che non ci siano typo nella password Supabase
- Prova di nuovo

### 6.2 Verifica che le tabelle siano state create

Apri **Supabase Studio** (nel dashboard):
1. Vai al tuo progetto Supabase
2. Clicca **"SQL Editor"** nel sidebar
3. Clicca **"New query"**
4. Incolla:
   ```sql
   SELECT tablename FROM pg_tables WHERE schemaname = 'public';
   ```
5. Clicca il play ▶️ per eseguire

**Output atteso**: vedi `User`, `Account`, `Session`, `AllowedUser`, `Entry`, `AdminSession`

---

## Fase 7: Aggiungi il Tuo Account all'Allowlist

### 7.1 Usa Supabase Studio

Nel **SQL Editor** di Supabase:

```sql
INSERT INTO "AllowedUser" (email, "createdBy") 
VALUES ('michelecocca.mc@gmail.com', 'admin');
```

Clicca play ▶️

**Output atteso**: `1 row inserted`

### 7.2 Verifica

```sql
SELECT * FROM "AllowedUser";
```

Dovresti vedere una riga con la tua email.

---

## Fase 8: Avvia il Dev Server

```bash
npm run dev
```

**Output atteso**:
```
  ▲ Next.js 15.0.0
  ✓ Ready in 1.2s
  ➜  Local:        http://localhost:3000
```

Se vedi errori rossi, leggi il messaggio. Problemi comuni:
- **Port 3000 già in uso**: `npx kill-port 3000` (o riavvia terminal)
- **Prisma client non generato**: `npx prisma generate`
- **Env var mancante**: verifica `.env.local`

---

## Fase 9: Test Login Flow

### 9.1 Apri il browser

Vai a: **http://localhost:3000**

### 9.2 Vedi la schermata di login

Vedrai:
- Titolo: **"How Are You — Diario Minimale"**
- Sottotitolo: "Traccia le tue 6 metriche personali in 2 minuti al giorno"
- Bottone blu: **"Accedi con Google"**

### 9.3 Clicca "Accedi con Google"

Si apre una finestra/tab di Google dove ti chiede di:
1. Selezionare l'account Google (se ne hai più di uno)
2. Approvare che How Are You acceda al tuo profilo

Clicca **"Continua"** / **"Consenti"**

### 9.4 Verifica il flusso allowlist

**Cosa succede**:
- Google ti reindirizza a `/api/auth/callback/google`
- Auth.js cattura il token
- Il callback verifica se la tua email è in `AllowedUser` (dovrebbe esserlo)
- Ti reindirizza a `/today`

**Se tutto va bene**: vedi la schermata principale con:
- Header: "HAY" + link Oggi/Calendario/Analisi + bottone Logout
- Data di oggi in grande
- 6 sezioni vuote (Sonno, Energia, Umore, Movimento, Stimolazione, Una cosa bella)

**Se fallisce** (vedi pagina "Accesso non autorizzato"):
- Verifica che l'email sia in `AllowedUser` (controlla Supabase)
- Verifica che non ci siano typo

### 9.5 Testa la form

#### Compila Sonno:
1. Clicca "Aggiungi orari" nella sezione Sonno
2. Seleziona:
   - **A letto**: 23:30
   - **Addormentato**: 00:00
   - **Sveglio**: 07:30
3. Vedrai comparire "7.5h dormite" (auto-calcolato!)
4. Seleziona feeling: **"Bene"** (faccina verde)

#### Compila Energia:
1. Sezione Energia, trascina i slider:
   - Mattina: 7
   - Pomeriggio: 5
   - Sera: 6

#### Compila Umore:
1. Clicca **"Buono"** (faccina gialla)

#### Compila Movimento:
1. Seleziona **"Palestra"** e **"Camminata"** (chip si accendono in cyan)
2. Nel field note, scrivi: `30 min`

#### Compila Stimolazione:
1. Clicca **"Normale"** (📱)

#### Compila Una cosa bella:
1. Nel textarea, scrivi: `Ho mangiato bene con la famiglia`

### 9.6 Osserva l'Autosalvataggio

Mentre scrivi/compili:
1. In basso a destra, vedi **"Non salvato"** (grigio)
2. Aspetta 1 secondo di inattività
3. Vedi **"Salvataggio..."** (grigio con spinner)
4. Dopo 1-2 secondi, vedi **"Salvato"** (verde)
5. Dopo altri 2 secondi, scompare

**Test**: aggiorna la pagina (F5). I dati dovrebbero essere ancora lì! ✅

### 9.7 Verifica nel Database

Nel **SQL Editor** di Supabase:

```sql
SELECT * FROM "Entry" WHERE date = CURRENT_DATE;
```

Dovresti vedere una riga con tutti i tuoi dati (JSON nei campi sleep, energy, etc.).

Prova anche:
```sql
SELECT 
  date, 
  sleep, 
  energy, 
  mood, 
  movement, 
  stimulation, 
  "positiveThing"
FROM "Entry" 
WHERE date = CURRENT_DATE;
```

---

## Fase 10: Test Logout

1. Clicca il bottone **"Logout"** in alto a destra
2. Vieni reindirizzato a `/login`
3. Prova a navigare direttamente a `http://localhost:3000/today`
   - Vieni reindirizzato a login (buono, è protetta)
4. Clicca "Accedi con Google" di nuovo
5. Ti riporta a `/today` (session ricreata)

---

## Fase 11: Esegui i Test Unitari

```bash
npm test
```

**Output atteso**:
```
PASS  __tests__/calculations.test.ts
  calculateHoursSlept
    ✓ should calculate hours slept correctly
    ✓ should handle edge cases
  calculateStreak
    ✓ should return 0 for empty entries
    ...
PASS  __tests__/validators.test.ts
  ...

Test Suites: 2 passed, 2 total
Tests:       20 passed, 20 total
```

Se un test fallisce:
```bash
# Esegui un solo file per debug
npm test -- calculations.test.ts
```

---

## Fase 12: Controlla TypeScript + Lint

```bash
npm run type-check
npm run lint
```

**Output atteso**: nessun errore rosso.

Se ci sono warnings gialli, sono okay per ora.

---

## Fase 13: Testa in Tema Scuro

1. Nel browser, apri DevTools (F12)
2. Vai a **Console > Settings** (ingranaggio)
3. Abilita **"Emulate CSS media feature prefers-color-scheme"** → **"dark"**
4. Aggiorna la pagina (F5)

Vedrai che tutti i colori si adattano (grigio scuro → nero, bianco → grigio chiaro).

---

## Fase 14: Testa da Mobile (Simulato)

1. DevTools aperto (F12)
2. Premi Ctrl+Shift+M (o clicca l'icona mobile in alto)
3. Seleziona un dispositivo (es. "iPhone 14")
4. Aggiorna la pagina

Verifica:
- ✅ Layout singola colonna (non side-by-side)
- ✅ Bottoni e input hanno almeno 44px di altezza
- ✅ Testo è leggibile senza zoom
- ✅ Nessun overflow orizzontale

---

## Fase 15: Testa Build per Produzione

```bash
npm run build
```

**Output atteso**: completa senza errori.

```
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Collecting page data
...
✓ Route (app)  /today  100 B
✓ Route (app)  /login  45 B
```

---

## Troubleshooting

### "Error: invalid DATABASE_URL"

**Soluzione**:
- Copia di nuovo la stringa da Supabase
- Verifica che non abbia spazi iniziali/finali
- Verifica che la password non abbia caratteri speciali non escapati

### "Redirect mismatch" in Google OAuth

**Soluzione**:
- In Google Cloud Console, verifica che la Authorized redirect URI sia **esattamente**:
  ```
  http://localhost:3000/api/auth/callback/google
  ```
  (niente `/` finale, esattamente così)

### "Not authorized" al login

**Soluzione**:
- Apri Supabase, vai a **SQL Editor**
- Verifica che l'email sia in `AllowedUser`:
  ```sql
  SELECT * FROM "AllowedUser" WHERE email = 'michelecocca.mc@gmail.com';
  ```

### Autosalvataggio non funziona

**Soluzione**:
- Apri DevTools (F12) → **Console**
- Compila un campo e aspetta
- Dovresti vedere richieste `POST /api/entries` che arrivano
- Se no, controlla se il terminal del dev server ha errori

### Build fallisce

**Soluzione**:
```bash
# Rigenera Prisma client
npx prisma generate

# Pulisci cache
rm -r .next

# Riprova
npm run build
```

---

## Checklist Finale

Prima di dire che Fase 2 è pronta, verifica:

- [ ] ✅ `npm install` completa senza errori
- [ ] ✅ `.env.local` ha tutte le variabili piene (no placeholder)
- [ ] ✅ `npx prisma migrate dev` crea le tabelle
- [ ] ✅ Email è in `AllowedUser` in Supabase
- [ ] ✅ `npm run dev` avvia il server
- [ ] ✅ Puoi navigare a `http://localhost:3000` e vedi login
- [ ] ✅ Clicchi "Accedi con Google" e arrivi a `/today`
- [ ] ✅ Compili la form (tutte 6 sezioni)
- [ ] ✅ Vedi "Salvato" in basso a destra (autosave funziona)
- [ ] ✅ Aggiorna la pagina, i dati sono ancora lì
- [ ] ✅ Nel DB Supabase vedi una riga in `Entry`
- [ ] ✅ `npm test` passa tutti i test
- [ ] ✅ `npm run type-check` non ha errori rossi
- [ ] ✅ `npm run lint` non ha errori rossi
- [ ] ✅ `npm run build` completa senza errori

Se tutto è spuntato ✅, sei pronto per la Fase 3!

---

## Aiuto Rapido

### Vuoi resettare tutto?

```bash
# Elimina il database Supabase (warning: PERDE TUTTI I DATI)
# Nel SQL Editor di Supabase:
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;

# Poi esegui di nuovo:
npx prisma migrate dev --name init
```

### Vuoi controllare i log del server

Nel terminal dove hai `npm run dev`:
- Vedrai ogni richiesta che arriva
- I log da Prisma (se `NODE_ENV=development`)
- Gli errori in tempo reale

### Vuoi debug il flusso OAuth

Aggiungi questo in `.env.local`:
```env
DEBUG=next-auth:*
```

Riavvia il server. Vedrai debug verboso nel terminal.

---

**Hai finito il tutorial?** Pronto per la Fase 3? 🚀

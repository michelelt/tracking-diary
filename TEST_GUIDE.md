# Guida al Testing della Form e Autosalvataggio

Dopo aver completato il setup (vedi `SETUP.md`), usa questa guida per testare il comportamento dettagliato.

---

## Test 1: Autosalvataggio Basico

### Scenario: compilo la form e vedo lo stato di salvataggio

1. **Apri** http://localhost:3000/today
2. **Sezione Sonno**: clicca "Aggiungi orari"
3. **Compila**:
   - A letto: `23:00`
4. **Osserva**:
   - In basso a destra: vedi **"Non salvato"** (grigio)
   - Timer debounce: aspetta 1 secondo di inattività
   - Vedrai **"Salvataggio..."** (grigio con spinner)
   - Dopo 1-2 secondi: **"Salvato"** (verde)
   - Dopo altri 2 secondi: scompare

✅ **Successo**: il ciclo completo è visibile

❌ **Fallimento**: controlla la Console (F12) per errori di rete

---

## Test 2: Persistenza dei Dati

### Scenario: compilo un campo, lo salvo, e aggiorno la pagina

1. **Compila** la sezione Energia:
   - Mattina: trascina slider a **7**
2. **Aspetta** che diventi "Salvato" (verde)
3. **Aggiorna la pagina** (F5)
4. **Controlla**: lo slider mattina è ancora a **7**

✅ **Successo**: i dati persistono dopo refresh

❌ **Fallimento**: 
- Controlla che il POST a `/api/entries` stia partendo (DevTools → Network tab)
- Controlla che il database abbia la riga (SQL Editor Supabase)

---

## Test 3: Compilazione Parziale

### Scenario: compilo alcuni campi, lascio altri vuoti

1. **Compila solo**:
   - Energia mattina: **5**
   - Umore: **"Buono"**
2. **Lascia vuoti**:
   - Sonno
   - Movimento
   - Stimolazione
   - Una cosa bella
3. **Aspetta** "Salvato"
4. **Aggiorna la pagina**
5. **Controlla**: solo energia e umore rimangono compilati, gli altri sono ancora vuoti

✅ **Successo**: i campi opzionali rimangono vuoti (niente valori default)

---

## Test 4: Validazione Input

### Scenario: testa i limiti dei campi

#### Energy: slider deve essere 1-10
```
- Trascina slider mattina a sinistra (minimo)
- Deve essere 1, non 0
- Trascina a destra (massimo)
- Deve essere 10, non 11
- Digita a mano nel browser console:
  document.querySelector('input[type="range"]').value = '15'
  - L'input rifiuta 15 (rimane 10)
```

✅ **Successo**: i range limiti sono rispettati

#### Positive Thing: max 200 caratteri
```
- Nel textarea "Una cosa bella", scrivi 250 caratteri
- Osserva che il counter dice "200/200"
- Il testo viene troncato automaticamente
```

✅ **Successo**: il testo viene tagliato a 200

---

## Test 5: Errore di Salvataggio e Retry

### Scenario: simula un errore di rete e vedi il retry

1. **Apri DevTools** (F12) → **Network tab**
2. **Seleziona** il filter **"XHR"** (per vedere solo fetch/axios)
3. **Compila** un campo (es. energia mattina = 5)
4. **Subito dopo** il POST parte, **premi Ctrl+Shift+M** per mettere il telefono in offline
   - DevTools → Network → imposta throttling a "Offline"
5. **Vedrai** nel basso a destra: **"Errore nel salvataggio"** (rosso)
6. **Il timer** automaticamente riprova dopo 3 secondi
7. **Rimetti online** (imposta throttling a "No throttling")
8. Vedrai di nuovo il ciclo di salvataggio e poi "Salvato" (verde)

✅ **Successo**: il retry automatico funziona

❌ **Fallimento**: leggi i log della console

---

## Test 6: Calcolo Ore Dormite

### Scenario: compila orari sonno e vedi le ore calcolate automaticamente

1. **Sezione Sonno**: clicca "Aggiungi orari"
2. **Compila**:
   - A letto: `22:00`
   - Sveglio: `06:30`
3. **Osserva**: appare un badge cyan che dice **"8.5h dormite"** (auto-calcolato)
4. **Modifica** uno degli orari (es. sveglio → `08:00`)
5. **Osserva**: il badge si aggiorna a **"10h dormite"**

✅ **Successo**: il calcolo è automatico e reattivo

---

## Test 7: Streak Badge

### Scenario: il badge "🔥 N giorni consecutivi" appare/scompare

**Setup** (primo accesso):
- Primo login di oggi → badge non appare (ancora non compilato)
- Compili qualcosa e salvi → badge potrebbe non apparire subito (è calcolato al server next)

**Miglior test**: 
- Se ieri hai compilato qualcosa: compila di nuovo oggi
- Badge dovrebbe mostrare "🔥 2 giorni consecutivi"

Nota: il calcolo dello streak è ancora semplice in questa fase (non tira gli ultimi 30 giorni). Lo miglioriamo in Fase 3.

---

## Test 8: Mobile View

### Scenario: l'app funziona bene da mobile (simulato)

1. **DevTools** (F12) → **Ctrl+Shift+M** (mobile view)
2. **Seleziona** "iPhone 14" dal dropdown

**Verifiche**:
- ✅ Layout singola colonna (niente side-by-side)
- ✅ Header "HAY" è visibile
- ✅ I 6 sezioni sono uno sotto l'altro
- ✅ Bottoni e input hanno spazio (44px minimo)
- ✅ Text è leggibile senza zoom
- ✅ Save indicator in basso rimane visibile
- ✅ Nessun overflow orizzontale (non puoi fare scroll a sinistra/destra)

3. **Testa interazione**:
   - Clicca sui bottoni (chip) → devono essere facili da toccare
   - Trascina gli slider → devono essere lisci
   - Scrivi nel textarea → nessun problema

✅ **Successo**: tutto funziona bene da mobile

---

## Test 9: Dark Mode

### Scenario: testa il tema scuro

1. **DevTools** (F12) → **Console**
2. **Digita**:
   ```javascript
   document.documentElement.classList.add('dark')
   ```
3. **Osserva**: la pagina diventa scura (sfondo grigio scuro, testo chiaro)
4. **Colori contrasto**: verifica che il testo sia leggibile
5. **Accenti**: il bottone cyan dovrebbe risaltare

**Altrimenti**: il browser rispetta la preferenza di sistema
- DevTools → **Settings** (ingranaggio) → **Rendering**
- Abilita "Emulate CSS media feature prefers-color-scheme" → "dark"

✅ **Successo**: la dark mode è leggibile e coerente

---

## Test 10: Database - Verifica Dati

### Scenario: controlla che i dati siano veramente salvati nel DB

1. **Compila** la form completamente (tutte 6 sezioni)
2. **Aspetta** "Salvato"
3. **Apri Supabase** → **SQL Editor**
4. **Esegui**:
   ```sql
   SELECT 
     date, 
     sleep::text, 
     energy::text, 
     mood, 
     movement::text, 
     stimulation, 
     "positiveThing"
   FROM "Entry" 
   WHERE date = CURRENT_DATE
   ORDER BY "updatedAt" DESC
   LIMIT 1;
   ```

5. **Osserva**: una riga con tutti i dati in JSON:
   - `sleep`: `{"bedTime":"23:00","wakeUpTime":"07:00","feeling":"bene","hoursSlept":8}`
   - `energy`: `{"morning":7,"afternoon":5,"evening":6}`
   - `mood`: `"buono"`
   - `movement`: `{"types":["palestra"],"notes":"30 min"}`
   - `stimulation`: `"normale"`
   - `positiveThing`: `"Ho mangiato bene"`

✅ **Successo**: tutti i dati sono nel DB, strutturati correttamente

---

## Test 11: API Validation - Reject Invalid Data

### Scenario: testa che l'API rifiuta dati invalidi

**Apri DevTools Console e esegui**:

```javascript
// Prova a mandare energy fuori range (11 invece di 10)
fetch('/api/entries', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    date: '2024-08-25',
    energy: { morning: 11 }  // INVALIDO
  })
}).then(r => r.json()).then(console.log)
```

**Risultato atteso**: 
```json
{ "error": "Failed to save entry" }
```
(La validazione Zod rifiuta il valore 11)

✅ **Successo**: la validazione lato server blocca input invalidi

---

## Test 12: Unit Tests

### Esegui i test

```bash
npm test
```

**Output atteso**:
```
PASS  __tests__/calculations.test.ts (5 test suites)
  calculateHoursSlept
    ✓ should calculate hours slept correctly
    ✓ should handle edge cases
  calculateStreak
    ✓ should return 0 for empty entries
    ✓ ...
  
  20 passed, 20 total
```

**Se un test fallisce**:
```bash
# Esegui un file specifico per debug
npm test -- calculations.test.ts

# Esegui un test specifico
npm test -- -t "calculateHoursSlept"
```

✅ **Successo**: tutti gli 20 test passano

---

## Test 13: Build e Production Check

```bash
npm run build
```

**Output atteso**: nessun errore, build completa

```bash
npm start
```

Visita http://localhost:3000 di nuovo. Dovrebbe funzionare esattamente come in dev.

✅ **Successo**: la build per produzione è pulita

---

## Checklist Finale di Testing

- [ ] ✅ Autosalvataggio cicla idle → unsaved → saving → saved
- [ ] ✅ Dati persistono dopo refresh
- [ ] ✅ Campi opzionali rimangono vuoti
- [ ] ✅ Energy slider minimo 1, massimo 10
- [ ] ✅ Positive thing max 200 caratteri
- [ ] ✅ Errore di rete → "Errore nel salvataggio" → retry auto dopo 3s
- [ ] ✅ Ore dormite calcolate automaticamente
- [ ] ✅ Layout responsive su mobile
- [ ] ✅ Dark mode è leggibile
- [ ] ✅ Dati nel database sono corretti (JSON strutturato)
- [ ] ✅ API rifiuta input invalidi (Zod validation)
- [ ] ✅ Unit test passano (npm test)
- [ ] ✅ Build va a buon fine (npm run build)

Se tutto è spuntato, **Fase 2 è PRONTA per la production**! 🎉

---

**Prossima fase**: Giorni passati + Calendario + Grafici

Per domande dettagliate su ogni test, vai a `SETUP.md`.

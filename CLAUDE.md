@AGENTS.md

# Poly Assistant

<!-- REGOLE COMUNI FUTURE AI — INIZIO (blocco copiato in automatico da _azienda/regole-progetti: non modificarlo qui, cambia il file originale) -->
## Regole comuni FUTURE AI

Questo progetto è di **FUTURE AI di Sidoni Manuel** (Rovetta, BG — info@futureai.it). Chi ti scrive è Manuel, spesso dal telefono mentre è fuori.

**Come parlare**
- Sempre in italiano, tono diretto e semplice, senza gergo tecnico.
- Spiega cosa hai trovato e cosa hai cambiato in poche righe, come lo diresti a un artigiano.
- Se hai provato solo con dati finti o in anteprima, dillo chiaro: «provato in anteprima», non «fatto».

**Pubblicare (la regola più importante)**
- Un push su `main` va **in produzione**: il sito o l'app cambia subito per i clienti veri.
- Lavora sempre su un **ramo a parte**. Vercel crea da solo il link di anteprima del ramo: dallo a Manuel perché lo provi.
- **Mai push o merge su `main` senza un ok esplicito di Manuel** in questa conversazione («ok, unisci», «pubblica»).
- Mai `vercel deploy` dal terminale: il progetto pubblica da solo da GitHub, un deploy per commit.
- Più correzioni sullo stesso progetto: raggruppale in un'unica pubblicazione, se Manuel non dice diversamente.

**Sicurezza e dati**
- Non leggere, non stampare e non modificare file `.env` o credenziali; non chiedere password o token.
- Non cancellare dati e non lanciare modifiche al database. Se serve una modifica al database (tabelle, colonne, policy), scrivi l'SQL in un file e spiegalo a Manuel: la lancia lui a mano.
- Su Supabase la sicurezza a livello di riga (RLS) resta sempre attiva. Ricorda che Supabase restituisce al massimo 1000 righe per lettura: se servono tutte, pagina.
- Non cambiare il sistema di invio delle email (mittente, servizio) senza chiedere.

**Cose che non si tolgono mai**
- La **firma FUTURE AI** nel piè di pagina.
- Il **simbolo del sito** (favicon) del cliente: mai rimettere il triangolo di Vercel o di Next.
- Il **banner dei cookie** con consenso e le pagine privacy/cookie, se ci sono.
- Il file **`/llms.txt`**, se c'è: aggiornalo quando cambiano servizi, orari, prezzi o contatti.

**Prima di dire che è fatto**
- Verifica che la build passi e prova la parte che hai toccato, anche da telefono (schermo stretto).
- Controlla di non aver rotto altro nella stessa pagina.

**Tieni aggiornate le note qui sotto**
- Se cambi qualcosa di importante (dove stanno le cose, come funziona una parte, una trappola scoperta), aggiorna la sezione «Note del progetto» **nello stesso commit**.
- Scrivi solo cose utili alla prossima persona che ci lavora, in breve.
<!-- REGOLE COMUNI FUTURE AI — FINE -->

## Note del progetto
- Prodotto/strumento interno di FUTURE AI, non un cliente. Chat su documenti caricati (PDF, Word) con Claude, archivio su Supabase.
- ⚠️ Non metterci documenti o dati aziendali veri del reparto: per quello esiste un'app separata.
- Next.js: API in `src/app/api/` (chat, chat-expert, chat-filiere, upload), risposte in streaming (Edge Runtime).

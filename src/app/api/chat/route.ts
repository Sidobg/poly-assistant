import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { supabaseAdmin } from '@/lib/supabase'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

const SYSTEM_PROMPT = `Sei Poly Assistant, l'assistente AI del reparto Polimerizzazione di Radici Yarn — stabilimento di Villa d'Ogna (BG).
Rispondi come un collega esperto di reparto: pratico, diretto, con riferimenti specifici a macchinari, quote, e procedure reali dell'impianto.

CONOSCENZA DELL'IMPIANTO:

COLONNE DI POLIMERIZZAZIONE:
- Colonna A: attiva. Produce PA6 neutro e opaco (viscosità da 2,4 a 4,03). Prodotti tipici: Neutro 2,40 (con CPL recupero), Neutro 3,20, Neutro 3,50, Neutro 3,76, Neutro 3,87, Neutro 3,98, Neutro 4,03. Alcuni con acido acetico.
- Colonna B: attiva. Produce PA6 neutro, lucido e super opaco (viscosità da 2,4 a 3,2). Prodotti: Neutro 2,40, S.Lucido 2,40, S.Opaco 2,40, Neutro 2,70, Neutro 3,20.
- Colonna C: attiva. Produce PA6 neutro, opaco e super opaco (viscosità da 2,4 a 2,7). Prodotti: Neutro 2,40, Opaco 2,42, S.Opaco 2,40, Neutro 2,70.
- Colonna D: attiva. Produce PA6 lucido, super opaco, neutro e opaco (viscosità da 2,4 a 2,7). Prodotti: S.Lucido 2,40, S.Opaco 2,40, Neutro 2,40, Opaco 2,42, Neutro 2,70.
- Colonna E: normalmente attiva ma ATTUALMENTE IN COLLAUDO/FERMA. Produce Neutro con CPL di recupero (viscosità 2,7). Il recupero lattame che normalmente va nella E ora va nella B.
- Colonna F: ATTUALMENTE FERMA.
- Colonna G: attiva. Produce PA6 neutro, opaco, super opaco e lubrificato (viscosità da 2,4 a 3,98). Prodotti: Neutro 2,40, Opaco 2,42, S.Opaco "F" 2,40, Extra S.Opaco "F" 2,40, Lubrificato 3,98, Neutro 2,70.

TIPI DI PRODOTTO:
- Neutro: titanio = 0, trasparente
- Opaco: titanio ~0,43%, bianco
- Super Opaco (S.Opaco): titanio ~1,28%, molto bianco
- S.Lucido: titanio ~0,03%, leggermente lucido
- Extra Super Opaco: titanio ~1,6%
- Lubrificato: viscosità 3,98, con additivo lubrificante
- Con acido acetico: regolatore di catena
- Con CPL recupero: usa caprolattame recuperato dall'impianto di concentrazione

SILOS STOCCAGGIO PA6 (numeri reali):
Silos 102-129 per PA6. Ogni silo contiene un prodotto specifico. Capacità variabile, stoccaggio totale ~1.178 tonnellate.
Silos PA66: U1A, U1B (umido E1), U2A, U2B (umido E2), U3A, U3B (umido OC), U5A, U5B (umido E5), S1A, S1B (secco E1), S2A, S2B (secco E2), S3A, S3B, S3C, S3D (riciclato), S5A, S5B.

IMPIANTO DI CONCENTRAZIONE (recupero lattame):
Impianto Concentrazione B (attivo) — Concentrazione A attualmente fermo.
- C1B (primo concentratore): concentrazione ~14,7%, temperatura 143°C, pressione 4,5 Bar ingresso / 3,8 Bar uscita
- C2B (secondo concentratore): concentrazione ~24,6%, temperatura 140°C
- C3B (terzo concentratore): concentrazione ~82,7%, temperatura ~131°C (range target 83-84%), pressione 1,6 Bar
- Portate: FIT100 ~297 L/h, FIT101 ~196 L/h, FIT102 ~193 L/h
- Pompe: P1 (dopo C1B), P2 (dopo C2B), P3 (dopo C3B)
- Valvole: CV101 (tra C1B e C2B), CV102 (tra C2B e C3B), CV100b (carico da impianto)
- Il lattame recuperato dal C3B (~83-84%) va normalmente nella colonna E. Con E ferma, va nella colonna B.
- Vapore ingresso a 6,1 Bar (vapore 10 bar ridotto), preriscaldo con vapore 3 bar e 6 bar
- Misurazione rifrattometro per controllo concentrazione
- Condensazione comune per recupero condense

CIRCUITO ACQUE LATTAMICHE:
- Vasca 18: raccoglie tutte le acque dai lavaggi
- Vasca 1: acqua lattamica (H2O lattamica), livello ~23,8 mc. Condense camicie CPL con vapore 3 bar
- DEMI 1A e 1B: demineralizzatori (PL1 MAN, PL2 AUT)
- Vasca 13: H2O lattamica demi, livello ~32,9 mc. Target ~8% CPL. Si regola tramite i giri dei concentratori. Reintegro ~294 L/h
- Condense dai concentratori → Vasca 3 (condensa grezza, ~21,2 mc, temperatura ~72°C)
- DEMI 2A e 2B: secondo stadio demineralizzazione
- Vasca 2: condensa demineralizzata, ~51,6 mc
- Osmosi: ulteriore purificazione (pressione ~10 Bar, pompe PML1 e PML2)
- Vasca 12: H2O demi (acqua depurata), ~53,1 mc. Valvole V001-V004
- Vasche 14 e 16: stoccaggio addizionale
- Serbatoi CPL recupero: G1 (260 mc), G2, GR (256,7 mc) — caprolattame di recupero per colonne

ORGANIZZAZIONE REPARTO:
- Quote (piani): qt -4 (cantina), qt 0 (piano terra), qt 4, qt 7,5, qt 11, qt 15 (ultimo piano), qt 20 (tetto)
- Operatore qt 15: monitora pressioni e portate di TUTTE le colonne, controlla livelli, temperature, impianto concentrazione. In caso di problemi avvisa il capoturno per telefono.
- Operatore qt 4 / jolly: taglierine, temperature, pulizia, filiere, carico/scarico camion
- Capoturno: coordina, gestisce emergenze, decide su fermate e ripartenze
- Turni: 3 turni (mattina, pomeriggio, notte)

PROBLEMI FREQUENTI (settimanali):
- Intasamento pompe lavatore/prelavatore
- Cambio filtro polimero per pressioni alte
- Fresa taglierina rovinata (soprattutto col super opaco che è più abrasivo)
- Guasti meccanici a valvole
- Anomalie impianto concentrazione (livelli, pressioni, temperature)

REGOLE DI RISPOSTA:
1. Rispondi basandoti PRIMA sui documenti interni forniti nel contesto
2. Se il contesto contiene informazioni pertinenti, usale e indica [FONTE: Documentazione interna]
3. Se il contesto NON contiene informazioni sufficienti, rispondi usando la tua conoscenza dell'impianto descritta sopra e indica [FONTE: Conoscenze AI - verificare con responsabile]
4. Usa sempre riferimenti specifici: nomi vasche, numeri silos, codici prodotto, quote, nomi strumenti
5. Rispondi in modo OPERATIVO: cosa controllare → come farlo → dove andare (quota e posizione)
6. Rispondi SOLO a domande pertinenti al reparto polimerizzazione
7. Rispondi in italiano, usa il gergo di reparto (lattame, CPL, condense, qt, ecc.)
8. Per problemi critici o di sicurezza, ricorda SEMPRE di contattare il capoturno

CONTESTO DAI DOCUMENTI INTERNI:
{context}`

export async function POST(request: NextRequest) {
  try {
    const { message, history = [], department = 'poly' } = await request.json()

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Messaggio non valido' }, { status: 400 })
    }

    // Cerca documenti rilevanti con full-text search + fallback ILIKE
    let context = 'Nessun documento interno pertinente trovato.'

    try {
      // 1. Prova full-text search
      const { data: ftsResults, error: ftsError } = await supabaseAdmin
        .rpc('search_documents', {
          search_query: message,
          dept: department,
          match_count: 8,
        })

      if (!ftsError && ftsResults && ftsResults.length > 0) {
        const contextParts = ftsResults.map((r: { document_name: string; content: string }) =>
          `[Documento: ${r.document_name}]\n${r.content}`
        )
        context = contextParts.join('\n\n---\n\n')
      } else {
        // 2. Fallback: cerca con ILIKE su parole chiave della domanda
        const keywords = message
          .toLowerCase()
          .replace(/[^a-zàèéìòùA-Z0-9\s]/g, ' ')
          .split(/\s+/)
          .filter(w => w.length > 3)
          .slice(0, 3)

        if (keywords.length > 0) {
          const likePattern = `%${keywords[0]}%`
          const { data: likeResults, error: likeError } = await supabaseAdmin
            .from('document_chunks')
            .select('content, documents!inner(name)')
            .eq('documents.department', department)
            .ilike('content', likePattern)
            .limit(5)

          if (!likeError && likeResults && likeResults.length > 0) {
            const contextParts = likeResults.map((r: { content: string; documents: { name: string } | { name: string }[] }) => {
              const docName = Array.isArray(r.documents) ? r.documents[0]?.name : r.documents?.name
              return `[Documento: ${docName}]\n${r.content}`
            })
            context = contextParts.join('\n\n---\n\n')
          }
        }

        if (ftsError) {
          console.error('FTS error:', ftsError)
        }

        // 3. Fallback finale: invia i chunk più recenti come contesto generico
        if (context === 'Nessun documento interno pertinente trovato.') {
          const { data: fallbackChunks } = await supabaseAdmin
            .from('document_chunks')
            .select('content, documents!inner(name)')
            .eq('documents.department', department)
            .order('id', { ascending: false })
            .limit(5)

          if (fallbackChunks && fallbackChunks.length > 0) {
            const contextParts = fallbackChunks.map((r: { content: string; documents: { name: string } | { name: string }[] }) => {
              const docName = Array.isArray(r.documents) ? r.documents[0]?.name : r.documents?.name
              return `[Documento: ${docName}]\n${r.content}`
            })
            context = contextParts.join('\n\n---\n\n')
          }
        }
      }
    } catch (searchError) {
      console.error('Errore ricerca documenti:', searchError)
    }

    const systemPrompt = SYSTEM_PROMPT.replace('{context}', context)

    // Costruisci la cronologia messaggi
    const messages: Anthropic.MessageParam[] = [
      ...history.slice(-10), // Mantieni solo gli ultimi 10 messaggi
      { role: 'user', content: message }
    ]

    // Streaming response
    const encoder = new TextEncoder()

    const stream = new ReadableStream({
      async start(controller) {
        try {
          const anthropicStream = await anthropic.messages.stream({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 4096,
            system: systemPrompt,
            messages,
          })

          for await (const event of anthropicStream) {
            if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
              const data = JSON.stringify({ type: 'text', content: event.delta.text })
              controller.enqueue(encoder.encode(`data: ${data}\n\n`))
            }
          }

          // Segnala la fine dello stream
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'done' })}\n\n`))
          controller.close()
        } catch (streamError) {
          console.error('Errore streaming:', streamError)
          const errorData = JSON.stringify({ type: 'error', content: 'Errore durante la generazione della risposta' })
          controller.enqueue(encoder.encode(`data: ${errorData}\n\n`))
          controller.close()
        }
      }
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })

  } catch (error) {
    console.error('Errore chat:', error)
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 })
  }
}

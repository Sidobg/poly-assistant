import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const FILIERE_SYSTEM = `Lavori nello stabilimento Radici Yarn di Villa d'Ogna (BG), reparto filatura (POY). Conosci le filiere utilizzate per l'estrusione di filo nylon PA6, PA66 e PA6.10.

Sei un esperto analista di filiere per estrusione di polimeri nylon (PA6, PA66, PA6.10).

Il tuo compito è analizzare filiere per la produzione di filo nylon, sia tramite descrizioni testuali che tramite analisi di immagini.

PROCEDURA:
1. Se l'utente non ha ancora fornito informazioni sulla filiera, chiedi in modo conversazionale:
   - Tipo di filiera (rotonda, rettangolare, anulare)
   - Materiale (acciaio inox, lega speciale, ecc.)
   - Polimero in lavorazione (PA6, PA66, PA6.10)
   - Numero capillari dichiarato
   - Temperatura di esercizio approssimativa
   - Data ultimo intervento di pulizia/manutenzione
   - Eventuali problemi riscontrati (rotture filo, disuniformità, ecc.)
   NON chiedere tutto insieme — fai 2-3 domande alla volta in modo naturale.

2. Quando l'utente carica un'immagine di una filiera, analizza DETTAGLIATAMENTE:
   - STATO GENERALE: condizioni complessive della filiera
   - CAPILLARI/FORI: stato di usura, forma, dimensioni visibili, regolarità
   - DISTRIBUZIONE: simmetria e spaziatura dei fori, eventuali pattern irregolari
   - SUPERFICIE: presenza di depositi, residui polimerici, corrosione, graffi
   - OSTRUZIONI: fori parzialmente o totalmente ostruiti
   - PULIZIA: necessità di intervento (urgente/programmata/non necessaria)
   - CONFRONTO: coerenza con le specifiche dichiarate dall'utente
   - MIGLIORIE: suggerimenti per ottimizzare layout, dimensioni, materiali
   - VITA RESIDUA: stima approssimativa basata sull'usura visibile

3. Alla fine di ogni analisi, fornisci:
   - Un PUNTEGGIO SALUTE FILIERA da 1 a 10 (1=da sostituire, 10=perfetta)
   - Una RACCOMANDAZIONE chiara (continuare produzione / programmare pulizia / pulizia urgente / sostituzione)
   - PROSSIMI PASSI suggeriti

REGOLE:
- Sii preciso e tecnico ma comprensibile
- Se non riesci a determinare qualcosa dall'immagine, dichiaralo onestamente
- Non inventare dati che non puoi verificare dall'immagine
- Rispondi in italiano
- Per problemi critici, ricorda sempre di contattare il responsabile di reparto`

export async function POST(request: NextRequest) {
  try {
    const { message, history, imageBase64, imageMediaType } = await request.json()

    type ContentBlock =
      | { type: 'image'; source: { type: 'base64'; media_type: string; data: string } }
      | { type: 'text'; text: string }

    const userContent: ContentBlock[] | string =
      imageBase64 && imageMediaType
        ? [
            {
              type: 'image',
              source: { type: 'base64', media_type: imageMediaType, data: imageBase64 },
            },
            { type: 'text', text: message },
          ]
        : message

    const messages = [
      ...(history || []).slice(-10),
      {
        role: 'user' as const,
        content: userContent,
      },
    ]

    const encoder = new TextEncoder()

    const stream = new ReadableStream({
      async start(controller) {
        try {
          const response = await anthropic.messages.create({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 4096,
            system: FILIERE_SYSTEM,
            messages,
            stream: true,
          })

          for await (const event of response) {
            if (
              event.type === 'content_block_delta' &&
              event.delta.type === 'text_delta'
            ) {
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({ type: 'text', content: event.delta.text })}\n\n`
                )
              )
            }
          }

          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: 'done' })}\n\n`)
          )
          controller.close()
        } catch (error) {
          const msg = error instanceof Error ? error.message : 'Errore sconosciuto'
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: 'error', content: msg })}\n\n`)
          )
          controller.close()
        }
      },
    })

    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    })
  } catch (error) {
    console.error('Errore chat-filiere:', error)
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 })
  }
}

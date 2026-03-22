import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const POLY_EXPERT_SYSTEM = `Sei Poly Expert, un MASSIMO ESPERTO di:
- Chimica dei polimeri PA6 (Nylon 6 da caprolattame) e PA66 (Nylon 66)
- Cinetica di polimerizzazione, reologia, cristallizzazione, degradazione
- Impiantistica chimica: reattori, colonne, scambiatori, pompe, valvole, strumentazione
- Meccanica industriale: motori, riduttori, pompe, filtri, taglierine, essiccatori
- Normative sicurezza impianti chimici

REGOLE:
1. Rispondi SOLO a domande pertinenti a: polimerizzazione, chimica polimeri, caprolattame, meccanica, impiantistica
2. Se la domanda NON è pertinente, rifiuta educatamente
3. NON hai accesso a documenti interni. Rispondi dalle tue conoscenze tecniche
4. Sii preciso, tecnico ma comprensibile per un operaio esperto
5. Se viene allegata un'immagine, analizzala in dettaglio tecnico
6. Rispondi in italiano
7. Per problemi critici, ricorda di contattare il responsabile

Alla fine di ogni risposta aggiungi sempre: [FONTE: Conoscenze AI — verificare con responsabile]`

const POY_EXPERT_SYSTEM = `Sei Poly Expert — Filatura, un MASSIMO ESPERTO di:
- Estrusione e filatura di nylon PA6, PA66 e PA6.10
- Processo di fusione, estrusione attraverso filiere, raffreddamento, stiro e bobinatura
- Proprietà dei polimeri: viscosità del fuso, cristallizzazione, orientazione molecolare
- Filiere: design, materiali, geometria capillari, distribuzione fori, usura
- Parametri di processo: temperature, velocità di estrusione, rapporti di stiro, tensioni
- Difetti del filo: cause, diagnosi e soluzioni (rotture, disuniformità, nodi)
- Macchinari: estrusori, pompe di dosaggio, pacchi filiera, godet, winder, sistemi di raffreddamento
- Controllo qualità: titolo (dtex), tenacità, allungamento, uniformità

REGOLE:
1. Rispondi SOLO a domande pertinenti a: filatura, estrusione, nylon, filiere, qualità filo
2. Se la domanda NON è pertinente, rifiuta educatamente
3. NON hai accesso a documenti interni. Rispondi dalle tue conoscenze tecniche
4. Sii preciso, tecnico ma comprensibile per un operaio esperto
5. Se viene allegata un'immagine, analizzala in dettaglio tecnico
6. Rispondi in italiano
7. Per problemi critici, ricorda di contattare il responsabile

Alla fine di ogni risposta aggiungi sempre: [FONTE: Conoscenze AI — verificare con responsabile]`

export async function POST(request: NextRequest) {
  try {
    const { message, history, imageBase64, imageMediaType, department = 'poly' } =
      await request.json()

    const systemPrompt = department === 'poy' ? POY_EXPERT_SYSTEM : POLY_EXPERT_SYSTEM

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
            max_tokens: 2048,
            system: systemPrompt,
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
    console.error('Errore chat-expert:', error)
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 })
  }
}

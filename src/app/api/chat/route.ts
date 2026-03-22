import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { supabaseAdmin } from '@/lib/supabase'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

const SYSTEM_PROMPT = `Sei Poly Assistant, l'esperto AI del reparto Polimerizzazione di Radici Yarn.
Sei un MASSIMO ESPERTO di chimica dei polimeri PA6/PA66, caprolattame, impiantistica chimica e meccanica industriale.

REGOLE:
1. Rispondi basandoti PRIMA sui documenti interni forniti nel contesto
2. Se il contesto contiene informazioni pertinenti, usale e indica [FONTE: Documentazione interna]
3. Se il contesto NON contiene informazioni sufficienti, rispondi dalle tue conoscenze tecniche e indica [FONTE: Conoscenze AI - verificare con responsabile]
4. Rispondi SOLO a domande pertinenti a: polimerizzazione, chimica, meccanica, impiantistica
5. Sii preciso, tecnico ma comprensibile
6. Rispondi in italiano

CONTESTO DAI DOCUMENTI INTERNI:
{context}`

export async function POST(request: NextRequest) {
  try {
    const { message, history = [] } = await request.json()

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Messaggio non valido' }, { status: 400 })
    }

    // Cerca documenti rilevanti con full-text search
    let context = 'Nessun documento interno pertinente trovato.'

    try {
      const { data: searchResults, error: searchError } = await supabaseAdmin
        .rpc('search_documents', {
          search_query: message,
          match_count: 8,
        })

      if (!searchError && searchResults && searchResults.length > 0) {
        const contextParts = searchResults.map((r: { document_name: string; content: string }, i: number) =>
          `[Documento: ${r.document_name}]\n${r.content}`
        )
        context = contextParts.join('\n\n---\n\n')
      }
    } catch (searchError) {
      console.error('Errore ricerca documenti:', searchError)
      // Continua senza contesto
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
            max_tokens: 2048,
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

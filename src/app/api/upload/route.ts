import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

function splitIntoChunks(text: string, chunkSize = 500, overlap = 50): string[] {
  const words = text.split(/\s+/).filter(w => w.length > 0)
  const chunks: string[] = []

  let i = 0
  while (i < words.length) {
    const chunk = words.slice(i, i + chunkSize).join(' ')
    if (chunk.trim().length > 0) {
      chunks.push(chunk.trim())
    }
    i += chunkSize - overlap
  }

  return chunks
}

async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pdfParseModule = (await import('pdf-parse')) as any
  const pdfParse = pdfParseModule.default ?? pdfParseModule
  const data = await pdfParse(buffer)
  return data.text
}

async function extractTextFromDOCX(buffer: Buffer): Promise<string> {
  const mammoth = await import('mammoth')
  const result = await mammoth.extractRawText({ buffer })
  return result.value
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'Nessun file fornito' }, { status: 400 })
    }

    const fileType = file.name.toLowerCase().endsWith('.pdf') ? 'pdf'
                   : file.name.toLowerCase().endsWith('.docx') ? 'docx'
                   : null

    if (!fileType) {
      return NextResponse.json({ error: 'Formato file non supportato. Usa PDF o DOCX.' }, { status: 400 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    let text: string
    try {
      if (fileType === 'pdf') {
        text = await extractTextFromPDF(buffer)
      } else {
        text = await extractTextFromDOCX(buffer)
      }
    } catch (extractError) {
      console.error('Errore estrazione testo:', extractError)
      return NextResponse.json({ error: 'Errore durante l\'estrazione del testo dal documento' }, { status: 500 })
    }

    if (!text || text.trim().length === 0) {
      return NextResponse.json({ error: 'Il documento non contiene testo estraibile' }, { status: 400 })
    }

    // Salva il documento nel database
    const { data: document, error: docError } = await supabaseAdmin
      .from('documents')
      .insert({ name: file.name, type: fileType })
      .select()
      .single()

    if (docError) {
      console.error('Errore salvataggio documento:', docError)
      return NextResponse.json({ error: 'Errore durante il salvataggio del documento' }, { status: 500 })
    }

    // Dividi in chunk e salva
    const chunks = splitIntoChunks(text)

    const chunkInserts = chunks.map((content, index) => ({
      document_id: document.id,
      content,
      chunk_index: index,
    }))

    // Inserisci in batch da 50
    const batchSize = 50
    for (let i = 0; i < chunkInserts.length; i += batchSize) {
      const batch = chunkInserts.slice(i, i + batchSize)
      const { error: chunkError } = await supabaseAdmin
        .from('document_chunks')
        .insert(batch)

      if (chunkError) {
        // Rollback: elimina il documento (cascade eliminerà i chunk)
        await supabaseAdmin.from('documents').delete().eq('id', document.id)
        console.error('Errore salvataggio chunk:', chunkError)
        return NextResponse.json({ error: 'Errore durante il salvataggio dei contenuti' }, { status: 500 })
      }
    }

    return NextResponse.json({
      success: true,
      document: {
        id: document.id,
        name: document.name,
        type: document.type,
        chunks: chunks.length,
      }
    })

  } catch (error) {
    console.error('Errore upload:', error)
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const { data: documents, error } = await supabaseAdmin
      .from('documents')
      .select('id, name, type, created_at')
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: 'Errore caricamento documenti' }, { status: 500 })
    }

    return NextResponse.json({ documents })
  } catch (error) {
    console.error('Errore GET documenti:', error)
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID documento mancante' }, { status: 400 })
    }

    const { error } = await supabaseAdmin
      .from('documents')
      .delete()
      .eq('id', id)

    if (error) {
      return NextResponse.json({ error: 'Errore eliminazione documento' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Errore DELETE documento:', error)
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q') ?? 'test'

  // 1. Conta i documenti
  const { data: docs, error: docsError } = await supabaseAdmin
    .from('documents')
    .select('id, name, type')

  // 2. Conta i chunk
  const { count: chunkCount, error: chunkError } = await supabaseAdmin
    .from('document_chunks')
    .select('id', { count: 'exact', head: true })

  // 3. Prova la search
  const { data: searchResults, error: searchError } = await supabaseAdmin
    .rpc('search_documents', { search_query: q, match_count: 5 })

  // 4. Prova un chunk raw per vedere se fts è popolato
  const { data: sampleChunk, error: sampleError } = await supabaseAdmin
    .from('document_chunks')
    .select('id, content, chunk_index')
    .limit(2)

  return NextResponse.json({
    documents: { data: docs, error: docsError },
    chunkCount: { count: chunkCount, error: chunkError },
    search: { query: q, results: searchResults, error: searchError },
    sampleChunks: { data: sampleChunk, error: sampleError },
  })
}

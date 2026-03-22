-- Abilita l'estensione vector
create extension if not exists vector;

-- Tabella documenti
create table documents (
  id bigserial primary key,
  name text not null,
  type text, -- 'pdf', 'docx', 'xlsx'
  department text default 'poly', -- 'poly' | 'poy'
  created_at timestamp with time zone default now()
);

-- Migrazione: aggiunge colonna department se non esiste (eseguire sul DB esistente)
-- ALTER TABLE documents ADD COLUMN IF NOT EXISTS department text DEFAULT 'poly';

-- Tabella chunks con embeddings
create table document_chunks (
  id bigserial primary key,
  document_id bigint references documents(id) on delete cascade,
  content text not null,
  chunk_index integer,
  embedding vector(1024),
  created_at timestamp with time zone default now()
);

-- Indice per ricerca vettoriale
create index on document_chunks using ivfflat (embedding vector_cosine_ops) with (lists = 100);

-- Colonna per full-text search
alter table document_chunks add column fts tsvector
  generated always as (to_tsvector('italian', content)) stored;

-- Indice full-text
create index on document_chunks using gin(fts);

-- Funzione di ricerca full-text con filtro per reparto
create or replace function search_documents(
  search_query text,
  dept text default 'poly',
  match_count int default 10
)
returns table (
  id bigint,
  document_id bigint,
  content text,
  document_name text,
  rank float
)
language plpgsql
as $$
begin
  return query
  select
    dc.id,
    dc.document_id,
    dc.content,
    d.name as document_name,
    ts_rank(dc.fts, websearch_to_tsquery('italian', search_query))::float as rank
  from document_chunks dc
  join documents d on d.id = dc.document_id
  where dc.fts @@ websearch_to_tsquery('italian', search_query)
    and d.department = dept
  order by rank desc
  limit match_count;
end;
$$;

-- Funzione per ricerca semantica (per uso futuro con embeddings)
create or replace function match_documents(
  query_embedding vector(1024),
  match_threshold float default 0.7,
  match_count int default 5
)
returns table (
  id bigint,
  document_id bigint,
  content text,
  document_name text,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    dc.id,
    dc.document_id,
    dc.content,
    d.name as document_name,
    1 - (dc.embedding <=> query_embedding) as similarity
  from document_chunks dc
  join documents d on d.id = dc.document_id
  where 1 - (dc.embedding <=> query_embedding) > match_threshold
  order by dc.embedding <=> query_embedding
  limit match_count;
end;
$$;

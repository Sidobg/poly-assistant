'use client'

import { useState, useEffect, useRef } from 'react'

interface Document {
  id: number
  name: string
  type: string
  created_at: string
}

export default function Upload() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isDragging, setIsDragging] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const loadDocuments = async () => {
    try {
      const response = await fetch('/api/upload')
      const data = await response.json()
      if (data.documents) {
        setDocuments(data.documents)
      }
    } catch (error) {
      console.error('Errore caricamento lista:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadDocuments()
  }, [])

  const handleUpload = async (file: File) => {
    if (!file) return

    const validTypes = ['.pdf', '.docx']
    const extension = '.' + file.name.split('.').pop()?.toLowerCase()
    if (!validTypes.includes(extension)) {
      setUploadError('Formato non supportato. Usa PDF o DOCX.')
      return
    }

    setIsUploading(true)
    setUploadError(null)
    setUploadSuccess(null)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Errore durante il caricamento')
      }

      setUploadSuccess(`"${data.document.name}" caricato con successo (${data.document.chunks} sezioni indicizzate)`)
      await loadDocuments()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Errore durante il caricamento'
      setUploadError(errorMessage)
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Eliminare il documento "${name}"? Questa azione non può essere annullata.`)) return

    try {
      const response = await fetch(`/api/upload?id=${id}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Errore eliminazione')
      setDocuments(prev => prev.filter(d => d.id !== id))
    } catch (error) {
      setUploadError('Errore durante l\'eliminazione del documento')
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleUpload(file)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('it-IT', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    })
  }

  const getTypeIcon = (type: string) => {
    return type === 'pdf' ? '📄' : '📝'
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-700 bg-gray-900">
        <h2 className="text-white font-semibold text-lg">Carica Documenti</h2>
        <p className="text-gray-400 text-sm">Carica manuali, procedure e schede tecniche in formato PDF o DOCX</p>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Upload Area */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => !isUploading && fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-blue-500 bg-blue-900/20'
              : isUploading
              ? 'border-gray-600 bg-gray-800/30 cursor-not-allowed'
              : 'border-gray-600 hover:border-blue-500 hover:bg-gray-800/30'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx"
            className="hidden"
            onChange={e => {
              const file = e.target.files?.[0]
              if (file) handleUpload(file)
            }}
            disabled={isUploading}
          />

          {isUploading ? (
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
              <p className="text-blue-400 font-medium">Elaborazione in corso...</p>
              <p className="text-gray-500 text-sm">Estrazione testo e indicizzazione</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className="text-5xl">📁</div>
              <div>
                <p className="text-white font-medium">Trascina qui il file o clicca per selezionarlo</p>
                <p className="text-gray-400 text-sm mt-1">Supporta PDF e DOCX</p>
              </div>
            </div>
          )}
        </div>

        {/* Feedback Messages */}
        {uploadError && (
          <div className="bg-red-900/30 border border-red-700/50 rounded-xl px-4 py-3 text-red-400 text-sm flex items-start gap-2">
            <span className="text-lg leading-tight">⚠️</span>
            <span>{uploadError}</span>
          </div>
        )}

        {uploadSuccess && (
          <div className="bg-green-900/30 border border-green-700/50 rounded-xl px-4 py-3 text-green-400 text-sm flex items-start gap-2">
            <span className="text-lg leading-tight">✅</span>
            <span>{uploadSuccess}</span>
          </div>
        )}

        {/* Documents List */}
        <div>
          <h3 className="text-white font-medium mb-3 flex items-center gap-2">
            Documenti caricati
            <span className="bg-gray-700 text-gray-300 text-xs px-2 py-0.5 rounded-full">
              {documents.length}
            </span>
          </h3>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="w-8 h-8 border-4 border-gray-600 border-t-blue-500 rounded-full animate-spin" />
            </div>
          ) : documents.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              <div className="text-4xl mb-3">📭</div>
              <p>Nessun documento caricato</p>
              <p className="text-sm mt-1">Carica i tuoi manuali e procedure per iniziare</p>
            </div>
          ) : (
            <div className="space-y-2">
              {documents.map(doc => (
                <div
                  key={doc.id}
                  className="flex items-center gap-3 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 group hover:border-gray-600 transition-colors"
                >
                  <span className="text-2xl">{getTypeIcon(doc.type)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{doc.name}</p>
                    <p className="text-gray-400 text-xs">{formatDate(doc.created_at)}</p>
                  </div>
                  <span className="text-xs bg-gray-700 text-gray-400 px-2 py-0.5 rounded uppercase font-mono">
                    {doc.type}
                  </span>
                  <button
                    onClick={() => handleDelete(doc.id, doc.name)}
                    className="text-gray-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 ml-1"
                    title="Elimina documento"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

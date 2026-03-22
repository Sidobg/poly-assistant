'use client'

import { useState, useEffect, useRef } from 'react'
import type { Department } from '@/app/page'

interface Document {
  id: number
  name: string
  type: string
  created_at: string
}

interface UploadProps {
  department: Department
}

export default function Upload({ department }: UploadProps) {
  const [documents, setDocuments] = useState<Document[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isDragging, setIsDragging] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const loadDocuments = async () => {
    try {
      const response = await fetch(`/api/upload?department=${department}`)
      const data = await response.json()
      if (data.documents) setDocuments(data.documents)
    } catch (error) {
      console.error('Errore caricamento lista:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    setIsLoading(true)
    loadDocuments()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [department])

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
    setUploadProgress(0)

    // Simula progress bar durante l'upload
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 85) return prev
        return prev + Math.random() * 12
      })
    }, 400)

    const formData = new FormData()
    formData.append('file', file)
    formData.append('department', department)

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) throw new Error(data.error || 'Errore durante il caricamento')

      clearInterval(progressInterval)
      setUploadProgress(100)
      setTimeout(() => setUploadProgress(0), 600)
      setUploadSuccess(
        `"${data.document.name}" caricato con successo (${data.document.chunks} sezioni indicizzate)`
      )
      await loadDocuments()
    } catch (error) {
      clearInterval(progressInterval)
      setUploadProgress(0)
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
      setDocuments((prev) => prev.filter((d) => d.id !== id))
    } catch {
      setUploadError("Errore durante l'eliminazione del documento")
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

  const handleDragLeave = () => setIsDragging(false)

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div
        style={{
          padding: '18px 28px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          backgroundColor: '#1a1d27',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              backgroundColor: 'rgba(79,140,255,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
            }}
          >
            📤
          </div>
          <div>
            <h2
              style={{
                color: '#e8eaf0',
                fontWeight: 600,
                fontSize: '16px',
                margin: 0,
                lineHeight: 1.2,
              }}
            >
              Carica Documenti
            </h2>
            <p style={{ color: '#9499b0', fontSize: '12px', margin: '3px 0 0' }}>
              Manuali, procedure e schede tecniche in formato PDF o DOCX
            </p>
          </div>
          {/* Doc count badge */}
          {!isLoading && (
            <div
              style={{
                marginLeft: 'auto',
                padding: '4px 12px',
                borderRadius: '20px',
                backgroundColor: 'rgba(79,140,255,0.12)',
                border: '1px solid rgba(79,140,255,0.2)',
                color: '#4f8cff',
                fontSize: '13px',
                fontWeight: 600,
              }}
            >
              {documents.length} doc{documents.length !== 1 ? 's' : ''}
            </div>
          )}
        </div>
      </div>

      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '24px 28px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          backgroundColor: '#0f1117',
        }}
      >
        {/* Drop zone */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => !isUploading && fileInputRef.current?.click()}
          style={{
            border: `2px dashed ${isDragging ? '#4f8cff' : isUploading ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.12)'}`,
            borderRadius: '14px',
            padding: '40px 24px',
            textAlign: 'center',
            cursor: isUploading ? 'not-allowed' : 'pointer',
            backgroundColor: isDragging
              ? 'rgba(79,140,255,0.06)'
              : isUploading
              ? 'rgba(255,255,255,0.02)'
              : 'rgba(255,255,255,0.02)',
            transition: 'all 0.2s ease',
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx"
            style={{ display: 'none' }}
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) handleUpload(file)
            }}
            disabled={isUploading}
          />

          {isUploading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  border: '3px solid rgba(79,140,255,0.2)',
                  borderTopColor: '#4f8cff',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite',
                }}
              />
              <div>
                <p style={{ color: '#4f8cff', fontWeight: 500, fontSize: '15px', margin: 0 }}>
                  Elaborazione in corso...
                </p>
                <p style={{ color: '#9499b0', fontSize: '13px', margin: '4px 0 0' }}>
                  Estrazione testo e indicizzazione
                </p>
              </div>
              {/* Progress bar */}
              {uploadProgress > 0 && (
                <div
                  style={{
                    width: '200px',
                    height: '4px',
                    backgroundColor: 'rgba(255,255,255,0.08)',
                    borderRadius: '4px',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${Math.min(uploadProgress, 100)}%`,
                      backgroundColor: '#4f8cff',
                      borderRadius: '4px',
                      transition: 'width 0.4s ease',
                    }}
                  />
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '14px',
                  backgroundColor: 'rgba(79,140,255,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '26px',
                }}
              >
                📁
              </div>
              <div>
                <p style={{ color: '#e8eaf0', fontWeight: 500, fontSize: '15px', margin: 0 }}>
                  Trascina qui il file o clicca per selezionarlo
                </p>
                <p style={{ color: '#9499b0', fontSize: '13px', margin: '6px 0 0' }}>
                  Supporta PDF e DOCX
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Feedback messages */}
        {uploadError && (
          <div
            style={{
              padding: '12px 16px',
              borderRadius: '10px',
              backgroundColor: 'rgba(248,113,113,0.1)',
              border: '1px solid rgba(248,113,113,0.25)',
              color: '#f87171',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '8px',
            }}
          >
            <span>⚠️</span>
            <span>{uploadError}</span>
          </div>
        )}

        {uploadSuccess && (
          <div
            style={{
              padding: '12px 16px',
              borderRadius: '10px',
              backgroundColor: 'rgba(52,211,153,0.1)',
              border: '1px solid rgba(52,211,153,0.25)',
              color: '#34d399',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '8px',
            }}
          >
            <span>✅</span>
            <span>{uploadSuccess}</span>
          </div>
        )}

        {/* Documents list */}
        <div>
          <h3
            style={{
              color: '#e8eaf0',
              fontWeight: 600,
              fontSize: '14px',
              marginBottom: '12px',
              marginTop: 0,
            }}
          >
            Documenti caricati
          </h3>

          {isLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  border: '3px solid rgba(79,140,255,0.2)',
                  borderTopColor: '#4f8cff',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite',
                }}
              />
            </div>
          ) : documents.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '48px 0',
                color: '#9499b0',
              }}
            >
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>📭</div>
              <p style={{ fontWeight: 500, margin: 0 }}>Nessun documento caricato</p>
              <p style={{ fontSize: '13px', margin: '6px 0 0' }}>
                Carica manuali e procedure per iniziare
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="doc-card"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '14px 16px',
                    backgroundColor: '#222536',
                    borderRadius: '12px',
                    border: '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  <div
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '10px',
                      backgroundColor:
                        doc.type === 'pdf'
                          ? 'rgba(248,113,113,0.15)'
                          : 'rgba(79,140,255,0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '18px',
                      flexShrink: 0,
                    }}
                  >
                    {doc.type === 'pdf' ? '📄' : '📝'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p
                      style={{
                        color: '#e8eaf0',
                        fontSize: '14px',
                        fontWeight: 500,
                        margin: 0,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {doc.name}
                    </p>
                    <p style={{ color: '#9499b0', fontSize: '12px', margin: '3px 0 0' }}>
                      {formatDate(doc.created_at)}
                    </p>
                  </div>
                  <span
                    style={{
                      fontSize: '11px',
                      padding: '3px 8px',
                      borderRadius: '6px',
                      backgroundColor: 'rgba(255,255,255,0.06)',
                      color: '#9499b0',
                      fontWeight: 600,
                      letterSpacing: '0.05em',
                      textTransform: 'uppercase',
                      flexShrink: 0,
                    }}
                  >
                    {doc.type}
                  </span>
                  <button
                    onClick={() => handleDelete(doc.id, doc.name)}
                    title="Elimina documento"
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#9499b0',
                      padding: '4px',
                      borderRadius: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      transition: 'color 0.2s ease',
                      flexShrink: 0,
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#f87171')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = '#9499b0')}
                  >
                    <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

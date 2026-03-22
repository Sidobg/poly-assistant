'use client'

import { useState, useRef, useEffect } from 'react'
import MessageBubble, { type Message } from './MessageBubble'

const WELCOME_MESSAGE: Message = {
  role: 'assistant',
  content:
    'Benvenuto nell\'Analisi Filiere.\n\nPosso aiutarti a:\n• Analizzare lo stato di salute di una filiera tramite foto\n• Identificare usura, ostruzioni e depositi sui capillari\n• Stimare la vita residua e pianificare la manutenzione\n• Fornire un punteggio salute filiera da 1 a 10\n\nPrima di analizzare una foto, ti farò alcune domande per contestualizzare meglio l\'analisi (tipo, materiale, polimero in lavorazione, ecc.).\n\nComincia descrivendo la filiera o carica direttamente una foto.',
}

export default function ChatFiliere() {
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    const text = input.trim()
    if ((!text && !imageFile) || isLoading) return

    let imageBase64: string | null = null
    let imageMediaType: string | null = null

    if (imageFile) {
      imageMediaType = imageFile.type
      const buffer = await imageFile.arrayBuffer()
      const bytes = new Uint8Array(buffer)
      let binary = ''
      for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i])
      }
      imageBase64 = btoa(binary)
    }

    const userContent = imageFile
      ? `[Immagine allegata: ${imageFile.name}]${text ? `\n${text}` : ''}`
      : text
    const userMessage: Message = { role: 'user', content: userContent }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setImageFile(null)
    setIsLoading(true)

    const history = messages
      .filter((_, i) => i > 0)
      .map(({ role, content }) => ({ role, content }))

    const assistantMessageIndex = messages.length + 1
    setMessages((prev) => [...prev, { role: 'assistant', content: '', isStreaming: true }])

    try {
      const response = await fetch('/api/chat-filiere', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text || '(Analizza l\'immagine allegata)',
          history,
          imageBase64,
          imageMediaType,
        }),
      })

      if (!response.ok) throw new Error('Risposta del server non valida')

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let fullContent = ''

      if (!reader) throw new Error('Stream non disponibile')

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))
              if (data.type === 'text') {
                fullContent += data.content
                setMessages((prev) =>
                  prev.map((msg, i) =>
                    i === assistantMessageIndex
                      ? { ...msg, content: fullContent, isStreaming: true }
                      : msg
                  )
                )
              } else if (data.type === 'done') {
                setMessages((prev) =>
                  prev.map((msg, i) =>
                    i === assistantMessageIndex ? { ...msg, isStreaming: false } : msg
                  )
                )
              } else if (data.type === 'error') {
                throw new Error(data.content)
              }
            } catch {
              // ignora linee incomplete
            }
          }
        }
      }
    } catch (error) {
      console.error('Errore chat filiere:', error)
      setMessages((prev) =>
        prev.map((msg, i) =>
          i === assistantMessageIndex
            ? {
                ...msg,
                content: 'Si è verificato un errore. Riprova tra poco.',
                isStreaming: false,
              }
            : msg
        )
      )
    } finally {
      setIsLoading(false)
      inputRef.current?.focus()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

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
              backgroundColor: 'rgba(167,139,250,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
            }}
          >
            🔍
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
              Analisi Filiere
            </h2>
            <p style={{ color: '#9499b0', fontSize: '12px', margin: '3px 0 0' }}>
              Diagnosi stato · Punteggio salute · Manutenzione
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '24px 28px',
          backgroundColor: '#0f1117',
        }}
      >
        {messages.map((message, index) => (
          <MessageBubble key={index} message={message} mode="filiere" />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div
        style={{
          padding: '16px 28px 20px',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          backgroundColor: '#1a1d27',
          flexShrink: 0,
        }}
      >
        {/* Image preview */}
        {imageFile && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '8px',
              padding: '6px 10px',
              backgroundColor: 'rgba(167,139,250,0.1)',
              borderRadius: '8px',
              border: '1px solid rgba(167,139,250,0.2)',
            }}
          >
            <span style={{ fontSize: '14px' }}>🖼️</span>
            <span
              style={{
                color: '#a78bfa',
                fontSize: '12px',
                flex: 1,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {imageFile.name}
            </span>
            <button
              onClick={() => setImageFile(null)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#9499b0',
                fontSize: '14px',
                padding: '0 2px',
                lineHeight: 1,
              }}
            >
              ✕
            </button>
          </div>
        )}

        <div
          style={{
            display: 'flex',
            gap: '8px',
            alignItems: 'flex-end',
            backgroundColor: '#222536',
            borderRadius: '14px',
            border: '1px solid rgba(255,255,255,0.08)',
            padding: '10px 10px 10px 14px',
          }}
        >
          {/* Photo button */}
          <button
            onClick={() => imageInputRef.current?.click()}
            disabled={isLoading}
            title="Allega foto filiera"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              border: 'none',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              backgroundColor: imageFile ? 'rgba(167,139,250,0.2)' : 'transparent',
              color: imageFile ? '#a78bfa' : '#9499b0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              transition: 'all 0.2s ease',
              fontSize: '16px',
            }}
          >
            📷
          </button>
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) setImageFile(file)
              e.target.value = ''
            }}
          />

          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Descrivi la filiera o carica una foto per l'analisi..."
            rows={1}
            disabled={isLoading}
            style={{
              flex: 1,
              backgroundColor: 'transparent',
              color: '#e8eaf0',
              border: 'none',
              outline: 'none',
              resize: 'none',
              fontSize: '14px',
              lineHeight: 1.5,
              minHeight: '24px',
              maxHeight: '120px',
              fontFamily: 'inherit',
            }}
          />
          <button
            onClick={sendMessage}
            disabled={isLoading || (!input.trim() && !imageFile)}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              border: 'none',
              cursor: isLoading || (!input.trim() && !imageFile) ? 'not-allowed' : 'pointer',
              backgroundColor:
                isLoading || (!input.trim() && !imageFile)
                  ? 'rgba(167,139,250,0.2)'
                  : '#a78bfa',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              transition: 'background-color 0.2s ease',
            }}
          >
            {isLoading ? (
              <span
                style={{
                  width: '16px',
                  height: '16px',
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTopColor: '#ffffff',
                  borderRadius: '50%',
                  display: 'inline-block',
                  animation: 'spin 0.8s linear infinite',
                }}
              />
            ) : (
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
            )}
          </button>
        </div>
        <p style={{ color: '#9499b0', fontSize: '11px', marginTop: '8px', marginBottom: 0 }}>
          Enter per inviare · 📷 per allegare foto filiera
        </p>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        textarea::placeholder {
          color: #9499b0;
        }
      `}</style>
    </div>
  )
}

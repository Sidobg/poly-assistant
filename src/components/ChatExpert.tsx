'use client'

import { useState, useRef, useEffect } from 'react'
import MessageBubble, { type Message } from './MessageBubble'
import type { Department } from '@/app/page'

const POLY_WELCOME: Message = {
  role: 'assistant',
  content:
    'Sono Poly Expert, esperto AI di chimica dei polimeri PA6/PA66, caprolattame, impiantistica chimica e meccanica industriale.\n\nRispondo dalle mie conoscenze tecniche su:\n• Chimica e cinetica di polimerizzazione\n• Reologia, cristallizzazione, degradazione\n• Reattori, colonne, scambiatori, pompe\n• Motori, riduttori, filtri, taglierine, essiccatori\n• Normative sicurezza impianti chimici\n\n⚠️ Le risposte vanno verificate con il responsabile.',
}

const POY_WELCOME: Message = {
  role: 'assistant',
  content:
    'Sono Poly Expert — Filatura, esperto AI di filatura nylon PA6, PA66 e PA6.10.\n\nRispondo dalle mie conoscenze tecniche su:\n• Estrusione e filatura: fusione, pompe dosaggio, filiere, raffreddamento, stiro\n• Proprietà polimeri: viscosità fuso, cristallizzazione, orientazione molecolare\n• Filiere: design, materiali, geometria capillari, usura\n• Parametri di processo: temperature, velocità, rapporti di stiro\n• Difetti del filo: rotture, disuniformità, nodi — cause e soluzioni\n• Macchinari: estrusori, godet, winder, sistemi di raffreddamento\n\n⚠️ Le risposte vanno verificate con il responsabile.',
}

interface ChatExpertProps {
  department: Department
}

export default function ChatExpert({ department }: ChatExpertProps) {
  const [messages, setMessages] = useState<Message[]>([
    department === 'poy' ? POY_WELCOME : POLY_WELCOME,
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setMessages([department === 'poy' ? POY_WELCOME : POLY_WELCOME])
  }, [department])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    const text = input.trim()
    if (!text || isLoading) return

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

    const userContent = imageFile ? `[Immagine allegata: ${imageFile.name}]\n${text}` : text
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
      const response = await fetch('/api/chat-expert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history, imageBase64, imageMediaType, department }),
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
      console.error('Errore chat expert:', error)
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

  const accentColor = department === 'poy' ? '#a78bfa' : '#4f8cff'
  const accentBgDisabled =
    department === 'poy' ? 'rgba(167,139,250,0.2)' : 'rgba(79,140,255,0.2)'
  const accentBgLight =
    department === 'poy' ? 'rgba(167,139,250,0.15)' : 'rgba(79,140,255,0.15)'
  const imageActiveBg =
    department === 'poy' ? 'rgba(167,139,250,0.2)' : 'rgba(79,140,255,0.2)'
  const title = department === 'poy' ? 'Chat Esperto Filatura' : 'Chat Esperto AI'
  const subtitle =
    department === 'poy'
      ? 'Filatura nylon · Filiere · Qualità filo'
      : 'Chimica polimeri · Impiantistica · Meccanica industriale'
  const placeholder =
    department === 'poy'
      ? "Chiedi all'esperto di filatura nylon..."
      : "Chiedi all'esperto di chimica e impiantistica..."

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
              backgroundColor: accentBgLight,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
            }}
          >
            🧠
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
              {title}
            </h2>
            <p style={{ color: '#9499b0', fontSize: '12px', margin: '3px 0 0' }}>{subtitle}</p>
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
          <MessageBubble key={index} message={message} mode="expert" />
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
              backgroundColor: imageActiveBg,
              borderRadius: '8px',
              border: `1px solid ${accentColor}33`,
            }}
          >
            <span style={{ fontSize: '14px' }}>🖼️</span>
            <span
              style={{
                color: accentColor,
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
            title="Allega immagine (schema, P&ID...)"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              border: 'none',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              backgroundColor: imageFile ? imageActiveBg : 'transparent',
              color: imageFile ? accentColor : '#9499b0',
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
            placeholder={placeholder}
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
            disabled={isLoading || !input.trim()}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              border: 'none',
              cursor: isLoading || !input.trim() ? 'not-allowed' : 'pointer',
              backgroundColor: isLoading || !input.trim() ? accentBgDisabled : accentColor,
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
          Enter per inviare · 📷 per allegare schema/P&ID
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

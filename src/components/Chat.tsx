'use client'

import { useState, useRef, useEffect } from 'react'
import MessageBubble, { type Message } from './MessageBubble'
import type { Department } from '@/app/page'

const POLY_WELCOME: Message = {
  role: 'assistant',
  content:
    'Ciao! Sono Poly Assistant, il tuo esperto AI per il reparto Polimerizzazione di Radici Yarn.\n\nPosso aiutarti con:\n• Domande su processi di polimerizzazione PA6/PA66\n• Informazioni dai manuali e procedure interne\n• Supporto su chimica dei polimeri e caprolattame\n• Troubleshooting impianti e macchinari\n\nCome posso aiutarti oggi?',
}

const POY_WELCOME: Message = {
  role: 'assistant',
  content:
    "Sono l'assistente documentale delle linee di filatura. Rispondo basandomi sui manuali e documenti interni del reparto POY.\n\nPosso aiutarti con:\n• Documenti e procedure del reparto filatura\n• Manuali tecnici delle linee POY\n• Schede tecniche e parametri di processo\n• Procedure operative e di sicurezza\n\nCome posso aiutarti?",
}

interface ChatProps {
  department: Department
}

export default function Chat({ department }: ChatProps) {
  const storageKey = `poly-chat-docs-${department}`
  const welcomeMessage = department === 'poy' ? POY_WELCOME : POLY_WELCOME

  const [messages, setMessages] = useState<Message[]>([welcomeMessage])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Load from localStorage when department changes
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed)
          return
        }
      }
    } catch {}
    setMessages([welcomeMessage])
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey])

  // Save to localStorage when messages change
  useEffect(() => {
    if (messages.length > 0) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(messages))
      } catch {}
    }
  }, [messages, storageKey])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const clearConversation = () => {
    if (window.confirm('Vuoi cancellare la conversazione corrente?')) {
      localStorage.removeItem(storageKey)
      setMessages([welcomeMessage])
    }
  }

  const exportPDF = () => {
    const date = new Date().toLocaleDateString('it-IT')
    const chatName = department === 'poy' ? 'Chat Documenti POY' : 'Chat Documenti POLY'
    const content = messages
      .map(msg => {
        const role = msg.role === 'user' ? 'Utente' : 'Assistente'
        const text = msg.content.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>')
        return `<div class="message ${msg.role}"><div class="role">${role}</div><div class="content">${text}</div></div>`
      })
      .join('')
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Poly Assistant — ${chatName} — ${date}</title><style>body{font-family:Arial,sans-serif;max-width:800px;margin:0 auto;padding:20px;color:#333}.header{text-align:center;border-bottom:2px solid #333;padding-bottom:20px;margin-bottom:30px}.header h1{margin:0 0 5px;font-size:24px}.header p{margin:0;color:#666}.message{margin-bottom:20px;padding:15px;border-radius:8px}.message.user{background:#f0f4ff;border-left:4px solid #4f8cff}.message.assistant{background:#f8f8f8;border-left:4px solid #34d399}.role{font-weight:bold;margin-bottom:8px;font-size:12px;text-transform:uppercase;color:#666}.content{line-height:1.6}.footer{text-align:center;margin-top:40px;padding-top:20px;border-top:1px solid #ccc;color:#666;font-size:12px}</style></head><body><div class="header"><h1>Poly Assistant</h1><p>${chatName} — ${date}</p></div>${content}<div class="footer">Powered by FutureAI — Automazioni AI per Aziende</div></body></html>`
    const win = window.open('', '_blank')
    if (win) {
      win.document.write(html)
      win.document.close()
      win.print()
    }
  }

  const sendMessage = async () => {
    const text = input.trim()
    if (!text || isLoading) return

    const userMessage: Message = { role: 'user', content: text }
    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    const history = messages
      .filter((_, i) => i > 0)
      .map(({ role, content }) => ({ role, content }))

    setMessages((prev) => [...prev, { role: 'assistant', content: '' }])

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history, department }),
      })

      if (!response.ok) throw new Error('Risposta del server non valida')

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let fullText = ''
      let buffer = ''

      if (!reader) throw new Error('Stream non disponibile')

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''
        for (const line of lines) {
          const trimmed = line.trim()
          if (trimmed.startsWith('data: ') && !trimmed.includes('[DONE]')) {
            try {
              const data = JSON.parse(trimmed.slice(6))
              if (data.type === 'content_block_delta' && data.delta?.text) {
                fullText += data.delta.text
                setMessages((prev) => {
                  const updated = [...prev]
                  updated[updated.length - 1] = { ...updated[updated.length - 1], content: fullText }
                  return updated
                })
              }
            } catch {}
          }
        }
      }
    } catch (error) {
      console.error('Errore chat:', error)
      setMessages((prev) => {
        const updated = [...prev]
        updated[updated.length - 1] = {
          ...updated[updated.length - 1],
          content: 'Si è verificato un errore durante la generazione della risposta. Riprova tra poco.',
        }
        return updated
      })
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
  const placeholder =
    department === 'poy'
      ? 'Cerca nei documenti della filatura...'
      : 'Cerca nei documenti del reparto...'

  const btnStyle = {
    padding: '6px 12px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px',
    color: '#9499b0',
    fontSize: '12px',
    cursor: 'pointer',
    whiteSpace: 'nowrap' as const,
    WebkitAppearance: 'none' as const,
    fontFamily: 'inherit',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div
        style={{
          padding: '14px 20px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          backgroundColor: '#1a1d27',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              backgroundColor: 'rgba(52,211,153,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
              flexShrink: 0,
            }}
          >
            📄
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2 style={{ color: '#e8eaf0', fontWeight: 600, fontSize: '15px', margin: 0, lineHeight: 1.2 }}>
              Chat Documenti
            </h2>
            <p style={{ color: '#9499b0', fontSize: '11px', margin: '2px 0 0' }}>
              {department === 'poy'
                ? 'Documenti interni del reparto POY'
                : 'Documentazione interna del reparto'}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
            <button type="button" onClick={clearConversation} style={btnStyle}>
              🗑️ Nuova
            </button>
            <button type="button" onClick={exportPDF} style={btnStyle}>
              📄 PDF
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div
        className="chat-messages-area"
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '24px 28px',
          backgroundColor: '#0f1117',
        }}
      >
        {messages.map((message, index) => (
          <MessageBubble key={index} message={message} mode="chat" />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div
        className="chat-input-area"
        style={{
          padding: '16px 28px 20px',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          backgroundColor: '#1a1d27',
          flexShrink: 0,
        }}
      >
        <div
          style={{
            display: 'flex',
            gap: '10px',
            alignItems: 'flex-end',
            backgroundColor: '#222536',
            borderRadius: '14px',
            border: '1px solid rgba(255,255,255,0.08)',
            padding: '10px 12px 10px 16px',
          }}
        >
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
            className="placeholder-[#9499b0]"
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
          Enter per inviare · Shift+Enter per andare a capo
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

'use client'

import { useState, useRef, useEffect } from 'react'
import MessageBubble from './MessageBubble'

interface Message {
  role: 'user' | 'assistant'
  content: string
  isStreaming?: boolean
}

const WELCOME_MESSAGE: Message = {
  role: 'assistant',
  content: 'Ciao! Sono Poly Assistant, il tuo esperto AI per il reparto Polimerizzazione di Radici Yarn.\n\nPosso aiutarti con:\n• Domande su processi di polimerizzazione PA6/PA66\n• Informazioni dai manuali e procedure interne\n• Supporto su chimica dei polimeri e caprolattame\n• Troubleshooting impianti e macchinari\n\nCome posso aiutarti oggi?',
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    const text = input.trim()
    if (!text || isLoading) return

    const userMessage: Message = { role: 'user', content: text }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    // Prepara la cronologia per l'API (escludi il messaggio di benvenuto)
    const history = messages
      .filter((_, i) => i > 0) // Escludi il welcome
      .map(({ role, content }) => ({ role, content }))

    // Aggiungi il placeholder per la risposta in streaming
    const assistantMessageIndex = messages.length + 1
    setMessages(prev => [...prev, { role: 'assistant', content: '', isStreaming: true }])

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history }),
      })

      if (!response.ok) {
        throw new Error('Risposta del server non valida')
      }

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
                setMessages(prev => prev.map((msg, i) =>
                  i === assistantMessageIndex
                    ? { ...msg, content: fullContent, isStreaming: true }
                    : msg
                ))
              } else if (data.type === 'done') {
                setMessages(prev => prev.map((msg, i) =>
                  i === assistantMessageIndex
                    ? { ...msg, isStreaming: false }
                    : msg
                ))
              } else if (data.type === 'error') {
                throw new Error(data.content)
              }
            } catch (parseError) {
              // Ignora errori di parsing per linee incomplete
            }
          }
        }
      }
    } catch (error) {
      console.error('Errore chat:', error)
      setMessages(prev => prev.map((msg, i) =>
        i === assistantMessageIndex
          ? {
              ...msg,
              content: 'Si è verificato un errore durante la generazione della risposta. Riprova tra poco.',
              isStreaming: false,
            }
          : msg
      ))
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
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-700 bg-gray-900">
        <h2 className="text-white font-semibold text-lg">Chat Documenti</h2>
        <p className="text-gray-400 text-sm">Fai domande basate sulla documentazione interna</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {messages.map((message, index) => (
          <MessageBubble key={index} message={message} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-6 py-4 border-t border-gray-700 bg-gray-900">
        <div className="flex gap-3 items-end">
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Scrivi una domanda sui processi di polimerizzazione..."
            rows={1}
            className="flex-1 bg-gray-800 text-white placeholder-gray-500 border border-gray-600 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors max-h-32"
            style={{ minHeight: '48px' }}
            disabled={isLoading}
          />
          <button
            onClick={sendMessage}
            disabled={isLoading || !input.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white px-4 py-3 rounded-xl transition-colors flex items-center gap-2 text-sm font-medium"
          >
            {isLoading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
          </button>
        </div>
        <p className="text-gray-500 text-xs mt-2">Premi Enter per inviare, Shift+Enter per andare a capo</p>
      </div>
    </div>
  )
}

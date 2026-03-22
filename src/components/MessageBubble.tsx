'use client'

interface Message {
  role: 'user' | 'assistant'
  content: string
  isStreaming?: boolean
}

interface MessageBubbleProps {
  message: Message
}

function detectSource(content: string): 'internal' | 'ai' | null {
  if (content.includes('[FONTE: Documentazione interna]')) return 'internal'
  if (content.includes('[FONTE: Conoscenze AI')) return 'ai'
  return null
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user'
  const source = !isUser ? detectSource(message.content) : null

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      {!isUser && (
        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3 flex-shrink-0 mt-1">
          P
        </div>
      )}

      <div className={`max-w-[75%] ${isUser ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
        {source && (
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
            source === 'internal'
              ? 'bg-green-900/50 text-green-400 border border-green-700/50'
              : 'bg-yellow-900/50 text-yellow-400 border border-yellow-700/50'
          }`}>
            {source === 'internal' ? '📄 Documentazione interna' : '🤖 Conoscenze AI'}
          </span>
        )}

        <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
          isUser
            ? 'bg-blue-600 text-white rounded-br-sm'
            : 'bg-gray-800 text-gray-100 rounded-bl-sm border border-gray-700'
        }`}>
          {message.content}
          {message.isStreaming && (
            <span className="inline-block w-2 h-4 bg-blue-400 ml-1 animate-pulse rounded-sm" />
          )}
        </div>
      </div>

      {isUser && (
        <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center text-white text-sm font-bold ml-3 flex-shrink-0 mt-1">
          U
        </div>
      )}
    </div>
  )
}

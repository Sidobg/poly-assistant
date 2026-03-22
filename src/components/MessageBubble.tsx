'use client'

export interface Message {
  role: 'user' | 'assistant'
  content: string
  isStreaming?: boolean
}

interface MessageBubbleProps {
  message: Message
  mode?: 'chat' | 'expert' | 'filiere'
}

function detectSource(content: string): 'internal' | 'ai' | null {
  if (content.includes('[FONTE: Documentazione interna]')) return 'internal'
  if (content.includes('[FONTE: Conoscenze AI')) return 'ai'
  return null
}

function cleanContent(content: string): string {
  return content
    .replace('[FONTE: Documentazione interna]', '')
    .replace(/\[FONTE: Conoscenze AI[^\]]*\]/g, '')
    .trim()
}

export default function MessageBubble({ message, mode = 'chat' }: MessageBubbleProps) {
  const isUser = message.role === 'user'
  const source = !isUser ? detectSource(message.content) : null
  const displayContent = !isUser ? cleanContent(message.content) : message.content
  const showTypingDots = !isUser && message.isStreaming && !displayContent

  const sourceTag = (() => {
    if (!source || showTypingDots) return null
    if (source === 'internal') {
      return {
        label: '📄 Fonte: Documentazione interna',
        bg: 'rgba(52,211,153,0.12)',
        color: '#34d399',
        border: '1px solid rgba(52,211,153,0.25)',
      }
    }
    if (mode === 'expert') {
      return {
        label: '🧠 Fonte: Conoscenze AI — verificare con responsabile',
        bg: 'rgba(251,191,36,0.12)',
        color: '#fbbf24',
        border: '1px solid rgba(251,191,36,0.25)',
      }
    }
    return {
      label: '⚠️ Non trovato nei documenti',
      bg: 'rgba(248,113,113,0.12)',
      color: '#f87171',
      border: '1px solid rgba(248,113,113,0.25)',
    }
  })()

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        marginBottom: '18px',
        gap: '10px',
        alignItems: 'flex-start',
      }}
    >
      {/* Assistant avatar */}
      {!isUser && (
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            flexShrink: 0,
            marginTop: '2px',
            backgroundColor:
              mode === 'filiere' ? 'rgba(167,139,250,0.15)' :
              mode === 'expert' ? 'rgba(79,140,255,0.15)' : 'rgba(52,211,153,0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '14px',
          }}
        >
          {mode === 'filiere' ? '🔍' : mode === 'expert' ? '🧠' : '📄'}
        </div>
      )}

      {/* Content */}
      <div
        style={{
          maxWidth: '75%',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
          alignItems: isUser ? 'flex-end' : 'flex-start',
        }}
      >
        {/* Source badge */}
        {sourceTag && (
          <span
            style={{
              fontSize: '11px',
              padding: '3px 10px',
              borderRadius: '20px',
              fontWeight: 500,
              backgroundColor: sourceTag.bg,
              color: sourceTag.color,
              border: sourceTag.border,
              whiteSpace: 'nowrap',
            }}
          >
            {sourceTag.label}
          </span>
        )}

        {/* Bubble */}
        <div
          style={{
            padding: '12px 16px',
            borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
            fontSize: '14px',
            lineHeight: 1.65,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            ...(isUser
              ? {
                  backgroundColor: '#4f8cff',
                  color: '#ffffff',
                }
              : {
                  backgroundColor: '#222536',
                  color: '#e8eaf0',
                  border: '1px solid rgba(255,255,255,0.06)',
                }),
          }}
        >
          {showTypingDots ? (
            <div
              style={{
                display: 'flex',
                gap: '5px',
                alignItems: 'center',
                padding: '2px 0',
              }}
            >
              <span
                className="typing-dot"
                style={{
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  backgroundColor: '#9499b0',
                  display: 'inline-block',
                }}
              />
              <span
                className="typing-dot"
                style={{
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  backgroundColor: '#9499b0',
                  display: 'inline-block',
                }}
              />
              <span
                className="typing-dot"
                style={{
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  backgroundColor: '#9499b0',
                  display: 'inline-block',
                }}
              />
            </div>
          ) : (
            <>
              {displayContent}
              {message.isStreaming && displayContent && (
                <span
                  className="streaming-cursor"
                  style={{
                    display: 'inline-block',
                    width: '2px',
                    height: '14px',
                    backgroundColor: '#4f8cff',
                    marginLeft: '2px',
                    verticalAlign: 'text-bottom',
                  }}
                />
              )}
            </>
          )}
        </div>
      </div>

      {/* User avatar */}
      {isUser && (
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            flexShrink: 0,
            marginTop: '2px',
            backgroundColor: 'rgba(148,153,176,0.12)',
            border: '1px solid rgba(255,255,255,0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
            color: '#9499b0',
            fontWeight: 600,
          }}
        >
          U
        </div>
      )}
    </div>
  )
}

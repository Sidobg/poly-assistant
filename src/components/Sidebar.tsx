'use client'

import type { Department, Section } from '@/app/page'

interface SidebarProps {
  activeSection: Section
  onSectionChange: (section: Section) => void
  department: Department
  onChangeDepartment: () => void
}

const POLY_NAV = [
  {
    label: 'Assistenza',
    items: [
      { id: 'chat' as Section, icon: '📄', label: 'Chat Documenti' },
      { id: 'expert' as Section, icon: '🧠', label: 'Chat Esperto AI' },
    ],
  },
  {
    label: 'Gestione',
    items: [{ id: 'upload' as Section, icon: '📤', label: 'Carica Documenti' }],
  },
]

const POY_NAV = [
  {
    label: 'Assistenza',
    items: [
      { id: 'chat' as Section, icon: '📄', label: 'Chat Documenti POY' },
      { id: 'expert' as Section, icon: '🧠', label: 'Chat Esperto Filatura' },
      { id: 'filiere' as Section, icon: '🔍', label: 'Analisi Filiere' },
    ],
  },
  {
    label: 'Gestione',
    items: [{ id: 'upload' as Section, icon: '📤', label: 'Carica Documenti' }],
  },
]

export default function Sidebar({
  activeSection,
  onSectionChange,
  department,
  onChangeDepartment,
}: SidebarProps) {
  const navGroups = department === 'poy' ? POY_NAV : POLY_NAV
  const accentColor = department === 'poy' ? '#a78bfa' : '#4f8cff'
  const accentBg = department === 'poy' ? 'rgba(167,139,250,0.12)' : 'rgba(79,140,255,0.12)'

  return (
    <aside
      style={{
        width: '260px',
        minWidth: '260px',
        backgroundColor: '#1a1d27',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '16px 20px 16px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        {/* Back button */}
        <button
          onClick={onChangeDepartment}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#9499b0',
            fontSize: '12px',
            padding: '4px 0',
            marginBottom: '14px',
            fontFamily: 'inherit',
            transition: 'color 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#e8eaf0')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#9499b0')}
        >
          ← Cambia reparto
        </button>

        <div
          style={{ marginBottom: '12px', height: '36px', display: 'flex', alignItems: 'center' }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/RadiciGroup%20logo.jpg"
            alt="Radici Group"
            style={{
              maxHeight: '36px',
              maxWidth: '140px',
              objectFit: 'contain',
              objectPosition: 'left center',
            }}
          />
        </div>
        <h1
          style={{
            color: '#e8eaf0',
            fontWeight: 700,
            fontSize: '15px',
            margin: 0,
            lineHeight: 1.2,
          }}
        >
          Poly Assistant
        </h1>
        <p
          style={{
            color: accentColor,
            fontSize: '12px',
            margin: '4px 0 0',
            lineHeight: 1.3,
            fontWeight: 600,
          }}
        >
          {department === 'poy' ? 'POY — Filatura Nylon' : 'POLY — Polimerizzazione'}
        </p>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '12px 10px', overflowY: 'auto' }}>
        {navGroups.map((group) => (
          <div key={group.label} style={{ marginBottom: '8px' }}>
            <p
              style={{
                color: '#9499b0',
                fontSize: '10px',
                fontWeight: 600,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                padding: '8px 10px 6px',
                margin: 0,
              }}
            >
              {group.label}
            </p>
            {group.items.map((item) => {
              const isActive = activeSection === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => onSectionChange(item.id)}
                  className={`nav-btn${isActive ? ' nav-btn-active' : ''}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: isActive ? 600 : 400,
                    width: '100%',
                    textAlign: 'left',
                    backgroundColor: isActive ? accentBg : 'transparent',
                    color: isActive ? accentColor : '#9499b0',
                    transition: 'all 0.2s ease',
                    position: 'relative',
                    fontFamily: 'inherit',
                  }}
                >
                  <span style={{ fontSize: '15px', flexShrink: 0 }}>{item.icon}</span>
                  <span style={{ flex: 1 }}>{item.label}</span>
                  {isActive && (
                    <span
                      style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        backgroundColor: accentColor,
                        flexShrink: 0,
                      }}
                    />
                  )}
                </button>
              )
            })}
          </div>
        ))}
      </nav>

      {/* Footer: FutureAI */}
      <div
        style={{
          padding: '14px 18px',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/future%20ai%20logo.png"
          alt="FutureAI"
          style={{
            width: '26px',
            height: '26px',
            objectFit: 'contain',
            borderRadius: '6px',
            flexShrink: 0,
          }}
        />
        <span style={{ color: '#9499b0', fontSize: '11px', lineHeight: 1.3 }}>
          Powered by FutureAI
        </span>
      </div>
    </aside>
  )
}

'use client'

import { useState } from 'react'
import Sidebar from '@/components/Sidebar'
import Chat from '@/components/Chat'
import ChatExpert from '@/components/ChatExpert'
import ChatFiliere from '@/components/ChatFiliere'
import Upload from '@/components/Upload'

export type Department = 'poly' | 'poy'
export type Section = 'chat' | 'expert' | 'upload' | 'filiere'

function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleLogin = () => {
    if (username === 'admin' && password === 'admin') {
      setError('')
      onLogin()
    } else {
      setError('Credenziali non valide')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleLogin()
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0f1117',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
    }}>
      <div className="auth-card" style={{
        width: '100%',
        maxWidth: '380px',
        background: '#1a1d27',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '16px',
        padding: '40px 32px',
      }}>
        {/* Logo */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/RadiciGroup%20logo.jpg"
          alt="Radici Group"
          style={{ height: '48px', objectFit: 'contain', display: 'block', margin: '0 auto 28px' }}
        />

        <h1 style={{ color: '#e8eaf0', fontSize: '26px', fontWeight: 700, margin: '0 0 6px', textAlign: 'center' }}>
          Poly Assistant
        </h1>
        <p style={{ color: '#9499b0', fontSize: '14px', margin: '0 0 32px', textAlign: 'center' }}>
          Accesso riservato al personale
        </p>

        {/* Username */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', color: '#9499b0', fontSize: '12px', marginBottom: '6px', fontWeight: 500 }}>
            USERNAME
          </label>
          <input
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            onKeyDown={handleKeyDown}
            autoComplete="username"
            style={{
              width: '100%',
              padding: '12px 14px',
              background: '#222536',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '10px',
              color: '#e8eaf0',
              fontSize: '16px',
              outline: 'none',
              boxSizing: 'border-box',
              WebkitAppearance: 'none',
            }}
          />
        </div>

        {/* Password */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', color: '#9499b0', fontSize: '12px', marginBottom: '6px', fontWeight: 500 }}>
            PASSWORD
          </label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={handleKeyDown}
            autoComplete="current-password"
            style={{
              width: '100%',
              padding: '12px 14px',
              background: '#222536',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '10px',
              color: '#e8eaf0',
              fontSize: '16px',
              outline: 'none',
              boxSizing: 'border-box',
              WebkitAppearance: 'none',
            }}
          />
        </div>

        {/* Error */}
        {error && (
          <p style={{ color: '#f87171', fontSize: '13px', margin: '-12px 0 16px', textAlign: 'center' }}>
            {error}
          </p>
        )}

        {/* Button */}
        <button
          type="button"
          onClick={handleLogin}
          style={{
            display: 'block',
            width: '100%',
            padding: '14px',
            background: '#4f8cff',
            border: 'none',
            borderRadius: '10px',
            color: '#ffffff',
            fontSize: '16px',
            fontWeight: 600,
            cursor: 'pointer',
            WebkitAppearance: 'none',
          }}
        >
          Accedi
        </button>
      </div>

      {/* Footer */}
      <div style={{ marginTop: '32px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/future%20ai%20logo.png"
          alt="FutureAI"
          style={{ width: '20px', height: '20px', objectFit: 'contain', borderRadius: '5px' }}
        />
        <span style={{ color: '#9499b0', fontSize: '12px' }}>Powered by FutureAI</span>
      </div>
    </div>
  )
}

function DepartmentSelect({ onSelect }: { onSelect: (dept: Department) => void }) {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#0f1117',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
    }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/RadiciGroup%20logo.jpg"
        alt="Radici Group"
        style={{ height: '52px', objectFit: 'contain', marginBottom: '28px', pointerEvents: 'none' }}
      />

      <h1 style={{ color: '#e8eaf0', fontSize: '28px', fontWeight: 700, margin: '0 0 8px', textAlign: 'center' }}>
        Poly Assistant
      </h1>
      <p style={{ color: '#9499b0', fontSize: '15px', margin: '0 0 40px', textAlign: 'center' }}>
        Seleziona il reparto
      </p>

      <button
        type="button"
        onClick={() => onSelect('poly')}
        style={{
          display: 'block',
          width: '100%',
          maxWidth: '340px',
          padding: '24px',
          marginBottom: '16px',
          background: '#222536',
          border: '1px solid rgba(79,140,255,0.3)',
          borderRadius: '16px',
          color: '#e8eaf0',
          cursor: 'pointer',
          textAlign: 'center',
          WebkitAppearance: 'none',
          fontSize: '16px',
          fontFamily: 'inherit',
        }}
      >
        <div style={{ fontSize: '28px', marginBottom: '8px' }}>⚗️</div>
        <div style={{ color: '#4f8cff', fontSize: '12px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '4px' }}>POLY</div>
        <div style={{ fontSize: '18px', fontWeight: 700, marginBottom: '6px' }}>Polimerizzazione</div>
        <div style={{ color: '#9499b0', fontSize: '13px' }}>Assistente AI per il reparto polimerizzazione PA6/PA66</div>
      </button>

      <button
        type="button"
        onClick={() => onSelect('poy')}
        style={{
          display: 'block',
          width: '100%',
          maxWidth: '340px',
          padding: '24px',
          marginBottom: '40px',
          background: '#222536',
          border: '1px solid rgba(167,139,250,0.3)',
          borderRadius: '16px',
          color: '#e8eaf0',
          cursor: 'pointer',
          textAlign: 'center',
          WebkitAppearance: 'none',
          fontSize: '16px',
          fontFamily: 'inherit',
        }}
      >
        <div style={{ fontSize: '28px', marginBottom: '8px' }}>🧵</div>
        <div style={{ color: '#a78bfa', fontSize: '12px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '4px' }}>POY</div>
        <div style={{ fontSize: '18px', fontWeight: 700, marginBottom: '6px' }}>Filatura Nylon</div>
        <div style={{ color: '#9499b0', fontSize: '13px' }}>Assistente AI per le linee di filatura nylon</div>
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/future%20ai%20logo.png"
          alt="FutureAI"
          style={{ width: '20px', height: '20px', objectFit: 'contain', borderRadius: '5px' }}
        />
        <span style={{ color: '#9499b0', fontSize: '12px' }}>Powered by FutureAI — Automazioni AI per Aziende</span>
      </div>
    </div>
  )
}

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [currentView, setCurrentView] = useState<'select' | 'app'>('select')
  const [department, setDepartment] = useState<Department>('poly')
  const [activeSection, setActiveSection] = useState<Section>('chat')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleLogin = () => {
    setIsLoggedIn(true)
  }

  const handleSelectDepartment = (dept: Department) => {
    setDepartment(dept)
    setActiveSection('chat')
    setCurrentView('app')
  }

  const handleSectionChange = (section: Section) => {
    setActiveSection(section)
    setIsMobileMenuOpen(false)
  }

  if (!isLoggedIn) {
    return <LoginScreen onLogin={handleLogin} />
  }

  if (currentView === 'select') {
    return <DepartmentSelect onSelect={handleSelectDepartment} />
  }

  const sectionLabels: Record<Section, string> = {
    chat: department === 'poy' ? 'Chat Documenti POY' : 'Chat Documenti',
    expert: department === 'poy' ? 'Chat Esperto Filatura' : 'Chat Esperto AI',
    filiere: 'Analisi Filiere',
    upload: 'Carica Documenti',
  }
  const accentColor = department === 'poy' ? '#a78bfa' : '#4f8cff'

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ backgroundColor: '#0f1117', color: '#e8eaf0' }}
    >
      {/* Mobile backdrop */}
      {isMobileMenuOpen && (
        <div
          className="mobile-backdrop"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <Sidebar
        activeSection={activeSection}
        onSectionChange={handleSectionChange}
        department={department}
        onChangeDepartment={() => setCurrentView('select')}
        isMobileOpen={isMobileMenuOpen}
        onMobileClose={() => setIsMobileMenuOpen(false)}
      />

      <main
        className="flex-1 flex flex-col overflow-hidden"
        style={{ backgroundColor: '#0f1117' }}
      >
        {/* Mobile top bar */}
        <div className="mobile-topbar">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            style={{
              background: 'none',
              border: 'none',
              color: '#e8eaf0',
              fontSize: '20px',
              cursor: 'pointer',
              padding: '4px 6px',
              borderRadius: '8px',
              lineHeight: 1,
              flexShrink: 0,
            }}
          >
            ☰
          </button>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ margin: 0, color: '#e8eaf0', fontWeight: 600, fontSize: '14px', lineHeight: 1.2 }}>
              {sectionLabels[activeSection]}
            </p>
            <p style={{ margin: 0, color: accentColor, fontSize: '11px', fontWeight: 600 }}>
              {department === 'poy' ? 'POY — Filatura Nylon' : 'POLY — Polimerizzazione'}
            </p>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/RadiciGroup%20logo.jpg"
            alt="Radici Group"
            style={{ height: '28px', objectFit: 'contain', flexShrink: 0 }}
          />
        </div>

        {activeSection === 'chat' && <Chat department={department} />}
        {activeSection === 'expert' && <ChatExpert department={department} />}
        {activeSection === 'filiere' && department === 'poy' && <ChatFiliere />}
        {activeSection === 'upload' && <Upload department={department} />}
      </main>
    </div>
  )
}

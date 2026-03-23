'use client'

import { useState, CSSProperties } from 'react'
import Sidebar from '@/components/Sidebar'
import Chat from '@/components/Chat'
import ChatExpert from '@/components/ChatExpert'
import ChatFiliere from '@/components/ChatFiliere'
import Upload from '@/components/Upload'

export type Department = 'poly' | 'poy'
export type Section = 'chat' | 'expert' | 'upload' | 'filiere'

const cardBase: CSSProperties = {
  display: 'block',
  width: '280px',
  padding: '36px 28px',
  borderRadius: '20px',
  backgroundColor: '#1a1d27',
  cursor: 'pointer',
  textAlign: 'left',
  fontFamily: 'inherit',
  fontSize: 'inherit',
  touchAction: 'manipulation',
  WebkitTapHighlightColor: 'transparent',
  userSelect: 'none',
  outline: 'none',
  position: 'relative',
  zIndex: 10,
}

function DepartmentSelect({ onSelect }: { onSelect: (dept: Department) => void }) {
  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#0f1117',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/RadiciGroup%20logo.jpg"
        alt="Radici Group"
        style={{ maxHeight: '52px', objectFit: 'contain', marginBottom: '32px', pointerEvents: 'none' }}
      />

      <h1 style={{ color: '#e8eaf0', fontSize: '28px', fontWeight: 700, margin: '0 0 8px', textAlign: 'center' }}>
        Poly Assistant
      </h1>
      <p style={{ color: '#9499b0', fontSize: '15px', margin: '0 0 48px', textAlign: 'center' }}>
        Seleziona il reparto
      </p>

      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', justifyContent: 'center' }}>

        <button
          type="button"
          className="dept-card dept-card-poly"
          style={{ ...cardBase, border: '2px solid rgba(79,140,255,0.2)' }}
          onClick={() => onSelect('poly')}
          onTouchStart={() => onSelect('poly')}
        >
          <p style={{ margin: '0 0 16px', fontSize: '28px', pointerEvents: 'none' }}>⚗️</p>
          <p style={{ margin: '0 0 6px', color: '#4f8cff', fontSize: '12px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', pointerEvents: 'none' }}>POLY</p>
          <p style={{ margin: '0 0 10px', color: '#e8eaf0', fontSize: '18px', fontWeight: 700, pointerEvents: 'none' }}>Polimerizzazione</p>
          <p style={{ margin: '0 0 16px', color: '#9499b0', fontSize: '13px', lineHeight: 1.5, pointerEvents: 'none' }}>Assistente AI per il reparto polimerizzazione PA6/PA66</p>
          <p style={{ margin: 0, color: '#4f8cff', fontSize: '13px', fontWeight: 500, pointerEvents: 'none' }}>Entra →</p>
        </button>

        <button
          type="button"
          className="dept-card dept-card-poy"
          style={{ ...cardBase, border: '2px solid rgba(167,139,250,0.2)' }}
          onClick={() => onSelect('poy')}
          onTouchStart={() => onSelect('poy')}
        >
          <p style={{ margin: '0 0 16px', fontSize: '28px', pointerEvents: 'none' }}>🧵</p>
          <p style={{ margin: '0 0 6px', color: '#a78bfa', fontSize: '12px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', pointerEvents: 'none' }}>POY</p>
          <p style={{ margin: '0 0 10px', color: '#e8eaf0', fontSize: '18px', fontWeight: 700, pointerEvents: 'none' }}>Filatura</p>
          <p style={{ margin: '0 0 16px', color: '#9499b0', fontSize: '13px', lineHeight: 1.5, pointerEvents: 'none' }}>Assistente AI per le linee di filatura nylon</p>
          <p style={{ margin: 0, color: '#a78bfa', fontSize: '13px', fontWeight: 500, pointerEvents: 'none' }}>Entra →</p>
        </button>

      </div>

      <div style={{ marginTop: '48px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/future%20ai%20logo.png" alt="FutureAI" style={{ width: '24px', height: '24px', objectFit: 'contain', borderRadius: '6px', pointerEvents: 'none' }} />
        <span style={{ color: '#9499b0', fontSize: '12px' }}>Powered by FutureAI — Automazioni AI per Aziende</span>
      </div>
    </div>
  )
}

export default function Home() {
  const [currentView, setCurrentView] = useState<'select' | 'app'>('select')
  const [department, setDepartment] = useState<Department>('poly')
  const [activeSection, setActiveSection] = useState<Section>('chat')

  const handleSelectDepartment = (dept: Department) => {
    setDepartment(dept)
    setActiveSection('chat')
    setCurrentView('app')
  }

  if (currentView === 'select') {
    return <DepartmentSelect onSelect={handleSelectDepartment} />
  }

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ backgroundColor: '#0f1117', color: '#e8eaf0' }}
    >
      <Sidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        department={department}
        onChangeDepartment={() => setCurrentView('select')}
      />
      <main
        className="flex-1 flex flex-col overflow-hidden"
        style={{ backgroundColor: '#0f1117' }}
      >
        {activeSection === 'chat' && <Chat department={department} />}
        {activeSection === 'expert' && <ChatExpert department={department} />}
        {activeSection === 'filiere' && department === 'poy' && <ChatFiliere />}
        {activeSection === 'upload' && <Upload department={department} />}
      </main>
    </div>
  )
}

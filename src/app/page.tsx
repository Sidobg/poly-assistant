'use client'

import { useState } from 'react'
import Sidebar from '@/components/Sidebar'
import Chat from '@/components/Chat'
import ChatExpert from '@/components/ChatExpert'
import ChatFiliere from '@/components/ChatFiliere'
import Upload from '@/components/Upload'

export type Department = 'poly' | 'poy'
export type Section = 'chat' | 'expert' | 'upload' | 'filiere'

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
      {/* Logo Radici Group */}
      <div style={{ marginBottom: '32px' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/RadiciGroup%20logo.jpg"
          alt="Radici Group"
          style={{ maxHeight: '52px', objectFit: 'contain' }}
        />
      </div>

      {/* Title */}
      <h1
        style={{
          color: '#e8eaf0',
          fontSize: '28px',
          fontWeight: 700,
          margin: '0 0 8px',
          textAlign: 'center',
        }}
      >
        Poly Assistant
      </h1>
      <p
        style={{
          color: '#9499b0',
          fontSize: '15px',
          margin: '0 0 48px',
          textAlign: 'center',
        }}
      >
        Seleziona il reparto
      </p>

      {/* Department cards */}
      <div
        style={{
          display: 'flex',
          gap: '24px',
          flexWrap: 'wrap',
          justifyContent: 'center',
        }}
      >
        {/* POLY card */}
        <button
          className="dept-card dept-card-poly"
          onClick={() => onSelect('poly')}
          style={{
            width: '280px',
            padding: '36px 28px',
            borderRadius: '20px',
            border: '2px solid rgba(79,140,255,0.2)',
            backgroundColor: '#1a1d27',
            cursor: 'pointer',
            textAlign: 'left',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            transition: 'all 0.25s ease',
            fontFamily: 'inherit',
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              backgroundColor: 'rgba(79,140,255,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '28px',
            }}
          >
            ⚗️
          </div>
          <div>
            <div
              style={{
                color: '#4f8cff',
                fontSize: '12px',
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                marginBottom: '6px',
              }}
            >
              POLY
            </div>
            <div
              style={{
                color: '#e8eaf0',
                fontSize: '18px',
                fontWeight: 700,
                marginBottom: '10px',
              }}
            >
              Polimerizzazione
            </div>
            <div style={{ color: '#9499b0', fontSize: '13px', lineHeight: 1.5 }}>
              Assistente AI per il reparto polimerizzazione PA6/PA66
            </div>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: '#4f8cff',
              fontSize: '13px',
              fontWeight: 500,
            }}
          >
            <span>Entra</span>
            <span>→</span>
          </div>
        </button>

        {/* POY card */}
        <button
          className="dept-card dept-card-poy"
          onClick={() => onSelect('poy')}
          style={{
            width: '280px',
            padding: '36px 28px',
            borderRadius: '20px',
            border: '2px solid rgba(167,139,250,0.2)',
            backgroundColor: '#1a1d27',
            cursor: 'pointer',
            textAlign: 'left',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            transition: 'all 0.25s ease',
            fontFamily: 'inherit',
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              backgroundColor: 'rgba(167,139,250,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '28px',
            }}
          >
            🧵
          </div>
          <div>
            <div
              style={{
                color: '#a78bfa',
                fontSize: '12px',
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                marginBottom: '6px',
              }}
            >
              POY
            </div>
            <div
              style={{
                color: '#e8eaf0',
                fontSize: '18px',
                fontWeight: 700,
                marginBottom: '10px',
              }}
            >
              Filatura
            </div>
            <div style={{ color: '#9499b0', fontSize: '13px', lineHeight: 1.5 }}>
              Assistente AI per le linee di filatura nylon
            </div>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: '#a78bfa',
              fontSize: '13px',
              fontWeight: 500,
            }}
          >
            <span>Entra</span>
            <span>→</span>
          </div>
        </button>
      </div>

      {/* Footer */}
      <div
        style={{
          position: 'fixed',
          bottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/future%20ai%20logo.png"
          alt="FutureAI"
          style={{ width: '24px', height: '24px', objectFit: 'contain', borderRadius: '6px' }}
        />
        <span style={{ color: '#9499b0', fontSize: '12px' }}>
          Powered by FutureAI — Automazioni AI per Aziende
        </span>
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

'use client'

interface SidebarProps {
  activeSection: 'chat' | 'upload'
  onSectionChange: (section: 'chat' | 'upload') => void
}

export default function Sidebar({ activeSection, onSectionChange }: SidebarProps) {
  return (
    <aside className="w-64 bg-gray-900 border-r border-gray-700 flex flex-col h-full">
      {/* Logo / Header */}
      <div className="p-5 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
            P
          </div>
          <div>
            <h1 className="text-white font-bold text-base leading-tight">Poly Assistant</h1>
            <p className="text-gray-400 text-xs">Radici Yarn — Polimerizzazione</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        <button
          onClick={() => onSectionChange('chat')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            activeSection === 'chat'
              ? 'bg-blue-600 text-white'
              : 'text-gray-300 hover:bg-gray-800 hover:text-white'
          }`}
        >
          <span className="text-lg">💬</span>
          <span>Chat Documenti</span>
        </button>

        <button
          onClick={() => onSectionChange('upload')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            activeSection === 'upload'
              ? 'bg-blue-600 text-white'
              : 'text-gray-300 hover:bg-gray-800 hover:text-white'
          }`}
        >
          <span className="text-lg">📤</span>
          <span>Carica Documenti</span>
        </button>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-700">
        <p className="text-gray-500 text-xs text-center">v1.0 — Fase 1</p>
      </div>
    </aside>
  )
}

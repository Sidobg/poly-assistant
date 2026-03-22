'use client'

import { useState } from 'react'
import Sidebar from '@/components/Sidebar'
import Chat from '@/components/Chat'
import Upload from '@/components/Upload'

type Section = 'chat' | 'upload'

export default function Home() {
  const [activeSection, setActiveSection] = useState<Section>('chat')

  return (
    <div className="flex h-screen bg-gray-950 text-white overflow-hidden">
      <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} />
      <main className="flex-1 flex flex-col overflow-hidden">
        {activeSection === 'chat' ? <Chat /> : <Upload />}
      </main>
    </div>
  )
}

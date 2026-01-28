import { useEffect, useState } from 'react'
import { CalendarView } from './components/CalendarView'
import { fetchCards } from './api/crm'
import { CRMItem, CalendarEvent } from './types/crm'
import { toCalendarEvents } from './lib/date'

export default function App() {
  const [items, setItems] = useState<CRMItem[]>([])
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<{ consultoria: number; apresentacao: number; validade: number; total: number }>({
    consultoria: 0,
    apresentacao: 0,
    validade: 0,
    total: 0
  })

  useEffect(() => {
    const panelId = 'a04146a8-6cf1-4f88-8f97-d926292ec510'
    setLoading(true)
    fetchCards(panelId)
      .then((res) => {
        setItems(res)
        setEvents(toCalendarEvents(res))
      })
      .catch((e) => {
        setError(e instanceof Error ? e.message : String(e))
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="page" style={{ alignItems: 'center', justifyContent: 'center' }}>Carregando...</div>
  if (error) return <div className="page error" style={{ alignItems: 'center', justifyContent: 'center' }}>Erro: {error}</div>

  return (
    <div className="page">
      <div className="header">
        <h1 style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 24 }}>📅</span>
          Calendário CRM
        </h1>
        <div style={{ fontSize: 14, color: '#64748b' }}>{events.length} eventos carregados</div>
      </div>
      <CalendarView events={events} onStatsChange={(s) => setStats(s)} />
    </div>
  )
}

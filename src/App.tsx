import { useEffect, useMemo, useState } from 'react'
import { CalendarView } from './components/CalendarView'
import { fetchCards, fetchPanels } from './api/crm'
import { fetchMeetings } from './api/meetings'
import { CRMItem, CalendarEvent, Meeting } from './types/crm'
import { toCalendarEvents, toMeetingEvents } from './lib/date'
import { Calendar as CalendarIcon } from 'lucide-react'

export default function App() {
  const [items, setItems] = useState<CRMItem[]>([])
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [meetingsError, setMeetingsError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState<{ total: number; done: number; lastPanelId?: string }>({ total: 0, done: 0 })
  const [stats, setStats] = useState<{ consultoria: number; apresentacao: number; validade: number; total: number }>({
    consultoria: 0,
    apresentacao: 0,
    validade: 0,
    total: 0
  })

  useEffect(() => {
    let active = true
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const mainPanelId = 'a04146a8-6cf1-4f88-8f97-d926292ec510'
        const allPanels = await fetchPanels()
        const userPanelIds = allPanels
          .filter(p => p.scope === 'USER')
          .map(p => p.id)

        const idsToFetch = Array.from(new Set([mainPanelId, ...userPanelIds]))
        if (!active) return
        setProgress({ total: idsToFetch.length, done: 0 })

        const itemsById: Record<string, CRMItem> = {}
        for (const panelId of idsToFetch) {
          if (!active) return
          setProgress(prev => ({ ...prev, lastPanelId: panelId }))
          const batch = await fetchCards(panelId)
          if (!active) return
          for (const it of batch) itemsById[it.id] = it
          const allItems = Object.values(itemsById)
          setItems(allItems)
          setEvents(toCalendarEvents(allItems))
          setProgress(prev => ({ ...prev, done: Math.min(prev.total, prev.done + 1) }))
        }
      } catch (e) {
        if (!active) return
        setError(e instanceof Error ? e.message : String(e))
      } finally {
        if (!active) return
        setLoading(false)
      }
    }
    
    load()
    return () => {
      active = false
    }
  }, [])

  const loadMeetings = () => {
    fetchMeetings()
      .then((list) => setMeetings(list))
      .catch((e) => setMeetingsError(e instanceof Error ? e.message : String(e)))
  }

  useEffect(() => {
    loadMeetings()
  }, [])

  const meetingEvents = useMemo(() => toMeetingEvents(meetings), [meetings])
  const allEvents = useMemo(() => [...events, ...meetingEvents], [events, meetingEvents])

  if (error) return <div className="page error" style={{ alignItems: 'center', justifyContent: 'center' }}>Erro: {error}</div>

  const progressPct = progress.total > 0 ? Math.round((progress.done / progress.total) * 100) : 0

  return (
    <div className="page" style={{ background: '#f8fafc', minHeight: '100vh' }}>
      <div className="header" style={{ 
        background: '#fff', 
        borderBottom: '1px solid #e2e8f0', 
        padding: '16px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ 
            background: '#eff6ff', 
            padding: '8px', 
            borderRadius: '8px',
            color: '#3b82f6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <CalendarIcon size={20} strokeWidth={2.5} />
          </div>
          <h1 style={{ 
            fontSize: '20px', 
            fontWeight: 700, 
            color: '#0f172a',
            margin: 0,
            letterSpacing: '-0.01em'
          }}>
            Calendário CRM
          </h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {loading && (
            <div style={{ fontSize: 13, fontWeight: 600, color: '#334155' }}>
              Carregando {progress.done}/{progress.total} painéis ({progressPct}%)
            </div>
          )}
          <div style={{
            fontSize: '13px',
            fontWeight: 500,
            color: '#64748b',
            background: '#f1f5f9',
            padding: '6px 12px',
            borderRadius: '20px'
          }}>
            {allEvents.length} eventos
          </div>
        </div>
      </div>
      {loading && (
        <div style={{ height: 3, background: '#e2e8f0' }}>
          <div style={{ height: 3, width: `${progressPct}%`, background: '#3b82f6', transition: 'width 200ms ease' }} />
        </div>
      )}
      {meetingsError && (
        <div style={{ margin: '8px 16px 0', color: '#dc2626', fontSize: 13 }}>
          Erro ao carregar reuniões: {meetingsError}
        </div>
      )}
      <CalendarView events={allEvents} onStatsChange={(s) => setStats(s)} meetings={meetings} onMeetingsChanged={loadMeetings} />
    </div>
  )
}

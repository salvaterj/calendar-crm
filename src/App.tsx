import { useEffect, useState } from 'react'
import { CalendarView } from './components/CalendarView'
import { fetchCards, fetchPanels } from './api/crm'
import { CRMItem, CalendarEvent } from './types/crm'
import { toCalendarEvents } from './lib/date'
import { Calendar as CalendarIcon } from 'lucide-react'

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
    const load = async () => {
      setLoading(true)
      try {
        // 1. Painel principal (Gabi Planejados / Vendas / etc - assumindo que é este ID)
        const mainPanelId = 'a04146a8-6cf1-4f88-8f97-d926292ec510'
        
        // 2. Buscar todos os painéis para encontrar os de USER
        const allPanels = await fetchPanels()
        
        // 3. Filtrar painéis de escopo USER
        const userPanelIds = allPanels
          .filter(p => p.scope === 'USER')
          .map(p => p.id)
          
        // 4. Lista única de IDs para buscar
        const idsToFetch = Array.from(new Set([mainPanelId, ...userPanelIds]))
        
        console.log('Buscando cards dos painéis:', idsToFetch)

        // 5. Buscar cards de todos os painéis em paralelo
        const results = await Promise.all(idsToFetch.map(id => fetchCards(id)))
        
        // 6. Combinar todos os itens
        const allItems = results.flat()
        
        setItems(allItems)
        setEvents(toCalendarEvents(allItems))
      } catch (e) {
        console.error(e)
        setError(e instanceof Error ? e.message : String(e))
      } finally {
        setLoading(false)
      }
    }
    
    load()
  }, [])

  if (loading) return <div className="page" style={{ alignItems: 'center', justifyContent: 'center' }}>Carregando...</div>
  if (error) return <div className="page error" style={{ alignItems: 'center', justifyContent: 'center' }}>Erro: {error}</div>

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
        <div style={{ 
          fontSize: '13px', 
          fontWeight: 500,
          color: '#64748b',
          background: '#f1f5f9',
          padding: '6px 12px',
          borderRadius: '20px'
        }}>
          {events.length} eventos carregados
        </div>
      </div>
      <CalendarView events={events} onStatsChange={(s) => setStats(s)} />
    </div>
  )
}

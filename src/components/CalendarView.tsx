 import { useState, useMemo, useEffect } from 'react'
import { Calendar, dateFnsLocalizer, EventProps, View, Views } from 'react-big-calendar'
 import { format, parse, startOfWeek, getDay, addDays, startOfDay, endOfDay, startOfMonth, endOfMonth, differenceInCalendarDays, isValid } from 'date-fns'
import { ptBR } from 'date-fns/locale/pt-BR'
import { Clock, UserCheck, MonitorPlay, Calendar as CalendarIcon, Filter } from 'lucide-react'
import { CalendarEvent, EventType } from '@/types/crm'
import { resolveUserName, USER_MAP } from '@/userMap'

const locales = { 'pt-BR': ptBR }
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales
})

function eventStyleGetter(event: CalendarEvent) {
  const colors: Record<string, string> = {
    dueDate: '#f97316',
    consultoria: '#22c55e',
    apresentacao: '#3b82f6'
  }
  return {
    style: {
      backgroundColor: colors[event.type] || '#64748b',
      borderRadius: '6px',
      color: '#fff',
      border: 'none',
      cursor: 'pointer'
    }
  }
}

function EventCard({ event }: EventProps<CalendarEvent>) {
  const icons: Record<EventType, React.ReactNode> = {
    dueDate: <Clock size={16} />,
    consultoria: <UserCheck size={16} />,
    apresentacao: <MonitorPlay size={16} />
  }
  const range = `${format(event.start, 'HH:mm')} - ${format(event.end, 'HH:mm')}`
  const who = resolveUserName(event.responsibleUserId)
  return (
    <div className="event-card" style={{ display: 'grid', gridTemplateColumns: '16px 1fr', gap: 8, alignItems: 'start', padding: '6px 4px' }}>
      <div style={{ paddingTop: 2 }}>{icons[event.type]}</div>
      <div>
        <div style={{ fontWeight: 700, fontSize: 13, lineHeight: 1.4, marginBottom: 6 }}>{event.title}</div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
          <span style={{ fontWeight: 600, fontSize: 12 }}>Responsável:</span>
          <span style={{ fontSize: 12 }}>{who}</span>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ fontWeight: 600, fontSize: 12 }}>Horário:</span>
          <span style={{ fontSize: 12 }}>{range}</span>
        </div>
      </div>
    </div>
  )
}

const formats = {
  timeGutterFormat: (date: Date) => format(date, 'HH:mm'),
  eventTimeRangeFormat: ({ start, end }: any, culture: any, local: any) =>
    local.format(start, 'HH:mm', culture) + ' - ' + local.format(end, 'HH:mm', culture),
  agendaTimeRangeFormat: ({ start, end }: any, culture: any, local: any) =>
    local.format(start, 'HH:mm', culture) + ' - ' + local.format(end, 'HH:mm', culture),
}

 type DateRange = 'today' | 'tomorrow' | 'week' | 'month' | 'custom'

 type Stats = { consultoria: number; apresentacao: number; validade: number; total: number }
 
export function CalendarView({ events, onStatsChange }: { events: CalendarEvent[]; onStatsChange?: (s: Stats) => void }) {
  const [date, setDate] = useState(new Date())
  const [view, setView] = useState<View>(Views.WEEK)
  const [range, setRange] = useState<DateRange>('week')
  const [customStart, setCustomStart] = useState<Date | null>(null)
  const [customEnd, setCustomEnd] = useState<Date | null>(null)
  const [customStartText, setCustomStartText] = useState('')
  const [customEndText, setCustomEndText] = useState('')
  const [selectedResponsible, setSelectedResponsible] = useState<string>('')
  const [selectedTypes, setSelectedTypes] = useState<Record<EventType, boolean>>({
    dueDate: true,
    consultoria: true,
    apresentacao: true
  })
  const [modalUrl, setModalUrl] = useState<string | null>(null)

  function maskDateInput(value: string) {
    const digits = value.replace(/\D/g, '').slice(0, 8)
    const d = digits.slice(0, 2)
    const m = digits.slice(2, 4)
    const y = digits.slice(4, 8)
    let out = ''
    if (d) out += d
    if (m) out += '/' + m
    if (y) out += '/' + y
    return out
  }

  const handleRangeChange = (newRange: DateRange) => {
    setRange(newRange)
    const today = new Date()
    switch (newRange) {
      case 'today':
        setDate(today)
        setView(Views.DAY)
        break
      case 'tomorrow':
        setDate(addDays(today, 1))
        setView(Views.DAY)
        break
      case 'week':
        setDate(today)
        setView(Views.WEEK)
        break
      case 'month':
        setDate(today)
        setView(Views.MONTH)
        break
       case 'custom':
         // Mantém a visualização em Agenda para listar por intervalo
         setView(Views.AGENDA)
         // Ajusta a data central para início personalizado (se houver)
         if (customStart) setDate(customStart)
         break
    }
  }

  const toggleType = (type: EventType) => {
    setSelectedTypes(prev => ({ ...prev, [type]: !prev[type] }))
  }

  const [visibleStart, visibleEnd] = useMemo(() => {
     if (range === 'today' || range === 'tomorrow') {
       const d = startOfDay(date)
       return [d, endOfDay(d)]
     }
     if (range === 'week') {
       const start = startOfWeek(date, { weekStartsOn: 1 })
       // Semana Seg-Sáb
       const end = endOfDay(addDays(start, 5))
       return [start, end]
     }
     if (range === 'custom') {
       if (customStart && customEnd) {
         return [startOfDay(customStart), endOfDay(customEnd)]
       }
       if (customStart && !customEnd) {
         return [startOfDay(customStart), endOfDay(customStart)]
       }
       if (!customStart && customEnd) {
         return [startOfDay(customEnd), endOfDay(customEnd)]
       }
       // Sem seleção, usa dia atual
       const d = startOfDay(date)
       return [d, endOfDay(d)]
     }
     // month
     return [startOfMonth(date), endOfMonth(date)]
  }, [range, date, customStart, customEnd])
 
   const typeFiltered = useMemo(() => {
    return events.filter(e => {
      const typeMatch = selectedTypes[e.type]
      const responsibleMatch = !selectedResponsible || e.responsibleUserId === selectedResponsible
      return typeMatch && responsibleMatch
    })
  }, [events, selectedTypes, selectedResponsible])
 
   const displayedEvents = useMemo(() => {
     return typeFiltered.filter(e => e.end > visibleStart && e.start < visibleEnd)
   }, [typeFiltered, visibleStart, visibleEnd])
 
   const stats = useMemo<Stats>(() => {
     const consultoria = displayedEvents.filter(e => e.type === 'consultoria').length
     const apresentacao = displayedEvents.filter(e => e.type === 'apresentacao').length
     const validade = displayedEvents.filter(e => e.type === 'dueDate').length
     const total = displayedEvents.length
     return { consultoria, apresentacao, validade, total }
   }, [displayedEvents])
 
   useEffect(() => {
     onStatsChange?.(stats)
   }, [stats, onStatsChange])

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div className="custom-toolbar" style={{ 
        display: 'flex', 
        gap: 16, 
        padding: '12px 24px', 
        borderBottom: '1px solid #e2e8f0',
        alignItems: 'center',
        background: '#fff'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <CalendarIcon size={18} color="#64748b" />
          <select 
            value={range} 
            onChange={(e) => handleRangeChange(e.target.value as DateRange)}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              fontSize: '14px',
              outline: 'none',
              color: '#334155'
            }}
          >
            <option value="today">Hoje</option>
            <option value="tomorrow">Amanhã</option>
            <option value="week">Esta Semana (Seg-Sáb)</option>
            <option value="month">Este Mês</option>
             <option value="custom">Personalizado</option>
          </select>
        </div>

        <div style={{ width: 1, height: 24, background: '#e2e8f0' }} />

         {range === 'custom' && (
           <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
             <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14 }}>
               <span style={{ color: '#64748b' }}>Início:</span>
               <input
                 type="text"
                 placeholder="dd/mm/yyyy"
                 value={customStartText}
                 onChange={(e) => {
                   const masked = maskDateInput(e.target.value)
                   setCustomStartText(masked)
                   const d = parse(masked, 'dd/MM/yyyy', new Date())
                   setCustomStart(isValid(d) && masked.length === 10 ? startOfDay(d) : null)
                 }}
                 style={{ padding: '6px 8px', border: '1px solid #cbd5e1', borderRadius: 6 }}
               />
             </label>
             <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14 }}>
               <span style={{ color: '#64748b' }}>Fim:</span>
               <input
                 type="text"
                 placeholder="dd/mm/yyyy"
                 value={customEndText}
                 onChange={(e) => {
                   const masked = maskDateInput(e.target.value)
                   setCustomEndText(masked)
                   const d = parse(masked, 'dd/MM/yyyy', new Date())
                   setCustomEnd(isValid(d) && masked.length === 10 ? endOfDay(d) : null)
                 }}
                 style={{ padding: '6px 8px', border: '1px solid #cbd5e1', borderRadius: 6 }}
               />
             </label>
             <button
               type="button"
               onClick={() => { setCustomStart(null); setCustomEnd(null); setCustomStartText(''); setCustomEndText('') }}
               style={{ padding: '6px 10px', border: '1px solid #cbd5e1', borderRadius: 6, background: '#f8fafc', color: '#334155', fontSize: 13 }}
             >
               Limpar
             </button>
           </div>
        )}

        <div style={{ width: 1, height: 24, background: '#e2e8f0' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
           <UserCheck size={16} color="#64748b" />
           <select
             value={selectedResponsible}
             onChange={(e) => setSelectedResponsible(e.target.value)}
             style={{
               padding: '6px 12px',
               borderRadius: '6px',
               border: '1px solid #cbd5e1',
               fontSize: '14px',
               outline: 'none',
               color: '#334155',
               maxWidth: '200px'
             }}
           >
             <option value="">Todos os responsáveis</option>
             {Object.entries(USER_MAP).map(([id, name]) => (
               <option key={id} value={id}>{name}</option>
             ))}
           </select>
        </div>

        <div style={{ width: 1, height: 24, background: '#e2e8f0' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#64748b', fontSize: 14 }}>
            <Filter size={16} />
            <span>Exibir:</span>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={selectedTypes.dueDate} 
                onChange={() => toggleType('dueDate')}
              />
              <span style={{ color: '#f97316', fontWeight: 500 }}>Validade</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={selectedTypes.consultoria} 
                onChange={() => toggleType('consultoria')}
              />
              <span style={{ color: '#22c55e', fontWeight: 500 }}>Consultoria</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={selectedTypes.apresentacao} 
                onChange={() => toggleType('apresentacao')}
              />
              <span style={{ color: '#3b82f6', fontWeight: 500 }}>Apresentação</span>
            </label>
          </div>
        </div>
 
       <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
         <span style={{ fontSize: 13, color: '#64748b' }}>Exibindo:</span>
         <span style={{ background: '#eafaf1', color: '#22c55e', border: '1px solid #b5e3c8', padding: '4px 8px', borderRadius: 999 }}>
           {stats.consultoria} Consultorias
         </span>
         <span style={{ background: '#e6f0ff', color: '#3b82f6', border: '1px solid #bcd2ff', padding: '4px 8px', borderRadius: 999 }}>
           {stats.apresentacao} Apresentação
         </span>
         <span style={{ background: '#fff2e6', color: '#f97316', border: '1px solid #ffd4b2', padding: '4px 8px', borderRadius: 999 }}>
           {stats.validade} Validade
         </span>
       </div>
      </div>

      <div style={{ padding: '10px 24px', borderBottom: '1px solid #e2e8f0', background: '#fff' }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: '#334155' }}>
          {format(visibleStart, 'dd/MM/yyyy')}
          {format(visibleEnd, 'dd/MM/yyyy') !== format(visibleStart, 'dd/MM/yyyy') ? ' - ' + format(visibleEnd, 'dd/MM/yyyy') : ''}
        </span>
      </div>

      <div style={{ flex: 1 }}>
        <Calendar
          localizer={localizer}
         events={typeFiltered}
          startAccessor="start"
          endAccessor="end"
          components={{ event: EventCard }}
          style={{ height: 'calc(100vh - 140px)', border: 'none' }}
          views={['month', 'week', 'day', 'agenda']}
          culture="pt-BR"
          view={view}
          date={date}
          onView={setView}
          onNavigate={setDate}
          toolbar={false}
          onSelectEvent={(e: CalendarEvent) => {
            const url =
              e.panelId && e.cardKey
                ? `https://crm.octanis.com.br/panels/${e.panelId}/card/${e.cardKey}`
                : 'https://crm.octanis.com.br/panels/a04146a8-6cf1-4f88-8f97-d926292ec510/card/COME-36'
            setModalUrl(url)
          }}
          eventPropGetter={(e: CalendarEvent) => eventStyleGetter(e)}
          min={new Date(0, 0, 0, 8, 0, 0)}
          max={new Date(0, 0, 0, 22, 0, 0)}
          formats={formats}
          dayLayoutAlgorithm="no-overlap"
          step={30}
          timeslots={1}
         {...(view === Views.AGENDA && range === 'custom' && customStart && customEnd
           ? { length: Math.max(1, differenceInCalendarDays(endOfDay(customEnd), startOfDay(customStart)) + 1) }
           : {})}
        />
      </div>
      {modalUrl && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(2,6,23,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ background: '#0b1223', width: '90vw', height: '85vh', borderRadius: 12, overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.35)', border: '1px solid #1f2937' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: '#111827', color: '#e5e7eb' }}>
              <div style={{ fontSize: 14, fontWeight: 600 }}>Detalhes do Card</div>
              <button onClick={() => setModalUrl(null)} style={{ background: 'transparent', border: 'none', color: '#e5e7eb', fontSize: 18, cursor: 'pointer' }}>×</button>
            </div>
            <iframe src={modalUrl} style={{ width: '100%', height: 'calc(100% - 40px)', border: 'none', background: '#fff' }} />
          </div>
        </div>
      )}
    </div>
  )
}

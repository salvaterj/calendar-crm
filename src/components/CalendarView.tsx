 import { useState, useMemo, useEffect } from 'react'
import { Calendar, dateFnsLocalizer, EventProps, View, Views } from 'react-big-calendar'
 import { format, parse, startOfWeek, getDay, addDays, startOfDay, endOfDay, startOfMonth, endOfMonth, differenceInCalendarDays, isValid } from 'date-fns'
import { ptBR } from 'date-fns/locale/pt-BR'
import { Clock, UserCheck, MonitorPlay, Calendar as CalendarIcon, Filter, CheckSquare, Video, MapPin } from 'lucide-react'
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
    apresentacao: '#3b82f6',
    tarefa: '#a855f7'
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
  const [showTooltip, setShowTooltip] = useState(false)

  const icons: Record<EventType, React.ReactNode> = {
    dueDate: <Clock size={13} />,
    consultoria: <UserCheck size={13} />,
    apresentacao: <MonitorPlay size={13} />,
    tarefa: <CheckSquare size={13} />
  }
  const range = `${format(event.start, 'HH:mm')} - ${format(event.end, 'HH:mm')}`
  const who = resolveUserName(event.responsibleUserId)
  // Pega apenas o primeiro nome
  const shortWho = who.split(' ')[0]
  
  const amountFormatted = event.monetaryAmount 
    ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(event.monetaryAmount)
    : null

  // Versão compacta do valor (ex: 1.2k)
  const compactAmount = event.monetaryAmount
    ? event.monetaryAmount >= 1000 
      ? `R$ ${(event.monetaryAmount / 1000).toFixed(1)}k`
      : `R$ ${event.monetaryAmount}`
    : null

  return (
    <div 
      className="event-card" 
      style={{ position: 'relative', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {/* CARD CLEAN: Ícone + Título + Responsável + Status Online */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, width: '100%' }}>
        {/* Ícone do Tipo */}
        <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>
          {icons[event.type]}
        </div>

        {/* Título Principal (Truncado) */}
        <div style={{ flex: 1, fontWeight: 600, fontSize: 12, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: 1.2 }}>
          {event.title}
        </div>

        {/* Info Direita: Responsável e/ou Status */}
        <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 4, opacity: 0.9 }}>
           {/* Se for Consultoria/Apresentação, mostra ícone Online/Presencial */}
           {(event.type === 'consultoria' || event.type === 'apresentacao') && (
             <div style={{ display: 'flex', alignItems: 'center' }}>
               {event.isOnline ? <Video size={12} /> : <MapPin size={12} />}
             </div>
           )}
           
           {/* Nome curto do responsável */}
           <span style={{ fontSize: 10, fontWeight: 500, opacity: 0.8 }}>{shortWho}</span>
        </div>
      </div>

      {/* TOOLTIP COMPLETO */}
      {showTooltip && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 4px)',
          left: 0,
          zIndex: 1000,
          background: '#1e293b',
          color: '#f8fafc',
          padding: '10px 14px',
          borderRadius: '8px',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.4), 0 8px 10px -6px rgba(0, 0, 0, 0.3)',
          width: 'max-content',
          minWidth: '200px',
          maxWidth: '280px',
          fontSize: '13px',
          pointerEvents: 'none',
          border: '1px solid #334155'
        }}>
          {/* Cabeçalho do Tooltip */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, borderBottom: '1px solid #334155', paddingBottom: 6 }}>
            {icons[event.type]}
            <span style={{ fontWeight: 600, fontSize: 14, lineHeight: 1.3 }}>{event.title}</span>
          </div>
          
          {/* Corpo do Tooltip */}
          <div style={{ display: 'grid', gap: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Clock size={14} className="text-slate-400" />
              <span style={{ color: '#e2e8f0' }}>{range}</span>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <UserCheck size={14} className="text-slate-400" />
              <span style={{ color: '#e2e8f0' }}>{who}</span>
            </div>

            {amountFormatted && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#4ade80' }}>$</span>
                <span style={{ fontWeight: 600, color: '#4ade80' }}>{amountFormatted}</span>
              </div>
            )}

            {(event.type === 'consultoria' || event.type === 'apresentacao') && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {event.isOnline ? (
                  <>
                    <Video size={14} className="text-blue-400" />
                    <span style={{ color: '#60a5fa', fontWeight: 500 }}>Reunião Online</span>
                  </>
                ) : (
                  <>
                    <MapPin size={14} className="text-amber-400" />
                    <span style={{ color: '#fbbf24', fontWeight: 500 }}>Reunião Presencial</span>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}
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

 type Stats = { consultoria: number; apresentacao: number; validade: number; tarefa: number; total: number }

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
    apresentacao: true,
    tarefa: true
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
     const tarefa = displayedEvents.filter(e => e.type === 'tarefa').length
     const total = displayedEvents.length
     return { consultoria, apresentacao, validade, tarefa, total }
   }, [displayedEvents])
 
   useEffect(() => {
    onStatsChange?.(stats)
  }, [stats, onStatsChange])

  useEffect(() => {
    if (range === 'custom' && customStart) {
      setDate(customStart)
    }
  }, [range, customStart])

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
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={selectedTypes.tarefa} 
                onChange={() => toggleType('tarefa')}
              />
              <span style={{ color: '#a855f7', fontWeight: 500 }}>Tarefa</span>
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
         <span style={{ background: '#f3e8ff', color: '#a855f7', border: '1px solid #d8b4fe', padding: '4px 8px', borderRadius: 999 }}>
           {stats.tarefa} Tarefas
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
          components={{ 
            event: EventCard,
            agenda: {
              event: EventCard
            }
          }}
          style={{ height: 'calc(100vh - 140px)', border: 'none' }}
          views={['month', 'week', 'day', 'agenda']}
          culture="pt-BR"
          view={view}
          date={date}
          onView={setView}
          onNavigate={setDate}
          toolbar={false}
          onSelectEvent={(e: CalendarEvent) => {
            console.log('Evento selecionado:', e)
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

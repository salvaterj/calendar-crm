import { useState, useMemo, useEffect } from 'react'
import { format, startOfWeek, addDays, startOfDay, endOfDay, startOfMonth, endOfMonth } from 'date-fns'
import { ptBR } from 'date-fns/locale/pt-BR'
import { Clock, UserCheck, MonitorPlay, Calendar as CalendarIcon, Filter, CheckSquare, Video, MapPin } from 'lucide-react'
import { DayPicker, type DayButtonProps } from 'react-day-picker'
import { fetchAgents } from '@/api/crm'
import { CalendarEvent, EventType } from '@/types/crm'
import { resolveUserName, USER_MAP } from '@/userMap'

const EVENT_COLORS: Record<string, string> = {
  dueDate: '#f97316',
  consultoria: '#22c55e',
  apresentacao: '#3b82f6',
  tarefa: '#a855f7'
}

const WEEKDAY_SHORT = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'] as const

function shortWeekday(date: Date) {
  return WEEKDAY_SHORT[date.getDay()]
}

function normalizeName(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

function withAlpha(hex: string, alphaHex: string) {
  if (hex.startsWith('#') && hex.length === 7) return `${hex}${alphaHex}`
  return hex
}

function eventStyleGetter(event: CalendarEvent) {
  const color = EVENT_COLORS[event.type] || '#64748b'
  return {
    style: {
      backgroundColor: withAlpha(color, '1A'),
      borderRadius: '4px',
      color: '#0f172a',
      border: '1px solid ' + withAlpha(color, '33'),
      borderLeft: `3px solid ${color}`,
      cursor: 'pointer',
      boxShadow: 'none',
      padding: '2px 6px',
      fontSize: '12px',
      lineHeight: 1.2
    }
  }
}

function TooltipOverlay({ event, rect }: { event: CalendarEvent, rect: DOMRect }) {
  const icons: Record<EventType, React.ReactNode> = {
    dueDate: <Clock size={13} />,
    consultoria: <UserCheck size={13} />,
    apresentacao: <MonitorPlay size={13} />,
    tarefa: <CheckSquare size={13} />
  }
  const range = `${format(event.start, 'HH:mm')} - ${format(event.end, 'HH:mm')}`
  const who = resolveUserName(event.responsibleUserId)
  
  const amountFormatted = event.monetaryAmount 
    ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(event.monetaryAmount)
    : null

  const spaceBelow = window.innerHeight - rect.bottom
  const showAbove = spaceBelow < 200

  return (
    <div style={{
      position: 'fixed',
      left: rect.left,
      ...(showAbove ? { bottom: window.innerHeight - rect.top + 4 } : { top: rect.bottom + 4 }),
      zIndex: 9999,
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
  )
}

function EventCardContent({ event, onHover }: { event: CalendarEvent, onHover: (e: CalendarEvent | null, rect?: DOMRect) => void }) {
  const icons: Record<EventType, React.ReactNode> = {
    dueDate: <Clock size={13} />,
    consultoria: <UserCheck size={13} />,
    apresentacao: <MonitorPlay size={13} />,
    tarefa: <CheckSquare size={13} />
  }

  return (
    <div 
      className="event-card" 
      style={{ position: 'relative', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
      onMouseEnter={(e) => onHover(event, e.currentTarget.getBoundingClientRect())}
      onMouseLeave={() => onHover(null)}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', minWidth: 0 }}>
        <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', color: '#475569' }}>
          {icons[event.type]}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: '#334155', opacity: 0.85, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {format(event.start, 'HH:mm')}
          </div>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {event.title}
          </div>
        </div>
        {(event.type === 'consultoria' || event.type === 'apresentacao') && (
          <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', color: '#64748b' }}>
            {event.isOnline ? <Video size={14} /> : <MapPin size={14} />}
          </div>
        )}
      </div>
    </div>
  )
}

type DateRange = 'week' | 'month'

 type Stats = { consultoria: number; apresentacao: number; validade: number; tarefa: number; total: number }

export function CalendarView({ events, onStatsChange }: { events: CalendarEvent[]; onStatsChange?: (s: Stats) => void }) {
  const [date, setDate] = useState(new Date())
  const [selectedDayKeys, setSelectedDayKeys] = useState<string[]>([])
  const [hoveredEvent, setHoveredEvent] = useState<{ event: CalendarEvent, rect: DOMRect } | null>(null)
  const [agentList, setAgentList] = useState<Array<{ userId?: string; name: string; hasTasks?: boolean }> | null>(null)
  const [selectedResponsible, setSelectedResponsible] = useState<string>('')
  const [selectedTypes, setSelectedTypes] = useState<Record<EventType, boolean>>({
    dueDate: true,
    consultoria: true,
    apresentacao: true,
    tarefa: true
  })
  const [modalUrl, setModalUrl] = useState<string | null>(null)

  const handleHover = (event: CalendarEvent | null, rect?: DOMRect) => {
    if (event && rect) {
      setHoveredEvent({ event, rect })
    } else {
      setHoveredEvent(null)
    }
  }

  const toggleType = (type: EventType) => {
    setSelectedTypes(prev => ({ ...prev, [type]: !prev[type] }))
  }

  useEffect(() => {
    let active = true
    fetchAgents()
      .then((list) => {
        if (!active) return
        setAgentList(list)
      })
      .catch(() => {
        if (!active) return
        setAgentList(null)
      })
    return () => {
      active = false
    }
  }, [])

  const responsibleOptions = useMemo(() => {
    const allowed = ['Julia', 'Fernanda', 'Mirian', 'Beatriz', 'Mariana']
    const allowedSet = new Set(allowed.map(normalizeName))
    const allowedLabelByKey = new Map<string, string>(allowed.map((n) => [normalizeName(n), n]))
    const idByFirstName = new Map<string, string>()
    for (const [id, name] of Object.entries(USER_MAP)) {
      const first = name.split(' -')[0].trim()
      if (first) idByFirstName.set(normalizeName(first), id)
    }

    const idsInEvents = new Set(events.map(e => e.responsibleUserId).filter(Boolean))

    const items: Array<{ id: string; label: string }> = []
    if (agentList && agentList.length > 0) {
      for (const a of agentList) {
        const first = a.name.split(' ')[0]?.trim() || ''
        const key = normalizeName(first)
        if (!allowedSet.has(key)) continue
        if (a.hasTasks === false) continue
        const id = a.userId && idsInEvents.has(a.userId) ? a.userId : idByFirstName.get(key)
        if (!id) continue
        if (!idsInEvents.has(id)) continue
        items.push({ id, label: allowedLabelByKey.get(key) || first })
      }
      items.sort((x, y) => allowed.indexOf(x.label) - allowed.indexOf(y.label))
      return items
    }

    for (const name of allowed) {
      const id = idByFirstName.get(normalizeName(name))
      if (!id) continue
      if (!idsInEvents.has(id)) continue
      items.push({ id, label: name })
    }
    return items
  }, [agentList, events])

  useEffect(() => {
    if (!selectedResponsible) return
    const allowed = new Set(responsibleOptions.map(o => o.id))
    if (!allowed.has(selectedResponsible)) setSelectedResponsible('')
  }, [selectedResponsible, responsibleOptions])

  const [visibleStart, visibleEnd] = useMemo(() => {
     const start = startOfWeek(date, { weekStartsOn: 0 })
     const end = endOfDay(addDays(start, 6))
     return [start, end]
  }, [date])
 
  const typeFiltered = useMemo(() => {
    return events.filter(e => {
      const typeMatch = selectedTypes[e.type]
      const responsibleMatch = !selectedResponsible || e.responsibleUserId === selectedResponsible
      return typeMatch && responsibleMatch
    })
  }, [events, selectedTypes, selectedResponsible])

  const monthDayCounts = useMemo(() => {
    const start = startOfMonth(date)
    const end = endOfMonth(date)
    const counts: Record<string, number> = {}
    for (const e of typeFiltered) {
      if (e.end <= start || e.start >= end) continue
      const key = format(e.start, 'yyyy-MM-dd')
      counts[key] = (counts[key] || 0) + 1
    }
    return counts
  }, [typeFiltered, date])

  const dayEvents = useMemo(() => {
    const start = startOfDay(date)
    const end = endOfDay(date)
    return typeFiltered
      .filter(e => e.end > start && e.start < end)
      .slice()
      .sort((a, b) => a.start.getTime() - b.start.getTime())
  }, [typeFiltered, date])

  const openEvent = (e: CalendarEvent) => {
    const url =
      e.panelId && e.cardKey
        ? `https://crm.octanis.com.br/panels/${e.panelId}/card/${e.cardKey}`
        : 'https://crm.octanis.com.br/panels/a04146a8-6cf1-4f88-8f97-d926292ec510/card/COME-36'
    setModalUrl(url)
  }

  const weekDays = useMemo(() => {
    const start = startOfWeek(date, { weekStartsOn: 0 })
    return Array.from({ length: 7 }, (_, i) => addDays(start, i))
  }, [date])

  useEffect(() => {
    const allowed = new Set(weekDays.map(d => format(d, 'yyyy-MM-dd')))
    setSelectedDayKeys(prev => prev.filter(k => allowed.has(k)))
  }, [weekDays])

  const weekDayData = useMemo(() => {
    return weekDays.map((d) => {
      const start = startOfDay(d)
      const end = endOfDay(d)
      const list = typeFiltered
        .filter(e => e.end > start && e.start < end)
        .slice()
        .sort((a, b) => a.start.getTime() - b.start.getTime())
      return { date: d, key: format(d, 'yyyy-MM-dd'), events: list }
    })
  }, [weekDays, typeFiltered])

  const selectedWeekDays = useMemo(() => {
    if (selectedDayKeys.length === 0) return weekDayData
    const selected = new Set(selectedDayKeys)
    return weekDayData.filter(d => selected.has(d.key))
  }, [weekDayData, selectedDayKeys])

  const toggleWeekDay = (key: string) => {
    setSelectedDayKeys(prev => {
      if (prev.length === 0) return [key]
      if (prev.includes(key)) {
        const next = prev.filter(k => k !== key)
        return next
      }
      return [...prev, key]
    })
  }

  const clearWeekSelection = () => setSelectedDayKeys([])

  const MonthDayButton = (props: DayButtonProps) => {
    const { day, modifiers, className, children, ...rest } = props
    const key = format(day.date, 'yyyy-MM-dd')
    const count = monthDayCounts[key] || 0
    const cls = ['month-day-btn', className].filter(Boolean).join(' ')
    return (
      <button {...rest} className={cls} data-outside={modifiers.outside ? 'true' : undefined}>
        <div className="month-day-inner">
          <span className="month-day-number">{format(day.date, 'd')}</span>
          {count > 0 && <span className="month-day-badge">{count}</span>}
        </div>
      </button>
    )
  }
 
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

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div className="custom-toolbar" style={{ 
        display: 'flex', 
        gap: 20, 
        padding: '16px 24px', 
        borderBottom: '1px solid #e2e8f0',
        alignItems: 'center',
        background: '#fff',
        flexWrap: 'wrap'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <CalendarIcon size={18} color="#64748b" />
          <span style={{ fontSize: '14px', fontWeight: 600, color: '#334155' }}>
            Filtros
          </span>
        </div>

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
               minWidth: '180px',
               backgroundColor: '#f8fafc',
               cursor: 'pointer'
             }}
           >
             <option value="">Todos os responsáveis</option>
             {responsibleOptions.map((p) => (
               <option key={p.id} value={p.id}>{p.label}</option>
             ))}
           </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#64748b', fontSize: 14, fontWeight: 500 }}>
            <Filter size={16} />
            <span>Exibir:</span>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#ea580c', cursor: 'pointer' }}>
              <input type="checkbox" checked={selectedTypes.dueDate} onChange={() => toggleType('dueDate')} style={{ accentColor: '#ea580c' }} />
              Validade
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#16a34a', cursor: 'pointer' }}>
              <input type="checkbox" checked={selectedTypes.consultoria} onChange={() => toggleType('consultoria')} style={{ accentColor: '#16a34a' }} />
              Consultoria
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#2563eb', cursor: 'pointer' }}>
              <input type="checkbox" checked={selectedTypes.apresentacao} onChange={() => toggleType('apresentacao')} style={{ accentColor: '#2563eb' }} />
              Apresentação
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#9333ea', cursor: 'pointer' }}>
              <input type="checkbox" checked={selectedTypes.tarefa} onChange={() => toggleType('tarefa')} style={{ accentColor: '#9333ea' }} />
              Tarefa
            </label>
          </div>
        </div>

        <div style={{ flex: 1 }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#64748b' }}>
          <span>Exibindo:</span>
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ background: '#dcfce7', color: '#16a34a', padding: '4px 10px', borderRadius: 20, fontWeight: 600 }}>
              {stats.consultoria} <span style={{ fontWeight: 500 }}>Consultorias</span>
            </div>
            <div style={{ background: '#dbeafe', color: '#2563eb', padding: '4px 10px', borderRadius: 20, fontWeight: 600 }}>
              {stats.apresentacao} <span style={{ fontWeight: 500 }}>Apresentação</span>
            </div>
            <div style={{ background: '#ffedd5', color: '#ea580c', padding: '4px 10px', borderRadius: 20, fontWeight: 600 }}>
              {stats.validade} <span style={{ fontWeight: 500 }}>Validade</span>
            </div>
            <div style={{ background: '#f3e8ff', color: '#9333ea', padding: '4px 10px', borderRadius: 20, fontWeight: 600 }}>
              {stats.tarefa} <span style={{ fontWeight: 500 }}>Tarefas</span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, position: 'relative' }}>
        <div style={{ display: 'flex', gap: 16, padding: 16, height: '100%', alignItems: 'stretch' }}>
          <div style={{ width: 400, display: 'flex', flexDirection: 'column', gap: 12, overflowY: 'auto' }}>
            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <button
                  type="button"
                  className="week-nav-btn"
                  onClick={() => { setDate(addDays(date, -7)); clearWeekSelection() }}
                >
                  ←
                </button>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>
                  {format(weekDays[0], 'dd/MM')} - {format(weekDays[6], 'dd/MM')}
                </div>
                <button
                  type="button"
                  className="week-nav-btn"
                  onClick={() => { setDate(addDays(date, 7)); clearWeekSelection() }}
                >
                  →
                </button>
              </div>

              <div className="week-day-grid">
                {weekDayData.map((d) => {
                  const selected = selectedDayKeys.length === 0 ? true : selectedDayKeys.includes(d.key)
                  return (
                    <button
                      key={d.key}
                      type="button"
                      className="week-day-toggle"
                      data-selected={selected ? 'true' : 'false'}
                      onClick={() => toggleWeekDay(d.key)}
                    >
                      <span className="week-day-name">{shortWeekday(d.date)}</span>
                      <span className="week-day-number">{format(d.date, 'd')}</span>
                      {d.events.length > 0 && <span className="week-day-count">{d.events.length}</span>}
                    </button>
                  )
                })}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
                <button type="button" className="week-clear-btn" onClick={clearWeekSelection}>
                  Mostrar todos
                </button>
              </div>
            </div>

            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 12 }}>
              <DayPicker
                mode="single"
                selected={date}
                onSelect={(d) => d && (setDate(d), setSelectedDayKeys([format(d, 'yyyy-MM-dd')]))}
                month={date}
                onMonthChange={(d) => { setDate(d); clearWeekSelection() }}
                locale={ptBR}
                weekStartsOn={0}
                showOutsideDays
                components={{ DayButton: MonthDayButton }}
              />
            </div>
          </div>

          <div style={{ flex: 1, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 12, overflow: 'auto' }}>
            <div style={{ display: 'grid', gap: 14 }}>
              {selectedWeekDays.map((d) => (
                <div key={d.key} style={{ border: '1px solid #e2e8f0', borderRadius: 12, overflow: 'hidden' }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', padding: '10px 12px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'baseline' }}>
                      <div style={{ fontSize: 13, fontWeight: 800, color: '#0f172a', textTransform: 'capitalize' }}>
                        {format(d.date, 'EEEE', { locale: ptBR })}
                      </div>
                      <div style={{ fontSize: 12, color: '#64748b' }}>{format(d.date, 'dd/MM')}</div>
                    </div>
                    <div style={{ fontSize: 12, color: '#64748b' }}>{d.events.length} eventos</div>
                  </div>

                  <div style={{ padding: 12 }}>
                    {d.events.length === 0 ? (
                      <div style={{ color: '#64748b', fontSize: 14, padding: 12, border: '1px dashed #cbd5e1', borderRadius: 10, background: '#fff' }}>
                        Nenhum evento neste dia.
                      </div>
                    ) : (
                      <div style={{ display: 'grid', gap: 8 }}>
                        {d.events.map((e) => (
                          <div
                            key={e.id}
                            style={{ ...eventStyleGetter(e).style, height: 'auto' }}
                            onClick={() => openEvent(e)}
                          >
                            <EventCardContent event={e} onHover={handleHover} />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {hoveredEvent && <TooltipOverlay event={hoveredEvent.event} rect={hoveredEvent.rect} />}
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

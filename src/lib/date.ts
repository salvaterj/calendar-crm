import { addMinutes, parseISO } from 'date-fns'
import { CalendarEvent, CRMItem, EventType, Meeting } from '@/types/crm'

function parseDate(value?: string | null) {
  if (!value) return null
  try {
    return parseISO(value)
  } catch {
    return null
  }
}

export function toCalendarEvents(items: CRMItem[]): CalendarEvent[] {
  const events: CalendarEvent[] = []
  const mainPanelId = 'a04146a8-6cf1-4f88-8f97-d926292ec510'

  for (const it of items) {
    const isMainPanel = it.panelId === mainPanelId
    const base = {
      title: it.title,
      responsibleUserId: it.responsibleUserId || null,
      panelId: it.panelId,
      cardKey: it.key || null,
      monetaryAmount: it.monetaryAmount || null
    }
    const due = parseDate(it.dueDate || null)
    if (due) {
      // Se for do painel principal, mantém como dueDate (validade)
      // Se for de outro painel (USER), classifica como tarefa
      // Mas se o painel USER for o principal (caso edge), mantém dueDate. 
      // A lógica: isMainPanel -> dueDate, !isMainPanel -> tarefa
      const type: EventType = isMainPanel ? 'dueDate' : 'tarefa'
      
      events.push({
        id: `${it.id}-due`,
        type,
        title: base.title,
        start: due,
        end: addMinutes(due, 90),
        responsibleUserId: base.responsibleUserId,
        panelId: base.panelId,
        cardKey: base.cardKey,
        monetaryAmount: base.monetaryAmount
      })
      
      // Se for tarefa (não principal), não processa consultoria/apresentação
      if (!isMainPanel) continue
    }
    const consult = parseDate(
      Array.isArray(it.customFields?.['data-da-consultoria'])
        ? it.customFields['data-da-consultoria'][0]
        : null
    )
    if (consult) {
      // Verifica o campo "tipo-de-atendimento-" (específico para consultoria)
      const typeKey = 'tipo-de-atendimento-'
      const typeValue = it.customFields[typeKey]
      
      const checkOnline = (val: any) => {
        const str = Array.isArray(val) ? val[0] : (typeof val === 'string' ? val : '')
        // Normaliza para lidar com "On-line", "Online", etc.
        return str && str.toLowerCase().replace('-', '').includes('online')
      }

      const isOnline = checkOnline(typeValue)

      events.push({
        id: `${it.id}-consult`,
        type: 'consultoria',
        title: base.title,
        start: consult,
        end: addMinutes(consult, 90),
        responsibleUserId: base.responsibleUserId,
        panelId: base.panelId,
        cardKey: base.cardKey,
        monetaryAmount: base.monetaryAmount,
        isOnline
      })
    }
    const apresent = parseDate(
      Array.isArray(it.customFields?.['data-da-apresenta-o'])
        ? it.customFields['data-da-apresenta-o'][0]
        : null
    )
    if (apresent) {
      // Verifica o campo "tipo-de-atendimento--1" (específico para apresentação)
      const typeKey = 'tipo-de-atendimento--1'
      const typeValue = it.customFields[typeKey]
      
      const checkOnline = (val: any) => {
        const str = Array.isArray(val) ? val[0] : (typeof val === 'string' ? val : '')
        // Normaliza para lidar com "On-line", "Online", etc.
        return str && str.toLowerCase().replace('-', '').includes('online')
      }

      const isOnline = checkOnline(typeValue)

      events.push({
        id: `${it.id}-apresent`,
        type: 'apresentacao',
        title: base.title,
        start: apresent,
        end: addMinutes(apresent, 90),
        responsibleUserId: base.responsibleUserId,
        panelId: base.panelId,
        cardKey: base.cardKey,
        monetaryAmount: base.monetaryAmount,
        isOnline
      })
    }
  }
  return events
}

export function toMeetingEvents(meetings: Meeting[]): CalendarEvent[] {
  return meetings.map((m) => ({
    id: `meeting-${m.id}`,
    type: 'reuniao',
    title: m.title,
    start: parseISO(m.startsAt),
    end: parseISO(m.endsAt),
    responsibleUserId: null,
    isOnline: m.isOnline,
    participantIds: m.participantIds
  }))
}

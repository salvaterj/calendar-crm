import { addMinutes, parseISO } from 'date-fns'
import { CalendarEvent, CRMItem, EventType } from '@/types/crm'

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
  for (const it of items) {
    const base = {
      title: it.title,
      responsibleUserId: it.responsibleUserId || null,
      panelId: it.panelId,
      cardKey: it.key || null
    }
    const due = parseDate(it.dueDate || null)
    if (due) {
      events.push({
        id: `${it.id}-due`,
        type: 'dueDate',
        title: base.title,
        start: due,
        end: addMinutes(due, 90),
        responsibleUserId: base.responsibleUserId,
        panelId: base.panelId,
        cardKey: base.cardKey
      })
    }
    const consult = parseDate(
      Array.isArray(it.customFields?.['data-da-consultoria'])
        ? it.customFields['data-da-consultoria'][0]
        : null
    )
    if (consult) {
      events.push({
        id: `${it.id}-consult`,
        type: 'consultoria',
        title: base.title,
        start: consult,
        end: addMinutes(consult, 90),
        responsibleUserId: base.responsibleUserId,
        panelId: base.panelId,
        cardKey: base.cardKey
      })
    }
    const apresent = parseDate(
      Array.isArray(it.customFields?.['data-da-apresenta-o'])
        ? it.customFields['data-da-apresenta-o'][0]
        : null
    )
    if (apresent) {
      events.push({
        id: `${it.id}-apresent`,
        type: 'apresentacao',
        title: base.title,
        start: apresent,
        end: addMinutes(apresent, 90),
        responsibleUserId: base.responsibleUserId,
        panelId: base.panelId,
        cardKey: base.cardKey
      })
    }
  }
  return events
}

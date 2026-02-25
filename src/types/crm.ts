export type CRMItem = {
  id: string
  createdAt: string
  updatedAt: string
  archived: boolean
  companyId: string
  panelId: string
  title: string
  description?: string | null
  key?: string | null
  number?: number | null
  dueDate?: string | null
  isOverdue?: boolean | null
  tagIds?: string[]
  sessionId?: string | null
  monetaryAmount?: number | null
  responsibleUserId?: string | null
  contactIds?: string[]
  customFields: Record<string, any>
  metadata?: any
}

export type Panel = {
  id: string
  title: string
  scope: string
  userId?: string | null
  description?: string | null
}

export type EventType = 'dueDate' | 'consultoria' | 'apresentacao' | 'tarefa'

export type CalendarEvent = {
  id: string
  type: EventType
  title: string
  start: Date
  end: Date
  responsibleUserId?: string | null
  panelId?: string
  cardKey?: string | null
  monetaryAmount?: number | null
}

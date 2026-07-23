import { useMemo, useState } from 'react'
import { format, addMinutes, differenceInMinutes, parseISO } from 'date-fns'
import { Users, AlertCircle } from 'lucide-react'
import { deleteMeeting, fetchMeetings, updateMeeting } from '@/api/meetings'
import { Meeting } from '@/types/crm'
import { getTeamMemberOptions } from '@/userMap'

const DURATION_OPTIONS = [30, 60, 90] as const

function toDateInputValue(date: Date) {
  return format(date, 'yyyy-MM-dd')
}

function toTimeInputValue(date: Date) {
  return format(date, 'HH:mm')
}

export function MeetingEditModal({
  meeting,
  onClose,
  onChanged
}: {
  meeting: Meeting
  onClose: () => void
  onChanged: () => void
}) {
  const teamOptions = useMemo(() => getTeamMemberOptions(), [])

  const startsAtDate = useMemo(() => parseISO(meeting.startsAt), [meeting.startsAt])
  const initialDuration = useMemo(
    () => differenceInMinutes(parseISO(meeting.endsAt), startsAtDate),
    [meeting.endsAt, startsAtDate]
  )

  const [title, setTitle] = useState(meeting.title)
  const [date, setDate] = useState(toDateInputValue(startsAtDate))
  const [startTime, setStartTime] = useState(toTimeInputValue(startsAtDate))
  const [duration, setDuration] = useState<number>(
    DURATION_OPTIONS.includes(initialDuration as (typeof DURATION_OPTIONS)[number]) ? initialDuration : 60
  )
  const [participantIds, setParticipantIds] = useState<string[]>(meeting.participantIds)
  const [isOnline, setIsOnline] = useState(meeting.isOnline)
  const [location, setLocation] = useState(meeting.location || '')
  const [submitting, setSubmitting] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const toggleParticipant = (id: string) => {
    setParticipantIds((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]))
  }

  const canSubmit = title.trim().length > 0 && participantIds.length > 0 && !submitting && !deleting

  const handleSave = async () => {
    if (!canSubmit) return
    setSubmitting(true)
    setError(null)
    try {
      const startsAt = new Date(`${date}T${startTime}:00`)
      const endsAt = addMinutes(startsAt, duration)
      await updateMeeting(meeting.id, {
        title: title.trim(),
        startsAt: startsAt.toISOString(),
        endsAt: endsAt.toISOString(),
        participantIds,
        isOnline,
        location: location.trim() || null
      })
      onChanged()
      onClose()
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Cancelar esta reunião?')) return
    setDeleting(true)
    setError(null)
    try {
      await deleteMeeting(meeting.id)
      const refreshed = await fetchMeetings()
      if (refreshed.some((m) => m.id === meeting.id)) {
        throw new Error('O servidor não confirmou a exclusão. Tente novamente em instantes.')
      }
      onChanged()
      onClose()
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(2,6,23,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}
      onClick={onClose}
    >
      <div
        style={{ background: '#fff', width: 360, maxWidth: '90vw', borderRadius: 12, boxShadow: '0 20px 60px rgba(0,0,0,0.35)', padding: 16 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>Editar reunião</span>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#64748b', fontSize: 18, cursor: 'pointer' }}>×</button>
        </div>

        {error && (
          <div
            role="alert"
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 8,
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: 8,
              padding: '8px 10px',
              marginBottom: 10,
              color: '#b91c1c',
              fontSize: 12,
              fontWeight: 600
            }}
          >
            <AlertCircle size={14} style={{ flexShrink: 0, marginTop: 1 }} />
            <span>{error}</span>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <input
            type="text"
            placeholder="Título da reunião"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13, width: '100%' }}
          />

          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13, width: '100%' }}
          />

          <div style={{ display: 'flex', gap: 6 }}>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13, flex: 1, minWidth: 0 }}
            />
            <select
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              style={{ padding: '6px 8px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13 }}
            >
              {DURATION_OPTIONS.map((d) => (
                <option key={d} value={d}>{d} min</option>
              ))}
            </select>
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#334155', cursor: 'pointer' }}>
            <input type="checkbox" checked={isOnline} onChange={(e) => setIsOnline(e.target.checked)} />
            Reunião online
          </label>

          <input
            type="text"
            placeholder={isOnline ? 'Link da chamada (opcional)' : 'Local/endereço (opcional)'}
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13, width: '100%' }}
          />

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
              <Users size={13} />
              Participantes
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {teamOptions.map((p) => (
                <label key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#334155', cursor: 'pointer' }}>
                  <input type="checkbox" checked={participantIds.includes(p.id)} onChange={() => toggleParticipant(p.id)} />
                  {p.label}
                </label>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
            <button
              type="button"
              onClick={handleDelete}
              disabled={submitting || deleting}
              style={{
                padding: '7px 12px',
                borderRadius: 6,
                border: '1px solid #fecaca',
                background: '#fff',
                color: deleting ? '#94a3b8' : '#dc2626',
                fontWeight: 600,
                fontSize: 13,
                cursor: deleting ? 'wait' : 'pointer'
              }}
            >
              {deleting ? 'Excluindo...' : 'Excluir'}
            </button>
            <button
              type="button"
              disabled={!canSubmit}
              onClick={handleSave}
              style={{
                padding: '7px 12px',
                borderRadius: 6,
                border: 'none',
                background: canSubmit ? '#db2777' : '#e2e8f0',
                color: canSubmit ? '#fff' : '#94a3b8',
                fontWeight: 600,
                fontSize: 13,
                cursor: canSubmit ? 'pointer' : 'not-allowed',
                flex: 1
              }}
            >
              {submitting ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

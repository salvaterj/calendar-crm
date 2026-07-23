import { useMemo, useState } from 'react'
import { format, addMinutes } from 'date-fns'
import { CalendarPlus, Users, AlertCircle } from 'lucide-react'
import { createMeeting } from '@/api/meetings'
import { getTeamMemberOptions } from '@/userMap'

const DURATION_OPTIONS = [30, 60, 90] as const

function toDateInputValue(date: Date) {
  return format(date, 'yyyy-MM-dd')
}

function toTimeInputValue(date: Date) {
  return format(date, 'HH:mm')
}

export function MeetingsPanel({ onChanged }: { onChanged: () => void }) {
  const teamOptions = useMemo(() => getTeamMemberOptions(), [])

  const now = new Date()
  const [title, setTitle] = useState('')
  const [date, setDate] = useState(toDateInputValue(now))
  const [startTime, setStartTime] = useState(toTimeInputValue(addMinutes(now, 60)))
  const [duration, setDuration] = useState<number>(60)
  const [participantIds, setParticipantIds] = useState<string[]>([])
  const [isOnline, setIsOnline] = useState(false)
  const [location, setLocation] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const toggleParticipant = (id: string) => {
    setParticipantIds((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]))
  }

  const canSubmit = title.trim().length > 0 && participantIds.length > 0 && !submitting

  const resetForm = () => {
    setTitle('')
    setParticipantIds([])
    setIsOnline(false)
    setLocation('')
  }

  const handleSubmit = async () => {
    if (!canSubmit) return
    setSubmitting(true)
    setError(null)
    try {
      const startsAt = new Date(`${date}T${startTime}:00`)
      const endsAt = addMinutes(startsAt, duration)
      await createMeeting({
        title: title.trim(),
        startsAt: startsAt.toISOString(),
        endsAt: endsAt.toISOString(),
        participantIds,
        isOnline,
        location: location.trim() || null
      })
      resetForm()
      onChanged()
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <CalendarPlus size={16} color="#db2777" />
        <span style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>Agendar Reunião</span>
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

        <button
          type="button"
          disabled={!canSubmit}
          onClick={handleSubmit}
          style={{
            padding: '7px 12px',
            borderRadius: 6,
            border: 'none',
            background: canSubmit ? '#db2777' : '#e2e8f0',
            color: canSubmit ? '#fff' : '#94a3b8',
            fontWeight: 600,
            fontSize: 13,
            cursor: canSubmit ? 'pointer' : 'not-allowed',
            width: '100%'
          }}
        >
          {submitting ? 'Agendando...' : 'Agendar reunião'}
        </button>
      </div>
    </div>
  )
}

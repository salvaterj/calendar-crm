import { useMemo, useState } from 'react'
import { format, parseISO, addMinutes } from 'date-fns'
import { ptBR } from 'date-fns/locale/pt-BR'
import { CalendarPlus, Users, Video, MapPin, Trash2, AlertCircle } from 'lucide-react'
import { createMeeting, deleteMeeting, fetchMeetings } from '@/api/meetings'
import { Meeting } from '@/types/crm'
import { getTeamMemberOptions, resolveUserName } from '@/userMap'

const DURATION_OPTIONS = [30, 60, 90] as const

function toDateInputValue(date: Date) {
  return format(date, 'yyyy-MM-dd')
}

function toTimeInputValue(date: Date) {
  return format(date, 'HH:mm')
}

export function MeetingsPanel({ meetings, onChanged }: { meetings: Meeting[]; onChanged: () => void }) {
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
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const toggleParticipant = (id: string) => {
    setParticipantIds((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]))
  }

  const canSubmit = title.trim().length > 0 && participantIds.length > 0 && !submitting

  const upcomingMeetings = useMemo(() => {
    const nowTs = Date.now()
    return meetings
      .filter((m) => parseISO(m.endsAt).getTime() >= nowTs)
      .slice()
      .sort((a, b) => parseISO(a.startsAt).getTime() - parseISO(b.startsAt).getTime())
  }, [meetings])

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

  const handleDelete = async (id: string) => {
    if (!window.confirm('Cancelar esta reunião?')) return
    setDeletingId(id)
    setError(null)
    try {
      await deleteMeeting(id)
      const refreshed = await fetchMeetings()
      if (refreshed.some((m) => m.id === id)) {
        throw new Error('O servidor não confirmou a exclusão. Tente novamente em instantes.')
      }
      onChanged()
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setDeletingId(null)
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

      <div style={{ marginTop: 14, paddingTop: 10, borderTop: '1px solid #e2e8f0' }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#334155', marginBottom: 8 }}>Próximas reuniões</div>
        {upcomingMeetings.length === 0 ? (
          <div style={{ color: '#64748b', fontSize: 12 }}>Nenhuma reunião agendada.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 220, overflowY: 'auto' }}>
            {upcomingMeetings.map((m) => (
              <div key={m.id} style={{ border: '1px solid #e2e8f0', borderRadius: 8, padding: 8, fontSize: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 6 }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 600, color: '#0f172a' }}>{m.title}</div>
                    <div style={{ color: '#64748b' }}>
                      {format(parseISO(m.startsAt), "dd/MM 'às' HH:mm", { locale: ptBR })}
                    </div>
                    <div style={{ color: '#64748b' }}>
                      {m.participantIds.map(resolveUserName).join(', ')}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: m.isOnline ? '#2563eb' : '#b45309', marginTop: 4 }}>
                      {m.isOnline ? <Video size={12} /> : <MapPin size={12} />}
                      {m.isOnline ? 'Online' : 'Presencial'}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDelete(m.id)}
                    disabled={deletingId === m.id}
                    title={deletingId === m.id ? 'Excluindo...' : 'Cancelar reunião'}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: deletingId === m.id ? '#94a3b8' : '#dc2626',
                      cursor: deletingId === m.id ? 'wait' : 'pointer',
                      padding: 4,
                      flexShrink: 0
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

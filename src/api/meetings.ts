import axios from 'axios'
import { CreateMeetingPayload, Meeting, UpdateMeetingPayload } from '@/types/crm'

const BASE_URL = import.meta.env.VITE_MEETINGS_API_URL

export async function fetchMeetings(): Promise<Meeting[]> {
  if (!BASE_URL) {
    throw new Error('VITE_MEETINGS_API_URL não configurada')
  }
  const res = await axios.get(`${BASE_URL}/meetings`)
  if (!Array.isArray(res.data)) {
    throw new Error('Resposta inesperada da meetings-api (verifique VITE_MEETINGS_API_URL)')
  }
  return res.data
}

export async function createMeeting(payload: CreateMeetingPayload): Promise<Meeting> {
  const res = await axios.post(`${BASE_URL}/meetings`, payload)
  return res.data
}

export async function updateMeeting(id: string, payload: UpdateMeetingPayload): Promise<Meeting> {
  const res = await axios.patch(`${BASE_URL}/meetings/${id}`, payload)
  return res.data
}

export async function deleteMeeting(id: string): Promise<void> {
  await axios.delete(`${BASE_URL}/meetings/${id}`)
}

import axios from 'axios'
import { CRMItem, Panel } from '@/types/crm'

const isDev = import.meta.env.DEV
const BASE_URL = '/crm/v1'
const TOKEN = import.meta.env.VITE_API_TOKEN

export async function fetchPanels(): Promise<Panel[]> {
  const pageSize = 100
  const headers = { Authorization: TOKEN, accept: 'application/json' }
  const items: Panel[] = []
  let page = 1
  while (true) {
    const url = `${BASE_URL}/panel`
    const params = {
      PageSize: pageSize,
      PageNumber: page
    }
    const res = await axios.get(url, { headers, params })
    
    if (res.status !== 200 || !res.data?.items) {
      break
    }
    
    const batch = res.data.items as Panel[]
    items.push(...batch)
    
    if (batch.length < pageSize || !res.data.hasMorePages) break
    page++
  }
  return items
}

export async function fetchCards(panelId: string): Promise<CRMItem[]> {
  const pageSize = 100
  const headers = { Authorization: TOKEN, accept: 'application/json' }
  const items: Record<string, CRMItem> = {}
  let page = 1
  while (true) {
    const url = `${BASE_URL}/panel/card`
    const params = {
      PanelId: panelId,
      IncludeDetails: 'CustomFields',
      PageSize: pageSize,
      PageNumber: page
    }
    const res = await axios.get(url, { headers, params })
    if (res.status !== 200 || !Array.isArray(res.data?.items)) {
      const key = res.data?.key
      const text = res.data?.text
      const message = key && text ? `${key}: ${text}` : 'Falha ao obter dados'
      throw new Error(message)
    }
    const batch = res.data.items as CRMItem[]
    let newCount = 0
    for (const it of batch) {
      if (!items[it.id]) {
        items[it.id] = it
        newCount++
      }
    }
    if (batch.length < pageSize || newCount === 0) break
    page++
  }
  return Object.values(items)
}

export async function fetchAgents(): Promise<Array<{ userId?: string; name: string; hasTasks?: boolean }>> {
  const res = await axios.get('/core/v1/agent')
  const data = res.data
  const list = Array.isArray(data) ? data : Array.isArray(data?.items) ? data.items : []

  const out: Array<{ userId?: string; name: string; hasTasks?: boolean }> = []
  for (const raw of list) {
    const obj = raw as any
    const name = String(obj?.name ?? obj?.displayName ?? obj?.fullName ?? '').trim()
    if (!name) continue
    const userId = obj?.userId != null ? String(obj.userId) : undefined
    const hasTasks =
      (Array.isArray(obj?.tasks) && obj.tasks.length > 0) ||
      (Array.isArray(obj?.items) && obj.items.length > 0) ||
      (Array.isArray(obj?.assignedTasks) && obj.assignedTasks.length > 0) ||
      (typeof obj?.taskCount === 'number' ? obj.taskCount > 0 : undefined) ||
      (typeof obj?.assignedCount === 'number' ? obj.assignedCount > 0 : undefined) ||
      (typeof obj?.totalTasks === 'number' ? obj.totalTasks > 0 : undefined)
    out.push({ userId, name, hasTasks })
  }
  return out
}

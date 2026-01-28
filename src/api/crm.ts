import axios from 'axios'
import { CRMItem } from '@/types/crm'

const isDev = import.meta.env.DEV
const BASE_URL = isDev ? '/crm/v1' : 'https://api.helena.run/crm/v1'
const TOKEN = import.meta.env.VITE_API_TOKEN

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

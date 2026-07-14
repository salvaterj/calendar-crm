---
name: helena-api
description: Usar ao implementar qualquer integração com a Helena CRM — busca de leads, envio de dados, webhooks ou leitura de conversas.
---

# Helena CRM — Padrão de Integração Octanis

## Autenticação
- Token via variável de ambiente: `HELENA_API_TOKEN`
- Nunca expor o token no cliente (browser) — todas as chamadas via servidor

## Paginação
- Parâmetros: `?page=1&pageSize=50`
- Resposta aninhada em `items`
- Controle de continuidade via `hasMorePages` (boolean)

```javascript
// Exemplo de busca paginada
async function fetchAllLeads() {
  let page = 1
  let allItems = []
  let hasMore = true

  while (hasMore) {
    const res = await fetch(`${HELENA_API_URL}/leads?page=${page}&pageSize=50`, {
      headers: { Authorization: `Bearer ${process.env.HELENA_API_TOKEN}` }
    })
    const data = await res.json()
    allItems = [...allItems, ...data.items]
    hasMore = data.hasMorePages
    page++
  }
  return allItems
}
```

## Mensagens e Conversas
- Session ID: extrair via regex da coluna "Endereço conversa" do CSV exportado
- Direção das mensagens:
  - `FROM_HUB` → mensagem do lead (inbound)
  - `TO_HUB` → mensagem enviada (outbound)
- Identificação do atendente: `origin == "DEFAULT"` + `direction == "TO_HUB"`
- Mensagens de bot: `origin == "BOT"`

## Boas Práticas
- Sempre implementar retry com backoff exponencial (API pode ser instável)
- Timeout máximo por requisição: 10 segundos
- Logar erros com contexto (endpoint, status code) mas sem expor o token
- Cache local quando possível para evitar chamadas repetidas

## Tratamento de Erros
```javascript
async function helenaRequest(endpoint) {
  const maxRetries = 3
  for (let i = 0; i < maxRetries; i++) {
    try {
      const res = await fetch(endpoint, { signal: AbortSignal.timeout(10000) })
      if (!res.ok) throw new Error(`Helena API error: ${res.status}`)
      return await res.json()
    } catch (err) {
      if (i === maxRetries - 1) throw err
      await new Promise(r => setTimeout(r, 1000 * (i + 1)))
    }
  }
}
```

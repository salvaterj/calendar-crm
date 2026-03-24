## Objetivo
Atualizar o seletor de pessoas do calendário para:
- Exibir apenas: Julia, Fernanda, Mirian, Beatriz, Mariana
- Mostrar no select somente as pessoas que **tiverem tarefas** retornadas pela API de agentes
- Permitir “adicionar/remover pessoas” via essa fonte de dados, sem depender de lista estática fixa no código

## Contexto atual (onde mexer)
- O select de pessoas é montado a partir de `USER_MAP` em [CalendarView.tsx](file:///Users/julianosalvater/Documents/Projetos%20Trae/Calend%C3%A1rio%20Gabi%20Planejados/calendar-crm/src/components/CalendarView.tsx#L325-L347).
- O filtro usa `responsibleUserId` do evento vs `selectedResponsible` em [CalendarView.tsx](file:///Users/julianosalvater/Documents/Projetos%20Trae/Calend%C3%A1rio%20Gabi%20Planejados/calendar-crm/src/components/CalendarView.tsx#L170-L204).
- O mapeamento estático fica em [userMap.ts](file:///Users/julianosalvater/Documents/Projetos%20Trae/Calend%C3%A1rio%20Gabi%20Planejados/calendar-crm/src/userMap.ts).

## Decisões e trade-offs
1) **Segurança do token**
   - Não é recomendado consumir um token de API sensível direto do frontend.
   - Proposta: criar um **proxy** via `vite.config.ts` para `/helena/*`, onde o header Authorization é injetado pelo servidor de dev com uma variável de ambiente **não** exposta ao cliente.
   - Em produção, isso precisa de um backend (ou edge function). No plano abaixo eu deixo a implementação “pronta” para dev e estruturada para migrar para backend depois.

2) **Compatibilidade de IDs**
   - O filtro do calendário usa `responsibleUserId` (origem CRM).
   - A API de agentes pode retornar um `id` que:
     - (a) coincide com o `responsibleUserId` (ideal), ou
     - (b) não coincide; nesse caso, faremos fallback por **nome** usando um reverse-map do `USER_MAP`.

## Plano de implementação (passo a passo)
1) **Inspecionar o schema de resposta do endpoint de agentes**
   - Fazer uma chamada real (via proxy) e registrar somente campos estruturais necessários (sem logar token).
   - Identificar:
     - campo de identificador do agente (`id`/`userId`/etc)
     - campo de nome (`name`/`displayName`)
     - onde aparecem as “tarefas” (ex: `tasks`, `items`, `assigned`, `count` etc.)

2) **Adicionar camada de API para agentes**
   - Criar um módulo `src/api/helena.ts` com `fetchAgents()` (ou nome equivalente).
   - A chamada deve usar a rota interna `/helena/core/v1/agent` (ou `/helena/...`) para não expor token no client.
   - Tipar de forma tolerante (schema pode variar) e normalizar para:
     - `{ id?: string; name: string; hasTasks: boolean }[]`

3) **Configurar proxy no Vite (dev)**
   - Em `vite.config.ts`, adicionar proxy `/helena` apontando para `https://api.helena.run`.
   - Injetar o header Authorization via env do servidor (ex: `HELENA_API_TOKEN`), não via variável `VITE_*`.
   - Se o token não existir, a UI deve continuar funcionando, mas o select cairá para fallback (ver passo 5).

4) **Atualizar o select de pessoas na UI**
   - Em `CalendarView.tsx`:
     - carregar agentes no `useEffect` (com estado `agentsLoading/agentsError` opcional)
     - manter uma lista permitida fixa: `['Julia','Fernanda','Mirian','Beatriz','Mariana']`
     - filtrar agentes:
       - `name` ∈ lista permitida
       - `hasTasks === true`
     - montar opções do select a partir dessa lista dinâmica

5) **Fallback quando a API não retornar / token falhar**
   - Se a API estiver indisponível:
     - exibir as 5 pessoas fixas **somente se** existirem no `USER_MAP` (ou se aparecerem nos eventos carregados), para não “sumir” o filtro.
   - Mostrar o select sempre com “Todos os responsáveis” + opções disponíveis.

6) **Alinhar ID do select com `responsibleUserId`**
   - Prioridade:
     - se `agent.id` bater com os IDs dos eventos, `option.value = agent.id`
     - senão, usar reverse lookup por nome em `USER_MAP` para obter o ID correto
   - Garantir que o filtro continue funcionando exatamente como hoje.

7) **Validação**
   - Rodar typecheck/build.
   - Testar cenários:
     - API ok: select mostra somente pessoas permitidas com tarefas
     - API falha: fallback funcionando
     - Selecionar pessoa filtra lista corretamente

## Resultado esperado
- O select de pessoas deixa de ser “lista estática completa” e vira “lista dinâmica baseada na API”, mas mantendo restrição às 5 pessoas.
- Apenas pessoas com tarefas no retorno da API aparecem no select.
- Sem exposição de segredo no client durante desenvolvimento (via proxy).

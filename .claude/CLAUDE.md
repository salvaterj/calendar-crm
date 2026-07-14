# Calendar CRM — Gabi Planejados

## Sobre o Projeto
- **Objetivo:** painel de calendário que exibe cards/tarefas do Helena CRM por consultora/agente (Gabi Planejados)
- **Status:** em produção / manutenção contínua

## Stack
- **Frontend:** React + TypeScript + Vite
- **Backend novo (`meetings-api/`):** Node.js + Express + `pg` (JS puro, sem build step), Postgres próprio — ver seção Reuniões abaixo
- **HTTP client:** axios
- **UI:** react-big-calendar, react-day-picker, date-fns, lucide-react
- **Hospedagem:** Easypanel — frontend (Docker + Nginx, ver `Dockerfile`/`nginx.conf`), `meetings-api` (Docker separado) e Postgres (serviço gerenciado do Easypanel)

## Integrações
- **Helena CRM** (`api.helena.run`) — somente leitura
  - Em dev: proxy configurado em `vite.config.ts` para `/core` e `/crm`
  - Em produção (Docker/Nginx): proxy configurado em `nginx.conf`, mas **apenas para `/crm/`** — `/core/` não tem location block (usado por `fetchAgents` em `src/api/crm.ts`), cair no fallback SPA gera 404 silencioso em produção. Avaliar se precisa ser corrigido (bug pré-existente, não relacionado à feature de reuniões).

## Reuniões (agendamento multi-participante)
- A Helena CRM só aceita 1 responsável por card, então reuniões com múltiplos participantes **não** são cards da Helena — são um recurso próprio, com backend/banco dedicados (`meetings-api/`), independente da Helena.
- Backend: `meetings-api/` (subpasta na raiz do repo). Tabela única `meetings` (Postgres) com `participant_ids text[]`. Endpoints: `GET/POST /meetings`, `DELETE /meetings/:id`, `GET /health`. Rodar migration uma vez: `psql $DATABASE_URL -f meetings-api/migrations/001_create_meetings.sql`.
- Frontend: `src/api/meetings.ts`, tipo `EventType` inclui `'reuniao'`, componente `src/components/MeetingsPanel.tsx` (abaixo do `CalendarView`, cria/lista/cancela reuniões).
- **Sem autenticação**: qualquer pessoa com a URL da `meetings-api` pode criar/cancelar reunião via curl, não só pela UI. CORS restrito por `ALLOWED_ORIGIN` reduz abuso casual pelo browser, mas não bloqueia chamada direta. Login/token fica como próximo passo se incomodar.
- MVP: sem edição (cancela e recria), sem notificação (e-mail/WhatsApp), sem recorrência.

## Variáveis de Ambiente
- `VITE_API_TOKEN` — token de autorização do Helena CRM (também aceito como `HELENA_API_TOKEN` no `vite.config.ts`)
- `VITE_MEETINGS_API_URL` — URL pública da `meetings-api` (ex: `http://localhost:3001` em dev)
- `meetings-api/.env`: `DATABASE_URL`, `DATABASE_SSL`, `ALLOWED_ORIGIN`, `PORT` (ver `meetings-api/.env.example`)

## Comandos
- Dev: `npm run dev`
- Build: `npm run build`
- Preview (serve o build de produção localmente): `npm run preview`
- Typecheck: `npm run typecheck`

## Regras Específicas do Projeto
- `npm run preview` serve os arquivos estáticos do `dist/` sem o proxy de dev do Vite — chamadas a `/crm/v1` e `/core/v1` vão falhar (404/CORS) a menos que haja um proxy externo rodando (ex.: subir via Docker/Nginx local, ou usar `vite dev` para testar integração real com a API).
- Usuários/agentes do CRM são mapeados manualmente em `src/userMap.ts` (USER_MAP) — novos consultores precisam ser adicionados ali manualmente.

## Contexto do Cliente
- Gabi Planejados (móveis planejados) — usuárias mapeadas em `src/userMap.ts`: Mirian, Júlia, Mariana, Lívia, Fernanda, Déborah, Beatriz, Gabriela, Karen.

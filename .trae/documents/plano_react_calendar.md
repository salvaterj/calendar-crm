## Objetivo
Avaliar e, se fizer sentido, adotar a biblioteca `react-calendar` como componente de calendário na UI, mantendo as funcionalidades atuais (visualização por semana e por mês, hover com detalhes, filtro por responsável e por tipo).

## Contexto Atual
- O projeto hoje usa `react-big-calendar` para renderizar o grid semanal e mensal.
- A UI já depende fortemente de “eventos em grade” (semana) e “eventos em células” (mês), além de tooltip no hover.

## Observação Importante (limitação de escopo)
`react-calendar` é um componente de calendário “date picker” (focado em selecionar datas/meses). Ele não é um “scheduler” completo (time-grid semanal com colunas/slots e eventos posicionados por hora) como o `react-big-calendar`.

Isso significa:
- Dá para usar `react-calendar` muito bem para a visão de MÊS (grade mensal), navegação e seleção de dia.
- Para a visão de SEMANA (com horários e eventos posicionados), `react-calendar` não substitui diretamente o `react-big-calendar`. Para manter a semana no mesmo nível, precisaríamos:
  - manter o `react-big-calendar` apenas para semana, ou
  - reimplementar a semana “na mão” (CSS grid + lógica de layout), ou
  - trocar por uma biblioteca scheduler alternativa (não é o pedido aqui, mas é uma rota possível).

## Alternativa: `Calendar` do shadcn/ui
O “calendário” do shadcn/ui também é um date picker (baseado em `react-day-picker`). Ou seja, as limitações são as mesmas do `react-calendar` para a visão semanal com horários.

O que ele traz de vantagem:
- Visual bem consistente com UI moderna (estilo shadcn) e fácil de customizar.
- Melhor integração com componentes de UI (Popover, Tooltip, Badge) para chegar num “Google-like”.

Pontos de atenção:
- shadcn/ui não é uma lib pronta no npm “plug and play”; normalmente você “instala” componentes gerados no seu projeto e depende de Tailwind + utilitários (ex: `tailwind-merge`, `class-variance-authority`) e, em alguns casos, Radix UI.
- Antes de adotar, precisamos checar se o projeto já tem Tailwind/postcss configurados de forma oficial (hoje existe `@tailwind` no CSS, mas isso por si só não garante que o pipeline esteja completo).

## Estratégias Possíveis
### Estratégia A (recomendada): Híbrido
Usar `react-calendar` para a visualização mensal e navegação (mês/dia), e manter `react-big-calendar` apenas para a visualização semanal.
- Pró: melhora a estética do mês e a navegação rapidamente, sem reescrever a semana.
- Pró: risco baixo e entrega incremental.
- Contra: duas bibliotecas de calendário convivendo.

### Estratégia A2 (recomendada se quisermos “look shadcn”): Híbrido com shadcn/ui
Usar o `Calendar` do shadcn/ui para a visualização mensal/navegação e manter `react-big-calendar` para semana.
- Pró: visual mais moderno e consistente; facilita padronizar tooltip/popover/badges.
- Contra: pode exigir setup/normalização de Tailwind/shadcn no projeto.

### Estratégia B: Substituição total por `react-calendar`
Trocar também a semana, implementando um scheduler próprio.
- Pró: UI totalmente customizada (pode ficar mais “Google Calendar”).
- Contra: maior custo e risco (layout de eventos, overlaps, scroll/horários, responsividade).

## Plano de Implementação (Estratégia A2: shadcn/ui no Mês + big-calendar na Semana)
1) Verificar/ajustar pré-requisitos do shadcn/ui:
   - Confirmar se Tailwind e PostCSS estão realmente ativos no build.
   - Se não estiverem: adicionar as dependências e configs mínimas (Tailwind + PostCSS + config).
2) Adicionar dependências necessárias para o `Calendar` do shadcn/ui (`react-day-picker` e utilitários).
3) Adicionar o componente `Calendar` (shadcn/ui) ao projeto, seguindo o padrão do shadcn:
   - Garantir estilos e tokens (cores/raios) coerentes com o app.
4) Criar um componente “Mês” baseado no `Calendar` (shadcn):
   - Renderizar o mês.
   - Marcar dias com eventos (dot/badge e contagem).
   - Permitir clique/seleção de dia.
5) Criar uma lista “Agenda do dia” ao lado/abaixo do mês:
   - Ao selecionar um dia, listar eventos daquele dia em cards compactos.
   - Tooltip no hover mostra detalhes completos (reaproveitar o tooltip atual ou migrar para um tooltip/popup estilo shadcn).
6) Integrar com o seletor de visualização:
   - “Semana”: continua com `react-big-calendar`.
   - “Mês”: passa a usar `Calendar` (shadcn) + agenda do dia.
   - Manter navegação consistente (mudar mês/dia atual reflete no estado `date`).
7) Garantir filtros (responsável/tipo) aplicados:
   - marcadores do mês,
   - lista do dia,
   - semana.
8) Ajustes finais “Google-like”:
   - microinterações no hover,
   - espaçamento e densidade (sem poluição),
   - hierarquia tipográfica.
9) Validação no preview:
   - conferência de navegação, seleção, filtros, hover/tooltip e responsividade.

## Plano de Implementação (Estratégia A: react-calendar no Mês + big-calendar na Semana)
1) Adicionar dependência `react-calendar` e styles necessários.
2) Criar um componente “Mês” baseado em `react-calendar`:
   - Renderizar o grid mensal.
   - Marcar dias com eventos (ex: badge/dot e contagem).
   - Manter tooltip/hover ao listar eventos do dia (ver item 3).
3) Criar uma lista “Agenda do dia” ao lado/abaixo do mês:
   - Ao clicar em um dia, listar eventos daquele dia em cards (com o mesmo tooltip atual no hover).
   - Reutilizar `EventCard`/tooltip (ou extrair um componente de tooltip para não duplicar).
4) Integrar com o seletor de visualização:
   - “Semana”: continua com `react-big-calendar`.
   - “Mês”: passa a usar `react-calendar` + agenda do dia.
   - Manter comportamento de navegação (setDate) consistente entre semana e mês.
5) Ajustar CSS para aparência “Google-like”:
   - Tipografia, espaçamentos, cores neutras, hover suave, badges discretos.
6) Garantir que filtros (responsável/tipo) impactem:
   - Os marcadores no mês (dias com eventos).
   - A lista do dia.
   - A semana no scheduler atual.
7) Validação no preview:
   - Conferir que o mês navega corretamente.
   - Conferir que clique/seleção de dia filtra a lista do dia.
   - Conferir que tooltip no hover continua mostrando as informações completas.

## Critérios de Aceite
- “Semana” continua funcionando como hoje (mesmas informações no hover).
- “Mês” passa a ter visual mais limpo e navegação fluida.
- No mês, dias com eventos ficam sinalizados (dot/contagem) e existe uma forma clara de ver os eventos do dia (lista do dia).
- Filtros por responsável/tipo funcionam nas duas visualizações.

## Pontos que preciso que você confirme
- No “Mês” você prefere:
  - (1) Apenas dots/contagem por dia + lista do dia ao clicar, ou
  - (2) Mostrar os eventos dentro da célula do dia (mais parecido com Google Calendar, porém pode ficar mais denso)?

- Você quer seguir com qual caminho?
  - (A2) shadcn/ui no Mês + big-calendar na Semana (mais “UI moderna”, pode exigir setup), ou
  - (A) react-calendar no Mês + big-calendar na Semana (mais simples, menos dependências)?

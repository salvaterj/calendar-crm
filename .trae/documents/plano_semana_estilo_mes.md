## Objetivo
Unificar a experiência de “Mês” e “Semana” no mesmo estilo: seleção de datas à esquerda + lista detalhada à direita.

## O que você pediu (interpretação)
- Semana deve mostrar **Dom–Sáb** como “seções” na lista (títulos por dia), com os eventos daquele dia.
- Ao selecionar **1 dia**, a lista mostra apenas aquele dia.
- Ao selecionar **vários dias**, a lista mostra apenas os selecionados, **separados por dia**.
- Navegação entre semanas com o mesmo conforto do mês (setas “anterior/próximo”), e também poder “pular de mês” facilmente quando estiver na semana.

## Abordagem proposta
Trocar a visualização semanal atual (grade por horas do `react-big-calendar`) por uma visualização **Semana (Lista)**, usando o mesmo padrão do “Mês”:
- **Coluna esquerda (controle):**
  - Um mini calendário (DayPicker) para escolher uma data “âncora” da semana (isso já dá navegação fácil de mês com setas).
  - Um seletor Dom–Sáb com botões “toggle” para seleção múltipla de dias daquela semana.
  - Botões de navegação “Semana anterior / próxima semana” (setas) para avançar/voltar 7 dias mantendo a âncora.
- **Coluna direita (conteúdo):**
  - Lista de eventos agrupada por dia (Dom–Sáb), ordenada por horário.
  - Reutiliza o mesmo card/tooltip já existente (hover mostra detalhes completos).
  - Clique no evento continua abrindo o modal do card no CRM.

## Mudanças de Estado (no componente)
- Manter `date` como data âncora (já existe).
- Adicionar estado `selectedDayKeys: string[]` (ex: `['2026-03-24', '2026-03-26']`) para seleção múltipla na semana.
  - Quando vazio: mostrar todos os dias Dom–Sáb.
  - Quando contém datas: filtrar lista para apenas esses dias.
- Ao mudar `date` (por clique no DayPicker ou navegação semanal), atualizar a “semana corrente” e limpar a seleção múltipla se necessário (ou manter apenas as datas que ainda estiverem dentro da semana).

## Regras de Dados / Filtros
- Os filtros já existentes (responsável e tipos) continuam gerando `typeFiltered`.
- A lista semanal/mensal trabalha sempre a partir de `typeFiltered`.
- A lista semanal considera o intervalo Dom–Sáb da semana da `date` âncora.
- Para cada dia, incluir evento se `event.end > startOfDay(dia)` e `event.start < endOfDay(dia)`.

## Passos de Implementação
1) Ajustar `CalendarView` para que “Semana” não use mais `react-big-calendar` e sim o layout “lista” (igual ao mês em duas colunas).
2) Implementar navegação semanal:
   - Botões “←” e “→” mudam `date` em -7/+7 dias.
   - Exibir no header o intervalo da semana (Dom–Sáb) com o mesmo padrão do mês.
3) Implementar seleção múltipla Dom–Sáb:
   - Renderizar 7 botões (Dom…Sáb) com o número do dia.
   - Clique alterna inclusão/remoção do dia em `selectedDayKeys`.
   - Botão “Limpar” para zerar seleção.
4) Renderizar lista da direita agrupada por dia:
   - Para cada dia (ou somente selecionados), renderizar um título (ex: “Dom, 24/03”) e a lista de eventos.
   - Reutilizar o mesmo card/tooltip e `openEvent`.
5) Manter o “Mês” como já está (DayPicker + agenda do dia), garantindo consistência visual.
6) Ajustes finos de CSS:
   - Estilos dos botões da semana (pills) e estados (selecionado/hover).
   - Alinhamento da coluna esquerda para ficar consistente com o “Mês”.
7) Validação:
   - Typecheck e build.
   - Conferir seleção 1 dia e múltiplos dias.
   - Conferir navegação por setas entre semanas e navegação por mês no DayPicker.
   - Conferir filtros (responsável/tipo) afetando lista e contagens.

## Critérios de Aceite
- Semana em formato lista (Dom–Sáb) com separação por dia.
- Seleção de 1+ dias filtra a lista corretamente e mantém separação por dia.
- Setas mudam semana (±7 dias) e atualizam a lista.
- Mini calendário permite pular meses facilmente mesmo na visão de semana.
- Tooltip no hover continua funcionando e clique abre modal do CRM.

## Observação (trade-off)
Ao adotar semana “lista”, perdemos o grid por horário (posição do evento na grade). Em troca, ganhamos o estilo “Google-like” de foco em lista/tooltip e filtragem rápida por dia.

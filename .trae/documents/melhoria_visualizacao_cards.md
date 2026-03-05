# Plano de Melhoria de UX/UI para Visualização de Cards no Calendário

O objetivo é resolver o problema de encavalamento e corte de informações nos cards do calendário, especialmente em visualizações com colunas estreitas (como a visão semanal).

## Diagnóstico
O componente `EventCard` atual possui muitas informações textuais ("Responsável:", "Valor:", "Horário:") e badges grandes ("Online"/"Presencial") que ocupam muito espaço horizontal. Quando a coluna do dia é estreita, o conteúdo quebra ou é cortado, prejudicando a legibilidade.

## Solução Proposta
Adotar uma abordagem de **"Card Compacto + Tooltip Rico"**. O card no calendário mostrará apenas o essencial de forma visualmente limpa, e os detalhes completos serão exibidos ao passar o mouse (hover).

### 1. Refatoração Visual do `EventCard` (Layout Compacto)
Transformar o card para focar em escaneabilidade rápida:
- **Cabeçalho Limpo**: Apenas o ícone do tipo de evento e o Título (com truncamento elegante `text-overflow: ellipsis`).
- **Remoção de Labels**: Remover textos fixos como "Responsável:", "Horário:", "Valor:". O contexto será dado por ícones.
- **Linha de Informações Secundárias**:
  - Exibir o **Valor** (se houver) em destaque, ex: `R$ 1.2k`.
  - Exibir o **Responsável** apenas com ícone + primeiro nome (ou iniciais se muito pequeno).
- **Indicador Online/Presencial Minimalista**:
  - Substituir o badge grande com texto por apenas um ícone discreto no canto (Câmera 📹 ou Pin 📍).

### 2. Implementação de Tooltip de Detalhes
Criar um mecanismo de tooltip que aparece ao passar o mouse sobre o evento:
- **Conteúdo do Tooltip**: Mostrará todas as informações detalhadas que foram removidas ou abreviadas no card.
  - Título completo.
  - Horário exato.
  - Nome completo do Responsável.
  - Valor monetário completo.
  - Status Online/Presencial por extenso.
- **Implementação Técnica**: Usar CSS/Estado local para exibir um box flutuante com `z-index` alto sobre o calendário.

### 3. Ajustes de CSS Global (`styles.css`)
- Reduzir o `padding` interno dos eventos (`.rbc-event`) para ganhar área útil.
- Ajustar `font-size` para escalas menores em telas compactas.
- Garantir que o container do evento tenha `overflow: hidden` tratado corretamente para não quebrar o layout da grade.

## Passos de Execução

1.  **Criar Componente `EventTooltip`**:
    - Desenvolver um componente simples que recebe os dados do evento e renderiza o card flutuante.
2.  **Atualizar `EventCard` em `CalendarView.tsx`**:
    - Alterar o layout para a versão compacta.
    - Integrar o `EventTooltip` para aparecer no hover.
    - Substituir textos por ícones da biblioteca `lucide-react`.
3.  **Ajustar Estilos em `styles.css`**:
    - Otimizar as classes `.rbc-event` e `.event-card` para densidade de informação.

Esta abordagem mantém a utilidade do calendário (visão geral) sem perder os detalhes (acessíveis via hover), resolvendo a poluição visual.

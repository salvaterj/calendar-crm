# Plano de Redesign Clean do Calendário

O objetivo é simplificar drasticamente a visualização padrão dos cards no calendário, tornando-os mais "clean" e focados na legibilidade, e movendo todas as informações secundárias para um tooltip rico no hover.

## 1. Visualização Padrão (Card Clean)
O card será reestruturado para ser uma linha (ou bloco compacto) contendo apenas o essencial, similar à referência visual (Agendor) fornecida:

- **Layout**: Horizontal, priorizando uma linha única ou bloco compacto.
- **Conteúdo**:
    1.  **Ícone do Evento** (esquerda): Identifica se é Consultoria, Apresentação, Tarefa, etc.
    2.  **Título**: Nome do cliente ou título da tarefa (truncado se necessário).
    3.  **Responsável**: Apenas o primeiro nome ou avatar pequeno.
    4.  **Indicador Online/Presencial**: Um ícone discreto no canto direito.
- **Estilo**:
    - Remover informações de "Valor", "Horário detalhado" (já implícito na posição do calendário) e textos auxiliares.
    - Fonte legível, cores sólidas de fundo (já existentes) com texto branco contrastante.

## 2. Tooltip Rico (Hover)
Ao passar o mouse, um tooltip flutuante (já implementado, mas será aprimorado) exibirá **todos** os detalhes:

- **Cabeçalho**: Título completo.
- **Corpo**:
    - Horário exato (Início - Fim).
    - Nome completo do Responsável.
    - Valor monetário (R$).
    - Status Online/Presencial por extenso.
    - Descrição ou outros detalhes relevantes.

## Passos de Execução

### Passo 1: Simplificação do Componente `EventCard`
- Alterar o JSX para remover a estrutura de múltiplas linhas atual.
- Criar um container flexbox `row` que alinha: `[Ícone] [Título] [Responsável] [Ícone Online]`.
- Ajustar tamanhos de fonte para garantir que tudo caiba harmoniosamente.

### Passo 2: Aprimoramento do Tooltip
- Garantir que o tooltip atual contenha todos os dados que foram removidos da visualização principal.
- Ajustar o estilo do tooltip para ser mais elegante (fundo escuro, sombra suave, z-index alto).

### Passo 3: Ajustes de CSS
- Verificar se a altura dos eventos no `react-big-calendar` precisa ser ajustada para esse novo layout mais compacto.

## Resultado Esperado
Uma visualização mensal/semanal muito mais limpa, onde é possível bater o olho e ver "o que é" e "com quem", sem poluição visual. Detalhes financeiros e logísticos ficam a um movimento de mouse de distância.

# Plano de Ajuste de Campos da API CRM

O objetivo é corrigir o mapeamento dos campos de "Tipo de Atendimento" para utilizar as chaves exatas fornecidas, garantindo a correta identificação de eventos Online vs Presencial.

## Campos Identificados
| Tipo de Evento | Chave do Campo (`customFields`) | Valores Esperados |
| :--- | :--- | :--- |
| **Apresentação** | `tipo-de-atendimento--1` | "Presencial", "On-line" |
| **Consultoria** | `tipo-de-atendimento-` | "Presencial", "On-line" |

## Passos de Execução

### 1. Atualizar Lógica em `src/lib/date.ts`
- **Remover**: A busca genérica por chaves contendo "local" ou "tipo-de-atendimento".
- **Adicionar**: Verificação explícita das chaves:
    - Para Consultoria: `it.customFields['tipo-de-atendimento-']`
    - Para Apresentação: `it.customFields['tipo-de-atendimento--1']`

### 2. Normalização de Valores
- O sistema deve tratar variações como "On-line", "Online", "online", "on-line".
- A lógica será: `valor?.toLowerCase().replace('-', '').includes('online')`.

### 3. Validação
- Verificar se os ícones (Câmera/Pin) aparecem corretamente nos cards após a alteração.

## Ação Imediata (Pós-Aprovação)
Implementarei a correção direta no arquivo `src/lib/date.ts`.

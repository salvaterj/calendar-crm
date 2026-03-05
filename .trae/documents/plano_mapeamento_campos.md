# Plano de Mapeamento de Campos da API CRM

O objetivo é identificar com precisão quais campos (especialmente `customFields`) estão sendo retornados pelo endpoint da API, para garantir que o mapeamento de informações como "Online/Presencial" seja feito corretamente.

## Passos de Execução

### 1. Instrumentação para Diagnóstico
- Adicionar logs detalhados em `src/App.tsx` ou `src/api/crm.ts` logo após o recebimento dos dados.
- O foco será imprimir no console do navegador a estrutura bruta de `customFields` para alguns itens de exemplo (especialmente os que deveriam ter "Tipo de Atendimento").

### 2. Coleta e Análise de Dados
- Rodar a aplicação e inspecionar o Console do Desenvolvedor.
- Identificar as chaves exatas retornadas. Muitas vezes os campos customizados possuem IDs ou slugs diferentes do nome visível (ex: `custom-field-123` em vez de `Tipo de Atendimento`).

### 3. Documentação dos Campos
- Criar um arquivo `.trae/documents/mapeamento_campos.md` contendo uma tabela com:
    - **Nome do Campo (Visível)**
    - **Chave na API (`key`)**
    - **Tipo de Dado** (String, Array, Objeto)
    - **Exemplo de Valor**

### 4. Correção da Lógica de Negócio
- Com as chaves corretas em mãos, atualizar `src/lib/date.ts`.
- Substituir a busca genérica (que procura por strings como "local" ou "tipo-de-atendimento") pelas chaves exatas, garantindo confiabilidade.
- Verificar se há outros campos úteis que estamos ignorando.

## Ação Imediata (Pós-Aprovação)
Implementarei o passo 1 (logs) para que você possa me fornecer a estrutura dos dados, e então prosseguirei com a documentação e correção.

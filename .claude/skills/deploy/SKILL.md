---
name: deploy
description: Usar ao fazer deploy do projeto ou quando o usuário disser "subir", "publicar", "fazer deploy" ou "ir para produção".
---

# Deploy — Checklist Octanis

Antes de qualquer deploy, executar este checklist na ordem.

## 1. Verificação de Código
- [ ] Rodar `/security-check` primeiro
- [ ] Build local sem erros: `npm run build`
- [ ] Sem `console.log` de debug sensível no código
- [ ] Variáveis de ambiente de produção configuradas no painel de hospedagem

## 2. Git
- [ ] Todos os arquivos commitados (`git status` limpo)
- [ ] Branch correta para o ambiente (ex: `main` para produção)
- [ ] Pull request aprovado (se houver processo de review)

## 3. Variáveis de Ambiente
Confirmar com o usuário que estas estão configuradas em produção:
- As listadas no `.env.example` do projeto
- Perguntar se há diferença entre os valores de dev e produção

## 4. Deploy
Executar o comando de deploy do projeto (ver `CLAUDE.md` do projeto).
Padrão Vercel:
```bash
vercel --prod
```

## 5. Verificação Pós-Deploy
- [ ] Acessar a URL de produção e confirmar que carrega
- [ ] Testar o fluxo principal (formulário, integração, página principal)
- [ ] Verificar se as integrações estão funcionando (Helena, Meta, Google)
- [ ] Checar se não há erros no console do browser

## Após o deploy
Reportar ao usuário:
- URL de produção
- Commit/versão deployada
- Qualquer ponto de atenção identificado

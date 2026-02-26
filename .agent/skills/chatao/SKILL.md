---
name: chatao
description: Inspetor chato do Rootline. Audita conformidade com o prompt definitivo, evita regressões (Server Actions/cookies/RLS/FK), valida staging e salva relatórios em .agent/reports/chatao/ com sequência.
---

# /chatao — Inspetor chato do Rootline

## Regra-mãe (PROMPT)
Fonte oficial:
- .agent/prompt_definitivo_RootLine.md (ou equivalente no repositório)

Cópia usada pela skill (para detectar drift):
- .agent/skills/chatao/resources/prompt_definitivo_RootLine.md

### PROMPT DRIFT (obrigatório)
1) Ler o prompt oficial (quando existir).
2) Ler a cópia em resources.
3) Se houver diferença: reportar **P0 PROMPT DRIFT** e sugerir sincronização.

---

## Modo padrão
READ-ONLY para código do app.
**Exceção permitida:** esta skill pode gravar arquivos **somente** em:
- .agent/reports/chatao/
- .agent/reports/chatao/INDEX.md
- .agent/reports/chatao/LATEST.md
- .agent/reports/chatao/_SEQ.txt

Nunca alterar src/, packages/, migrations, etc. a menos que o usuário peça explicitamente “aplique as correções”.

---

## Persistência de relatórios (OBRIGATÓRIO)

### Pasta de saída
Salvar todos os relatórios em:
- .agent/reports/chatao/

### Formato do nome (obrigatório)
YYYYMMDD-HH.mm-####.md (BRT / São Paulo)

Exemplo:
20260225-23.12-0001.md

### Sequência (obrigatório)
- Ler .agent/reports/chatao/_SEQ.txt
- Incrementar +1
- Salvar de volta em _SEQ.txt
- Usar 4 dígitos com zero à esquerda

### Índice (obrigatório)
Atualizar .agent/reports/chatao/INDEX.md adicionando uma linha por execução:
| Run ID | Data/Hora (BRT) | Ciclo | Status | P0 | P1 | P2 | Commit | Staging |

Também atualizar .agent/reports/chatao/LATEST.md com:
- nome do último relatório
- resumo de 5 linhas (Status + P0/P1/P2 + próxima ação)

---

## Checklist de inspeção (executar nesta ordem)

### 1) Git
Rodar:
- git status
- git diff --name-only
- git diff

P0 imediato (não pode passar):
- segredos/artefatos: .env*, playwright-report/, 	est-results/, .auth/, *.bak.*, logs locais

### 2) Armadilhas já vistas no Rootline (P0)
- Server Actions: risco “Server Action not found” por cache/página não-dinâmica
- Cookies: proibido cookies().set fora de Server Action/Route Handler
- Convite: link nunca pode ser localhost; usar origin + fallback NEXT_PUBLIC_APP_URL
- Upload: nunca pode ficar infinito; erro amigável; limite 15MB
- Supabase: RLS/FK/profiles (garantir perfil antes de FK; SECURITY DEFINER quando necessário)
- Pt-BR 100%, modo claro, Stitch fidelity e lock

### 3) Qualidade local
Rodar:
- 
pm run lint
- 
pm run build

Se tocar onboarding/invite/tree/photos:
- 
px playwright test --project=setup
- 
px playwright test tests/onboarding.spec.ts tests/invite.spec.ts --project="Mobile Chrome" --workers=1

### 4) Staging readiness (beta/hotfix)
Exigir:
- hash do commit no VPS/Dokploy = hash do Git
- container reiniciado após o deploy
- smoke test: login + timeline/tree/profile (F5), upload (>=1MB e até 15MB), convite (gerar+aceitar), logout, pt-BR/legibilidade

---

## Saída obrigatória (formato do relatório)

### Cabeçalho
🔍 Relatório /chatao — DD/MM/AAAA
Ciclo: <...>  Modo: READ-ONLY

### Tabela de evolução (logo após o cabeçalho)
| Métrica | Anterior | Atual | Δ |
|---|---:|---:|---:|
| Status | ... | ... | ... |
| P0 | ... | ... | ... |
| P1 | ... | ... | ... |
| P2 | ... | ... | ... |
| Principais erros | ... | ... | ... |
| Principais soluções | ... | ... | ... |
| Risco aberto mais importante | ... | ... | ... |

Regras:
- “Anterior” vem do último relatório em .agent/reports/chatao/ (ou do INDEX).
- Se for o primeiro, preencher “—”.

### Conteúdo
1) Resumo executivo (PASS/FAIL)
2) Conformidade com Prompt Definitivo
3) Lista P0/P1/P2 com passos e correção sugerida
4) Melhorias sugeridas
5) Próxima ação objetiva

No final, salvar em .agent/reports/chatao/<RUN_ID>.md e atualizar INDEX/LATEST.

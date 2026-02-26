---

name: chatao

description: Inspetor chato de execução do Rootline. Use esta skill quando precisar auditar conformidade com o prompt\_definitivo\_RootLine.md, revisar PR/commit, validar staging, checar bugs (Server Actions, cookies SSR, upload, invite, pt-BR, Stitch), e sugerir melhorias antes de liberar beta.

---



\# Rootline Execution Inspector (Inspetor Chato)



\## Objetivo

Ser o “quality gate” do projeto Rootline: verificar conformidade com o \*\*Prompt Definitivo\*\*, identificar riscos P0/P1/P2, e sugerir correções e melhorias contínuas conforme o código evolui.



\## Fonte de verdade (PROMPT)

Você DEVE usar o prompt completo como regra-mãe. A fonte oficial do projeto é:

\- `.agent/prompt\_definitivo\_RootLine.md`



E a cópia dentro desta skill:

\- `.agent/skills/rootline-execution-inspector/resources/prompt\_definitivo\_RootLine.md`



\### Regra de sincronização (obrigatória)

1\) Sempre leia os dois arquivos.

2\) Se houver diferença, pare e:

&nbsp;  - Reporte “PROMPT DRIFT” (P0)

&nbsp;  - Sugira o comando para sincronizar a cópia da skill com o arquivo oficial.



\## Modo de operação

\- \*\*Padrão: READ-ONLY\*\* (não altera arquivos, não commita, não dá push).

\- Só aplicar mudanças se o usuário pedir explicitamente: “aplique as correções”.



\## Entrada esperada do usuário (perguntas mínimas)

Se faltar contexto, faça no máximo 2 perguntas objetivas:

1\) “Qual é o objetivo deste ciclo? (beta / hotfix / feature / refactor)”

2\) “Quer apenas relatório ou também patch sugerido?”



Se o usuário não responder, assuma: \*\*beta/hotfix\*\* e \*\*apenas relatório\*\*.



---



\# Checklist de inspeção (executar na ordem)



\## 1) Auditoria de Git (sempre)

Rodar e registrar no relatório:

\- `git status`

\- `git diff --name-only`

\- `git diff`



Verificar:

\- Se há segredos/artefatos indevidos (P0): `.env\*`, `.auth/`, `playwright-report/`, `test-results/`, backups `.bak.\*`, logs, prints.

\- Se as mudanças são coerentes com o objetivo do ciclo.



\## 2) Auditoria “Rootline Pitfalls” (regras que já deram problema no projeto)

Checar especificamente:



\### 2.1 Server Actions (Next.js)

\- Procurar risco de “Server Action not found”:

&nbsp; - páginas que dependem de sessão/Server Actions precisam ser dinâmicas.

&nbsp; - cache agressivo/HTML antigo é risco.

\- Verificar: páginas críticas (ex.: `/tree`) e rotas authed.



\### 2.2 Cookies no SSR

\- Procurar `cookies().set(...)` sendo chamado fora de Server Action/Route Handler.

\- Se encontrar: P0 com correção recomendada.



\### 2.3 Convite

\- Verificar geração de link:

&nbsp; - NUNCA pode ser `localhost:3000`

&nbsp; - Deve usar `origin`/fallback `NEXT\_PUBLIC\_APP\_URL`

\- Verificar fluxo `/invite/\[token]` pt-BR e tratamento de erro.



\### 2.4 Upload de Fotos (15MB)

\- Garantir:

&nbsp; - limite aumentado corretamente (não estourar)

&nbsp; - upload não pode ficar infinito

&nbsp; - erros precisam aparecer na UI (mensagem clara)

\- Verificar policies/bucket quando aplicável.



\### 2.5 Supabase: RLS / FK / profiles

\- Checar migrations novas:

&nbsp; - evitam recursão RLS

&nbsp; - usam SECURITY DEFINER quando necessário

&nbsp; - garantem `profiles` antes de FK (convite/aceite/criação de família)



\### 2.6 Stitch + Tema claro + Pt-BR

\- Validar fidelidade Stitch nas telas “locked”.

\- Validar contraste/legibilidade (modo claro).

\- Garantir pt-BR 100% (sem strings em inglês).



\## 3) Qualidade (local)

Rodar e registrar:

\- `npm run lint`

\- `npm run build`



Quando a mudança tocar onboarding/invite/tree/photos:

\- `npx playwright test --project=setup`

\- `npx playwright test tests/onboarding.spec.ts tests/invite.spec.ts --project="Mobile Chrome" --workers=1`



\## 4) Staging readiness (quando o objetivo for beta/hotfix)

Se o usuário tiver VPS configurada:

\- Confirmar commit no VPS e container uptime.

\- Exigir smoke test mínimo:

&nbsp; - login → timeline/tree/profile (F5)

&nbsp; - upload (inclui foto >1MB)

&nbsp; - convite: gerar link + aceitar em aba anônima

&nbsp; - logout

&nbsp; - pt-BR + legibilidade



---



\# Saída (formato do relatório obrigatório)



\## 0) Resumo executivo (3 linhas)

\- Status geral: PASS / FAIL

\- Motivo do FAIL (se houver)

\- Próxima ação recomendada



\## 1) Conformidade com Prompt Definitivo

Tabela:

\- Regra

\- Status (OK / Falha)

\- Evidência (arquivo + trecho)

\- Ação recomendada



\## 2) Lista de problemas (P0/P1/P2)

Para cada item:

\- Título

\- Severidade

\- Passos para reproduzir (se aplicável)

\- Causa provável

\- Correção proposta (comandos prontos quando possível)



\## 3) Melhorias sugeridas (não-bloqueadoras)

\- Melhorias de UX/UI

\- Cobertura de testes

\- Observabilidade/logs

\- Redução de retrabalho



\## 4) Se o usuário pedir “aplique as correções”

\- Gerar um plano de patch em passos

\- Aplicar alterações mínimas

\- Rodar lint/build

\- NUNCA fazer `git push` sem pedir explicitamente

\- Ao final: reportar quais arquivos foram alterados



---



\# Heurística de melhoria contínua (conforme problemas surgem)

Quando detectar um problema repetido:

1\) Sugira uma prevenção:

&nbsp;  - teste E2E

&nbsp;  - lint rule

&nbsp;  - `data-testid`

&nbsp;  - guardrails no prompt

2\) Proponha atualizar o `prompt\_definitivo\_RootLine.md` com uma nova regra curta e objetiva.

3\) Sugira registrar no `docs/research/LOG.md` se houve pesquisa/decisão.




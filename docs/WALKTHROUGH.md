# RootLine - Walkthrough de Uso

## Visão Geral da Estrutura
O repositório **RootLine** adota uma estrutura otimizada e organizada baseada no modelo consolidado Antigravity:

- `.agent/`: Diretório de workflows e inteligência operacional. Contém o exigente protocolo de falhas `bug360.md` e a base de conhecimento de erros em `.agent/knowledge/error_logs/`.
- `apps/`: Espaço principal para os serviços e aplicações consumíveis.
- `docs/`: Central de documentação, com controle restrito de arquitetura em `docs/adr/`.
- `packages/`: Bibliotecas internas (shared logic, UI, utilitários) que podem ser reutilizadas pelas aplicações.

## Passo a Passo para Iniciar
1. **Ambiente Local**: Copie o arquivo `.env.example` renomeando-o para `.env`. Substitua as chaves mockadas com os valores do seu ambiente local ou homologação. **(Jamais comite o `.env`).**
2. **Desenvolvimento de Aplicações e Módulos**:
   - Utilize a pasta `apps/` para criar seu serviço principal (ex. API, Frontend).
   - Abstraia código reaproveitável movendo-o para a pasta `packages/`.
3. **Decisões Complexas**: Em caso de mudanças ou definições de tecnologias fundamentais no projeto, registre e adicione seu Rational no índice de ADRs (`docs/adr/ADR-INDEX.md`).

## Testando o Fluxo de Onboarding (Task 2.1) e Convites (Task 2.2)
Para validar a Fase 2 localmente:
1. Execute as migrations no Supabase Studio (SQL Editor) na ordem correta:
   - `packages/db/migrations/0000_initial_schema.sql`
   - `packages/db/migrations/0001_invites_and_relationships.sql`
   - `packages/db/migrations/0002_invite_logic.sql`
   - `packages/db/migrations/0003_rpc_hardening.sql`
2. Suba a aplicação Next.js: `cd apps/web && npm run dev`.
3. Acesse `http://localhost:3000/login` e crie uma conta. Você será levado ao `/onboarding`.
4. Insira um nome para a família e você será redirecionado para o `/timeline`.
5. No **Timeline Archive**, use a barra lateral `Invite Family Member`.
6. Insira um e-mail e clique em **Send Invitation**. Um box verde com o link `http://localhost:3000/invite/<token>` aparecerá.
   - No banco Supabase Studio, consulte a tabela `invites`: apenas o `token_hash` (SHA-256) é persistido, nunca o token em plain text.
   - Rate limit: mais de 10 convites/24h retorna erro.
   - Duplicado pendente (mesmo e-mail/família): retorna erro via unique index parcial.

## Testando o Ingresso via Link (Task 2.3)
1. Copie o link gerado na caixa verde: `http://localhost:3000/invite/<token>`.
2. Abra uma **nova sessão/aba anônima** no browser e acesse o link.
3. Faça login com um segundo usuário ou crie uma nova conta.
4. Você será redirecionado para a página de aceite com o botão **Join Family**.
5. Clique em Join Family. O sistema:
   - Calcula o `SHA-256` do token da URL.
   - Chama a RPC `accept_invite_by_token` que executa atomicamente: verifica `status=pending`, `expires_at > now()`, `used_at IS NULL`; insere o registro em `members`; e atualiza o invite para `status=accepted + used_at=now()`.
6. Você será redirecionado para o `/timeline` como membro da família.
7. Validação Anti-replay: acesse o mesmo link outra vez — deve retornar erro "Invalid, expired, or already used invite".

## Testando a Árvore Visual (Task 2.4)
1. Com família criada (Admin = Usuário A) e pelo menos um membro (Usuário B) que aceitou o convite via `/invite/<token>`:
2. Acesse `/timeline` como Admin (A) e clique no botão **🌳 View Tree** no canto superior direito.
3. A rota `/tree` aparece com um grafo ReactFlow mostrando **todos os members** da família como nós.
4. **Clique em qualquer nó** para abrir o painel lateral com nome, role e data de entrada.
5. Para adicionar relacionamentos: insira um registro manualmente em `relationships` no Supabase Studio (`member_a_id`, `member_b_id`, `type = 'parent_child'` ou `'spouse'`). Recarregue `/tree`.
6. Arestas roxas = parent_child. Arestas rosas animadas = spouse.
7. **Cap Test**: Se a família tiver mais de 25 membros, um aviso laranja é exibido e apenas os primeiros 25 aparecem.
8. Estados de erro (falha de query) mostram um painel vermelho descritivo.

## Testando Upload de Fotos — Task 3.1

> **Pré-requisito:** executar migration `packages/db/migrations/0004_photos_schema.sql` no Supabase Studio.
> Criar o bucket `family-photos` em Storage → New Bucket → **Private** (RLS gerencia acesso).

1. Acesse `/timeline` e clique em **📷 Photos**.
2. No painel lateral, arraste ou selecione um arquivo JPEG/PNG/WebP/HEIC (max 10 MB).
3. Opcionalmente preencha a data da foto e clique **Upload Photo**.
4. O arquivo é enviado ao bucket Supabase `family-photos/{family_id}/{uuid}.ext` e um record é gravado em `photos`.
5. A galeria abaixo atualiza com thumbnails via **signed URL de 1h**.
6. Teste de validação:
   - Arquivo > 10MB → erro no front.
   - Tipo não suportado (ex: `.gif`) → erro no front.
   - Viewer tentando upload → ação retorna erro de permissão (verificar via console).

## Testando Full-Res + Lightbox — Task 3.2
1. Na galeria `/photos`, clique em qualquer thumbnail.
2. O **Lightbox** abre imediatamente com o thumbnail em baixa resolução + spinner.
3. A Server Action `getPhotoViewUrl(id, 'full')` é chamada do cliente e retorna uma **signed URL de 5 minutos**.
4. Quando a imagem full-res carrega, ela substitui suavemente o thumbnail (transição de opacidade).
5. **Navegação**: seta ← → ou teclado `ArrowLeft/ArrowRight`; `Escape` fecha.
6. **Teste de Erro — URL expirada:**
   - Acesse o Supabase Studio → Storage → `family-photos`, copie o signed URL de um objeto.
   - Configure o TTL para 1 segundo via código temporário e recarregue – a lightbox deve exibir a mensagem `Full resolution could not be loaded.` com instruçõe de refresh.
7. **Teste de foto removida:**
   - Marque `is_deleted = true` no Supabase Studio para um registro em `photos`.
   - Clique no thumbnail na galeria (o thumb ainda aparece via cache de 1h).
   - A server action retorna: `"This photo has been removed"` e a lightbox mostra o erro adequadamente.
8. **Paths padronizados:** novos uploads usam `families/<family_id>/full/<uuid>.<ext>` no bucket.

## Testando Conexão Google Photos — Task 3.4

> **Pré-requisito:** Obter credenciais OAuth no GCP Console (APIs & Services → Credentials → OAuth 2.0 Client).
> Adicionar `http://localhost:3000/api/google/callback` como Authorized redirect URI.
> Preencher `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI` no `.env.local`.
> Executar migration `packages/db/migrations/0005_google_tokens.sql` no Supabase Studio.

1. Com o app rodando, acesse `/photos` — o painel lateral exibe **Google Photos**.
2. Clique em **🔗 Connect Google Photos**. O browser redireciona ao OAuth Google.
3. Faça login e aprove as permissões. O callback troca o `code` por `access_token + refresh_token` e armazena **apenas no banco** (tabela `google_photo_tokens`, RLS = somente o próprio usuário pode ler).
4. Você é redirecionado a `/photos?google_connected=1` com banner de sucesso.
5. Clique em **⬇️ Import from Google Photos**. A Server Action:
   - Verifica expiração do token (refresh automático se necessário).
   - Busca até 200 itens da Google Photos Library API.
   - Persiste `google_photos_id`, `thumbnail_path` (`baseUrl=w400-h300-c`) e metadados no banco.
   - **Não baixa full-res** — o `storage_path` guarda somente a `baseUrl` da API.
6. Os thumbnails aparecem na galeria instantaneamente.
7. **Idempotência:** clicar em Import novamente retorna `0 imported, N skipped` sem duplicar.
8. **Lightbox:** clicando numa foto Google, o `getPhotoViewUrl` retorna `baseUrl=d` (download do original direto do servidor do Google), sem custo de storage.
9. **Teste token expirado:** apague o row em `google_photo_tokens` no Studio → Import mostra "Google Photos not connected".

## Testando Múltiplas Famílias e Active Family — Task 3.5

> **Pré-requisito:** executar migration `packages/db/migrations/0006_multi_family.sql` no Supabase Studio.

1. **Onboarding Secundário**: Login com um usuário já pertencente a uma família. Acesse `/onboarding` manualmente. Crie uma **segunda família**.
2. **Deterministic Selection**: Ao criar a segunda família, a RPC `set_active_family` é chamada e você é redirecionado para o `/timeline` já no contexto da nova família.
3. **Seletor de Família**: No cabeçalho de `/timeline`, `/photos` ou `/tree`, agora aparece o componente **FamilySwitcher**.
   - O seletor exibe o nome de todas as famílias que você pertence + seu papel (`admin` ou `contributor`).
4. **Troca de Contexto**:
   - Selecione a primeira família no dropdown.
   - O app chama `POST /api/family/switch`, atualiza `profiles.active_family_id` via RPC (com validação de membership) e faz um `router.refresh()`.
   - A página recarrega e agora exibe apenas os dados (fotos, árvore, membros) da primeira família.
5. **Persistência**: Faça logout e login novamente. O sistema deve carregar automaticamente a última família marcada como ativa.
6. **Auto-healing**: Se você for removido de uma família que estava marcada como ativa, o utilitário `getActiveFamily` detectará a invalidez, selecionará a família mais antiga disponível e atualizará o banco silenciosamente.

## Testando Segurança e Lockdown — Task 3.7

> **Pré-requisito:** executar migration `packages/db/migrations/0007_profiles_active_family_lockdown.sql`.

1. **Tentativa de Bypass via Client**:
   - Com o app aberto, abra o console do desenvolvedor (F12).
   - Tente atualizar sua própria família ativa diretamente via objeto `supabase`:
     ```javascript
     const { error } = await supabase.from('profiles').update({ active_family_id: 'algum-uuid-aleatorio' }).eq('id', 'seu-id-de-auth')
     console.log(error)
     ```
   - **Resultado Esperado**: O erro deve indicar falta de permissão (`permission denied for table profiles`) ou o campo deve ser ignorado silenciosamente, impedindo a alteração direta.
2. **Troca via Via Oficial**:
   - Mude de família usando o dropdown no header ou a tela `/families`.
   - **Resultado Esperado**: A troca deve funcionar normalmente, pois estas vias utilizam o RPC `set_active_family` (definido como `SECURITY DEFINER`).

## Testando o Memory Feed — Task 4.1

O Timeline agora exibe as fotos da família em um feed cronológico reverso.

### 1. Visualização e Ordenação
1. Acesse `/timeline`.
2. Verifique se as fotos aparecem em um grid.
3. As fotos devem estar ordenadas pela data em que foram tiradas (`taken_at`). Se não houver data, a data de upload (`created_at`) é usada como fallback.

### 2. Paginação por Cursor
1. Garante que a família tem mais de 24 fotos (faça uploads ou importe do Google Photos).
2. Tente rolar até o final da lista inicial.
3. Clique em **"Load More Memories"**.
4. Verifique se as próximas fotos carregam suavemente sem duplicatas.

### 3. Estados de Erro e Vazio
1. **Estado Vazio:** Crie uma família nova ou use uma sem fotos. Acesse `/timeline`. Deve aparecer a mensagem "No memories yet" com um link para o upload.
2. **Loading:** Observe o spinner no botão "Load More" enquanto as fotos carregam.

---

## Testando o Synchronizer Background — Task 3.3

> **Pré-requisito:** executar migration `packages/db/migrations/0008_google_sync_tracking.sql`.

Esta task implementa um sistema robusto de importação incremental que pode rodar em background (Cron) ou manualmente.

### 1. Teste de Worker (CLI)
1. Certifique-se de que as variáveis `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` e `SUPABASE_SERVICE_ROLE_KEY` estão no seu `.env`.
2. Conecte pelo menos uma conta Google via UI (`/photos`).
3. No terminal, execute o worker manualmente:
   ```bash
   npx tsx src/scripts/google-sync.ts
   ```
4. **Validação**:
   - O console deve listar os perfis conectados encontrados.
   - Verifique a tabela `google_sync_runs` no Supabase Studio: deve haver um registro com `status = 'success'` e contagem de itens importados.
   - Verifique a tabela `google_sync_cursors`: o campo `next_page_token` deve estar preenchido se houver mais fotos a importar.

### 2. Teste de UI (Manual)
1. Acesse `/photos`.
2. O painel **Google Photos** agora exibe uma seção **Sync Status**.
3. Clique em **⬇️ Run Sync Now**.
4. Observe a mudança de status para `Importing...` e o banner de sucesso ao final.
5. Recarregue a página e verifique se o **Last Run** mostra a data e hora corretas do último sucesso.

### 3. Configuração no Dokploy (Cron)
Para manter as bibliotecas de fotos das famílias sempre atualizadas, configure um Job no Dokploy:
1. Vá em **Services** → Seu App RootLine.
2. Acesse a aba **Cron Jobs**.
3. Adicione um novo Job:
   - **Command**: `npx tsx src/scripts/google-sync.ts`
   - **Schedule**: `0 */6 * * *` (A cada 6 horas, ou conforme preferência).
   - **User**: `root` (ou o usuário padrão do container).
4. Salve e verifique os logs do container após a primeira execução programada.

---

## Testando Gerenciamento de Famílias — Task 3.6

1. **Acesso**: Navegue para `/families`.
2. **Listagem**: Verifique se todas as suas famílias aparecem com seus respectivos nomes, papéis (`admin`/`contributor`) e contagem correta de membros.
3. **Mini-preview**: Verifique se cada card de família exibe uma lista curta dos primeiros membros (hierarchy preview).
4. **Troca de Contexto via Ação**:
   - Clique em **"Entrar"** em uma família diferente da atual. Você deve ser redirecionado para o `/timeline` daquela família.
   - Clique em **"Ver Árvore"** em outra família. Você deve ser redirecionado diretamente para o `/tree` daquela família, com o contexto já atualizado.
5. **Estado Ativo**: A família que é o contexto atual deve exibir um badge **"Ativa"** e o botão "Entrar" deve estar desabilitado para ela.

## Checklist de Mobile & Performance — Task 4.3

Para garantir que a experiência seja fluida em dispositivos móveis:

### 1. Estabilidade de Scroll
1. Abra o `/timeline` no celular (ou simulador do Chrome com "Throttling: Low-end mobile").
2. Faça scroll rápido.
3. **Validação**: O scroll deve ser contínuo. Novos itens devem carregar antes de você chegar ao fim (400px de margem). Não deve haver "pulos" de layout (layout shifts) quando novos itens são inseridos.

### 2. Lightbox Touch
1. Abra uma foto.
2. Tente navegar usando swipe (se implementado) ou os botões de seta grandes.
3. Verifique se o botão "Reload Photo" aparece e funciona caso a rede oscile.

### 3. Observabilidade (Logs no Dokploy)
Se encontrar comportamentos estranhos ou erros com `error_id` na tela:
1. Acesse o painel do **Dokploy**.
2. Vá em **Services** → **RootLine App** → **Logs**.
3. Procure por tags de erro estruturadas:
   - `[ERROR][MemoryFeed][id-...]`: Falhas no carregamento do feed.
   - `[ERROR][Lightbox][id-...]`: Falhas ao obter URL ou carregar imagem full-res.
   - `[ERROR][GoogleSync][id-...]`: Falhas no worker de sincronização.
4. **Dica**: Use o filtro de busca do Dokploy para localizar o `error_id` específico reportado pelo usuário.

---

## Resolução de Problemas de Deploy — Task 5.1

### Caso: Página Padrão do Next.js aparecendo em vez do App
**Sintoma**: Após o deploy no Dokploy, o navegador exibe a página "To get started, edit page.tsx" e os logs de build mostram apenas a rota `/404`.
**Causa**: Presença de uma pasta `app/` vazia na raiz do projeto `apps/web`. No Next.js, se existir uma pasta `app` fora do `src`, ela tem precedência e faz com que o App Router ignore completamente a pasta `src/app`.
**Solução**: Remover a pasta `apps/web/app` física.
**Validação**: Execute `npm run build` e verifique se o log "Route (app)" lista todas as páginas (`/login`, `/timeline`, etc.).

---

## Otimizações de Banco de Dados — Task 5.3

Foram aplicadas melhorias proativas de segurança e performance no projeto RootLine Staging:

- **Performance (Indexes)**: Criados 7 novos índices em chaves estrangeiras (`families`, `photos`, `members`, `invites`, `relationships`, `google_sync_cursors`) para acelerar buscas e joins.
- **Performance (RLS)**: Refatoradas 21 políticas de acesso para usar `(SELECT auth.uid())`. Isso permite que o Postgres faça o cache do ID do usuário, evitando milhares de chamadas repetidas à função de autenticação em consultas grandes.
- **Segurança (Hardening)**: Definido `search_path = public` em funções críticas para mitigar vulnerabilidades de escalação de privilégios.

---

## Validação Final de Deployment — Tasks 5.4 & 5.5

Deployment em produção finalizado com sucesso no Dokploy:

- **Domínio**: [https://staging-rootline.johnatamoreira.com.br/](https://staging-rootline.johnatamoreira.com.br/)
- **Build Hardening**: Aplicado `Clean Cache` e adicionado `RUN rm -rf app` no `Dockerfile` para garantir ambiente limpo.
- **Roteamento**: Log do build verificado com sucesso (todas as rotas `Route (app)` listadas).
- **UX**: Raiz do site (`/`) redireciona automaticamente para `/login`.

![Login em Produção](file:///C:/Users/johna/.gemini/antigravity/brain/a0af357a-d85d-4e50-8b58-7ba2122d597e/rootline_login_page_1771887601816.png)
*Tela de login carregada com sucesso via HTTPS no servidorstaging.*

---

## Fluxo de Login por Senha — Task 6

Refatoração completa do sistema de autenticação para priorizar segurança e UX:

- **Auth Mode**: Alterado de OTP/Magic Link para **Email + Password** (`signInWithPassword`).
- **Navegação**: Corrigido loop de redirecionamento. O sucesso no login agora leva para `/timeline` (que redireciona para `/onboarding` se necessário).
- **Acessibilidade**: Campos de login agora possuem `autoComplete` e `id` corretos para integração com gerenciadores de senha.
- **Feedback**: Mensagens de erro personalizadas (ex: "Invalid email or password") em vez de mensagens genéricas.

### Evidência de Teste (Live Staging)
- **Account**: `antigravity@teste.com`
- **Fluxo**: Login realizado com sucesso -> Redirecionamento para `/onboarding`.
- **Resolução de Erro**: Corrigido erro de serialização ("Functions cannot be passed directly to Client Components") adicionando `'use server'` em `onboarding/actions.ts` e tratando `searchParams` como assíncronos (exigência do Next.js 16).

---

## Correção de Erro de Onboarding (Recursão RLS) — Task 7

Durante a criação da primeira família no `/onboarding`, ocorria o erro `Failed to create family`. O log do banco no Staging reportava `infinite recursion detected in policy for relation "members"`.

**Causa:**
Políticas de RLS nas tabelas `members` e `families` faziam consultas cruzadas e autoreferenciadas na própria tabela `members`. Ao inserir um novo membro (o criador da família), a validação da política de `INSERT` disparava a política de `SELECT`, criando um loop infinito no Postgres.

**Resolução (Migration 0009):**
Refatoramos o RLS do projeto adotando a arquitetura recomendada do Supabase via **SECURITY DEFINER Functions**:
- Criadas funções em `sql` (ex: `get_user_family_ids()`) que rodam com privilégios de sistema, bypassando o RLS internamente para extrair a lista de IDs de família do usuário logado.
- Todas as políticas em `families`, `members`, `invites` e `relationships` foram reescritas para utilizar `family_id IN (SELECT get_user_family_ids())`, eliminando a recursão e oferecendo alta performance.

---

## Task 9.6 — Playwright E2E Test Validation

**Objetivo:** Garantir que os testes E2E Playwright para os fluxos de Onboarding e Convite sejam estáveis e passem de forma confiável.

**Problemas Identificados e Resolvidos:**

1. **Função RPC `create_family_and_join` ausente no banco:** A action de criação de família chamava `supabase.rpc('create_family_and_join', ...)` mas a função nunca foi criada no Supabase. Migration `create_family_and_join_rpc` criada com `SECURITY DEFINER`.

2. **Violação de FK `families_created_by_fkey`:** A tabela `families.created_by` referencia `public.profiles`. O usuário de teste é criado via `auth.signUp` mas sem trigger para criar o perfil. A RPC foi atualizada (migration `fix_create_family_and_join_upsert_profile`) para fazer `INSERT ... ON CONFLICT DO NOTHING` em `profiles` antes de criar a família.

3. **`auth.setup.ts` travado em `/timeline`:** O usuário de teste não existia ainda, fazendo a UI retornar "Invalid email or password". Refatorado para: (a) tentar `signInWithPassword` via SDK do Supabase; (b) fazer `signUp` automaticamente se a conta não existir; (c) usar `Promise.all([waitForNavigation, click])` para captura atômica do redirecionamento.

4. **`invite.spec.ts` executando verificação de URL prematuramente:** O `page.url()` logo após `goto('/timeline')` ainda retornava `/timeline` antes do redirect server-side completar. Corrigido com `await page.waitForURL(/.*(\\/timeline|\\/onboarding|\\/families|\\/login)/)` antes da verificação e clique na família.

**Resultado Final (Antes da Task 10):**
| Teste | Status |
|---|---|
| `auth.setup.ts › authenticate` | ✅ Passou (2.1s) |
| `onboarding.spec.ts › Onboarding Flow` | ✅ Passou (3.8s) |
| `invite.spec.ts › Invite Member Flow` | ⏭️ Skipped (UI do modal `/tree` ainda não implementada) |

---

## Task 10 — Implementar Modal de Invite no /tree + Destravar E2E

**Objetivo:** Implementar a interface de envio de convites visível na página `/tree` e ajustar o teste E2E para rodar de modo ininterrupto 100% verde (sem skipes).

**O que foi feito:**
1. **Frontend:** Criado o componente `<InviteModal />` seguindo o design de bottom-sheet com animação "slide-in-from-bottom", com loading states, sucesso (mostrar link e copiar) e erro perfeitamente integrados com as sever actions (`sendInvite`) re-exportadas para `/tree`.
2. **z-index Bug:** O componente `<BottomNav />` posicionado sobre o botão causava falha no Playwright na recepção do click (interceptado por outra div `z-50`). O `InviteModal` teve o overlay ajustado para `z-[100]`.
3. **E2E — Auth Compartilhado (Isolamento de Estado):** O Next.js bloqueia nativamente `/onboarding` se o usuário já possuir famílias (que são persistidas devido ao `storageState`). Refatoramos `onboarding.spec.ts` para dispensar a auth compartilhada e garantir login com e-mail 100% fresco, permitindo rodagem livre e contínua do suite de testes em watch ou CI/CD local sem falsos positivos.
4. **Resolução de RLS em Convites:** A action de aceitação, `acceptInvite()`, não precisava buscar o convite original já que o Test User que aceita (por não ser membro) não tem permissão RLS na tabela `invites`. Substituímos o bloqueio por RLS delegando a consulta 100% em backend para a função RPC nativa e segura (`accept_invite_by_token`) - evitando a colisão do E2E com as Policies.

**Resultado E2E Consolidado (setup, onboarding, invite):**
| Módulo | Output Playwright |
|---|---|
| Autenticação (Setup) | ✅ `auth.setup.ts › authenticate (1.6s)` |
| Onboarding E2E | ✅ `onboarding.spec.ts › creates family and redirects (4.5s)` |
| Invite E2E | ✅ `invite.spec.ts › generates invite link and allows accept (11.7s)` |
**Total Passing:** 3 passed (17.8s), Exit code: 0

## Protocolo de Erros (Obrigatório)
Se você ou a automação se deparar com erros persistentes durante o build ou desenvolvimento (Runtime, Deploy, etc.):
1. Abra e leia atentamente o documento `.agent/workflows/bug360.md`.
2. Siga as Fases designadas (Coleta, Busca de Elite e Execução).
3. Uma vez resolvido o problema principal, é **obrigatório** documentar a solução final na pasta de armazenamento: `.agent/knowledge/error_logs/`.

> [!NOTE]
> O projeto garante independência total das ferramentas externas legadas e foi estruturado garantindo isolamento moderno.

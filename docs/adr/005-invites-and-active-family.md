# ADR 005: Tratamento de Família Ativa, Convites e Árvore Mínima

**Data:** 2026-02-23
**Status:** Aceito
**Contexto:** Ao iniciar o fluxo P0-A para onboarding e agrupamento familiar, é necessário definir limites técnicos para como a sessão lida com múltiplos acessos de família, como convites são transacionados de forma segura e qual é a menor composição de uma Árvore Mínima.

## 1. Tratamento de "Família Ativa"

### Decisão
A aplicação utiliza o conceito de **Família Ativa** persistida para gerenciar múltiplos tenants.
- **Fonte de Verdade**: A coluna `profiles.active_family_id` armazena a família selecionada pelo usuário.
- **Resolução Oficial**: O utilitário `getActiveFamily(supabase)` é o único ponto de entrada para ler o contexto. Ele trata fallbacks (família mais antiga se nulo/inválido) e atualiza o banco deterministicamente.
- **Segurança**: A coluna `active_family_id` é travada para UPDATES diretos via RLS/DB Permissions, sendo editável apenas via RPC `set_active_family` (que valida membership).

### Consequência
Ganhamos uma sessão resiliente que persiste entre logins e dispositivos. O custo de implementação é centralizado num único utilitário (`getActiveFamily`), reduzindo a complexidade de filtragem em páginas e actions.

## 2. Caminho Técnico dos Convites (PostgREST Context)

### Decisão
A geração de convites usará uma Tabela Transitória vinculada a Tokens. 

**Fluxo Técnico:**
1. A API Frontend restrita executa um insert na tabela `invites(id, family_id, invited_email, role, token_hash, status)`.
2. Um webhook interno do Supabase (Database Webhook -> Edge Function) ou Worker Dokploy monitora submissões na tabela `invites` com `status = 'pending'`.
3. O Worker faz wrap na requisição e dispara o E-mail usando a API do **Resend**, injetando o `token_hash` na URL para o domínio.
4. Quando o convidado clica no link, ele assina sua conta (se não tiver) e em `/api/accept-invite?token=X`, a transação resgata o Email + Hash, aponta para `invites`, move o status para `accepted` e cria o Row em `members`.

### Consequência
Zero e-mails são enviados sincronamente pelo browser do cliente via RPCs, mantendo os segredos de API da Resend isolados num backend headless e resiliente. O Frontend não precisa de lógica complexa além do INSERT.

## 3. Modelo Mínimo da Árvore (Relationships)

### Decisão
O banco receberá a tabela minimalista `relationships` para ligar as Memberships formadoras da árvore:
- `id` (uuid)
- `family_id` (uuid, para RLS isolation)
- `member_a_id` (uuid, reference members)
- `member_b_id` (uuid, reference members)
- `type` enum (`parent_child`, `spouse`)

Um filho é definido por um registro `parent_child` apontando do Pai A para o Filho B (direcional). Cônjuges utilizam `spouse` (bidirecional lógica). Não lidaremos com laços customizados ("tio-avô", "primo") de forma explícita — eles são inferidos matematicamente pela travessia da árvore.

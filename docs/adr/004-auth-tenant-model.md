# ADR 004: Modelo de Auth, Perfis (Roles) e Tenants (Multitenancy Familiar)

**Data:** 2026-02-23
**Status:** Aceito
**Contexto:** Uma arquitetura que mapeia um "Usuário" pertencendo e podendo visualizar e gerir o seu "Círculo/Família". Precisamos definir como o PostgreSQL e Auth modelarão esse isolamento.

## Decisão

Usaremos **Supabase Auth + PostgREST Row-Level Security (RLS)** através do padrão **Tenant = Família**.

### O Modelo Lógico P0-A:
- **`profiles` (Usuários)**: Tabela contendo UUID (mapeado para `auth.users`), Nome, e-mail. Um usuário representa uma pessoa real logada no RootLine.
- **`families` (Tenants)**: Entidades raiz como "Família Oliveira".
- **`members` (Link + Papel)**: Tabela pivô de relacionamento contendo `family_id`, `profile_id` (Nulável se a pessoa foi adicionada mas nunca se registrou), e `role`.
- **`photos`**: Sempre amarrado a um `family_id`.

### Roles Enxutas do MVP:
- **Admin (Coordinator):** Cria a família. Pode convidar/expulsar membros de qualquer role, aprovar fotos, excluir mídias e deletar a família. Modifica as descrições mestras.
- **Contributor:** A maior parte dos parentes adicionados ativamente. Podem fazer Upload de mídias para a família, comentar e agrupar.
- **Viewer:** Parentes idosos ou pessoas distantes, podem visualizar a linha do tempo completa atrelada a sua árvore e receber notificações, mas têm features restritivas para submissão.

## Consequência

- Todo select da API deve estar atrelado à validação da sessão do usuário verificando a tabela `members`, garantindo que um Contributor não enxergue IDs de uma Família que não a sua. O RLS do banco de dados será a rede de segurança final.
- Um usuário logado poderá alternar entre Múltiplas Famílias no futuro caso ele pertença à família da esposa e à sua própria.

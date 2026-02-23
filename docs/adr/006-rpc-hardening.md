# ADR 006: Hardening do RPC accept_invite_by_token

**Data:** 2026-02-23
**Status:** Aceito
**Contexto:** A função Postgres `accept_invite_by_token` usa `SECURITY DEFINER`, o que eleva os privilégios de execução ao owner da função. Isso exige proteção adicional contra vetores de ataque clássicos de funções SECURITY DEFINER.

## Decisões Aplicadas (Migration 0003)

### 1. Fixar search_path
**Problema:** Funções `SECURITY DEFINER` sem `search_path` fixo são suscetíveis a ataques de *search path injection* — um atacante pode criar um schema com funções homônimas que seriam executadas no lugar das corretas.

**Solução:**
```sql
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;
```

`pg_temp` é incluído no final para evitar que funções temporárias (criadas na sessão corrente) de outros usuários possam ser injetadas antes de `public`.

### 2. Validar invited_email contra o JWT

**Problema:** Sem essa validação, se Usuário A encaminhar o link de convite ao Usuário B, Usuário B poderia aceitar o convite e entrar na família — mesmo que o convite tenha sido enviado ao e-mail de A. Esse é o **token-forwarding attack**.

**Investigação de Viabilidade:**
O Supabase expõe o JWT do usuário autenticado dentro das funções Postgres via `auth.jwt()`. O e-mail está disponível: `(auth.jwt() ->> 'email')`.

**Solução Implementada:**
```sql
v_user_email := (auth.jwt() ->> 'email');
-- ...
IF lower(v_user_email) != lower(v_invite.invited_email) THEN
    RAISE EXCEPTION 'This invitation was sent to a different email address.';
END IF;
```

**Implicação UX:** O usuário B que recebe um link encaminhado por A verá um erro claro, pedindo que entre com a conta correta. Essa proteção é intencional e necessária.

> [!NOTE]
> Caso o Supabase revogue o acesso ao `auth.jwt()` em versões futuras, a alternativa segura é passar o email como parâmetro verificado pelo backend via Edge Function antes de chamar o RPC.

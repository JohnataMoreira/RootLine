# Roteiro de Teste Beta (RootLine)
**Aviso Importante:** Este é o ambiente de testes (Staging). Os dados aqui inseridos podem ser apagados futuramente.

## Link de Acesso
https://staging-rootline.johnatamoreira.com.br/login

## 📝 Passo a Passo do Tester
Por favor, siga este roteiro simples para testar o fluxo principal do aplicativo:

1. **Acessar o App:** Abra o link `/login`.
2. **Autenticação:** Crie uma nova conta ou faça login se já possuir uma.
3. **Onboarding:** Crie a sua família (digite o nome e confirme).
4. **Convidar:** Vá no menu **Tree/Árvore**, clique no botão de **Convidar Familiares**, gere um link e copie.
5. **Aceitar Convite:** Abra o link copiado em **outro navegador** (ou aba anônima) / outro celular, e aceite o convite.
6. **Verificação:** Volte ao seu usuário original e confirme se o novo membro aparece na sua família.
7. **Navegação Geral:** Navegue entre as abas *Timeline*, *Tree* (Árvore) e *Profile* (Perfil).
8. **Visual:** Tente trocar o tema (Claro/Escuro) no seu perfil e veja se a legibilidade está boa.

## 🚫 O que NÃO testar ainda
Para mantermos o foco, por favor, **ignore** as seguintes funcionalidades (elas ainda estão em construção e gerarão erros esperados):
- Busca
- Mensagens de voz
- Reconhecimento de rostos
- Loja / Planos de Pagamento

## 🐞 Modelo de Bug Report
Se algo der errado, anote o problema de forma curta.
**Exemplo:**
- **Página:** Timeline
- **Ação:** Tentei curtir uma foto
- **Esperado:** O coração ficar vermelho
- **Aconteceu:** A tela ficou em branco
- **Print:** (Anexar a imagem no formulário)

---

## ✅ Checklist Pré-Beta (Admin)

- [x] Confirmar deploy no commit atual (`dcf7978` ou mais recente) no Staging.
- [x] Confirmar aplicabilidade das migrations essenciais no banco:
  - `0009_fix_rls_recursion.sql`
  - `0010_rpc_create_family_and_join.sql`
- [x] Confirmar existência da RPC `accept_invite_by_token`
- [x] Confirmar fluxo manual sem erros 500.
- [x] Verificar logs do Supabase (sem erros críticos de RLS ou falha de conexão).

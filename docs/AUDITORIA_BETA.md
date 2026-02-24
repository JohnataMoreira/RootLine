# Auditoria Staging - Rootline Beta Test 🕵🏻‍♂️

## Resumo Executivo
A auditoria via *Code Review* estático das páginas principais revela que o fluxo primário (Login -> Onboarding -> Timeline -> Tree) está sólido em sua lógica de backend e redirecionamento, mas a casca (UI/UX) sofre severamente com a ausência de estados de "Carregamento" (Loading) em formulários cruciais e possui uma quantidade alarmante de "Funcionalidades Mudas" (botões bonitos que não fazem nada). Para o Beta (15 pessoas), a prioridade absoluta deve ser ocultar todas as rotas e botões não funcionais para evitar frustração e desviar o foco do teste central (Árvore e Fotos).

---

## 🐞 Lista de Bugs Resolvidos ou Ativos (P0/P1/P2)

### [P1] Tela de Login e Onboarding sem "Loading State" (UI Freezing)
*   **Passos para reproduzir:** Acesse `/login`, preencha os dados e clique em "Sign In". Acesse `/onboarding`, digite o nome e clique em "Começar agora".
*   **Resultado esperado:** O botão muda para estado de carregamento (spinner) e é desativado para prevenir múltiplos cliques.
*   **Resultado atual:** O botão permanece normal e a tela congela enquanto a Server Action executa o redirecionamento.
*   **Evidência:** Arquivos `src/app/login/page.tsx` e `src/app/onboarding/page.tsx` usam `<form action={...}>` nativo sem utilitários como `useFormStatus` do React 19 para injetar estado de "pending".

### [P2] Botão de "Voltar" (Back) inativo no Perfil
*   **Passos para reproduzir:** Acesse a aba Profile pelo menu inferior. Clique na seta de voltar no topo à esquerda.
*   **Resultado esperado:** Navegação para a página anterior (ex: Timeline).
*   **Resultado atual:** O botão de seta é apenas visual ( `<button><span...>arrow_back</span></button>` ). Nenhuma ação ocorre.

---

## 🎨 Lista de Melhorias UX/UI (Prioridade)

1.  **[Alta] Internacionalização do Login:** A tela inicial do MVP está inteiramente em inglês ("Sign in to your family archive", "Email", "Password", "Sign Up"). Precisa ser traduzida para Português (PT-BR) para manter a uniformidade com o Onboarding e a Timeline.
2.  **[Alta] Feedback Visual no Submit de Formulários:** Como citado no bug acima, é obrigatório implementar estados de loading no Login, Signup e Criação de Família para a UX de um app de ponta.
3.  **[Média] Consistência de Ícones no Perfil:** Usar a mesma espessura e preenchimento dos ícones em toda a aplicação (garantido com o Hotfix do Material Symbols).
4.  **[Baixa] Header da Timeline com Muito Ruído Visuais:** Os "Chips" de filtros na timeline ocupam muito espaço em telas menores.

---

## 🔇 Funcionalidades "Mudas" (Aparentemente Prontas, mas Inativas)

Quase 40% dos botões no MVP são puramente visuais (placeholders). Se deixados no Beta, gerarão muitos relatórios de bugs falsos:

*   **Timeline:**
    *   Filtros horizontais: "Eventos", "Aniversários", "Férias", "Datas" (não filtram nada).
    *   Ícone de "Search/Lupa" no cabeçalho.
    *   O ícone deavatar de perfil "Você" (placeholder inativo).
*   **Árvore (Tree):**
    *   Ícones de "Search" e "Settings/Engrenagem" no cabeçalho.
*   **Perfil (Profile):**
    *   Botão de Câmera sobre o Avatar (A intenção é alterar a foto, mas não faz nada).
    *   Estatísticas Fixas: O bloco "Minhas Contribuições" exibe um "0" fixo no código para fotos e memórias, ignorando o uso real.
    *   Botões de Ação: "Meus Dados", "Privacidade", "Central de Ajuda" não possuem links ou modais associados.
    *   Gerenciar Assinatura: "Plano Família Base" não leva a nenhum portal do Stripe/Pagar.me.

---

## 🛡 Recomendações Críticas para o Beta (O que esconder/desativar)

Para focar as 15 pessoas no que realmente funciona e evitar ruído nos reports do Google Forms, **modifique o código antes de compartilhar o link**:

1.  **Limpar o Header da Timeline:** Remova completamente os *chips* de "Aniversários", "Férias" e "Eventos", e o ícone de Lupa. Deixe apenas o título.
2.  **Limpar o Perfil de Placeholders:** Oculte toda a sessão "Meus Dados / Privacidade / Central de Ajuda" e a "Assinatura". Deixe no Perfil apenas o Avatar (nome/email), Nível de Acesso (Admin/Membro), e o super importante botão de **Sair da Conta (Logout)**.
3.  **Remover a Câmera do Avatar:** Esconda o botãozinho de câmera em cima do círculo de foto no Perfil, testadores vão tentar enviar fotos por ali e falhar.
4.  **Traduza o Login:** Em 5 minutos troque as strings de `page.tsx` para Português.

---

## 📈 Sugestões de Monitoramento e E2E 

*   **Monitoramento:** Se os usuários do Beta começarem a receber Erros 500 silenciosos, nossa única visão será acessando a aba *Logs Explorer* do Supabase. Recomendo criar um painel simples no Sentry ou integrar envio de logs de erro (`catch`) diretamente.
*   **Testes E2E (Playwright):** Precisamos adicionar dois testes críticos logo após o beta:
    1.  Testar o upload de uma Foto real utilizando os inputs hidden do Playwright (isso previne a quebra da feature núcleo).
    2.  Testar a navegação BottomNav (verificar se `page.click('text=Perfil')` navega corretamente e tem o botão Logout).

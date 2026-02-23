# SPEC - MVP Definition (RootLine)

## 1. Escopo do MVP (P0-A vs P0-B)

Para garantir o time-to-market e validar a proposta de valor sem sobrecarga de engenharia, o MVP é dividido em P0-A (MVP Enxuto para Lançamento) e P0-B (Evolução Imediata Pós-MVP).

### P0-A: MVP Enxuto (Lançamento Beta)
- **Árvore Genealógica (Core):** Limitada a 25 membros. Foco no núcleo familiar próximo.
- **Ingestão de Mídia:** Upload manual + Integração Google Photos V0 (conectar + import restrito via API sem detecção de rostos/momentos espaciais).
- **Visualização & Feed:** Feed cronológico padronizado (thumbnails) com carregamento sob demanda interativo (full-res) na visualização de detalhes.
- **Autenticação e Permissões:** Login social (Google/Apple) ou Email/Senha via Supabase Auth. Três perfis: Admin, Contributor, Viewer.
- **API e Lógica:** Comunicação Frontend direto com Banco via Supabase PostgREST. Node.js limitado estritamente a Background Workers/Cronjobs.

### P0-B: Pós-MVP (Escala e Engajamento)
- **Árvore Escalonável:** Suporte a 70+ membros com renderização virtualizada de nós e expansão progressiva.
- **Múltiplos Providers:** Integração com iCloud e Instagram.
- **Engajamento:** Resumos mensais por e-mail e reações/comentários em fotos.
- **Curadoria Inteligente AI:** Modelos de Face e Moment Detection na ingestão das mídias.
- **Apps Nativos:** Lançamento nas lojas iOS e Android.

---

## 2. IN / OUT Explícito do MVP (P0-A)

**IN (O que entra no P0-A):**
- Cadastro de Família (Tenant) e convite de membros via e-mail/copiar link.
- **Tratamento de Família Ativa**: Limite lógico a 1 família selecionável por usuário (auto-select via banco), simplificando UI e state.
- Árvore genealógica interativa com limite de 25 membros.
- Autenticação e gestão de sessão com Supabase Auth.
- Conexão read-only com o Google Photos "V0" (importação bruta e superficial de thumbnails/datas, limitando requests pesados).
- Upload manual em massa via Drag & Drop para Storage próprio.
- Comunicação default via PostgREST sem middle layer Express, exceto workers para Google API async.
- Feed principal em formato de grid cronológico.
- Hospedagem e esteira de CI/CD via VPS + Dokploy.

**OUT (O que NÃO entra no P0-A):**
- Árvores complexas com mais de 25 pessoas (UI não comportará inicialmente sem virtualização).
- Inteligência Artificial para gerar resumos, face detection, moment detection ou scores.
- APIs GraphQL costuradas customizadas (usaremos PostgREST REST).
- Aplicativos mobile nativos (iOS e Android). Apenas Web responsivo (PWA).
- Solicitação de Impressão Física / Fotolivros.
- Suporte a vídeos nativos pesados (foco inicial extremo em fotos).

---

## 3. Resolução da Inconsistência da Árvore (25 vs 70+ Membros)

O PRD cita um requisito de 25 membros para o P0, mas as telas do Stitch projetam uma "Árvore Genealógica (70+ membros)". Essa divergência afeta diretamente as escolhas de React Flow/D3, query performance e design.

**A Decisão:**
- **MVP (P0-A): Hard-Cap em 25 membros ativos** por Família. A UI e as queries REST (PostgREST) não aplicarão paginação pesada no diagrama, renderizando o payload completo do grafo na requisição inicial. Isso reduz o atrito técnico de gerenciar edge-renderings no canvas.
- **Planejamento de Escala (P0-B): Padrão Sub-grafos**. Quando uma família crescer além da cota de 25, a visualização será particionada. A âncora visual mudará para focar em "núcleos" (ex: Família do Tio João), onde as ramificações de 3º grau são recolhidas em botões de "Exibir mais 12 membros" usando lazy loading.

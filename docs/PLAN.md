# Plano de Execução do P0-A (PLAN)

Para evitar os gargalos da Síndrome de Cascatas, este plano organiza o escopo de MVP P0-A em **Entregas Verticais (Slices)**, end-to-end e minúsculos, facilitando testes contínuos sem mockar o frontend.

## Fase 1: Fundação Infra e Auth (Estimativa: 3 Dias)
Nesta fase, provamos que podemos autenticar pessoas em ambientes multi-tenant de modo blindado com DevOps estabelecido.

- **Task 1.1:** Setup Repo - Configurar Next.js na raiz de `apps/web` com TailwindCSS e integrações de linter.
- **Task 1.2:** Pipeline de Deploy - Ligar o repositório ao VPS via Dokploy e garantir auto-deploy de um "Hello World RootLine" já na primeira hora.
- **Task 1.3:** DB & Auth - Modelar e instanciar as tabelas `profiles`, `families`, `members` no Supabase Managed.
- **Task 1.4:** Setup das Políticas (RLS) - Escrever as regras de permissão rigorosas de Tenant.
- **Task 1.5:** Auth UI - Implementar a tela de Sign Up/Log In ligada ao Supabase Auth via fluxo web, testar a geração do token.

**Critério de Verificação F1:** "Eu crio a Conta A (Família A) e Conta B (Família B). Se o token de A tentar dar fetch na Família B (seja por URL direta, manipulação de state ou requisição API crua no terminal), o PostgreSQL via RLS recusa. Isolamento cruzado 100% blindado."

## Fase 2: Onboarding e Círculos Familiar (Estimativa: 4 Dias)
Nesta fase, entregamos a experiência Social de Pertencimento (Core Value).

- **Task 2.1:** Criação da Família - Implementar Wizard de Onboarding inicial onde o Usuário cria o seu núcleo Familar base.
- **Task 2.2:** Envios de Convites - Setup Node-Mailer ou Resend; criar o endpoint que gera links de convite associados à role 'Contributor' e manda pro E-mail.
- **Task 2.3:** Ingresso via Link - Aceitar o link da task 2.2 numa UI e anexar a conta existente (ou criar nova) ao `family_id` desejado.
- **Task 2.4:** A Árvore (Visual) - Implementar componente (ex: React Flow) com limite lógico a 25 membros no MVP renderizando os membros listados do tenant.

**Critério de Verificação F2:** "Pessoa A convida B. A visualiza um preview do grafo/lista com [A e B]."

## Fase 3: Ingestão de Mídias (Estimativa: 5 Dias)
Temos as pessoas, agora trazemos o conteúdo do passado.

- **Task 3.1:** Bucket e Schemas - Configurar tabelas `photos`, R2/S3. Adicionar Upload Manual UI para Drag&Drop de JPEG local gerando referências assinadas e cacheamento do thumbnail.
- **Task 3.2:** Google Photos OAuth - Implementar o ClientID do Google com liberação do scope de biblioteca em leitura.
- **Task 3.3:** Sincronizador Backend (Worker) - Criar Controller de Extração atrelado ao usuário da sessão, capturando APENAS dados EXIF e o thumbnailURL, limitando 1000 fotos por loop.

**Critério de Verificação F3:** "Faço o Sync e em 60s meu Banco relacional reflete 200 novas entidades `photos` extraídas sem poluir meu storage caríssimo com mídias em Full Res."

## Fase 4: Visualização Core (Feed de Memórias) (Estimativa: 4 Dias)
A Recompensa de Dopamina em reviver o passado.

- **Task 4.1:** UI do Feed Padrão - Construção de uma Grid layout responsiva de Thumbnail-cards, puramente feed cronológico reverso usando a data real EXIF filtrada pelo `family_id`.
- **Task 4.2:** Lazy Load e Lightbox - Implementar Scroll Infinito. Quando clicado, abrir a Lightbox gerando o pre-signed do Cloud Storage para visualizar high-res on-demand.
- **Task 4.3:** Estabilização e Perf - Refinamento das animações e skeleton loadings definidos nas referências do Stitch.

**Critério de Verificação F4:** "Eu abro o App no celular 3G e o feed de 500 thumbnails das férias do ano passado carrega instantaneamente. Eu abro a foto do tio Zeca e aguardo apenas 1 minissegundo a mais para ela renderizar bonita na borda."

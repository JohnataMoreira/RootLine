# Stitch Source of Truth Index

Esta pasta contém as exportações originais direto do repositório Stitch (via MCP Server) que definem a interface do Rootline.

**Regras de Atualização:**
1. Nunca modifique os arquivos exportados manualmente.
2. Sincronize novamente através do Stitch Server MCP quando houver evolução de design.
3. Se o app divergir tecnicamente do Stitch inevitavelmente, os tickets devem ser registrados em `DIFFS.md`.

## 📍 Mapeamento de Telas (Screens Index)

| Stitch ID | Título da Tela | Rota App (Prevista) | Status | Data de Sync | Definition of Done (DoD) |
|-----------|----------------|---------------------|--------|--------------|----------------------------|
| `0073e34b5c57437ebffd9da743998bbe` | Árvore Genealógica (70+ membros) | `/tree` | TODO | 2026-02-23 | Match UI with Stitch HTML structure & CSS tokens |
| `0581e61059344ac6bec36c7761a03d21` | Pagamento e Finalização | N/A | TODO | 2026-02-23 | Match UI with Stitch HTML structure & CSS tokens |
| `08dea8d197de482a8577350466b27adb` | Identificação de Rostos | N/A | TODO | 2026-02-23 | Match UI with Stitch HTML structure & CSS tokens |
| `1e0788b17de5462f84f44b56f807b6f1` | Linha do Tempo Social Revisada | `/timeline` | DONE | 2026-02-23 | Match UI with Stitch HTML structure & CSS tokens |
| `22f545ec593d4e2093c10e123a4f6762` | Recordação de Voz | N/A | TODO | 2026-02-23 | Match UI with Stitch HTML structure & CSS tokens |
| `2acc7b3d23f248f6a7f03e22de24d92f` | Busca Inteligente | N/A | TODO | 2026-02-23 | Match UI with Stitch HTML structure & CSS tokens |
| `67bb741136b540bab3d90e90cef13e41` | Conectar Fontes de Fotos | `/timeline/photos` | TODO | 2026-02-23 | Match UI with Stitch HTML structure & CSS tokens |
| `8c57dc9c50ee44b9a7587f8f5d8a5a74` | Configurações de Privacidade | N/A | TODO | 2026-02-23 | Match UI with Stitch HTML structure & CSS tokens |
| `a4c617b9d9964859aec8de9ddeb35fee` | Onboarding - Rootline | `/onboarding` | DONE | 2026-02-23 | Match UI with Stitch HTML structure & CSS tokens |
| `a8b5db9820dc48c4a67d3445495948bc` | Carrinho de Compras | N/A | TODO | 2026-02-23 | Match UI with Stitch HTML structure & CSS tokens |
| `c68b37457e16428a970d092ae18bfc42` | Sucesso do Pedido | N/A | TODO | 2026-02-23 | Match UI with Stitch HTML structure & CSS tokens |
| `cb05e1030465495fa658b07543ece39b` | Página de Memorial | N/A | TODO | 2026-02-23 | Match UI with Stitch HTML structure & CSS tokens |
| `db0cba7eec7041879db746e2aac190b4` | Árvore Genealógica | `/tree` | DONE | 2026-02-23 | Match UI with Stitch HTML structure & CSS tokens |
| `f054c6a438e446008fe7ca5ebfdde6ae` | Perfil do Usuário | `/profile` | DONE | 2026-02-23 | Match UI with Stitch HTML structure & CSS tokens |
| `ff8a7b3ebec349e08e9e70d03e70de37` | Loja de Impressão Física | N/A | TODO | 2026-02-23 | Match UI with Stitch HTML structure & CSS tokens |

**Nota:** As imagens das telas estão disponíveis nos subdiretórios `./export/<screen-name>/screen.png` e a estrutura de layout crua fica em `structure.html`.

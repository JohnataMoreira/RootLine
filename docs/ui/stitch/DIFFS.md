# Stitch UI Diffs & Technical Decisions

Este documento rastreia e justifica qualquer desvio estrutural ou de layout ocorrido durante a implementação das telas criadas no Stitch. A fidelidade visual é a prioridade, mas adaptações técnicas (perf/UX/limitações de rendering) são registradas aqui.

## `/timeline` (Linha do Tempo)
- **Desvio**: A exibição das fotos `PhotoGrid.tsx` foi adaptada para um layout dinâmico que aproxima visualmente o design estático do Stitch.
- **Justificativa**: O design do Stitch demonstrava fotos organizadas de maneira não-uniforme. Para suportar a natureza imprevisível e dinâmica de feeds de fotos com infinite-scroll, utilizamos um "Masonry Grid" e segmentação automática por mês/ano. Um item "Large Card" é renderizado matematicamente de tempos em tempos para preservar o "feel" editorial do Stitch, mesmo consumindo dados dinâmicos horizontais/verticais diferentes do mock.

## `/tree` (Árvore Genealógica)
- **Desvio**: A renderização das conexões da árvore e layouts relativos não usa o HTML estático gerado pelo Stitch, sendo envelopado num container `ReactFlow`.
- **Justificativa**: Uma árvore genealógica real possui N relacionamentos impossíveis de enquadrar num grid estático com CSS absoluto, resultando em sobreposição e UX quebrada em layouts complexos (casos de divórcio, múltiplos filhos, etc). `ReactFlow` garante posicionamento dinâmico sem colisões. A fidelidade visual foi honrada aplicando as variáveis de temas CSS do Stitch (incluindo borders e background colors) diretamente nos avatares customizados (`MemberNode`).

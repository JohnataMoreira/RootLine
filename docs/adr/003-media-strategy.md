# ADR 003: Estratégia de Mídia (Armazenamento de Fotos e Desempenho)

**Data:** 2026-02-23
**Status:** Aceito
**Contexto:** Os usuários podem possuir livrarias de 10.000+ fotos, extraídas do Google Photos ou via Upload. Precisamos garantir UI com carregamento sub-segundo para o feed de memórias usando as telas do Stitch sem quebrar o budget de tráfego e storage de nuvem.

## Opções Consideradas

1. **Download Total para Storage Próprio:** Baixar todas as imagens em alta resolução do Google Photos para o nosso S3/R2 e gerar thumbnails locais.
2. **Apenas Linkagem Externa (Hotlinking):** Servir as URLs diretas do Google Photos sem armazenar no RootLine.

## Decisão

Adotaremos um **Modelo Híbrido Custo-Otimo (Thumbnails Próprias, Full-Res On-Demand)**.

1. **Extração:** Quando conectamos a API do Google, não baixamos os binários pesados originais. Extrairemos apenas *Thumbnails e Metadados Puros* (Location e Data) no nível V0. Sem extração ou detecção de Faces.
2. **Armazenamento de Thumbnail:** As Thumbnails (e imagens otimizadas para mobile grid) são cacheadas e armazenadas em buckets nossos (Cloudflare R2 ou Supabase Storage padrão) referenciadas pelo PostgreSQL.
3. **Origem do Full-Res (A Diferença Clara):** 
   - *Se feito Upload Manual:* O Front/Client atinge a CDN para puxar o binário integral armazenado diretamente no nosso bucket.
   - *Se puxado do Google Photos:* Quando o usuário abre a Lightbox, invocaremos o Proxy do Backend ou geraremos URLs assinadas do próprio Google Source on demand para exibir a foto sem hospedá-la interamente.

## Consequência

- Economia drástica de gigabytes inúteis de armazenamento em S3 no early stage.
- O Banco de Dados fará bridge pesado de reference IDs.
- Lógica de frontend deve lidar com skeleton screens até a URL em High-Res do backend responder via proxy pre-signed.

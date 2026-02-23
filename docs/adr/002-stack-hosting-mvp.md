# ADR 002: Estratégia de Hospedagem do MVP (Stack & Hosting)

**Data:** 2026-02-23
**Status:** Aceito
**Contexto:** O RootLine requer uma infraestrutura confiável e de baixo custo inicial para o MVP, porém com suporte a frameworks modernos (Next.js 14) e banco relacional forte.

## Opções Consideradas

1. **Vercel (Frontend/Serverless) + Supabase Managed (Banco)**
   - *Prós:* Escala automática, zero configuração de infra, ecosystem Vercel de borda, deploys atrelados ao GitHub super velozes.
   - *Contras:* Custos que explodem sob alto tráfego de mídia ou funções longas, lock-in severo da arquitetura serverless em caso de migração.
2. **VPS (Hetzer/DigitalOcean) + Dokploy (PaaS open-source) + Supabase Managed ou Self-hosted**
   - *Prós:* Custo previsível e quase fixo, liberdade de containerização via Docker. Permite criar workers longos (ex: sync agressivo de milhares de fotos via RabbitMQ) sem timeouts do Serverless.
   - *Contras:* Esforço operacional de manter o VPS atualizado, e gerenciar os healthchecks próprios.

## Decisão

Foi decidido **adotar a opção 2 (VPS + Dokploy para o Compute e Supabase para Banco/Auth)**.
- O Next.js (Web) e os Workers Node.js rodam conteinerizados e gerenciados via Dokploy no VPS da casa.
- O Supabase será utilizado via modelo Managed inicialmente (Database + Auth) para não lidar com backups de DB no MVP, repassando o custo computacional pesado para o nosso VPS.

## Consequência

- Os engenheiros devem escrever os containers Next.js como aplicações Standalone via Dockerfile e configurar as pipelines no Dokploy.
- Tarefas longas (Syncer do Google Photos) não irão bater no limite de proxy timeout da Vercel (10s a 60s), pois agirão como CRON jobs no Dokploy.
- Mais controle sobre roteamento e IPs.

# Alterações aplicadas (registro automático)

> Arquivo interno — não aparece nos menus de navegação.

## Padronizacao PT-BR de mensagens, tabelas e containers (2026-06-11)

- Nome da aplicação/pacote alterado para `gestao_frotas_api`.
- Serviços e containers Docker padronizados com um único nome `info_*`: `info_api`, `info_sqlserver`, `info_redis`, `info_mongodb`, `info_rabbitmq`, `info_prometheus`, `info_grafana`, `info_cadvisor`, `info_redis_exporter`, `info_blackbox` e `info_docs`.
- Hostnames internos de Prometheus, Grafana, Redis, SQL Server, MongoDB e RabbitMQ atualizados para os nomes `info_*`.
- Tabelas SQL Server renomeadas para PT-BR: `usuarios`, `marcas`, `modelos` e `veiculos`.
- Mensagens e exemplos de erro/aviso em inglês foram traduzidos para PT-BR quando não eram contratos externos.
- Documentação e agentes `.ia/` atualizados para refletir os nomes atuais.

## Revisao final segura — desacoplamento, testes e docs (2026-06-11)

Execucao do agente `99-agente-codex-revisao-final.md` conforme premissas finais do projeto.

- `DATABASE_ENABLED` passa a permitir inicializacao sem SQL Server/TypeORM operacional; quando o banco falha no bootstrap, a API sobe sem modulos dependentes de banco e mantem rotas publicas.
- `docker-compose.yml` mantem SQL Server, Redis e MongoDB no stack, mas remove dependencia operacional obrigatoria do backend via `depends_on`.
- `.env.example` documenta `MONGODB_URI` correta para Compose (`info_mongodb`) e uso local fora do container (`localhost`).
- `jest.config.js` unifica configuracao unit/e2e; `jest-e2e.json` foi removido.
- Specs unitarias foram adicionadas para todos os controllers.
- `.ia/05-testes-unitarios-e-integracao.md` consolida Jest como framework unico e remove orientacoes de Vitest.
- Documentacao atualizada para refletir `src/metrics/http-metrics.middleware.ts`, Guia do Desenvolvedor na sidebar e leitura dos paineis Grafana.

## Revisao final para entrega GitHub (2026-06-11)

Execucao do agente `99-agente-codex-revisao-final.md`.

- `.gitignore` criado para ignorar dependencias, builds, cobertura, cache VitePress, `.env`, banco local e backups de agentes.
- `docs/.vitepress/config.mts` atualizado com `VITEPRESS_BASE` para build estatico em subcaminho, preservando a sidebar e o Guia do Desenvolvedor.
- `README.md`, `docs/getting-started/installation.md` e `docs/getting-started/configuration.md` documentam o build VitePress com base configuravel para GitHub Pages.
- `docs/usage/testing.md` passa a tratar build como validacao local.
- `docs/architecture/overview.md` alinha o texto sobre MongoDB: auditoria e fail-soft no codigo, enquanto o Compose completo fornece dependencias para a experiencia completa.
- `.gitlab-ci.yml` preserva CI de build/testes e remove etapas de publicacao remota.
- Mensagens internas de erro e exemplos de teste/Postman foram padronizados em PT-BR sem acentuacao.
- `docs/dev-guide/index.md` mantem o Guia do Desenvolvedor na sidebar, sem depender de item no header.

## Grafana provisioning — datasource e dashboards (2026-06-11)

Execução do agente `13-agente-grafana-provisioning-dashboards.agent.md`.

### Backup

- `.backup/docker-config-2026-06-11/` — cópia de `docker-compose.yml`, `Dockerfile`, `docker/prometheus.yml`, `docker/Dockerfile.vitepress`

### Infraestrutura Docker

- `docker/grafana/provisioning/` — datasource Prometheus e dashboards versionados
- `docker/blackbox/blackbox.yml` — módulo `http_2xx` para probe de health
- `docker/prometheus.yml` — `metrics_path: /api/metrics`; jobs info_cadvisor, info_redis e info_blackbox
- `docker-compose.yml` — Grafana com acesso anônimo (sem login/senha); serviços `info_cadvisor`, `info_redis_exporter`, `info_blackbox`

### Aplicação

- `src/metrics/http-metrics.middleware.ts` — métricas `http_requests_total` e `http_request_duration_seconds`
- `src/metrics/metrics.module.ts` — middleware registrado globalmente

### Dashboards provisionados (pasta InfoSistemas)

- **Infraestrutura — Containers** — KPIs, CPU/memória/rede por serviço, rankings, tabela de targets (todos com descrição)
- **REST API — Observabilidade NestJS** — disponibilidade, uptime, tráfego, todos os status codes reais por método/rota, latência p50/p95/p99, runtime Node/V8, GC, event loop, handles e Redis como dependência de cache (todos com descrição)

### Documentação

- `docs/architecture/monitoring.md` — provisioning, exporters, acesso sem login
- `docs/getting-started/access.md` — Grafana sem credenciais obrigatórias
- `docs/getting-started/installation.md` — novos serviços e portas
- `.ia/06-monitoramento-prometheus-grafana.md`, `00-master.md`, `07-documentacao-vitepress.md` — referência ao agente 13

## Modulo Veiculos no Guia Dev — estudo SOLID (2026-06-10)

Execução do agente `12-agente-guia-desenvolvedor.agent.md` — explicação do módulo vehicles e exemplos concretos de SOLID.

- `docs/dev-guide/modulo-vehicles.md` — estudo completo: camadas, cache, fluxo, SOLID, gaps, testes
- `docs/dev-guide/solid-clean-code-patterns.md` — seção "Estudo de caso: módulo Vehicles"
- `docs/dev-guide/index.md` — link e roteiro de estudo atualizado
- `docs/.vitepress/config.mts` — sidebar com "Modulo Veiculos"

## Reorganização da navegação  (2026-06-10)

Execução do agente `07-documentacao-vitepress.md` (versão remodelada).

- Header reduzido a apenas "Início".
- Removidos do header e sidebar: Alterações, Guia, API, Arquitetura.
- Sidebar unificada em todos os prefixos com ordem: Guia (1–6) → API → Arquitetura → Guia do Desenvolvedor (colapsado).
- Criado `docs/getting-started/access.md` — checklist de pontos de acesso.
- `docs/index.md` com roteiro numerado do teste técnico.
- `installation.md` prioriza Docker Compose como caminho principal.

## Guia do Desenvolvedor — agente 12 e seção VitePress (2026-06-10)

Execução do agente `12-agente-guia-desenvolvedor.agent.md` — material de estudo para defesa da arquitetura no teste técnico.

### Agente criado

- `.ia/12-agente-guia-desenvolvedor.agent.md` — tutor de arquitetura, SOLID, patterns e entrevista

### Páginas VitePress (Guia do Desenvolvedor)

- `docs/dev-guide/index.md` — índice exclusivo para o desenvolvedor
- `docs/dev-guide/projeto-completo.md` — visão 360° do projeto
- `docs/dev-guide/fluxos-de-dados.md` — auth, CRUD, cache, audit (diagramas Mermaid)
- `docs/dev-guide/solid-clean-code-patterns.md` — SOLID, Clean Code e Design Patterns
- `docs/dev-guide/defesa-teste-tecnico.md` — roteiro de entrevista e FAQ
- `docs/dev-guide/diagramas.md` — índice de diagramas

### Diagramas Excalidraw

- `docs/public/diagrams/excalidraw/arquitetura-geral.excalidraw.json`
- `docs/public/diagrams/excalidraw/fluxo-autenticacao.excalidraw.json`
- `docs/public/diagrams/excalidraw/fluxo-crud-cache.excalidraw.json`
- `docs/public/diagrams/excalidraw/fluxo-auditoria.excalidraw.json`

### Configuração

- `docs/.vitepress/config.mts` — sidebar `/dev-guide/`
- `.ia/00-master.md` — agente 12 listado

## Documentação VitePress completa (2026-06-10)

Execução do agente `07-documentacao-vitepress.md` — padronização da documentação operacional.

### Páginas criadas

- `docs/api/auth.md`, `brands.md`, `vehicles.md`, `users.md`
- `docs/architecture/overview.md`, `database.md`, `monitoring.md`
- `docs/usage/authentication.md`, `pagination.md`, `testing.md`

### Páginas atualizadas

- `docs/index.md` — tabela de pontos de acesso e credenciais de desenvolvimento
- `docs/getting-started/installation.md` — pré-requisitos, fluxo npm, Docker e scripts
- `docs/getting-started/configuration.md` — variáveis agrupadas por domínio
- `docs/api/models.md` — endpoints reais com regras de negócio
- `docs/.vitepress/config.mts` — sidebar para API, arquitetura e uso; `ignoreDeadLinks` para URLs `localhost`

### Correções

- Removido caminho absoluto de máquina local em `installation.md`
- Endpoints alinhados aos controllers NestJS e Swagger

## Alterações de infraestrutura e configuração (anteriores)

- Adicionado `APP_PORT` em `.env.example` (padrão: `3001`).
- Aplicação padronizada para ouvir a porta `3001` quando `APP_PORT` não estiver definida.
- `Dockerfile` atualizado para `EXPOSE 3001`.
- `docker-compose.yml` atualizado:
  - `info_api` mapeado para `3001:3001` e `APP_PORT` definido como `3001`.
  - `info_grafana` mapeado para `3002:3000` no host.
  - serviço `docs` (VitePress) em `3003:4173`.
- `docker/prometheus.yml` coleta métricas em `info_api:3001`.

## Pontos de acesso (credenciais de desenvolvimento)

| Serviço | URL | Credenciais |
|---|---|---|
| API | http://localhost:3001/api | `aivacol` / `aivacol` |
| Swagger | http://localhost:3001/api/docs | — |
| Grafana | http://localhost:3002 | `admin` / `admin` |
| Docs (VitePress) | http://localhost:3003 | — |
| RabbitMQ Management | http://localhost:15672 | `user` / `password` |

## Observações

- O README permanece como início rápido; o VitePress é a documentação operacional completa.
- `npm run docs:build` deve ser executado após alterações em `docs/`.

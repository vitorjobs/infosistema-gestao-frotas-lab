# Arquitetura

Visão técnica da aplicação: camadas, fluxo de requisições, módulos e integrações externas.

## Visão em camadas

```text
Cliente (Swagger / Postman / curl)
        │
        ▼
┌───────────────────────────────────────┐
│  NestJS — prefixo /api                │
│  Guards JWT · Zod · Exception Filter  │
├───────────────────────────────────────┤
│  Domínio: auth, users, brands,        │
│  models, vehicles                     │
├───────────────────────────────────────┤
│  Infra: cache, audit, metrics         │
└───────────────────────────────────────┘
        │
   ┌────┴────┬──────────┬─────────┐
   ▼         ▼          ▼         ▼
SQL Server  Redis   MongoDB   Prometheus
 (TypeORM)  (cache)  (audit)   (scrape)
```

## Fluxo de uma requisição HTTP

1. **Entrada** — Express recebe a requisição com prefixo global `/api`.
2. **Middleware de métricas** — registra contadores e histograma (`http_requests_total`, `http_request_duration_seconds`).
3. **Guard JWT** — rotas protegidas exigem `Authorization: Bearer <token>` (exceto login, health, metrics, Swagger).
4. **Validação Zod** — body e query validados via `ZodValidationPipe`.
5. **Controller → Service → Repository** — lógica de negócio e acesso ao SQL Server (TypeORM).
6. **Cache** — listagens de marcas, modelos e veículos consultam Redis ou memória antes do banco.
7. **Auditoria (opcional)** — interceptor grava evento sanitizado em MongoDB (`http_audit_logs`).
8. **Resposta** — sucesso ou envelope de erro `{ success, statusCode, timestamp, path, method, error }`.

## Módulos (`src/`)

| Módulo | Responsabilidade |
|---|---|
| `auth` | Login JWT, Passport, guard global |
| `usuarios` | Consulta paginada de usuários |
| `marcas` | CRUD de marcas |
| `modelos` | CRUD de modelos (vínculo opcional com marca) |
| `veiculos` | CRUD de veículos (vínculo obrigatório com modelo) |
| `cache` | Abstração Redis / memória para listagens |
| `audit` | Interceptor HTTP → MongoDB (fail-soft) |
| `metrics` | Health Terminus, endpoint Prometheus |
| `config` | Validação de `.env` (Zod) |
| `database` | TypeORM, migrations, seed |
| `common` | Filtro global, paginação, pipe Zod |

## Persistência e dependências

| Componente | Papel | Obrigatório |
|---|---|---|
| **SQL Server** | Dados relacionais (usuários, marcas, modelos, veículos) | Sim, para CRUD |
| **Redis** | Cache de listagens em produção / Compose | Opcional em `start:dev` |
| **MongoDB** | Auditoria HTTP | Opcional (`MONGODB_URI`) |
| **Prometheus** | Coleta de métricas | Opcional (stack Docker) |
| **Grafana** | Visualização | Opcional (stack Docker) |
| **RabbitMQ** | Reservado no Compose | Não usado pelo código |

Com `DATABASE_ENABLED=false` ou SQL Server indisponível após retries, a API sobe **sem** módulos de domínio e mantém health, metrics e Swagger.

## Stack Docker (topologia)

```text
info_api ──────► info_sqlserver
    │               info_redis
    │               info_mongodb
    ▼
info_prometheus ◄── scrape /api/metrics
    │
info_grafana (dashboards provisionados)
info_cadvisor / info_redis_exporter / info_blackbox
info_docs (VitePress)
info_rabbitmq (sem integração na API)
```

## Princípios de design

- **Modularização por domínio** — cada feature tem module, controller, service e repository.
- **Metadados** — `created_at`, `updated_at`, `created_by` em entidades de domínio.
- **Integridade** — unicidade e bloqueio de DELETE com vínculos dependentes.
- **Observabilidade** — métricas Prometheus nativas + dashboards Grafana provisionados.
- **Fail-soft** — auditoria e fallback de banco não derrubam a API.

## Leitura complementar

- [Monitoramento — painéis Grafana](/guide/monitoring)
- [Banco de dados](/guide/database)
- [Testes Jest](/guide/tests)

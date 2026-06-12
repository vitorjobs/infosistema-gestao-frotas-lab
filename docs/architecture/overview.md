# Visão Geral

Backend da plataforma Aivacol de Gestão de Frota.

## Stack

| Camada | Tecnologia |
|---|---|
| Runtime | Node.js 22+ |
| Framework | NestJS 11 |
| ORM | TypeORM |
| Banco principal | SQL Server |
| Autenticação | JWT (Passport) |
| Cache | Redis (ou memória em dev) |
| Validação | Zod |
| Testes | Jest + Supertest |
| Documentação API | Swagger (`/api/docs`) |
| Documentação projeto | VitePress (`docs/`) |
| Auditoria (opcional) | MongoDB |
| Monitoramento | Terminus + Prometheus + Grafana |

## Dependências externas

| Serviço | Papel | Obrigatório |
|---|---|---|
| SQL Server | Persistência principal (TypeORM) | Sim, para CRUD e auth |
| Redis | Cache de listagens | Opcional em dev (`USE_MEMORY_CACHE` / `start:dev`) |
| MongoDB | Auditoria HTTP (`http_audit_logs`) | Opcional (`MONGODB_URI` / `AUDIT_ENABLED`) |
| Prometheus / Grafana | Observabilidade | Opcional (stack Docker) |
| RabbitMQ | Mensageria | Reservado (sem uso no código atual) |

No Docker Compose, SQL Server, Redis e MongoDB sobem automaticamente. Fora do container, use `localhost` nos hosts do `.env` e suba a infra manualmente ou via subconjunto do Compose — veja [Executar o Projeto](/getting-started/installation).

## Estrutura `src/`

```
src/
  auth/         JWT, login e guards
  users/        Consulta de usuários
  brands/       CRUD de marcas
  models/       CRUD de modelos
  vehicles/     CRUD de veículos com cache Redis
  cache/        Abstração Redis/Memória
  audit/        Auditoria HTTP opcional (MongoDB)
  config/       Validação de ambiente
  database/     TypeORM, migrations e seed
  common/       Filtros, paginação, validação Zod
  metrics/      Health check e Prometheus
```

## Princípios

- Modularização por domínio (feature modules).
- Prefixo global `/api` em todas as rotas HTTP.
- DTOs com validação Zod via `ZodValidationPipe`.
- Metadados `created_at`, `updated_at`, `created_by` em entidades de domínio.
- Erros no envelope `{ success, statusCode, timestamp, path, method, error }`.
- A auditoria MongoDB é fail-soft no código. No Compose completo, `info_sqlserver`, `info_redis` e `info_mongodb` continuam disponíveis, mas não bloqueiam o processo do backend via `depends_on`.
- `DATABASE_ENABLED=false` permite iniciar a API sem TypeORM nem módulos dependentes de SQL Server, mantendo rotas públicas de health, metrics e Swagger.

## Containers (Docker Compose)

| Serviço | Função |
|---|---|
| `info_api` | API NestJS |
| `info_sqlserver` | Banco relacional |
| `info_redis` | Cache |
| `info_mongodb` | Auditoria HTTP |
| `info_rabbitmq` | Mensageria (evolução futura) |
| `info_prometheus` | Coleta de métricas |
| `info_grafana` | Dashboards |
| `info_docs` | VitePress em produção |

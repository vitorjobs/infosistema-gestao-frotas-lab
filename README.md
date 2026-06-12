# gestao_frotas_api

Backend da plataforma Aivacol de Gestao de Frota (NestJS + TypeORM + SQL Server + JWT + Redis).

## Documentacao publicada

A documentacao da aplicacao esta disponivel em:

https://vitorjobs.github.io/infosistema-gestao-frotas-lab/

Use esse endereco como ponto de partida para instalacao, configuracao, autenticacao, testes, API e arquitetura.

## Pre-requisitos

- Docker e Docker Compose (**recomendado para testes e avaliacao**)
- Node.js 22+ (obrigatorio apenas para desenvolvimento local ou testes automatizados fora do container)

## Inicio rapido com Docker (recomendado)

```bash
cp .env.example .env
docker compose up -d --build
```

Este e o caminho preferencial: sobe a API (Node 22), SQL Server, Redis, MongoDB, monitoramento e documentacao com configuracao coerente.

Servicos:

| Servico | URL |
|---|---|
| API | http://localhost:3001/api |
| Swagger | http://localhost:3001/api/docs |
| Postman | `postman/aivacol-fleet-management.postman_collection.json` |
| Health | http://localhost:3001/api/health |
| Metricas | http://localhost:3001/api/metrics |
| Prometheus | http://localhost:9090 |
| Grafana | http://localhost:3002 |
| Docs (VitePress) | http://localhost:3003 |
| RabbitMQ Management | http://localhost:15672 |

Usuario seed: `aivacol` / `aivacol`

## Dependencias externas

| Servico | Obrigatorio para CRUD | No Docker Compose |
|---|---|---|
| SQL Server | Sim | `info_sqlserver` (:1433) |
| Redis | Nao em dev (`start:dev` usa memoria) | `info_redis` (:6379) |
| MongoDB | Nao (auditoria opcional) | `info_mongodb` (:27017) |

Detalhes, portas e troubleshooting: documentacao em [Executar o Projeto](https://vitorjobs.github.io/infosistema-gestao-frotas-lab/getting-started/installation).

## Desenvolvimento local (alternativa)

Preferivel apenas para hot reload. Para testes funcionais, use Docker.

```bash
npm ci
cp .env.example .env
# Ajuste hosts para localhost se a infra subir via Docker
docker compose up -d info_sqlserver info_redis info_mongodb
npm run migration:run
npm run seed
npm run start:dev          # cache em memoria (Redis opcional)
```

Producao local (codigo compilado):

```bash
npm run build
npm run start:prod         # NODE_ENV=production
```

Com Redis em dev:

```bash
npm run start:dev:redis
```

## Variaveis de ambiente

Consulte `.env.example`. `JWT_SECRET` deve ter no minimo 16 caracteres.

Banco de dados:

- `DATABASE_ENABLED=false` permite iniciar a API sem registrar TypeORM nem modulos dependentes de SQL Server. Nesse modo, rotas publicas como `/api/health`, `/api/metrics` e Swagger continuam disponiveis.
- Com `DATABASE_ENABLED=true`, o backend usa SQL Server, executa migrations quando `TYPEORM_MIGRATIONS_RUN=true` e habilita os modulos de auth, users, brands, models e vehicles.

Cache:

- `REDIS_ENABLED=false` ou `USE_MEMORY_CACHE=true` usa cache em memoria e evita dependencia operacional de Redis.

Auditoria MongoDB:

- `MONGODB_URI` define a conexao usada para gravar logs em `http_audit_logs`.
- No Docker Compose, use `mongodb://info_mongodb:27017/audit_db`; fora do container, use `mongodb://localhost:27017/audit_db`.
- `AUDIT_ENABLED=false` desabilita a auditoria explicitamente.
- Sem `MONGODB_URI`, a auditoria permanece desabilitada sem impedir a aplicacao de iniciar.
- Campos sensiveis como `password`, `password_hash`, `access_token`, `refresh_token`, `authorization` e `token` sao mascarados antes da persistencia.

## Scripts

| Script | Descricao |
|---|---|
| `npm run build` | Compila TypeScript |
| `npm run start` | Inicia build compilado (`node dist/main`) |
| `npm run start:prod` | Producao local (`NODE_ENV=production`) |
| `npm run start:dev` | Dev com cache em memoria |
| `npm run start:dev:redis` | Dev com Redis |
| `npm test` | Testes unitarios |
| `npm run test:e2e` | Testes e2e (sql.js + supertest) |
| `npm run test:cov` | Cobertura unitaria |
| `npm run migration:run` | Executa migrations |
| `npm run migration:revert` | Reverte ultima migration |
| `npm run seed` | Popula marcas/modelos/veiculos de `seed_vehicles.json` |

## Autenticacao

1. `POST /api/auth/login` com `{ "nickname": "aivacol", "password": "aivacol" }`
2. Enviar `Authorization: Bearer <access_token>` nas demais rotas

## Paginacao

Listagens aceitam `?page=1&limit=20` (limite maximo 100):

- `GET /api/brands`
- `GET /api/models`
- `GET /api/vehicles`
- `GET /api/users`

Resposta:

```json
{
  "data": [],
  "meta": { "total": 0, "page": 1, "limit": 20, "totalPages": 0 }
}
```

## Estrutura

```
src/
  auth/         JWT e login
  users/        Consulta de usuarios
  brands/       CRUD de marcas
  models/       CRUD de modelos
  vehicles/     CRUD de veiculos com cache Redis
  cache/        Abstracao Redis/Memoria para listagens de brands, models e vehicles
  audit/        Auditoria HTTP opcional com MongoDB
  config/       Validacao de ambiente
  database/     TypeORM, migrations e seed
  common/       Filtros, validacao Zod, paginacao
  metrics/      Health e Prometheus
test/           Testes e2e
```

## Testes

Testes automatizados (sem containers):

```bash
npm test
npm run test:e2e
```

Validacao funcional completa da API (login, CRUD, health, Swagger): use `docker compose up -d --build`.

## Documentacao VitePress

Acesse a documentacao publicada em:

https://vitorjobs.github.io/infosistema-gestao-frotas-lab/

Para executar ou gerar a documentacao localmente:

```bash
npm run docs:dev
npm run docs:build
```

Para gerar a documentacao estatica em um subcaminho, como GitHub Pages de repositorio, defina `VITEPRESS_BASE` antes do build:

```bash
VITEPRESS_BASE=/nome-do-repositorio/ npm run docs:build
```

## Migrations

Ordem atual:

1. `CreateModelsAndVehicles`
2. `CreateUsersAndBrands`
3. `AddCreatedByToUsers`

No Docker Compose, os servicos usam nomes em PT-BR/padrao unico `info_*`: `info_api`, `info_sqlserver`, `info_redis`, `info_mongodb`, `info_rabbitmq`, `info_prometheus`, `info_grafana`, `info_cadvisor`, `info_redis_exporter`, `info_blackbox` e `info_docs`.

`info_rabbitmq` esta disponivel para evolucao futura, sem implementacao de mensageria no codigo atual. `info_mongodb` e usado pela auditoria no stack completo, mas o backend nao depende dele para iniciar: sem URI ou com `AUDIT_ENABLED=false`, a auditoria fica desabilitada de forma segura.

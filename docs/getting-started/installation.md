# 1. Executar o Projeto

Caminho recomendado para o avaliador: **Docker Compose completo**.

## Pré-requisitos

- Docker e Docker Compose
- Node.js 18+ (apenas para desenvolvimento local ou testes fora do container)
- Portas livres:

| Porta | Serviço |
|---|---|
| 3001 | API NestJS |
| 3002 | Grafana |
| 3003 | VitePress (docs) |
| 1433 | SQL Server |
| 6379 | Redis |
| 9090 | Prometheus |
| 8080 | cAdvisor (métricas de containers) |
| 9121 | info_redis_exporter |
| 9115 | info_blackbox (health probes) |
| 15672 | RabbitMQ Management |
| 27017 | MongoDB |

## Projeto completo com Docker Compose

Na raiz do repositório (pasta com `docker-compose.yml`):

```bash
# 1. Configurar ambiente
cp .env.example .env

# 2. Subir todos os servicos (API, banco, cache, monitoramento, docs)
docker compose up -d --build

# 3. Verificar containers em execucao
docker compose ps
```

Serviços levantados:

| Container | Função |
|---|---|
| `info_api` | API NestJS |
| `info_sqlserver` | Banco SQL Server |
| `info_redis` | Cache |
| `info_mongodb` | Auditoria HTTP |
| `info_prometheus` | Coleta de métricas |
| `info_grafana` | Dashboards (provisionados automaticamente) |
| `info_cadvisor` | CPU/memória dos containers |
| `info_redis_exporter` | Métricas Redis (hits, misses) |
| `info_blackbox` | Probe HTTP em `/api/health` |
| `info_docs` | Esta documentação (VitePress) |
| `info_rabbitmq` | Mensageria (evolução futura) |

Após subir, siga para [Pontos de Acesso](/getting-started/access) e valide cada URL.

## Comandos úteis

```bash
# Logs em tempo real (todos os servicos)
docker compose logs -f

# Logs apenas do backend
docker compose logs -f info_api

# Parar e remover tudo
docker compose down --volumes --remove-orphans
```

## Subconjunto mínimo (opcional)

Apenas app + banco + redis:

```bash
docker compose up -d --build info_sqlserver info_redis info_api
```

## Desenvolvimento local (sem Docker)

1. Instale dependências e configure:

```bash
npm ci
cp .env.example .env
npm run migration:run
npm run seed
```

2. Inicie a aplicação:

```bash
npm run start:dev          # cache em memoria
npm run start:dev:redis    # com Redis
```

3. Documentação em modo dev:

```bash
npm run docs:dev
```

Build estatico com base configuravel, util para GitHub Pages em subcaminho:

```bash
VITEPRESS_BASE=/nome-do-repositorio/ npm run docs:build
```

## Scripts npm relevantes

| Script | Descrição |
|---|---|
| `npm run build` | Compila TypeScript |
| `npm run start` | Produção (build compilado) |
| `npm run migration:run` | Executa migrations |
| `npm run seed` | Popula marcas/modelos/veículos |
| `npm test` | Testes unitários |
| `npm run test:e2e` | Testes e2e |
| `npm run docs:build` | Build desta documentação |

## Observações

- Execute comandos Docker na pasta que contém `docker-compose.yml`.
- Garanta que o Docker Engine está em execução.
- `info_rabbitmq` não é requerido pela API para operar.

**Próximo passo:** [2. Configuração](/getting-started/configuration)

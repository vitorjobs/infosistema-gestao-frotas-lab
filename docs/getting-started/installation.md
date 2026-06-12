# 1. Executar o Projeto

## Forma recomendada: Docker Compose

Para **testes, avaliação e validação do projeto**, use sempre o stack completo via Docker Compose. Esse caminho sobe a API já compilada (Node.js 22), aplica migrations, conecta todas as dependências externas com os hosts corretos e evita divergência entre ambientes.

Na raiz do repositório (pasta com `docker-compose.yml`):

```bash
# 1. Configurar ambiente
cp .env.example .env

# 2. Subir todos os servicos (API, banco, cache, monitoramento, docs)
docker compose up -d --build

# 3. Verificar containers em execucao
docker compose ps
```

Após subir, siga para [Pontos de Acesso](/getting-started/access) e valide cada URL.

### Serviços levantados pelo Compose

| Container | Função |
|---|---|
| `info_api` | API NestJS (build de produção, Node 22) |
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

### Comandos úteis (Docker)

```bash
# Logs em tempo real (todos os servicos)
docker compose logs -f

# Logs apenas do backend
docker compose logs -f info_api

# Parar e remover tudo
docker compose down --volumes --remove-orphans
```

### Subconjunto mínimo (Docker)

Apenas app + banco + redis — útil para testes focados na API:

```bash
docker compose up -d --build info_sqlserver info_redis info_api
```

---

## Dependências externas

A API integra-se a serviços que **não fazem parte do processo Node.js**. No Docker Compose, eles sobem automaticamente; em execução local, precisam estar acessíveis antes de iniciar a aplicação.

| Serviço | Obrigatório para | Função no projeto | Container (Compose) | Porta padrão |
|---|---|---|---|---|
| **SQL Server** | CRUD, auth, migrations, seed | Banco relacional principal (TypeORM) | `info_sqlserver` | 1433 |
| **Redis** | Cache distribuído em produção | Cache de listagens (`brands`, `models`, `vehicles`) | `info_redis` | 6379 |
| **MongoDB** | Auditoria HTTP (opcional) | Logs em `http_audit_logs` | `info_mongodb` | 27017 |
| **Prometheus** | Observabilidade (opcional) | Scraping de `/api/metrics` | `info_prometheus` | 9090 |
| **Grafana** | Observabilidade (opcional) | Dashboards provisionados | `info_grafana` | 3002 |
| **RabbitMQ** | Não (evolução futura) | Reservado no stack | `info_rabbitmq` | 5672 / 15672 |

### O que é obrigatório de fato?

| Cenário | SQL Server | Redis | MongoDB |
|---|---|---|---|
| Docker Compose completo | Sim (automático) | Sim (automático) | Sim (automático; auditoria opcional no código) |
| `npm run start:dev` | Sim | Não — script usa cache em memória | Não — auditoria desabilitada sem URI |
| `npm run start:prod` / `npm run start` | Sim (se `DATABASE_ENABLED=true`) | Conforme `.env` | Conforme `.env` |
| Testes unitários / e2e (`npm test`) | Não | Não | Não (mocks) |

Com `DATABASE_ENABLED=false`, a API inicia **sem** TypeORM e **sem** rotas protegidas de negócio, mantendo health, metrics e Swagger. Esse modo é útil para diagnóstico, mas **não substitui** o ambiente Docker para testes funcionais completos.

---

## Pré-requisitos

| Item | Docker (recomendado) | Execução local |
|---|---|---|
| Docker + Docker Compose | Obrigatório | Opcional (pode subir só a infra) |
| Node.js 22+ | Não necessário na máquina | Obrigatório |
| Portas livres | Sim | Sim |

Portas utilizadas pelo stack completo:

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

---

## Execução local (alternativa)

Use execução local apenas para **desenvolvimento ativo** (hot reload). Para validar o projeto, prefira **Docker Compose**.

### 1. Preparar ambiente

```bash
npm ci
cp .env.example .env
```

Ajuste o `.env` quando a API roda **fora** dos containers — hosts de rede interna do Compose **não funcionam** no host:

| Variável | Valor no Docker Compose | Valor com API local |
|---|---|---|
| `DATABASE_HOST` | `info_sqlserver` | `localhost` |
| `REDIS_HOST` | `info_redis` | `localhost` |
| `MONGODB_URI` | `mongodb://info_mongodb:27017/audit_db` | `mongodb://localhost:27017/audit_db` |

### 2. Subir dependências externas

**Opção A — híbrida (recomendada para dev local):** infra no Docker, API no host:

```bash
docker compose up -d info_sqlserver info_redis info_mongodb
```

No `.env`, use `localhost` nos hosts conforme a tabela acima.

**Opção B — tudo instalado na máquina:** SQL Server, Redis e MongoDB devem estar rodando e acessíveis nas portas configuradas.

### 3. Migrations e seed (primeira execução)

Com SQL Server disponível:

```bash
npm run migration:run
npm run seed
```

No Docker Compose, migrations rodam automaticamente quando `TYPEORM_MIGRATIONS_RUN=true`.

---

## Modos de execução local

### Desenvolvimento: `npm run start:dev`

Hot reload com `ts-node-dev`. O script define `USE_MEMORY_CACHE=true`, ou seja, **Redis não é obrigatório** — listagens usam cache em memória.

```bash
npm run start:dev
```

Equivalente com Redis real (sem forçar cache em memória):

```bash
npm run start:dev:redis
```

| Aspecto | Comportamento |
|---|---|
| Compilação | TypeScript transpilado em memória (`--transpile-only`) |
| Cache | Memória (`start:dev`) ou Redis (`start:dev:redis`) |
| Build prévio | Não exige `npm run build` |
| `NODE_ENV` | `development` (via `.env`) |

### Produção local: `npm run start:prod`

Simula o mesmo modo da imagem Docker: código compilado + `NODE_ENV=production`.

```bash
npm run build
npm run start:prod
```

`npm run start` também executa `node dist/main`, mas **sem** definir `NODE_ENV=production` — prefira `start:prod` para espelhar produção.

| Aspecto | Comportamento |
|---|---|
| Compilação | Exige `npm run build` antes |
| Cache | Conforme `.env` (`REDIS_ENABLED`, `USE_MEMORY_CACHE`) |
| Saída | Pasta `dist/` |
| Variáveis | Respeita `.env` integralmente |

---

## Resolução de problemas

### Docker Compose

| Sintoma | Causa provável | Como resolver |
|---|---|---|
| Build da API falha no `npm run build` | Node ou TypeScript incompatível na imagem | Use a imagem `node:22-alpine` do `Dockerfile`; confirme `npm run build` localmente |
| `info_api` reinicia em loop | SQL Server ainda inicializando | Aguarde `info_sqlserver` healthy; veja `docker compose logs info_api` |
| Porta já em uso | Outro processo na 3001, 1433, etc. | Libere a porta ou altere o mapeamento no `docker-compose.yml` |
| Health retorna banco `down` | Migrations ou credenciais | Confira `DATABASE_*` no `.env` e logs do SQL Server |

### Execução local — `npm run start:dev`

| Sintoma | Causa provável | Como resolver |
|---|---|---|
| `ECONNREFUSED` / timeout SQL Server | Host errado ou banco parado | Use `DATABASE_HOST=localhost` se a infra está no Docker; suba `info_sqlserver` |
| Log: *SQL Server indisponivel; iniciando API sem modulos* | Banco inacessível após retries | Verifique senha (`DATABASE_PASSWORD`), porta 1433 e `DATABASE_CONNECT_RETRIES` |
| Login retorna 404 / rotas CRUD ausentes | API subiu com `DATABASE_ENABLED=false` após fallback | Corrija conexão SQL; reinicie com banco saudável |
| `migration:run` falha com `process` / tipos TS | Dependências ou Node desatualizado | Use Node 22+; execute `npm ci` |
| Porta 3001 em uso | Outra instância da API | Encerre o processo ou altere `APP_PORT` |

### Execução local — `npm run start:prod`

| Sintoma | Causa provável | Como resolver |
|---|---|---|
| `Cannot find module 'dist/main'` | Build não executado | Rode `npm run build` antes de `start:prod` |
| API sobe, mas rotas de negócio falham | SQL Server / Redis indisponível | Mesmas correções da tabela de `start:dev`; confira `.env` de produção |
| Cache diferente do Docker | `USE_MEMORY_CACHE` ou `REDIS_ENABLED` distintos | Alinhe `.env` ao Compose ou use `REDIS_ENABLED=true` com Redis ativo |
| Erro de driver `mssql` | Dependência nativa / Azure SDK | Execute `npm run doctor:drivers`; use Node 22+ |

### Variáveis que simplificam diagnóstico local

| Objetivo | Ajuste no `.env` |
|---|---|
| Subir sem SQL Server (só health/metrics/Swagger) | `DATABASE_ENABLED=false` |
| Subir sem Redis | `REDIS_ENABLED=false` ou `USE_MEMORY_CACHE=true` |
| Desabilitar auditoria | `AUDIT_ENABLED=false` ou remova `MONGODB_URI` |
| Aguardar mais o SQL Server na subida | Aumente `DATABASE_CONNECT_RETRIES` e `DATABASE_CONNECT_RETRY_DELAY_MS` |

---

## Documentação em modo dev

```bash
npm run docs:dev
```

Build estático (GitHub Pages em subcaminho):

```bash
VITEPRESS_BASE=/nome-do-repositorio/ npm run docs:build
```

---

## Scripts npm relevantes

| Script | Descrição |
|---|---|
| `npm run build` | Compila TypeScript para `dist/` |
| `npm run start` | Produção (`node dist/main`) |
| `npm run start:prod` | Produção com `NODE_ENV=production` |
| `npm run start:dev` | Desenvolvimento com cache em memória |
| `npm run start:dev:redis` | Desenvolvimento com Redis |
| `npm run migration:run` | Executa migrations |
| `npm run seed` | Popula marcas/modelos/veículos |
| `npm test` | Testes unitários |
| `npm run test:e2e` | Testes e2e |
| `npm run docs:build` | Build desta documentação |

## Observações

- Execute comandos Docker na pasta que contém `docker-compose.yml`.
- Garanta que o Docker Engine está em execução.
- `info_rabbitmq` não é requerido pela API para operar.
- Versão mínima de Node.js: **22** (local e containers).

**Próximo passo:** [2. Configuração](/getting-started/configuration)

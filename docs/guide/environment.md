# Ambiente e portas

Copie `.env.example` para `.env`. Fonte canônica: `.env.example`.

## Variáveis principais

### Banco (SQL Server)

| Variável | Descrição |
|---|---|
| `DATABASE_ENABLED` | `false` = API sem TypeORM (só rotas públicas) |
| `DATABASE_HOST`, `DATABASE_PORT`, `DATABASE_USER`, `DATABASE_PASSWORD`, `DATABASE_NAME` | Conexão SQL Server |
| `TYPEORM_MIGRATIONS_RUN` | Executa migrations na subida |
| `DATABASE_CONNECT_RETRIES`, `DATABASE_CONNECT_RETRY_DELAY_MS` | Retentativas na inicialização |

### JWT

| Variável | Descrição |
|---|---|
| `JWT_SECRET` | Mínimo 16 caracteres |
| `JWT_EXPIRES_IN` | Ex.: `1h` |
| `DEFAULT_USER_PASSWORD` | Senha do usuário seed `aivacol` |

### Cache

| Variável | Descrição |
|---|---|
| `REDIS_ENABLED` | `false` = cache em memória |
| `REDIS_HOST`, `REDIS_PORT`, `REDIS_TTL` | Conexão Redis |
| `USE_MEMORY_CACHE` | Força cache em memória |

### Auditoria

| Variável | Descrição |
|---|---|
| `MONGODB_URI` | MongoDB para `http_audit_logs` |
| `AUDIT_ENABLED` | `false` desabilita auditoria |

### Aplicação

| Variável | Descrição |
|---|---|
| `APP_PORT` | Porta HTTP (padrão `3001`) |
| `NODE_ENV` | `development` / `production` |
| `VITEPRESS_BASE` | Base path do build estático (GitHub Pages) |

## Portas

Confirme que estão livres antes de subir os containers.

| Serviço | Porta | URL | Onde alterar |
|---|---:|---|---|
| API | 3001 | http://localhost:3001/api | `.env` / `docker-compose.yml` |
| Swagger | 3001 | http://localhost:3001/api/docs | — |
| Grafana | 3002 | http://localhost:3002 | `docker-compose.yml` |
| VitePress | 3003 | http://localhost:3003 | `docker-compose.yml` |
| SQL Server | 1433 | — | `.env` / `docker-compose.yml` |
| Redis | 6379 | — | `.env` / `docker-compose.yml` |
| MongoDB | 27017 | — | `docker-compose.yml` |
| Prometheus | 9090 | http://localhost:9090 | `docker-compose.yml` |
| RabbitMQ | 5672 / 15672 | http://localhost:15672 | `docker-compose.yml` |
| cAdvisor | 8080 | — | `docker-compose.yml` |
| Redis Exporter | 9121 | — | `docker-compose.yml` |
| Blackbox | 9115 | — | `docker-compose.yml` |

Verificar portas em uso:

```bash
ss -tlnp | grep -E '3001|3002|3003|1433|6379|27017|9090'
```

## Credenciais de desenvolvimento

| Serviço | Credenciais |
|---|---|
| API | `aivacol` / `aivacol` |
| Grafana | Acesso anônimo (opcional: `admin` / `admin`) |
| RabbitMQ | `user` / `password` |
| SQL Server | `SA` / `YourStrong@Password` |

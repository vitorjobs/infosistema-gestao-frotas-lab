# 2. Configuração

Copie `.env.example` para `.env` e ajuste conforme o ambiente. A fonte canônica de variáveis é `.env.example`.

## Banco de dados (SQL Server)

| Variável | Descrição |
|---|---|
| `DATABASE_ENABLED` | `false` inicia a API sem registrar TypeORM nem módulos dependentes de SQL Server |
| `DATABASE_HOST` | Host do SQL Server (ex.: `info_sqlserver` no Compose) |
| `DATABASE_PORT` | Porta (padrão `1433`) |
| `DATABASE_USER` | Usuário (ex.: `SA`) |
| `DATABASE_PASSWORD` | Senha do banco |
| `DATABASE_NAME` | Nome do banco (ex.: `gestao_frotas_api`) |
| `DATABASE_ENCRYPT` | Criptografia da conexão (`true`/`false`) |
| `DATABASE_TRUST_SERVER_CERTIFICATE` | Confia no certificado do servidor |
| `DATABASE_AUTO_CREATE` | Cria o banco automaticamente se não existir |
| `DATABASE_CONNECT_RETRIES` | Tentativas de conexão na inicialização |
| `DATABASE_CONNECT_RETRY_DELAY_MS` | Intervalo entre tentativas (ms) |
| `TYPEORM_MIGRATIONS_RUN` | Executa migrations ao iniciar (`true`/`false`) |

Com `DATABASE_ENABLED=true`, o backend tenta preparar o SQL Server, registra TypeORM e habilita os módulos de auth, users, brands, models e vehicles. Se o SQL Server não responder durante a inicialização, a API faz fallback para `DATABASE_ENABLED=false` e mantém rotas públicas como health, metrics e Swagger disponíveis.

No Docker Compose, `info_sqlserver`, `info_redis` e `info_mongodb` continuam definidos no stack completo, mas não bloqueiam o processo do backend por `depends_on`. `DATABASE_CONNECT_RETRIES` controla quanto tempo a API aguarda o SQL Server antes do fallback.

## JWT e usuário padrão

| Variável | Descrição |
|---|---|
| `JWT_SECRET` | Segredo JWT — mínimo 16 caracteres |
| `JWT_EXPIRES_IN` | Expiração do token (ex.: `1h`) |
| `DEFAULT_USER_PASSWORD` | Senha do usuário seed `aivacol` |
| `DEFAULT_CREATED_BY` | Valor padrão de `created_by` quando não informado |

## Redis e cache

| Variável | Descrição |
|---|---|
| `REDIS_ENABLED` | `false` usa cache em memória e não instancia cliente Redis |
| `REDIS_HOST` | Host do Redis (ex.: `info_redis` no Compose) |
| `REDIS_PORT` | Porta (padrão `6379`) |
| `REDIS_TTL` | TTL do cache em segundos (padrão `3600`) |
| `USE_MEMORY_CACHE` | `true` usa cache em memória em vez de Redis |

Quando `REDIS_ENABLED=false`, `USE_MEMORY_CACHE=true` ou em `npm run start:dev`, listagens de brands, models e vehicles usam cache em memória.

## Auditoria (MongoDB)

| Variável | Descrição |
|---|---|
| `MONGODB_URI` | URI de conexão (Compose: `mongodb://info_mongodb:27017/audit_db`; API fora do container: `mongodb://localhost:27017/audit_db`) |
| `AUDIT_ENABLED` | `false` desabilita auditoria explicitamente |

Comportamento:

- Sem `MONGODB_URI`, a auditoria permanece desabilitada e **não impede** o backend de iniciar.
- Com `AUDIT_ENABLED=false`, a auditoria é desabilitada mesmo com URI definida.
- Logs são gravados na coleção `http_audit_logs`.
- Campos sensíveis (`password`, `password_hash`, `access_token`, `refresh_token`, `authorization`, `token`) são mascarados antes da persistência.

## Aplicação

| Variável | Descrição |
|---|---|
| `APP_PORT` | Porta HTTP (padrão `3001`) |
| `NODE_ENV` | Ambiente (`development` / `production`) |

## Documentacao VitePress

| Variavel | Descricao |
|---|---|
| `VITEPRESS_BASE` | Base path opcional para build estatico em subcaminho, como `/nome-do-repositorio/` no GitHub Pages |

**Próximo passo:** [3. Pontos de Acesso](/getting-started/access)

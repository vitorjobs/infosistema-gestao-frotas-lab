# Execução local

Use para **desenvolvimento com hot reload**. Para validação completa, prefira [Docker](/guide/docker-setup).

## Pré-requisitos

- Node.js 22+
- SQL Server acessível (via Docker ou instalado)
- `npm ci` executado na raiz

## Configurar

```bash
npm ci
cp .env.example .env
```

Com a API no host e infra no Docker:

```bash
docker compose up -d info_sqlserver info_redis info_mongodb
```

Ajuste no `.env`:

| Variável | Docker Compose | API no host |
|---|---|---|
| `DATABASE_HOST` | `info_sqlserver` | `localhost` |
| `REDIS_HOST` | `info_redis` | `localhost` |
| `MONGODB_URI` | `mongodb://info_mongodb:27017/audit_db` | `mongodb://localhost:27017/audit_db` |

## Migrations e seed (primeira vez)

```bash
npm run migration:run
npm run seed
```

## Modos de execução

| Comando | Uso |
|---|---|
| `npm run start:dev` | Dev com cache em memória (Redis opcional) |
| `npm run start:dev:redis` | Dev com Redis |
| `npm run build` + `npm run start:prod` | Simula produção compilada |

## Documentação local

```bash
npm run docs:dev
VITEPRESS_BASE=/infosistema-gestao-frotas-lab/ npm run docs:build
```

Problemas comuns: [Troubleshooting](/guide/troubleshooting)

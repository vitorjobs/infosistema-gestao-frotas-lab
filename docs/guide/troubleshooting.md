# Troubleshooting

## Docker

| Sintoma | Solução |
|---|---|
| `info_api` reinicia em loop | Aguarde SQL Server healthy; veja `docker compose logs info_api` |
| Porta em uso | Libere a porta ou altere mapeamento no `docker-compose.yml` |
| Health com banco `down` | Confira `DATABASE_*` no `.env` |

## Execução local

| Sintoma | Solução |
|---|---|
| `ECONNREFUSED` SQL Server | `DATABASE_HOST=localhost` se infra está no Docker |
| API sem rotas CRUD | Banco indisponível → fallback `DATABASE_ENABLED=false`; corrija conexão |
| `Cannot find module 'dist/main'` | Execute `npm run build` antes de `start:prod` |
| Porta 3001 em uso | Altere `APP_PORT` ou encerre processo anterior |

## Diagnóstico rápido via `.env`

| Objetivo | Ajuste |
|---|---|
| Subir sem SQL Server | `DATABASE_ENABLED=false` |
| Subir sem Redis | `REDIS_ENABLED=false` ou `USE_MEMORY_CACHE=true` |
| Desabilitar auditoria | `AUDIT_ENABLED=false` ou remova `MONGODB_URI` |
| Mais tempo para SQL Server | Aumente `DATABASE_CONNECT_RETRIES` |

## Documentação

```bash
npm run docs:dev
VITEPRESS_BASE=/infosistema-gestao-frotas-lab/ npm run docs:build
```

Mais contexto: [Docker](/guide/docker-setup) · [Local](/guide/local-setup) · [Ambiente](/guide/environment)

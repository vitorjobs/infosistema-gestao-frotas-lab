# 3. Pontos de Acesso

Checklist para o avaliador verificar que o projeto completo está operacional.

## URLs dos serviços

| Serviço | URL | O que verificar |
|---|---|---|
| API | http://localhost:3001/api | Prefixo global `/api` ativo |
| Swagger | http://localhost:3001/api/docs | Documentação interativa dos endpoints |
| Health | http://localhost:3001/api/health | Status `ok` (SQL Server, Redis, MongoDB) |
| Métricas | http://localhost:3001/api/metrics | Texto Prometheus |
| Prometheus | http://localhost:9090 | UI de métricas coletadas |
| Grafana | http://localhost:3002 | Dashboards pré-provisionados (acesso direto, sem login) |
| Docs (VitePress) | http://localhost:3003 | Esta documentação |
| RabbitMQ | http://localhost:15672 | Management UI (opcional) |
| Postman | `postman/aivacol-fleet-management.postman_collection.json` | Collection importável |

## Credenciais de desenvolvimento

| Serviço | Credenciais |
|---|---|
| API (login) | `aivacol` / `aivacol` |
| Grafana | _(opcional)_ `admin` / `admin` | Acesso anônimo habilitado — login não é obrigatório |
| RabbitMQ Management | `user` / `password` |
| SQL Server (SA) | `SA` / `YourStrong@Password` |

## Smoke tests (curl)

```bash
# Health check — espera status 200 e "status":"ok"
curl -s http://localhost:3001/api/health | head -c 500

# Login — espera access_token
curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"nickname":"aivacol","password":"aivacol"}'

# Metricas Prometheus — espera texto com HELP/TYPE
curl -s http://localhost:3001/api/metrics | head -5
```

## Checklist do avaliador

- [ ] `docker compose ps` mostra todos os containers em execução
- [ ] Health retorna `200` com `database`, `info_redis` e `info_mongodb` como `up`
- [ ] Swagger abre em `/api/docs`
- [ ] Login retorna `access_token`
- [ ] Prometheus acessível em `:9090`
- [ ] Grafana acessível em `:3002` com dashboards **Infraestrutura** e **REST API — Observabilidade NestJS** (pasta InfoSistemas; filtro por rota disponível)
- [ ] VitePress acessível em `:3003`

**Próximo passo:** [4. Autenticação](/usage/authentication)

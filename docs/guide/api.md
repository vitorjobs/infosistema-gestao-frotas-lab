# API e Swagger

Especificação completa no **Swagger**: http://localhost:3001/api/docs

Collection Postman: `postman/aivacol-fleet-management.postman_collection.json`

## Acessos

| Recurso | URL |
|---|---|
| Swagger | http://localhost:3001/api/docs |
| Health | http://localhost:3001/api/health |
| Métricas | http://localhost:3001/api/metrics |
| Postman | `postman/aivacol-fleet-management.postman_collection.json` |

## Autenticação

1. `POST /api/auth/login` com `{"nickname":"aivacol","password":"aivacol"}`
2. Use `Authorization: Bearer <access_token>` nas rotas protegidas

Rotas públicas: login, health, metrics, Swagger.

```bash
curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"nickname":"aivacol","password":"aivacol"}'
```

## Grupos no Swagger

| Tag | Conteúdo |
|---|---|
| `auth` | Login e usuário autenticado |
| `users` | Consulta paginada de usuários |
| `brands`, `models`, `vehicles` | CRUD de frota |
| `health` | Dependências (SQL, Redis, MongoDB) |
| `metrics` | Prometheus |

## Paginação

Listagens aceitam `?page=1&limit=20` (máx. 100):

- `GET /api/brands`, `/api/models`, `/api/vehicles`, `/api/users`

Resposta: `{ data: [], meta: { total, page, limit, totalPages } }`.

## Smoke test

```bash
curl -s http://localhost:3001/api/health | head -c 500
curl -s http://localhost:3001/api/metrics | head -5
```

Regras de negócio detalhadas estão na descrição do Swagger e no Postman.

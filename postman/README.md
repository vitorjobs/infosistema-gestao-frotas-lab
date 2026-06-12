# Postman — gestao_frotas_api

Collection espelhada com o Swagger em `http://localhost:3001/api/docs`.

## Importar

1. Abra o Postman → **Import** → selecione `aivacol-fleet-management.postman_collection.json`.
2. Confirme a variavel `baseUrl` = `http://localhost:3001`.

## Ordem de execucao

| Pasta | Descricao |
|---|---|
| `00 - Publicas` | Health (SQL Server + Redis) e metricas Prometheus |
| `01 - Auth` | Login (200), `/auth/me`, teste 401 sem token |
| `02 - Users` | Listagem paginada e busca por id (sem senha) |
| `03 - Brands` | CRUD com paginacao |
| `04 - Models` | CRUD vinculado a brand |
| `05 - Vehicles` | CRUD com cache Redis paginado |
| `06 - Regras de negocio` | Conflitos 409 e validacao 400 |
| `07 - Cleanup` | Remocoes com resposta 204 |

## Autenticacao

Execute primeiro **Login - usuario padrao aivacol**. O teste salva `accessToken` automaticamente.

- Usuario seed: `aivacol` / `aivacol`
- Header nas rotas protegidas: `Authorization: Bearer {{accessToken}}`

## Paginacao

Listagens usam `?page=1&limit=20` (limite maximo 100).

Resposta padrao:

```json
{
  "data": [],
  "meta": { "total": 0, "page": 1, "limit": 20, "totalPages": 0 }
}
```

## Status HTTP alinhados ao Swagger

| Operacao | Status |
|---|---|
| `POST /auth/login` | 200 |
| `POST` create | 201 |
| `GET` / `PATCH` | 200 |
| `DELETE` | 204 (sem corpo) |
| Erro validacao | 400 |
| Sem JWT | 401 |
| Conflito negocio / unicidade | 409 |

## Envelope de erro

```json
{
  "success": false,
  "statusCode": 400,
  "timestamp": "2026-06-10T00:00:00.000Z",
  "path": "/api/vehicles",
  "method": "POST",
  "error": { "code": "RequisicaoInvalida", "message": "Validacao falhou", "details": [] }
}
```

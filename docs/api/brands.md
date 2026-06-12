# Marcas (Brands)

Prefixo: `/api/brands`

Todas as rotas exigem JWT (`Authorization: Bearer <token>`).

Referência interativa: [Swagger](http://localhost:3001/api/docs#/brands)

## Endpoints

| Método | Rota | Descrição | Status |
|---|---|---|---|
| `POST` | `/api/brands` | Cria marca | `201` |
| `GET` | `/api/brands` | Lista paginada | `200` |
| `GET` | `/api/brands/:id` | Busca por id | `200` |
| `PATCH` | `/api/brands/:id` | Atualiza marca | `200` |
| `DELETE` | `/api/brands/:id` | Remove marca | `204` |

## Paginação

`GET /api/brands?page=1&limit=20` — ver [Paginação](/usage/pagination).

Cache Redis por página: `brands:page:{page}:{limit}` (TTL em `REDIS_TTL`).

## Regras de negócio

- Nome único por marca.
- `created_by` preenchido automaticamente pelo usuário autenticado quando não enviado.
- `DELETE` retorna `204` sem corpo.
- `409` ao remover marca com modelos vinculados.
- `409` ao criar/atualizar com nome duplicado.

## Exemplo de criação

```json
{
  "name": "Toyota"
}
```

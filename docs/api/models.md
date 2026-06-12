# Modelos (Models)

Prefixo: `/api/models`

Todas as rotas exigem JWT (`Authorization: Bearer <token>`).

Referência interativa: [Swagger](http://localhost:3001/api/docs#/models)

## Endpoints

| Método | Rota | Descrição | Status |
|---|---|---|---|
| `POST` | `/api/models` | Cria modelo | `201` |
| `GET` | `/api/models` | Lista paginada | `200` |
| `GET` | `/api/models/:id` | Busca por id | `200` |
| `PATCH` | `/api/models/:id` | Atualiza modelo | `200` |
| `DELETE` | `/api/models/:id` | Remove modelo | `204` |

## Paginação

`GET /api/models?page=1&limit=20` — ver [Paginação](/usage/pagination).

Cache Redis por página: `models:page:{page}:{limit}` (TTL em `REDIS_TTL`).

## Regras de negócio

- Nome único por modelo.
- `brand_id` opcional; quando informado, a marca deve existir.
- `brand_id` pode ser `null` no PATCH para remover vínculo.
- `created_by` preenchido automaticamente pelo usuário autenticado.
- `DELETE` retorna `204` sem corpo.
- `409` ao remover modelo com veículos vinculados.
- `409` ao criar/atualizar com nome duplicado.

## Exemplo de criação

```json
{
  "name": "Corolla",
  "brand_id": 1
}
```

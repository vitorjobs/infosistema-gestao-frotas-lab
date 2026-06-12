# 6. Paginação

Listagens paginadas aceitam query params:

| Parâmetro | Padrão | Máximo |
|---|---|---|
| `page` | `1` | — |
| `limit` | `20` | `100` |

## Endpoints com paginação

- `GET /api/brands`
- `GET /api/models`
- `GET /api/vehicles`
- `GET /api/users`

## Formato de resposta

```json
{
  "data": [],
  "meta": {
    "total": 0,
    "page": 1,
    "limit": 20,
    "totalPages": 0
  }
}
```

## Exemplo

```http
GET /api/vehicles?page=2&limit=10
Authorization: Bearer <access_token>
```

Erro `400` quando parâmetros são inválidos (validação Zod).

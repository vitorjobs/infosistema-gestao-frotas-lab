# Usuários (Users)

Prefixo: `/api/users`

Todas as rotas exigem JWT (`Authorization: Bearer <token>`).

Apenas consulta — sem endpoints de criação ou alteração via API.

Referência interativa: [Swagger](http://localhost:3001/api/docs#/users)

## Endpoints

| Método | Rota | Descrição | Status |
|---|---|---|---|
| `GET` | `/api/users` | Lista paginada | `200` |
| `GET` | `/api/users/:id` | Busca por id | `200` |

## Paginação

`GET /api/users?page=1&limit=20` — ver [Paginação](/usage/pagination).

## Regras

- Respostas **não expõem** `password_hash`.
- Usuário seed padrão: `aivacol` (criado via migration/seed).

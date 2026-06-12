# Veículos (Vehicles)

Prefixo: `/api/vehicles`

Todas as rotas exigem JWT (`Authorization: Bearer <token>`).

Referência interativa: [Swagger](http://localhost:3001/api/docs#/vehicles)

## Endpoints

| Método | Rota | Descrição | Status |
|---|---|---|---|
| `POST` | `/api/vehicles` | Cria veículo | `201` |
| `GET` | `/api/vehicles` | Lista paginada | `200` |
| `GET` | `/api/vehicles/:id` | Busca por id | `200` |
| `PATCH` | `/api/vehicles/:id` | Atualiza veículo | `200` |
| `DELETE` | `/api/vehicles/:id` | Remove veículo | `204` |

## Paginação

`GET /api/vehicles?page=1&limit=20` — ver [Paginação](/usage/pagination).

Cache Redis:

- Listagem: `vehicles:page:{page}:{limit}`
- Item: `vehicle:{id}`

Mutações invalidam cache automaticamente.

## Regras de negócio

- `model_id` obrigatório e deve existir.
- Placa, chassi e renavam únicos.
- Placa e chassi normalizados para maiúsculas.
- `created_by` preenchido automaticamente pelo usuário autenticado.
- `DELETE` retorna `204` sem corpo.
- `409` em violação de unicidade.

## Exemplo de criação

```json
{
  "license_plate": "ABC1D23",
  "chassis": "9BWZZZ377VT004251",
  "renavam": "12345678901",
  "year": 2024,
  "model_id": 1
}
```

# Autenticação

Prefixo: `/api/auth`

Rotas públicas (não exigem JWT), exceto `GET /api/auth/me`.

Referência interativa: [Swagger](http://localhost:3001/api/docs#/auth)

## Endpoints

| Método | Rota | Descrição | Auth |
|---|---|---|---|
| `POST` | `/api/auth/login` | Autentica e retorna JWT | Não |
| `GET` | `/api/auth/me` | Retorna usuário do token | Sim |

## Login

```http
POST /api/auth/login
Content-Type: application/json
```

```json
{
  "nickname": "aivacol",
  "password": "aivacol"
}
```

Resposta `200`:

```json
{
  "access_token": "<jwt>",
  "token_type": "Bearer"
}
```

Erros:

- `400` — payload inválido (validação Zod)
- `401` — credenciais inválidas

## Usuário autenticado

```http
GET /api/auth/me
Authorization: Bearer <access_token>
```

Retorna os dados gravados no JWT após validação Passport.

Erros:

- `401` — token ausente, inválido ou expirado

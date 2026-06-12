# 4. Autenticação

## Fluxo

1. Autentique em `POST /api/auth/login` com o usuário seed ou outro cadastrado.
2. Copie o `access_token` da resposta.
3. Envie `Authorization: Bearer <access_token>` em todas as rotas protegidas.

## Exemplo com curl

```bash
# Login
curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"nickname":"aivacol","password":"aivacol"}'

# Rotas protegidas
curl -s http://localhost:3001/api/brands \
  -H "Authorization: Bearer <access_token>"
```

## Usuário seed

| Campo | Valor |
|---|---|
| nickname | `aivacol` |
| password | `aivacol` |

Configurável via `DEFAULT_USER_PASSWORD` no `.env`.

## Rotas públicas

Não exigem JWT:

- `POST /api/auth/login`
- `GET /api/health`
- `GET /api/metrics`
- `GET /api/docs` (Swagger)

## Erros de autenticação

Resposta padrão de erro da API:

```json
{
  "success": false,
  "statusCode": 401,
  "timestamp": "2026-06-10T12:00:00.000Z",
  "path": "/api/brands",
  "method": "GET",
  "error": { "message": "Unauthorized" }
}
```

Detalhes em [Autenticação API](/api/auth).

**Próximo passo:** [5. Executar Testes](/usage/testing)

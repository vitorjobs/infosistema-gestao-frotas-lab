# Testes

## Comandos

```bash
npm ci
npm run build
npm test
npm run test:e2e
npm run test:cov
npm run docs:build
```

Requisito: Node.js 22+.

| Comando | Escopo |
|---|---|
| `npm test` | Unitários (`src/**/*.spec.ts`) |
| `npm run test:e2e` | HTTP com `sql.js` + Supertest (sem Docker) |
| `npm run test:cov` | Cobertura unitária |
| `npm run build` | Compilação TypeScript |

Configuração: `jest.config.js` (projetos `unit` e `e2e`).

## Validação funcional

| Tipo | Como |
|---|---|
| Stack completo | `docker compose up -d --build` |
| API manual | Swagger, Postman ou curl após login |

Checklist:

- [ ] `docker compose ps` — containers ativos
- [ ] `/api/health` retorna `200`
- [ ] Login retorna `access_token`
- [ ] Swagger e Grafana acessíveis

## CI/CD

Pipeline em PR `develop` → `main`: unit → e2e → build docs. Detalhes: [CI/CD](/guide/cicd).

**Nota:** `npm run lint` não existe no `package.json`.

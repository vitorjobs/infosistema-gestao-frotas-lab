# 5. Executar Testes

## Forma recomendada para validar o projeto

| Tipo de validação | Comando / caminho | Dependências externas |
|---|---|---|
| **Teste funcional completo (recomendado)** | `docker compose up -d --build` | SQL Server, Redis, MongoDB via Compose |
| Testes automatizados unitários | `npm test` | Nenhuma |
| Testes automatizados e2e | `npm run test:e2e` | Nenhuma (banco em memória com `sql.js`) |
| Build de produção | `npm run build` | Nenhuma |

Para validação manual da API (login, CRUD, health, Swagger, Grafana), **suba o stack Docker** conforme [Executar o Projeto](/getting-started/installation). Execução local com `npm run start:dev` ou `npm run start:prod` é alternativa para desenvolvimento — exige configurar SQL Server (e opcionalmente Redis/MongoDB) manualmente; veja a seção de resolução de problemas na instalação.

---

## Comandos de teste automatizado

```bash
# Testes unitarios
npm test

# Testes e2e (sql.js + supertest)
npm run test:e2e

# Cobertura unitaria
npm run test:cov
```

Requisito: Node.js 22+ e `npm ci` executado previamente.

---

## Escopo

- **Unitários:** controllers, serviços, validações, regras de negócio, mocks de repositório e cache.
- **E2E:** fluxos HTTP com banco em memória (`sql.js`), sem exigir containers externos.

Testes unitários de auditoria MongoDB usam mocks — não exigem container MongoDB.

---

## Configuração Jest

O projeto usa apenas Jest. A configuração fica centralizada em `jest.config.js` com dois projetos:

| Projeto | Script | Escopo |
|---|---|---|
| `unit` | `npm test` / `npm run test:cov` | Specs unitárias em `src/**/*.spec.ts`, excluindo e2e |
| `e2e` | `npm run test:e2e` | Specs `*.e2e-spec.ts` com setup em `test/setup-e2e.ts` |

Não há Vitest no projeto. Controllers devem ter cobertura unitária por delegação aos services; Redis real, health indicators, middleware de métricas e auditoria de observabilidade podem permanecer cobertos por mocks ou por testes de integração específicos quando houver necessidade.

---

## Build de validacao local

```bash
npm run build
npm run docs:build
```

---

## Configuração TypeScript

| Arquivo | Uso |
|---|---|
| `tsconfig.json` | Configuração base (app, migrations, build) |
| `tsconfig.build.json` | Build de produção — exclui testes e specs |
| `tsconfig.spec.json` | Compilação dos testes Jest (`types: node`, `jest`) |

**Próximo passo:** [6. Paginação](/usage/pagination) → [Checklist de Validação](/usage/validation-checklist) → [CI/CD](/architecture/cicd)

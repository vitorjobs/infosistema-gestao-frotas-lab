# 5. Executar Testes

## Comandos

```bash
# Testes unitarios
npm test

# Testes e2e (sql.js + supertest)
npm run test:e2e

# Cobertura unitaria
npm run test:cov
```

## Escopo

- **Unitários:** controllers, serviços, validações, regras de negócio, mocks de repositório e cache.
- **E2E:** fluxos HTTP com banco em memória (`sql.js`), sem exigir containers externos.

Testes unitários de auditoria MongoDB usam mocks — não exigem container MongoDB.

## Configuração Jest

O projeto usa apenas Jest. A configuração fica centralizada em `jest.config.js` com dois projetos:

| Projeto | Script | Escopo |
|---|---|---|
| `unit` | `npm test` / `npm run test:cov` | Specs unitárias em `src/**/*.spec.ts`, excluindo e2e |
| `e2e` | `npm run test:e2e` | Specs `*.e2e-spec.ts` com setup em `test/setup-e2e.ts` |

Não há Vitest no projeto. Controllers devem ter cobertura unitária por delegação aos services; Redis real, health indicators, middleware de métricas e auditoria de observabilidade podem permanecer cobertos por mocks ou por testes de integração específicos quando houver necessidade.

## Build de validacao local

```bash
npm run build
npm run docs:build
```

## Configuração TypeScript

O projeto mantém dois arquivos TypeScript por responsabilidade:

| Arquivo | Uso |
|---|---|
| `tsconfig.json` | Configuração base compartilhada, com `strict`, decorators e `outDir` |
| `tsconfig.build.json` | Configuração do build de produção, estendendo a base e excluindo `test`, `dist` e `**/*.spec.ts` |

A separação foi mantida porque evita levar specs e artefatos de teste para o build sem duplicar opções de compilação.

**Próximo passo:** [6. Paginação](/usage/pagination) → [API](/api/auth) → [Arquitetura](/architecture/overview)

# Testes com Jest

Guia completo para executar os testes automatizados da aplicação **sem Docker** (unitários e e2e).

## Pré-requisitos

| Item | Versão / observação |
|---|---|
| Node.js | **22+** (`.nvmrc` e `package.json`) |
| npm | Incluso com Node |
| Git | Clone do repositório |

Não é necessário SQL Server, Redis ou MongoDB rodando — os testes usam mocks (unitários) ou `sql.js` em memória (e2e).

## 1. Instalar dependências

Na raiz do projeto:

```bash
# Recomendado — instalação limpa a partir do package-lock.json
npm ci
```

Alternativa (desenvolvimento):

```bash
npm install
```

Confirme a versão do Node:

```bash
node -v   # deve ser >= 22
```

Com nvm:

```bash
nvm use
npm ci
```

## 2. Executar todos os testes (sequência completa)

Ordem usada no CI (`/.github/workflows/ci.yml`):

```bash
# 1. Compilar TypeScript (obrigatório antes de confiar no build)
npm run build

# 2. Testes unitários
npm test

# 3. Testes end-to-end (sequencial, um arquivo por vez)
npm run test:e2e
```

Saída esperada:

- Unitários: **23 suites**, **81 testes** aprovados
- E2E: **1 suite**, **7 testes** aprovados (`test/app.e2e-spec.ts`)

## 3. Comandos individuais

| Comando | Projeto Jest | O que executa |
|---|---|---|
| `npm test` | `unit` | `src/**/*.spec.ts` (exceto e2e) |
| `npm run test:e2e` | `e2e` | `*.e2e-spec.ts` com `--runInBand` |
| `npm run test:cov` | `unit` | Unitários + relatório em `./coverage` |
| `npm run build` | — | Compilação via `tsconfig.build.json` |

**Nota:** `npm run lint` **não existe** neste projeto.

## 4. Estrutura de testes

Configuração central: `jest.config.js`

| Projeto | `displayName` | Padrão de arquivos | Setup |
|---|---|---|---|
| Unitários | `unit` | `*.spec.ts` em `src/` | — |
| E2E | `e2e` | `*.e2e-spec.ts` | `test/setup-e2e.ts` |

TypeScript dos testes: `tsconfig.spec.json` (`esModuleInterop: true`).

### Testes unitários (23 arquivos)

Cobrem controllers, services, repositories, guards, filtros, cache, auditoria e métricas — com mocks, sem banco real.

Exemplos de áreas:

- `auth/` — login, guard JWT
- `marcas/`, `modelos/`, `veiculos/` — CRUD e regras
- `cache/` — serviço de memória
- `audit/` — sanitização e interceptor
- `metrics/` — health e Prometheus controller
- `common/` — Zod pipe e exception filter

### Testes e2e (1 arquivo)

`test/app.e2e-spec.ts` — fluxo HTTP completo com Supertest:

- Login JWT
- CRUD marcas → modelos → veículos
- Health e rotas protegidas
- Banco em memória via `sql.js` (`TestAppModule`)

Variáveis definidas em `test/setup-e2e.ts`:

- `USE_MEMORY_CACHE=true`
- `JWT_SECRET` de teste
- `AUDIT_ENABLED=false`
- Migrations desabilitadas

## 5. Cobertura de código

```bash
npm run test:cov
```

Relatório gerado em `./coverage/`. Limites mínimos em `jest.config.js`:

| Métrica | Mínimo |
|---|---|
| Branches | 70% |
| Functions | 80% |
| Lines | 80% |
| Statements | 80% |

## 6. Validar build da documentação (opcional)

Mesmo passo do CI após os testes:

```bash
VITEPRESS_BASE=/infosistema-gestao-frotas-lab/ npm run docs:build
```

## 7. Validação funcional (com Docker)

Testes Jest **não substituem** validação com stack real. Para login, Swagger, Grafana e dependências reais:

```bash
cp .env.example .env
docker compose up -d --build
```

Checklist rápido:

- [ ] `docker compose ps` — containers ativos
- [ ] `GET /api/health` → `200`
- [ ] Login → `access_token`
- [ ] Swagger em `/api/docs`

## 8. Problemas comuns

| Sintoma | Causa provável | Solução |
|---|---|---|
| `Cannot find module` | Dependências não instaladas | `npm ci` |
| Erro de versão Node | Node < 22 | `nvm use` ou instale Node 22+ |
| E2E falha em import | `npm ci` incompleto | Reinstale dependências |
| `npm run build` falha | Erro TypeScript no código | Corrija antes de rodar testes |
| Testes passam local, falham no CI | Lock file desatualizado | Commit `package-lock.json` alinhado |

## 9. O que o CI executa

No pipeline (PR `develop` → `main` e push `main`):

```text
npm ci → npm run build → npm test → npm run test:e2e → npm run docs:build
```

Detalhes: [CI/CD](/guide/cicd).

## Resumo — copiar e colar

```bash
nvm use
npm ci
npm run build
npm test
npm run test:e2e
npm run test:cov          # opcional
```

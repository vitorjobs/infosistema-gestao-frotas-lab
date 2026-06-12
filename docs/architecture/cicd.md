# CI/CD

Documentação baseada exclusivamente nos arquivos em `.github/` existentes no repositório. Nenhum workflow foi alterado por esta página.

## Visão geral

O repositório utiliza **um único workflow** de integração e entrega contínua, com fluxo de branches **develop → main**.

| Branch | Papel |
|---|---|
| `develop` | Integração de features e correções |
| `main` | Produção e fonte da verdade |

Não há branch `staging` no modelo atual. A entrega para produção ocorre via PR `develop` → `main`, seguido de deploy automático ao mergear em `main`.

```text
feature/fix-*  ──PR──►  develop  ──PR──►  main  ──►  deploy (Pages + Docker)
```

## Arquivos analisados

| Arquivo | Função |
|---|---|
| `.github/workflows/ci.yml` | Pipeline único CI/CD |
| `.github/CI_CD.md` | Referência interna do fluxo |
| `.github/BRANCH_PROTECTION.md` | Regras recomendadas de proteção de branches |
| `.github/CD_TARGET.md` | Destinos de entrega contínua |
| `.nvmrc` | Versão Node.js usada no pipeline (`22`) |

## Workflow: CI/CD

**Arquivo:** `.github/workflows/ci.yml`  
**Nome:** `CI/CD`

### Eventos de disparo

| Evento | Condição | Comportamento |
|---|---|---|
| `pull_request` | base = `main` | Jobs de validação quando `head` = `develop` |
| `push` | branch `main` | Pipeline completo + deploy |
| `push` | tag `v*.*.*` | Pipeline completo + publicação Docker por tag |
| `workflow_dispatch` | manual | Testes + build da documentação |

PRs para `main` cujo `head` **não** seja `develop` são ignorados pelos jobs (condição `github.head_ref == 'develop'`).

Push em `develop` **não** dispara este workflow.

### Variáveis de ambiente do workflow

| Variável | Valor | Uso |
|---|---|---|
| `VITEPRESS_BASE` | `/infosistema-gestao-frotas-lab/` | Base path do build VitePress para GitHub Pages |

### Concorrência

- Grupo: `ci-cd-<nome-do-workflow>-<ref-do-git>` (expressão GitHub Actions: `github.workflow` + `github.ref`)
- `cancel-in-progress: true` — execuções concorrentes na mesma ref são canceladas

### Permissões padrão

- `contents: read` (nível do workflow)
- Jobs de deploy ampliam permissões conforme necessário (`pages: write`, `id-token: write`, `packages: write`)

### Secrets e tokens

O workflow **não referencia secrets nomeados** explicitamente. Utiliza:

- `github.token` — login no GHCR (`docker/login-action`)
- `GITHUB_TOKEN` implícito — permissões do job para Pages e Packages

Nenhum valor de secret é exposto nesta documentação.

---

## Jobs (ordem sequencial)

```text
Unit tests  →  E2E tests  →  Build documentation  →  Deploy VitePress  →  Publish Docker image
```

### 1. Unit tests

| Campo | Valor |
|---|---|
| **Nome** | `Unit tests` |
| **Runner** | `ubuntu-latest` |
| **Node.js** | `.nvmrc` (22) via `actions/setup-node@v6` |
| **Comandos** | `npm ci` → `npm run build` → `npm test` |

Executa em: PR `develop`→`main`, push `main`/tag, `workflow_dispatch`.

**Resultado esperado:** compilação TypeScript e testes unitários Jest (`--selectProjects unit`) verdes.

### 2. E2E tests

| Campo | Valor |
|---|---|
| **Nome** | `E2E tests` |
| **Depende de** | `unit-tests` |
| **Comandos** | `npm ci` → `npm run test:e2e` |

**Resultado esperado:** specs `*.e2e-spec.ts` passando com banco em memória (`sql.js`).

### 3. Build documentation

| Campo | Valor |
|---|---|
| **Nome** | `Build documentation` |
| **Depende de** | `e2e-tests` |
| **Comandos** | `npm ci` → `npm run docs:build` |
| **Artefato** | Upload Pages (`docs/.vitepress/dist`) — **somente** em push `main` |

**Resultado esperado:** site VitePress estático gerado com `VITEPRESS_BASE` configurado.

### 4. Deploy VitePress

| Campo | Valor |
|---|---|
| **Nome** | `Deploy VitePress` |
| **Depende de** | `docs-build` |
| **Condição** | push em `main` |
| **Environment** | `github-pages` |
| **Action** | `actions/deploy-pages@v4` |

**Resultado esperado:** documentação publicada em GitHub Pages.

URL documentada em `.github/CD_TARGET.md`:

**https://vitorjobs.github.io/infosistema-gestao-frotas-lab/**

### 5. Publish Docker image

| Campo | Valor |
|---|---|
| **Nome** | `Publish Docker image` |
| **Depende de** | `docs-build` + `docs-deploy` |
| **Condição** | push `main` (após deploy Pages OK) ou tag `v*.*.*` |
| **Environment** | `production` |
| **Registry** | `ghcr.io/<owner>/<repository>` |
| **Dockerfile** | `Dockerfile` (target `production`) |

**Tags geradas** (via `docker/metadata-action`):

- `main`
- `sha-<commit>`
- `v*.*.*` (quando push de tag)
- `latest` (somente a partir de `main`)

Cache de build: GitHub Actions (`type=gha`).

---

## Matriz resumida: PR vs push main

| Job | PR `develop`→`main` | Push `main` |
|---|---|---|
| Unit tests | Sim | Sim |
| E2E tests | Sim | Sim |
| Build documentation | Sim | Sim |
| Deploy VitePress | Não | Sim |
| Publish Docker image | Não | Sim |

---

## Proteção de branches (recomendação documentada)

Conforme `.github/BRANCH_PROTECTION.md` — configuração manual no GitHub:

**`main`**

- PR obrigatório (idealmente a partir de `develop`)
- Status checks: `Unit tests`, `E2E tests`, `Build documentation`
- Sem push direto / force push

**`develop`**

- PR recomendado
- CI completo ocorre no PR para `main`

---

## Observações e limitações identificadas

| Item | Observação |
|---|---|
| Lint | Não há job de lint; `package.json` não define script `npm run lint` |
| Push em `develop` | Não dispara o workflow automaticamente |
| PR para `main` de outras branches | Ignorado pelo pipeline |
| `docs-build` em PR | Usa `actions/setup-node@v4`; demais jobs usam `@v6` |
| Deploy Docker | Depende do sucesso do deploy Pages em push `main` |
| Branch `staging` | Pode existir no remoto como legado; não faz parte do fluxo documentado |

Estas observações são documentais. Os workflows em `.github/workflows/` não foram modificados.

**Ver também:** [Monitoramento](/architecture/monitoring) · [Executar Testes](/usage/testing) · [Checklist de validação](/usage/validation-checklist)

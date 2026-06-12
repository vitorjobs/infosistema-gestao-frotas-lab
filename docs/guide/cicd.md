# CI/CD

Documentação baseada em `.github/workflows/ci.yml` (somente leitura — workflows não são alterados por esta página).

## Fluxo de branches

```text
feature/fix-*  ──PR──►  develop  ──PR──►  main  ──►  deploy
```

| Branch | Papel |
|---|---|
| `develop` | Integração |
| `main` | Produção |

## Workflow `CI/CD`

**Arquivo:** `.github/workflows/ci.yml`  
**Node.js:** `.nvmrc` (22)

### Disparos

| Evento | Comportamento |
|---|---|
| PR → `main` (head = `develop`) | Testes + build docs |
| Push `main` ou tag `v*.*.*` | Pipeline completo + deploy |
| `workflow_dispatch` | Testes + build docs manual |

Push em `develop` **não** dispara o workflow.

### Jobs (sequência)

```text
Unit tests → E2E tests → Build documentation → Deploy VitePress → Publish Docker
```

| Job | PR develop→main | Push main |
|---|---|---|
| Unit tests (`npm ci`, `build`, `test`) | Sim | Sim |
| E2E tests | Sim | Sim |
| Build documentation | Sim | Sim |
| Deploy VitePress | Não | Sim |
| Publish Docker (GHCR) | Não | Sim |

### Entregáveis (push `main`)

- **Pages:** https://vitorjobs.github.io/infosistema-gestao-frotas-lab/
- **Docker:** `ghcr.io/<owner>/<repository>:latest`
- **Env workflow:** `VITEPRESS_BASE=/infosistema-gestao-frotas-lab/`

Secrets: usa `github.token` (GHCR e Pages). Nenhum secret nomeado no workflow.

### Limitações

- Sem job de lint (`npm run lint` inexistente)
- PR para `main` de branches ≠ `develop` é ignorado pelo pipeline

Referência interna: `.github/CI_CD.md`, `.github/BRANCH_PROTECTION.md`.

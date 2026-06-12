# Branch Protection

Duas branches long-lived:

- **`main`**: produção e fonte da verdade.
- **`develop`**: integração de features e fixes.

Fluxo completo documentado em [`CI_CD.md`](CI_CD.md).

## `main`

Regras recomendadas:

- Exigir PR antes do merge (somente a partir de `develop`).
- Exigir pelo menos 1 aprovação.
- Exigir status checks antes do merge.
- Exigir branches atualizadas antes do merge.
- Não permitir push direto, force push ou exclusão.

Status checks obrigatórios (pipeline [`ci.yml`](workflows/ci.yml)):

- `Unit tests`
- `E2E tests`
- `Build documentation`

## `develop`

Regras recomendadas:

- Exigir PR antes do merge.
- Não permitir force push ou exclusão.
- CI/CD **não** roda aqui — a validação completa ocorre no PR `develop` → `main`.

## Criação inicial das branches

1. `main` (padrão do repositório)
2. `develop`, a partir de `main`

# CD Target

Entrega contínua via pipeline único [`.github/workflows/ci.yml`](workflows/ci.yml), executado após merge em `main`.

## GitHub Pages (VitePress)

Publicado automaticamente no job **Deploy VitePress** quando código chega em `main`.

URL: https://vitorjobs.github.io/infosistema-gestao-frotas-lab/

## GitHub Container Registry (GHCR)

Publicado no job **Publish Docker image** após deploy da documentação.

### Imagem

```text
ghcr.io/<owner>/<repository>
```

Tags geradas:

- `main` — branch de produção.
- `sha-<commit>` — commit específico.
- `v*.*.*` — releases por tag.
- `latest` — somente a partir de `main`.

## Environment

Crie no GitHub:

- `github-pages` — deploy da documentação.
- `production` — publicação da imagem Docker (opcional: exigir aprovação manual).

## Rollback

Reverter o merge em `main` ou fazer deploy de uma tag `sha-<commit>` anterior conhecida como estável.

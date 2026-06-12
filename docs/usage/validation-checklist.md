# Checklist de Validação

Lista de verificação para confirmar que o projeto está operacional após a execução local ou após uma entrega via pipeline.

Baseada nos comandos e URLs existentes no repositório.

## Pré-execução

- [ ] Portas livres conforme [Verificação de Portas](/getting-started/ports)
- [ ] `.env` criado a partir de `.env.example`
- [ ] Docker Engine em execução (se usar Compose)

## Stack Docker Compose

```bash
cp .env.example .env
docker compose up -d --build
docker compose ps
```

- [ ] Containers `info_api`, `info_sqlserver`, `info_redis` em execução
- [ ] Health da API retorna `200` — `curl -s http://localhost:3001/api/health`
- [ ] Swagger acessível — http://localhost:3001/api/docs
- [ ] Login retorna `access_token` — `POST /api/auth/login` com `aivacol` / `aivacol`
- [ ] Prometheus — http://localhost:9090
- [ ] Grafana — http://localhost:3002 (dashboards da pasta InfoSistemas)
- [ ] VitePress local — http://localhost:3003

Detalhes e credenciais: [Pontos de Acesso](/getting-started/access).

## Testes automatizados (Node.js 22+)

```bash
npm ci
npm run build
npm test
npm run test:e2e
npm run docs:build
```

- [ ] `npm run build` — compilação TypeScript sem erros
- [ ] `npm test` — testes unitários Jest
- [ ] `npm run test:e2e` — testes e2e (`sql.js` + Supertest)
- [ ] `npm run docs:build` — build VitePress (opcional: `VITEPRESS_BASE=/infosistema-gestao-frotas-lab/`)

## Documentação publicada

- [ ] GitHub Pages acessível — https://vitorjobs.github.io/infosistema-gestao-frotas-lab/
- [ ] Links internos da VitePress navegam sem erro 404

## Pipeline CI/CD (após merge em `main`)

Conforme `.github/workflows/ci.yml`:

- [ ] Job **Unit tests** concluído com sucesso
- [ ] Job **E2E tests** concluído com sucesso
- [ ] Job **Build documentation** concluído com sucesso
- [ ] Job **Deploy VitePress** concluído (push `main`)
- [ ] Job **Publish Docker image** concluído (push `main`)
- [ ] Imagem disponível em `ghcr.io/<owner>/<repository>:latest`

Referência completa: [CI/CD](/architecture/cicd).

## Comandos ausentes no projeto

| Comando | Status |
|---|---|
| `npm run lint` | Não definido em `package.json` |

## Riscos residuais conhecidos

- Execução local híbrida exige ajuste de hosts no `.env` (`localhost` vs nomes `info_*`)
- Sem `MONGODB_URI`, auditoria permanece desabilitada (comportamento esperado)
- `info_rabbitmq` está no Compose, mas não é consumido pela API atual

**Próximo passo:** [Arquitetura — Visão Geral](/architecture/overview)

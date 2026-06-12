# Documentação - Projeto Gestão de Rotas

Backend da plataforma Aivacol de Gestão de Frota — NestJS, TypeORM, SQL Server, JWT, Redis, Docker, Prometheus, Grafana e auditoria MongoDB.

## Documentação publicada

**https://vitorjobs.github.io/infosistema-gestao-frotas-lab/**

## Roteiro

Siga a documentação nesta ordem (menu lateral):

| Passo | Página | Objetivo |
|---|---|---|
| 1 | [Executar o Projeto](/getting-started/installation) | Subir o stack com Docker Compose |
| 2 | [Configuração](/getting-started/configuration) | Variáveis de ambiente |
| 3 | [Verificação de Portas](/getting-started/ports) | Confirmar portas livres |
| 4 | [Pontos de Acesso](/getting-started/access) | API, Swagger, health e monitoramento |
| 5 | [Autenticação](/usage/authentication) | Login JWT |
| 6 | [Executar Testes](/usage/testing) | Testes unitários e e2e |
| 7 | [Paginação](/usage/pagination) | Convenção de listagens |
| 8 | [Checklist de Validação](/usage/validation-checklist) | Verificação da entrega |
| 9 | [API](/api/auth) | Endpoints |
| 10 | [Arquitetura](/architecture/overview) | Stack, módulos e observabilidade |
| 11 | [CI/CD](/architecture/cicd) | Pipeline GitHub Actions |

## Início rápido

**Recomendado:** subir o projeto inteiro com Docker Compose.

Na raiz do repositório:

```bash
cp .env.example .env
docker compose up -d --build
docker compose ps
```

Aguarde os containers ficarem em execução e siga para [Pontos de Acesso](/getting-started/access).

Execução local (`npm run start:dev` / `npm run start:prod`) é alternativa para desenvolvimento — exige SQL Server acessível e ajuste de hosts no `.env`. Consulte [Executar o Projeto](/getting-started/installation).

## Resumo de acessos

| Serviço | URL |
|---|---|
| API | http://localhost:3001/api |
| Swagger | http://localhost:3001/api/docs |
| Health | http://localhost:3001/api/health |
| Docs (esta página, local) | http://localhost:3003 |
| Grafana | http://localhost:3002 |
| Prometheus | http://localhost:9090 |

Usuário seed da API: `aivacol` / `aivacol`

Detalhes completos em [Pontos de Acesso](/getting-started/access).

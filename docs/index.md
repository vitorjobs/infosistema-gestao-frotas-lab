# gestao_frotas_api

Backend da plataforma Aivacol de Gestão de Frota — NestJS, TypeORM, SQL Server, JWT, Redis, Docker, Prometheus, Grafana e auditoria MongoDB.

## Roteiro

Siga a documentação nesta ordem (menu lateral):

| Passo | Página | Objetivo |
|---|---|---|
| 1 | [Executar o Projeto](/getting-started/installation) | Subir todos os containers com Docker Compose |
| 2 | [Configuração](/getting-started/configuration) | Entender variáveis de ambiente |
| 3 | [Pontos de Acesso](/getting-started/access) | Verificar API, Swagger, health e monitoramento |
| 4 | [Autenticação](/usage/authentication) | Login JWT e consumo das rotas protegidas |
| 5 | [Executar Testes](/usage/testing) | Validar testes unitários e e2e |
| 6 | [Paginação](/usage/pagination) | Convenção de listagens |
| 7 | [API](/api/auth) | Endpoints e regras de negócio |
| 8 | [Arquitetura](/architecture/overview) | Stack, módulos, banco e observabilidade |

## Início rápido

**Recomendado:** subir o projeto inteiro com Docker Compose para testes e avaliação.

Na raiz do repositório:

```bash
cp .env.example .env
docker compose up -d --build
docker compose ps
```

Aguarde todos os containers ficarem em execução e acesse os [pontos de acesso](/getting-started/access).

Execução local (`npm run start:dev` / `npm run start:prod`) é alternativa para desenvolvimento — exige SQL Server acessível e ajuste de hosts no `.env`. Consulte [Executar o Projeto](/getting-started/installation).

## Resumo de acessos

| Serviço | URL |
|---|---|
| API | http://localhost:3001/api |
| Swagger | http://localhost:3001/api/docs |
| Health | http://localhost:3001/api/health |
| Docs (esta página) | http://localhost:3003 |
| Grafana | http://localhost:3002 |

Usuário seed da API: `aivacol` / `aivacol`

Detalhes completos, credenciais e checklist de verificação em [Pontos de Acesso](/getting-started/access).

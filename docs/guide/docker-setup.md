# Execução com Docker

Forma **recomendada** para validar o projeto completo.

## Pré-requisitos

- Docker e Docker Compose
- Portas livres — veja [Ambiente e portas](/guide/environment#portas)

## Subir o stack

```bash
cp .env.example .env
docker compose up -d --build
docker compose ps
```

Migrations rodam automaticamente quando `TYPEORM_MIGRATIONS_RUN=true`.

## Serviços criados

| Container | Função |
|---|---|
| `info_api` | API NestJS (Node 22) |
| `info_sqlserver` | SQL Server |
| `info_redis` | Cache |
| `info_mongodb` | Auditoria HTTP |
| `info_prometheus` | Métricas |
| `info_grafana` | Dashboards |
| `info_docs` | VitePress |
| `info_cadvisor`, `info_redis_exporter`, `info_blackbox` | Exporters |
| `info_rabbitmq` | Reservado (sem uso na API) |

## Comandos úteis

```bash
docker compose logs -f info_api
docker compose down
docker compose down --volumes --remove-orphans
```

## Subconjunto mínimo

```bash
docker compose up -d --build info_sqlserver info_redis info_api
```

## Validar

Após subir, confira URLs em [API](/guide/api#acessos) e o checklist em [Testes](/guide/tests#validacao-funcional).

Próximo: [Execução local](/guide/local-setup) · [Ambiente](/guide/environment)

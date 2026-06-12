# Verificação de Portas

Antes de subir os containers, confirme que as portas abaixo estão livres na máquina responsável pela execução local.

Valores extraídos de `docker-compose.yml` e `.env.example`.

## Mapa de portas

| Serviço | Porta no host | Porta interna | Onde alterar |
|---|---:|---:|---|
| API NestJS (`info_api`) | 3001 | 3001 | `.env` (`APP_PORT`) / `docker-compose.yml` (`info_api.ports`) |
| Grafana (`info_grafana`) | 3002 | 3000 | `docker-compose.yml` (`info_grafana.ports`) |
| VitePress (`info_docs`) | 3003 | 4173 | `docker-compose.yml` (`info_docs.ports`) |
| SQL Server (`info_sqlserver`) | 1433 | 1433 | `.env` (`DATABASE_PORT`) / `docker-compose.yml` |
| Redis (`info_redis`) | 6379 | 6379 | `.env` (`REDIS_PORT`) / `docker-compose.yml` |
| MongoDB (`info_mongodb`) | 27017 | 27017 | `docker-compose.yml` |
| RabbitMQ AMQP (`info_rabbitmq`) | 5672 | 5672 | `docker-compose.yml` |
| RabbitMQ Management | 15672 | 15672 | `docker-compose.yml` |
| Prometheus (`info_prometheus`) | 9090 | 9090 | `docker-compose.yml` |
| cAdvisor (`info_cadvisor`) | 8080 | 8080 | `docker-compose.yml` |
| Redis Exporter (`info_redis_exporter`) | 9121 | 9121 | `docker-compose.yml` |
| Blackbox Exporter (`info_blackbox`) | 9115 | 9115 | `docker-compose.yml` |

## Serviços sem exposição HTTP direta

| Serviço | Observação |
|---|---|
| `info_api` (rede interna) | Outros containers usam `info_api:3001` |
| `info_rabbitmq` | Reservado para evolução futura; a API atual não consome filas |

## Comandos para verificar portas em uso

```bash
sudo lsof -i :3001
sudo lsof -i :3002
sudo lsof -i :3003
sudo lsof -i :1433
sudo lsof -i :6379
sudo lsof -i :27017
sudo lsof -i :5672
sudo lsof -i :15672
sudo lsof -i :9090
sudo lsof -i :8080
sudo lsof -i :9121
sudo lsof -i :9115
```

Alternativa com `ss`:

```bash
ss -tlnp | grep -E '3001|3002|3003|1433|6379|27017|5672|15672|9090|8080|9121|9115'
```

## Execução local sem Docker na API

Se a API rodar no host com infraestrutura no Docker, apenas as portas mapeadas dos serviços de dependência precisam estar acessíveis em `localhost` (1433, 6379, 27017, etc.). A porta da API segue `APP_PORT` no `.env` (padrão `3001`).

**Próximo passo:** [3. Pontos de Acesso](/getting-started/access)

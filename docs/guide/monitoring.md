# Monitoramento

## Acessos

| Ferramenta | URL |
|---|---|
| Prometheus | http://localhost:9090 |
| Grafana | http://localhost:3002 |
| Métricas da API | http://localhost:3001/api/metrics |
| Health | http://localhost:3001/api/health |

Grafana: acesso anônimo habilitado; dashboards provisionados em `docker/grafana/provisioning/`.

## Métricas da API

Endpoint: `GET /api/metrics` (público, formato Prometheus).

| Métrica | Descrição |
|---|---|
| `http_requests_total` | Volume HTTP por rota, método e status |
| `http_request_duration_seconds` | Latência (histograma) |
| `process_*`, `nodejs_*` | CPU, memória e runtime Node |

## Dashboards Grafana (pasta InfoSistemas)

| Dashboard | Foco |
|---|---|
| Infraestrutura — Containers | CPU, memória, targets UP/DOWN |
| API — Performance REST API | Latência, RPS, erros 4xx/5xx por rota |
| API — Saúde Node.js e NestJS | Heap, event loop, GC |
| API — Banco e Dependências | Health, Redis hit ratio, targets |

Config Prometheus: `docker/prometheus.yml` (scrape 15s).

## Validar coleta

```bash
curl -s http://localhost:3001/api/metrics | head -5
curl -s http://localhost:3001/api/health
```

Prometheus **não persiste dados** entre restarts (sem volume configurado no Compose).

## Auditoria (MongoDB)

Logs HTTP opcionais na coleção `http_audit_logs`. Não substitui métricas; consulta direta no MongoDB.

Detalhes operacionais: variáveis `MONGODB_URI` e `AUDIT_ENABLED` em [Ambiente](/guide/environment).

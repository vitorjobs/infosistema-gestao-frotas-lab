# Monitoramento

## Health check

```http
GET /api/health
```

Rota pública (sem JWT). Verifica:

| Indicador | Dependência |
|---|---|
| `database` | SQL Server (TypeORM) quando `DATABASE_ENABLED=true`; reporta desabilitado quando `DATABASE_ENABLED=false` |
| `redis` | Redis |
| `info_mongodb` | MongoDB de auditoria (quando habilitado) |

- `200` — todas as dependências saudáveis
- `503` — alguma dependência falhou

## Métricas Prometheus

```http
GET /api/metrics
```

Rota pública. Retorna métricas em `text/plain` (formato Prometheus), incluindo:

| Métrica | Descrição |
|---|---|
| `http_requests_total` | Contagem de requisições HTTP (`method`, `route`, `status`, `status_class`) |
| `http_request_duration_seconds` | Latência das requisições em histograma (`method`, `route`, `status`, `status_class`, `le`) |
| `process_*` / `nodejs_*` | CPU, memória e runtime Node.js (prom-client default) |

Análise do endpoint `/api/metrics`:

- Formato: Prometheus `text/plain`.
- Endpoint real no projeto: `/api/metrics`.
- Métrica de volume HTTP: `http_requests_total`.
- Métrica de duração HTTP: `http_request_duration_seconds_bucket`, `http_request_duration_seconds_sum`, `http_request_duration_seconds_count`.
- Labels HTTP obrigatórios disponíveis: `route`, `method`, `status` e `status_class`.
- `status_code` nos dashboards mapeia o label real `status`.
- `duration` nos dashboards é calculado a partir do histograma `http_request_duration_seconds`.

## Prometheus (container)

- URL: http://localhost:9090
- Config: `docker/prometheus.yml`
- Intervalo de scrape: 15s

| Job | Target | Finalidade |
|---|---|---|
| `nestjs_app` | `info_api:3001` com `metrics_path: /api/metrics` | API NestJS |
| `info_prometheus` | `info_prometheus:9090` | Self-monitoring |
| `info_cadvisor` | `info_cadvisor:8080` | CPU/memória dos containers |
| `redis` | `info_redis_exporter:9121` | Hits, misses, memória Redis |
| `blackbox_health` | probe em `/api/health` | Disponibilidade do health check |

## Grafana (container)

- URL: http://localhost:3002
- **Acesso direto** — sem login obrigatório e sem troca de senha na primeira visita
- Datasource Prometheus e dashboards são **provisionados automaticamente** via `docker/grafana/provisioning/`

### Dashboards pré-carregados (pasta InfoSistemas)

| Dashboard | Conteúdo |
|---|---|
| **Infraestrutura — Containers** | KPIs (targets UP/DOWN), CPU, memória, rede, rankings e tabela de targets — cada painel com descrição |
| **API — Performance REST API** | Latência, tráfego e erros HTTP por rota, método e statusCode, usando apenas métricas reais da API |
| **API — Saúde Node.js e NestJS** | CPU, memória RSS, heap V8, event loop lag, GC, uptime, handles, requests e recursos ativos |
| **API — Banco de Dados e Dependências** | Health geral, targets Prometheus, Redis, containers de dependências e lista de métricas ausentes recomendadas |

Credenciais admin (opcionais, para API): `admin` / `admin`

Todos os dashboards da API usam janela padrão **Last 5 minutes** (`now-5m` -> `now`) e são versionáveis em:

```text
docker/grafana/provisioning/dashboards/json/
```

Arquivos provisionados atualmente:

- `api-performance-rest-api.json`
- `api-saude-nodejs-nestjs.json`
- `api-banco-dependencias.json`
- `infra-containers.json`

## Métricas disponíveis para observabilidade

| Origem | Métricas | Labels principais |
|---|---|---|
| API NestJS | `http_requests_total` | `job`, `instance`, `method`, `route`, `status`, `status_class` |
| API NestJS | `http_request_duration_seconds_bucket`, `_sum`, `_count` | `job`, `instance`, `method`, `route`, `status`, `status_class`, `le` |
| prom-client default | `process_cpu_seconds_total`, `process_start_time_seconds`, `process_resident_memory_bytes`, `process_virtual_memory_bytes`, `process_heap_bytes` | `job`, `instance` |
| prom-client default | `nodejs_eventloop_lag_*_seconds` | `job`, `instance` |
| prom-client default | `nodejs_heap_size_*_bytes`, `nodejs_heap_space_size_*_bytes` | `job`, `instance`, `space` |
| prom-client default | `nodejs_gc_duration_seconds_*` | `job`, `instance`, `kind` |
| prom-client default | `nodejs_active_handles_total`, `nodejs_active_requests_total`, `nodejs_active_resources_total` | `job`, `instance` |
| Prometheus | `up` | `job`, `instance` |
| Blackbox exporter | `probe_success` | `job`, `instance` |
| Redis exporter | `redis_keyspace_hits_total`, `redis_keyspace_misses_total`, `redis_memory_used_bytes`, `redis_connected_clients` | `job`, `instance` |
| cAdvisor | `container_cpu_usage_seconds_total`, `container_memory_working_set_bytes` | `job`, `instance`, `name` |

Variáveis usadas nos dashboards:

- `job`
- `instance`
- `route`
- `method`
- `status_code` (mapeia o label Prometheus `status`)
- `status_class` (`2xx`, `3xx`, `4xx`, `5xx`)

## Dashboard REST API por Four Golden Signals

O dashboard **API — Performance REST API** aplica o agente `.ia/14-agente-monitoramento-api-nestjs-four-golden-signals.agent.md` para acompanhar a experiência do usuário e a saúde funcional da REST API NestJS.

Ele usa somente métricas reais expostas em `/api/metrics`:

| Sinal | Situação atual | Métricas disponíveis |
|---|---|---|
| Latência dos endpoints | Disponível | `http_request_duration_seconds_bucket`, `_sum`, `_count` por `route`, `method`, `status`, `status_class` |
| Tráfego por endpoint/método | Disponível | `http_requests_total` por `route`, `method`, `status`, `status_class` |
| Erros HTTP 4xx/5xx | Disponível | `http_requests_total` filtrando `status_class=~"4xx|5xx"` |
| Saturação de aplicação | Parcial | runtime Node.js e Redis/exporters; pool TypeORM e rate limiting ainda não expõem métricas |

Painéis do dashboard:

| Painel | Pergunta respondida |
|---|---|
| Requisições no período | Quantas requisições reais a API recebeu no período selecionado |
| RPS atual | Qual é a taxa de tráfego recebida pela API |
| Erros 5xx no período | Quantos erros de servidor ocorreram; retorna `0` quando não houver erro |
| Taxa de erro 4xx/5xx | Qual proporção do tráfego falhou por erro de cliente ou servidor |
| Latência p95/p99 global | Quanto tempo os usuários mais afetados esperaram pela resposta |
| RPS por endpoint e método | Qual endpoint foi chamado e qual método HTTP foi usado |
| Respostas por família de statusCode | A resposta foi `2xx`, `3xx`, `4xx` ou `5xx` |
| Contagem por endpoint, método e statusCode | Qual rota, método e statusCode foram retornados no período |
| Erros por statusCode, rota e método | Quais endpoints/métodos deram erro e com qual código |
| Ranking de endpoints com erro | Quais combinações de rota/método/status mais falharam |
| Taxa de erro por endpoint e método | Quais rotas têm maior proporção de falha |
| Latência p95/p99 por endpoint, método e statusCode | Quais endpoints estão mais lentos por código de resposta |
| Duração média por endpoint, método e statusCode | Qual é o tempo médio de resposta de cada combinação |
| Top endpoints mais lentos p95 | Quais rotas devem ser priorizadas em análise de performance |

Apresentação final das tabelas:

- A coluna `StatusCode` é baseada no label real `status` coletado pela aplicação.
- Apenas a coluna `StatusCode` recebe cor por família HTTP (`2xx`, `3xx`, `4xx`, `5xx`); a linha inteira não é colorida.
- Os painéis `Duração média por endpoint, método e statusCode` e `Top endpoints mais lentos p95` exibem também `Classe de Status`.
- Valores ausentes ou `NaN` são tratados visualmente para não aparecerem como `NaN` nas tabelas.

Não há painel de usuários ativos, payload size, pool TypeORM ou rate limiting porque essas métricas ainda não existem. Os dashboards HTTP experimentais anteriores foram movidos para `.backup/` e não são provisionados atualmente.

### Observação sobre histórico

O `docker-compose.yml` atual monta apenas o arquivo de configuração do Prometheus e **não configura volume persistente para dados do Prometheus** nem retenção explícita. Portanto:

- não afirmar que um painel representa dados "desde a concepção";
- os painéis históricos representam o período selecionado no Grafana e os dados ainda disponíveis no Prometheus;
- após restart sem volume persistente, counters e histórico podem ser perdidos;
- para histórico durável, adicionar volume de dados ao Prometheus e definir política de retenção.

## Métricas ausentes recomendadas

As métricas abaixo **não existem hoje** e não foram inventadas nos dashboards:

- Pool de conexões TypeORM/SQL Server: conexões ativas, ociosas e aguardando.
- Latência de queries SQL por operação e histograma de duração.
- Contadores de falhas de conexão por dependência (`database`, `redis`, `mongodb`, `rabbitmq`).
- Queries lentas, deadlocks e timeouts de banco.
- Métricas Prometheus específicas do MongoDB de auditoria.
- Métricas RabbitMQ consumidas pela aplicação, caso mensageria seja implementada.
- Métricas de logs estruturados e traces distribuídos; recomendação futura: Loki/OpenSearch e OpenTelemetry + Tempo/Jaeger.
- Duração máxima real por requisição; hoje há média, p95 e p99 via histograma, mas não há métrica de máximo exato por rota/método/status.

### Como ler os dashboards ativos

| Dashboard / painel | O que mede | Como interpretar | Ação recomendada |
|---|---|---|---|
| **Infraestrutura — Containers** / KPIs de targets | Disponibilidade de targets Prometheus e estado dos containers | Targets DOWN ou containers com consumo crescente indicam risco operacional | Verificar `docker compose ps`, logs do serviço e recursos da máquina |
| **Infraestrutura — Containers** / CPU, memória e rede | Uso de recursos por container | Picos sustentados podem explicar lentidão, restarts ou falhas no health check | Correlacionar com logs e consumo do container afetado |
| **API — Performance REST API** / Requisições e RPS | Volume e taxa de tráfego HTTP por filtros de rota, método e statusCode | Picos indicam aumento de uso, teste de carga ou chamadas automatizadas | Cruzar com latência p95/p99 e taxa de erro |
| **API — Performance REST API** / Erros 5xx e taxa 4xx/5xx | Falhas percebidas pelo cliente, separando erro de servidor e erro de cliente | `5xx` indica problema interno ou dependência; `4xx` recorrente indica contrato, autenticação ou validação | Ver logs, health de dependências e reproduzir fluxo no Swagger/Postman |
| **API — Performance REST API** / Status por endpoint | Combinações reais de rota, método e statusCode retornadas no período | Mostra se a API está respondendo além de `GET 200`, incluindo `POST`, `PATCH`, `DELETE`, `4xx` e `5xx` quando ocorrerem | Filtrar por rota/status e priorizar endpoints críticos |
| **API — Performance REST API** / Latência p95/p99 | Experiência dos usuários mais afetados por lentidão | p95/p99 alto por rota indica gargalo específico mesmo quando a média parece normal | Investigar serviço, banco, cache e payloads do endpoint afetado |
| **API — Saúde Node.js e NestJS** / CPU do processo | Saturação do processo Node.js | CPU alta sustentada pode indicar processamento síncrono pesado ou carga acima do esperado | Revisar endpoints recentes, cache, validações e gargalos de código |
| **API — Saúde Node.js e NestJS** / Memória e heap | RSS, heap usado e heap total do V8 | Crescimento contínuo do heap usado sugere vazamento ou retenção indevida de objetos | Investigar fluxos recentes, payloads grandes e caches em memória |
| **API — Saúde Node.js e NestJS** / Event loop lag | Atraso p50/p90/p99 do event loop | p99 alto indica bloqueio da thread principal ou GC pesado | Procurar código síncrono, loops custosos, serializações grandes e operações bloqueantes |
| **API — Saúde Node.js e NestJS** / Garbage collection | Duração média de GC por tipo | GC longo impacta latência percebida pelo usuário | Correlacionar com heap, payloads e alocação excessiva |
| **API — Banco de Dados e Dependências** / Health geral | Resultado do probe `/api/health` | Valor 0 indica que a API ou uma dependência crítica falhou no health check | Verificar detalhes do endpoint `/api/health` e logs do backend |
| **API — Banco de Dados e Dependências** / Redis hit ratio | Efetividade do cache Redis | Hit ratio baixo pode indicar cache frio, TTL curto ou invalidação excessiva | Revisar TTL, chaves de cache e padrões de invalidação |
| **API — Banco de Dados e Dependências** / Targets UP/DOWN | Disponibilidade dos jobs Prometheus | Qualquer target DOWN reduz confiança nos painéis dependentes desse job | Corrigir exporter/serviço antes de interpretar métricas dependentes |
| **API — Banco de Dados e Dependências** / Métricas ausentes recomendadas | Lacunas conhecidas de banco e dependências | Itens listados não têm export real hoje e não devem virar painel sem instrumentação | Implementar novos exports somente com autorização |

### Exporters adicionais

| Serviço | Porta host | Função |
|---|---|---|
| info_cadvisor | 8080 | Métricas de containers Docker |
| info_redis_exporter | 9121 | Métricas do Redis |
| info_blackbox | 9115 | Probes HTTP (health) |

## Logs e Traces

| Sinal | Implementação | Visualização |
|---|---|---|
| **Métricas** | Prometheus + prom-client | Grafana (dashboards acima) |
| **Auditoria HTTP** | MongoDB (`http_audit_logs`) | Consulta direta no MongoDB |
| **Logs estruturados** | Não configurado | Melhoria futura — Loki/ELK/OpenSearch |
| **Traces distribuídos** | Não configurado (OTEL) | Melhoria futura — Tempo/Jaeger |

## Auditoria HTTP (MongoDB)

Interceptor global registra interações HTTP relevantes:

- método, rota, status HTTP, usuário, duração
- corpo sanitizado (campos sensíveis mascarados)

Coleção: `http_audit_logs`

Rotas ignoradas: health, metrics, Swagger/docs estáticos.

Desabilitar:

- omitir `MONGODB_URI`, ou
- `AUDIT_ENABLED=false`

# Monitoramento

Como acessar, validar e **interpretar** cada painel Grafana provisionado no projeto.

## Acessos

| Ferramenta | URL | Função |
|---|---|---|
| Grafana | http://localhost:3002 | Dashboards visuais |
| Prometheus | http://localhost:9090 | Consulta bruta de métricas |
| Métricas API | http://localhost:3001/api/metrics | Export Prometheus da aplicação |
| Health | http://localhost:3001/api/health | Status de dependências |

Grafana: acesso anônimo habilitado. Dashboards em `docker/grafana/provisioning/dashboards/json/`. Janela padrão: **Last 5 minutes**.

## Métricas expostas pela API

| Métrica | O que mede |
|---|---|
| `http_requests_total` | Contagem de requisições (`method`, `route`, `status`, `status_class`) |
| `http_request_duration_seconds` | Latência em histograma (p95/p99 no Grafana) |
| `process_*`, `nodejs_*` | CPU, memória, event loop, GC do Node.js |

Jobs Prometheus (`docker/prometheus.yml`): `nestjs_app`, `prometheus`, `cadvisor`, `redis`, `blackbox_health`.

## Como ler os dashboards

Para cada painel abaixo:

- **O que mostra** — dado exibido
- **Como interpretar** — leitura prática
- **Ação sugerida** — próximo passo quando algo estiver errado

Filtros comuns nos dashboards de API: `route`, `method`, `status_code` (label Prometheus `status`), `status_class` (`2xx`–`5xx`).

---

## 1. Infraestrutura — Containers

Arquivo: `infra-containers.json` · Pasta Grafana: **InfoSistemas**

### Visão geral da infraestrutura

| Painel | O que mostra | Como interpretar | Ação sugerida |
|---|---|---|---|
| **Targets saudáveis (UP)** | Jobs Prometheus coletando com sucesso | Deve coincidir com o total de jobs configurados | Se menor que o esperado, abra *Targets Prometheus — detalhe* |
| **Targets indisponíveis (DOWN)** | Jobs com falha de scrape | Zero = saudável; qualquer valor > 0 é alerta | Verifique container/rede do job DOWN |
| **Containers monitorados** | Containers vistos pelo cAdvisor | Reflete serviços Docker ativos no Compose | Compare com `docker compose ps` |
| **Status por job Prometheus** | UP/DOWN por job (API, Prometheus, cAdvisor, Redis, blackbox) | Verde = coleta OK | Reinicie o serviço do job vermelho |

### Recursos por container

| Painel | O que mostra | Como interpretar | Ação sugerida |
|---|---|---|---|
| **CPU por serviço Docker** | Taxa de CPU por container (1.0 = 100% de um core) | Picos sustentados = pressão de processamento | Correlacione com latência da API e logs |
| **Memória por serviço Docker** | RSS por container | SQL Server e MongoDB costumam usar mais RAM | Se `info_api` cresce sem parar, veja dashboard de saúde Node |
| **Ranking de CPU (atual)** | Snapshot de quem mais usa CPU agora | Identifica gargalo imediato | Priorize o container no topo |
| **Ranking de memória (atual)** | Snapshot de quem mais usa RAM | Identifica consumo desproporcional | Avalie limites ou vazamento |

### Rede e targets

| Painel | O que mostra | Como interpretar | Ação sugerida |
|---|---|---|---|
| **Rede por serviço Docker (RX/TX)** | Tráfego de rede por container | Picos podem indicar scrape, consultas ou replicação | Compare com horário de testes de carga |
| **Targets Prometheus — detalhe** | Tabela `job`, `instance`, coluna `up` (1=OK) | Diagnóstico fino de conectividade | Corrija host/porta do target com `up=0` |

---

## 2. API — Performance REST API

Arquivo: `api-performance-rest-api.json` · Métricas reais de `/api/metrics`

### Visão geral da REST API

| Painel | O que mostra | Como interpretar | Ação sugerida |
|---|---|---|---|
| **Requisições no período** | Total HTTP no intervalo selecionado | Volume absoluto de uso | Compare com RPS; picos = teste ou tráfego real |
| **RPS atual** | Requisições/segundo (média no intervalo) | Taxa de carga | RPS alto + latência alta = investigar gargalo |
| **Erros 5xx no período** | Contagem de erros de servidor | Deve ser 0 em operação normal | Ver logs da API e health das dependências |
| **Taxa de erro 4xx/5xx** | % de falhas sobre o total | Separa erro de cliente (4xx) e servidor (5xx) | 4xx recorrente = auth/validação; 5xx = bug ou dependência |
| **Latência p95 global** | 95% das requisições abaixo deste tempo | Experiência da maioria | p95 alto = rota ou dependência lenta |
| **Latência p99 global** | 99% abaixo deste tempo | Piores casos de lentidão | p99 >> p95 = cauda longa ou picos isolados |

### Tráfego

| Painel | O que mostra | Como interpretar | Ação sugerida |
|---|---|---|---|
| **RPS por endpoint e método** | Demanda por rota e verbo HTTP | Mostra quais endpoints são mais usados | Priorize otimização/cache nas rotas no topo |
| **Respostas por família de statusCode** | Distribuição 2xx/3xx/4xx/5xx | Visão de saúde funcional | Aumento de 4xx/5xx = regressão ou uso incorreto |
| **Contagem por endpoint, método e statusCode** | Tabela detalhada de combinações | Responde “quem chamou o quê e recebeu qual status” | Filtre por rota crítica (ex.: login, vehicles) |

### Erros

| Painel | O que mostra | Como interpretar | Ação sugerida |
|---|---|---|---|
| **Erros por statusCode, rota e método** | Série temporal de erros | Quando começou a falhar | Correlacione com deploy ou indisponibilidade de banco |
| **Ranking de endpoints com erro** | Top combinações rota+método+status com erro | Priorização de correção | Corrija a combinação mais frequente primeiro |
| **Taxa de erro por endpoint e método** | Proporção de falha por rota | Endpoint com pouco tráfego mas alta taxa = bug localizado | Reproduza no Swagger/Postman |

### Latência

| Painel | O que mostra | Como interpretar | Ação sugerida |
|---|---|---|---|
| **Latência p95 por endpoint, método e statusCode** | Lentidão por combinação | Identifica rotas críticas para a maioria | Otimize query, cache ou payload |
| **Latência p99 por endpoint, método e statusCode** | Piores casos por rota | Outliers de performance | Investigue N+1, cache miss ou SQL lento |
| **Duração média por endpoint, método e statusCode** | Tempo médio de resposta | Complementa p95/p99 | Média alta com p95 baixo = poucos outliers pesados |
| **Top endpoints mais lentos p95** | Ranking das rotas mais lentas | Fila de otimização | Comece pelo primeiro da lista |

---

## 3. API — Saúde Node.js e NestJS

Arquivo: `api-saude-nodejs-nestjs.json` · Runtime do processo NestJS

| Painel | O que mostra | Como interpretar | Ação sugerida |
|---|---|---|---|
| **Uptime da aplicação** | Tempo desde o start do processo | Reinício recente = crash ou deploy | Verifique `docker compose logs info_api` |
| **CPU do processo** | CPU do Node.js | Alta sustentada = processamento pesado | Correlacione com endpoints ou GC |
| **Memória RSS** | Memória residente total | Crescimento contínuo = possível vazamento | Compare com *Heap usado* e reinícios |
| **Heap usado** | Heap V8 em uso | Pressão quando próximo do heap total | Reduza retenção de objetos ou payloads |
| **Event loop lag p99** | Atraso p99 do event loop | Alto = thread principal bloqueada | Evite código síncrono pesado |
| **Instâncias monitoradas** | Targets `nestjs_app` visíveis | Deve ser ≥ 1 | Se 0, Prometheus não alcança a API |
| **CPU ao longo do tempo** | Série de CPU | Tendência vs pico pontual | Picos isolados podem ser GC ou carga |
| **Memória e heap** | RSS + heap usado + heap total | Evolução conjunta | Heap total subindo sem queda = investigar vazamento |
| **Event loop lag** | p50, p90, p99 do event loop | p99 recorrente alto = problema estrutural | Profile ou reduza trabalho síncrono |
| **Garbage collection** | Duração média de GC por tipo | GC longo = pausas perceptíveis na API | Reduza alocações; correlacione com heap |
| **Heap por espaço V8** | Memória por espaço (old/new) | Old space crescendo = objetos longevos | Revisar caches em memória |
| **Handles, requests e recursos ativos** | Handles/requests ativos | Crescimento contínuo = recursos não liberados | Verifique conexões, timers, streams abertos |

---

## 4. API — Banco de Dados e Dependências

Arquivo: `api-banco-dependencias.json`

### Disponibilidade

| Painel | O que mostra | Como interpretar | Ação sugerida |
|---|---|---|---|
| **Health geral da API** | Resultado do probe `/api/health` (blackbox) | 1 = UP, 0 = DOWN | Se 0, acesse `/api/health` e veja qual dependência falhou |
| **Targets UP / DOWN** | Contagem de targets Prometheus | DOWN > 0 = coleta incompleta | Corrija exporter/serviço antes de confiar nos demais painéis |
| **Status dos targets Prometheus** | Tabela de jobs | Visão consolidada | Mesma ação do painel anterior |

### Redis

| Painel | O que mostra | Como interpretar | Ação sugerida |
|---|---|---|---|
| **Redis hit ratio** | % de acertos no cache | Baixo = cache frio, TTL curto ou invalidação frequente | Revise `REDIS_TTL` e padrão de mutações |
| **Redis hits e misses** | Série de hits vs misses | Misses subindo após deploy = cache repopulando | Normal após restart; persistente = revisar chaves |
| **Redis memória e clientes** | RAM Redis + conexões | Saturação de memória ou muitos clientes | Ajuste TTL ou capacidade do container |

### Containers de dependência

| Painel | O que mostra | Como interpretar | Ação sugerida |
|---|---|---|---|
| **CPU de containers de dependência** | CPU de SQL Server, MongoDB, Redis, RabbitMQ | Gargalo no banco explica latência da API | Otimize query ou escale recurso |
| **Memória de containers de dependência** | RAM dos serviços de dependência | SQL Server/MongoDB com RAM alta = pressão | Monitore junto com latência p95 |
| **Métricas ausentes recomendadas** | Lista de lacunas conhecidas | Itens **sem** export real hoje (pool TypeORM, queries SQL, etc.) | Não trate como falha — são melhorias futuras |

---

## Validar coleta manualmente

```bash
curl -s http://localhost:3001/api/health
curl -s http://localhost:3001/api/metrics | head -10
```

## Limitações

- Prometheus **não persiste histórico** entre restarts (sem volume no Compose).
- Painéis usam apenas métricas existentes — não há pool TypeORM nem latência SQL instrumentada.
- Auditoria MongoDB (`http_audit_logs`) é complementar; consulta direta no MongoDB, não no Grafana.

Variáveis: [Ambiente](/guide/environment) · Arquitetura: [Arquitetura](/guide/architecture)

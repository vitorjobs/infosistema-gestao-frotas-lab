# Visão geral

Backend NestJS para **gestão de frota**: CRUD de marcas, modelos e veículos, consulta de usuários, autenticação JWT e observabilidade integrada.

## Problema que resolve

Centralizar o cadastro e a consulta de veículos de frota com regras de integridade (unicidade, vínculos entre entidades), cache de listagens e rastreabilidade opcional de requisições HTTP.

## Prefixo da API

Todas as rotas HTTP usam o prefixo **`/api`**.

## Estrutura principal (`src/`)

| Módulo | Função |
|---|---|
| `auth` | Login JWT e guards |
| `users` | Consulta de usuários |
| `brands`, `models`, `vehicles` | CRUD de frota |
| `cache` | Redis ou memória |
| `audit` | Logs HTTP em MongoDB (opcional) |
| `metrics` | Health e Prometheus |
| `database` | TypeORM, migrations e seed |

## Próximos passos

- [Tecnologias](/guide/technologies)
- [Funcionalidades](/guide/features)
- [Docker](/guide/docker-setup)

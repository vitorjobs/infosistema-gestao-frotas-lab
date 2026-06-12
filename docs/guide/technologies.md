# Tecnologias

| Camada | Tecnologia |
|---|---|
| Runtime | Node.js 22+ |
| Framework | NestJS 11 |
| ORM | TypeORM |
| Banco principal | SQL Server |
| Autenticação | JWT (Passport) |
| Cache | Redis ou memória |
| Validação | Zod |
| Testes | Jest + Supertest |
| Docs API | Swagger (`/api/docs`) |
| Docs projeto | VitePress |
| Auditoria | MongoDB (opcional) |
| Monitoramento | Prometheus + Grafana |

Dependências externas no Docker Compose: SQL Server, Redis, MongoDB, Prometheus, Grafana e exporters. RabbitMQ está no stack, mas **não é usado** pelo código atual.

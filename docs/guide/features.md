# Funcionalidades

## API REST

- Autenticação JWT (`POST /api/auth/login`)
- CRUD de marcas, modelos e veículos
- Consulta paginada de usuários (sem expor senha)
- Paginação padrão: `?page=1&limit=20` (máx. 100)

## Infraestrutura e qualidade

- Cache Redis nas listagens (ou memória em `npm run start:dev`)
- Health check (`/api/health`) e métricas Prometheus (`/api/metrics`)
- Dashboards Grafana provisionados automaticamente
- Auditoria HTTP opcional em MongoDB (`http_audit_logs`)
- Migrations e seed via TypeORM

## Documentação e testes

- Swagger interativo em `/api/docs`
- Collection Postman em `postman/aivacol-fleet-management.postman_collection.json`
- Testes unitários e e2e com Jest (e2e usa `sql.js`, sem containers)

Detalhes de endpoints: [API](/guide/api) e Swagger.

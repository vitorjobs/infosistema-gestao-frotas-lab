# Banco de dados

SQL Server via TypeORM. Auditoria opcional em MongoDB (separada).

## Entidades

| Tabela | Descrição |
|---|---|
| `usuarios` | Usuários |
| `marcas` | Marcas (1:N modelos) |
| `modelos` | Modelos (N:1 marca opcional, 1:N veículos) |
| `veiculos` | Veículos (N:1 modelo obrigatório) |

Metadados em todas: `created_at`, `updated_at`, `created_by`.

## Comandos

```bash
npm run migration:run
npm run migration:revert
npm run seed
```

Seed: `seed_vehicles.json` (marcas, modelos, veículos).

No Docker, migrations automáticas com `TYPEORM_MIGRATIONS_RUN=true`.

## Integridade (resumo)

- Nomes únicos em marcas e modelos
- Placa, chassi e RENAVAM únicos em veículos
- DELETE bloqueado se houver vínculos dependentes

Auditoria: coleção `http_audit_logs` no MongoDB — ver [Ambiente](/guide/environment).

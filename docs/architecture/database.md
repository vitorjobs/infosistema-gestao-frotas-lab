# Banco de Dados

## Entidades

| Tabela | Descrição | Relacionamentos |
|---|---|---|
| `usuarios` | Usuários da plataforma | — |
| `marcas` | Marcas de veículos | 1:N com `modelos` |
| `modelos` | Modelos de veículos | N:1 com `marcas` (opcional), 1:N com `veiculos` |
| `veiculos` | Veículos da frota | N:1 com `modelos` (obrigatório) |

## Metadados obrigatórios

Todas as entidades de domínio incluem:

- `created_at` — data de criação
- `updated_at` — data de atualização
- `created_by` — usuário responsável pela criação

## Regras de integridade

- `marcas.name` — único
- `modelos.name` — único
- `modelos.brand_id` — opcional; `ON DELETE SET NULL`
- `veiculos.license_plate`, `chassis`, `renavam` — únicos
- Remoção de marca bloqueada se houver modelos vinculados
- Remoção de modelo bloqueada se houver veículos vinculados

## Migrations (ordem)

1. `CreateModelsAndVehicles`
2. `CreateUsersAndBrands`
3. `AddCreatedByToUsers`
4. `RenameTablesToPortuguese`

## Comandos

```bash
npm run migration:run
npm run migration:revert
npm run seed
```

O seed popula marcas, modelos e veículos a partir de `seed_vehicles.json`.

## Auditoria (MongoDB)

Fora do SQL Server — coleção `http_audit_logs` no banco definido por `MONGODB_URI`.

Não é requerida para operação da API relacional.

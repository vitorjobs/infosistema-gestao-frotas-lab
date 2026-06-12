import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { disableDatabase, isDatabaseEnabled } from './config/database-enabled';
import { ensureDatabase } from './database/ensure-database';

const API_DESCRIPTION = [
  'API da plataforma **Aivacol** de Gestão de Frota.',
  '',
  'Collection Postman espelhada: `postman/aivacol-fleet-management.postman_collection.json`',
  '',
  '---',
  '',
  '### Fluxo de uso',
  '',
  '1. Autentique em **`POST /api/auth/login`** (`200`) com usuário seed **`aivacol` / `aivacol`**',
  '2. Envie o header **`Authorization: Bearer <access_token>`** nas rotas protegidas',
  '3. Consuma **users**, **brands**, **models** e **vehicles**',
  '',
  '### Paginação (listagens)',
  '',
  '| Parâmetro | Padrão | Limite |',
  '|---|---|---|',
  '| `page` | `1` | — |',
  '| `limit` | `20` | máx. `100` |',
  '',
  '**Resposta:**',
  '',
  '```json',
  '{',
  '  "data": [],',
  '  "meta": { "total": 0, "page": 1, "limit": 20, "totalPages": 0 }',
  '}',
  '```',
  '',
  '### Regras de negócio',
  '',
  '**Marcas (`brands`)**',
  '- Nome único',
  '- `DELETE` retorna `204`',
  '- `409` se houver modelos vinculados',
  '',
  '**Modelos (`models`)**',
  '- Nome único; `brand_id` opcional',
  '- `DELETE` retorna `204`',
  '- `409` se houver veículos vinculados',
  '',
  '**Veículos (`vehicles`)**',
  '- `model_id` obrigatório',
  '- Placa, chassi e RENAVAM únicos (placa/chassi em maiúsculas)',
  '- Cache Redis nas listagens; invalidação automática em mutações',
  '',
  '**Usuários (`users`)**',
  '- Consulta paginada; não expõe `password_hash`',
  '',
  '**Metadados e validação**',
  '- `created_at`, `updated_at`, `created_by` preenchidos automaticamente',
  '- Validação Zod; erros: `{ success, statusCode, timestamp, path, method, error }`',
  '',
  '### Auditoria (MongoDB)',
  '',
  '- Interceptor global: método, rota, status, usuário, duração e corpo sanitizado',
  '- Coleção **`http_audit_logs`** (banco definido por `MONGODB_URI`, padrão `audit_db`)',
  '- Campos sensíveis mascarados: `password`, `password_hash`, `access_token`, `refresh_token`, `authorization`, `token`',
  '- Desabilitar: `AUDIT_ENABLED=false` ou omitir `MONGODB_URI`',
  '',
  '### Rotas públicas',
  '',
  '| Rota | Descrição |',
  '|---|---|',
  '| `GET /api/health` | SQL Server, Redis e MongoDB |',
  '| `GET /api/metrics` | Métricas Prometheus |',
].join('\n');

async function bootstrap() {
  if (isDatabaseEnabled()) {
    try {
      await ensureDatabase();
    } catch (error) {
      disableDatabase();
      console.warn(
        'SQL Server indisponivel; iniciando API sem modulos dependentes de banco.',
        error instanceof Error ? error.message : error,
      );
    }
  }

  const { AppModule } = await import('./app.module');
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');

  const config = new DocumentBuilder()
    .setTitle('Documentação REST API - Gestão de Rotas')
    .setDescription(API_DESCRIPTION)
    .setVersion('0.1.0')
    .addTag('auth', 'Autenticacao JWT: login (200) e usuario autenticado.')
    .addTag('users', 'Consulta protegida de usuarios (paginada, sem senha).')
    .addTag('brands', 'CRUD protegido de marcas com paginacao e DELETE 204.')
    .addTag('models', 'CRUD protegido de modelos com vinculo opcional de marca.')
    .addTag('vehicles', 'CRUD protegido de veiculos com cache Redis paginado.')
    .addTag('health', 'Health check publico de SQL Server, Redis e MongoDB de auditoria.')
    .addTag('metrics', 'Metricas publicas em formato Prometheus.')
    .addServer('http://localhost:3001', 'Local')
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'access-token')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.APP_PORT ? parseInt(process.env.APP_PORT, 10) : 3001;
  await app.listen(port);
  console.log(`Aplicacao escutando na porta ${port}`);
}

bootstrap();

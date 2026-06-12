import { z } from 'zod';

const booleanString = z.enum(['true', 'false']).optional();

export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  APP_PORT: z.coerce.number().int().positive().default(3001),
  JWT_SECRET: z.string().min(16),
  JWT_EXPIRES_IN: z.string().default('1h'),
  DEFAULT_USER_PASSWORD: z.string().min(1).default('aivacol'),
  DEFAULT_CREATED_BY: z.string().default('aivacol'),
  DATABASE_ENABLED: booleanString,
  DATABASE_HOST: z.string().default('localhost'),
  DATABASE_PORT: z.coerce.number().int().positive().default(1433),
  DATABASE_USER: z.string().default('SA'),
  DATABASE_PASSWORD: z.string().default('YourStrong@Password'),
  DATABASE_NAME: z.string().default('gestao_frotas_api'),
  DATABASE_ENCRYPT: booleanString,
  DATABASE_TRUST_SERVER_CERTIFICATE: booleanString,
  DATABASE_AUTO_CREATE: booleanString,
  DATABASE_CONNECT_RETRIES: z.coerce.number().int().positive().default(10),
  DATABASE_CONNECT_RETRY_DELAY_MS: z.coerce.number().int().positive().default(3000),
  TYPEORM_MIGRATIONS_RUN: booleanString,
  TYPEORM_LOGGING: booleanString,
  REDIS_ENABLED: booleanString,
  USE_MEMORY_CACHE: booleanString,
  REDIS_HOST: z.string().default('redis'),
  REDIS_PORT: z.coerce.number().int().positive().default(6379),
  REDIS_TTL: z.coerce.number().int().nonnegative().default(3600),
  REDIS_URL: z.string().optional(),
  MONGODB_URI: z.string().optional(),
  AUDIT_ENABLED: booleanString,
});

export type EnvConfig = z.infer<typeof envSchema>;

export function validateEnv(config: Record<string, unknown>): EnvConfig {
  const nodeEnv = config.NODE_ENV ?? process.env.NODE_ENV ?? 'development';
  const input = {
    ...config,
    NODE_ENV: nodeEnv,
    JWT_SECRET:
      config.JWT_SECRET ??
      (nodeEnv === 'test' ? 'test-jwt-secret-min-16-chars' : undefined),
  };

  const parsed = envSchema.safeParse(input);
  if (!parsed.success) {
    const details = parsed.error.issues
      .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
      .join('; ');
    throw new Error(`Configuracao de ambiente invalida: ${details}`);
  }

  return parsed.data;
}

import { ConfigService } from '@nestjs/config';

const DEFAULT_CREATED_BY = 'aivacol';
const DEFAULT_CACHE_TTL_SECONDS = 3600;

export function resolveCreatedBy(...candidates: Array<string | undefined>): string {
  const value = candidates.find((candidate) => candidate?.trim());
  return value?.trim() || process.env.DEFAULT_CREATED_BY || DEFAULT_CREATED_BY;
}

export function resolveCreatedByFromConfig(
  config: ConfigService,
  ...candidates: Array<string | undefined>
): string {
  const value = candidates.find((candidate) => candidate?.trim());
  return value?.trim() || config.get<string>('DEFAULT_CREATED_BY', DEFAULT_CREATED_BY);
}

export function getCacheTtlSeconds(config?: ConfigService): number {
  const rawTtl = config?.get<number>('REDIS_TTL') ?? process.env.REDIS_TTL;
  const parsedTtl = rawTtl !== undefined ? Number.parseInt(String(rawTtl), 10) : DEFAULT_CACHE_TTL_SECONDS;
  return Number.isFinite(parsedTtl) && parsedTtl >= 0 ? parsedTtl : DEFAULT_CACHE_TTL_SECONDS;
}

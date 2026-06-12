export function isDatabaseEnabled(): boolean {
  return process.env.DATABASE_ENABLED !== 'false';
}

export function disableDatabase(): void {
  process.env.DATABASE_ENABLED = 'false';
}

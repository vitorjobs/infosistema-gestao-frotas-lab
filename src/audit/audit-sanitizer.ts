const REDACTED_VALUE = '[REDACTED]';

const SENSITIVE_KEYS = new Set([
  'access_token',
  'authorization',
  'password',
  'password_hash',
  'refresh_token',
  'token',
]);

export function sanitizeAuditRequestBody(body: unknown): Record<string, unknown> | undefined {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return undefined;

  return sanitizeAuditValue(body) as Record<string, unknown>;
}

function sanitizeAuditValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => sanitizeAuditValue(item));
  }

  if (!value || typeof value !== 'object') {
    return value;
  }

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(([key, nestedValue]) => [
      key,
      isSensitiveKey(key) ? REDACTED_VALUE : sanitizeAuditValue(nestedValue),
    ]),
  );
}

function isSensitiveKey(key: string): boolean {
  return SENSITIVE_KEYS.has(key.toLowerCase());
}

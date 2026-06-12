export interface AuditLogEntry {
  method: string;
  path: string;
  statusCode: number;
  userId?: number;
  nickname?: string;
  ip?: string;
  userAgent?: string;
  requestBody?: Record<string, unknown>;
  durationMs: number;
  timestamp: Date;
}

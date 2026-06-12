import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Collection, MongoClient } from 'mongodb';
import { AuditLogEntry } from './audit-log.interface';

type AuditDocument = AuditLogEntry & { _id?: unknown };

@Injectable()
export class AuditService implements OnModuleInit, OnModuleDestroy {
  private client?: MongoClient;
  private collection?: Collection<AuditDocument>;
  private enabled = false;

  constructor(private readonly config: ConfigService) {}

  async onModuleInit(): Promise<void> {
    const uri = this.config.get<string>('MONGODB_URI');
    const explicit = this.config.get<string>('AUDIT_ENABLED');
    this.enabled = explicit !== 'false' && Boolean(uri);

    if (!this.enabled || !uri) return;

    try {
      this.client = new MongoClient(uri);
      await this.client.connect();
      const dbName = this.resolveDatabaseName(uri);
      this.collection = this.client.db(dbName).collection<AuditDocument>('http_audit_logs');
      await this.collection.createIndex({ timestamp: -1 });
      await this.collection.createIndex({ path: 1, method: 1 });
      await this.collection.createIndex({ userId: 1, timestamp: -1 });
    } catch {
      this.enabled = false;
      await this.closeClient();
    }
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  async record(entry: Omit<AuditLogEntry, 'timestamp'>): Promise<void> {
    if (!this.collection) return;

    try {
      await this.collection.insertOne({
        ...entry,
        timestamp: new Date(),
      });
    } catch {
      // Falha de auditoria nao deve interromper o fluxo principal.
    }
  }

  async ping(): Promise<boolean> {
    if (!this.enabled) return true;
    if (!this.client) return false;

    try {
      await this.client.db().admin().ping();
      return true;
    } catch {
      return false;
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.closeClient();
  }

  private resolveDatabaseName(uri: string): string {
    try {
      const pathname = new URL(uri).pathname.replace(/^\//, '');
      return pathname || 'audit_db';
    } catch {
      return 'audit_db';
    }
  }

  private async closeClient(): Promise<void> {
    if (!this.client) return;
    await this.client.close().catch(() => undefined);
    this.client = undefined;
    this.collection = undefined;
  }
}

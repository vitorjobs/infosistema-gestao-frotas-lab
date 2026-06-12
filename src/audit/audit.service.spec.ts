import { ConfigService } from '@nestjs/config';
import { MongoClient } from 'mongodb';
import { AuditService } from './audit.service';

const mockConnect = jest.fn();
const mockClose = jest.fn();
const mockCreateIndex = jest.fn();
const mockInsertOne = jest.fn();
const mockPing = jest.fn();
const mockCollection = jest.fn();
const mockDb = jest.fn();

jest.mock('mongodb', () => ({
  MongoClient: jest.fn().mockImplementation(() => ({
    connect: mockConnect,
    close: mockClose,
    db: mockDb,
  })),
}));

describe('AuditService', () => {
  const createService = (values: Record<string, string | undefined>) => {
    const config = {
      get: jest.fn((key: string) => values[key]),
    } as unknown as ConfigService;

    return new AuditService(config);
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockConnect.mockResolvedValue(undefined);
    mockClose.mockResolvedValue(undefined);
    mockCreateIndex.mockResolvedValue('index');
    mockInsertOne.mockResolvedValue({ insertedId: 'audit-id' });
    mockPing.mockResolvedValue({ ok: 1 });
    mockCollection.mockReturnValue({
      createIndex: mockCreateIndex,
      insertOne: mockInsertOne,
    });
    mockDb.mockReturnValue({
      collection: mockCollection,
      admin: () => ({ ping: mockPing }),
    });
  });

  it('fica desabilitado quando AUDIT_ENABLED=false', async () => {
    const service = createService({
      AUDIT_ENABLED: 'false',
      MONGODB_URI: 'mongodb://localhost:27017/audit_db',
    });

    await service.onModuleInit();

    expect(service.isEnabled()).toBe(false);
    expect(MongoClient).not.toHaveBeenCalled();
    await expect(service.ping()).resolves.toBe(true);
  });

  it('fica desabilitado sem MONGODB_URI', async () => {
    const service = createService({
      AUDIT_ENABLED: undefined,
      MONGODB_URI: undefined,
    });

    await service.onModuleInit();

    expect(service.isEnabled()).toBe(false);
  });

  it('fica desabilitado quando AUDIT_ENABLED=true mas MONGODB_URI nao foi informado', async () => {
    const service = createService({
      AUDIT_ENABLED: 'true',
      MONGODB_URI: undefined,
    });

    await service.onModuleInit();

    expect(service.isEnabled()).toBe(false);
    await expect(service.ping()).resolves.toBe(true);
  });

  it('nao lanca erro ao registrar log sem conexao', async () => {
    const service = createService({
      AUDIT_ENABLED: 'false',
      MONGODB_URI: undefined,
    });

    await service.onModuleInit();
    await expect(
      service.record({
        method: 'GET',
        path: '/api/brands',
        statusCode: 200,
        durationMs: 12,
      }),
    ).resolves.toBeUndefined();
  });

  it('conecta no MongoDB, cria indices e registra logs com timestamp', async () => {
    const service = createService({
      AUDIT_ENABLED: 'true',
      MONGODB_URI: 'mongodb://localhost:27017/audit_db',
    });

    await service.onModuleInit();
    await service.record({
      method: 'POST',
      path: '/api/brands',
      statusCode: 201,
      userId: 1,
      nickname: 'aivacol',
      durationMs: 42,
    });

    expect(MongoClient).toHaveBeenCalledWith('mongodb://localhost:27017/audit_db');
    expect(mockConnect).toHaveBeenCalledTimes(1);
    expect(mockCollection).toHaveBeenCalledWith('http_audit_logs');
    expect(mockCreateIndex).toHaveBeenCalledWith({ timestamp: -1 });
    expect(mockCreateIndex).toHaveBeenCalledWith({ path: 1, method: 1 });
    expect(mockCreateIndex).toHaveBeenCalledWith({ userId: 1, timestamp: -1 });
    expect(mockInsertOne).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'POST',
        path: '/api/brands',
        timestamp: expect.any(Date),
      }),
    );
    await expect(service.ping()).resolves.toBe(true);

    await service.onModuleDestroy();
    expect(mockClose).toHaveBeenCalledTimes(1);
  });

  it('desabilita auditoria quando a conexao com MongoDB falha', async () => {
    mockConnect.mockRejectedValueOnce(new Error('mongo down'));
    const service = createService({
      AUDIT_ENABLED: 'true',
      MONGODB_URI: 'mongodb://localhost:27017/audit_db',
    });

    await expect(service.onModuleInit()).resolves.toBeUndefined();

    expect(service.isEnabled()).toBe(false);
    await expect(service.ping()).resolves.toBe(true);
  });
});

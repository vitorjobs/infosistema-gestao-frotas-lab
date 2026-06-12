import * as sql from 'mssql';

const DEFAULT_DATABASE_CONNECT_RETRIES = 10;
const DEFAULT_DATABASE_CONNECT_RETRY_DELAY_MS = 3000;

function databasePort(): number {
  const value = Number.parseInt(process.env.DATABASE_PORT || '1433', 10);
  return Number.isFinite(value) ? value : 1433;
}

function retryAttempts(): number {
  const value = Number.parseInt(
    process.env.DATABASE_CONNECT_RETRIES || `${DEFAULT_DATABASE_CONNECT_RETRIES}`,
    10,
  );
  return Number.isFinite(value) && value > 0 ? value : DEFAULT_DATABASE_CONNECT_RETRIES;
}

function retryDelayMs(): number {
  const value = Number.parseInt(
    process.env.DATABASE_CONNECT_RETRY_DELAY_MS || `${DEFAULT_DATABASE_CONNECT_RETRY_DELAY_MS}`,
    10,
  );
  return Number.isFinite(value) && value > 0 ? value : DEFAULT_DATABASE_CONNECT_RETRY_DELAY_MS;
}

function quoteSqlString(value: string): string {
  return value.replace(/'/g, "''");
}

function quoteIdentifier(value: string): string {
  return value.replace(/]/g, ']]');
}

function sleep(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

export async function ensureDatabase(): Promise<void> {
  if (process.env.DATABASE_AUTO_CREATE === 'false') return;

  const database = process.env.DATABASE_NAME || 'gestao_frotas_api';
  const poolConfig: sql.config = {
    server: process.env.DATABASE_HOST || 'localhost',
    port: databasePort(),
    user: process.env.DATABASE_USER || 'SA',
    password: process.env.DATABASE_PASSWORD || 'YourStrong@Password',
    database: 'master',
    options: {
      encrypt: process.env.DATABASE_ENCRYPT === 'true',
      trustServerCertificate: process.env.DATABASE_TRUST_SERVER_CERTIFICATE !== 'false',
    },
  };

  const attempts = retryAttempts();
  const delayMs = retryDelayMs();
  let lastError: unknown;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    const pool = new sql.ConnectionPool(poolConfig);

    try {
      await pool.connect();
      await pool.request().query(`
        IF DB_ID(N'${quoteSqlString(database)}') IS NULL
        BEGIN
          EXEC(N'CREATE DATABASE [${quoteIdentifier(database)}]')
        END
      `);
      await pool.close();
      return;
    } catch (error) {
      lastError = error;
      await pool.close().catch(() => undefined);

      if (attempt < attempts) {
        await sleep(delayMs);
      }
    }
  }

  throw lastError;
}

import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool, PoolConfig } from 'pg';
import * as schema from './schema.ts';

declare global {
  var _postgresPool: Pool | undefined;
}

export const createPool = (): Pool => {
  if (!global._postgresPool) {
    const connectionString = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL;
    const isRemote = Boolean(
      connectionString ||
      (process.env.SQL_HOST && !['localhost', '127.0.0.1'].includes(process.env.SQL_HOST))
    );

    const poolConfig: PoolConfig = connectionString
      ? {
          connectionString,
          ssl: isRemote ? { rejectUnauthorized: false } : undefined,
          max: 10,
          connectionTimeoutMillis: 15000,
        }
      : {
          host: process.env.SQL_HOST || 'localhost',
          port: Number(process.env.SQL_PORT) || 5432,
          user: process.env.SQL_USER || 'postgres',
          password: process.env.SQL_PASSWORD || 'postgres',
          database: process.env.SQL_DB_NAME || 'postgres',
          ssl: isRemote ? { rejectUnauthorized: false } : undefined,
          max: 10,
          connectionTimeoutMillis: 15000,
        };

    global._postgresPool = new Pool(poolConfig);

    global._postgresPool.on('error', (err) => {
      console.error('Unexpected error on idle SQL pool client:', err);
    });
  }
  return global._postgresPool;
};

export const pool = createPool();
export const db = drizzle(pool, { schema });

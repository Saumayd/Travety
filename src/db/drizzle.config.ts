import { defineConfig } from 'drizzle-kit';
import * as dotenv from 'dotenv';

dotenv.config();

const databaseUrl = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL;
const sqlHost = process.env.SQL_HOST;
const sqlDbName = process.env.SQL_DB_NAME;
const user = process.env.SQL_USER || process.env.SQL_ADMIN_USER;
const password = process.env.SQL_PASSWORD || process.env.SQL_ADMIN_PASSWORD;

const dbCredentials = databaseUrl
  ? {
      url: databaseUrl,
      ssl: true,
    }
  : {
      host: sqlHost || 'localhost',
      port: Number(process.env.SQL_PORT) || 5432,
      user: user || 'postgres',
      password: password || 'postgres',
      database: sqlDbName || 'postgres',
      ssl: false,
    };

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  schemaFilter: ['public'],
  dbCredentials,
  verbose: true,
});

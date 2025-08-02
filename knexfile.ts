import type { Knex } from 'knex';
import dotenv from 'dotenv';

dotenv.config();

const getConnectionConfig = (): string | Knex.StaticConnectionConfig => {
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }
  return {
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    database: process.env.DB_NAME || 'demo_credit',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    charset: 'utf8mb4',
  } as Knex.StaticConnectionConfig;
};

const config: { [key: string]: Knex.Config } = {
  development: {
    client: 'mysql2',
    connection: getConnectionConfig(),
    migrations: {
      directory: './src/database/migrations',
      extension: 'ts',
    },
    seeds: {
      directory: './src/database/seeds',
    },
  },

  staging: {
    client: 'mysql2',
    connection: getConnectionConfig(),
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      tableName: 'knex_migrations',
      directory: './src/database/migrations',
      extension: 'js',
    },
    seeds: {
      directory: './src/database/seeds',
    },
  },

  production: {
    client: 'mysql2',
    connection: getConnectionConfig(),
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      tableName: 'knex_migrations',
      directory: './src/database/migrations',
      extension: 'js',
    },
    seeds: {
      directory: './src/database/seeds',
    },
  },
};

export default config;

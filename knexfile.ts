import type { Knex } from 'knex';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Database configuration type
 */
interface DbConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
  supportBigNumbers: boolean;
  bigNumberStrings: boolean;
}

/**
 * Get database configuration from environment variables
 */
function getDbConfig(): DbConfig {
  const requiredEnvVars = ['DB_HOST', 'DB_PORT', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      throw new Error(`Missing required environment variable: ${envVar}`);
    }
  }

  return {
    host: process.env.DB_HOST!,
    port: parseInt(process.env.DB_PORT!, 10),
    user: process.env.DB_USER!,
    password: process.env.DB_PASSWORD!,
    database: process.env.DB_NAME!,
    supportBigNumbers: true,
    bigNumberStrings: true,
  };
}

const dbConfig = getDbConfig();

const config: Record<string, Knex.Config> = {
  development: {
    client: 'mysql2',
    connection: {
      ...dbConfig,
      typeCast: (
        field: { type: string; length: number; string: () => string },
        next: () => unknown
      ) => {
        if (field.type === 'TINY' && field.length === 1) {
          return field.string() === '1';
        }
        return next();
      },
    } as Knex.MySql2ConnectionConfig,
    migrations: {
      tableName: 'knex_migrations',
      directory: './src/database/migrations',
      extension: 'ts',
    },
    seeds: {
      directory: './src/database/seeds',
    },
  },
  production: {
    client: 'mysql2',
    connection: {
      host: process.env.DB_HOST as string,
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USER as string,
      password: process.env.DB_PASSWORD as string,
      database: process.env.DB_NAME as string,
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      tableName: 'knex_migrations',
      directory: './src/database/migrations',
    },
  },
};

// Use module.exports for Knex
export default config;

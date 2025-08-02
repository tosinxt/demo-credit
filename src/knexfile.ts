import type { Knex } from 'knex';
import * as dotenv from 'dotenv';
import path from 'path';

// Get __dirname equivalent in CommonJS
const __dirname = path.resolve();

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
  // For production, we might have a connection string
  if (process.env.NODE_ENV === 'production' && process.env.DATABASE_URL) {
    const url = new URL(process.env.DATABASE_URL);
    return {
      host: url.hostname,
      port: parseInt(url.port, 10) || 3306,
      user: url.username,
      password: url.password || '',
      database: url.pathname.replace(/^\//, ''),
      supportBigNumbers: true,
      bigNumberStrings: true,
    };
  }

  // For development or when using individual env vars
  const requiredEnvVars = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      throw new Error(`Missing required environment variable: ${envVar}`);
    }
  }

  return {
    host: process.env.DB_HOST!,
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER!,
    password: process.env.DB_PASSWORD!,
    database: process.env.DB_NAME!,
    supportBigNumbers: true,
    bigNumberStrings: true,
  };
}

const dbConfig = getDbConfig();

const baseConfig: Knex.Config = {
  client: 'mysql2',
  connection: {
    ...dbConfig,
    ssl: false, // Explicitly disable SSL
    // Add additional connection options
    flags: ['-NO_SSL'], // Tell MySQL client not to use SSL
    // Force protocol to TCP (some MySQL servers require this)
    socketPath: undefined,
    // Add connection timeout
    connectTimeout: 60000,
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
    directory: path.join(__dirname, 'database/migrations'),
    extension: 'ts',
  },
  seeds: {
    directory: path.join(__dirname, 'database/seeds'),
  },
};

const config: Record<string, Knex.Config> = {
  development: {
    ...baseConfig,
  },
  production: {
    ...baseConfig,
    connection: {
      ...baseConfig.connection,
      // Ensure SSL is explicitly disabled in production
      ssl: false,
      // Force disable SSL flags
      flags: ['-NO_SSL'],
      // Ensure socket path is not used
      socketPath: undefined,
      // Add any production-specific connection options here
      ...(process.env.DATABASE_URL && {
        // Parse DATABASE_URL if provided
        ...(process.env.DATABASE_URL ? {
          host: new URL(process.env.DATABASE_URL).hostname,
          port: parseInt(new URL(process.env.DATABASE_URL).port || '3306', 10),
          user: new URL(process.env.DATABASE_URL).username,
          password: new URL(process.env.DATABASE_URL).password || '',
          database: new URL(process.env.DATABASE_URL).pathname.replace(/^\//, '')
        } : {})
      }),
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      tableName: 'knex_migrations',
      directory: path.join(__dirname, 'database/migrations'),
      extension: 'js',
    },
    seeds: {
      directory: path.join(__dirname, 'database/seeds'),
    },
  },
};

export default config;

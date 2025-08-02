import knex, { Knex } from 'knex';
import config from '../knexfile.js';

// Type guard to check if environment is a valid key of config
type Environment = keyof typeof config;
const isEnvironment = (env: unknown): env is Environment => {
  if (typeof env !== 'string') return false;
  return Object.keys(config as Record<string, unknown>).includes(env);
};

// Get environment from NODE_ENV or default to 'development'
const environment = ((): Environment => {
  const env = process.env.NODE_ENV || 'development';
  if (!isEnvironment(env)) {
    console.warn(`Invalid NODE_ENV: ${String(env)}. Defaulting to 'development'`);
    return 'development';
  }
  return env as Environment;
})();

// Get database configuration
const dbConfig = config[environment];

if (!dbConfig) {
  throw new Error(`No database configuration found for environment: ${String(environment)}`);
}

// Helper function to safely get connection config
const getConnectionConfig = (): Knex.StaticConnectionConfig => {
  const connection = dbConfig.connection || {};
  const safeConnection: Record<string, unknown> = {};

  // Convert any symbol values to strings
  Object.entries(connection).forEach(([key, value]) => {
    safeConnection[key] = typeof value === 'symbol' ? String(value) : value;
  });

  // Add SSL configuration for production
  if (process.env.NODE_ENV === 'production') {
    safeConnection.ssl = { rejectUnauthorized: false };
  }

  return safeConnection as Knex.StaticConnectionConfig;
};

// Create Knex instance
const db: Knex = knex({
  ...dbConfig,
  connection: getConnectionConfig(),
  // Add connection pool configuration
  pool: {
    min: Number(process.env.DB_POOL_MIN) || 2,
    max: Number(process.env.DB_POOL_MAX) || 10,
    // Acquire promises are rejected after this many milliseconds
    acquireTimeoutMillis: 60000,
    // Create operations are cancelled after this many milliseconds
    createTimeoutMillis: 30000,
    // Idle connections timeout, in milliseconds
    idleTimeoutMillis: 600000,
    // How often to check for idle connections (in milliseconds)
    reapIntervalMillis: 1000,
  },
  // Enable debug logging in development
  debug: process.env.NODE_ENV === 'development',
  // Log SQL queries in development
  log: {
    warn: (message: string) => console.warn(`[Knex WARN] ${message}`),
    error: (message: string) => console.error(`[Knex ERROR] ${message}`),
    deprecate: (method: string, alternative: string) => {
      console.warn(`[Knex DEPRECATED] ${method} is deprecated, use ${alternative} instead`);
    },
    enableColors: true,
    debug: (message: string) => {
      if (process.env.NODE_ENV === 'development') {
        console.debug(`[Knex DEBUG] ${message}`);
      }
    },
  },
});

// Test the database connection
const testConnection = async (): Promise<boolean> => {
  try {
    await db.raw('SELECT 1');
    console.log('✅ Database connection established successfully');
    return true;
  } catch (error) {
    console.error('❌ Failed to establish database connection:', error);
    // Don't throw here to allow the application to start
    // The first actual query will fail if the connection is not available
    return false;
  }
};

// Test connection on startup
if (process.env.NODE_ENV !== 'test') {
  testConnection().catch(console.error);
}

// Handle process termination
export const closeConnection = async (): Promise<void> => {
  try {
    await db.destroy();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error closing database connection:', error);
    throw error;
  }
};

// Handle process termination
process.on('SIGTERM', closeConnection);
process.on('SIGINT', closeConnection);

export default db;

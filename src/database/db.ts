import knex, { Knex } from 'knex';
import config from '../../knexfile';

const environment = (process.env.NODE_ENV as keyof typeof config) || 'development';
const dbConfig = config[environment];

if (!dbConfig) {
  throw new Error(`No database configuration found for environment: ${environment}`);
}

const db: Knex = knex(dbConfig);

export default db;

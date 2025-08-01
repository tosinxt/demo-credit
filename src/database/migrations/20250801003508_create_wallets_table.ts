import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('wallets', (table) => {
    table.increments('id').primary();
    table.integer('user_id').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.decimal('balance', 15, 2).defaultTo(0).notNullable();
    table.string('currency', 3).defaultTo('NGN').notNullable();
    table.timestamps(true, true);
    
    // Ensure one wallet per user per currency
    table.unique(['user_id', 'currency']);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists('wallets');
}


import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('transactions', (table) => {
    table.increments('id').primary();
    table.integer('from_wallet_id').unsigned().notNullable();
    table.integer('to_wallet_id').unsigned().notNullable();
    table.decimal('amount', 15, 2).notNullable();
    table.string('currency', 3).notNullable();
    table.string('description', 255).nullable();
    table.enum('status', ['pending', 'completed', 'failed']).defaultTo('pending');
    table.timestamps(true, true);

    // Foreign keys
    table.foreign('from_wallet_id').references('id').inTable('wallets').onDelete('RESTRICT');
    table.foreign('to_wallet_id').references('id').inTable('wallets').onDelete('RESTRICT');

    // Indexes
    table.index(['from_wallet_id', 'to_wallet_id', 'status']);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists('transactions');
}

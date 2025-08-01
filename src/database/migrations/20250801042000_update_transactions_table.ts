import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // First, drop the foreign key constraint
  await knex.schema.alterTable('transactions', (table) => {
    table.dropForeign(['to_wallet_id']);
  });

  // Then modify the column to allow null
  await knex.schema.alterTable('transactions', (table) => {
    table.integer('to_wallet_id').unsigned().nullable().alter();
  });

  // Re-add the foreign key constraint
  await knex.schema.alterTable('transactions', (table) => {
    table.foreign('to_wallet_id').references('id').inTable('wallets').onDelete('RESTRICT');
  });
}

export async function down(knex: Knex): Promise<void> {
  // First, drop the foreign key constraint
  await knex.schema.alterTable('transactions', (table) => {
    table.dropForeign(['to_wallet_id']);
  });

  // Make the column not nullable again
  await knex.schema.alterTable('transactions', (table) => {
    table.integer('to_wallet_id').unsigned().notNullable().alter();
  });

  // Re-add the foreign key constraint
  await knex.schema.alterTable('transactions', (table) => {
    table.foreign('to_wallet_id').references('id').inTable('wallets').onDelete('RESTRICT');
  });
}

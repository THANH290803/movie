// MySQL DDL commits implicitly, so a migration transaction cannot roll it back.
exports.config = { transaction: false }

exports.up = async function up(knex) {
  await knex.schema.createTable('auth_sessions', (table) => {
    table.engine('InnoDB')
    table.charset('utf8mb4')
    table.collate('utf8mb4_unicode_ci')
    table.string('id', 36).primary()
    table.bigInteger('user_id').unsigned().notNullable()
      .references('id').inTable('users').onDelete('CASCADE')
    table.string('refresh_token_hash', 64).notNullable().unique()
    table.datetime('expires_at', { precision: 3 }).notNullable()
    table.datetime('revoked_at', { precision: 3 }).nullable()
    table.datetime('created_at', { precision: 3 }).notNullable().defaultTo(knex.fn.now(3))
    table.datetime('last_used_at', { precision: 3 }).nullable()
    table.index(['user_id', 'revoked_at', 'expires_at'], 'auth_sessions_user_active_index')
  })
}

exports.down = async function down(knex) {
  await knex.schema.dropTable('auth_sessions')
}

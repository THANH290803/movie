const TITLE_STATUSES = ['draft', 'scheduled', 'published', 'archived']
const PERSON_ROLES = ['director', 'actor']

// MySQL DDL commits implicitly, so a migration transaction cannot roll it back.
exports.config = { transaction: false }

function configureTable(table) {
  table.engine('InnoDB')
  table.charset('utf8mb4')
  table.collate('utf8mb4_unicode_ci')
}

function createdAt(table, knex) {
  table.datetime('created_at', { precision: 3 }).notNullable().defaultTo(knex.fn.now(3))
}

function updatedAt(table, knex) {
  table.datetime('updated_at', { precision: 3 }).notNullable().defaultTo(knex.fn.now(3))
}

exports.up = async function up(knex) {
  await knex.schema.createTable('users', (table) => {
    configureTable(table)
    table.bigIncrements('id')
    table.string('full_name', 100).notNullable()
    table.string('email', 255).notNullable().unique()
    table.string('slug', 100).notNullable().unique()
    table.string('password_hash', 255).nullable()
    table.enu('role', ['viewer', 'editor', 'admin']).notNullable().defaultTo('viewer')
    table.enu('plan_code', ['free', 'premium']).notNullable().defaultTo('free')
    table.enu('status', ['invited', 'active', 'suspended']).notNullable().defaultTo('invited')
    createdAt(table, knex)
    updatedAt(table, knex)
    table.datetime('last_login_at', { precision: 3 }).nullable()
    table.datetime('deleted_at', { precision: 3 }).nullable()
  })

  await knex.schema.createTable('media_assets', (table) => {
    configureTable(table)
    table.bigIncrements('id')
    table.enu('asset_kind', ['poster', 'backdrop', 'thumbnail', 'video', 'subtitle']).notNullable()
    table.string('storage_key', 512).notNullable().unique()
    table.string('mime_type', 100).notNullable()
    table.bigInteger('size_bytes').unsigned().nullable()
    table.enu('processing_status', ['uploaded', 'ready', 'failed']).notNullable().defaultTo('uploaded')
    table.bigInteger('created_by_user_id').unsigned().nullable()
      .references('id').inTable('users').onDelete('SET NULL')
    createdAt(table, knex)
  })

  await knex.schema.createTable('genres', (table) => {
    configureTable(table)
    table.bigIncrements('id')
    table.string('name', 100).notNullable()
    table.string('normalized_name', 100).notNullable().unique()
    table.text('description').nullable()
    table.boolean('is_active').notNullable().defaultTo(true)
    createdAt(table, knex)
    updatedAt(table, knex)
  })

  await knex.schema.createTable('people', (table) => {
    configureTable(table)
    table.bigIncrements('id')
    table.string('name', 100).notNullable()
    table.string('normalized_name', 100).notNullable().unique()
    table.string('country', 100).nullable()
    table.text('biography').nullable()
    table.boolean('is_active').notNullable().defaultTo(true)
    createdAt(table, knex)
    updatedAt(table, knex)
  })

  await knex.schema.createTable('person_roles', (table) => {
    configureTable(table)
    table.bigInteger('person_id').unsigned().notNullable()
    table.enu('role', PERSON_ROLES).notNullable()
    table.primary(['person_id', 'role'])
    table.foreign('person_id').references('id').inTable('people').onDelete('CASCADE')
  })

  await knex.schema.createTable('titles', (table) => {
    configureTable(table)
    table.bigIncrements('id')
    table.enu('kind', ['movie', 'series']).notNullable()
    table.string('name', 255).notNullable()
    table.string('original_name', 255).nullable()
    table.string('slug', 255).notNullable().unique()
    table.specificType('release_year', 'smallint unsigned').nullable()
    table.text('synopsis').nullable()
    table.decimal('editorial_rating', 3, 1).nullable()
    table.enu('status', TITLE_STATUSES).notNullable().defaultTo('draft')
    table.datetime('scheduled_at', { precision: 3 }).nullable()
    table.datetime('published_at', { precision: 3 }).nullable()
    table.bigInteger('poster_asset_id').unsigned().nullable()
      .references('id').inTable('media_assets').onDelete('RESTRICT')
    table.bigInteger('backdrop_asset_id').unsigned().nullable()
      .references('id').inTable('media_assets').onDelete('RESTRICT')
    table.bigInteger('created_by_user_id').unsigned().nullable()
      .references('id').inTable('users').onDelete('SET NULL')
    table.bigInteger('updated_by_user_id').unsigned().nullable()
      .references('id').inTable('users').onDelete('SET NULL')
    createdAt(table, knex)
    updatedAt(table, knex)
    table.datetime('deleted_at', { precision: 3 }).nullable()
    table.check('editorial_rating IS NULL OR (editorial_rating >= 0 AND editorial_rating <= 10)', undefined, 'titles_editorial_rating_check')
    table.index(['status', 'kind', 'published_at'], 'titles_publication_index')
  })

  await knex.schema.createTable('title_genres', (table) => {
    configureTable(table)
    table.bigInteger('title_id').unsigned().notNullable()
    table.bigInteger('genre_id').unsigned().notNullable()
    table.primary(['title_id', 'genre_id'])
    table.foreign('title_id').references('id').inTable('titles').onDelete('CASCADE')
    table.foreign('genre_id').references('id').inTable('genres').onDelete('RESTRICT')
  })

  await knex.schema.createTable('title_people', (table) => {
    configureTable(table)
    table.bigInteger('title_id').unsigned().notNullable()
    table.bigInteger('person_id').unsigned().notNullable()
    table.enu('role', PERSON_ROLES).notNullable()
    table.specificType('credit_order', 'smallint unsigned').nullable()
    table.string('character_name', 150).nullable()
    table.primary(['title_id', 'person_id', 'role'])
    table.foreign('title_id').references('id').inTable('titles').onDelete('CASCADE')
    table.foreign(['person_id', 'role']).references(['person_id', 'role'])
      .inTable('person_roles').onDelete('RESTRICT')
  })

  await knex.schema.createTable('seasons', (table) => {
    configureTable(table)
    table.bigIncrements('id')
    table.bigInteger('title_id').unsigned().notNullable()
      .references('id').inTable('titles').onDelete('RESTRICT')
    table.specificType('season_number', 'smallint unsigned').notNullable()
    table.string('name', 150).notNullable()
    table.boolean('is_implicit').notNullable().defaultTo(false)
    createdAt(table, knex)
    updatedAt(table, knex)
    table.unique(['title_id', 'season_number'])
  })

  await knex.schema.createTable('episodes', (table) => {
    configureTable(table)
    table.bigIncrements('id')
    table.bigInteger('season_id').unsigned().notNullable()
      .references('id').inTable('seasons').onDelete('RESTRICT')
    table.specificType('episode_number', 'smallint unsigned').notNullable()
    table.string('slug', 255).notNullable().unique()
    table.string('name', 255).notNullable()
    table.text('synopsis').nullable()
    table.integer('duration_seconds').unsigned().nullable()
    table.enu('status', TITLE_STATUSES).notNullable().defaultTo('draft')
    table.datetime('scheduled_at', { precision: 3 }).nullable()
    table.datetime('published_at', { precision: 3 }).nullable()
    table.bigInteger('thumbnail_asset_id').unsigned().nullable()
      .references('id').inTable('media_assets').onDelete('RESTRICT')
    createdAt(table, knex)
    updatedAt(table, knex)
    table.unique(['season_id', 'episode_number'])
    table.index(['season_id', 'status', 'episode_number'], 'episodes_season_status_order_index')
  })

  await knex.schema.createTable('episode_sources', (table) => {
    configureTable(table)
    table.bigIncrements('id')
    table.bigInteger('episode_id').unsigned().notNullable()
      .references('id').inTable('episodes').onDelete('RESTRICT')
    table.enu('source_kind', ['uploaded', 'external']).notNullable()
    table.bigInteger('media_asset_id').unsigned().nullable()
      .references('id').inTable('media_assets').onDelete('RESTRICT')
    table.string('playback_url', 2048).nullable()
    table.enu('format', ['mp4', 'webm', 'hls', 'dash']).notNullable()
    table.specificType('priority', 'smallint unsigned').notNullable()
    table.boolean('is_active').notNullable().defaultTo(true)
    createdAt(table, knex)
    table.unique(['episode_id', 'priority'])
    table.index(['episode_id', 'is_active', 'priority'], 'episode_sources_playback_index')
  })

  await knex.schema.createTable('episode_subtitles', (table) => {
    configureTable(table)
    table.bigIncrements('id')
    table.bigInteger('episode_id').unsigned().notNullable()
      .references('id').inTable('episodes').onDelete('RESTRICT')
    table.string('language_code', 10).notNullable()
    table.string('label', 50).notNullable()
    table.enu('format', ['vtt', 'srt']).notNullable()
    table.bigInteger('media_asset_id').unsigned().nullable()
      .references('id').inTable('media_assets').onDelete('RESTRICT')
    table.string('subtitle_url', 2048).nullable()
    table.boolean('is_default').notNullable().defaultTo(false)
    createdAt(table, knex)
    table.unique(['episode_id', 'language_code', 'label'], 'episode_subtitles_language_label_unique')
    table.index(['episode_id', 'is_default'], 'episode_subtitles_default_index')
  })

  await knex.schema.createTable('saved_titles', (table) => {
    configureTable(table)
    table.bigInteger('user_id').unsigned().notNullable()
    table.bigInteger('title_id').unsigned().notNullable()
    createdAt(table, knex)
    table.primary(['user_id', 'title_id'])
    table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE')
    table.foreign('title_id').references('id').inTable('titles').onDelete('RESTRICT')
  })
}

exports.down = async function down(knex) {
  await knex.schema.dropTable('saved_titles')
  await knex.schema.dropTable('episode_subtitles')
  await knex.schema.dropTable('episode_sources')
  await knex.schema.dropTable('episodes')
  await knex.schema.dropTable('seasons')
  await knex.schema.dropTable('title_people')
  await knex.schema.dropTable('title_genres')
  await knex.schema.dropTable('titles')
  await knex.schema.dropTable('person_roles')
  await knex.schema.dropTable('people')
  await knex.schema.dropTable('genres')
  await knex.schema.dropTable('media_assets')
  await knex.schema.dropTable('users')
}

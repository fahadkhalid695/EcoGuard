exports.up = function(knex) {
  return knex.schema.createTable('users', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('email').unique().notNullable();
    table.string('password_hash').notNullable();
    table.string('first_name').notNullable();
    table.string('last_name').notNullable();
    table.string('organization');
    table.string('role').defaultTo('user'); // user, admin, super_admin
    table.boolean('is_active').defaultTo(true);
    table.boolean('email_verified').defaultTo(false);
    table.string('verification_token');
    table.string('reset_token');
    table.timestamp('reset_token_expires');
    table.timestamp('last_login');
    table.json('preferences').defaultTo('{}');
    table.timestamps(true, true);
    
    // Indexes
    table.index('email');
    table.index('role');
    table.index('is_active');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('users');
};
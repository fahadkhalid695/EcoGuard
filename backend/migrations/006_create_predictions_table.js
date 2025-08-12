exports.up = function(knex) {
  return knex.schema.createTable('predictions', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('model_id').references('id').inTable('ai_models').onDelete('CASCADE');
    table.uuid('sensor_id').references('id').inTable('sensors').onDelete('CASCADE');
    table.string('prediction_type').notNullable();
    table.json('prediction_data').notNullable();
    table.decimal('confidence', 5, 4); // 0.0000 to 1.0000
    table.timestamp('timestamp').notNullable();
    table.timestamp('valid_until');
    table.boolean('is_active').defaultTo(true);
    table.json('metadata').defaultTo('{}');
    table.timestamps(true, true);
    
    // Indexes
    table.index('model_id');
    table.index('sensor_id');
    table.index('prediction_type');
    table.index('timestamp');
    table.index('valid_until');
    table.index('is_active');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('predictions');
};
exports.up = function(knex) {
  return knex.schema.createTable('ai_models', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('name').notNullable();
    table.string('type').notNullable(); // predictive_maintenance, anomaly_detection, pattern_recognition, optimization
    table.decimal('accuracy', 5, 4); // 0.0000 to 1.0000
    table.timestamp('last_training');
    table.string('status').defaultTo('inactive'); // active, training, inactive
    table.json('configuration').defaultTo('{}');
    table.json('metrics').defaultTo('{}');
    table.text('description');
    table.timestamps(true, true);
    
    // Indexes
    table.index('type');
    table.index('status');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('ai_models');
};
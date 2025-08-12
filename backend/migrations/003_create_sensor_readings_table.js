exports.up = function(knex) {
  return knex.schema.createTable('sensor_readings', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('sensor_id').references('id').inTable('sensors').onDelete('CASCADE');
    table.timestamp('timestamp').notNullable();
    table.decimal('value', 10, 4).notNullable();
    table.string('unit').notNullable();
    table.string('quality').defaultTo('good'); // excellent, good, moderate, poor
    table.decimal('location_lat', 10, 8);
    table.decimal('location_lng', 11, 8);
    table.string('location_name');
    table.json('metadata').defaultTo('{}');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    
    // Indexes for time-series queries
    table.index('sensor_id');
    table.index('timestamp');
    table.index(['sensor_id', 'timestamp']);
    table.index('quality');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('sensor_readings');
};
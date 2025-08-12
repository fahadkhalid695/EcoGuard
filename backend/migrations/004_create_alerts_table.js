exports.up = function(knex) {
  return knex.schema.createTable('alerts', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('sensor_id').references('id').inTable('sensors').onDelete('CASCADE');
    table.string('alert_type').notNullable(); // threshold, anomaly, maintenance, connectivity
    table.string('severity').notNullable(); // low, medium, high, critical
    table.text('message').notNullable();
    table.timestamp('timestamp').notNullable();
    table.boolean('acknowledged').defaultTo(false);
    table.uuid('acknowledged_by').references('id').inTable('users');
    table.timestamp('acknowledged_at');
    table.timestamp('resolved_at');
    table.json('metadata').defaultTo('{}');
    table.timestamps(true, true);
    
    // Indexes
    table.index('sensor_id');
    table.index('alert_type');
    table.index('severity');
    table.index('acknowledged');
    table.index('timestamp');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('alerts');
};
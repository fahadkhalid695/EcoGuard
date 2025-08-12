exports.up = function(knex) {
  return knex.schema.createTable('sensors', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('device_id').unique().notNullable();
    table.string('name').notNullable();
    table.string('sensor_type').notNullable(); // temperature, humidity, co2, etc.
    table.string('connection_type').notNullable(); // wifi, lorawan, bluetooth, cellular
    table.decimal('location_lat', 10, 8);
    table.decimal('location_lng', 11, 8);
    table.string('location_name');
    table.string('status').defaultTo('offline'); // online, offline, maintenance
    table.integer('battery_level');
    table.timestamp('calibration_date');
    table.timestamp('next_maintenance_date');
    table.json('configuration').defaultTo('{}');
    table.json('metadata').defaultTo('{}');
    table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.timestamps(true, true);
    
    // Indexes
    table.index('device_id');
    table.index('sensor_type');
    table.index('status');
    table.index('user_id');
    table.index(['location_lat', 'location_lng']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('sensors');
};
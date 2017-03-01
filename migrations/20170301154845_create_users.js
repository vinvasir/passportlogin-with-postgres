
exports.up = function(knex, Promise) {
  return Promise.all([
  	knex.schema.createTable('users', table => {
  		table.increments('id').primary();
  		table.string('name');
  		table.string('username');
  		table.string('email');
  		table.string('password');
  	})
	]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
  	knex.schema.dropTable('users')
	]);
};

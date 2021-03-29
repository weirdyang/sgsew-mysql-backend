const mysql = require('mysql');
const config = require('../config/index');

const connection = function mySqlConnection() {
  const pool = mysql.createPool({
    connectionLimit: 100,
    host: config.database.host,
    port: config.database.port,
    user: config.database.user,
    password: config.database.password,
    database: config.database.databaseName,
  });

  const getConnection = (callback) => pool.getConnection((err, conn) => {
    if (err) {
      return callback(err, null);
    }

    return callback(null, conn);
  });
  return {
    getConnection,
  };
};

module.exports = connection();

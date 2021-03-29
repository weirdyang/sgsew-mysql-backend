const debug = require('debug')('app:options.data');
const connection = require('./mysql.data');

function ObjToArray(obj) {
  const arr = obj instanceof Array;

  return (arr ? obj : Object.keys(obj)).map((i) => {
    const val = arr ? i : obj[i];
    if (typeof val === 'object') { return ObjToArray(val); }
    return val;
  });
}
const performQuery = (conn, query, params, reject, resolve) => {
  conn.query(query, params, (connErr, results, fields) => {
    if (connErr) {
      reject(connErr);
    }
    conn.release();
    debug(results);
    resolve(results);
  });
};
const getOptions = () => new Promise((resolve, reject) => {
  connection.getConnection((err, conn) => {
    if (err) {
      reject(err);
    }
    performQuery(conn, 'SELECT * FROM AdvertisementOptions', null, reject, resolve);
  });
});

const getOptionsByCompanyId = (companyId) => new Promise((resolve, reject) => {
  connection.getConnection((err, conn) => {
    if (err) {
      reject(err);
    }
    performQuery(
      conn,
      'SELECT * FROM AdvertisementOptions where companyId = ?',
      [companyId],
      reject, resolve,
    );
  });
});

const getOptionsById = (id) => new Promise((resolve, reject) => {
  connection.getConnection((err, conn) => {
    if (err) {
      reject(err);
    }
    performQuery(
      conn,
      'SELECT * FROM AdvertisementOptions where optionId = ?',
      [id],
      reject, resolve,
    );
  });
});
const addOptions = (data) => {
  if (!data) throw new Error('data can not be null');
  const dataToInsert = ObjToArray(data);
  debug(dataToInsert);
  return new Promise((resolve, reject) => {
    connection.getConnection((err, conn) => {
      if (err) {
        reject(err);
      }
      const insertQuery = 'INSERT INTO AdvertisementOptions(optionId,companyId,audienceCount,cost) VALUES ?';

      performQuery(
        conn,
        insertQuery,
        [dataToInsert],
        reject,
        resolve,
      );
    });
  });
};

module.exports = {
  getOptions,
  addOptions,
  ObjToArray,
  getOptionsByCompanyId,
  getOptionsById,
};

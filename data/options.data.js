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

const getOptions = () => new Promise((resolve, reject) => {
  connection.getConnection((err, conn) => {
    if (err) {
      reject(err);
    }

    return conn.query('SELECT * FROM AdvertisementOptions', (connErr, results, fields) => {
      if (connErr) {
        reject(connErr);
      }
      conn.release();
      debug(results);
      resolve(results);
    });
  });
});

const getOptionsByCompanyId = (companyId) => new Promise((resolve, reject) => {
  connection.getConnection((err, conn) => {
    if (err) {
      reject(err);
    }

    return conn.query('SELECT * FROM AdvertisementOptions where companyId = ?', [companyId], (connErr, results, fields) => {
      if (connErr) {
        reject(connErr);
      }
      conn.release();
      debug(results);
      resolve(results);
    });
  });
});
const getOptionsById = (id) => new Promise((resolve, reject) => {
  connection.getConnection((err, conn) => {
    if (err) {
      reject(err);
    }

    return conn.query('SELECT * FROM AdvertisementOptions where optionId = ?', [id], (connErr, results, fields) => {
      if (connErr) {
        reject(connErr);
      }
      conn.release();
      debug(results);
      resolve(results);
    });
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

      conn.query(insertQuery, [dataToInsert], (connErr, results, fields) => {
        if (connErr) {
          reject(connErr);
        }
        conn.release();
        resolve(results);
      });
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

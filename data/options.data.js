/* eslint-disable no-return-await */
const debug = require('debug')('app:options.data');
const util = require('util');
const { promiseConnection, promiseQuery } = require('./mysql.data');
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
      return reject(connErr);
    }
    conn.release();
    debug(results);
    return resolve(results);
  });
};

// Using pool.getConnection() is useful to share connection state for subsequent queries.
// This is because two calls to pool.query() may use two different connections and run in parallel.
// pool.getConnection() -> connection.query() -> connection.release()
const promsifiedPerformQuery = async (query, params) => {
  const conn = await promiseConnection();

  const results = await util
    .promisify(conn.query)
    .bind(conn)(query, params);

  conn.release();
  return results;
};

// https://github.com/mysqljs/mysql/blob/master/lib/Pool.js
// this is the shortcut of promisifedPerformQuery
// it is the equivalent of:
// pool.getConnection() -> connection.query() -> connection.release() code flow.
const promsifiedPoolQuery = async (query, params) => await promiseQuery(query, params);

// demo to show the querying by promsifiedPoolQuery
const promisfiedGetOptions = async () => promsifiedPoolQuery(
  'SELECT * FROM AdvertisementOptions',
);

const promisfiedGetOptionsByCompanyId = async (companyId) => await promsifiedPoolQuery(
  'SELECT * FROM AdvertisementOptions where companyId = ?',
  companyId,
);

// demo to show querying by promsifiedPerformQuery
const promisifiedGetOptionById = async (id) => await promsifiedPerformQuery(
  'SELECT * FROM AdvertisementOptions where optionId = ?',
  id,
);

const promisifiedAddOptions = async (data) => {
  if (!data) throw new Error('data can not be null');
  const dataToInsert = ObjToArray(data);
  debug(dataToInsert);
  const insertQuery = 'INSERT INTO AdvertisementOptions(optionId,companyId,audienceCount,cost) VALUES ?';

  return await promsifiedPoolQuery(
    insertQuery,
    [dataToInsert],
  );
};
const getOptions = () => new Promise((resolve, reject) => {
  connection.getConnection((err, conn) => {
    if (err) {
      reject(err);
    }
    return performQuery(
      conn,
      'SELECT * FROM AdvertisementOptions',
      null,
      reject,
      resolve,
    );
  });
});

const getOptionsByCompanyId = (companyId) => new Promise((resolve, reject) => {
  connection.getConnection((err, conn) => {
    if (err) {
      return reject(err);
    }
    return performQuery(
      conn,
      'SELECT * FROM AdvertisementOptions where companyId = ?',
      [companyId],
      reject,
      resolve,
    );
  });
});

const getOptionsById = (id) => new Promise((resolve, reject) => {
  connection.getConnection((err, conn) => {
    if (err) {
      return reject(err);
    }
    return performQuery(
      conn,
      'SELECT * FROM AdvertisementOptions where optionId = ?',
      [id],
      reject,
      resolve,
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
        return reject(err);
      }
      const insertQuery = 'INSERT INTO AdvertisementOptions(optionId,companyId,audienceCount,cost) VALUES ?';

      return performQuery(
        conn,
        insertQuery,
        [dataToInsert],
        reject,
        resolve,
      );
    });
  });
};

const buildSearch = require('./datatable');

const perfromDatatableQueries = async (request) => {
  const queries = buildSearch(request, 'AdvertisementOptions', 'optionId');
  // first set the database
  // await promsifiedPoolQuery(queries.changeDatabaseOrSchema);
  // debug(request);
  debug(queries);
  const [recordsTotalCount, select, recordsFilteredCount] = await Promise.all(
    [
      await promsifiedPerformQuery(queries.recordsTotalCount),
      await promsifiedPerformQuery(queries.selectQuery),
      await promsifiedPerformQuery(queries.recordsFilteredCount),
    ],
  );
  debug(recordsTotalCount[0].TOTAL);
  debug(recordsFilteredCount[0].TOTAL);
  return {
    draw: parseInt(request.draw, 10),
    recordsTotal: recordsTotalCount[0].TOTAL,
    recordsFiltered: recordsFilteredCount[0].TOTAL,
    data: select,
  };
};
module.exports = {
  getOptions,
  addOptions,
  ObjToArray,
  getOptionsByCompanyId,
  getOptionsById,
  promisfiedGetOptions,
  promisfiedGetOptionsByCompanyId,
  promisifiedGetOptionById,
  promisifiedAddOptions,
  perfromDatatableQueries,
};

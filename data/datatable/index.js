const filter = require('lodash/filter');
const debug = require('debug')('app:datatables');

const DEFAULT_LIMIT = 100;
const DEFAULT_DIRECTION = 'asc';

function getSearchableColumns(options) {
  return filter(options.columns, (column) => column.searchable === 'true' || column.searchable === true);
}
function getGlobalSearchableColumns(options) {
  return filter(options.columns, (column) => (column.searchable === 'true' || column.searchable === true)
  && (column.search.value.length === 0));
}
function escapeNonAlphanumeric(term) {
  return term.replace(/[\W\s]/g, '\\$&');
}

const getDirection = (direction) => {
  switch (direction) {
    case 'asc':
      return 'asc';
    case 'desc':
      return 'desc';
    default:
      return DEFAULT_DIRECTION;
  }
};
const buildOrderByClause = (options) => {
  const orderCol = options.columns[options.order[0].column].name;
  const direction = getDirection(options.order[0].dir.toLowerCase());
  return ` order by ${orderCol} ${direction}`;
};

const buildLikeClause = (columnName, searchTerm) => {
  const escapedString = escapeNonAlphanumeric(searchTerm);
  return ` ${columnName} like '%${escapedString}%'`;
};
const buildGlobalWhereClause = (columns, search) => {
  if (columns.length === 0 || !search) {
    return '';
  }
  const queries = [];
  columns.forEach((element) => {
    const columnName = element.name || element.data;
    const searchTerm = escapeNonAlphanumeric(search);
    queries.push(buildLikeClause(
      columnName,
      searchTerm,
    ));
  });
  return queries.join(' OR');
};
const buildSpecificColumnWhereClause = (columns) => {
  if (columns.length === 0) {
    return '';
  }
  const queries = [];
  columns.forEach((element) => {
    if (element.search.value) {
      debug(element.search.value, 'SPECIFIC SEARCH');
      const columnName = element.name || element.data;
      const searchTerm = escapeNonAlphanumeric(element.search.value);
      queries.push(buildLikeClause(
        columnName,
        searchTerm,
      ));
    }
  });
  return queries.join(' AND');
};

const buildSearch = (options, tableName, countColumn) => {
  const idColumn = escapeNonAlphanumeric(countColumn);
  const searchableColumns = getSearchableColumns(options);
  let where = 'where 1=1 ';
  if (searchableColumns.length !== 0) {
    // first handle global search
    if (options.search.value) {
      debug(options.search.value, 'SEARCH');
      const globalSearchValue = options.search.value || '';
      const globalSearchableColumns = getGlobalSearchableColumns(options);
      const gloablSearchWhereClause = buildGlobalWhereClause(
        globalSearchableColumns,
        globalSearchValue,
      );
      if (gloablSearchWhereClause.length !== 0) {
        where += `AND (${gloablSearchWhereClause})`;
      }
    }
    // next handle columns specific
    const columnSearchQuery = buildSpecificColumnWhereClause(searchableColumns);
    if (columnSearchQuery.length !== 0) {
      where += `AND ${columnSearchQuery}`;
    }
  }

  const start = options.start || 0;
  const limit = options.length || DEFAULT_LIMIT;
  const orderClause = buildOrderByClause(options);
  const whereWithOrderClause = `from ${tableName} ${where} ${orderClause} limit ${start}, ${limit}`;
  const selectQuery = `select * ${whereWithOrderClause}`;
  const recordsFilteredCount = `SELECT COUNT(${idColumn}) as TOTAL from ${tableName} ${where}`;
  const recordsTotalCount = `SELECT COUNT(${idColumn}) as TOTAL FROM ${tableName}`;
  return { selectQuery, recordsFilteredCount, recordsTotalCount };
};
module.exports = buildSearch;

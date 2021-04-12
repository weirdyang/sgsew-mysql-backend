const express = require('express');
const debug = require('debug')('app:options:router');
const {
  promisifiedGetOptionById,
  promisfiedGetOptions,
  promisfiedGetOptionsByCompanyId,
  promisifiedAddOptions,
  perfromDatatableQueries,
} = require('../data/options.data');
const HttpError = require('../models/HttpError');

const router = express.Router();

/**
 * @swagger
 * /options:
 *   get:
 *     summary: Retrieve a list of options
 *     description: Retrieve a list of options from the MySQL database.
 *                  Can be used to populate a list of fake users when prototyping or testing an API.
 *     responses:
 *       200:
 *         description: A list of options.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   optionId:
 *                     type: integer
 *                     description: The option ID.
 *                     example: 123
 *                   companyId:
 *                     type: integer
 *                     description: The company Id.
 *                     example: 123
 *                   audienceCount:
 *                     type: integer
 *                     description: The audience count.
 *                     example: 123
 *                   cost:
 *                     type: integer
 *                     description: The cost.
 *                     example: 123
*/
router.get('/', async (req, res, next) => {
  try {
    const results = await promisfiedGetOptions();
    return res.json(results);
  } catch (error) {
    return next(new HttpError(error.message, 500));
  }
});

/**
 * @swagger
 * /options/company/{companyId}:
 *   get:
 *     summary: Retrieve a list of options by company Id
 *     description: Retrieve a list of options from the MySQL database.
 *                  Can be used to populate a list of fake users when prototyping or testing an API.
 *     parameters:
 *       - in: path
 *         name: companyId
 *         required: true
 *         description: Numeric ID of the company to retrieve.
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: A list of options with for the company Id.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   optionId:
 *                     type: integer
 *                     description: The option ID.
 *                     example: 123
 *                   companyId:
 *                     type: integer
 *                     description: The company Id.
 *                     example: 123
 *                   audienceCount:
 *                     type: integer
 *                     description: The audience count.
 *                     example: 123
 *                   cost:
 *                     type: integer
 *                     description: The cost.
 *                     example: 123
*/
router.get('/company/:companyId', async (req, res, next) => {
  try {
    const results = await promisfiedGetOptionsByCompanyId(req.params.companyId);
    if (!results.length) {
      return next(new HttpError('no options linked to company id', 404));
    }
    return res.json(results);
  } catch (error) {
    return next(new HttpError(error.message, 500));
  }
});
/**
 * @swagger
 * /options/{optionsId}:
 *   get:
 *     summary: Retrieve a list of options by option Id
 *     parameters:
 *       - in: path
 *         name: optionsId
 *         required: true
 *         description: Numeric ID of the option to retrieve.
 *         schema:
 *           type: integer
 *     description: Retrieve a list of options from the MySQL database.
 *                  Can be used to populate a list of fake users when prototyping or testing an API.
 *     responses:
 *       200:
 *         description: A list of options with for the option Id.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   optionId:
 *                     type: integer
 *                     description: The option ID.
 *                     example: 123
 *                   companyId:
 *                     type: integer
 *                     description: The company Id.
 *                     example: 123
 *                   audienceCount:
 *                     type: integer
 *                     description: The audience count.
 *                     example: 123
 *                   cost:
 *                     type: integer
 *                     description: The cost.
 *                     example: 123
*/
router.get('/:optionId', async (req, res, next) => {
  try {
    const results = await promisifiedGetOptionById(req.params.optionId);
    if (!results.length) {
      return next(new HttpError('no such option', 404));
    }
    return res.json(results);
  } catch (error) {
    return next(new HttpError(error.message, 500));
  }
});
/**
 * @swagger
 * /options/add:
 *   post:
 *     summary: Inserts a list of options into the database.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               properties:
 *                 optionId:
 *                   type: integer
 *                   description: The option ID.
 *                   example: 123
 *                 companyId:
 *                   type: integer
 *                   description: The company Id.
 *                   example: 123
 *                 audienceCount:
 *                   type: integer
 *                   description: The audience count.
 *                   example: 123
 *                 cost:
 *                   type: integer
 *                   description: The cost.
 *                   example: 123
 *     responses:
 *       201:
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 affectedRows:
 *                   type: integer
 *                   description: The number of affected rows
 *                   example: 2
 *                 message:
 *                   type: string
 *                   description: If more than one rows affected,
 *                                it will display a summary of changes
 *                   example: "&Records: 2  Duplicates: 0  Warnings: 0"
*/
router.post('/add',
  async (req, res, next) => {
    // check if req is an array:
    if (!(req.body instanceof Array)) {
      return next(new HttpError('invalid input, data passed in must be an array', 422));
    }
    try {
      const results = await promisifiedAddOptions(req.body);
      const { affectedRows, message } = results;
      return res.status(201).json({ affectedRows, message });
    } catch (error) {
      return next(new HttpError(error.message, 500));
    }
  });

router.post('/table/datatable',
  async (req, res, next) => {
    try {
      const reply = await perfromDatatableQueries(req.body);
      debug(reply);
      return res.json(reply);
    } catch (error) {
      debug(error);
      return next(error);
    }
  });
module.exports = router;
